'use client';
import StudentDataTable from '@/components/student/StudentDataTable';

export default function Page() {
  return (
    <StudentDataTable 
      title="Lesson Plan Overview"
      breadcrumb={['Lesson Plan', 'Overview']}
      columns={['Subject', 'Completed Topics', 'Pending Topics', 'Progress']}
      showClassFilter={true}
      data={[]} 
    />
  );
}
