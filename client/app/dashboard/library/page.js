'use client';
import EmptyPage from '@/components/EmptyPage';
import { BookOpen } from 'lucide-react';
export default function Page() {
  return <EmptyPage title="Library" description="Manage books, issues, and library members." icon={BookOpen} />;
}
