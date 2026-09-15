'use client';
import StudentDataTable from '@/components/student/StudentDataTable';

export default function Page() {
  return (
    <StudentDataTable 
      title="Assignment List"
      breadcrumb={['Study Material', 'Assignment']}
      columns={['Title', 'Subject', 'Deadline', 'Status', 'Action']}
      showClassFilter={True}
      data={[]} 
    />
  );
}
