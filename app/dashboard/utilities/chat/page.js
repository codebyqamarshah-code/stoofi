'use client';

import EmptyPage from '@/components/EmptyPage';
import { Layers } from 'lucide-react';

export default function Page() {
  return <EmptyPage title="Chat" description="Manage Chat settings and data here." icon={Layers} />;
}
