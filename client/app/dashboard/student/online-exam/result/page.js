'use client';
import EmptyPage from '@/components/EmptyPage';
import { Monitor } from 'lucide-react';

export default function StudentOnlineExamResultPage() {
  return <EmptyPage title="Online Exam Result" description="Online test scores and question-by-question analysis." icon={Monitor} />;
}
