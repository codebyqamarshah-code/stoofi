'use client';
import EmptyPage from '@/components/EmptyPage';
import { Award } from 'lucide-react';

export default function StudentMarksSheetPage() {
  return <EmptyPage title="Marks Sheet" description="Official academic transcript and subject-wise marksheets." icon={Award} />;
}
