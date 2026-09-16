'use client';
import EmptyPage from '@/components/EmptyPage';
import { Settings } from 'lucide-react';
export default function Page() {
  return <EmptyPage title="Role and Permission" description="Manage admin roles and their system permissions." icon={Settings} />;
}
