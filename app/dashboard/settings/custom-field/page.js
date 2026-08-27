'use client';

import EmptyPage from '@/components/EmptyPage';
import { Layers } from 'lucide-react';

export default function Page() {
  return <EmptyPage title="Custom Field" description="Manage Custom Field settings and data here." icon={Layers} />;
}
