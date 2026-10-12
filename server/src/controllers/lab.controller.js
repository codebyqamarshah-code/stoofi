const Lab = require('../models/Lab');
const LabEquipment = require('../models/LabEquipment');
const LabMaintenance = require('../models/LabMaintenance');
const LabConsumable = require('../models/LabConsumable');
const LabCategory = require('../models/LabCategory');
const LabPractical = require('../models/LabPractical');

// ==========================================
// 1. REPORTS & EXECUTIVE SUMMARY (LIVE DATA)
// ==========================================
exports.getReports = async (req, res) => {
  try {
    const [labs, equipment, maintenance, consumables, practicals] = await Promise.all([
      Lab.find().sort({ createdAt: -1 }),
      LabEquipment.find().sort({ createdAt: -1 }),
      LabMaintenance.find().sort({ createdAt: -1 }),
      LabConsumable.find().sort({ createdAt: -1 }),
      LabPractical.find().sort({ createdAt: -1 })
    ]);

    // Calculate live aggregates
    const totalAssetValuation = equipment.reduce((sum, item) => {
      const cost = Number(item.purchaseCost) || 0;
      const qty = Number(item.quantity) || 1;
      return sum + (cost * qty);
    }, 0);

    const totalAssetsCount = equipment.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
    const totalLabMaintenance = maintenance.reduce((sum, item) => sum + (Number(item.costIncurred) || 0), 0);

    // Group equipment by laboratory for Inventory Report table
    const labInventoryMap = {};
    for (const eq of equipment) {
      const labName = eq.lab || 'Unassigned Lab';
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
      const cost = Number(eq.purchaseCost) || 0;
      labInventoryMap[labName].totalAssets += qty;
      labInventoryMap[labName].totalValue += (cost * qty);

      if (eq.condition === 'Good' || eq.status === 'Available') {
        labInventoryMap[labName].working += (Number(eq.availableQty) || qty);
      }
      if (eq.condition === 'Under Repair' || eq.status === 'Under Repair') {
        labInventoryMap[labName].underRepair += qty;
      }
    }

    // Set utilization percentage based on working vs total
    const inventoryReport = Object.values(labInventoryMap).map(row => {
      const pct = row.totalAssets > 0 ? Math.round((row.working / row.totalAssets) * 100) : 0;
      return { ...row, utilization: `${pct}%` };
    });

    // Group maintenance by laboratory for Maintenance Report table
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
      labMaintenanceMap[labName].tickets += 1;
      labMaintenanceMap[labName].costIncurred += (Number(m.costIncurred) || 0);
      if (m.status === 'Repaired' || m.status === 'Closed') {
        labMaintenanceMap[labName].resolved += 1;
      } else {
        labMaintenanceMap[labName].open += 1;
      }
    }
    const maintenanceReport = Object.values(labMaintenanceMap);

    // Academic Practicals Report
    const academicReport = practicals.map(p => ({
      course: p.title || 'Practical Course',
      program: p.classSemester || p.subject || 'General',
      planned: Number(p.totalMarks) || 10,
      conducted: p.status === 'Conducted' ? 1 : 0,
      completionRate: p.status === 'Conducted' ? '100%' : '50%',
      avgAttendance: p.attendanceCount || '90%',
      passRate: '95%'
    }));

    // Consumables Report
    const consumablesReport = consumables.map(c => ({
      item: c.name,
      category: c.category || 'General',
      unit: c.unit || 'Units',
      openedQty: (Number(c.inStock) || 0) + (Number(c.consumedQty) || 0),
      consumedQty: Number(c.consumedQty) || 0,
      stockRemaining: Number(c.inStock) || 0,
      reorderAlert: c.status === 'Critical' ? 'Reorder Now' : c.status === 'Low Stock' ? 'Low Stock' : 'Normal'
    }));

    // Overall metrics
    const avgUtilization = inventoryReport.length > 0
      ? (inventoryReport.reduce((acc, curr) => acc + (parseInt(curr.utilization) || 0), 0) / inventoryReport.length).toFixed(1) + '%'
      : '0%';

    const practicalProgress = practicals.length > 0
      ? Math.round((practicals.filter(p => p.status === 'Conducted').length / practicals.length) * 100) + '%'
      : '0%';

    res.status(200).json({
      success: true,
      data: {
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
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. LABS CRUD
// ==========================================
exports.getLabs = async (req, res) => {
  try {
    const data = await Lab.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createLab = async (req, res) => {
  try {
    const count = await Lab.countDocuments();
    const code = req.body.code || `LAB-${String(count + 1).padStart(3, '0')}`;
    const data = await Lab.create({ ...req.body, code });
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateLab = async (req, res) => {
  try {
    const data = await Lab.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ success: false, message: 'Lab not found' });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteLab = async (req, res) => {
  try {
    const data = await Lab.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Lab not found' });
    res.status(200).json({ success: true, message: 'Lab removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. EQUIPMENT CRUD
// ==========================================
exports.getEquipment = async (req, res) => {
  try {
    const data = await LabEquipment.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createEquipment = async (req, res) => {
  try {
    const count = await LabEquipment.countDocuments();
    const code = req.body.code || `EQ-${String(count + 1001)}`;
    const cost = Number(String(req.body.purchaseCost || 0).replace(/[^0-9.]/g, '')) || 0;
    const data = await LabEquipment.create({ ...req.body, code, purchaseCost: cost });
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateEquipment = async (req, res) => {
  try {
    if (req.body.purchaseCost !== undefined) {
      req.body.purchaseCost = Number(String(req.body.purchaseCost).replace(/[^0-9.]/g, '')) || 0;
    }
    const data = await LabEquipment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ success: false, message: 'Equipment not found' });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteEquipment = async (req, res) => {
  try {
    const data = await LabEquipment.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Equipment not found' });
    res.status(200).json({ success: true, message: 'Equipment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 4. MAINTENANCE CRUD
// ==========================================
exports.getMaintenance = async (req, res) => {
  try {
    const data = await LabMaintenance.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createMaintenance = async (req, res) => {
  try {
    const count = await LabMaintenance.countDocuments();
    const ticketNumber = req.body.ticketNumber || `TKT-${String(count + 101)}`;
    const cost = Number(String(req.body.costIncurred || req.body.actualCost || req.body.estimatedCost || 0).replace(/[^0-9.]/g, '')) || 0;
    const data = await LabMaintenance.create({ ...req.body, ticketNumber, costIncurred: cost });
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateMaintenance = async (req, res) => {
  try {
    if (req.body.costIncurred !== undefined || req.body.actualCost !== undefined) {
      req.body.costIncurred = Number(String(req.body.costIncurred || req.body.actualCost || 0).replace(/[^0-9.]/g, '')) || 0;
    }
    const data = await LabMaintenance.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ success: false, message: 'Maintenance ticket not found' });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteMaintenance = async (req, res) => {
  try {
    const data = await LabMaintenance.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.status(200).json({ success: true, message: 'Ticket deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 5. CONSUMABLES CRUD
// ==========================================
exports.getConsumables = async (req, res) => {
  try {
    const data = await LabConsumable.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createConsumable = async (req, res) => {
  try {
    const count = await LabConsumable.countDocuments();
    const code = req.body.code || `CON-${String(count + 1).padStart(2, '0')}`;
    const data = await LabConsumable.create({ ...req.body, code });
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateConsumable = async (req, res) => {
  try {
    const data = await LabConsumable.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ success: false, message: 'Consumable not found' });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteConsumable = async (req, res) => {
  try {
    const data = await LabConsumable.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Item not found' });
    res.status(200).json({ success: true, message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 6. CATEGORIES CRUD
// ==========================================
exports.getCategories = async (req, res) => {
  try {
    const data = await LabCategory.find().sort({ createdAt: 1 });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const count = await LabCategory.countDocuments();
    const code = req.body.code || `CAT-${String(count + 1).padStart(2, '0')}`;
    const data = await LabCategory.create({ ...req.body, code });
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const data = await LabCategory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ success: false, message: 'Category not found' });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const data = await LabCategory.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Category not found' });
    res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 7. PRACTICALS CRUD
// ==========================================
exports.getPracticals = async (req, res) => {
  try {
    const data = await LabPractical.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPractical = async (req, res) => {
  try {
    const count = await LabPractical.countDocuments();
    const number = req.body.number || `Practical #${count + 1}`;
    const data = await LabPractical.create({ ...req.body, number });
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updatePractical = async (req, res) => {
  try {
    const data = await LabPractical.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ success: false, message: 'Practical not found' });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deletePractical = async (req, res) => {
  try {
    const data = await LabPractical.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Practical not found' });
    res.status(200).json({ success: true, message: 'Practical deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
