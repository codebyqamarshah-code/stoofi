'use client';
import { useState, useEffect } from 'react';
import StudentDataTable from '@/components/student/StudentDataTable';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

export default function Page() {
  const { user } = useAuth();
  const [data, setData] = useState([]);

  useEffect(() => {
    if (user?.className && user?.section) {
      api.get('/homework').then(res => {
        if (res.success) {
          // Filter homework for this student's class and section
          const myHomework = res.data.filter(
            h => h.className === user.className && h.section === user.section
          );
          
          const mapped = myHomework.map(h => ({
            id: h._id,
            Subject: h.subject || '-',
            Topic: h.description || '-',
            Deadline: new Date(h.submissionDate).toLocaleDateString(),
            Status: new Date(h.submissionDate) < new Date() ? 'Overdue' : 'Pending',
            Attachment: h.file ? (
              <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${h.file}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-semibold flex items-center gap-1">
                Open File
              </a>
            ) : '-'
          }));
          
          setData(mapped);
        }
      }).catch(err => console.error("Error fetching homework:", err));
    }
  }, [user]);

  return (
    <StudentDataTable 
      title="Pending Homework"
      breadcrumb={['Homework']}
      columns={['Subject', 'Topic', 'Deadline', 'Status', 'Attachment']}
      showClassFilter={false}
      data={data} 
    />
  );
}
