import api from './api';

const ROUTINE_KEY = 'stoofi_live_class_routines';

function getLocal() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ROUTINE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

function setLocal(data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ROUTINE_KEY, JSON.stringify(data));
  } catch (_) {}
}

export const routineService = {
  async getRoutines(params = {}) {
    const query = new URLSearchParams();
    if (params.className) query.append('className', params.className);
    if (params.sectionName) query.append('sectionName', params.sectionName);
    if (params.isLab !== undefined) query.append('isLab', params.isLab);
    if (params.labId) query.append('labId', params.labId);
    if (params.day && params.day !== 'All') query.append('day', params.day);
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.search) query.append('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';

    try {
      const res = await api.get(`/class-routine${queryString}`);
      if (res && res.success && Array.isArray(res.data)) {
        const current = getLocal();
        const resIds = new Set(res.data.map(d => d._id));
        const merged = [...res.data, ...current.filter(c => !c._id || !resIds.has(c._id))];
        setLocal(merged);
        return res.data;
      }
    } catch (_) {}

    // Fallback to offline local cache
    let items = getLocal();
    if (params.className) {
      items = items.filter(i => (i.className || '').toLowerCase() === params.className.toLowerCase());
    }
    if (params.sectionName) {
      items = items.filter(i => (i.sectionName || '').toLowerCase() === params.sectionName.toLowerCase());
    }
    if (params.isLab !== undefined) {
      if (params.isLab === 'true' || params.isLab === true) {
        items = items.filter(i => i.isLab || (i.labName && i.labName.trim() !== ''));
      }
    }
    if (params.day && params.day !== 'All') {
      items = items.filter(i => i.day === params.day);
    }
    if (params.status && params.status !== 'All') {
      items = items.filter(i => i.status === params.status);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(i =>
        (i.subject || '').toLowerCase().includes(q) ||
        (i.teacher || '').toLowerCase().includes(q) ||
        (i.room || '').toLowerCase().includes(q) ||
        (i.labName || '').toLowerCase().includes(q) ||
        (i.className || '').toLowerCase().includes(q) ||
        (i.sectionName || '').toLowerCase().includes(q) ||
        (i.topic || '').toLowerCase().includes(q)
      );
    }
    return items;
  },

  async saveRoutine(data) {
    let saved = null;
    if (data._id || (data.id && String(data.id).length === 24)) {
      const id = data._id || data.id;
      const res = await api.put(`/class-routine/${id}`, data);
      if (res && res.success) saved = res.data;
    } else {
      const res = await api.post('/class-routine', data);
      if (res && res.success) saved = res.data;
    }

    if (!saved) {
      throw new Error('Failed to save routine on server');
    }

    const current = getLocal();
    const idx = current.findIndex(r => (r._id && r._id === saved._id) || (r.id && r.id === saved.id));
    if (idx >= 0) {
      current[idx] = saved;
    } else {
      current.unshift(saved);
    }
    setLocal(current);
    return saved;
  },

  async deleteRoutine(id) {
    await api.delete(`/class-routine/${id}`);
    const current = getLocal().filter(r => r._id !== id && r.id !== id);
    setLocal(current);
    return true;
  }
};

export default routineService;
