'use client';
import StudentDataTable from '@/components/student/StudentDataTable';

export default function Page() {
  return (
    <StudentDataTable 
      title="My Certificates"
      breadcrumb={['LMS', 'My Certificates']}
      columns={['Certificate Name', 'Course', 'Date Issued', 'Action']}
      showClassFilter={false}
      data={[]} 
    />
  );
}
