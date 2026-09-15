'use client';
import EmptyPage from '@/components/EmptyPage';
import { FolderOpen } from 'lucide-react';

export default function StudentStudyMaterialPage() {
  return <EmptyPage title="Study Material" description="Download lecture notes, syllabus guides, and reference documents." icon={FolderOpen} />;
}
