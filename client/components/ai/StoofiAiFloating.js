'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import aiApi from '@/services/aiApi';
import { 
  Sparkles, 
  X, 
  Minus, 
  Maximize2, 
  Send, 
  Bot, 
  User as UserIcon, 
  ArrowRight, 
  RotateCcw,
  Loader2,
  CheckCircle2,
  HelpCircle,
  Copy,
  CheckCheck
} from 'lucide-react';

// Inline style parser for **bold** and `code`
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
        <code key={match.index} className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-[11px] font-mono">
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

// Formatted Message helper for floating panel
function FormattedMessage({ content }) {
  if (!content) return null;
  const lines = content.split('\n');

  return (
    <div className="space-y-1 text-xs sm:text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Bullet point: •, -, or *
        if (trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const itemText = trimmed.replace(/^[•\-\*]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-0.5 my-0.5">
              <span className="text-zinc-500 mt-1 text-[7px] shrink-0">●</span>
              <span className="flex-1">{parseInlineStyles(itemText)}</span>
            </div>
          );
        }

        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-0.5 my-0.5">
              <span className="font-bold text-zinc-950 shrink-0 text-xs min-w-[14px]">{numMatch[1]}.</span>
              <span className="flex-1">{parseInlineStyles(numMatch[2])}</span>
            </div>
          );
        }

        // Heading
        if (trimmed.startsWith('###') || trimmed.startsWith('##')) {
          const hText = trimmed.replace(/^#+\s*/, '');
          return (
            <div key={idx} className="font-bold text-zinc-950 text-xs mt-1 mb-0.5">
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

export default function StoofiAiFloating() {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [copiedMessageId, setCopiedMessageId] = useState(null);

  // Draggable state for the floating launcher button (desktop + mobile)
  const [position, setPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    moved: false,
    isDragging: false,
    pointerId: null
  });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load saved position or initialize bottom-right default
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('stoofi_ai_btn_pos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
          const maxX = Math.max(10, window.innerWidth - 68);
          const maxY = Math.max(10, window.innerHeight - 68);
          setPosition({
            x: Math.max(10, Math.min(maxX, parsed.x)),
            y: Math.max(10, Math.min(maxY, parsed.y))
          });
          return;
        }
      }
    } catch (e) {}

    const defX = Math.max(10, window.innerWidth - 76);
    const defY = Math.max(10, window.innerHeight - 84);
    setPosition({ x: defX, y: defY });
  }, []);

  // Keep within bounds on window resize
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setPosition(prev => {
        if (!prev) return prev;
        const maxX = Math.max(10, window.innerWidth - 68);
        const maxY = Math.max(10, window.innerHeight - 68);
        return {
          x: Math.max(10, Math.min(maxX, prev.x)),
          y: Math.max(10, Math.min(maxY, prev.y))
        };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    const currentX = position?.x ?? (window.innerWidth - 76);
    const currentY = position?.y ?? (window.innerHeight - 84);

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: currentX,
      initialY: currentY,
      moved: false,
      isDragging: true,
      pointerId: e.pointerId
    };

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current.isDragging) return;

    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    if (!dragRef.current.moved && Math.hypot(dx, dy) > 5) {
      dragRef.current.moved = true;
      setIsDragging(true);
    }

    if (dragRef.current.moved) {
      const maxX = Math.max(10, window.innerWidth - 68);
      const maxY = Math.max(10, window.innerHeight - 68);
      const newX = Math.max(10, Math.min(maxX, dragRef.current.initialX + dx));
      const newY = Math.max(10, Math.min(maxY, dragRef.current.initialY + dy));
      setPosition({ x: newX, y: newY });
    }
  };

  const handlePointerUp = (e) => {
    if (!dragRef.current.isDragging) return;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {}

    const wasMoved = dragRef.current.moved;
    dragRef.current.isDragging = false;

    if (wasMoved) {
      setPosition(curr => {
        if (curr) {
          try {
            localStorage.setItem('stoofi_ai_btn_pos', JSON.stringify(curr));
          } catch (err) {}
        }
        return curr;
      });
      setTimeout(() => {
        setIsDragging(false);
        dragRef.current.moved = false;
      }, 80);
    } else {
      setIsDragging(false);
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  const handlePointerCancel = (e) => {
    if (!dragRef.current.isDragging) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {}
    dragRef.current.isDragging = false;
    setIsDragging(false);
  };

  // If user is not authenticated or already on full chat-box page, don't show floating panel
  const isFullChatPage = pathname === '/dashboard/utilities/chat/chat-box' || 
    pathname === '/dashboard/student/chat/chat-box' || 
    pathname === '/dashboard/teacher/chat/chat-box';

  // Guest mode: visitors on the public Home Page can chat without logging in
  const isHomePage = pathname === '/';
  const isGuest = !isAuthenticated;

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const getSuggestions = () => {
    if (isGuest) {
      return ['Admission process', 'Programs offered', 'Contact details', 'How to login?'];
    }
    const role = user?.role || 'User';
    if (role === 'Student') {
      return ['Mera attendance kitna hai?', 'Homework dikhao', 'Fees status', 'Mera profile'];
    }
    if (role === 'Teacher') {
      return ['Class attendance', 'Homework list', 'Create homework', 'FSC OTT students'];
    }
    if (role === 'Super Admin' || role === 'Admin') {
      return ['School statistics', 'Student management', 'Fee collection', 'Total students'];
    }
    return ['What can you do?', 'Mera profile dikhao', 'Help'];
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
      let res;
      if (isGuest) {
        const resp = await fetch('/api/public-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history: messages.filter(m => !m.isError).map(m => ({ role: m.role, content: m.content }))
          })
        });
        res = await resp.json();
      } else {
        res = await aiApi.sendMessage({
          message: text,
          conversationId: conversationId || undefined,
          pageContext: { pathname }
        });
      }

      if (res?.success) {
        if (res.conversationId && !conversationId) {
          setConversationId(res.conversationId);
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
            content: res?.message || 'Stoofi AI is currently unreachable. Please try again.',
            isError: true,
            createdAt: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      console.error('AI chat error:', err);
      const errMsg = err?.response?.data?.message || err?.message || '';
      // Show friendly message - server might be temporarily unavailable
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: errMsg && errMsg.length < 200 
            ? errMsg 
            : 'Stoofi AI filhal available nahi hai. Thori der baad dobara try karein, ya full chat page open karein.',
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

  const handleOpenFullChat = () => {
    setIsOpen(false);
    if (isGuest) {
      router.push('/login');
      return;
    }
    if (user?.role === 'Student') {
      router.push('/dashboard/student/chat/chat-box');
    } else if (user?.role === 'Teacher') {
      router.push('/dashboard/teacher/chat/chat-box');
    } else {
      router.push('/dashboard/utilities/chat/chat-box');
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setConversationId(null);
  };

  // Logged-in users: everywhere (except full chat page). Guests: only on the public Home Page.
  if (isFullChatPage || (isGuest && !isHomePage)) {
    return null;
  }

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          1. Floating Action Button (Always Visible across Dashboards)
      ────────────────────────────────────────────────────────────── */}
      {!isOpen && (
        <div 
          className="fixed z-50 group select-none touch-none"
          style={
            position
              ? { left: `${position.x}px`, top: `${position.y}px`, right: 'auto', bottom: 'auto' }
              : { right: '1.5rem', bottom: '1.5rem' }
          }
        >
          <button
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            aria-label="Ask Stoofi AI (Drag anywhere)"
            title="Drag to move, click to chat"
            className={`relative flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-xl hover:shadow-2xl border-2 group/btn cursor-grab active:cursor-grabbing select-none touch-none ${
              isDragging 
                ? 'scale-110 shadow-2xl ring-4 ring-[#084A86]/25' 
                : 'hover:scale-105 active:scale-95 transition-transform duration-200'
            }`}
            style={{ borderColor: '#084A86' }}
          >
            <img 
              src="/stoofi-icon.png" 
              alt="Stoofi AI" 
              draggable={false}
              className="w-9 h-9 object-contain group-hover/btn:scale-110 pointer-events-none select-none" 
            />

            {/* Subtle drag dot badge */}
            <span 
              className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#084A86] rounded-full border-2 border-white flex items-center justify-center pointer-events-none"
              title="Draggable"
            >
              <span className="w-1 h-1 bg-white rounded-full"></span>
            </span>
          </button>

          {/* Hover Tooltip (hidden during drag) */}
          {!isDragging && (
            <div 
              className={`absolute top-1/2 -translate-y-1/2 hidden group-hover:flex items-center px-3 py-1.5 rounded-lg bg-zinc-950 text-white text-xs font-semibold whitespace-nowrap shadow-lg animate-in fade-in duration-200 pointer-events-none ${
                position && position.x < 140 
                  ? 'left-16 slide-in-from-left-2' 
                  : 'right-16 slide-in-from-right-2'
              }`}
            >
              Ask Stoofi AI ✨
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. Compact Floating Chat Drawer / Panel
      ────────────────────────────────────────────────────────────── */}
      {isOpen && (
        <div 
          className={`fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[400px] bg-white rounded-2xl shadow-2xl border border-zinc-200 flex flex-col overflow-hidden transition-all duration-300 ${
            isMinimized ? 'h-14' : 'h-[540px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-zinc-950 text-white flex items-center justify-between shadow-xs select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-zinc-200 p-1 shadow-xs shrink-0 overflow-hidden">
                <img src="/stoofi-icon.png" alt="Stoofi AI" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold leading-tight text-white">Stoofi AI</h3>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-white/20 text-white uppercase tracking-wider">
                    {isGuest ? 'Guest' : (user?.role || 'Agent')}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-tight">Intelligent school assistant</p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1">
              <button 
                onClick={handleClearChat}
                title="Clear Chat"
                className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button 
                onClick={handleOpenFullChat}
                title="Expand to Full Page"
                className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Expand" : "Minimize"}
                className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content (Hidden when minimized) */}
          {!isMinimized && (
            <>
              {/* Message List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-zinc-50/50 text-sm">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center p-2 shadow-xs">
                      <img src="/stoofi-icon.png" alt="Stoofi AI" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-950">
                        Hi {user?.firstName || user?.fullName || user?.username || 'there'}! 👋
                      </h4>
                      <p className="text-xs text-zinc-500 mt-1 max-w-[240px]">
                        {isGuest
                          ? 'Ask about admissions, programs, results, contact details or portal login.'
                          : 'Attendance, homework, fees, ya portal navigation ke hawalay se kuch bhi poochiye.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => (
                    msg.role === 'user' ? (
                      /* User Message: Clean Right Alignment with W-Fit Bubble */
                      <div key={msg.id} className="w-full flex justify-end items-end gap-2 my-1">
                        <div className="flex flex-col items-end max-w-[84%] space-y-1">
                          <div className="inline-block w-fit bg-zinc-950 text-white rounded-2xl rounded-tr-xs px-3.5 py-2.5 shadow-xs text-xs sm:text-sm leading-relaxed font-normal whitespace-pre-wrap break-words text-left">
                            {msg.content}
                          </div>
                          <span className="text-[9px] text-zinc-400 mr-1 select-none">
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-zinc-800 text-white flex items-center justify-center shrink-0 shadow-xs mb-3 text-[10px]">
                          <UserIcon className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    ) : (
                      /* Assistant Message: Clean Left Alignment with Rich Formatted Content */
                      <div key={msg.id} className="w-full flex justify-start items-start gap-2 my-1">
                        <div className="w-7 h-7 rounded-full bg-white border border-zinc-200 flex items-center justify-center shrink-0 mt-0.5 shadow-xs p-1 overflow-hidden">
                          <img src="/stoofi-icon.png" alt="Stoofi AI" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex flex-col items-start max-w-[85%] space-y-1.5">
                          <div className={`relative group p-3 rounded-2xl rounded-tl-xs text-xs sm:text-sm leading-relaxed shadow-xs w-fit ${
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
                                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-all cursor-pointer shadow-xs"
                                title="Copy message"
                              >
                                {copiedMessageId === msg.id ? (
                                  <CheckCheck className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            )}
                          </div>

                          {/* Navigation Action Button from AI */}
                          {msg.navAction && msg.navAction.route && (
                            <div className="pt-0.5 animate-in fade-in duration-200">
                              <button
                                onClick={() => {
                                  router.push(msg.navAction.route);
                                  setIsOpen(false);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                              >
                                <span>Open {msg.navAction.label || 'Page'}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}

                          <span className="text-[9px] text-zinc-400 ml-1 select-none">
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                      </div>
                    )
                  ))
                )}

                {/* Typing Indicator */}
                {isLoading && (
                  <div className="flex gap-2.5 items-center justify-start">
                    <div className="w-7 h-7 rounded-full bg-white border border-zinc-200 flex items-center justify-center shrink-0 p-1">
                      <img src="/logo.png" alt="Stoofi AI" className="w-full h-full object-contain animate-pulse" />
                    </div>
                    <div className="px-3 py-2 rounded-2xl bg-white border border-zinc-200 text-xs text-zinc-500 flex items-center gap-2">
                      <span className="flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-950 animate-bounce"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-950 animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-950 animate-bounce [animation-delay:0.4s]"></span>
                      </span>
                      <span>Checking records...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions Chips */}
              {messages.length <= 2 && !isLoading && (
                <div className="px-3 py-2 bg-white border-t border-zinc-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {getSuggestions().map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(sug)}
                      className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-50 hover:bg-zinc-950 hover:text-white text-zinc-700 border border-zinc-200 transition-colors"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}

              {/* Bottom Input Area */}
              <div className="p-3 bg-white border-t border-zinc-200">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Ask in Roman Urdu or English..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 focus:border-zinc-950 transition-all disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white disabled:opacity-40 transition-all shrink-0 shadow-xs"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
