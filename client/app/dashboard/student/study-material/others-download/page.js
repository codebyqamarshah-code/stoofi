'use client';
import StudentDataTable from '@/components/student/StudentDataTable';

export default function Page() {
  return (
    <StudentDataTable 
      title="Others Download"
      breadcrumb={['Study Material', 'Others Download']}
      columns={['Title', 'Description', 'Date', 'Action']}
      showClassFilter={false}
      data={[]} 
    />
  );
}
