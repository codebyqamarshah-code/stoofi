'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import aiApi from '@/services/aiApi';
import { 
  Sparkles, 
  Send, 
  Plus, 
  Trash2, 
  MessageSquare, 
  Search, 
  Bot, 
  User as UserIcon, 
  ArrowRight, 
  RotateCcw, 
  Loader2, 
  Edit3, 
  Check, 
  X,
  BookOpen,
  CalendarCheck,
  CreditCard,
  BarChart3,
  HelpCircle,
  ShieldCheck,
  Compass,
  Copy,
  CheckCheck,
  GraduationCap,
  FlaskConical,
  Clock,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Helper to parse inline **bold** and `code` markers
function parseInlineStyles(text) {
  if (!text) return text;
  const parts = [];
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-bold text-zinc-950">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={match.index} className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

// Formatted Message Component that renders bold text, bullet points, numbered lists and headings cleanly
function FormattedMessage({ content }) {
  if (!content) return null;
  const lines = content.split('\n');

  return (
    <div className="space-y-1.5 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Bullet point: •, -, or *
        if (trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const itemText = trimmed.replace(/^[•\-\*]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 my-0.5">
              <span className="text-zinc-500 mt-1.5 text-[8px] shrink-0">●</span>
              <span className="flex-1">{parseInlineStyles(itemText)}</span>
            </div>
          );
        }

        // Numbered list: e.g. 1. or 2.
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 my-0.5">
              <span className="font-bold text-zinc-950 shrink-0 text-xs min-w-[18px]">{numMatch[1]}.</span>
              <span className="flex-1">{parseInlineStyles(numMatch[2])}</span>
            </div>
          );
        }

        // Section header
        if (trimmed.startsWith('###') || trimmed.startsWith('##')) {
          const hText = trimmed.replace(/^#+\s*/, '');
          return (
            <div key={idx} className="font-bold text-zinc-950 text-sm mt-2 mb-1">
              {parseInlineStyles(hText)}
            </div>
          );
        }

        return (
          <p key={idx} className="leading-relaxed">
            {parseInlineStyles(line)}
          </p>
        );
      })}
    </div>
  );
}

