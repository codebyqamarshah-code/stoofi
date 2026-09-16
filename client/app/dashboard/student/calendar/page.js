'use client';
import EmptyPage from '@/components/EmptyPage';
import { CalendarDays } from 'lucide-react';

export default function StudentCalendarPage() {
  return <EmptyPage title="Academic Calendar" description="Upcoming school events, notice board announcements, and holidays." icon={CalendarDays} />;
}
