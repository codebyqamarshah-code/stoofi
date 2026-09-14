import axios from 'axios';
import { endpointMockMap } from './mockData.js';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Auth Token from localStorage & dynamic baseURL for production/live
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    if (!process.env.NEXT_PUBLIC_API_URL && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      config.baseURL = window.location.origin + '/api';
    }

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

  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    delete config.headers['Content-Type'];
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

    // Offline fallback allows existing demo to work on Vercel

    // Network/404 error fallback: when backend cannot be reached or route is missing on live host
    if (!error.response || error.code === 'ECONNABORTED' || (error.message && error.message.includes('Network Error')) || error.response?.status === 404 || error.response?.status === 502 || error.response?.status === 503) {
      console.warn(`[API Network Warning] Failed to reach backend for ${cleanPath} (Status: ${error.response?.status || 'Network Error'}). Running in offline/local mode.`);
      
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
        if (cleanPath === '/auth/register' || cleanPath === '/register') {
          let regData = {};
          if (error.config.data) {
            try {
              if (typeof error.config.data === 'string') {
                regData = JSON.parse(error.config.data);
              } else if (typeof FormData !== 'undefined' && error.config.data instanceof FormData) {
                for (let [key, val] of error.config.data.entries()) {
                  regData[key] = val;
                }
              } else {
                regData = error.config.data;
              }
            } catch(e) {}
          }
          let safeAvatar = regData.picture || regData.avatar || '';
          if (typeof safeAvatar === 'string' && safeAvatar.length > 5000) {
            safeAvatar = ''; // Prevent QuotaExceededError from large base64 images
          }
          const safeRegData = { ...regData, picture: safeAvatar, avatar: safeAvatar };

          const mockUser = {
            _id: 'user_' + Date.now(),
            username: safeRegData.fullName || safeRegData.username || safeRegData.email?.split('@')[0] || 'User',
            email: safeRegData.email || 'user@example.com',
            role: safeRegData.role || 'Teacher',
            avatar: safeAvatar
          };
          try {
            const users = JSON.parse(localStorage.getItem('mockDB_users') || '[]');
            users.push({ ...safeRegData, _id: mockUser._id });
            try { localStorage.setItem('mockDB_users', JSON.stringify(users)); } catch(e) {}

            if (safeRegData.role === 'Teacher') {
              const teacherList = JSON.parse(localStorage.getItem('mockDB_teacher') || '[]');
              teacherList.push({
                _id: 'tch_' + Date.now(),
                user: mockUser._id,
                firstName: safeRegData.fullName || mockUser.username,
                lastName: '',
                email: mockUser.email,
                phone: safeRegData.phone || '',
                cnic: safeRegData.cnic || '',
                joiningDate: safeRegData.joiningDate || new Date().toISOString(),
                avatar: safeAvatar
              });
              try { localStorage.setItem('mockDB_teacher', JSON.stringify(teacherList)); } catch(e) {}
            }
          } catch(e) {}

          const mockToken = 'mock_jwt_token_' + Date.now();
          return Promise.resolve({
            success: true,
            data: mockUser,
            token: mockToken,
            message: 'Registration successful!'
          });
        }

        if (cleanPath === '/auth/login' || cleanPath === '/login') {
          let loginData = {};
          if (error.config.data) {
            try {
              if (typeof error.config.data === 'string') {
                loginData = JSON.parse(error.config.data);
              } else {
                loginData = error.config.data;
              }
            } catch(e) {}
          }
          const emailInput = (loginData.email || '').trim().toLowerCase();
          const passwordInput = (loginData.password || '').trim();

          // Default system accounts (Super Admin & Admin never need registration)
          const predefined = [
            { email: 'super@gmail.com', role: 'Super Admin', username: 'Super Admin', password: 'school@123' },
            { email: 'admin@gmail.com', role: 'Admin', username: 'Admin', password: 'school@123' },
            { email: 'admin@gamil.com', role: 'Admin', username: 'Admin', password: 'school@123' }
          ];

          let users = [];
          try {
            users = JSON.parse(localStorage.getItem('mockDB_users') || '[]');
          } catch(e) {}

          const foundPredefined = predefined.find(p => p.email === emailInput);
          const foundInDb = users.find(u => (u.email || '').trim().toLowerCase() === emailInput || (u.username || '').trim().toLowerCase() === emailInput);

          // 1. If Super Admin or Admin
          if (foundPredefined) {
            if (passwordInput && passwordInput !== foundPredefined.password && passwordInput !== 'school@123') {
              return Promise.reject({
                response: {
                  data: {
                    success: false,
                    message: 'Incorrect password.'
                  }
                },
                message: 'Incorrect password.'
              });
            }
          } else if (foundInDb) {
            // 2. Registered users in local DB
            if (foundInDb.password && passwordInput && foundInDb.password !== passwordInput) {
              return Promise.reject({
                response: {
                  data: {
                    success: false,
                    message: 'Incorrect password.'
                  }
                },
                message: 'Incorrect password.'
              });
            }
          } else {
            // 3. User is not registered
            return Promise.reject({
              response: {
                data: {
                  success: false,
                  message: 'User not found. Please register first.'
                }
              },
              message: 'User not found. Please register first.'
            });
          }

          const matchedUser = foundPredefined || foundInDb;

          let safeAvatar = matchedUser.picture || matchedUser.avatar || '';
          if (typeof safeAvatar === 'string' && safeAvatar.length > 5000) safeAvatar = '';

          const mockUser = {
            _id: matchedUser._id || 'user_' + Date.now(),
            username: matchedUser.fullName || matchedUser.username || matchedUser.email?.split('@')[0],
            email: matchedUser.email,
            role: matchedUser.role || 'Teacher',
            avatar: safeAvatar
          };
          const mockToken = 'mock_jwt_token_' + Date.now();
          return Promise.resolve({
            success: true,
            data: mockUser,
            token: mockToken,
            message: 'Login successful!'
          });
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
        if (typeof newData.avatar === 'string' && newData.avatar.length > 5000) newData.avatar = '';
        if (typeof newData.picture === 'string' && newData.picture.length > 5000) newData.picture = '';
        if (typeof newData.image === 'string' && newData.image.length > 5000) newData.image = '';
        records.push(newData);
        try { localStorage.setItem(lsKey, JSON.stringify(records)); } catch(e) {}
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
        if (typeof updateData.avatar === 'string' && updateData.avatar.length > 5000) updateData.avatar = '';
        if (typeof updateData.picture === 'string' && updateData.picture.length > 5000) updateData.picture = '';
        if (typeof updateData.image === 'string' && updateData.image.length > 5000) updateData.image = '';
        if (recordId) {
          records = records.map(r => r._id === recordId ? { ...r, ...updateData } : r);
        }
        try { localStorage.setItem(lsKey, JSON.stringify(records)); } catch(e) {}
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
