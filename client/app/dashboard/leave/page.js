'use client';
import EmptyPage from '@/components/EmptyPage';
import { CalendarDays } from 'lucide-react';
export default function Page() {
  return <EmptyPage title="Leave Management" description="Manage staff and teacher leave applications." icon={CalendarDays} />;
}
