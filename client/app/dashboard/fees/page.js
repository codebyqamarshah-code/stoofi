'use client';
import EmptyPage from '@/components/EmptyPage';
import { DollarSign } from 'lucide-react';
export default function Page() {
  return <EmptyPage title="Fees Collection" description="Manage fee structures and record payments." icon={DollarSign} />;
}
