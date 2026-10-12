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
    let saved = null;
    try {
      if (labData._id || labData.id && String(labData.id).length === 24) {
        const id = labData._id || labData.id;
        const res = await api.put(`/labs/${id}`, labData);
        if (res && res.success) saved = res.data;
      } else {
        const res = await api.post('/labs', labData);
        if (res && res.success) saved = res.data;
      }
    } catch (_) {}

    // Sync local
    const current = getLocal(STORAGE_KEYS.LABS);
    if (!saved) {
      saved = {
        ...labData,
        id: labData.id || `LAB-${String(current.length + 1).padStart(3, '0')}`,
        code: labData.code || `LAB-${Math.floor(100 + Math.random() * 900)}`
      };
    }
    const idx = current.findIndex(l => (l._id && l._id === saved._id) || (l.id && l.id === saved.id));
    if (idx >= 0) {
      current[idx] = saved;
    } else {
      current.unshift(saved);
    }
    setLocal(STORAGE_KEYS.LABS, current);
    return saved;
  },

  async deleteLab(id) {
    try {
      await api.delete(`/labs/${id}`);
    } catch (_) {}
    const current = getLocal(STORAGE_KEYS.LABS).filter(l => l._id !== id && l.id !== id);
    setLocal(STORAGE_KEYS.LABS, current);
    return true;
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
    let saved = null;
    try {
      if (data._id || data.id && String(data.id).length === 24) {
        const id = data._id || data.id;
        const res = await api.put(`/labs/equipment/${id}`, data);
        if (res && res.success) saved = res.data;
      } else {
        const res = await api.post('/labs/equipment', data);
        if (res && res.success) saved = res.data;
      }
    } catch (_) {}

    const current = getLocal(STORAGE_KEYS.EQUIPMENT);
    if (!saved) {
      saved = {
        ...data,
        id: data.id || `EQ-${String(current.length + 1001)}`,
        code: data.code || `EQ-${Math.floor(1000 + Math.random() * 9000)}`
      };
    }
    const idx = current.findIndex(e => (e._id && e._id === saved._id) || (e.id && e.id === saved.id));
    if (idx >= 0) {
      current[idx] = saved;
    } else {
      current.unshift(saved);
    }
    setLocal(STORAGE_KEYS.EQUIPMENT, current);
    return saved;
  },

  async deleteEquipment(id) {
    try {
      await api.delete(`/labs/equipment/${id}`);
    } catch (_) {}
    const current = getLocal(STORAGE_KEYS.EQUIPMENT).filter(e => e._id !== id && e.id !== id);
    setLocal(STORAGE_KEYS.EQUIPMENT, current);
    return true;
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
    let saved = null;
    try {
      if (data._id || data.id && String(data.id).length === 24) {
        const id = data._id || data.id;
        const res = await api.put(`/labs/maintenance/${id}`, data);
        if (res && res.success) saved = res.data;
      } else {
        const res = await api.post('/labs/maintenance', data);
        if (res && res.success) saved = res.data;
      }
    } catch (_) {}

    const current = getLocal(STORAGE_KEYS.MAINTENANCE);
    if (!saved) {
      saved = {
        ...data,
        id: data.id || `TKT-${String(current.length + 101)}`,
        ticketNumber: data.ticketNumber || `TKT-${String(current.length + 101)}`
      };
    }
    const idx = current.findIndex(m => (m._id && m._id === saved._id) || (m.id && m.id === saved.id));
    if (idx >= 0) {
      current[idx] = saved;
    } else {
      current.unshift(saved);
    }
    setLocal(STORAGE_KEYS.MAINTENANCE, current);
    return saved;
  },

  async deleteMaintenance(id) {
    try {
      await api.delete(`/labs/maintenance/${id}`);
    } catch (_) {}
    const current = getLocal(STORAGE_KEYS.MAINTENANCE).filter(m => m._id !== id && m.id !== id);
    setLocal(STORAGE_KEYS.MAINTENANCE, current);
    return true;
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
    let saved = null;
    try {
      if (data._id || data.id && String(data.id).length === 24) {
        const id = data._id || data.id;
        const res = await api.put(`/labs/consumables/${id}`, data);
        if (res && res.success) saved = res.data;
      } else {
        const res = await api.post('/labs/consumables', data);
        if (res && res.success) saved = res.data;
      }
    } catch (_) {}

    const current = getLocal(STORAGE_KEYS.CONSUMABLES);
    if (!saved) {
      saved = {
        ...data,
        id: data.id || `CON-${String(current.length + 1).padStart(2, '0')}`,
        code: data.code || `CON-${String(current.length + 1).padStart(2, '0')}`
      };
    }
    const idx = current.findIndex(c => (c._id && c._id === saved._id) || (c.id && c.id === saved.id));
    if (idx >= 0) {
      current[idx] = saved;
    } else {
      current.unshift(saved);
    }
    setLocal(STORAGE_KEYS.CONSUMABLES, current);
    return saved;
  },

  async deleteConsumable(id) {
    try {
      await api.delete(`/labs/consumables/${id}`);
    } catch (_) {}
    const current = getLocal(STORAGE_KEYS.CONSUMABLES).filter(c => c._id !== id && c.id !== id);
    setLocal(STORAGE_KEYS.CONSUMABLES, current);
    return true;
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
    let saved = null;
    try {
      if (data._id || data.id && String(data.id).length === 24) {
        const id = data._id || data.id;
        const res = await api.put(`/labs/categories/${id}`, data);
        if (res && res.success) saved = res.data;
      } else {
        const res = await api.post('/labs/categories', data);
        if (res && res.success) saved = res.data;
      }
    } catch (_) {}

    const current = getLocal(STORAGE_KEYS.CATEGORIES);
    if (!saved) {
      saved = {
        ...data,
        id: data.id || Date.now(),
        code: data.code || `CAT-${String(current.length + 1).padStart(2, '0')}`
      };
    }
    const idx = current.findIndex(c => (c._id && c._id === saved._id) || (c.id && c.id === saved.id));
    if (idx >= 0) {
      current[idx] = saved;
    } else {
      current.unshift(saved);
    }
    setLocal(STORAGE_KEYS.CATEGORIES, current);
    return saved;
  },

  async deleteCategory(id) {
    try {
      await api.delete(`/labs/categories/${id}`);
    } catch (_) {}
    const current = getLocal(STORAGE_KEYS.CATEGORIES).filter(c => c._id !== id && c.id !== id);
    setLocal(STORAGE_KEYS.CATEGORIES, current);
    return true;
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
    let saved = null;
    try {
      if (data._id || data.id && String(data.id).length === 24) {
        const id = data._id || data.id;
        const res = await api.put(`/labs/practicals/${id}`, data);
        if (res && res.success) saved = res.data;
      } else {
        const res = await api.post('/labs/practicals', data);
        if (res && res.success) saved = res.data;
      }
    } catch (_) {}

    const current = getLocal(STORAGE_KEYS.PRACTICALS);
    if (!saved) {
      saved = {
        ...data,
        id: data.id || `PRAC-${String(current.length + 1).padStart(3, '0')}`,
        number: data.number || `Practical #${current.length + 1}`
      };
    }
    const idx = current.findIndex(p => (p._id && p._id === saved._id) || (p.id && p.id === saved.id));
    if (idx >= 0) {
      current[idx] = saved;
    } else {
      current.unshift(saved);
    }
    setLocal(STORAGE_KEYS.PRACTICALS, current);
    return saved;
  },

  async deletePractical(id) {
    try {
      await api.delete(`/labs/practicals/${id}`);
    } catch (_) {}
    const current = getLocal(STORAGE_KEYS.PRACTICALS).filter(p => p._id !== id && p.id !== id);
    setLocal(STORAGE_KEYS.PRACTICALS, current);
    return true;
  }
};

export default labService;
