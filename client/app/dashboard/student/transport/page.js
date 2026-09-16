'use client';
import EmptyPage from '@/components/EmptyPage';
import { Building } from 'lucide-react';

export default function StudentTransportPage() {
  return <EmptyPage title="Transport Details" description="School bus route, pickup point, vehicle number, and driver contact info." icon={Building} />;
}
