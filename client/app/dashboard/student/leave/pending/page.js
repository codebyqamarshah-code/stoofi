'use client';
import StudentDataTable from '@/components/student/StudentDataTable';

export default function Page() {
  return (
    <StudentDataTable 
      title="Pending Leave Request"
      breadcrumb={['Leave', 'Pending Leave Request']}
      columns={['Leave Type', 'Apply Date', 'Status']}
      showClassFilter={False}
      data={[]} 
    />
  );
}
