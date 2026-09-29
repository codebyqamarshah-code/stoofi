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
    const fetchSchedule = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const res = await api.get('/exam-schedule');
        if (res?.success && Array.isArray(res.data)) {
          const normalize = (val) => String(val || '').replace(/^(Class|Section)\s*/i, '').trim().toLowerCase();
          const mySchedule = res.data.filter(r => {
            if (!user.className) return true;
            return normalize(r.className) === normalize(user.className);
          });
          const mapped = mySchedule.map(r => ({
            'Exam Name': r.examName || r.examType || '-',
            Subject: r.subject || '-',
            Date: r.date ? new Date(r.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '-',
            Time: r.startTime && r.endTime ? `${r.startTime} - ${r.endTime}` : r.startTime || '-',
            Room: r.room || r.roomNo || '-'
          }));
          setData(mapped);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error('Error fetching exam schedule:', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [user]);

  return (
    <StudentDataTable
      title="Exam Schedule"
      breadcrumb={['Examinations', 'Exam Schedule']}
      columns={['Exam Name', 'Subject', 'Date', 'Time', 'Room']}
      showClassFilter={false}
      data={data}
    />
  );
}
