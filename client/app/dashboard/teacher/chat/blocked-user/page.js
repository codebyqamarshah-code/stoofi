'use client';
import StudentDataTable from '@/components/student/StudentDataTable';

export default function TeacherChatBlockedUserPage() {
  return (
    <StudentDataTable 
      title="Blocked Users"
      breadcrumb={['Chat', 'Blocked User']}
      columns={['User', 'Role', 'Date Blocked', 'Action']}
      showClassFilter={false}
      data={[]} 
    />
  );
}
