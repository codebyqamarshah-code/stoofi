'use client';
import { useState, useEffect } from 'react';
import StudentDataTable from '@/components/student/StudentDataTable';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

export default function Page() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHomework = async () => {
    try {
      setLoading(true);
      const res = await api.get('/homework');
      if (res?.success && Array.isArray(res.data)) {
        const normalize = (val) => String(val || '').replace(/^(Class|Section)\s*/i, '').trim().toLowerCase();
        
        const myHomework = res.data.filter(h => {
          if (!user?.className) return true; 
          const classMatch = normalize(h.className) === normalize(user.className);
          const sectionMatch = !user.section || normalize(h.section) === normalize(user.section);
          return classMatch && sectionMatch;
        });
        
        const mapped = myHomework.map(h => {
          // MongoDB ObjectIds come as strings in JSON, compare as strings
          const isCompleted = h.completedBy && h.completedBy.some(id => String(id) === String(user._id));
          const isOverdue = h.submissionDate && new Date(h.submissionDate) < new Date();
          let statusText = 'Pending';
          let statusClass = 'text-amber-500 font-bold';
          
          if (isCompleted) {
            statusText = 'Completed';
            statusClass = 'text-emerald-500 font-bold';
          } else if (isOverdue) {
            statusText = 'Overdue';
            statusClass = 'text-rose-500 font-bold';
          }

          return {
            id: h._id,
            Subject: h.subject || '-',
            Topic: h.description || '-',
            Deadline: h.submissionDate ? new Date(h.submissionDate).toLocaleDateString() : 'No deadline',
            Status: <span className={statusClass}>{statusText}</span>,
            Action: isCompleted ? (
              <span className="text-emerald-600 font-bold text-xs bg-emerald-100 px-2 py-1 rounded">Submitted</span>
            ) : (
              <button 
                onClick={() => handleSubmitHomework(h._id)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 text-xs rounded-md shadow transition-colors cursor-pointer"
              >
                Mark Complete
              </button>
            ),
            Attachment: h.file ? (
              <a href={h.file.startsWith('http') ? h.file : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${h.file}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-semibold text-xs flex items-center gap-1">
                Download
              </a>
            ) : '-'
          };
        });
        
        setData(mapped);
      }
    } catch (err) {
      console.error("Error fetching homework:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitHomework = async (hwId) => {
    try {
      const res = await api.post(`/homework/${hwId}/submit`);
      if (res && res.success) {
        alert('Homework marked as completed!');
        fetchHomework(); // Refresh list
      }
    } catch (e) {
      alert('Error submitting homework');
    }
  };


  useEffect(() => {
    fetchHomework();
  }, [user]);

  return (
    <StudentDataTable 
      title="My Assigned Homework"
      breadcrumb={['Homework', 'Student Tasks']}
      columns={['Subject', 'Topic', 'Deadline', 'Status', 'Attachment', 'Action']}
      showClassFilter={false}
      data={data} 
    />
  );
}
