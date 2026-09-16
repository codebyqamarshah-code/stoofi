'use client';
import StudentDataTable from '@/components/student/StudentDataTable';

export default function Page() {
  return (
    <StudentDataTable 
      title="Apply Leave"
      breadcrumb={['Leave', 'Apply Leave']}
      columns={['Leave Type', 'From', 'To', 'Reason', 'Status', 'Action']}
      showClassFilter={false}
      data={[]} 
    />
  );
}
