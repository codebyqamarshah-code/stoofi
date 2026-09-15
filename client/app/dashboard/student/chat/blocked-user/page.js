'use client';
import StudentDataTable from '@/components/student/StudentDataTable';

export default function Page() {
  return (
    <StudentDataTable 
      title="Blocked Users"
      breadcrumb={['Chat', 'Blocked User']}
      columns={['User', 'Role', 'Date Blocked', 'Action']}
      showClassFilter={False}
      data={[]} 
    />
  );
}
