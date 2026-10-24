import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Setting, FrontendCMS } from '@/lib/models';

/**
 * POST /api/public-chat
 * Public (guest) Stoofi AI assistant for the Home Page.
 * - Uses Gemini (Interactions API) when GEMINI_API_KEY / GOOGLE_API_KEY is configured.
 * - Falls back to a smart rule-based answer built from live school settings + Frontend CMS data,
 *   so visitors always get a helpful reply.
 * Never exposes private student / staff records.
 */

const DEFAULT_SCHOOL = {
  schoolName: 'Pak Royal College Sharaqpur',
  phone: '03 111 444 810',
  email: 'info@pakroyalcollege.edu.pk',
  address: 'Lal Puli Stop Main Jaranwala Road Sharaqpur Sharif District Sheikhupura',
};

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

async function loadPublicContext() {
  const ctx = { school: { ...DEFAULT_SCHOOL }, courses: [], news: [], downloads: [] };
  try {
    await connectDB();
    const [setting, cms] = await Promise.all([
      Setting.findOne({}).lean().catch(() => null),
      FrontendCMS.findOne({ key: 'main' }).lean().catch(() => null),
    ]);
    if (setting) {
      ctx.school = {
        schoolName: setting.schoolName || DEFAULT_SCHOOL.schoolName,
        phone: setting.phone || DEFAULT_SCHOOL.phone,
        email: setting.email || DEFAULT_SCHOOL.email,
        address: DEFAULT_SCHOOL.address,
      };
    }
    if (cms) {
      const header = cms.headerContent || {};
      if (header.phone) ctx.school.phone = header.phone;
      if (header.email) ctx.school.email = header.email;
      ctx.courses = [...(cms.courseCategory || []), ...(cms.courseList || [])]
        .map((c) => c?.title)
        .filter(Boolean)
        .slice(0, 15);
      ctx.news = (cms.newsList || [])
        .filter((n) => n?.status !== false)
        .map((n) => n?.title)
        .filter(Boolean)
        .slice(0, 5);
      ctx.downloads = [
        ...(cms.result || []).map((r) => `Result: ${r.title}`),
        ...(cms.examRoutine || []).map((r) => `Exam Routine: ${r.title}`),
        ...(cms.academicCalendar || []).map((r) => `Academic Calendar: ${r.title}`),
        ...(cms.formDownload || []).map((r) => `Form: ${r.title}`),
      ]
        .filter((t) => t && !t.endsWith('undefined'))
        .slice(0, 10);
    }
  } catch (e) {
    console.warn('public-chat: context load failed (non-fatal):', e?.message);
  }
  return ctx;
}

function buildSystemPrompt(ctx) {
  return `You are "Stoofi AI", the friendly public assistant on the website of ${ctx.school.schoolName}.
You talk to website visitors (parents, prospective students, guests) who are NOT logged in.
Reply in the same language the visitor uses (English, Urdu, or Roman Urdu). Keep answers short, warm and helpful (max ~120 words), using simple markdown bullet points when useful.

SCHOOL INFORMATION:
- Name: ${ctx.school.schoolName}
- Address: ${ctx.school.address}
- Phone / Helpline: ${ctx.school.phone}
- Email: ${ctx.school.email}
- Programs / Courses: ${ctx.courses.length ? ctx.courses.join(', ') : 'F.Sc Pre-Medical, Pre-Engineering, ICS, I.Com, F.A, Allied Health (OTT, MLT, Dispenser)'}
- Latest news: ${ctx.news.length ? ctx.news.join(' | ') : 'See the Notice Board section on the home page.'}
- Downloads available on the home page: ${ctx.downloads.length ? ctx.downloads.join(' | ') : 'Results, routines, academic calendar and forms in the "Academic Downloads" section.'}

PORTAL HELP:
- Students, Teachers, Admins and Super Admins log in at /login. New institutions can register at /register.
- After login, users can see attendance, homework, fee vouchers, results, timetable and more.
- For admissions, visitors can use the Contact form on the home page (#contact) or call the helpline.

RULES:
- Never invent fees, dates, marks or personal data. If you don't know, say so and share the helpline/email.
- Never reveal or discuss any private student/staff records. Ask them to log in for personal data.`;
}

function extractInteractionText(data) {
  if (!data) return '';
  if (typeof data.output_text === 'string' && data.output_text.trim()) return data.output_text.trim();
  const steps = Array.isArray(data.steps) ? data.steps : Array.isArray(data.outputs) ? data.outputs : [];
  const texts = [];
  for (const step of steps) {
    if (step?.type && step.type !== 'model_output' && step.type !== 'text') continue;
    if (typeof step?.text === 'string') texts.push(step.text);
    for (const part of step?.content || []) {
      if (part?.type === 'text' && typeof part.text === 'string') texts.push(part.text);
    }
  }
  return texts.join('\n').trim();
}

