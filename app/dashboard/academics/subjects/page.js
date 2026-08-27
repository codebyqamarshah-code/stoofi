'use client';
import EmptyPage from '@/components/EmptyPage';
import { BookOpen } from 'lucide-react';
export default function Page() {
  return <EmptyPage title="Subjects" description="View and manage all academic subjects." icon={BookOpen} />;
}
