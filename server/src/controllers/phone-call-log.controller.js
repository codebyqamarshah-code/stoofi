const PhoneCallLog = require('../models/PhoneCallLog');

// Helper to sanitize phone numbers
function sanitizePhone(phone) {
  if (!phone) return '';
  return phone.replace(/[\s\-()]/g, '');
}

// GET /api/phone-call-log
exports.getAll = async (req, res) => {
  try {
    const { 
      search = '', 
      callType = '', 
      contactType = '', 
      followUpStatus = '', 
      purpose = '', 
      date = '', 
      page = 1, 
      limit = 10,
      all = 'false'
    } = req.query;

    const query = {};

    if (search && search.trim()) {
      const s = search.trim();
      const regex = { $regex: s, $options: 'i' };
      query.$or = [
        { name: regex },
        { phone: { $regex: sanitizePhone(s) || s, $options: 'i' } },
        { purpose: regex },
        { description: regex },
        { relatedPersonName: regex },
        { assignedTo: regex }
      ];
    }

    if (callType && callType !== 'All' && callType.trim()) {
      query.callType = callType.trim();
    }

    if (contactType && contactType !== 'All' && contactType.trim()) {
      query.contactType = contactType.trim();
    }

    if (followUpStatus && followUpStatus !== 'All' && followUpStatus.trim()) {
      query.followUpStatus = followUpStatus.trim();
    }

    if (purpose && purpose !== 'All' && purpose.trim()) {
      query.purpose = purpose.trim();
    }

    if (date && date.trim()) {
      query.date = date.trim();
    }

    if (all === 'true') {
      const data = await PhoneCallLog.find(query).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, data });
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      PhoneCallLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      PhoneCallLog.countDocuments(query)
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

// GET /api/phone-call-log/stats
exports.getStats = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const [total, incoming, outgoing, followUpsPending, callsToday] = await Promise.all([
      PhoneCallLog.countDocuments(),
      PhoneCallLog.countDocuments({ callType: 'Incoming' }),
      PhoneCallLog.countDocuments({ callType: 'Outgoing' }),
      PhoneCallLog.countDocuments({ followUpStatus: 'Pending' }),
      PhoneCallLog.countDocuments({ date: todayStr })
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total,
        incoming,
        outgoing,
        followUpsPending,
        callsToday
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/phone-call-log/:id
exports.getById = async (req, res) => {
  try {
    const data = await PhoneCallLog.findById(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Phone call record not found' });
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/phone-call-log
exports.create = async (req, res) => {
  try {
    const {
      callType,
      name,
      phone,
      contactType,
      relatedPersonId,
      relatedModel,
      relatedPersonName,
      purpose,
      date,
      time,
      duration,
      followUp,
      followUpDate,
      followUpStatus,
      assignedTo,
      assignedToId,
      description,
      note
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Caller / Contact name is required' });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    if (!purpose || !purpose.trim()) {
      return res.status(400).json({ success: false, message: 'Call purpose is required' });
    }

    let resolvedFollowUpStatus = followUpStatus;
    if (followUp === 'Yes') {
      resolvedFollowUpStatus = resolvedFollowUpStatus && resolvedFollowUpStatus !== 'Not Required' ? resolvedFollowUpStatus : 'Pending';
      if (!followUpDate) {
        return res.status(400).json({ success: false, message: 'Follow-up date is required when Follow Up is set to Yes' });
      }
    } else {
      resolvedFollowUpStatus = 'Not Required';
    }

    const newLog = await PhoneCallLog.create({
      callType: callType || 'Incoming',
      name: name.trim(),
      phone: phone.trim(),
      contactType: contactType || 'Parent / Guardian',
      relatedPersonId: relatedPersonId || null,
      relatedModel: relatedModel || 'Student',
      relatedPersonName: (relatedPersonName || '').trim(),
      purpose: purpose.trim(),
      date: date || new Date().toISOString().split('T')[0],
      time: (time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })).trim(),
      duration: (duration || '5 mins').trim(),
      followUp: followUp || 'No',
      followUpDate: followUp === 'Yes' ? followUpDate : '',
      followUpStatus: resolvedFollowUpStatus,
      assignedTo: (assignedTo || 'Front Desk Admin').trim(),
      assignedToId: assignedToId || null,
      description: (description || '').trim(),
      note: (note || '').trim()
    });

    res.status(201).json({ success: true, data: newLog, message: 'Phone call logged successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/phone-call-log/:id
exports.update = async (req, res) => {
  try {
    const log = await PhoneCallLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Phone call record not found' });
    }

    const {
      callType,
      name,
      phone,
      contactType,
      relatedPersonId,
      relatedModel,
      relatedPersonName,
      purpose,
      date,
      time,
      duration,
      followUp,
      followUpDate,
      followUpStatus,
      assignedTo,
      assignedToId,
      description,
      note
    } = req.body;

    if (name) log.name = name.trim();
    if (phone) log.phone = phone.trim();
    if (callType) log.callType = callType;
    if (contactType) log.contactType = contactType;
    if (relatedPersonId !== undefined) log.relatedPersonId = relatedPersonId || null;
    if (relatedModel !== undefined) log.relatedModel = relatedModel || 'Student';
    if (relatedPersonName !== undefined) log.relatedPersonName = (relatedPersonName || '').trim();
    if (purpose) log.purpose = purpose.trim();
    if (date) log.date = date;
    if (time !== undefined) log.time = (time || '').trim();
    if (duration !== undefined) log.duration = (duration || '').trim();
    if (followUp !== undefined) log.followUp = followUp;
    if (followUpDate !== undefined) log.followUpDate = followUp === 'Yes' ? followUpDate : '';
    
    if (followUpStatus !== undefined) {
      log.followUpStatus = followUpStatus;
    } else if (followUp === 'Yes' && log.followUpStatus === 'Not Required') {
      log.followUpStatus = 'Pending';
    } else if (followUp === 'No') {
      log.followUpStatus = 'Not Required';
    }

    if (assignedTo !== undefined) log.assignedTo = (assignedTo || 'Front Desk Admin').trim();
    if (assignedToId !== undefined) log.assignedToId = assignedToId || null;
    if (description !== undefined) log.description = (description || '').trim();
    if (note !== undefined) log.note = (note || '').trim();

    const updated = await log.save();
    res.status(200).json({ success: true, data: updated, message: 'Phone call record updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/phone-call-log/:id/follow-up - Quick toggle/update follow up status
exports.toggleFollowUp = async (req, res) => {
  try {
    const log = await PhoneCallLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Phone call record not found' });
    }

    const { status } = req.body;
    if (status) {
      log.followUpStatus = status;
      if (status === 'Pending' || status === 'Completed') {
        log.followUp = 'Yes';
      }
    } else {
      // Toggle between Pending and Completed
      log.followUpStatus = log.followUpStatus === 'Completed' ? 'Pending' : 'Completed';
      log.followUp = 'Yes';
    }

    await log.save();
    res.status(200).json({ 
      success: true, 
      data: log, 
      message: `Follow-up status marked as ${log.followUpStatus}` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/phone-call-log/:id
exports.remove = async (req, res) => {
  try {
    const log = await PhoneCallLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Phone call record not found' });
    }

    await PhoneCallLog.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Phone call record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
