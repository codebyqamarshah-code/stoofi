'use client';
import EmptyPage from '@/components/EmptyPage';
import { Award } from 'lucide-react';

export default function StudentExamSchedulePage() {
  return <EmptyPage title="Exam Schedule" description="Terminal and mid-term exam dates, timing, and room numbers." icon={Award} />;
}
