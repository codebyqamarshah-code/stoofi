'use client';

import Link from 'next/link';

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function VimeoSettingsPage() {
  const [sameApi, setSameApi] = useState('Yes');
  const [uploadType, setUploadType] = useState('Direct Upload');
  const [vimeoClient, setVimeoClient] = useState('');
  const [vimeoSecret, setVimeoSecret] = useState('');
  const [vimeoAccess, setVimeoAccess] = useState('');

  const RadioOption = ({ name, value, selected, onChange }) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <div
        onClick={() => onChange(value)}
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
          selected === value ? 'border-emerald-500 bg-emerald-500' : 'border-zinc-500'
        }`}
      >
        {selected === value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
      <span className="text-sm text-zinc-300">{value}</span>
    </label>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Vimeo Settings</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>LMS</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/settings/general" className="hover:text-emerald-400 transition-colors">Settings</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-500">Vimeo Settings</span>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 text-center">
          <h2 className="text-base font-semibold text-white">Vimeo Settings</h2>
        </div>
        <div className="p-6 space-y-6">

          {/* Same API for all user */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Same API for All User</Label>
              <div className="flex items-center gap-6">
                <RadioOption name="sameApi" value="Yes" selected={sameApi} onChange={setSameApi} />
                <RadioOption name="sameApi" value="No" selected={sameApi} onChange={setSameApi} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Vimeo Client <span className="text-rose-500">*</span></Label>
              <Input
                type="password"
                value={vimeoClient}
                onChange={(e) => setVimeoClient(e.target.value)}
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500"
              />
            </div>
          </div>

          {/* Vimeo Secret & Access */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Vimeo Secret <span className="text-rose-500">*</span></Label>
              <Input
                type="password"
                value={vimeoSecret}
                onChange={(e) => setVimeoSecret(e.target.value)}
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Vimeo Access <span className="text-rose-500">*</span></Label>
              <Input
                type="password"
                value={vimeoAccess}
                onChange={(e) => setVimeoAccess(e.target.value)}
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500"
              />
            </div>
          </div>

          {/* Upload Type */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Vimeo Video Upload Type</Label>
            <div className="flex items-center gap-8">
              <RadioOption name="uploadType" value="Direct Upload" selected={uploadType} onChange={setUploadType} />
              <RadioOption name="uploadType" value="Form List" selected={uploadType} onChange={setUploadType} />
            </div>
          </div>

          {/* Info Text */}
          <div className="space-y-1.5 text-xs">
            <p className="text-emerald-500 hover:underline cursor-pointer">Click Here to Get Vimeo Api Key | Scopes need to allow public,private,edit,upload</p>
            <p className="text-emerald-500 hover:underline cursor-pointer">For Secure, Change Privacy to Hide From Vimeo</p>
            <p className="text-emerald-500 hover:underline cursor-pointer">Where can the video be embedded? Set Use Specific domains &amp; register your domain without http/https</p>
            <p className="text-zinc-500">Direct upload is not allow for Vimeo basic plan</p>
          </div>

          {/* Update Button */}
          <div className="flex justify-center pt-2">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-10">
              UPDATE
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
