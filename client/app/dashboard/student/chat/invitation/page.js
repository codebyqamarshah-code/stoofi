'use client';
import StudentDataTable from '@/components/student/StudentDataTable';

export default function Page() {
  return (
    <StudentDataTable 
      title="Chat Invitations"
      breadcrumb={['Chat', 'Invitation']}
      columns={['User', 'Role', 'Status', 'Action']}
      showClassFilter={False}
      data={[]} 
    />
  );
}
