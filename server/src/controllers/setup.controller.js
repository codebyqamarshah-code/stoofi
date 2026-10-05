const AdminSetup = require('../models/AdminSetup');

const DEFAULT_SETUP_DATA = [
  // Purpose
  { type: 'Purpose', name: 'Admission Inquiry', description: 'Visits and queries related to new student admissions' },
  { type: 'Purpose', name: 'Fee Payment / Accounts', description: 'Fee clearance, voucher payment and finance matters' },
  { type: 'Purpose', name: 'Parent-Teacher Meeting', description: 'Scheduled academic consultations and progress meetings' },
  { type: 'Purpose', name: 'Document Collection', description: 'Collecting certificates, transcripts, or bonafide letters' },
  { type: 'Purpose', name: 'Official Institutional Visit', description: 'Board inspection, guest speaker, or administrative delegate' },
  { type: 'Purpose', name: 'General Campus Visit', description: 'Campus tour and general visitor meetings' },

  // Complaint Type
  { type: 'Complaint Type', name: 'Academic & Curriculum', description: 'Teaching quality, syllabus pacing, and exam inquiries' },
  { type: 'Complaint Type', name: 'Student Behavior & Discipline', description: 'Classroom conduct, bullying, or behavioral notices' },
  { type: 'Complaint Type', name: 'Transport & Bus Route', description: 'Bus delay, route adjustment, or driver feedback' },
  { type: 'Complaint Type', name: 'Fee & Billing Issue', description: 'Challan dispute, fine waiver, or transaction clarification' },
  { type: 'Complaint Type', name: 'Hostel & Dormitory', description: 'Dorm room maintenance, mess food, and curfew concerns' },
  { type: 'Complaint Type', name: 'Facilities & Hygiene', description: 'Cleanliness, sports equipment, or lab facility repair' },
  { type: 'Complaint Type', name: 'Staff / Teacher Conduct', description: 'Staff communication and administrative service' },

  // Source
  { type: 'Source', name: 'Online Website & Portal', description: 'Inquiry originated via official school web portal' },
  { type: 'Source', name: 'Social Media (FB / Insta / LinkedIn)', description: 'Digital social marketing campaigns' },
  { type: 'Source', name: 'Newspaper Advertisement', description: 'Print media publication and admission circular' },
  { type: 'Source', name: 'Direct Campus Walk-In', description: 'Walk-in visitor at reception front desk' },
  { type: 'Source', name: 'Parent / Guardian Referral', description: 'Recommendation by current student parents' },
  { type: 'Source', name: 'School Banner / Billboard', description: 'City billboard and banner advertisement' },

  // Reference
  { type: 'Reference', name: 'School Official Website', description: 'Official domain' },
  { type: 'Reference', name: 'Current Student Parent', description: 'Enrolled family referral' },
  { type: 'Reference', name: 'Faculty / Staff Member', description: 'Staff recommendation' },
  { type: 'Reference', name: 'School Alumni Network', description: 'Former graduate referral' },
  { type: 'Reference', name: 'Board of Intermediate & Secondary Education', description: 'Education board directive' },

  // Call Purpose
  { type: 'Call Purpose', name: 'Admission Inquiry', description: 'Inquiry regarding seats, eligibility, and fee structure' },
  { type: 'Call Purpose', name: 'Fee Due Follow-Up', description: 'Friendly reminder on unpaid monthly dues' },
  { type: 'Call Purpose', name: 'Attendance & Absence Verification', description: 'Verifying student absence or leave reason' },
  { type: 'Call Purpose', name: 'Student Discipline Notice', description: 'Calling guardian regarding student conduct' },
  { type: 'Call Purpose', name: 'Emergency Medical Contact', description: 'Urgent notification to parents' },
  { type: 'Call Purpose', name: 'General Information', description: 'Timings, holiday schedules, and general questions' },

  // Postal Type
  { type: 'Postal Type', name: 'Official Letter', description: 'Formal correspondence and circulars' },
  { type: 'Postal Type', name: 'Document / Transcript', description: 'Certificates and academic transcripts' },
  { type: 'Postal Type', name: 'Parcel / Package', description: 'Books, equipment, and packages' },
  { type: 'Postal Type', name: 'Confidential Envelope', description: 'Confidential HR or examination material' },
  { type: 'Postal Type', name: 'Government Notice', description: 'Education ministry / department directive' }
];

