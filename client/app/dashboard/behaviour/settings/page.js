'use client';

import Link from 'next/link';

import React, { useState } from 'react';
import { ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BehaviourSettingsPage() {
  const [commentOption, setCommentOption] = useState('');
  const [viewOption, setViewOption] = useState('');
  const [commentSaved, setCommentSaved] = useState(false);
  const [viewSaved, setViewSaved] = useState(false);

  const handleCommentSave = () => {
    setCommentSaved(true);
    setTimeout(() => setCommentSaved(false), 2000);
  };

  const handleViewSave = () => {
    setViewSaved(true);
    setTimeout(() => setViewSaved(false), 2000);
  };

  const RadioOption = ({ name, value, current, onChange, label }) => (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div
        onClick={() => onChange(value)}
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
          current === value ? 'border-zinc-600' : 'border-zinc-600 group-hover:border-zinc-400'
        }`}
      >
        {current === value && <div className="w-2 h-2 rounded-full bg-zinc-600" />}
      </div>
      <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors select-none">{label}</span>
    </label>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Setting</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/behaviour/incidents" className="hover:text-zinc-500 transition-colors">Behaviour Records</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-600">Setting</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Incident Comment Setting */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-zinc-800">
            <h2 className="text-lg font-bold text-white">Incident Comment Setting</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold text-zinc-400 uppercase">Comment Option</p>
              <div className="flex items-center gap-6">
                <RadioOption
                  value="student"
                  current={commentOption}
                  onChange={setCommentOption}
                  label="Student Comment"
                />
                <RadioOption
                  value="parent"
                  current={commentOption}
                  onChange={setCommentOption}
                  label="Parent Comment"
                />
              </div>
            </div>
            <Button
              onClick={handleCommentSave}
              className={`font-semibold transition-all duration-300 ${
                commentSaved
                  ? 'bg-zinc-800 hover:bg-zinc-800 text-white'
                  : 'bg-zinc-800 hover:bg-zinc-800 text-white'
              }`}
            >
              {commentSaved ? (
                <><Check className="h-4 w-4 mr-2" /> SAVED!</>
              ) : 'SAVE'}
            </Button>
          </div>
        </div>

        {/* Incident View Setting */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-zinc-800">
            <h2 className="text-lg font-bold text-white">Incident View Setting</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold text-zinc-400 uppercase">View Option</p>
              <div className="flex items-center gap-6">
                <RadioOption
                  value="student"
                  current={viewOption}
                  onChange={setViewOption}
                  label="Student View"
                />
                <RadioOption
                  value="parent"
                  current={viewOption}
                  onChange={setViewOption}
                  label="Parent View"
                />
              </div>
            </div>
            <Button
              onClick={handleViewSave}
              className={`font-semibold transition-all duration-300 ${
                viewSaved
                  ? 'bg-zinc-800 hover:bg-zinc-800 text-white'
                  : 'bg-zinc-800 hover:bg-zinc-800 text-white'
              }`}
            >
              {viewSaved ? (
                <><Check className="h-4 w-4 mr-2" /> SAVED!</>
              ) : 'SAVE'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
