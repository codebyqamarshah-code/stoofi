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
  HelpCircle
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
  const [aiStatus, setAiStatus] = useState('online');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // If user is not authenticated or already on full chat-box page, don't show or hide floating panel
  const isFullChatPage = pathname === '/dashboard/utilities/chat/chat-box';

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Initial welcome message based on role
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const role = user?.role || 'User';
      const name = user?.firstName || user?.fullName || user?.username || 'there';
      setMessages([
        {
          id: 'welcome-1',
          role: 'assistant',
          content: `Hi ${name}! 👋 I am **Stoofi AI**, your built-in personal assistant.\n\nI can help you check attendance, homework, fee invoices, school statistics, or guide you across any feature in Stoofi. What would you like to do?`,
          createdAt: new Date().toISOString()
        }
      ]);
    }
  }, [isOpen, user]);

  const getSuggestions = () => {
    const role = user?.role || 'User';
    if (role === 'Student') {
      return ['Show my homework', 'What is my attendance?', 'Check my fees', 'When is my next class?'];
    }
    if (role === 'Teacher') {
      return ['Show my classes', 'Recent homework', 'Attendance summary', 'How do I create homework?'];
    }
    if (role === 'Super Admin' || role === 'Admin') {
      return ['School statistics overview', 'How many students enrolled?', 'Open student list', 'Recent fee collection'];
    }
    return ['What can you help me with?', 'How do I use Stoofi?', 'Show my profile'];
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
          content: res.message?.content || 'I have processed your request.',
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
            content: res?.message || 'Stoofi AI is temporarily unavailable. Please try again.',
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
          content: err?.response?.data?.message || 'I encountered an error retrieving that information. Please try again.',
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
            className="relative flex items-center justify-center w-14 h-14 rounded-full bg-white dark:bg-zinc-900 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-emerald-500/80 dark:border-emerald-500/50 p-2.5 overflow-hidden group/btn"
          >
            <img 
              src="/logo.png" 
              alt="Stoofi AI" 
              className="w-full h-full object-contain drop-shadow-sm group-hover/btn:scale-110 transition-transform duration-300" 
            />
            <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-zinc-900"></span>
            </span>
          </button>

          {/* Hover Tooltip */}
          <div className="absolute right-16 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-semibold whitespace-nowrap shadow-lg animate-in fade-in slide-in-from-right-2 duration-200">
            Ask Stoofi AI ✨
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. Compact Floating Chat Drawer / Panel
      ────────────────────────────────────────────────────────────── */}
      {isOpen && (
        <div 
          className={`fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[420px] bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden transition-all duration-300 ${
            isMinimized ? 'h-14' : 'h-[580px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between shadow-sm select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-white/40 p-1 shadow-xs shrink-0 overflow-hidden">
                <img src="/logo.png" alt="Stoofi AI" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold leading-tight">Stoofi AI</h3>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-white/20 text-white uppercase tracking-wider">
                    {user?.role || 'Personal AI'}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100/90 leading-tight">Your intelligent assistant</p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1">
              <button 
                onClick={handleClearChat}
                title="Clear Chat"
                className="p-1.5 rounded-lg hover:bg-white/20 text-white/90 hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button 
                onClick={handleOpenFullChat}
                title="Expand to Full Page"
                className="p-1.5 rounded-lg hover:bg-white/20 text-white/90 hover:text-white transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Expand" : "Minimize"}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white/90 hover:text-white transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 rounded-lg hover:bg-white/20 text-white/90 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content (Hidden when minimized) */}
          {!isMinimized && (
            <>
              {/* Message List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-zinc-50/50 dark:bg-zinc-900/30 text-sm">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0 mt-0.5 shadow-xs p-1 overflow-hidden">
                        <img src="/logo.png" alt="Stoofi AI" className="w-full h-full object-contain" />
                      </div>
                    )}

                    <div className="max-w-[82%] space-y-2">
                      <div 
                        className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-emerald-600 text-white rounded-br-none shadow-sm'
                            : msg.isError
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-bl-none'
                              : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-800 rounded-bl-none shadow-xs'
                        }`}
                      >
                        <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                      </div>

                      {/* Navigation Action Button from AI */}
                      {msg.navAction && msg.navAction.route && (
                        <div className="pt-1 animate-in fade-in duration-300">
                          <button
                            onClick={() => {
                              router.push(msg.navAction.route);
                              setIsOpen(false);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
                          >
                            <span>Open {msg.navAction.label || 'Page'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-full bg-zinc-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <UserIcon className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {isLoading && (
                  <div className="flex gap-2.5 items-center justify-start">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    </div>
                    <div className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 flex items-center gap-2">
                      <span className="flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></span>
                      </span>
                      <span>Stoofi AI is thinking...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions Chips (shown if < 3 messages) */}
              {messages.length <= 2 && !isLoading && (
                <div className="px-3 py-2 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {getSuggestions().map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(sug)}
                      className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-100 dark:bg-zinc-900 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 transition-colors"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}

              {/* Bottom Input Area */}
              <div className="p-3 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Ask Stoofi AI anything..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 disabled:hover:bg-emerald-600 transition-all shrink-0 shadow-sm"
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
