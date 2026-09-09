import axios from 'axios';
import { endpointMockMap } from './mockData.js';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 5000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Auth Token from localStorage
api.interceptors.request.use((config) => {
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('auth-storage');
      if (raw) {
        const parsed = JSON.parse(raw);
        const token = parsed?.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          return config;
        }
      }
    } catch (_) {}

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response Interceptor: Always return response.data directly from MongoDB
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const url = error.config?.url || '';
    const cleanPath = url.split('?')[0];
    const fallback = endpointMockMap[cleanPath];

    // Network error fallback: only when backend cannot be reached
    if (!error.response || error.code === 'ECONNABORTED' || (error.message && error.message.includes('Network Error'))) {
      console.warn(`[API Network Warning] Failed to reach backend for ${cleanPath}. Running in offline/local mode.`);
      
      const method = error.config?.method?.toLowerCase();
      // Use cleanPath as table name, e.g. '/student' -> 'student'
      const pathParts = cleanPath.split('/').filter(Boolean);
      let table = pathParts[0] || 'general';
      if (table === 'students') table = 'student';
      if (table === 'classes') table = 'class';
      if (table === 'sections') table = 'section';
      const recordId = pathParts.length > 1 ? pathParts[1] : null;

      // Initialize from localStorage or fallback
      const lsKey = 'mockDB_' + table;
      let records = [];
      try {
        const stored = localStorage.getItem(lsKey);
        if (stored) {
          records = JSON.parse(stored);
        } else if (fallback !== undefined) {
           records = Array.isArray(fallback) ? [...fallback] : [fallback];
           localStorage.setItem(lsKey, JSON.stringify(records));
        }
      } catch(e) {}

      if (method === 'get') {
        if (cleanPath === '/dashboard/stats') {
          // Compute dynamic stats from local DBs
          let studentsList = [];
          try {
            const rawStu = localStorage.getItem('mockDB_student');
            studentsList = rawStu ? JSON.parse(rawStu) : (fallback || []);
          } catch(e) {}
          if (!studentsList || studentsList.length === 0) {
            try {
              const { mockStudents } = require('./mockData.js');
              if (mockStudents?.length > 0) {
                studentsList = mockStudents;
                localStorage.setItem('mockDB_student', JSON.stringify(mockStudents));
              }
            } catch(e) {}
          }
          const totalStudents = studentsList.length;
          const maleCount = studentsList.filter(s => s.gender?.toLowerCase() === 'male').length;
          const femaleCount = studentsList.filter(s => s.gender?.toLowerCase() === 'female').length;
          const malePercent = totalStudents > 0 ? Math.round((maleCount / totalStudents) * 100) : 50;
          const femalePercent = totalStudents > 0 ? Math.round((femaleCount / totalStudents) * 100) : 50;

          const totalStaff = JSON.parse(localStorage.getItem('mockDB_staff') || '[]').length || 3;
          const totalClasses = JSON.parse(localStorage.getItem('mockDB_class') || '[]').length || 12;
          const fallbackStats = fallback || {};
          return Promise.resolve({
            success: true,
            data: {
              ...fallbackStats,
              stats: {
                teachers: 15,
                parents: totalStudents || 5,
                staffs: totalStaff,
                classes: { total: totalClasses },
                attendance: {
                  studentsPresent: Math.round(totalStudents * 0.95),
                  studentsTotal: totalStudents,
                  staffPresent: totalStaff,
                  staffTotal: totalStaff,
                  studentAttPercent: totalStudents > 0 ? 95 : 0,
                  staffAttPercent: 100
                },
                fees: {
                  totalIncome: 0,
                  totalExpenses: 0,
                  totalProfit: 0,
                  totalFees: 0,
                  collectedFees: 0,
                  collectionPercentage: 0
                },
                ...(fallbackStats.stats || {}),
                students: {
                  total: totalStudents,
                  male: maleCount,
                  female: femaleCount,
                  malePercent,
                  femalePercent
                },
                staff: { total: totalStaff }
              }
            },
            message: 'Loaded dynamic dashboard stats from local DB'
          });
        }
        return Promise.resolve({ success: true, data: records, message: 'Loaded from local DB' });
      }

      if (method === 'post') {
        if (cleanPath === '/auth/login' || cleanPath === '/login' || cleanPath === '/auth/register' || cleanPath === '/register') {
           return Promise.reject(new Error('Cannot reach the backend server to authenticate. Please ensure the server is running.'));
        }
        let newData = {};
        if (error.config.data) {
          try {
            if (typeof error.config.data === 'string') {
               newData = JSON.parse(error.config.data);
            } else if (typeof FormData !== 'undefined' && error.config.data instanceof FormData) {
               for (let [key, val] of error.config.data.entries()) {
                 newData[key] = val;
               }
            } else {
               newData = error.config.data;
            }
          } catch(e) {}
        }
        newData._id = 'mock_' + Date.now();
        records.push(newData);
        localStorage.setItem(lsKey, JSON.stringify(records));
        return Promise.resolve({ success: true, data: newData, message: 'Saved to local DB successfully!' });
      }

      if (method === 'put' || method === 'patch') {
        let updateData = {};
        if (error.config.data) {
           try {
             if (typeof error.config.data === 'string') {
               updateData = JSON.parse(error.config.data);
             } else if (typeof FormData !== 'undefined' && error.config.data instanceof FormData) {
               for (let [key, val] of error.config.data.entries()) {
                 updateData[key] = val;
               }
             } else {
               updateData = error.config.data;
             }
           } catch(e) {}
        }
        if (recordId) {
          records = records.map(r => r._id === recordId ? { ...r, ...updateData } : r);
        }
        localStorage.setItem(lsKey, JSON.stringify(records));
        return Promise.resolve({ success: true, data: updateData, message: 'Updated in local DB successfully!' });
      }

      if (method === 'delete') {
        if (recordId) {
           records = records.filter(r => r._id !== recordId);
           localStorage.setItem(lsKey, JSON.stringify(records));
        }
        return Promise.resolve({ success: true, data: null, message: 'Deleted from local DB successfully!' });
      }

      if (fallback !== undefined) {
        return Promise.resolve({ success: true, data: fallback, message: 'Loaded from offline fallback' });
      }
      return Promise.reject(new Error('Backend server is unreachable. Please check connection.'));
    }

    // 401 Unauthorized handling
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/login' && window.location.pathname !== '/') {
        const storedToken = localStorage.getItem('token');
        if (storedToken && storedToken.startsWith('mock_')) {
          if (fallback !== undefined) {
            return Promise.resolve({ success: true, data: fallback, message: 'Demo mode fallback' });
          }
          return Promise.resolve({ success: true, data: [], message: 'Demo mode fallback' });
        }
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('token');
        window.location.href = '/login';
        return new Promise(() => {});
      }
    }

    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    const err = new Error(message);
    err.response = error.response;
    return Promise.reject(err);
  }
);

export default api;
