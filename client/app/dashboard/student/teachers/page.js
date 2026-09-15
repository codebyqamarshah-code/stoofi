'use client';
import StudentDataTable from '@/components/student/StudentDataTable';

export default function Page() {
  return (
    <StudentDataTable 
      title="Teachers Directory"
      breadcrumb={['Teachers']}
      columns={['Teacher Name', 'Department', 'Phone', 'Email']}
      showClassFilter={True}
      data={[]} 
    />
  );
}