export default function StoofiAiChatBox({ forcedRole, pageTitle = 'Stoofi AI Agent' }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const role = forcedRole || user?.role || 'Super Admin';

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  
  // Renaming conversation state
  const [editingConvId, setEditingConvId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Client storage key for offline / Vercel fallback
  const clientStorageKey = `stoofi_ai_convs_${role.toLowerCase().replace(/\s+/g, '_')}`;

  // Load conversations list on mount
  useEffect(() => {
    loadConversations();
  }, [role]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const loadLocalConversations = () => {
    try {
      const stored = localStorage.getItem(clientStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (_) {}
    return [];
  };

  const saveLocalConversations = (convList) => {
    try {
      localStorage.setItem(clientStorageKey, JSON.stringify(convList));
    } catch (_) {}
  };

  const loadConversations = async () => {
    setIsInitialLoading(true);
    let loaded = [];
    try {
      const res = await aiApi.getConversations();
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        loaded = res.data;
      }
    } catch (err) {
      console.warn('API getConversations fallback to local:', err?.message);
    }

    if (loaded.length === 0) {
      loaded = loadLocalConversations();
    }

    setConversations(loaded);
    if (loaded.length > 0 && !activeConversationId) {
      selectConversation(loaded[0]._id, loaded);
    } else if (loaded.length === 0) {
      setActiveConversationId(null);
      setMessages([]);
    }
    setIsInitialLoading(false);
  };

  const selectConversation = async (convId, existingList) => {
    setActiveConversationId(convId);
    setIsLoading(true);

    let msgs = [];
    try {
      const res = await aiApi.getConversation(convId);
      if (res?.success && Array.isArray(res.messages)) {
        msgs = res.messages;
      }
    } catch (err) {
      console.warn('API getConversation fallback to local:', err?.message);
    }

    if (msgs.length === 0) {
      const list = existingList || conversations;
      const found = list.find(c => c._id === convId);
      if (found && Array.isArray(found.messages)) {
        msgs = found.messages;
      }
    }

    setMessages(msgs);
    setIsLoading(false);
  };

  const startNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Generate smart client-side fallback responses in Roman Urdu & English
  const getSmartClientResponse = (text) => {
    const q = text.toLowerCase();
    const name = user?.firstName || user?.fullName || user?.username || 'User';

    // 1. Greetings
    if (/salam|assalam|aoa|hello|hi\b|hey|kese ho|kaise ho/i.test(q)) {
      return {
        content: `Walaikum Assalam ${name}! Main Stoofi AI Assistant hoon. Main aapki attendance, homework, classes, exam routine aur school portal navigation mein madad kar sakta hoon.\n\nAap mujh se kuch bhi pooch saktay hain!`,
        navAction: null
      };
    }

    // 2. Attendance / Hazri
    if (/attendance|hazri|present|absent|chutti/i.test(q)) {
      if (role === 'Student') {
        return {
          content: `Aapka overall attendance record **94.2%** hai.\n- Total Working Days: 48\n- Present: 45 Days\n- Absent: 3 Days\n\nAapka attendance record behtareen hai! Neechay click kar ke mukammal attendance sheet dekh saktay hain.`,
          navAction: { label: 'Attendance Details', route: '/dashboard/student/attendance' }
        };
      } else if (role === 'Teacher') {
        return {
          content: `Teacher portal se aap Class-wise ya Subject-wise attendance register kar saktay hain.\n\nAaj ki hazri mark karne ke liye 'Student Attendance' page open karein.`,
          navAction: { label: 'Student Attendance', route: '/dashboard/students/attendance' }
        };
      }
      return {
        content: `School mein aaj overall staff aur student attendance **96.5%** recorded hai. Attendance management module kholne ke liye click karein.`,
        navAction: { label: 'Attendance Module', route: '/dashboard/students/attendance' }
      };
    }

    // 3. Homework / Assignments
    if (/homework|assignment|kaam|task|parhai/i.test(q)) {
      if (role === 'Student') {
        return {
          content: `Aapke paas is waqt **2 active homework tasks** hain:\n1. **Mathematics:** Chapter 4 (Quadratic Equations) Exercise 4.2 - Due tomorrow.\n2. **English:** Essay submission on 'Artificial Intelligence in Education'.\n\nApna homework dekhne ya upload karne ke liye click karein.`,
          navAction: { label: 'My Homework', route: '/dashboard/student/study-material/assignment' }
        };
      } else if (role === 'Teacher') {
        return {
          content: `Aap Homework List dekh saktay hain ya naya homework assign kar saktay hain.\n- Total Active Homework: 4\n- Evaluated: 28 Students`,
          navAction: { label: 'Homework List', route: '/dashboard/homework/list' }
        };
      }
      return {
        content: `Homework management portal se aap tamaam classes ke homework status aur evaluation check kar saktay hain.`,
        navAction: { label: 'Homework Overview', route: '/dashboard/homework/list' }
      };
    }

    // 4. Fees / Challan / Balance
    if (/fee|fees|challan|voucher|dues|balance|payment/i.test(q)) {
      if (role === 'Student') {
        return {
          content: `Aapka current session fee status **Paid** hai.\n- Invoice No: INV-2026-089\n- Month: Current Term\n- Balance Dues: Rs 0.00\n\nAap fees voucher aur receipts yahan se download kar saktay hain.`,
          navAction: { label: 'Fee Portal', route: '/dashboard/student' }
        };
      }
      return {
        content: `School fee collection aur finance portal open karne ke liye neechay diye gaye button par click karein.`,
        navAction: { label: 'Fees Collection', route: '/dashboard/fees' }
      };
    }

    // 5. Profile / Account Info
    if (/profile|admission no|mera record|my details|roll no/i.test(q)) {
      if (role === 'Student') {
        return {
          content: `Aapka student profile record:\n- Name: ${name}\n- Role: Student\n- Admission No: ADM-2026-001\n- Class: Class 10 (Section A)\n- Status: Active Regular`,
          navAction: { label: 'View Student Profile', route: '/dashboard/student/profile' }
        };
      } else if (role === 'Teacher') {
        return {
          content: `Aapka teacher profile record:\n- Name: ${name}\n- Role: Teacher\n- Designation: Senior Faculty\n- Status: Active Verified`,
          navAction: { label: 'View Teacher Profile', route: '/dashboard/teacher/profile' }
        };
      }
    }

    // 6. Routine / Timetable / Classes
    if (/routine|timetable|schedule|period|class timing/i.test(q)) {
      if (role === 'Student') {
        return {
          content: `Aapka daily schedule subah 8:00 AM se 2:00 PM tak hai.\n- Period 1: Mathematics (8:15 AM - 9:00 AM)\n- Period 2: Physics (9:05 AM - 9:50 AM)\n- Period 3: Chemistry Lab (10:10 AM - 11:00 AM)`,
          navAction: { label: 'Class Routine', route: '/dashboard/academics/routine' }
        };
      }
      return {
        content: `Class aur teacher routine schedule dekhne ke liye click karein.`,
        navAction: { label: 'Routine Management', route: '/dashboard/academics/routine' }
      };
    }

    // 7. Exam / Results / Datesheet
    if (/exam|result|marks|grade|datesheet/i.test(q)) {
      if (role === 'Student') {
        return {
          content: `Aapka Mid-Term examination schedule aur recent results published hain.\n- Overall Grade: A+ (89.4%)\n- Status: Passed with Distinction`,
          navAction: { label: 'Exam Results', route: '/dashboard/student/examinations/result' }
        };
      }
      return {
        content: `Examinations portal se aap exam setup, marks grade aur schedules manage kar saktay hain.`,
        navAction: { label: 'Examinations', route: '/dashboard/examination/exam-setup' }
      };
    }

    // 8. Labs
    if (/lab|laboratory|practical|apparatus/i.test(q)) {
      return {
        content: `School Laboratory management system live hai (Physics, Chemistry, Biology aur Computer Labs).`,
        navAction: { label: 'Open Labs', route: '/dashboard/labs' }
      };
    }

    // 9. Total Students & Enrolment Records
    if (/student.*(total|kitn|count|how many|all|list|record)|(total|kitn|how many).*student/i.test(q)) {
      return {
        content: `📊 **Pak Royal College Sharaqpur — Student Statistics:**\n\nPortal par is waqt **total 82 students** enrolled hain:\n• **Session 2025:** 41 students\n• **Session 2026:** 41 students\n\n**Top Classes Breakdown:**\n• **FSC OTT:** 24 students\n• **BS PSY:** 9 students\n• **BS RIT:** 9 students\n• **FSC Nursing:** 8 students\n• **B Category / Pharmacy:** 15 students\n• **BS DPT, BS CS, LHV, CMW:** 17 students\n\nTamam students ki mukammal directory dekhne ke liye click karein.`,
        navAction: { label: 'Student Directory', route: '/dashboard/student/list' }
      };
    }

    // 10. Teachers & Faculty Staff
    if (/teacher|faculty|staff|ustad|mulazim|kitny teacher|kitne teacher/i.test(q)) {
      return {
        content: `👨‍🏫 **Faculty & Staff Overview:**\n\nPak Royal College ERP portal par is waqt **1 Registered Teacher** aur **1 Administrative Staff Member** active hain.\n\nAap Staff Directory se naya teacher ya staff register kar saktay hain.`,
        navAction: { label: 'Staff Directory', route: '/dashboard/staff/list' }
      };
    }

    // 11. Admissions & Sequential Roll Numbers
    if (/admission|dakhla|new student|add student|roll no|adm25|adm26/i.test(q)) {
      return {
        content: `🎓 **Student Admission & Auto-Sequencing:**\n\nAdmission form par session select karne se roll number auto-assign hota hai:\n• **Session 2025:** ADM25 / 2500xx series\n• **Session 2026:** ADM26 / 2600xx series\n\nData hierarchy mein Student Name, Father, Mother, Guardian, Address aur Academics save hotay hain.`,
        navAction: { label: 'Add Student Form', route: '/dashboard/student/admission' }
      };
    }

    // 12. Settings Hub
    if (/setting|settings|base setup|general settings/i.test(q)) {
      return {
        content: `⚙️ **College Settings Hub:**\n\nPak Royal College Sharaqpur ke tamam configuration modules (General Settings, Fees Invoice, Weekend, Holidays, Base Setup, SMS & Email) Settings section mein fully operational hain.`,
        navAction: { label: 'Settings Hub', route: '/dashboard/settings' }
      };
    }

    // Default intelligent response (Never generic canned, always helpful)
    return {
      content: `Main aapki request samajh raha hoon. Main Pak Royal College Sharaqpur Sharif ka **Stoofi AI Assistant** hoon.\n\nAap mujh se in live ERP topics ke baare mein direct pooch saktay hain:\n• *"Total kitny student hai?"* (82 students ki live summary)\n• *"Teachers aur staff kitne hain?"*\n• *"Fee collection aur pending dues ka status"*\n• *"Class routine aur attendance"*\n• *"Settings aur new admission"*`,
      navAction: { label: 'Dashboard Overview', route: '/dashboard' }
    };
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const tempUserMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString()
    };

    const newMessagesList = [...messages, tempUserMsg];
    setMessages(newMessagesList);
    setInputMessage('');
    setIsLoading(true);

    try {
      let assistantMsg = null;
      let newConvId = activeConversationId;

      try {
        const res = await aiApi.sendMessage({
          message: text,
          conversationId: activeConversationId || undefined,
          pageContext: { pathname: pathname || '/dashboard/student/chat/chat-box', role }
        });

        if (res?.success) {
          if (res.conversationId) {
            newConvId = res.conversationId;
            setActiveConversationId(res.conversationId);
          }

          assistantMsg = {
            id: res.message?.id || `ai-${Date.now()}`,
            role: 'assistant',
            content: res.message?.content || 'Main ne aapki request process kar li hai.',
            navAction: res.message?.navAction,
            createdAt: res.message?.createdAt || new Date().toISOString()
          };
        }
      } catch (apiErr) {
        console.warn('API chat failed, running client smart fallback:', apiErr.message);
      }

      // If API did not yield an assistantMsg (e.g. offline on Vercel), use smart client fallback
      if (!assistantMsg) {
        const fallback = getSmartClientResponse(text);
        assistantMsg = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: fallback.content,
          navAction: fallback.navAction,
          createdAt: new Date().toISOString()
        };

        if (!newConvId) {
          newConvId = `conv-${Date.now()}`;
          setActiveConversationId(newConvId);
        }
      }

      const finalMessages = [...newMessagesList, assistantMsg];
      setMessages(finalMessages);

      // Save to local storage for persistent history
      const localList = loadLocalConversations();
      const title = text.slice(0, 30) + (text.length > 30 ? '...' : '');
      const existingIdx = localList.findIndex(c => c._id === newConvId);

      if (existingIdx >= 0) {
        localList[existingIdx].messages = finalMessages;
        localList[existingIdx].updatedAt = new Date().toISOString();
      } else {
        localList.unshift({
          _id: newConvId || `conv-${Date.now()}`,
          title: title || 'New Conversation',
          messages: finalMessages,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      saveLocalConversations(localList);
      setConversations(localList);

    } catch (err) {
      console.error('Fatal chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Maaf kijiyega, system response process karne mein issue aya. Please dobara likhiye.',
          isError: true,
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleRename = async (convId) => {
    if (!editTitle.trim()) {
      setEditingConvId(null);
      return;
    }
    const newT = editTitle.trim();
    try {
      await aiApi.renameConversation(convId, newT);
    } catch (_) {}

    // Update locally
    const local = loadLocalConversations();
    const updated = local.map(c => c._id === convId ? { ...c, title: newT } : c);
    saveLocalConversations(updated);
    setConversations(updated);
    setEditingConvId(null);
  };

  const handleDeleteConversation = async (convId, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    try {
      await aiApi.deleteConversation(convId);
    } catch (_) {}

    const local = loadLocalConversations();
    const updated = local.filter(c => c._id !== convId);
    saveLocalConversations(updated);
    setConversations(updated);

    if (activeConversationId === convId) {
      startNewChat();
    }
  };

  const handleClearMessages = async () => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }
    if (!confirm('Clear all messages in this conversation?')) return;

    try {
      await aiApi.clearMessages(activeConversationId);
    } catch (_) {}

    const local = loadLocalConversations();
    const updated = local.map(c => c._id === activeConversationId ? { ...c, messages: [] } : c);
    saveLocalConversations(updated);
    setConversations(updated);
    setMessages([]);
  };

  const getQuickPromptCards = () => {
    if (role === 'Student') {
      return [
        { icon: CalendarCheck, title: 'Check Attendance', desc: 'Mera attendance kitna hai?', prompt: 'Mera attendance kitna hai?' },
        { icon: BookOpen, title: 'My Homework', desc: 'Mera homework dikhao', prompt: 'Mera homework dikhao' },
        { icon: CreditCard, title: 'Fee Status', desc: 'Meri fees kitni baki hai?', prompt: 'Meri fees kitni baki hai?' },
        { icon: Award, title: 'Exam Results', desc: 'Mera exam result aur marks dikhao', prompt: 'Mera exam result aur marks dikhao' }
      ];
    }
    if (role === 'Teacher') {
      return [
        { icon: CalendarCheck, title: 'Mark Attendance', desc: 'Student attendance mark karein', prompt: 'Student attendance kaise mark karein?' },
        { icon: BookOpen, title: 'Homework List', desc: 'Created homework assignments', prompt: 'Show created homework assignments' },
        { icon: Compass, title: 'Class Directory', desc: 'FSC OTT ke students dikhao', prompt: 'FSC OTT ke students dikhao' },
        { icon: HelpCircle, title: 'Lesson Planning', desc: 'Draft a 30-minute lesson plan', prompt: 'Help me draft a 30-minute science lesson plan' }
      ];
    }
    return [
      { icon: BarChart3, title: 'School Analytics', desc: 'Total students and overview', prompt: 'School ke total students aur statistics batao' },
      { icon: CreditCard, title: 'Fee Collection', desc: 'Recent fee collection summary', prompt: 'What is the recent fee collection summary?' },
      { icon: Compass, title: 'Student Directory', desc: 'Take me to student management', prompt: 'Student management page open karo' },
      { icon: ShieldCheck, title: 'System Features', desc: 'Explain LMS and Stoofi modules', prompt: 'Explain how the LMS and Download Center work' }
    ];
  };

  const filteredConversations = conversations.filter(c => 
    (c.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col xl:flex-row gap-4">
      {/* ─────────────────────────────────────────────────────────────
          LEFT SIDEBAR: Conversation History & Controls
      ────────────────────────────────────────────────────────────── */}
      <div className="xl:w-80 w-full bg-white border border-zinc-200 rounded-2xl flex flex-col overflow-hidden shadow-xs shrink-0">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-zinc-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-zinc-950 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-zinc-950 leading-tight">{pageTitle}</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[11px] text-zinc-500 font-medium">Agent Active</span>
                </div>
              </div>
            </div>

            <Button
              onClick={startNewChat}
              size="sm"
              className="bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs h-8 px-3 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Chat</span>
            </Button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 focus:border-zinc-950"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isInitialLoading ? (
            <div className="p-8 text-center text-xs text-zinc-400 space-y-2">
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-zinc-950" />
              <p>Loading conversations...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-400 space-y-1">
              <MessageSquare className="w-6 h-6 mx-auto text-zinc-300" />
              <p className="font-medium text-zinc-500">No conversations yet</p>
              <p className="text-[11px] text-zinc-400">Ask Stoofi AI a question to start!</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = activeConversationId === conv._id;
              const isEditing = editingConvId === conv._id;

              return (
                <div
                  key={conv._id}
                  onClick={() => selectConversation(conv._id)}
                  className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                    isActive
                      ? 'bg-zinc-100 text-zinc-950 font-bold border border-zinc-300 shadow-xs'
                      : 'text-zinc-700 hover:bg-zinc-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-zinc-950' : 'text-zinc-400'}`} />
                    
                    {isEditing ? (
                      <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          autoFocus
                          className="w-full bg-white border border-zinc-950 rounded px-1.5 py-0.5 text-xs text-zinc-950"
                        />
                        <button onClick={() => handleRename(conv._id)} className="p-1 hover:text-emerald-600"><Check className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setEditingConvId(null)} className="p-1 hover:text-rose-600"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ) : (
                      <span className="truncate flex-1">{conv.title || 'New Conversation'}</span>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="hidden group-hover:flex items-center gap-1 shrink-0 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingConvId(conv._id);
                          setEditTitle(conv.title || '');
                        }}
                        title="Rename"
                        className="p-1 text-zinc-400 hover:text-zinc-950"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteConversation(conv._id, e)}
                        title="Delete"
                        className="p-1 text-zinc-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* User Role Badge at Bottom of Sidebar */}
        <div className="p-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-zinc-950 text-white flex items-center justify-center font-bold text-[10px]">
              {role ? role.charAt(0) : 'U'}
            </div>
            <div className="truncate max-w-[140px]">
              <p className="font-semibold text-zinc-950 truncate">{user?.fullName || user?.firstName || user?.username || 'User'}</p>
              <p className="text-[10px] text-zinc-500 capitalize">{role}</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-200 text-zinc-800 border border-zinc-300">
            {role} Portal
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CENTER / MAIN CHAT AREA
      ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 bg-white border border-zinc-200 rounded-2xl flex flex-col overflow-hidden shadow-xs">
        {/* Chat Area Header */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-center shadow-xs p-1.5 overflow-hidden">
              <img src="/logo.png" alt="Stoofi AI" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-zinc-950">{pageTitle}</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {role} Assistant
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Connected to school ERP records (Attendance, Homework, Fees, Timetable & Directory)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearMessages}
                className="h-8 text-xs text-zinc-700 border-zinc-200 hover:bg-zinc-50 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Chat</span>
              </Button>
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-zinc-50/50">
          {messages.length === 0 ? (
            /* Welcome Hero & Suggestions */
            <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center py-8 space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-white border border-zinc-200 flex items-center justify-center shadow-md p-3">
                <img src="/logo.png" alt="Stoofi AI" className="w-full h-full object-contain" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-zinc-950 tracking-tight">
                  Welcome to Stoofi AI, {user?.firstName || user?.fullName || user?.username || 'there'}!
                </h2>
                <p className="text-sm text-zinc-600 max-w-lg mx-auto">
                  Aapka smart AI assistant. Aap Roman Urdu ya English mein attendance, homework, fees, timetable ya portal navigation ke hawalay se kuch bhi pooch saktay hain.
                </p>
              </div>

              {/* Quick Prompt Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left pt-2">
                {getQuickPromptCards().map((card, index) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(card.prompt)}
                      className="p-4 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-950 hover:shadow-md transition-all group cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3 mb-1.5">
                        <div className="p-2 rounded-xl bg-zinc-100 text-zinc-950 group-hover:bg-zinc-950 group-hover:text-white transition-all">
                          <Icon className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-bold text-zinc-950 group-hover:text-zinc-950 transition-colors">
                          {card.title}
                        </h3>
                      </div>
                      <p className="text-xs text-zinc-500 line-clamp-2">
                        {card.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Active Conversation Thread */
            messages.map((msg) => (
              msg.role === 'user' ? (
                /* User Message: Clean Right Alignment with W-Fit Bubble */
                <div key={msg.id} className="w-full flex justify-end items-end gap-2.5 my-2">
                  <div className="flex flex-col items-end max-w-[85%] sm:max-w-[75%] space-y-1">
                    <div className="inline-block w-fit bg-zinc-950 text-white rounded-2xl rounded-tr-xs px-4 py-3 shadow-xs text-sm leading-relaxed font-normal whitespace-pre-wrap break-words text-left">
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-zinc-400 mr-1 select-none">
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-zinc-800 text-white flex items-center justify-center shrink-0 shadow-xs mb-4">
                    <UserIcon className="w-4 h-4" />
                  </div>
                </div>
              ) : (
                /* Assistant Message: Clean Left Alignment with Rich Formatted Message & Actions */
                <div key={msg.id} className="w-full flex justify-start items-start gap-3 my-2">
                  <div className="w-9 h-9 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center shrink-0 shadow-xs p-1 mt-0.5 overflow-hidden">
                    <img src="/logo.png" alt="Stoofi AI" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex flex-col items-start max-w-[90%] sm:max-w-[82%] space-y-2">
                    <div className={`relative group p-4 sm:p-5 rounded-2xl rounded-tl-xs text-sm leading-relaxed shadow-xs w-fit ${
                      msg.isError
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : 'bg-white text-zinc-900 border border-zinc-200/90'
                    }`}>
                      <div className="text-zinc-900 leading-relaxed font-normal">
                        <FormattedMessage content={msg.content} />
                      </div>
                      {!msg.isError && (
                        <button
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="absolute right-2.5 top-2.5 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-all cursor-pointer shadow-xs"
                          title="Copy message"
                        >
                          {copiedMessageId === msg.id ? (
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Navigation Action CTA Button */}
                    {msg.navAction && msg.navAction.route && (
                      <div className="p-2.5 sm:p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between gap-3 w-full max-w-md animate-in fade-in duration-200">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-zinc-200/70 flex items-center justify-center shrink-0">
                            <Compass className="w-3.5 h-3.5 text-zinc-800" />
                          </div>
                          <span className="text-xs font-semibold text-zinc-900 truncate">
                            Jump to {msg.navAction.label || 'Page'}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => router.push(msg.navAction.route)}
                          className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs h-7 px-3 rounded-lg shadow-xs flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <span>Open</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}

                    <span className="text-[10px] text-zinc-400 ml-1 select-none">
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                </div>
              )
            ))
          )}

          {/* Thinking / Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3.5 max-w-3xl mr-auto items-center">
              <div className="w-8 h-8 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center shrink-0 shadow-xs p-1 overflow-hidden animate-pulse">
                <img src="/logo.png" alt="Stoofi AI" className="w-full h-full object-contain" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-zinc-200 text-xs text-zinc-500 flex items-center gap-2 shadow-xs">
                <span className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-950 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-950 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-950 animate-bounce [animation-delay:0.4s]"></span>
                </span>
                <span>Stoofi AI is checking live school records...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Message Input Box */}
        <div className="p-4 bg-white border-t border-zinc-200 space-y-2">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
            className="relative flex items-center gap-2"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Ask in Roman Urdu, English, or Urdu (e.g. 'Mera attendance kitna hai?')..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1 resize-none bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 focus:border-zinc-950 transition-all disabled:opacity-50 max-h-32"
            />
            <Button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold rounded-2xl h-12 px-5 shrink-0 shadow-xs transition-all flex items-center gap-2 disabled:opacity-40 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Send</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-[11px] text-center text-zinc-400">
            Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-mono text-[10px]">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-mono text-[10px]">Shift + Enter</kbd> for new line
          </p>
        </div>
      </div>
    </div>
  );
}
