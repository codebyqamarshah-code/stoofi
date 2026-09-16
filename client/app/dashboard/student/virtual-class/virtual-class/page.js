'use client';
import StudentDataTable from '@/components/student/StudentDataTable';

export default function Page() {
  return (
    <StudentDataTable 
      title="Virtual Class List"
      breadcrumb={['Virtual Class', 'Virtual Class']}
      columns={['Topic', 'Teacher', 'Date', 'Time', 'Meeting Link']}
      showClassFilter={true}
      data={[]} 
    />
  );
}
