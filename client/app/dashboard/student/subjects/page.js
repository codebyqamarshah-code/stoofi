'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen } from 'lucide-react';

export default function StudentSubjectsPage() {
  const { user } = useAuth();
  const subjects = user?.subjects || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl font-bold text-zinc-900">My Subjects</h1>
        <div className="text-sm font-medium text-zinc-500 flex items-center gap-2">
          <Link href="/dashboard/student" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
          <span className="text-zinc-950">|</span>
          <span className="text-zinc-900">Subjects</span>
        </div>
      </div>

      {/* Info Banner */}
      {user?.className && (
        <div className="bg-white text-zinc-950 rounded-2xl p-4 flex flex-wrap items-center gap-4 text-sm font-medium">
          <div className="flex items-center gap-2">
            <span className="opacity-60">Class:</span>
            <span className="font-bold">{user.className}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="opacity-60">Section:</span>
            <span className="font-bold">{user.section}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="opacity-60">Total Subjects:</span>
            <span className="font-bold">{subjects.length}</span>
          </div>
        </div>
      )}

      {/* Subjects Grid */}
      {subjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subj, idx) => (
            <div key={idx} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-zinc-100">
                <BookOpen className="w-5 h-5 text-zinc-700" />
              </div>
              <div>
                <div className="text-base font-bold text-zinc-900">{subj}</div>
                <div className="text-xs text-zinc-400 mt-0.5">Subject #{idx + 1}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center shadow-sm">
          <BookOpen className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-zinc-500 mb-2">No Subjects Assigned</h3>
          <p className="text-sm text-zinc-400">
            Your subjects were not set during registration. Please contact your administrator to have your subjects assigned.
          </p>
        </div>
      )}
    </div>
  );
}
