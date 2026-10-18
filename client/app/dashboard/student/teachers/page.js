'use client';

import React, { useState, useEffect } from 'react';
import StudentDataTable from '@/components/student/StudentDataTable';
import api from '@/services/api';

export default function Page() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeachers() {
      try {
        setLoading(true);
        const [tRes, sRes] = await Promise.allSettled([
          api.get('/teacher'),
          api.get('/staff?role=Teacher')
        ]);
        let rows = [];
        if (tRes.status === 'fulfilled' && tRes.value?.success && Array.isArray(tRes.value.data) && tRes.value.data.length > 0) {
          rows = tRes.value.data.map(t => [
            t.name || `${t.firstName || ''} ${t.lastName || ''}`.trim() || 'Teacher',
            t.subject || t.department || 'Academics',
            t.phone || '—',
            t.email || '—'
          ]);
        } else if (sRes.status === 'fulfilled' && sRes.value?.success && Array.isArray(sRes.value.data) && sRes.value.data.length > 0) {
          rows = sRes.value.data.map(s => [
            `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.name || 'Teacher',
            s.subject || s.department || s.designation || 'Academics',
            s.phone || s.mobile || '—',
            s.email || '—'
          ]);
        }
        setTeachers(rows);
      } catch (e) {
        console.error('Failed to load teachers:', e);
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    }
    loadTeachers();
  }, []);

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="p-12 text-center text-zinc-500 bg-white rounded-md border border-zinc-100">
          <div className="inline-flex items-center gap-2 font-medium">
            <div className="h-4 w-4 rounded-full border-2 border-indigo-900 border-t-transparent animate-spin" />
            Loading Faculty Directory...
          </div>
        </div>
      ) : (
        <StudentDataTable 
          title="Teachers Directory"
          breadcrumb={['Teachers']}
          columns={['Teacher Name', 'Department / Subject', 'Phone', 'Email']}
          showClassFilter={false}
          data={teachers} 
        />
      )}
    </div>
  );
}
