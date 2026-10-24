const FeesGroup = require('../models/FeesGroup');
const FeesType = require('../models/FeesType');
const Student = require('../models/Student');
const FeesInvoice = require('../models/FeesInvoice');

// --- FEES GROUP ---
exports.getFeesGroups = async (req, res) => {
  try {
    const data = await FeesGroup.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createFeesGroup = async (req, res) => {
  try {
    const data = await FeesGroup.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateFeesGroup = async (req, res) => {
  try {
    const data = await FeesGroup.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteFeesGroup = async (req, res) => {
  try {
    await FeesGroup.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- FEES TYPE ---
exports.getFeesTypes = async (req, res) => {
  try {
    const data = await FeesType.find().populate('feesGroup').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createFeesType = async (req, res) => {
  try {
    const data = await FeesType.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateFeesType = async (req, res) => {
  try {
    const data = await FeesType.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteFeesType = async (req, res) => {
  try {
    await FeesType.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- FEES CARRY FORWARD ---
exports.getCarryForward = async (req, res) => {
  try {
    const { class: cls, section, search } = req.query;
    const query = {};
    const conditions = [];

    if (cls && cls.trim()) {
      const cleanCls = cls.replace(/^class\s+/i, '').trim();
      conditions.push({
        $or: [
          { className: new RegExp(`^${cls.trim()}$`, 'i') },
          { className: new RegExp(`^Class\\s*${cleanCls}$`, 'i') },
          { className: new RegExp(`^${cleanCls}$`, 'i') }
        ]
      });
    }

    if (section && section.trim()) {
      const cleanSec = section.replace(/^section\s+/i, '').trim();
      conditions.push({
        $or: [
          { section: new RegExp(`^${section.trim()}$`, 'i') },
          { section: new RegExp(`^Section\\s*${cleanSec}$`, 'i') },
          { section: new RegExp(`^${cleanSec}$`, 'i') }
        ]
      });
    }

    if (search && search.trim()) {
      const sReg = new RegExp(search.trim(), 'i');
      conditions.push({
        $or: [
          { firstName: sReg },
          { lastName: sReg },
          { admissionNo: sReg },
          { rollNo: sReg }
        ]
      });
    }

    if (conditions.length > 0) {
      query.$and = conditions;
    }

    const students = await Student.find(query)
      .select('-studentPhoto -photo')
      .lean();
    students.sort((a, b) => {
      const rA = String(a.rollNo || '').trim();
      const rB = String(b.rollNo || '').trim();
      if (rA !== rB) return rA.localeCompare(rB, undefined, { numeric: true, sensitivity: 'base' });
      return String(a.admissionNo || '').localeCompare(String(b.admissionNo || ''), undefined, { numeric: true, sensitivity: 'base' });
    });

    // Calculate pending invoice balance for each student
    const studentAdmissions = students.map(s => s.admissionNo).filter(Boolean);
    const unpaidInvoices = await FeesInvoice.find({
      admissionNo: { $in: studentAdmissions },
      status: { $in: ['Unpaid', 'Partial', 'UNPAID', 'PARTIAL'] }
    });

    const data = students.map(st => {
      const stuInvoices = unpaidInvoices.filter(inv => inv.admissionNo === st.admissionNo);
      const pendingBalance = stuInvoices.reduce((acc, inv) => acc + (Number(inv.balance) || 0), 0);
      const previousArrears = Number(st.carryForwardAmount) || 0;
      const totalDue = pendingBalance > 0 ? pendingBalance : previousArrears;

      return {
        _id: st._id,
        admissionNo: st.admissionNo,
        rollNo: st.rollNo || '—',
        studentName: `${st.firstName || ''} ${st.lastName || ''}`.trim() || 'Student',
        className: st.className,
        section: st.section,
        fatherName: st.fatherName || '—',
        previousBalance: totalDue,
        carryForwardAmount: totalDue,
        status: totalDue > 0 ? 'Pending Dues' : 'Cleared'
      };
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.saveCarryForward = async (req, res) => {
  try {
    const { items } = req.body; // array of { studentId, admissionNo, carryForwardAmount, studentName, className, section }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items provided' });
    }

    const updated = [];
    for (const item of items) {
      const amount = Number(item.carryForwardAmount) || 0;
      if (item.studentId) {
        await Student.findByIdAndUpdate(item.studentId, { carryForwardAmount: amount });
      }

      // If carry forward amount > 0, generate or update a FeesInvoice record for official record
      if (amount > 0 && item.admissionNo) {
        const invNo = `CF-${item.admissionNo}-${new Date().getFullYear()}`;
        await FeesInvoice.findOneAndUpdate(
          { invoiceNo: invNo },
          {
            student: item.studentName,
            admissionNo: item.admissionNo,
            className: item.className,
            feeType: 'Previous Session Arrears',
            amount: amount,
            waiver: 0,
            fine: 0,
            paid: 0,
            balance: amount,
            status: 'Unpaid',
            date: new Date(),
            note: 'Carried forward from previous academic session'
          },
          { upsert: true, new: true }
        );
      }
      updated.push(item);
    }

    res.status(200).json({ success: true, message: `Successfully carried forward fees for ${updated.length} students`, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
