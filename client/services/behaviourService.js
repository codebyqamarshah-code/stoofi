import api from '@/services/api';

const INCIDENTS_KEY = 'stoofi_behaviour_incidents_v2';
const ASSIGNED_KEY = 'stoofi_behaviour_assigned_v2';
const SETTINGS_KEY = 'stoofi_behaviour_settings_v2';

export const DEFAULT_INCIDENTS = [
  { _id: 'inc-1', title: 'Academic Excellence & High Test Score', point: 10, pointType: 'positive', description: 'Outstanding performance in class evaluations, quizzes, and projects.' },
  { _id: 'inc-2', title: 'Helpful Peer & Good Classroom Conduct', point: 5, pointType: 'positive', description: 'Assists fellow classmates, shows leadership, and maintains respectful decorum.' },
  { _id: 'inc-3', title: 'Outstanding Sportsmanship & Activity Participation', point: 5, pointType: 'positive', description: 'Active and fair participation in physical sports, clubs, or debates.' },
  { _id: 'inc-4', title: 'Perfect Attendance & Punctuality Award', point: 10, pointType: 'positive', description: 'Consistent zero-absence record and arrival before morning assembly.' },
  { _id: 'inc-5', title: 'Active Class Participation & Curiosity', point: 5, pointType: 'positive', description: 'Regularly asks insightful questions and engages positively in lessons.' },
  { _id: 'inc-6', title: 'Disruptive Classroom Behaviour', point: -5, pointType: 'negative', description: 'Talking loudly, creating noise, or disturbing other students during lectures.' },
  { _id: 'inc-7', title: 'Late Arrival / Unexcused Tardiness', point: -3, pointType: 'negative', description: 'Repeatedly arrives after class start without an explanatory pass.' },
  { _id: 'inc-8', title: 'Uniform & Dress Code Violation', point: -2, pointType: 'negative', description: 'Missing tie, unauthorized shoes, or improperly worn school uniform.' },
  { _id: 'inc-9', title: 'Incomplete Homework / Assignment Neglect', point: -5, pointType: 'negative', description: 'Fails to submit prescribed homework tasks repeatedly without justification.' },
  { _id: 'inc-10', title: 'Verbal Dispute or Disrespect to Peers', point: -10, pointType: 'negative', description: 'Using offensive language, bullying, or quarreling with fellow students.' }
];

export const DEFAULT_ASSIGNED = [];

export const DEFAULT_SETTINGS = {
  commentOption: 'Optional',
  viewOption: 'Student & Parent',
  viewIncidentInStudentPortal: true,
  viewIncidentInParentPortal: true,
  viewIncidentInTeacherPortal: true,
  notifyParentsOnNegative: true,
  warningLetterThreshold: -15,
  awardCertificateThreshold: 30
};

// Helper to get local data with auto-seeding
function getLocal(key, defaultData) {
  if (typeof window === 'undefined') return defaultData;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (_) {}
  // Seed initial
  try {
    localStorage.setItem(key, JSON.stringify(defaultData));
  } catch (_) {}
  return defaultData;
}

function setLocal(key, data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (_) {}
}

