'use client';
import EmptyPage from '@/components/EmptyPage';
import { CalendarDays } from 'lucide-react';

export default function StudentClassRoutinePage() {
  return <EmptyPage title="Class Routine" description="View your daily period-wise timetable and class routine." icon={CalendarDays} />;
}
