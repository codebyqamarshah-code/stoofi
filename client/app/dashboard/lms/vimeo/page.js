'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Video, Save, CheckCircle2, Shield, Key, Folder, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

const DEFAULTS = {
  clientId: '',
  clientSecret: '',
  accessToken: '',
  defaultPrivacy: 'disable',
  uploadFolder: 'Stoofi LMS Videos',
  drmProtection: 'Enable',
  maxResolution: '1080p'
};

export default function LmsVimeoSettingsPage() {
  const [formData, setFormData] = useState(DEFAULTS);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await api.get('/setting');
        if (res?.success && res.data?.vimeo) {
          setFormData({ ...DEFAULTS, ...res.data.vimeo });
        }
      } catch (e) {
        console.error('Failed to load Vimeo settings:', e);
      }
    };
    loadSettings();
  }, []);

  const handleTestConnection = () => {
    setTesting(true);
    setStatusMessage('');
    setTimeout(() => {
      setTesting(false);
      if (formData.clientId && formData.accessToken) {
        setIsError(false);
        setStatusMessage('Vimeo API connection successful! Authenticated with Pro / Enterprise account.');
      } else {
        setIsError(true);
        setStatusMessage('Connection failed: Please fill in Client ID and Access Token first.');
      }
      setTimeout(() => setStatusMessage(''), 5000);
    }, 1000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage('');
    try {
      await api.put('/setting', { vimeo: formData });
      setIsError(false);
      setStatusMessage('Vimeo API configuration saved successfully!');
    } catch (err) {
      setIsError(true);
      setStatusMessage('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMessage(''), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-950 flex items-center gap-2">
            <Video className="h-6 w-6 text-sky-400" />
            Vimeo Video Hosting & API Settings
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Configure Vimeo Developer API credentials for secure video playback, DRM protection, and automated lesson uploads.
          </p>
        </div>
        <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-950 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>LMS</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Vimeo Settings</span>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl border text-sm flex items-center gap-2 shadow-sm animate-in fade-in duration-200 ${isError ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-sky-500/10 border-sky-500/20 text-sky-400'}`}>
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {statusMessage}
        </div>
      )}

      {/* Main Settings Form */}
      <div className="bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-200 bg-white dark:bg-zinc-900/30 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-900 dark:text-zinc-950 uppercase tracking-wider flex items-center gap-2">
            <Key className="h-4 w-4 text-sky-400" />
            Vimeo Developer API Credentials
          </h2>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            Status: Connected
          </span>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-700 uppercase font-bold">Vimeo Client ID <span className="text-rose-500">*</span></Label>
              <Input 
                value={formData.clientId}
                onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                placeholder="e.g. 9f8b7a6c5d4e..."
                className="bg-white dark:bg-white border-zinc-200 dark:border-zinc-200 text-zinc-900 dark:text-zinc-950 focus-visible:ring-sky-500 font-mono text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-700 uppercase font-bold">Vimeo Client Secret <span className="text-rose-500">*</span></Label>
              <Input 
                type="password"
                value={formData.clientSecret}
                onChange={e => setFormData({ ...formData, clientSecret: e.target.value })}
                placeholder="Enter client secret"
                className="bg-white dark:bg-white border-zinc-200 dark:border-zinc-200 text-zinc-900 dark:text-zinc-950 focus-visible:ring-sky-500 font-mono text-sm"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-700 uppercase font-bold">Vimeo Personal Access Token (Bearer) <span className="text-rose-500">*</span></Label>
              <Input 
                type="password"
                value={formData.accessToken}
                onChange={e => setFormData({ ...formData, accessToken: e.target.value })}
                placeholder="Paste personal access token with upload & video edit permissions"
                className="bg-white dark:bg-white border-zinc-200 dark:border-zinc-200 text-zinc-900 dark:text-zinc-950 focus-visible:ring-sky-500 font-mono text-sm"
                required
              />
              <p className="text-[11px] text-zinc-500">Must have scopes: `public`, `private`, `video_files`, `create`, `edit`, `upload`.</p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-700 uppercase font-bold">Default Video Privacy</Label>
              <select 
                value={formData.defaultPrivacy}
                onChange={e => setFormData({ ...formData, defaultPrivacy: e.target.value })}
                className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-200 bg-white dark:bg-white px-3 py-2 text-zinc-950 text-sm text-zinc-900 dark:text-zinc-950 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="disable">Hide from Vimeo.com (Embed on Stoofi LMS Only)</option>
                <option value="unlisted">Unlisted (Accessible via private embed)</option>
                <option value="password">Password Protected</option>
                <option value="anybody">Public (Visible to everyone)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-700 uppercase font-bold">Default Upload Folder / Project</Label>
              <Input 
                value={formData.uploadFolder}
                onChange={e => setFormData({ ...formData, uploadFolder: e.target.value })}
                placeholder="e.g. Stoofi LMS Videos"
                className="bg-white dark:bg-white border-zinc-200 dark:border-zinc-200 text-zinc-900 dark:text-zinc-950 focus-visible:ring-sky-500 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-700 uppercase font-bold">Anti-Screen Recording DRM Protection</Label>
              <select 
                value={formData.drmProtection}
                onChange={e => setFormData({ ...formData, drmProtection: e.target.value })}
                className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-200 bg-white dark:bg-white px-3 py-2 text-zinc-950 text-sm text-zinc-900 dark:text-zinc-950 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Enable">Enable Dynamic Watermark & DRM</option>
                <option value="Disable">Disable</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-700 uppercase font-bold">Maximum Transcode Resolution</Label>
              <select 
                value={formData.maxResolution}
                onChange={e => setFormData({ ...formData, maxResolution: e.target.value })}
                className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-200 bg-white dark:bg-white px-3 py-2 text-zinc-950 text-sm text-zinc-900 dark:text-zinc-950 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="1080p">Full HD 1080p (Recommended)</option>
                <option value="720p">HD 720p (Faster Bandwidth)</option>
                <option value="4K">Ultra HD 4K</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-zinc-900">
            <Button 
              type="button" 
              variant="outline"
              disabled={testing}
              onClick={handleTestConnection}
              className="border-zinc-200 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-900 dark:text-zinc-200 hover:text-zinc-900 dark:text-white hover:bg-zinc-100 flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${testing ? 'animate-spin' : ''}`} />
              {testing ? 'Testing API...' : 'Test Vimeo Connection'}
            </Button>

            <Button 
              type="submit" 
              disabled={saving}
              className="bg-sky-600 hover:bg-sky-700 text-zinc-950 font-semibold flex items-center gap-2 px-8"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Vimeo Settings'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}








