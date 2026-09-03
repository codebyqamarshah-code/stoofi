'use client';
import EmptyPage from '@/components/EmptyPage';
import { GraduationCap } from 'lucide-react';
export default function Page() {
  return <EmptyPage title="Student Admission" description="Register new students with full admission details." icon={GraduationCap} />;
}
