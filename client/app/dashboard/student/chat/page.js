'use client';
import EmptyPage from '@/components/EmptyPage';
import { MessageSquare } from 'lucide-react';

export default function StudentChatPage() {
  return <EmptyPage title="Student Messaging & Chat" description="Direct communication portal with subject teachers and school administration." icon={MessageSquare} />;
}
