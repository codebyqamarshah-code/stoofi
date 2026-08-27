'use client';
import EmptyPage from '@/components/EmptyPage';
import { Video } from 'lucide-react';
export default function Page() {
  return <EmptyPage title="Vimeo Settings" description="Configure Vimeo integration for video hosting." icon={Video} />;
}
