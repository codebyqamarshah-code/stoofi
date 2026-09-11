'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Send, 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  Users, 
  FileText,
  Clock
} from 'lucide-react';

export default function SendEmailSmsPage() {
  const [channel, setChannel] = useState('both'); // 'email', 'sms', 'both'
  const [recipientGroup, setRecipientGroup] = useState('All');
  const [selectedClass, setSelectedClass] = useState('All');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const groups = ['All', 'Students', 'Parents', 'Teachers', 'Staff', 'Specific Class'];
  const classes = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];

  const handleSend = (e) => {
    e.preventDefault();
    if (!title.trim()) { alert('Please enter a Subject / Title.'); return; }
    if (!message.trim()) { alert('Please write a Message body.'); return; }

    setStatusMsg(`Broadcast dispatched successfully to ${recipientGroup === 'Specific Class' ? selectedClass : recipientGroup} via ${channel.toUpperCase()}!`);
    setTitle('');
    setMessage('');
    setScheduledTime('');
    setTimeout(() => setStatusMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Send Email / SMS</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Broadcast bulk SMS notices, announcements, and emails to students, parents, and teachers.</p>
        </div>
        <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-800 dark:hover:text-emerald-400 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="hover:text-zinc-800 dark:hover:text-emerald-400 transition-colors">Communicate</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-800 dark:text-emerald-400 font-medium">Send Email / SMS</span>
        </div>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-xl bg-zinc-100 dark:bg-emerald-950/40 border border-zinc-300 dark:border-emerald-800 text-zinc-900 dark:text-emerald-300 text-sm flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-zinc-800" />
          {statusMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Compose Box */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 sm:p-8">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-5 flex items-center gap-2">
              <Mail className="h-4 w-4 text-zinc-800" /> Compose Broadcast
            </h2>

            <form onSubmit={handleSend} className="space-y-5">
              {/* Channel Selector */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">Delivery Channel</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setChannel('both')}
                    className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all flex items-center justify-center gap-2 ${
                      channel === 'both'
                        ? 'bg-zinc-100 dark:bg-emerald-950/60 border-zinc-600 text-zinc-800 dark:text-emerald-300'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50'
                    }`}
                  >
                    <Send className="h-3.5 w-3.5" /> Email & SMS
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('sms')}
                    className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all flex items-center justify-center gap-2 ${
                      channel === 'sms'
                        ? 'bg-zinc-100 dark:bg-emerald-950/60 border-zinc-600 text-zinc-800 dark:text-emerald-300'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50'
                    }`}
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> SMS Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('email')}
                    className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all flex items-center justify-center gap-2 ${
                      channel === 'email'
                        ? 'bg-zinc-100 dark:bg-emerald-950/60 border-zinc-600 text-zinc-800 dark:text-emerald-300'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50'
                    }`}
                  >
                    <Mail className="h-3.5 w-3.5" /> Email Only
                  </button>
                </div>
              </div>

              {/* Recipient Audience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    Send To <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={recipientGroup}
                    onChange={(e) => setRecipientGroup(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
                  >
                    {groups.map(g => <option key={g} value={g}>{g === 'All' ? 'All (Students, Parents, Teachers)' : g}</option>)}
                  </select>
                </div>

                {recipientGroup === 'Specific Class' && (
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                      Select Class <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
                    >
                      {classes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {/* Title / Subject */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Subject / SMS Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Fee Submission Reminder / School Holiday Announcement"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
                />
              </div>

              {/* Message */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Message Body <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-zinc-400">
                    {message.length} characters ({Math.ceil(message.length / 160) || 1} SMS count)
                  </span>
                </div>
                <textarea
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your announcement or SMS notice..."
                  className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors resize-none"
                />
              </div>

              {/* Action Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Send className="h-4 w-4" /> Send Broadcast Now
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Dynamic Variables & Tips */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-3">Available Placeholders</h3>
            <p className="text-xs text-zinc-500 mb-4">Click to copy variables to customize text per recipient:</p>
            <div className="flex flex-wrap gap-2 text-xs">
              {['[student_name]', '[parent_name]', '[class]', '[section]', '[due_fee]', '[school_name]', '[date]'].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setMessage(prev => prev + ' ' + tag)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-100 hover:text-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[11px] transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 space-y-3">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">SMS Gateway Balance</h3>
            <div className="text-2xl font-black text-zinc-800">4,850 SMS</div>
            <p className="text-[11px] text-zinc-500">Twilio / Local GSM Gateway configured and active.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
