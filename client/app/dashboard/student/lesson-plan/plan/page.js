'use client';
import StudentDataTable from '@/components/student/StudentDataTable';

export default function Page() {
  return (
    <StudentDataTable 
      title="Lesson Plan"
      breadcrumb={['Lesson Plan', 'Lesson Plan']}
      columns={['Subject', 'Topic', 'Date', 'Status']}
      showClassFilter={true}
      data={[]} 
    />
  );
}
