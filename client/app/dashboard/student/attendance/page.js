'use client';
import EmptyPage from '@/components/EmptyPage';
import { CheckSquare } from 'lucide-react';

export default function StudentAttendancePage() {
  return <EmptyPage title="Student Attendance" description="Detailed monthly and subject-wise attendance logs." icon={CheckSquare} />;
}
