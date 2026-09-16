'use client';
import EmptyPage from '@/components/EmptyPage';
import { BookOpen } from 'lucide-react';
export default function Page() {
  return <EmptyPage title="Homework" description="Assign and track student homework tasks." icon={BookOpen} />;
}
