'use client';
import EmptyPage from '@/components/EmptyPage';
import { BookMarked } from 'lucide-react';

export default function StudentLessonPlanPage() {
  return <EmptyPage title="Lesson Plan" description="Review upcoming weekly lesson topics, objectives, and chapter outlines." icon={BookMarked} />;
}
