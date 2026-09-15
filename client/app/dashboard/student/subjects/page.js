'use client';
import EmptyPage from '@/components/EmptyPage';
import { BookOpen } from 'lucide-react';

export default function StudentSubjectsPage() {
  return <EmptyPage title="My Subjects" description="List of all enrolled academic subjects, codes, and subject teachers." icon={BookOpen} />;
}