async function seedDefaultSetupIfEmpty() {
  try {
    const count = await AdminSetup.countDocuments();
    if (count === 0) {
      await AdminSetup.insertMany(DEFAULT_SETUP_DATA.map(d => ({ ...d, status: 'Active', isSystem: true })));
    }
  } catch (err) {
    console.error('Error seeding default admin setup:', err.message);
  }
}

// GET /api/setup
exports.getAll = async (req, res) => {
  try {
    await seedDefaultSetupIfEmpty();

    const { 
      search = '', 
      type = '', 
      status = '', 
      page = 1, 
      limit = 10,
      all = 'false'
    } = req.query;

    const query = {};

    if (search && search.trim()) {
      const regex = { $regex: search.trim(), $options: 'i' };
      query.$or = [
        { name: regex },
        { type: regex },
        { description: regex }
      ];
    }

    if (type && type !== 'All' && type.trim()) {
      query.type = type.trim();
    }

    if (status && status !== 'All' && status.trim()) {
      query.status = status.trim();
    }

    if (all === 'true') {
      const data = await AdminSetup.find(query).sort({ type: 1, name: 1 });
      return res.status(200).json({ success: true, data });
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      AdminSetup.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      AdminSetup.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/setup/stats
exports.getStats = async (req, res) => {
  try {
    await seedDefaultSetupIfEmpty();

    const [total, active, inactive, categories] = await Promise.all([
      AdminSetup.countDocuments(),
      AdminSetup.countDocuments({ status: 'Active' }),
      AdminSetup.countDocuments({ status: 'Inactive' }),
      AdminSetup.distinct('type')
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total,
        active,
        inactive,
        totalCategories: categories.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/setup/type/:type - Fetch all active items for a given category (e.g. Purpose, Source, Reference)
exports.getByType = async (req, res) => {
  try {
    await seedDefaultSetupIfEmpty();
    const type = req.params.type;
    const data = await AdminSetup.find({ type: { $regex: new RegExp(`^${type}$`, 'i') }, status: 'Active' }).sort({ name: 1 });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/setup/:id
exports.getById = async (req, res) => {
  try {
    const data = await AdminSetup.findById(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Setup record not found' });
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/setup
exports.create = async (req, res) => {
  try {
    const { type, name, description, status } = req.body;

    if (!type || !type.trim()) {
      return res.status(400).json({ success: false, message: 'Category type is required' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Setup item name is required' });
    }

    // Check duplicate in same type
    const existing = await AdminSetup.findOne({ 
      type: type.trim(), 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    });

    if (existing) {
      return res.status(400).json({ success: false, message: `An item named "${name.trim()}" already exists in category "${type.trim()}"` });
    }

    const newItem = await AdminSetup.create({
      type: type.trim(),
      name: name.trim(),
      description: (description || '').trim(),
      status: status || 'Active'
    });

    res.status(201).json({ success: true, data: newItem, message: 'Setup item created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/setup/:id
exports.update = async (req, res) => {
  try {
    const { type, name, description, status } = req.body;

    const item = await AdminSetup.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Setup record not found' });
    }

    if (type && type.trim()) item.type = type.trim();
    
    if (name && name.trim()) {
      if (name.trim().toLowerCase() !== item.name.toLowerCase()) {
        const duplicate = await AdminSetup.findOne({
          type: item.type,
          name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
          _id: { $ne: item._id }
        });
        if (duplicate) {
          return res.status(400).json({ success: false, message: `An item named "${name.trim()}" already exists in category "${item.type}"` });
        }
      }
      item.name = name.trim();
    }

    if (description !== undefined) item.description = (description || '').trim();
    if (status) item.status = status;

    const updated = await item.save();
    res.status(200).json({ success: true, data: updated, message: 'Setup item updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/setup/:id/status
exports.toggleStatus = async (req, res) => {
  try {
    const item = await AdminSetup.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Setup record not found' });
    }

    item.status = item.status === 'Active' ? 'Inactive' : 'Active';
    await item.save();

    res.status(200).json({ 
      success: true, 
      data: item, 
      message: `Setup item marked as ${item.status}` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/setup/:id
exports.remove = async (req, res) => {
  try {
    const item = await AdminSetup.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Setup record not found' });
    }

    await AdminSetup.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Setup record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
