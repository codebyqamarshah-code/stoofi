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
    const fetchAttendance = async () => {
      if (!user) return;
      try {
        setLoading(true);
        // Get attendance for current month
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');

        const res = await api.get(`/student-attendance?studentId=${user.referenceId || ''}&year=${year}&month=${month}`);

        if (res?.success && Array.isArray(res.data)) {
          const mapped = res.data.map(record => ({
            Date: record.date ? new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '-',
            Status: record.status === 'Present'
              ? <span className="text-emerald-500 font-bold">Present</span>
              : record.status === 'Absent'
              ? <span className="text-rose-500 font-bold">Absent</span>
              : record.status === 'Late'
              ? <span className="text-amber-500 font-bold">Late</span>
              : <span className="text-zinc-400">{record.status || '-'}</span>,
            Remarks: record.note || record.remarks || '-'
          }));
          setData(mapped);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error('Error fetching attendance:', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [user]);

  return (
    <StudentDataTable
      title="My Attendance Record"
      breadcrumb={['Attendance']}
      columns={['Date', 'Status', 'Remarks']}
      showClassFilter={false}
      data={data}
    />
  );
}