export const behaviourService = {
  // --- INCIDENTS ---
  async getIncidents() {
    try {
      const res = await api.get('/behaviour/incidents');
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        setLocal(INCIDENTS_KEY, res.data);
        return res.data;
      }
    } catch (_) {}
    return getLocal(INCIDENTS_KEY, DEFAULT_INCIDENTS);
  },

  async createIncident(data) {
    const cleanPoint = Math.abs(Number(data.point));
    const calculatedPoint = data.pointType === 'negative' ? -cleanPoint : cleanPoint;
    const newIncident = {
      _id: `inc-${Date.now()}`,
      title: data.title,
      point: calculatedPoint,
      pointType: data.pointType || (calculatedPoint < 0 ? 'negative' : 'positive'),
      description: data.description || '',
      status: 'active'
    };

    try {
      const res = await api.post('/behaviour/incidents', data);
      if (res?.success && res.data) {
        newIncident._id = res.data._id || newIncident._id;
      }
    } catch (_) {}

    const current = getLocal(INCIDENTS_KEY, DEFAULT_INCIDENTS);
    const updated = [newIncident, ...current];
    setLocal(INCIDENTS_KEY, updated);
    return newIncident;
  },

  async updateIncident(id, data) {
    const cleanPoint = Math.abs(Number(data.point));
    const calculatedPoint = data.pointType === 'negative' ? -cleanPoint : cleanPoint;

    try {
      await api.put(`/behaviour/incidents/${id}`, data);
    } catch (_) {}

    const current = getLocal(INCIDENTS_KEY, DEFAULT_INCIDENTS);
    const updated = current.map(item => item._id === id ? {
      ...item,
      title: data.title,
      point: calculatedPoint,
      pointType: data.pointType,
      description: data.description
    } : item);
    setLocal(INCIDENTS_KEY, updated);
    return true;
  },

  async deleteIncident(id) {
    try {
      await api.delete(`/behaviour/incidents/${id}`);
    } catch (_) {}

    const current = getLocal(INCIDENTS_KEY, DEFAULT_INCIDENTS);
    const updated = current.filter(item => item._id !== id);
    setLocal(INCIDENTS_KEY, updated);
    return true;
  },

  // --- ASSIGNED INCIDENTS ---
  async getAssignedIncidents(filters = {}) {
    try {
      const res = await api.get('/behaviour/assign', { params: filters });
      if (res?.success && Array.isArray(res.data)) {
        setLocal(ASSIGNED_KEY, res.data);
        return res.data;
      }
    } catch (_) {}
    return getLocal(ASSIGNED_KEY, []);
  },

  async assignIncident(data) {
    const cleanPoint = Math.abs(Number(data.point));
    const calculatedPoint = data.pointType === 'negative' ? -cleanPoint : cleanPoint;
    const newAssigned = {
      _id: `asg-${Date.now()}`,
      studentId: data.studentId || `stu-${Date.now()}`,
      studentName: data.studentName,
      admissionNo: data.admissionNo || 'N/A',
      className: data.className || 'FSC OTT',
      section: data.section || 'A',
      incidentTitle: data.incidentTitle,
      point: calculatedPoint,
      pointType: data.pointType || (calculatedPoint < 0 ? 'negative' : 'positive'),
      incidentDate: data.incidentDate || new Date().toISOString().split('T')[0],
      assignedBy: data.assignedBy || 'Administration',
      remarks: data.remarks || ''
    };

    try {
      const res = await api.post('/behaviour/assign', data);
      if (res?.success && res.data) {
        newAssigned._id = res.data._id || newAssigned._id;
      }
    } catch (err) {
      console.warn('Backend assign sync error:', err.message);
    }

    const current = getLocal(ASSIGNED_KEY, []);
    const updated = [newAssigned, ...current];
    setLocal(ASSIGNED_KEY, updated);
    return newAssigned;
  },

  async deleteAssignedIncident(id) {
    try {
      await api.delete(`/behaviour/assign/${id}`);
    } catch (err) {
      console.warn('Backend delete sync error:', err.message);
    }

    const current = getLocal(ASSIGNED_KEY, []);
    const updated = current.filter(item => item._id !== id);
    setLocal(ASSIGNED_KEY, updated);
    return true;
  },

  // --- STUDENTS HELPER ---
  async getAvailableStudents() {
    try {
      const res = await api.get('/student');
      let list = [];
      if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res?.students)) list = res.students;
      else if (Array.isArray(res)) list = res;
      if (list.length > 0) return list;
    } catch (_) {}

    return [];
  },

  // --- REPORTS ---
  async getStudentReport(filters = {}) {
    try {
      const res = await api.get('/behaviour/reports/student', { params: filters });
      if (res?.success && Array.isArray(res.data)) {
        return res.data;
      }
    } catch (_) {}

    const assigned = await this.getAssignedIncidents(filters);
    const studentMap = {};

    assigned.forEach(item => {
      if (filters.className && item.className !== filters.className) return;
      if (filters.section && item.section !== filters.section) return;
      if (filters.search) {
        const s = filters.search.toLowerCase();
        if (!item.studentName.toLowerCase().includes(s) && !item.admissionNo.toLowerCase().includes(s)) {
          return;
        }
      }

      const key = item.admissionNo || item.studentName;
      if (!studentMap[key]) {
        studentMap[key] = {
          studentId: item.studentId,
          studentName: item.studentName,
          admissionNo: item.admissionNo,
          className: item.className,
          section: item.section,
          totalIncidents: 0,
          positivePoints: 0,
          negativePoints: 0,
          totalScore: 0,
          incidentsList: []
        };
      }
      studentMap[key].totalIncidents += 1;
      if (item.point > 0) {
        studentMap[key].positivePoints += item.point;
      } else {
        studentMap[key].negativePoints += item.point;
      }
      studentMap[key].totalScore += item.point;
      studentMap[key].incidentsList.push(item);
    });

    return Object.values(studentMap);
  },

  async getClassSectionReport() {
    try {
      const res = await api.get('/behaviour/reports/class-section');
      if (res?.success && Array.isArray(res.data)) {
        return res.data;
      }
    } catch (_) {}

    const assigned = await this.getAssignedIncidents();
    const classMap = {};

    assigned.forEach(item => {
      const key = `${item.className}_${item.section}`;
      if (!classMap[key]) {
        classMap[key] = {
          className: item.className,
          section: item.section,
          totalIncidents: 0,
          positiveIncidents: 0,
          negativeIncidents: 0,
          totalPoints: 0,
          studentsSet: new Set()
        };
      }
      classMap[key].totalIncidents += 1;
      if (item.point > 0) classMap[key].positiveIncidents += 1;
      else classMap[key].negativeIncidents += 1;
      classMap[key].totalPoints += item.point;
      classMap[key].studentsSet.add(item.admissionNo || item.studentName);
    });

    return Object.values(classMap).map(cls => ({
      className: cls.className,
      section: cls.section,
      totalIncidents: cls.totalIncidents,
      positiveIncidents: cls.positiveIncidents,
      negativeIncidents: cls.negativeIncidents,
      totalPoints: cls.totalPoints,
      studentsCount: cls.studentsSet.size,
      avgScore: cls.studentsSet.size > 0 ? (cls.totalPoints / cls.studentsSet.size).toFixed(1) : 0
    }));
  },

  async getIncidentWiseReport() {
    try {
      const res = await api.get('/behaviour/reports/incident-wise');
      if (res?.success && Array.isArray(res.data)) {
        return res.data;
      }
    } catch (_) {}

    const assigned = await this.getAssignedIncidents();
    const incidentMap = {};

    assigned.forEach(item => {
      const key = item.incidentTitle;
      if (!incidentMap[key]) {
        incidentMap[key] = {
          incidentTitle: item.incidentTitle,
          point: item.point,
          pointType: item.pointType,
          totalCount: 0,
          studentsSet: new Set(),
          classesSet: new Set(),
          lastDate: item.incidentDate
        };
      }
      incidentMap[key].totalCount += 1;
      incidentMap[key].studentsSet.add(item.admissionNo || item.studentName);
      incidentMap[key].classesSet.add(`${item.className} (${item.section})`);
      if (item.incidentDate > incidentMap[key].lastDate) {
        incidentMap[key].lastDate = item.incidentDate;
      }
    });

    return Object.values(incidentMap).map(inc => ({
      incidentTitle: inc.incidentTitle,
      point: inc.point,
      pointType: inc.pointType,
      totalCount: inc.totalCount,
      uniqueStudentsCount: inc.studentsSet.size,
      affectedClasses: Array.from(inc.classesSet).join(', '),
      lastDate: inc.lastDate
    }));
  },

  async getOverallSummary() {
    const assigned = await this.getAssignedIncidents();
    let totalIncidents = assigned.length;
    let totalPositivePoints = 0;
    let totalNegativePoints = 0;

    const studentMap = {};

    assigned.forEach(item => {
      if (item.point > 0) totalPositivePoints += item.point;
      else totalNegativePoints += item.point;

      const key = item.admissionNo || item.studentName;
      if (!studentMap[key]) {
        studentMap[key] = {
          studentName: item.studentName,
          admissionNo: item.admissionNo,
          className: item.className,
          section: item.section,
          score: 0,
          count: 0
        };
      }
      studentMap[key].score += item.point;
      studentMap[key].count += 1;
    });

    const studentsList = Object.values(studentMap);
    const topPositive = [...studentsList].sort((a, b) => b.score - a.score).slice(0, 5);
    const needsAttention = [...studentsList].filter(s => s.score < 0).sort((a, b) => a.score - b.score).slice(0, 5);

    return {
      totalIncidents,
      totalPositivePoints,
      totalNegativePoints,
      netScore: totalPositivePoints + totalNegativePoints,
      topStudents: topPositive,
      needsAttentionStudents: needsAttention,
      totalStudentsEvaluated: studentsList.length
    };
  },

  // --- SETTINGS ---
  async getSettings() {
    try {
      const res = await api.get('/behaviour/settings');
      if (res?.success && res.data) {
        setLocal(SETTINGS_KEY, res.data);
        return res.data;
      }
    } catch (_) {}
    return getLocal(SETTINGS_KEY, DEFAULT_SETTINGS);
  },

  async saveSettings(data) {
    try {
      await api.post('/behaviour/settings', data);
    } catch (_) {}
    setLocal(SETTINGS_KEY, data);
    return data;
  }
};

export default behaviourService;
