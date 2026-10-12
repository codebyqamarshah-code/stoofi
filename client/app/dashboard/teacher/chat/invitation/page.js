'use client';
import StudentDataTable from '@/components/student/StudentDataTable';

export default function TeacherChatInvitationPage() {
  return (
    <StudentDataTable 
      title="Chat Invitations"
      breadcrumb={['Chat', 'Invitation']}
      columns={['User', 'Role', 'Status', 'Action']}
      showClassFilter={false}
      data={[]} 
    />
  );
}
