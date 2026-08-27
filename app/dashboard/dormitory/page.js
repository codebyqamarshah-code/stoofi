'use client';
import EmptyPage from '@/components/EmptyPage';
import { BookOpen } from 'lucide-react';
export default function Page() {
  return <EmptyPage title="Dormitory" description="Manage hostel rooms, beds, and student accommodation." icon={BookOpen} />;
}
