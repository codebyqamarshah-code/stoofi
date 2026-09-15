'use client';
import StudentDataTable from '@/components/student/StudentDataTable';

export default function Page() {
  return (
    <StudentDataTable 
      title="Attendance Record"
      breadcrumb={['Attendance']}
      columns={['Date', 'Status', 'Remarks']}
      showClassFilter={True}
      data={[]} 
    />
  );
}
