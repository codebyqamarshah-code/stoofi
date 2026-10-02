'use client';
import React, { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Save, Check, Loader2, ChevronRight } from 'lucide-react';
import api from '@/services/api';

export default function GeneralSettingsPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState('');
  const [settings, setSettings] = useState({
    schoolName: '',
    siteTitle: '',
    address: '',
    phoneNumber: '',
    email: '',
    language: 'English',
    dateFormat: 'DD/MM/YYYY',
    currency: 'PKR',
    currencySymbol: 'Rs.',
    session: '',
    tagline: '',
    footerText: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/setting');
      if (res?.success && res.data) {
        const d = res.data;
        setSettings({
          schoolName: d.schoolName || '',
          siteTitle: d.schoolName || '',
          address: d.address || '',
          phoneNumber: d.phone || '',
          email: d.email || '',
          language: 'English',
          dateFormat: 'DD/MM/YYYY',
          currency: d.currency || 'PKR',
          currencySymbol: d.currencySymbol || 'Rs.',
          session: d.academicYear || '',
          tagline: d.tagline || '',
          footerText: d.footerText || ''
        });
      }
    } catch (e) {
      console.error('Failed to fetch settings:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/setting', {
        schoolName: settings.schoolName,
        phone: settings.phoneNumber,
        email: settings.email,
        address: settings.address,
        currency: settings.currency,
        currencySymbol: settings.currencySymbol,
        academicYear: settings.session,
        tagline: settings.tagline,
        footerText: settings.footerText
      });
      setIsEditing(false);
      setNotification('Settings saved successfully!');
      setTimeout(() => setNotification(''), 3500);
    } catch (e) {
      setNotification('Failed to save settings. Please try again.');
      setTimeout(() => setNotification(''), 3500);
    } finally {
      setSaving(false);
    }
  };

  const FIELD_LABELS = {
    schoolName: 'School Name',
    siteTitle: 'Site Title',
    address: 'Address',
    phoneNumber: 'Phone Number',
    email: 'Email',
    language: 'Language',
    dateFormat: 'Date Format',
    currency: 'Currency',
    currencySymbol: 'Currency Symbol',
    session: 'Academic Year / Session',
    tagline: 'Tagline / Slogan',
    footerText: 'Footer Text'
  };

  return (
    <div className="p-6 bg-white min-h-screen text-zinc-950 font-sans">
      {notification && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-5 py-3 rounded-xl border shadow-xl text-sm font-semibold transition-all ${notification.includes('Failed') ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
          <Check className="h-4 w-4" />
          {notification}
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center gap-1 text-xs font-semibold text-zinc-600 mb-2">
          <span>Dashboard</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>General Settings</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-zinc-950 font-bold">General Settings</span>
        </div>
        <h1 className="text-2xl font-bold text-zinc-950">General Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Logos */}
        <div className="lg:col-span-1 space-y-6">
          {/* Logo Card */}
          <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
            <div className="border-b border-zinc-200 px-6 py-4">
              <h2 className="text-sm font-bold text-zinc-950">School Brand Logo</h2>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div className="w-24 h-24 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center mb-4 p-2">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex gap-2 w-full">
                <button className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2 px-2 rounded-lg text-xs uppercase tracking-wider transition-colors flex justify-center items-center gap-2 cursor-pointer shadow-xs">
                  <Upload size={14} /> UPLOAD
                </button>
                <button className="flex-1 bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-800 font-bold py-2 px-2 rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer">
                  CHANGE
                </button>
              </div>
            </div>
          </div>

          {/* Favicon Card */}
          <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
            <div className="border-b border-zinc-200 px-6 py-4">
              <h2 className="text-sm font-bold text-zinc-950">Site Favicon</h2>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div className="w-16 h-16 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center mb-4 p-2">
                <img src="/logo.png" alt="Favicon" className="w-full h-full object-contain" />
              </div>
              <div className="flex gap-2 w-full">
                <button className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2 px-2 rounded-lg text-xs uppercase tracking-wider transition-colors flex justify-center items-center gap-2 cursor-pointer shadow-xs">
                  <Upload size={14} /> UPLOAD
                </button>
                <button className="flex-1 bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-800 font-bold py-2 px-2 rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer">
                  CHANGE
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - General Settings View */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
            <div className="border-b border-zinc-200 px-6 py-4 flex justify-between items-center bg-zinc-50/50">
              <h2 className="text-sm font-bold text-zinc-950">System Configuration Details</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-1.5 px-4 rounded-lg transition-colors text-xs uppercase tracking-wider cursor-pointer shadow-xs"
              >
                {isEditing ? 'CANCEL' : 'EDIT SETTINGS'}
              </button>
            </div>
            <div className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                  <span className="ml-3 text-sm text-zinc-600 font-medium">Loading settings...</span>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <tbody>
                    {Object.entries(settings).map(([key, value], index) => (
                      <tr key={key} className={index !== 0 ? 'border-t border-zinc-200' : ''}>
                        <td className="p-4 w-1/3 bg-zinc-50 text-xs font-bold uppercase tracking-wider text-zinc-700 border-r border-zinc-200">
                          {FIELD_LABELS[key] || key.replace(/([A-Z])/g, ' $1').trim()}
                        </td>
                        <td className="p-4 w-2/3">
                          {isEditing ? (
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => handleSettingChange(key, e.target.value)}
                              className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm font-medium text-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                            />
                          ) : (
                            <span className="text-sm font-semibold text-zinc-950">{value || <span className="text-zinc-400 italic">Not set</span>}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {isEditing && !loading && (
                <div className="p-4 border-t border-zinc-200 flex justify-end gap-3 bg-zinc-50">
                  <button
                    onClick={() => { setIsEditing(false); fetchSettings(); }}
                    className="bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-800 font-bold py-2 px-5 rounded-lg transition-colors text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2 px-6 rounded-lg transition-colors text-xs uppercase tracking-wider flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {saving ? 'SAVING...' : 'SAVE CHANGES'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
