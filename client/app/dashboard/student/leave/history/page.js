'use client';
import EmptyPage from '@/components/EmptyPage';
import { FileSpreadsheet } from 'lucide-react';

export default function StudentLeaveHistoryPage() {
  return <EmptyPage title="Leave History" description="Check approval status and history of your leave applications." icon={FileSpreadsheet} />;
}
