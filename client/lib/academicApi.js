import api from '@/services/api';

export const academicApi = {
  // Categories
  getCategories: async () => {
    return await api.get('/academic-program/category');
  },
  createCategory: async (data) => {
    return await api.post('/academic-program/category', data);
  },
  updateCategory: async (id, data) => {
    return await api.put(`/academic-program/category/${id}`, data);
  },
  deleteCategory: async (id) => {
    return await api.delete(`/academic-program/category/${id}`);
  },

  // Programs
  getPrograms: async (params) => {
    return await api.get('/academic-program/program', { params });
  },
  createProgram: async (data) => {
    return await api.post('/academic-program/program', data);
  },
  updateProgram: async (id, data) => {
    return await api.put(`/academic-program/program/${id}`, data);
  },
  deleteProgram: async (id) => {
    return await api.delete(`/academic-program/program/${id}`);
  },

  // Affiliations
  getAffiliations: async () => {
    return await api.get('/academic-program/affiliation');
  },
  createAffiliation: async (data) => {
    return await api.post('/academic-program/affiliation', data);
  },
  updateAffiliation: async (id, data) => {
    return await api.put(`/academic-program/affiliation/${id}`, data);
  },
  deleteAffiliation: async (id) => {
    return await api.delete(`/academic-program/affiliation/${id}`);
  },

  // Campuses & Sessions
  getCampuses: async () => {
    return await api.get('/academic-program/campus');
  },
  createCampus: async (data) => {
    return await api.post('/academic-program/campus', data);
  },
  getSessions: async () => {
    return await api.get('/academic-program/session');
  },
  createSession: async (data) => {
    return await api.post('/academic-program/session', data);
  },

  // Offerings
  getOfferings: async (params) => {
    return await api.get('/academic-program/offering', { params });
  },
  getOfferingById: async (id) => {
    return await api.get(`/academic-program/offering/${id}`);
  },
  createOffering: async (data) => {
    return await api.post('/academic-program/offering', data);
  },
  updateOffering: async (id, data) => {
    return await api.put(`/academic-program/offering/${id}`, data);
  },
  deleteOffering: async (id) => {
    return await api.delete(`/academic-program/offering/${id}`);
  },

  // Batches
  getBatches: async (params) => {
    return await api.get('/academic-program/batch', { params });
  },
  createBatch: async (data) => {
    return await api.post('/academic-program/batch', data);
  },

  // Next Numbers (Admission & Roll No) based on year
  getNextNumbers: async (yearOrDate) => {
    return await api.get('/academic-program/next-numbers', {
      params: { year: yearOrDate }
    });
  },

  // Student Search for Multi-Enrollment
  searchExistingStudent: async (query) => {
    return await api.get('/academic-program/student-search', {
      params: { q: query }
    });
  },

  // Atomic Admission Submission
  submitAdmission: async (formData) => {
    return await api.post('/academic-program/admission', formData);
  },

  // Enrollments
  getEnrollments: async (params) => {
    return await api.get('/enrollment', { params });
  },
  updateEnrollmentStatus: async (id, data) => {
    return await api.put(`/enrollment/${id}/status`, data);
  }
};

export default academicApi;
