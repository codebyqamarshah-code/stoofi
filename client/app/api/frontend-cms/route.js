import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { FrontendCMS } from '@/lib/models';

const DEFAULT_AORA_PAGES = [
  { id: 'page-home', name: 'Home', title: 'Pak Royal College — Campus Portal & ERP', description: 'Main landing page with hero slider, notice board, and campus showcase', slug: 'home', url: '/', isHome: true, status: true },
  { id: 'page-notices', name: 'Notice Board & Events', title: 'Official Notice Board & Events Circular', description: 'Live institutional notices, circulars, and upcoming campus events', slug: 'notices', url: '/#notices', isHome: false, status: true },
  { id: 'page-showcase', name: 'Campus Gallery & Media', title: 'Photo Gallery, Video Tours & Faculty', description: 'Campus photo albums, video highlights, expert teachers, and downloads', slug: 'campus-showcase', url: '/#campus-showcase', isHome: false, status: true },
  { id: 'page-portals', name: 'Role Portals', title: 'Super Admin, Admin, Teacher & Student Portals', description: 'Dedicated role-based portals for institutional management', slug: 'portals', url: '/#portals', isHome: false, status: true },
  { id: 'page-features', name: 'ERP Features', title: 'Core Academic & Administrative Modules', description: 'Attendance, fee vouchers, examinations, ID cards, and LMS', slug: 'features', url: '/#features', isHome: false, status: true },
  { id: 'page-contact', name: 'Contact Us', title: 'Contact Administration & Admissions Office', description: 'Campus address, helpline, email, and direct inquiry form', slug: 'contact', url: '/#contact', isHome: false, status: true },
  { id: 'page-login', name: 'Portal Login', title: 'Student, Teacher & Staff Login', description: 'Secure authentication portal for all campus members', slug: 'login', url: '/login', isHome: false, status: true }
];

const DEFAULT_MENU_ITEMS = [
  { id: 'm-1', title: 'Home', url: '/#home', level: 0, target: '_self', visible: true },
  { id: 'm-2', title: 'Notice Board', url: '/#notices', level: 0, target: '_self', visible: true },
  { id: 'm-3', title: 'Campus Showcase', url: '/#campus-showcase', level: 0, target: '_self', visible: true },
  { id: 'm-4', title: 'Photo Gallery', url: '/#photo-gallery', level: 1, target: '_self', visible: true },
  { id: 'm-5', title: 'Video Gallery', url: '/#video-gallery', level: 1, target: '_self', visible: true },
  { id: 'm-6', title: 'Academic Downloads & Results', url: '/#academic-downloads', level: 1, target: '_self', visible: true },
  { id: 'm-7', title: 'How To Use', url: '/#how-it-works', level: 0, target: '_self', visible: true },
  { id: 'm-8', title: 'Portals', url: '/#portals', level: 0, target: '_self', visible: true },
  { id: 'm-9', title: 'Features', url: '/#features', level: 0, target: '_self', visible: true },
  { id: 'm-10', title: 'Contact Us', url: '/#contact', level: 0, target: '_self', visible: true }
];

const DEFAULT_NEWS_CATEGORIES = [
  { id: 'nc-1', title: 'Academic Announcements', slug: 'academic-announcements', description: 'Official academic schedules, circulars, and updates' },
  { id: 'nc-2', title: 'Campus Events & Seminars', slug: 'campus-events', description: 'Seminars, workshops, exhibitions, and cultural events' },
  { id: 'nc-3', title: 'Examinations & Results', slug: 'examinations-results', description: 'Datesheets, admit cards, and result notifications' },
  { id: 'nc-4', title: 'Sports & Co-Curricular', slug: 'sports', description: 'Annual sports gala, inter-house tournaments, and awards' },
  { id: 'nc-5', title: 'Admissions & Scholarships', slug: 'admissions-scholarships', description: 'New session admissions and merit scholarship updates' }
];

