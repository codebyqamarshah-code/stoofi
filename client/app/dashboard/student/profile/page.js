'use client';
import EmptyPage from '@/components/EmptyPage';
import { User } from 'lucide-react';

export default function StudentProfilePage() {
  return <EmptyPage title="My Profile" description="View and update your personal student profile details." icon={User} />;
}