async function askGemini(message, history, ctx) {
  const key = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
  if (!key) return null;

  const transcript = (Array.isArray(history) ? history : [])
    .slice(-8)
    .map((m) => `${m.role === 'user' ? 'Visitor' : 'Stoofi AI'}: ${String(m.content || '').slice(0, 600)}`)
    .join('\n');
  const input = transcript ? `Conversation so far:\n${transcript}\n\nVisitor: ${message}` : message;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        model: GEMINI_MODEL,
        input,
        system_instruction: buildSystemPrompt(ctx),
        store: false,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.warn('public-chat: Gemini error', res.status, (await res.text()).slice(0, 300));
      return null;
    }
    return extractInteractionText(await res.json()) || null;
  } catch (e) {
    console.warn('public-chat: Gemini request failed:', e?.message);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function fallbackAnswer(message, ctx) {
  const q = message.toLowerCase();
  const has = (...words) => words.some((w) => q.includes(w));
  const s = ctx.school;

  if (/^\s*(hi|hello|hey|salam|assalam|aoa)\b/.test(q) && q.split(/\s+/).length <= 4) {
    return `Hello! 👋 Welcome to **${s.schoolName}**. I can help with admissions, programs, contact details, results, downloads and portal login. What would you like to know?`;
  }
  if (has('admission', 'dakhla', 'dakhila', 'apply', 'enroll', 'enrol')) {
    return `**Admissions at ${s.schoolName}**\n- Fill the Contact / Inquiry form in the **Contact** section of this page\n- Or call the helpline: **${s.phone}**\n- Email: **${s.email}**\n- Visit campus: ${s.address}\n\nAdmission forms (if published) are in the **Academic Downloads** section.`;
  }
  if (has('fee', 'fees', 'charges', 'kitni fee', 'dues', 'voucher')) {
    return `Fee details depend on the program and session. Please call **${s.phone}** or email **${s.email}** for the latest fee structure.\n\nExisting students can see their fee vouchers after logging in at **/login**.`;
  }
  if (has('course', 'program', 'subject', 'fsc', 'f.sc', 'ics', 'icom', 'i.com', 'ott', 'mlt', 'class')) {
    const list = ctx.courses.length
      ? ctx.courses.map((c) => `- ${c}`).join('\n')
      : '- F.Sc Pre-Medical & Pre-Engineering\n- ICS (Computer Science)\n- I.Com & F.A\n- Allied Health (OTT, MLT, Dispenser)';
    return `**Programs offered:**\n${list}\n\nFor seat availability, call **${s.phone}**.`;
  }
  if (has('result', 'datesheet', 'date sheet', 'routine', 'calendar', 'download', 'form')) {
    const list = ctx.downloads.length ? ctx.downloads.map((d) => `- ${d}`).join('\n') : '- Results, exam routines, class routines, academic calendar and forms';
    return `You can find these in the **Academic Downloads** section of this page:\n${list}\n\nStudents can view personal results after logging in.`;
  }
  if (has('contact', 'phone', 'number', 'email', 'address', 'location', 'where', 'kahan', 'rabta')) {
    return `**Contact ${s.schoolName}**\n- 📍 ${s.address}\n- 📞 ${s.phone}\n- ✉️ ${s.email}\n\nYou can also send a message using the Contact form on this page.`;
  }
  if (has('login', 'sign in', 'password', 'portal', 'account', 'register', 'signup', 'sign up')) {
    return `**Portal access**\n- Students, Teachers, Admins & Super Admins: log in at **/login**\n- New institutions: register at **/register**\n- Forgot password? Use **/forgot-password**\n\nAfter login you can see attendance, homework, results, fee vouchers and more.`;
  }
  if (has('news', 'notice', 'event', 'announcement')) {
    const list = ctx.news.length ? ctx.news.map((n) => `- ${n}`).join('\n') : '- Check the **Notice Board** section on this page for the latest updates.';
    return `**Latest updates:**\n${list}`;
  }
  if (has('timing', 'time', 'waqt', 'open', 'hours')) {
    return `For current campus and office timings, please call **${s.phone}**. Office staff will guide you.`;
  }
  return `I'm Stoofi AI, the assistant for **${s.schoolName}**. I can help with:\n- Admissions & programs\n- Results & downloads\n- Contact details & location\n- Portal login help\n\nFor anything else, call **${s.phone}** or email **${s.email}**.`;
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const message = String(body?.message || '').trim().slice(0, 1000);
    if (!message) {
      return NextResponse.json({ success: false, message: 'Message text is required.' }, { status: 400 });
    }
    const ctx = await loadPublicContext();
    const aiReply = await askGemini(message, body?.history, ctx);
    return NextResponse.json({
      success: true,
      message: {
        id: `pub-${Date.now()}`,
        content: aiReply || fallbackAnswer(message, ctx),
        createdAt: new Date().toISOString(),
      },
      provider: aiReply ? 'gemini' : 'fallback',
    });
  } catch (error) {
    console.error('API /public-chat error:', error);
    return NextResponse.json({
      success: true,
      message: {
        id: `pub-${Date.now()}`,
        content: `Sorry, I couldn't process that right now. Please call **${DEFAULT_SCHOOL.phone}** or email **${DEFAULT_SCHOOL.email}**.`,
        createdAt: new Date().toISOString(),
      },
      provider: 'error',
    });
  }
}
