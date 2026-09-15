'use client';
import StudentDataTable from '@/components/student/StudentDataTable';

export default function Page() {
  return (
    <StudentDataTable 
      title="Purchase History"
      breadcrumb={['LMS', 'Purchase History']}
      columns={['Course', 'Student', 'Paid Amount', 'Instructor', 'Payment Method', 'Purchase Date', 'Status']}
      showClassFilter={False}
      data={[]} 
    />
  );
}
