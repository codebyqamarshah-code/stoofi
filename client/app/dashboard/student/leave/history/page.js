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
    const fetchLeaves = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const res = await api.get('/leave');
        if (res?.success && Array.isArray(res.data)) {
          // Filter to this student's leaves
          const myLeaves = res.data.filter(l =>
            !l.userId || (user._id && String(l.userId) === String(user._id))
          );
          const mapped = myLeaves.map((l, i) => ({
            '#': i + 1,
            'Leave Type': l.leaveType || l.type || '-',
            From: l.fromDate ? new Date(l.fromDate).toLocaleDateString() : '-',
            To: l.toDate ? new Date(l.toDate).toLocaleDateString() : '-',
            Days: l.days || '-',
            Reason: l.reason || '-',
            Status: l.status === 'Approved'
              ? <span className="text-emerald-500 font-bold">Approved</span>
              : l.status === 'Rejected'
              ? <span className="text-rose-500 font-bold">Rejected</span>
              : <span className="text-amber-500 font-bold">Pending</span>
          }));
          setData(mapped);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error('Error fetching leaves:', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaves();
  }, [user]);

  return (
    <StudentDataTable
      title="Leave History"
      breadcrumb={['Leave', 'History']}
      columns={['#', 'Leave Type', 'From', 'To', 'Days', 'Reason', 'Status']}
      showClassFilter={false}
      data={data}
    />
  );
}
