'use client';

import EmptyPage from '@/components/EmptyPage';
import { Layers } from 'lucide-react';

export default function Page() {
  return <EmptyPage title="Incident Wise" description="Manage Incident Wise settings and data here." icon={Layers} />;
}
