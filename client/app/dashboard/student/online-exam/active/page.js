'use client';
import StudentDataTable from '@/components/student/StudentDataTable';

export default function Page() {
  return (
    <StudentDataTable 
      title="Active Online Exams"
      breadcrumb={['Online Exam', 'Active Exams']}
      columns={['Exam Title', 'Subject', 'Duration', 'End Date', 'Action']}
      showClassFilter={true}
      data={[]} 
    />
  );
}
