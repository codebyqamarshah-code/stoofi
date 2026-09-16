'use client';
import StudentDataTable from '@/components/student/StudentDataTable';

export default function Page() {
  return (
    <StudentDataTable 
      title="Course List"
      breadcrumb={['LMS', 'Course']}
      columns={['SL', 'Course Name', 'Instructor', 'Price']}
      showClassFilter={true}
      data={[]} 
    />
  );
}
