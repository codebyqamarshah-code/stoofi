'use client';
import EmptyPage from '@/components/EmptyPage';
import { MessageSquare } from 'lucide-react';

export default function TeacherChatPage() {
  return <EmptyPage title="Teacher Messaging & AI Assistant" description="Direct communication portal with students, parents, and AI academic assistance." icon={MessageSquare} />;
}
