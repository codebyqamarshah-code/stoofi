'use client';
import EmptyPage from '@/components/EmptyPage';
import { FileSpreadsheet } from 'lucide-react';

export default function StudentLeaveApplyPage() {
  return <EmptyPage title="Apply Leave" description="Submit leave application request to class teacher." icon={FileSpreadsheet} />;
}
