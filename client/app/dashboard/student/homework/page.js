'use client';
import { useState, useEffect } from 'react';
import StudentDataTable from '@/components/student/StudentDataTable';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

export default function Page() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomework = async () => {
      try {
        setLoading(true);
        const res = await api.get('/homework');
        if (res?.success && Array.isArray(res.data)) {
          const normalize = (val) => String(val || '').replace(/^(Class|Section)\s*/i, '').trim().toLowerCase();
          
          // Filter homework for this student's class and section (or show all class homework if matching)
          const myHomework = res.data.filter(h => {
            if (!user?.className) return true; // Show all if admin or unassigned
            const classMatch = normalize(h.className) === normalize(user.className);
            const sectionMatch = !user.section || normalize(h.section) === normalize(user.section);
            return classMatch && sectionMatch;
          });
          
          const mapped = myHomework.map(h => ({
            id: h._id,
            Subject: h.subject || '-',
            Topic: h.description || '-',
            Deadline: h.submissionDate ? new Date(h.submissionDate).toLocaleDateString() : 'No deadline',
            Status: h.submissionDate && new Date(h.submissionDate) < new Date() ? 'Overdue' : 'Active / Pending',
            Attachment: h.file ? (
              <a href={h.file.startsWith('http') ? h.file : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${h.file}`} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline font-semibold flex items-center gap-1">
                Open Attachment
              </a>
            ) : '-'
          }));
          
          setData(mapped);
        }
      } catch (err) {
        console.error("Error fetching homework:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomework();
  }, [user]);

  return (
    <StudentDataTable 
      title="My Assigned Homework"
      breadcrumb={['Homework', 'Student Tasks']}
      columns={['Subject', 'Topic', 'Deadline', 'Status', 'Attachment']}
      showClassFilter={false}
      data={data} 
    />
  );
}
