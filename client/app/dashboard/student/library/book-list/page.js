'use client';
import StudentDataTable from '@/components/student/StudentDataTable';

export default function Page() {
  return (
    <StudentDataTable 
      title="Book List"
      breadcrumb={['Library', 'Book List']}
      columns={['Book No', 'Title', 'Author', 'Publisher', 'Availability']}
      showClassFilter={False}
      data={[]} 
    />
  );
}
