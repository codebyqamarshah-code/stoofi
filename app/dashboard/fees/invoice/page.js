'use client';

import EmptyPage from '@/components/EmptyPage';
import { Layers } from 'lucide-react';

export default function Page() {
  return <EmptyPage title="Invoice" description="Manage Invoice settings and data here." icon={Layers} />;
}
