'use client';
import EmptyPage from '@/components/EmptyPage';
import { CalendarDays } from 'lucide-react';
export default function Page() {
  return <EmptyPage title="Exam Plan" description="Plan exam schedules and timetables." icon={CalendarDays} />;
}
