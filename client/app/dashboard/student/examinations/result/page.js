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
    const fetchResults = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const res = await api.get('/marks-register');
        if (res?.success && Array.isArray(res.data)) {
          const normalize = (val) => String(val || '').replace(/^(Class|Section)\s*/i, '').trim().toLowerCase();
          // Filter by student's class + section
          const myResults = res.data.filter(r => {
            if (!user.className) return true;
            return normalize(r.className) === normalize(user.className) &&
              (!user.section || normalize(r.section) === normalize(user.section));
          });
          const mapped = myResults.map(r => ({
            Exam: r.examName || r.examType || '-',
            Subject: r.subject || '-',
            'Marks Obtained': r.marksObtained != null ? `${r.marksObtained} / ${r.totalMarks || '-'}` : '-',
            Grade: r.grade || (r.marksObtained && r.totalMarks
              ? (r.marksObtained / r.totalMarks >= 0.9 ? 'A+' :
                 r.marksObtained / r.totalMarks >= 0.8 ? 'A' :
                 r.marksObtained / r.totalMarks >= 0.7 ? 'B' :
                 r.marksObtained / r.totalMarks >= 0.6 ? 'C' :
                 r.marksObtained / r.totalMarks >= 0.5 ? 'D' : 'F')
              : '-')
          }));
          setData(mapped);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error('Error fetching results:', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [user]);

  return (
    <StudentDataTable
      title="Exam Results"
      breadcrumb={['Examinations', 'Result']}
      columns={['Exam', 'Subject', 'Marks Obtained', 'Grade']}
      showClassFilter={false}
      data={data}
    />
  );
}
