'use client';
import EmptyPage from '@/components/EmptyPage';
import { Award } from 'lucide-react';
export default function Page() {
  return <EmptyPage title="Examination" description="Manage exams, mark sheets, and results." icon={Award} />;
}
