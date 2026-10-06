const IDCard = require('../models/IDCard');

const DEFAULT_ID_CARDS = [
  {
    title: 'Official Student Identity Card',
    role: 'Student',
    cardLayout: 'vertical',
    themeStyle: 'stoofi-emerald',
    headerText: 'OFFICIAL IDENTITY CARD',
    footerText: 'Principal Signature & Seal',
    showPhoto: true,
    showAdmissionNo: true,
    showRollNo: true,
    showClass: true,
    showSection: true,
    showFatherName: true,
    showPhone: true,
    showBloodGroup: true,
    showDob: true,
    showDesignation: false,
    showDepartment: false,
    showQrBarcode: true,
    status: 'Active',
    isDefault: true
  },
  {
    title: 'Faculty & Teacher Smart ID Card',
    role: 'Teacher',
    cardLayout: 'vertical',
    themeStyle: 'classic-navy',
    headerText: 'FACULTY IDENTITY CARD',
    footerText: 'Director of Academics',
    showPhoto: true,
    showAdmissionNo: false,
    showRollNo: false,
    showClass: false,
    showSection: false,
    showFatherName: false,
    showPhone: true,
    showBloodGroup: true,
    showDob: false,
    showDesignation: true,
    showDepartment: true,
    showQrBarcode: true,
    status: 'Active',
    isDefault: true
  },
  {
    title: 'Staff & Employee Identity Card',
    role: 'Staff',
    cardLayout: 'vertical',
    themeStyle: 'modern-slate',
    headerText: 'STAFF IDENTITY CARD',
    footerText: 'HR & Administrative Seal',
    showPhoto: true,
    showAdmissionNo: false,
    showRollNo: false,
    showClass: false,
    showSection: false,
    showFatherName: false,
    showPhone: true,
    showBloodGroup: true,
    showDob: false,
    showDesignation: true,
    showDepartment: true,
    showQrBarcode: true,
    status: 'Active',
    isDefault: true
  },

  {
    title: 'Premium Horizontal Student ID Card',
    role: 'Student',
    cardLayout: 'horizontal',
    themeStyle: 'royal-purple',
    headerText: 'STUDENT ID CARD',
    footerText: 'School Seal & Signature',
    showPhoto: true,
    showAdmissionNo: true,
    showRollNo: true,
    showClass: true,
    showSection: true,
    showFatherName: false,
    showPhone: true,
    showBloodGroup: false,
    showDob: true,
    showDesignation: false,
    showDepartment: false,
    showQrBarcode: true,
    status: 'Active',
    isDefault: true
  },
  {
    title: 'Executive Staff ID Card',
    role: 'Staff',
    cardLayout: 'horizontal',
    themeStyle: 'classic-navy',
    headerText: 'EXECUTIVE STAFF CARD',
    footerText: 'Authorized Signature',
    showPhoto: true,
    showAdmissionNo: false,
    showRollNo: false,
    showClass: false,
    showSection: false,
    showFatherName: false,
    showPhone: true,
    showBloodGroup: true,
    showDob: false,
    showDesignation: true,
    showDepartment: true,
    showQrBarcode: true,
    status: 'Active',
    isDefault: true
  }
];

async function seedDefaultIDCardsIfEmpty() {
  try {
    const count = await IDCard.countDocuments();
    if (count === 0) {
      await IDCard.insertMany(DEFAULT_ID_CARDS);
    }
  } catch (err) {
    console.error('Error seeding default ID card templates:', err.message);
  }
}

