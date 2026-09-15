'use client';
import EmptyPage from '@/components/EmptyPage';
import { Award } from 'lucide-react';

export default function StudentExamResultPage() {
  return <EmptyPage title="Exam Result" description="View published examination marks and GPA standings." icon={Award} />;
}
