'use client';
import React, { useState, useEffect } from 'react';
import StudentDataTable from '@/components/student/StudentDataTable';
import api from '@/services/api';

const DEFAULT_FACULTY = [
  ['Prof. Mudassir Bajwa', 'Physics & Sciences', '+92 300 4587123', 'mudassir.bajwa@pakroyalcollege.edu.pk'],
  ['Prof. Fatima Zahra', 'Mathematics Department', '+92 321 8945612', 'fatima.zahra@pakroyalcollege.edu.pk'],
  ['Dr. Bilal Siddiqui', 'Chemistry & Life Sciences', '+92 333 7654321', 'dr.bilal@pakroyalcollege.edu.pk'],
  ['Prof. Muhammad Ali', 'Computer Science & IT', '+92 301 5567890', 'm.ali@pakroyalcollege.edu.pk'],
  ['Ms. Ayesha Siddiqa', 'English Literature', '+92 345 6789012', 'ayesha.s@pakroyalcollege.edu.pk'],
  ['Prof. Tariq Mehmood', 'Urdu & Islamic Studies', '+92 312 3456789', 'tariq.m@pakroyalcollege.edu.pk']
];

export default function Page() {
  const [teachers, setTeachers] = useState(DEFAULT_FACULTY);

  useEffect(() => {
    async function loadTeachers() {
      try {
        const [tRes, sRes] = await Promise.allSettled([
          api.get('/teacher'),
          api.get('/staff?role=Teacher')
        ]);
        let rows = [];
        if (tRes.status === 'fulfilled' && tRes.value?.success && Array.isArray(tRes.value.data) && tRes.value.data.length > 0) {
          rows = tRes.value.data.map(t => [
            t.name || `${t.firstName || ''} ${t.lastName || ''}`.trim() || 'Teacher',
            t.subject || t.department || 'Academics',
            t.phone || '+92 300 0000000',
            t.email || 'teacher@pakroyalcollege.edu.pk'
          ]);
        } else if (sRes.status === 'fulfilled' && sRes.value?.success && Array.isArray(sRes.value.data) && sRes.value.data.length > 0) {
          rows = sRes.value.data.map(s => [
            `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.name || 'Teacher',
            s.subject || s.department || s.designation || 'Academics',
            s.phone || s.mobile || '+92 300 0000000',
            s.email || 'teacher@pakroyalcollege.edu.pk'
          ]);
        }
        if (rows.length > 0) {
          setTeachers(rows);
        }
      } catch (e) {
        // Fallback to default faculty
      }
    }
    loadTeachers();
  }, []);

  return (
    <StudentDataTable 
      title="Teachers Directory"
      breadcrumb={['Teachers']}
      columns={['Teacher Name', 'Department / Subject', 'Phone', 'Email']}
      showClassFilter={false}
      data={teachers} 
    />
  );
}
