'use client';
import EmptyPage from '@/components/EmptyPage';
import { BookMarked } from 'lucide-react';

export default function StudentLessonPlanOverviewPage() {
  return <EmptyPage title="Lesson Plan Overview" description="Curriculum progress and term-wise completion status." icon={BookMarked} />;
}
