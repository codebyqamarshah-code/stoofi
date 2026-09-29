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
    const fetchFees = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const res = await api.get('/fees-invoice');
        if (res?.success && Array.isArray(res.data)) {
          // Filter to this student's invoices
          const myFees = res.data.filter(f =>
            !f.studentId || (user.referenceId && String(f.studentId) === String(user.referenceId))
          );
          const mapped = myFees.map((f, i) => ({
            SL: i + 1,
            Student: f.studentName || user?.fullName || '-',
            'Class(Section)': f.className ? `${f.className}(${f.section || '-'})` : '-',
            Amount: f.totalAmount != null ? `Rs. ${Number(f.totalAmount).toLocaleString()}` : '-',
            Waiver: f.waiverAmount != null ? `Rs. ${Number(f.waiverAmount).toLocaleString()}` : '0',
            Fine: f.fineAmount != null ? `Rs. ${Number(f.fineAmount).toLocaleString()}` : '0',
            Paid: f.paidAmount != null ? `Rs. ${Number(f.paidAmount).toLocaleString()}` : '-',
            Balance: f.dueAmount != null ? `Rs. ${Number(f.dueAmount).toLocaleString()}` : '-',
            Status: f.status === 'Paid'
              ? <span className="text-emerald-500 font-bold">Paid</span>
              : f.status === 'Partial'
              ? <span className="text-amber-500 font-bold">Partial</span>
              : <span className="text-rose-500 font-bold">Unpaid</span>,
            Date: f.createdAt ? new Date(f.createdAt).toLocaleDateString() : '-'
          }));
          setData(mapped);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error('Error fetching fees:', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, [user]);

  return (
    <StudentDataTable
      title="Fees Invoice"
      breadcrumb={['Fees', 'Fees Invoice']}
      columns={['SL', 'Student', 'Class(Section)', 'Amount', 'Waiver', 'Fine', 'Paid', 'Balance', 'Status', 'Date']}
      showClassFilter={false}
      data={data}
    />
  );
}
