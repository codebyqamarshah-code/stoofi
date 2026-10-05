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

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // If user is not authenticated or already on full chat-box page, don't show floating panel
  const isFullChatPage = pathname === '/dashboard/utilities/chat/chat-box';

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const getSuggestions = () => {
    const role = user?.role || 'User';
    if (role === 'Student') {
      return ['Mera attendance kitna hai?', 'Homework dikhao', 'Fees status', 'Mera profile'];
    }
    if (role === 'Teacher') {
      return ['Class attendance', 'Homework list', 'Create homework', 'Class 10 students'];
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
      const res = await aiApi.sendMessage({
        message: text,
        conversationId: conversationId || undefined,
        pageContext: { pathname }
      });

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
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: err?.response?.data?.message || 'I encountered an error retrieving data. Please try again.',
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
    router.push('/dashboard/utilities/chat/chat-box');
  };

  const handleClearChat = () => {
    setMessages([]);
    setConversationId(null);
  };

  if (!isAuthenticated || isFullChatPage) {
    return null;
  }

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          1. Floating Action Button (Always Visible across Dashboards)
      ────────────────────────────────────────────────────────────── */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 group">
          <button
            onClick={() => { setIsOpen(true); setIsMinimized(false); }}
            aria-label="Ask Stoofi AI"
            className="relative flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border-2 group/btn"
            style={{borderColor:'#084A86'}}
          >
            <img 
              src="/stoofi-icon.png" 
              alt="Stoofi AI" 
              className="w-9 h-9 object-contain group-hover/btn:scale-110 transition-transform duration-300" 
            />
            <span className="absolute top-0.5 right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#084A86] border-2 border-white"></span>
            </span>
          </button>

          {/* Hover Tooltip */}
          <div className="absolute right-16 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center px-3 py-1.5 rounded-lg bg-zinc-950 text-white text-xs font-semibold whitespace-nowrap shadow-lg animate-in fade-in slide-in-from-right-2 duration-200">
            Ask Stoofi AI ✨
          </div>
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
                    {user?.role || 'Agent'}
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
                        Attendance, homework, fees, ya portal navigation ke hawalay se kuch bhi poochiye.
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-7 h-7 rounded-full bg-white border border-zinc-200 flex items-center justify-center shrink-0 mt-0.5 shadow-xs p-1 overflow-hidden">
                          <img src="/stoofi-icon.png" alt="Stoofi AI" className="w-full h-full object-contain" />
                        </div>
                      )}

                      <div className="max-w-[82%] space-y-1.5">
                        <div 
                          className={`relative group p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-zinc-950 text-white rounded-br-none shadow-xs font-normal'
                              : msg.isError
                                ? 'bg-rose-50 text-rose-800 border border-rose-200 rounded-bl-none'
                                : 'bg-white text-zinc-950 border border-zinc-200 rounded-bl-none shadow-xs'
                          }`}
                        >
                          <div className="whitespace-pre-wrap break-words">{msg.content}</div>

                          {msg.role === 'assistant' && !msg.isError && (
                            <button
                              onClick={() => handleCopy(msg.content, msg.id)}
                              className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-all"
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
                          <div className="pt-0.5 animate-in fade-in duration-300">
                            <button
                              onClick={() => {
                                router.push(msg.navAction.route);
                                setIsOpen(false);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold shadow-xs transition-all"
                            >
                              <span>Open {msg.navAction.label || 'Page'}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {msg.role === 'user' && (
                        <div className="w-7 h-7 rounded-full bg-zinc-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                          <UserIcon className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
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
