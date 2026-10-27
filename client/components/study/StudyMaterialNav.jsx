'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  UploadCloud, 
  FileCheck2, 
  BookOpen, 
  Download,
  FolderGit2
} from 'lucide-react';

const studyRoutes = [
  {
    name: 'Upload Content',
    href: '/dashboard/study/upload',
    icon: UploadCloud,
    description: 'Central upload hub for all materials'
  },
  {
    name: 'Assignment',
    href: '/dashboard/study/assignment',
    icon: FileCheck2,
    badge: 'Grading'
  },
  {
    name: 'Syllabus',
    href: '/dashboard/study/syllabus',
    icon: BookOpen,
    badge: 'Curriculum'
  },
  {
    name: 'Other Downloads',
    href: '/dashboard/study/downloads',
    icon: Download,
    badge: 'Resources'
  },
];

export default function StudyMaterialNav({ stats }) {
  const pathname = usePathname();

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-1.5 shadow-xs overflow-x-auto">
      <nav className="flex space-x-1 min-w-max" aria-label="Study Material navigation">
        {studyRoutes.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          let count = null;
          if (stats) {
            if (tab.name === 'Upload Content') count = stats.totalContents;
            else if (tab.name === 'Assignment') count = stats.totalAssignments;
            else if (tab.name === 'Syllabus') count = stats.totalSyllabi;
            else if (tab.name === 'Other Downloads') count = stats.totalDownloads;
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                isActive
                  ? 'bg-[#009966] text-white shadow-xs font-bold'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
              <span>{tab.name}</span>
              {count !== null && count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-zinc-200 text-zinc-700'
                }`}>
                  {count}
                </span>
              )}
              {tab.badge && !count && (
                <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-emerald-50 text-[#009966] border border-emerald-200'
                }`}>
                  {tab.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
