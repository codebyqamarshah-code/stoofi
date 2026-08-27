'use client';

import EmptyPage from '@/components/EmptyPage';
import { Layers } from 'lucide-react';

export default function Page() {
  return <EmptyPage title="Bank Payment" description="Manage Bank Payment settings and data here." icon={Layers} />;
}
