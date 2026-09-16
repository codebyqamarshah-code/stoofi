'use client';
import EmptyPage from '@/components/EmptyPage';
import { DollarSign } from 'lucide-react';
export default function Page() {
  return <EmptyPage title="LMS Fees Invoice" description="Manage LMS-specific fee invoices." icon={DollarSign} />;
}
