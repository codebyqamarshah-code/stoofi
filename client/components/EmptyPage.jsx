'use client';
import React from 'react';
import { Sparkles } from 'lucide-react';

export default function EmptyPage({ title = "Coming Soon", description = "This feature is currently under development.", icon: Icon = Sparkles }) {
  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-center text-center bg-white min-h-[calc(100vh-80px)] rounded-xl m-4 border border-zinc-100 shadow-sm">
      <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
        <Icon size={32} />
      </div>
      <h2 className="text-2xl font-bold text-zinc-900 mb-2">{title}</h2>
      <p className="text-zinc-500 max-w-md">{description}</p>
    </div>
  );
}