// GET /api/id-card
exports.getAll = async (req, res) => {
  try {
    await seedDefaultIDCardsIfEmpty();

    const { 
      search = '', 
      role = '', 
      status = '', 
      page = 1, 
      limit = 10,
      all = 'false'
    } = req.query;

    const query = {};

    if (search && search.trim()) {
      const regex = { $regex: search.trim(), $options: 'i' };
      query.$or = [
        { title: regex },
        { role: regex },
        { headerText: regex }
      ];
    }

    if (role && role !== 'All' && role.trim()) {
      query.role = role.trim();
    }

    if (status && status !== 'All' && status.trim()) {
      query.status = status.trim();
    }

    if (all === 'true') {
      const data = await IDCard.find(query).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, data });
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      IDCard.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      IDCard.countDocuments(query)
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

// GET /api/id-card/stats
exports.getStats = async (req, res) => {
  try {
    await seedDefaultIDCardsIfEmpty();

    const [total, studentCards, staffCards, activeCards] = await Promise.all([
      IDCard.countDocuments(),
      IDCard.countDocuments({ role: 'Student' }),
      IDCard.countDocuments({ role: { $in: ['Staff', 'Teacher'] } }),
      IDCard.countDocuments({ status: 'Active' })
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total,
        studentCards,
        staffCards,
        activeCards
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/id-card/:id
exports.getById = async (req, res) => {
  try {
    const data = await IDCard.findById(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'ID card template not found' });
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/id-card
exports.create = async (req, res) => {
  try {
    const { 
      title, 
      role, 
      cardLayout, 
      themeStyle, 
      headerText, 
      footerText,
      showPhoto,
      showAdmissionNo,
      showRollNo,
      showClass,
      showSection,
      showFatherName,
      showPhone,
      showBloodGroup,
      showDob,
      showDesignation,
      showDepartment,
      showQrBarcode,
      status 
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'ID Card title is required' });
    }

    if (!role || !role.trim()) {
      return res.status(400).json({ success: false, message: 'Target role is required' });
    }

    const newCard = await IDCard.create({
      title: title.trim(),
      role: role.trim(),
      cardLayout: cardLayout || 'vertical',
      themeStyle: themeStyle || 'stoofi-emerald',
      headerText: (headerText || 'OFFICIAL IDENTITY CARD').trim(),
      footerText: (footerText || 'Principal Signature & Seal').trim(),
      showPhoto: showPhoto !== undefined ? showPhoto : true,
      showAdmissionNo: showAdmissionNo !== undefined ? showAdmissionNo : true,
      showRollNo: showRollNo !== undefined ? showRollNo : true,
      showClass: showClass !== undefined ? showClass : true,
      showSection: showSection !== undefined ? showSection : true,
      showFatherName: showFatherName !== undefined ? showFatherName : true,
      showPhone: showPhone !== undefined ? showPhone : true,
      showBloodGroup: showBloodGroup !== undefined ? showBloodGroup : true,
      showDob: showDob !== undefined ? showDob : true,
      showDesignation: showDesignation !== undefined ? showDesignation : true,
      showDepartment: showDepartment !== undefined ? showDepartment : true,
      showQrBarcode: showQrBarcode !== undefined ? showQrBarcode : true,
      status: status || 'Active'
    });

    res.status(201).json({ success: true, data: newCard, message: 'ID Card template created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/id-card/:id
exports.update = async (req, res) => {
  try {
    const card = await IDCard.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ success: false, message: 'ID card template not found' });
    }

    const { 
      title, 
      role, 
      cardLayout, 
      themeStyle, 
      headerText, 
      footerText,
      showPhoto,
      showAdmissionNo,
      showRollNo,
      showClass,
      showSection,
      showFatherName,
      showPhone,
      showBloodGroup,
      showDob,
      showDesignation,
      showDepartment,
      showQrBarcode,
      status 
    } = req.body;

    if (title) card.title = title.trim();
    if (role) card.role = role.trim();
    if (cardLayout) card.cardLayout = cardLayout;
    if (themeStyle) card.themeStyle = themeStyle;
    if (headerText !== undefined) card.headerText = (headerText || '').trim();
    if (footerText !== undefined) card.footerText = (footerText || '').trim();
    if (showPhoto !== undefined) card.showPhoto = showPhoto;
    if (showAdmissionNo !== undefined) card.showAdmissionNo = showAdmissionNo;
    if (showRollNo !== undefined) card.showRollNo = showRollNo;
    if (showClass !== undefined) card.showClass = showClass;
    if (showSection !== undefined) card.showSection = showSection;
    if (showFatherName !== undefined) card.showFatherName = showFatherName;
    if (showPhone !== undefined) card.showPhone = showPhone;
    if (showBloodGroup !== undefined) card.showBloodGroup = showBloodGroup;
    if (showDob !== undefined) card.showDob = showDob;
    if (showDesignation !== undefined) card.showDesignation = showDesignation;
    if (showDepartment !== undefined) card.showDepartment = showDepartment;
    if (showQrBarcode !== undefined) card.showQrBarcode = showQrBarcode;
    if (status) card.status = status;

    const updated = await card.save();
    res.status(200).json({ success: true, data: updated, message: 'ID Card template updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/id-card/:id/status
exports.toggleStatus = async (req, res) => {
  try {
    const card = await IDCard.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ success: false, message: 'ID card template not found' });
    }

    card.status = card.status === 'Active' ? 'Inactive' : 'Active';
    await card.save();

    res.status(200).json({ 
      success: true, 
      data: card, 
      message: `ID Card template marked as ${card.status}` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/id-card/:id
exports.remove = async (req, res) => {
  try {
    const card = await IDCard.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ success: false, message: 'ID card template not found' });
    }

    await IDCard.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'ID card template deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
