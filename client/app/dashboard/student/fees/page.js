'use client';
import StudentDataTable from '@/components/student/StudentDataTable';

export default function Page() {
  return (
    <StudentDataTable 
      title="Fees Invoice"
      breadcrumb={['Fees', 'Fees Invoice']}
      columns={['SL', 'Student', 'Class(Section)', 'Amount', 'Waiver', 'Fine', 'Paid', 'Balance', 'Status', 'Date']}
      showClassFilter={True}
      data={[]} 
    />
  );
}
