'use client';
import StudentDataTable from '@/components/student/StudentDataTable';

export default function Page() {
  return (
    <StudentDataTable 
      title="Online Exam Results"
      breadcrumb={['Online Exam', 'View Result']}
      columns={['Exam Title', 'Score', 'Total Marks', 'Date Taken', 'Status']}
      showClassFilter={true}
      data={[]} 
    />
  );
}
