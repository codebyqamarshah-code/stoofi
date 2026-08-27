'use client';

import EmptyPage from '@/components/EmptyPage';
import { Layers } from 'lucide-react';

export default function Page() {
  return <EmptyPage title="General" description="Manage General settings and data here." icon={Layers} />;
}
