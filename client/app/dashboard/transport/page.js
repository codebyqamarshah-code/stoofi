'use client';
import EmptyPage from '@/components/EmptyPage';
import { BookOpen } from 'lucide-react';
export default function Page() {
  return <EmptyPage title="Transport" description="Manage school routes, buses, and student transport." icon={BookOpen} />;
}
