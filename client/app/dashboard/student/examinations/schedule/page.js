'use client';
import StudentDataTable from '@/components/student/StudentDataTable';

export default function Page() {
  return (
    <StudentDataTable 
      title="Exam Schedule"
      breadcrumb={['Examinations', 'Exam Schedule']}
      columns={['Exam Name', 'Subject', 'Date', 'Time', 'Room']}
      showClassFilter={true}
      data={[]} 
    />
  );
}
