'use client';
import EmptyPage from '@/components/EmptyPage';
import { BookOpen } from 'lucide-react';

export default function StudentLibraryBooksPage() {
  return <EmptyPage title="Library Book Catalog" description="Search available library books, authors, and rack numbers." icon={BookOpen} />;
}
