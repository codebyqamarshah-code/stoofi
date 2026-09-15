'use client';
import EmptyPage from '@/components/EmptyPage';
import { Building } from 'lucide-react';

export default function StudentDormitoryPage() {
  return <EmptyPage title="Dormitory & Hostel" description="Hostel room allocation, hall details, and warden contacts." icon={Building} />;
}
