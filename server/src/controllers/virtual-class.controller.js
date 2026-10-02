const VirtualClass = require('../models/VirtualClass');

function generateMeetCode() {
  const p1 = Math.random().toString(36).substring(2, 5);
  const p2 = Math.random().toString(36).substring(2, 6);
  const p3 = Math.random().toString(36).substring(2, 5);
  return `${p1}-${p2}-${p3}`;
}

function normalizeMeetUrl(codeOrUrl) {
  if (!codeOrUrl) {
    const code = generateMeetCode();
    return { code, url: `https://meet.google.com/${code}` };
  }
  let trimmed = codeOrUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    const parts = trimmed.split('/');
    const code = parts[parts.length - 1].split('?')[0];
    return { code, url: trimmed };
  }
  return { code: trimmed, url: `https://meet.google.com/${trimmed}` };
}

// GET /api/virtual-class
exports.getVirtualClasses = async (req, res) => {
  try {
    const { type, status, classVal, search } = req.query;
    const query = {};

    if (type) query.type = type;
    if (status && status !== 'All') query.status = status;
    if (classVal && classVal !== 'All' && classVal !== 'All Classes') query.classVal = classVal;

    if (search) {
      query.$or = [
        { topic: { $regex: search, $options: 'i' } },
        { teacher: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { meetCode: { $regex: search, $options: 'i' } },
      ];
    }

    const classes = await VirtualClass.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: classes.length,
      data: classes,
    });
  } catch (error) {
    console.error('getVirtualClasses error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/virtual-class/reports
exports.getReports = async (req, res) => {
  try {
    const { type = 'class', classVal, fromDate, toDate } = req.query;
    const query = { type };

    if (classVal && classVal !== 'All' && classVal !== 'All Classes') {
      query.classVal = classVal;
    }

    if (fromDate && toDate) {
      query.date = { $gte: fromDate, $lte: toDate };
    }

    const records = await VirtualClass.find(query).sort({ date: -1, createdAt: -1 });

    const totalClasses = records.length;
    const liveClasses = records.filter(r => r.status === 'Live').length;
    const completedClasses = records.filter(r => r.status === 'Completed').length;
    const totalDurationMins = records.reduce((acc, r) => acc + (r.duration || 0), 0);
    const totalEnrolled = records.reduce((acc, r) => acc + (r.totalEnrolled || 0), 0);
    const totalAttended = records.reduce((acc, r) => acc + (r.attendedCount || 0), 0);
    const avgAttendance = totalEnrolled > 0 ? ((totalAttended / totalEnrolled) * 100).toFixed(1) : '0';

    return res.status(200).json({
      success: true,
      stats: {
        totalClasses,
        liveClasses,
        completedClasses,
        totalHours: (totalDurationMins / 60).toFixed(1),
        totalAttended,
        totalEnrolled,
        avgAttendance: `${avgAttendance}%`,
      },
      data: records.map(r => ({
        ...r.toObject(),
        percentage: r.totalEnrolled > 0 ? `${((r.attendedCount / r.totalEnrolled) * 100).toFixed(1)}%` : '0%',
      })),
    });
  } catch (error) {
    console.error('getReports error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/virtual-class/:id
exports.getVirtualClassById = async (req, res) => {
  try {
    const item = await VirtualClass.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Virtual class/meeting not found' });
    }
    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/virtual-class
exports.createVirtualClass = async (req, res) => {
  try {
    const {
      topic,
      type = 'class',
      provider = 'gmeet',
      classVal = 'Class 10',
      section = 'A',
      subject = 'General',
      teacher,
      hostEmail,
      audience = 'All Students',
      date,
      time,
      duration = 45,
      meetCode,
      roomUrl,
      description,
      status = 'Scheduled',
    } = req.body;

    if (!topic || !teacher || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Topic, teacher/host, date, and time are required.',
      });
    }

    const { code, url } = normalizeMeetUrl(roomUrl || meetCode);

    const newVirtualClass = await VirtualClass.create({
      topic,
      type,
      provider,
      classVal,
      section,
      subject,
      teacher,
      hostEmail,
      audience,
      date,
      time,
      duration: Number(duration) || 45,
      meetCode: code,
      roomUrl: url,
      description,
      status,
      totalEnrolled: classVal.includes('All') ? 100 : 35,
      attendedCount: 0,
      createdBy: req.user ? req.user.id : null,
    });

    return res.status(201).json({
      success: true,
      message: 'Virtual class/meeting scheduled successfully!',
      data: newVirtualClass,
    });
  } catch (error) {
    console.error('createVirtualClass error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/virtual-class/:id
exports.updateVirtualClass = async (req, res) => {
  try {
    const { roomUrl, meetCode } = req.body;
    let updatePayload = { ...req.body };

    if (roomUrl || meetCode) {
      const { code, url } = normalizeMeetUrl(roomUrl || meetCode);
      updatePayload.meetCode = code;
      updatePayload.roomUrl = url;
    }

    const updated = await VirtualClass.findByIdAndUpdate(req.params.id, updatePayload, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Virtual class updated successfully!',
      data: updated,
    });
  } catch (error) {
    console.error('updateVirtualClass error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/virtual-class/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Scheduled', 'Live', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const updated = await VirtualClass.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    return res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/virtual-class/:id
exports.deleteVirtualClass = async (req, res) => {
  try {
    const deleted = await VirtualClass.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Virtual class/meeting deleted successfully!',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
