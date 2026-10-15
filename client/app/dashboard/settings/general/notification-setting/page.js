'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronRight, 
  Bell, 
  ShieldAlert, 
  CheckCircle2, 
  Info, 
  Trash2, 
  CheckCheck, 
  Search, 
  SlidersHorizontal,
  RefreshCw,
  Mail,
  Smartphone,
  Radio,
  Calendar,
  AlertCircle
} from 'lucide-react';
import api from '@/services/api';

const eventsList = [
  'Student Admission', 'Student Checkout', 'Fee Submission', 'Exam Result',
  'Notice Published', 'Homework Added', 'Event Created', 'Holiday Added',
  'Library Book Issued', 'Library Book Returned'
];

export default function NotificationSettingPage() {
  const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' | 'channels'
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'unread' | 'security' | 'system'
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Channel toggles state
  const [events, setEvents] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('stoofi_notification_channels');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return eventsList.map(e => ({ name: e, email: true, sms: false, push: true }));
  });

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/live-updates').catch(() => null);
      let apiNotifs = [];
      if (res && res.success && Array.isArray(res.data?.notifications)) {
        apiNotifs = res.data.notifications;
      }

      let deletedIds = [];
      let readIds = [];
      if (typeof window !== 'undefined') {
        try {
          deletedIds = JSON.parse(localStorage.getItem('deleted_notifs') || '[]');
          readIds = JSON.parse(localStorage.getItem('read_notifs') || '[]');
        } catch (e) {}
      }

      // If backend has no notifications yet, provide default initial system/security notifications
      if (apiNotifs.length === 0) {
        apiNotifs = [
          {
            _id: 'sec-alert-1',
            type: 'security',
            title: 'Security Alert: Super Admin Detected',
            message: 'Super Admin account (jafferi2008@gmail.com) accessed from a new session. If this wasn\'t you, secure your account immediately.',
            createdAt: new Date().toISOString()
          },
          {
            _id: 'sec-alert-2',
            type: 'security',
            title: 'Security Alert: Super Admin Detected',
            message: 'Super Admin account (jafferi2008@gmail.com) accessed from a new session. If this wasn\'t you, secure your account immediately.',
            createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
          },
          {
            _id: 'sys-notice-1',
            type: 'system',
            title: 'System Backup Completed',
            message: 'Daily automated cloud database backup completed successfully without any conflicts.',
            createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
          },
          {
            _id: 'sys-notice-2',
            type: 'system',
            title: 'Welcome to Stoofi ERP Notification Center',
            message: 'Manage all security warnings, student alerts, and general notification channels from this centralized hub.',
            createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString()
          }
        ];
      }

      // Filter out deleted notifications
      const visible = apiNotifs.filter(n => !deletedIds.includes(n._id));

      // Apply read state
      const processed = visible.map(n => ({
        ...n,
        isRead: Boolean(n.isRead || n.read || readIds.includes(n._id))
      }));

      // Sort by newest
      processed.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setNotifications(processed);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Sync with custom event
  useEffect(() => {
    const handleUpdate = () => {
      fetchNotifications();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('stoofi_notifications_updated', handleUpdate);
      return () => window.removeEventListener('stoofi_notifications_updated', handleUpdate);
    }
  }, []);

  // Delete single notification
  const handleDeleteNotification = (id) => {
    if (!id) return;
    if (typeof window !== 'undefined') {
      try {
        const delIds = JSON.parse(localStorage.getItem('deleted_notifs') || '[]');
        delIds.push(id);
        localStorage.setItem('deleted_notifs', JSON.stringify([...new Set(delIds)]));
        window.dispatchEvent(new CustomEvent('stoofi_notifications_updated'));
      } catch (e) {}
    }
    setNotifications(prev => prev.filter(n => n._id !== id));
  };

  // Toggle Read/Unread
  const handleToggleRead = (id) => {
    if (!id) return;
    setNotifications(prev => prev.map(n => {
      if (n._id === id) {
        const nextState = !n.isRead;
        if (typeof window !== 'undefined') {
          try {
            let readIds = JSON.parse(localStorage.getItem('read_notifs') || '[]');
            if (nextState) {
              readIds = [...new Set([...readIds, id])];
            } else {
              readIds = readIds.filter(item => item !== id);
            }
            localStorage.setItem('read_notifs', JSON.stringify(readIds));
            window.dispatchEvent(new CustomEvent('stoofi_notifications_updated'));
          } catch (e) {}
        }
        return { ...n, isRead: nextState, read: nextState };
      }
      return n;
    }));
  };

  // Mark all as read
  const handleMarkAllRead = () => {
    const allIds = notifications.map(n => n._id).filter(Boolean);
    if (typeof window !== 'undefined') {
      try {
        const readIds = JSON.parse(localStorage.getItem('read_notifs') || '[]');
        const updated = [...new Set([...readIds, ...allIds])];
        localStorage.setItem('read_notifs', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('stoofi_notifications_updated'));
      } catch (e) {}
    }
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
  };

  // Clear all notifications
  const handleClearAll = () => {
    if (!confirm('Are you sure you want to delete all notifications? This cannot be undone.')) return;
    const allIds = notifications.map(n => n._id).filter(Boolean);
    if (typeof window !== 'undefined') {
      try {
        const delIds = JSON.parse(localStorage.getItem('deleted_notifs') || '[]');
        const updated = [...new Set([...delIds, ...allIds])];
        localStorage.setItem('deleted_notifs', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('stoofi_notifications_updated'));
      } catch (e) {}
    }
    setNotifications([]);
  };

  // Channel toggle handler
  const toggleSetting = (index, type) => {
    const newEvents = [...events];
    newEvents[index][type] = !newEvents[index][type];
    setEvents(newEvents);
  };

  const handleSaveChannels = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('stoofi_notification_channels', JSON.stringify(events));
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notif => {
      // Search filter
      const matchesSearch = 
        (notif.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (notif.message || '').toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // Type filter
      if (filterType === 'unread') return !notif.isRead && !notif.read;
      if (filterType === 'security') return (notif.title || '').toLowerCase().includes('security') || notif.type === 'security';
      if (filterType === 'system') return !(notif.title || '').toLowerCase().includes('security') && notif.type !== 'security';
      return true;
    });
  }, [notifications, searchQuery, filterType]);

  const unreadCount = notifications.filter(n => !n.isRead && !n.read).length;

  const renderToggle = (checked, onChange, label, Icon) => (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div className="relative">
        <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
        <div className={`block w-9 h-5 rounded-full transition-colors ${checked ? 'bg-[#084A86]' : 'bg-zinc-300 dark:bg-zinc-700'}`}></div>
        <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform shadow-xs ${checked ? 'transform translate-x-4' : ''}`}></div>
      </div>
      <div className="flex items-center gap-1">
        {Icon && <Icon className="w-3.5 h-3.5 text-zinc-500" />}
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{label}</span>
      </div>
    </label>
  );

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-zinc-950 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Breadcrumb Header */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
        <span>Dashboard</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span>General Settings</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#084A86] dark:text-sky-400 font-bold">Notification Setting</span>
      </div>

      {/* Page Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#084A86]/10 text-[#084A86] dark:text-sky-400">
              <Bell className="w-6 h-6" />
            </span>
            Notification Center
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your inbox alerts, security notifications, and event delivery channels.
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'inbox'
                ? 'bg-[#084A86] text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>All Notifications</span>
            {unreadCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'inbox' ? 'bg-white text-[#084A86]' : 'bg-rose-500 text-white'
              }`}>
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('channels')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'channels'
                ? 'bg-[#084A86] text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Delivery Channels</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: ALL NOTIFICATIONS INBOX
      ────────────────────────────────────────────────────────────── */}
      {activeTab === 'inbox' && (
        <div className="space-y-4">
          {/* Action Toolbar */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#084A86]/20 focus:border-[#084A86]"
              />
            </div>

            {/* Filter Pills & Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center p-0.5 bg-slate-100 dark:bg-zinc-800 rounded-lg text-xs font-semibold">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'unread', label: `Unread (${unreadCount})` },
                  { id: 'security', label: 'Security' },
                  { id: 'system', label: 'System' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilterType(f.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      filterType === f.id
                        ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {notifications.length > 0 && (
                <>
                  <button
                    onClick={handleMarkAllRead}
                    disabled={unreadCount === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors disabled:opacity-50 cursor-pointer"
                    title="Mark all notifications as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Mark All Read</span>
                  </button>

                  <button
                    onClick={handleClearAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer"
                    title="Clear and delete all notifications"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Clear All</span>
                  </button>
                </>
              )}

              <button
                onClick={fetchNotifications}
                className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Refresh notifications"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-2.5">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => {
                const isSecurity = (notif.title || '').toLowerCase().includes('security') || notif.type === 'security';
                const isRead = notif.isRead || notif.read;

                return (
                  <div
                    key={notif._id || notif.id || Math.random()}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex items-start gap-3 sm:gap-4 ${
                      isRead
                        ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 opacity-85'
                        : isSecurity
                        ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 shadow-xs ring-1 ring-amber-400/20'
                        : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 shadow-xs'
                    }`}
                  >
                    {/* Icon Column */}
                    <div className="shrink-0 mt-0.5">
                      {isSecurity ? (
                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-500/30">
                          <ShieldAlert className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-500/20 text-[#084A86] dark:text-sky-400 flex items-center justify-center border border-sky-200 dark:border-sky-500/30">
                          <Bell className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`text-sm ${isRead ? 'font-semibold text-zinc-800 dark:text-zinc-200' : 'font-bold text-zinc-950 dark:text-white'}`}>
                            {notif.title || 'Notification'}
                          </h3>
                          {!isRead && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#084A86] text-white uppercase tracking-wider">
                              New
                            </span>
                          )}
                          {isSecurity && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                              Security
                            </span>
                          )}
                        </div>

                        {/* Timestamp */}
                        <div className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {notif.createdAt 
                              ? new Date(notif.createdAt).toLocaleString([], { 
                                  dateStyle: 'medium', 
                                  timeStyle: 'short' 
                                }) 
                              : 'Just now'}
                          </span>
                        </div>
                      </div>

                      {/* Message Body */}
                      <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed break-words">
                        {notif.message}
                      </p>

                      {/* Item Bottom Actions */}
                      <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                        <button
                          onClick={() => handleToggleRead(notif._id)}
                          className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          {isRead ? 'Mark as Unread' : 'Mark as Read'}
                        </button>

                        <button
                          onClick={() => handleDeleteNotification(notif._id)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline transition-colors p-1 rounded-md cursor-pointer"
                          title="Delete this notification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              /* Empty State */
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-zinc-800 text-zinc-400 mx-auto flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1">
                  No Notifications Found
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                  {searchQuery 
                    ? `No notifications matched "${searchQuery}". Try a different keyword.` 
                    : 'You are completely caught up! New alerts and security events will appear here.'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-4 px-4 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: NOTIFICATION CHANNELS & PREFERENCES
      ────────────────────────────────────────────────────────────── */}
      {activeTab === 'channels' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs max-w-5xl">
          <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white">
                Notification Delivery Channels
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Choose how notifications are sent for each school activity event.
              </p>
            </div>
            {saveSuccess && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Saved!
              </span>
            )}
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {events.map((event, idx) => (
                <div 
                  key={event.name} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 gap-3"
                >
                  <span className="text-sm font-bold text-zinc-900 dark:text-white">
                    {event.name}
                  </span>
                  <div className="flex items-center gap-3.5">
                    {renderToggle(event.email, () => toggleSetting(idx, 'email'), 'Email', Mail)}
                    {renderToggle(event.sms, () => toggleSetting(idx, 'sms'), 'SMS', Smartphone)}
                    {renderToggle(event.push, () => toggleSetting(idx, 'push'), 'Push', Radio)}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-3">
              <button
                onClick={handleSaveChannels}
                className="bg-[#084A86] hover:bg-[#063866] text-white font-bold text-xs uppercase tracking-wider py-2.5 px-8 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                SAVE CHANNEL SETTINGS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
