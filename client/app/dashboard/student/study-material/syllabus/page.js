'use client';
import StudentDataTable from '@/components/student/StudentDataTable';

export default function Page() {
  return (
    <StudentDataTable 
      title="Syllabus List"
      breadcrumb={['Study Material', 'Syllabus']}
      columns={['Class', 'Subject', 'Title', 'Action']}
      showClassFilter={true}
      data={[]} 
    />
  );
}
