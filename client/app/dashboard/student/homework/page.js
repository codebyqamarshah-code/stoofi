'use client';
import EmptyPage from '@/components/EmptyPage';
import { ListTodo } from 'lucide-react';

export default function StudentHomeworkPage() {
  return <EmptyPage title="Homework List" description="Track your assigned homework, submission deadlines, and evaluation feedback." icon={ListTodo} />;
}
