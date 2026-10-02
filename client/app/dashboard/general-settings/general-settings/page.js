'use client';
import React, { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Save, Check, Loader2 } from 'lucide-react';
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
    <div className="p-6 bg-zinc-950 min-h-screen text-zinc-100 font-sans">
      {notification && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-5 py-3 rounded-xl border shadow-xl text-sm font-semibold transition-all ${notification.includes('Failed') ? 'bg-rose-900 border-rose-700 text-rose-200' : 'bg-emerald-900 border-emerald-700 text-emerald-200'}`}>
          <Check className="h-4 w-4" />
          {notification}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">General Settings</h1>
        <div className="text-sm text-zinc-400">Dashboard &gt; General Settings &gt; General Settings</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Logos */}
        <div className="lg:col-span-1 space-y-6">
          {/* Logo Card */}
          <div className="bg-white border border-zinc-200 shadow-xs rounded-lg shadow-sm">
            <div className="border-b border-zinc-200 px-6 py-4">
              <h2 className="text-lg font-medium text-zinc-950">Change Logo</h2>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div className="w-24 h-24 bg-white border border-zinc-200 shadow-xs rounded-lg flex items-center justify-center mb-4">
                <ImageIcon size={32} className="text-zinc-700" />
              </div>
              <div className="flex gap-2 w-full">
                <button className="flex-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-200 text-zinc-950 font-medium py-2 px-2 rounded text-sm transition-colors flex justify-center items-center gap-2">
                  <Upload size={16} /> UPLOAD
                </button>
                <button className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-950 font-medium py-2 px-2 rounded text-sm transition-colors">
                  CHANGE
                </button>
              </div>
            </div>
          </div>

          {/* Favicon Card */}
          <div className="bg-white border border-zinc-200 shadow-xs rounded-lg shadow-sm">
            <div className="border-b border-zinc-200 px-6 py-4">
              <h2 className="text-lg font-medium text-zinc-950">Change Favicon</h2>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div className="w-16 h-16 bg-white border border-zinc-200 shadow-xs rounded-lg flex items-center justify-center mb-4">
                <ImageIcon size={24} className="text-zinc-700" />
              </div>
              <div className="flex gap-2 w-full">
                <button className="flex-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-200 text-zinc-950 font-medium py-2 px-2 rounded text-sm transition-colors flex justify-center items-center gap-2">
                  <Upload size={16} /> UPLOAD
                </button>
                <button className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-950 font-medium py-2 px-2 rounded text-sm transition-colors">
                  CHANGE
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - General Settings View */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-lg shadow-sm">
            <div className="border-b border-zinc-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-medium text-zinc-950">General Settings View</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-950 font-medium py-1 px-4 rounded transition-colors text-sm"
              >
                {isEditing ? 'CANCEL' : 'EDIT'}
              </button>
            </div>
            <div className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                  <span className="ml-3 text-sm text-zinc-400">Loading settings...</span>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <tbody>
                    {Object.entries(settings).map(([key, value], index) => (
                      <tr key={key} className={index !== 0 ? 'border-t border-zinc-200' : ''}>
                        <td className="p-4 w-1/3 bg-zinc-950 text-sm font-medium text-zinc-950 capitalize border-r border-zinc-200">
                          {FIELD_LABELS[key] || key.replace(/([A-Z])/g, ' $1').trim()}
                        </td>
                        <td className="p-4 w-2/3">
                          {isEditing ? (
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => handleSettingChange(key, e.target.value)}
                              className="w-full bg-white border border-zinc-200 shadow-xs rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600"
                            />
                          ) : (
                            <span className="text-sm text-zinc-950">{value || <span className="text-zinc-600 italic">Not set</span>}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {isEditing && !loading && (
                <div className="p-4 border-t border-zinc-200 flex justify-end gap-3 bg-zinc-950">
                  <button
                    onClick={() => { setIsEditing(false); fetchSettings(); }}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-950 font-medium py-2 px-5 rounded transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded transition-colors text-sm flex items-center gap-2"
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
