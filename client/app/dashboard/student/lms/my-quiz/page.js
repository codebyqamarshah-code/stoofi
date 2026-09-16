'use client';
import StudentDataTable from '@/components/student/StudentDataTable';

export default function Page() {
  return (
    <StudentDataTable 
      title="My Quiz"
      breadcrumb={['LMS', 'My Quiz']}
      columns={['Quiz Name', 'Course', 'Score', 'Status']}
      showClassFilter={false}
      data={[]} 
    />
  );
}