const DEFAULT_COURSE_CATEGORIES = [
  { id: 'cc-1', title: 'F.Sc & Allied Health Sciences', description: 'Pre-Medical, Operation Theater Technology (OTT), MLT, Dispenser', image: '' },
  { id: 'cc-2', title: 'Computer Science & IT (ICS)', description: 'Intermediate in Computer Science, Software & Digital Skills', image: '' },
  { id: 'cc-3', title: 'Pre-Engineering & Sciences', description: 'Mathematics, Physics, and Chemistry honors track', image: '' },
  { id: 'cc-4', title: 'Commerce & Humanities (I.Com / F.A)', description: 'Business studies, accounting, economics, and arts', image: '' }
];

async function getOrCreateCmsDoc() {
  let doc = await FrontendCMS.findOne({ key: 'main' });
  if (!doc) {
    doc = await FrontendCMS.create({
      key: 'main',
      aoraPagebuilder: DEFAULT_AORA_PAGES,
      menu: DEFAULT_MENU_ITEMS,
      newsCategory: DEFAULT_NEWS_CATEGORIES,
      courseCategory: DEFAULT_COURSE_CATEGORIES
    });
  } else {
    let changed = false;
    if (!Array.isArray(doc.aoraPagebuilder) || doc.aoraPagebuilder.length === 0) {
      doc.aoraPagebuilder = DEFAULT_AORA_PAGES;
      changed = true;
    }
    if (!Array.isArray(doc.menu) || doc.menu.length === 0) {
      doc.menu = DEFAULT_MENU_ITEMS;
      changed = true;
    }
    if (!Array.isArray(doc.newsCategory) || doc.newsCategory.length === 0) {
      doc.newsCategory = DEFAULT_NEWS_CATEGORIES;
      changed = true;
    }
    if (!Array.isArray(doc.courseCategory) || doc.courseCategory.length === 0) {
      doc.courseCategory = DEFAULT_COURSE_CATEGORIES;
      changed = true;
    }
    if (changed) {
      await doc.save();
    }
  }
  return doc;
}

export async function GET(req) {
  try {
    await connectDB();
    const doc = await getOrCreateCmsDoc();
    const { searchParams } = new URL(req.url);
    const section = searchParams.get('section');
    if (section && doc[section] !== undefined) {
      return NextResponse.json({
        success: true,
        section,
        data: doc[section]
      });
    }
    return NextResponse.json({
      success: true,
      data: doc
    });
  } catch (error) {
    console.error('GET /api/frontend-cms error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { section, action = 'set', item, id, data } = body;

    if (!section) {
      return NextResponse.json({ success: false, message: 'Section name is required' }, { status: 400 });
    }

    const doc = await getOrCreateCmsDoc();
    if (doc[section] === undefined) {
      return NextResponse.json({ success: false, message: `Invalid CMS section: ${section}` }, { status: 400 });
    }

    const isArraySection = Array.isArray(doc[section]);

    if (action === 'add' && isArraySection) {
      const newItem = {
        ...item,
        id: item?.id || `${section}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        createdAt: item?.createdAt || new Date().toISOString()
      };
      doc[section] = [newItem, ...doc[section]];
      doc.markModified(section);
      await doc.save();
      return NextResponse.json({ success: true, data: doc[section], item: newItem });
    }

    if (action === 'update') {
      if (isArraySection) {
        const targetId = String(id || item?.id || '');
        doc[section] = doc[section].map(existing =>
          String(existing.id) === targetId
            ? { ...existing, ...item, id: existing.id, updatedAt: new Date().toISOString() }
            : existing
        );
      } else if (typeof doc[section] === 'object' && doc[section] !== null) {
        const plain = doc[section].toObject ? doc[section].toObject() : doc[section];
        doc[section] = { ...plain, ...(data || item || {}) };
      }
      doc.markModified(section);
      await doc.save();
      return NextResponse.json({ success: true, data: doc[section] });
    }

    if (action === 'delete' && isArraySection) {
      const targetId = String(id || item?.id || '');
      doc[section] = doc[section].filter(existing => String(existing.id) !== targetId);
      doc.markModified(section);
      await doc.save();
      return NextResponse.json({ success: true, data: doc[section] });
    }

    if (action === 'set') {
      doc[section] = data !== undefined ? data : item;
      doc.markModified(section);
      await doc.save();
      return NextResponse.json({ success: true, data: doc[section] });
    }

    return NextResponse.json({ success: false, message: `Unsupported action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error('POST /api/frontend-cms error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  return POST(req);
}
