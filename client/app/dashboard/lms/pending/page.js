'use client';
import EmptyPage from '@/components/EmptyPage';
import { Layers } from 'lucide-react';
export default function Page() {
  return <EmptyPage title="Pending Course" description="Review and approve courses awaiting activation." icon={Layers} />;
}
