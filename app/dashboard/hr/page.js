'use client';
import EmptyPage from '@/components/EmptyPage';
import { Users } from 'lucide-react';
export default function Page() {
  return <EmptyPage title="Human Resource" description="Manage employee profiles, payroll, and HR records." icon={Users} />;
}
