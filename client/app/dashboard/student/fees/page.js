'use client';
import EmptyPage from '@/components/EmptyPage';
import { DollarSign } from 'lucide-react';

export default function StudentFeesPage() {
  return <EmptyPage title="Fees & Invoices" description="Check your tuition fees, payment history, and pending dues." icon={DollarSign} />;
}
