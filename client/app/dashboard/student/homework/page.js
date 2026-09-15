'use client';
import StudentDataTable from '@/components/student/StudentDataTable';

export default function Page() {
  return (
    <StudentDataTable 
      title="Pending Homework"
      breadcrumb={['Homework']}
      columns={['Subject', 'Topic', 'Deadline', 'Status']}
      showClassFilter={True}
      data={[]} 
    />
  );
}
