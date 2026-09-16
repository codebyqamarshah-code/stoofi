'use client';
import StudentDataTable from '@/components/student/StudentDataTable';

export default function Page() {
  return (
    <StudentDataTable 
      title="My Course"
      breadcrumb={['LMS', 'My Course']}
      columns={['Course Name', 'Instructor', 'Progress', 'Status']}
      showClassFilter={false}
      data={[]} 
    />
  );
}
