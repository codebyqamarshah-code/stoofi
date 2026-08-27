'use client';

import EmptyPage from '@/components/EmptyPage';
import { Layers } from 'lucide-react';

export default function Page() {
  return <EmptyPage title="Unassigned" description="Manage Unassigned settings and data here." icon={Layers} />;
}
