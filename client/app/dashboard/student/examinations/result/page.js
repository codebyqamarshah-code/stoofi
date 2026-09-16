'use client';
import StudentDataTable from '@/components/student/StudentDataTable';

export default function Page() {
  return (
    <StudentDataTable 
      title="Exam Results"
      breadcrumb={['Examinations', 'Result']}
      columns={['Exam', 'Subject', 'Marks Obtained', 'Grade']}
      showClassFilter={true}
      data={[]} 
    />
  );
}
