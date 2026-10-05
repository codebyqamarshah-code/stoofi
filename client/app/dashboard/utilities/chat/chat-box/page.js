'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  CheckCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StoofiAiPage() {
  const { user } = useAuth();
  const router = useRouter();

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

  // Load conversations list on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const loadConversations = async () => {
    try {
      const res = await aiApi.getConversations();
      if (res?.success && Array.isArray(res.data)) {
        setConversations(res.data);
        if (res.data.length > 0 && !activeConversationId) {
          selectConversation(res.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const selectConversation = async (convId) => {
    setActiveConversationId(convId);
    setIsLoading(true);
    try {
      const res = await aiApi.getConversation(convId);
      if (res?.success && Array.isArray(res.messages)) {
        setMessages(res.messages);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to load conversation messages:', err);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempUserMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await aiApi.sendMessage({
        message: text,
        conversationId: activeConversationId || undefined,
        pageContext: { pathname: '/dashboard/utilities/chat/chat-box' }
      });

      if (res?.success) {
        if (res.conversationId && activeConversationId !== res.conversationId) {
          setActiveConversationId(res.conversationId);
          loadConversations();
        }

        const assistantMsg = {
          id: res.message?.id || `ai-${Date.now()}`,
          role: 'assistant',
          content: res.message?.content || 'Main ne aapki request process kar li hai.',
          navAction: res.message?.navAction,
          createdAt: res.message?.createdAt || new Date().toISOString()
        };

        setMessages(prev => [...prev, assistantMsg]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: res?.message || 'Maaf kijiyega, is waqt Stoofi AI response nahi de pa raha. Please dobara koshish karein.',
            isError: true,
            createdAt: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: err?.response?.data?.message || 'Maaf kijiyega, information check kartay waqt issue aya. Dobara poochiye.',
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
    try {
      const res = await aiApi.renameConversation(convId, editTitle.trim());
      if (res?.success) {
        setConversations(prev => prev.map(c => c._id === convId ? { ...c, title: editTitle.trim() } : c));
      }
    } catch (err) {
      console.error('Error renaming:', err);
    } finally {
      setEditingConvId(null);
    }
  };

  const handleDeleteConversation = async (convId, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    try {
      await aiApi.deleteConversation(convId);
      setConversations(prev => prev.filter(c => c._id !== convId));
      if (activeConversationId === convId) {
        startNewChat();
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
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
      setMessages([]);
    } catch (err) {
      console.error('Error clearing messages:', err);
    }
  };

  const getQuickPromptCards = () => {
    const role = user?.role || 'User';
    if (role === 'Student') {
      return [
        { icon: CalendarCheck, title: 'Check Attendance', desc: 'Mera attendance kitna hai?', prompt: 'Mera attendance kitna hai?' },
        { icon: BookOpen, title: 'My Homework', desc: 'Mera homework dikhao', prompt: 'Mera homework dikhao' },
        { icon: CreditCard, title: 'Fee Status', desc: 'Meri fees kitni baki hai?', prompt: 'Meri fees kitni baki hai?' },
        { icon: Compass, title: 'Profile Details', desc: 'Mera student profile dikhao', prompt: 'Mera student profile dikhao' }
      ];
    }
    if (role === 'Teacher') {
      return [
        { icon: BookOpen, title: 'Homework Assignments', desc: 'Show created homework assignments', prompt: 'Show my created homework assignments' },
        { icon: CalendarCheck, title: 'Student Attendance', desc: 'How to mark student attendance', prompt: 'How do I mark student attendance in Stoofi?' },
        { icon: Compass, title: 'Class Directory', desc: 'Class 10 ke students dikhao', prompt: 'Class 10 ke students dikhao' },
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
                <h2 className="text-sm font-bold text-zinc-950 leading-tight">Stoofi AI</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[11px] text-zinc-500 font-medium">Agent Active</span>
                </div>
              </div>
            </div>

            <Button
              onClick={startNewChat}
              size="sm"
              className="bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs h-8 px-3 rounded-xl shadow-xs flex items-center gap-1.5"
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
              {user?.role ? user.role.charAt(0) : 'U'}
            </div>
            <div className="truncate max-w-[140px]">
              <p className="font-semibold text-zinc-950 truncate">{user?.fullName || user?.username || 'User'}</p>
              <p className="text-[10px] text-zinc-500 capitalize">{user?.role || 'Authenticated'}</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-200 text-zinc-800 border border-zinc-300">
            Stoofi Agent
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
                <h1 className="text-base font-bold text-zinc-950">Stoofi AI Agent</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Role-Aware
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Connected to real school ERP database records (Attendance, Homework, Fees, Directory)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearMessages}
                className="h-8 text-xs text-zinc-700 border-zinc-200 hover:bg-zinc-50 flex items-center gap-1.5"
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
                  Aapka smart AI assistant. Aap normal Roman Urdu ya English mein attendance, homework, fees, ya portal navigation ke hawalay se kuch bhi pooch saktay hain.
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
              <div
                key={msg.id}
                className={`flex gap-3.5 max-w-3xl ${
                  msg.role === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center shrink-0 mt-1 shadow-xs p-1 overflow-hidden">
                    <img src="/logo.png" alt="Stoofi AI" className="w-full h-full object-contain" />
                  </div>
                )}

                <div className="space-y-2 flex-1 max-w-[88%]">
                  <div
                    className={`relative group p-4 sm:p-5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-zinc-950 text-white rounded-tr-none shadow-sm font-normal'
                        : msg.isError
                          ? 'bg-rose-50 text-rose-800 border border-rose-200 rounded-tl-none'
                          : 'bg-white text-zinc-950 border border-zinc-200 rounded-tl-none shadow-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words">{msg.content}</div>

                    {msg.role === 'assistant' && !msg.isError && (
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-all"
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
                    <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between gap-3 animate-in fade-in duration-300">
                      <div className="flex items-center gap-2">
                        <Compass className="w-4 h-4 text-zinc-950" />
                        <span className="text-xs font-semibold text-zinc-950">
                          Jump to {msg.navAction.label || 'Page'}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => router.push(msg.navAction.route)}
                        className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs h-7 px-3 rounded-lg shadow-xs flex items-center gap-1"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}

                  <span className="block text-[10px] text-zinc-400 px-1">
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-2xl bg-zinc-800 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
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
              className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold rounded-2xl h-12 px-5 shrink-0 shadow-xs transition-all flex items-center gap-2 disabled:opacity-40"
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
