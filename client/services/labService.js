import api from './api';

const STORAGE_KEYS = {
  LABS: 'stoofi_live_labs',
  EQUIPMENT: 'stoofi_live_equipment',
  MAINTENANCE: 'stoofi_live_maintenance',
  CONSUMABLES: 'stoofi_live_consumables',
  CATEGORIES: 'stoofi_live_categories',
  PRACTICALS: 'stoofi_live_practicals'
};

function getLocal(key) {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

function setLocal(key, data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (_) {}
}

export const labService = {
  // ===============================
  // 1. LIVE REPORTS & METRICS
  // ===============================
  async getReports() {
    try {
      const res = await api.get('/labs/reports');
      if (res && res.success && res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn('API /labs/reports error, calculating from local store:', err.message);
    }

    // Fallback: calculate live aggregates from local store
    const equipment = getLocal(STORAGE_KEYS.EQUIPMENT);
    const labs = getLocal(STORAGE_KEYS.LABS);
    const maintenance = getLocal(STORAGE_KEYS.MAINTENANCE);
    const consumables = getLocal(STORAGE_KEYS.CONSUMABLES);
    const practicals = getLocal(STORAGE_KEYS.PRACTICALS);

    const totalAssetValuation = equipment.reduce((sum, item) => {
      const cost = Number(String(item.purchaseCost || 0).replace(/[^0-9.]/g, '')) || 0;
      const qty = Number(item.quantity) || 1;
      return sum + (cost * qty);
    }, 0);

    const totalAssetsCount = equipment.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
    const totalLabMaintenance = maintenance.reduce((sum, item) => {
      const cost = Number(String(item.costIncurred || item.actualCost || item.estimatedCost || 0).replace(/[^0-9.]/g, '')) || 0;
      return sum + cost;
    }, 0);

    // Group equipment by laboratory for table
    const labInventoryMap = {};
    for (const eq of equipment) {
      const labName = eq.lab || 'General Lab';
      if (!labInventoryMap[labName]) {
        labInventoryMap[labName] = {
          lab: labName,
          category: eq.category || 'General',
          totalAssets: 0,
          working: 0,
          underRepair: 0,
          totalValue: 0,
          utilization: '0%'
        };
      }
      const qty = Number(eq.quantity) || 1;
      const cost = Number(String(eq.purchaseCost || 0).replace(/[^0-9.]/g, '')) || 0;
      labInventoryMap[labName].totalAssets += qty;
      labInventoryMap[labName].totalValue += (cost * qty);
      if (eq.condition === 'Good' || eq.status === 'Available') {
        labInventoryMap[labName].working += (Number(eq.availableQty) || qty);
      }
      if (eq.condition === 'Under Repair' || eq.status === 'Under Repair') {
        labInventoryMap[labName].underRepair += qty;
      }
    }

    const inventoryReport = Object.values(labInventoryMap).map(row => {
      const pct = row.totalAssets > 0 ? Math.round((row.working / row.totalAssets) * 100) : 0;
      return { ...row, utilization: `${pct}%` };
    });

    // Group maintenance by laboratory for table
    const labMaintenanceMap = {};
    for (const m of maintenance) {
      const labName = m.labName || 'General';
      if (!labMaintenanceMap[labName]) {
        labMaintenanceMap[labName] = {
          lab: labName,
          tickets: 0,
          resolved: 0,
          open: 0,
          costIncurred: 0,
          topIssue: m.description || 'General inspection'
        };
      }
      const cost = Number(String(m.costIncurred || m.actualCost || 0).replace(/[^0-9.]/g, '')) || 0;
      labMaintenanceMap[labName].tickets += 1;
      labMaintenanceMap[labName].costIncurred += cost;
      if (m.status === 'Repaired' || m.status === 'Closed') {
        labMaintenanceMap[labName].resolved += 1;
      } else {
        labMaintenanceMap[labName].open += 1;
      }
    }
    const maintenanceReport = Object.values(labMaintenanceMap);

    // Academic report
    const academicReport = practicals.map(p => ({
      course: p.title || 'Practical Course',
      program: p.classSemester || p.subject || 'General',
      planned: Number(p.totalMarks) || 10,
      conducted: p.status === 'Conducted' ? 1 : 0,
      completionRate: p.status === 'Conducted' ? '100%' : '0%',
      avgAttendance: p.attendanceCount || '0%',
      passRate: '100%'
    }));

    // Consumables report
    const consumablesReport = consumables.map(c => ({
      item: c.name,
      category: c.category || 'General',
      unit: c.unit || 'Units',
      openedQty: (Number(c.inStock) || 0) + (Number(c.consumedQty) || 0),
      consumedQty: Number(c.consumedQty) || 0,
      stockRemaining: Number(c.inStock) || 0,
      reorderAlert: c.status === 'Critical' ? 'Reorder Now' : c.status === 'Low Stock' ? 'Low Stock' : 'Normal'
    }));

    const avgUtilization = inventoryReport.length > 0
      ? (inventoryReport.reduce((acc, curr) => acc + (parseInt(curr.utilization) || 0), 0) / inventoryReport.length).toFixed(1) + '%'
      : '0%';

    const practicalProgress = practicals.length > 0
      ? Math.round((practicals.filter(p => p.status === 'Conducted').length / practicals.length) * 100) + '%'
      : '0%';

    return {
      summary: {
        totalAssetValuation,
        totalAssetsCount,
        totalLabMaintenance,
        averageUtilization: avgUtilization,
        practicalProgress,
        totalLabs: labs.length,
        activeLabs: labs.filter(l => l.status === 'Active').length,
        underMaintenanceCount: maintenance.filter(m => m.status !== 'Closed' && m.status !== 'Repaired').length
      },
      inventoryReport,
      maintenanceReport,
      academicReport,
      consumablesReport,
      rawEquipment: equipment,
      rawLabs: labs,
      rawMaintenance: maintenance
    };
  },

  // ===============================
  // 2. LABORATORIES
  // ===============================
  async getLabs() {
    try {
      const res = await api.get('/labs');
      if (res && res.success && Array.isArray(res.data)) {
        setLocal(STORAGE_KEYS.LABS, res.data);
        return res.data;
      }
    } catch (_) {}
    return getLocal(STORAGE_KEYS.LABS);
  },

  async saveLab(labData) {
    const isEdit = Boolean(labData._id || (labData.id && String(labData.id).length === 24));
    const id = labData._id || labData.id;
    const res = isEdit
      ? await api.put(`/labs/${id}`, labData)
      : await api.post('/labs', labData);

    if (res?.data || res?.success) {
      const saved = res.data || { ...labData, _id: id };
      const current = getLocal(STORAGE_KEYS.LABS);
      const idx = current.findIndex(l => (l._id && l._id === saved._id) || (l.id && l.id === saved.id));
      if (idx >= 0) {
        current[idx] = saved;
      } else {
        current.unshift(saved);
      }
      setLocal(STORAGE_KEYS.LABS, current);
      return saved;
    }
    throw new Error(res?.message || 'Failed to save laboratory record on server');
  },

  async deleteLab(id) {
    const res = await api.delete(`/labs/${id}`);
    if (res && res.success !== false) {
      const current = getLocal(STORAGE_KEYS.LABS).filter(l => l._id !== id && l.id !== id);
      setLocal(STORAGE_KEYS.LABS, current);
      return true;
    }
    throw new Error(res?.message || 'Failed to delete laboratory on server');
  },

  // ===============================
  // 3. EQUIPMENT & ASSETS
  // ===============================
  async getEquipment() {
    try {
      const res = await api.get('/labs/equipment');
      if (res && res.success && Array.isArray(res.data)) {
        setLocal(STORAGE_KEYS.EQUIPMENT, res.data);
        return res.data;
      }
    } catch (_) {}
    return getLocal(STORAGE_KEYS.EQUIPMENT);
  },

  async saveEquipment(data) {
    const isEdit = Boolean(data._id || (data.id && String(data.id).length === 24));
    const id = data._id || data.id;
    const res = isEdit
      ? await api.put(`/labs/equipment/${id}`, data)
      : await api.post('/labs/equipment', data);

    if (res?.data || res?.success) {
      const saved = res.data || { ...data, _id: id };
      const current = getLocal(STORAGE_KEYS.EQUIPMENT);
      const idx = current.findIndex(e => (e._id && e._id === saved._id) || (e.id && e.id === saved.id));
      if (idx >= 0) {
        current[idx] = saved;
      } else {
        current.unshift(saved);
      }
      setLocal(STORAGE_KEYS.EQUIPMENT, current);
      return saved;
    }
    throw new Error(res?.message || 'Failed to save equipment on server');
  },

  async deleteEquipment(id) {
    const res = await api.delete(`/labs/equipment/${id}`);
    if (res && res.success !== false) {
      const current = getLocal(STORAGE_KEYS.EQUIPMENT).filter(e => e._id !== id && e.id !== id);
      setLocal(STORAGE_KEYS.EQUIPMENT, current);
      return true;
    }
    throw new Error(res?.message || 'Failed to delete equipment on server');
  },

  // ===============================
  // 4. MAINTENANCE & REPAIRS
  // ===============================
  async getMaintenance() {
    try {
      const res = await api.get('/labs/maintenance');
      if (res && res.success && Array.isArray(res.data)) {
        setLocal(STORAGE_KEYS.MAINTENANCE, res.data);
        return res.data;
      }
    } catch (_) {}
    return getLocal(STORAGE_KEYS.MAINTENANCE);
  },

  async saveMaintenance(data) {
    const isEdit = Boolean(data._id || (data.id && String(data.id).length === 24));
    const id = data._id || data.id;
    const res = isEdit
      ? await api.put(`/labs/maintenance/${id}`, data)
      : await api.post('/labs/maintenance', data);

    if (res?.data || res?.success) {
      const saved = res.data || { ...data, _id: id };
      const current = getLocal(STORAGE_KEYS.MAINTENANCE);
      const idx = current.findIndex(m => (m._id && m._id === saved._id) || (m.id && m.id === saved.id));
      if (idx >= 0) {
        current[idx] = saved;
      } else {
        current.unshift(saved);
      }
      setLocal(STORAGE_KEYS.MAINTENANCE, current);
      return saved;
    }
    throw new Error(res?.message || 'Failed to save maintenance record on server');
  },

  async deleteMaintenance(id) {
    const res = await api.delete(`/labs/maintenance/${id}`);
    if (res && res.success !== false) {
      const current = getLocal(STORAGE_KEYS.MAINTENANCE).filter(m => m._id !== id && m.id !== id);
      setLocal(STORAGE_KEYS.MAINTENANCE, current);
      return true;
    }
    throw new Error(res?.message || 'Failed to delete maintenance record on server');
  },

  // ===============================
  // 5. CONSUMABLES & CHEMICALS
  // ===============================
  async getConsumables() {
    try {
      const res = await api.get('/labs/consumables');
      if (res && res.success && Array.isArray(res.data)) {
        setLocal(STORAGE_KEYS.CONSUMABLES, res.data);
        return res.data;
      }
    } catch (_) {}
    return getLocal(STORAGE_KEYS.CONSUMABLES);
  },

  async saveConsumable(data) {
    const isEdit = Boolean(data._id || (data.id && String(data.id).length === 24));
    const id = data._id || data.id;
    const res = isEdit
      ? await api.put(`/labs/consumables/${id}`, data)
      : await api.post('/labs/consumables', data);

    if (res?.data || res?.success) {
      const saved = res.data || { ...data, _id: id };
      const current = getLocal(STORAGE_KEYS.CONSUMABLES);
      const idx = current.findIndex(c => (c._id && c._id === saved._id) || (c.id && c.id === saved.id));
      if (idx >= 0) {
        current[idx] = saved;
      } else {
        current.unshift(saved);
      }
      setLocal(STORAGE_KEYS.CONSUMABLES, current);
      return saved;
    }
    throw new Error(res?.message || 'Failed to save consumable on server');
  },

  async deleteConsumable(id) {
    const res = await api.delete(`/labs/consumables/${id}`);
    if (res && res.success !== false) {
      const current = getLocal(STORAGE_KEYS.CONSUMABLES).filter(c => c._id !== id && c.id !== id);
      setLocal(STORAGE_KEYS.CONSUMABLES, current);
      return true;
    }
    throw new Error(res?.message || 'Failed to delete consumable on server');
  },

  // ===============================
  // 6. CATEGORIES
  // ===============================
  async getCategories() {
    try {
      const res = await api.get('/labs/categories');
      if (res && res.success && Array.isArray(res.data)) {
        setLocal(STORAGE_KEYS.CATEGORIES, res.data);
        return res.data;
      }
    } catch (_) {}
    return getLocal(STORAGE_KEYS.CATEGORIES);
  },

  async saveCategory(data) {
    const isEdit = Boolean(data._id || (data.id && String(data.id).length === 24));
    const id = data._id || data.id;
    const res = isEdit
      ? await api.put(`/labs/categories/${id}`, data)
      : await api.post('/labs/categories', data);

    if (res?.data || res?.success) {
      const saved = res.data || { ...data, _id: id };
      const current = getLocal(STORAGE_KEYS.CATEGORIES);
      const idx = current.findIndex(c => (c._id && c._id === saved._id) || (c.id && c.id === saved.id));
      if (idx >= 0) {
        current[idx] = saved;
      } else {
        current.unshift(saved);
      }
      setLocal(STORAGE_KEYS.CATEGORIES, current);
      return saved;
    }
    throw new Error(res?.message || 'Failed to save category on server');
  },

  async deleteCategory(id) {
    const res = await api.delete(`/labs/categories/${id}`);
    if (res && res.success !== false) {
      const current = getLocal(STORAGE_KEYS.CATEGORIES).filter(c => c._id !== id && c.id !== id);
      setLocal(STORAGE_KEYS.CATEGORIES, current);
      return true;
    }
    throw new Error(res?.message || 'Failed to delete category on server');
  },

  // ===============================
  // 7. PRACTICALS
  // ===============================
  async getPracticals() {
    try {
      const res = await api.get('/labs/practicals');
      if (res && res.success && Array.isArray(res.data)) {
        setLocal(STORAGE_KEYS.PRACTICALS, res.data);
        return res.data;
      }
    } catch (_) {}
    return getLocal(STORAGE_KEYS.PRACTICALS);
  },

  async savePractical(data) {
    const isEdit = Boolean(data._id || (data.id && String(data.id).length === 24));
    const id = data._id || data.id;
    const res = isEdit
      ? await api.put(`/labs/practicals/${id}`, data)
      : await api.post('/labs/practicals', data);

    if (res?.data || res?.success) {
      const saved = res.data || { ...data, _id: id };
      const current = getLocal(STORAGE_KEYS.PRACTICALS);
      const idx = current.findIndex(p => (p._id && p._id === saved._id) || (p.id && p.id === saved.id));
      if (idx >= 0) {
        current[idx] = saved;
      } else {
        current.unshift(saved);
      }
      setLocal(STORAGE_KEYS.PRACTICALS, current);
      return saved;
    }
    throw new Error(res?.message || 'Failed to save practical on server');
  },

  async deletePractical(id) {
    const res = await api.delete(`/labs/practicals/${id}`);
    if (res && res.success !== false) {
      const current = getLocal(STORAGE_KEYS.PRACTICALS).filter(p => p._id !== id && p.id !== id);
      setLocal(STORAGE_KEYS.PRACTICALS, current);
      return true;
    }
    throw new Error(res?.message || 'Failed to delete practical on server');
  },

  // ===============================
  // 8. LAB SCHEDULES & TIMETABLE (SYNCED WITH CLASS ROUTINE)
  // ===============================
  async getSchedules(params = {}) {
    try {
      const query = new URLSearchParams();
      query.append('isLab', 'true');
      if (params.day && params.day !== 'All') query.append('day', params.day);
      if (params.status && params.status !== 'All') query.append('status', params.status);
      if (params.labId && params.labId !== 'All') query.append('labId', params.labId);
      if (params.search) query.append('search', params.search);

      const res = await api.get(`/labs/schedule?${query.toString()}`);
      if (res && res.success && Array.isArray(res.data)) {
        setLocal('stoofi_live_class_routines', res.data);
        return res.data;
      }
    } catch (_) {}

    // Fallback to local routines
    const routines = getLocal('stoofi_live_class_routines');
    let filtered = routines.filter(r => r.isLab || (r.labName && r.labName.trim() !== ''));
    if (params.day && params.day !== 'All') {
      filtered = filtered.filter(r => r.day === params.day);
    }
    if (params.status && params.status !== 'All') {
      filtered = filtered.filter(r => r.status === params.status);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(r => 
        (r.subject || '').toLowerCase().includes(q) ||
        (r.teacher || '').toLowerCase().includes(q) ||
        (r.labName || '').toLowerCase().includes(q) ||
        (r.className || '').toLowerCase().includes(q) ||
        (r.sectionName || '').toLowerCase().includes(q) ||
        (r.topic || '').toLowerCase().includes(q)
      );
    }
    return filtered;
  },

  async saveSchedule(data) {
    const payload = { ...data, isLab: true };
    const isEdit = Boolean(payload._id || (payload.id && String(payload.id).length === 24));
    const id = payload._id || payload.id;
    const res = isEdit
      ? await api.put(`/labs/schedule/${id}`, payload)
      : await api.post('/labs/schedule', payload);

    if (res?.data || res?.success) {
      const saved = res.data || { ...payload, _id: id };
      const current = getLocal('stoofi_live_class_routines');
      const idx = current.findIndex(s => (s._id && s._id === saved._id) || (s.id && s.id === saved.id));
      if (idx >= 0) {
        current[idx] = saved;
      } else {
        current.unshift(saved);
      }
      setLocal('stoofi_live_class_routines', current);
      return saved;
    }
    throw new Error(res?.message || 'Failed to save lab schedule on server');
  },

  async deleteSchedule(id) {
    const res = await api.delete(`/labs/schedule/${id}`);
    if (res && res.success !== false) {
      const current = getLocal('stoofi_live_class_routines').filter(s => s._id !== id && s.id !== id);
      setLocal('stoofi_live_class_routines', current);
      return true;
    }
    throw new Error(res?.message || 'Failed to delete lab schedule on server');
  }
};

export default labService;

