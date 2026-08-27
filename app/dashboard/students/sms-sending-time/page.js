'use client';

import EmptyPage from '@/components/EmptyPage';
import { Layers } from 'lucide-react';

export default function Page() {
  return <EmptyPage title="Sms Sending Time" description="Manage Sms Sending Time settings and data here." icon={Layers} />;
}
