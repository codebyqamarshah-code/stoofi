'use client';
import EmptyPage from '@/components/EmptyPage';
import { BookOpen } from 'lucide-react';

export default function StudentLibraryIssuedPage() {
  return <EmptyPage title="Issued Books" description="Check your currently borrowed books and return due dates." icon={BookOpen} />;
}
