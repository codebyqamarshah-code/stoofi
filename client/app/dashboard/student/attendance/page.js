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
        const sId = user.referenceId || user.studentId || user._id || '';
        const res = await api.get(`/student-attendance?studentId=${sId}`);

        if (res?.success && Array.isArray(res.data)) {
          const mapped = res.data.map(record => ({
            Date: record.date ? new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '-',
            Status: record.status === 'Present'
              ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Present</span>
              : record.status === 'Absent'
              ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">Absent</span>
              : record.status === 'Late'
              ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">Late</span>
              : record.status === 'Half Day'
              ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 text-zinc-800 border border-zinc-200">Half Day</span>
              : record.status === 'Holiday'
              ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">Holiday</span>
              : <span className="text-zinc-500 font-semibold">{record.status || '-'}</span>,
            Remarks: record.name || record.note || record.remarks || '-'
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
