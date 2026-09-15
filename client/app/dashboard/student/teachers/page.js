'use client';
import EmptyPage from '@/components/EmptyPage';
import { Users } from 'lucide-react';

export default function StudentTeachersPage() {
  return <EmptyPage title="Assigned Teachers" description="View contact and department details of your class teachers." icon={Users} />;
}
