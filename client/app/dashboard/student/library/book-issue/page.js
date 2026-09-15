'use client';
import StudentDataTable from '@/components/student/StudentDataTable';

export default function Page() {
  return (
    <StudentDataTable 
      title="Issued Books"
      breadcrumb={['Library', 'Book Issue']}
      columns={['Book Title', 'Issue Date', 'Return Date', 'Status']}
      showClassFilter={False}
      data={[]} 
    />
  );
}
