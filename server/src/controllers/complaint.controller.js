const Complaint = require('../models/Complaint');

// Helper to format user display name
function getUserName(user) {
  if (!user) return 'Admin';
  if (user.firstName) {
    return `${user.firstName} ${user.lastName || ''}`.trim();
  }
  if (user.name) return user.name;
  if (user.email) return user.email;
  return 'Admin';
}

// ─────────────────────────────────────────────────────────────
// GET /api/complaint
// ─────────────────────────────────────────────────────────────
exports.getAll = async (req, res) => {
  try {
    const { 
      search, 
      status, 
      source, 
      complaintType, 
      priority, 
      assignedTo, 
      date, 
      dateFrom, 
      dateTo,
      page,
      limit
    } = req.query;

    const query = {};

    // 1. Search Query across multiple fields
    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { complaintId: regex },
        { complainantName: regex },
        { complaintBy: regex },
        { studentName: regex },
        { staffName: regex },
        { phone: regex },
        { subject: regex },
        { description: regex },
        { assignedTo: regex },
        { assigned: regex }
      ];
    }

    // 2. Status Filter
    if (status && status !== 'All') {
      query.status = status;
    }

    // 3. Source Filter
    if (source && source !== 'All') {
      query.source = source;
    }

    // 4. Complaint Type Filter
    if (complaintType && complaintType !== 'All') {
      query.complaintType = complaintType;
    }

    // 5. Priority Filter
    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    // 6. Assigned To Filter
    if (assignedTo && assignedTo !== 'All') {
      query.$or = [
        { assignedTo: assignedTo },
        { assigned: assignedTo }
      ];
    }

    // 7. Date Range Filter
    if (date === 'today') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      query.complaintDate = { $gte: todayStart, $lte: todayEnd };
    } else if (dateFrom || dateTo) {
      query.complaintDate = {};
      if (dateFrom) {
        const start = new Date(dateFrom);
        start.setHours(0, 0, 0, 0);
        query.complaintDate.$gte = start;
      }
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        query.complaintDate.$lte = end;
      }
    } else if (date && date !== 'all' && date !== 'All') {
      const dStart = new Date(date);
      dStart.setHours(0, 0, 0, 0);
      const dEnd = new Date(date);
      dEnd.setHours(23, 59, 59, 999);
      query.complaintDate = { $gte: dStart, $lte: dEnd };
    }

    const totalRecords = await Complaint.countDocuments(query);

    let queryExec = Complaint.find(query).sort({ complaintDate: -1, createdAt: -1 });

    // Optional server-side pagination
    if (page && limit) {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;
      queryExec = queryExec.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    const data = await queryExec;

    res.status(200).json({
      success: true,
      count: data.length,
      totalRecords,
      data
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/complaint/stats
// ─────────────────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const [total, pending, inProgress, resolved, closed] = await Promise.all([
      Complaint.countDocuments({}),
      Complaint.countDocuments({ status: 'Pending' }),
      Complaint.countDocuments({ status: 'In Progress' }),
      Complaint.countDocuments({ status: 'Resolved' }),
      Complaint.countDocuments({ status: 'Closed' })
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        inProgress,
        resolved,
        closed
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/complaint/:id
// ─────────────────────────────────────────────────────────────
exports.getById = async (req, res) => {
  try {
    const data = await Complaint.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Complaint not found' });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/complaint
// ─────────────────────────────────────────────────────────────
exports.create = async (req, res) => {
  try {
    const {
      source,
      complainantName,
      complaintBy,
      studentId,
      studentName,
      studentClass,
      studentRoll,
      staffId,
      staffName,
      staffRole,
      phone,
      complaintType,
      subject,
      description,
      priority,
      assignedTo,
      assignedToId,
      complaintDate,
      actionTaken,
      resolutionNotes,
      note
    } = req.body;

    const actualComplainant = (complainantName || complaintBy || '').trim();

    // Validation
    if (!source) return res.status(400).json({ success: false, message: 'Complaint source is required.' });
    if (!actualComplainant) return res.status(400).json({ success: false, message: 'Complainant name is required.' });
    if (!complaintType) return res.status(400).json({ success: false, message: 'Complaint type is required.' });
    if (!subject || !subject.trim()) return res.status(400).json({ success: false, message: 'Subject is required.' });
    if (!description || !description.trim()) return res.status(400).json({ success: false, message: 'Description is required.' });

    // Phone validation if provided
    if (phone && phone.trim()) {
      const cleaned = phone.replace(/[\s\-()]/g, '');
      if (cleaned.length < 7 || cleaned.length > 15 || /^0+$/.test(cleaned)) {
        return res.status(400).json({ success: false, message: 'Please enter a valid phone number.' });
      }
    }

    const userName = getUserName(req.user);
    const userRole = req.user?.role || 'Admin';

    const history = [
      {
        action: 'Complaint Logged',
        user: userName,
        role: userRole,
        date: new Date(),
        notes: `Initial complaint recorded. Priority set to ${priority || 'Medium'}.`
      }
    ];

    if (assignedTo && assignedTo.trim() && assignedTo !== 'Unassigned') {
      history.push({
        action: 'Assigned',
        user: userName,
        role: userRole,
        date: new Date(),
        notes: `Assigned to ${assignedTo.trim()}.`
      });
    }

    const complaintData = {
      source,
      complainantName: actualComplainant,
      complaintBy: actualComplainant,
      studentId: studentId || null,
      studentName: studentName ? studentName.trim() : '',
      studentClass: studentClass ? studentClass.trim() : '',
      studentRoll: studentRoll ? studentRoll.trim() : '',
      staffId: staffId || null,
      staffName: staffName ? staffName.trim() : '',
      staffRole: staffRole ? staffRole.trim() : '',
      phone: phone ? phone.trim() : '',
      complaintType,
      subject: subject.trim(),
      description: description.trim(),
      priority: priority || 'Medium',
      assignedTo: assignedTo && assignedTo.trim() ? assignedTo.trim() : 'Unassigned',
      assignedToId: assignedToId || null,
      assigned: assignedTo && assignedTo.trim() ? assignedTo.trim() : 'Unassigned',
      complaintDate: complaintDate ? new Date(complaintDate) : new Date(),
      status: 'Pending',
      actionTaken: actionTaken ? actionTaken.trim() : '',
      resolutionNotes: resolutionNotes ? resolutionNotes.trim() : '',
      note: note ? note.trim() : '',
      history
    };

    if (req.file) {
      complaintData.attachmentUrl = '/uploads/' + req.file.filename;
    }

    const complaint = new Complaint(complaintData);
    await complaint.save();

    res.status(201).json({
      success: true,
      message: 'Complaint registered successfully.',
      data: complaint
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/complaint/:id
// ─────────────────────────────────────────────────────────────
exports.update = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    const userName = getUserName(req.user);
    const userRole = req.user?.role || 'Admin';
    const payload = { ...req.body };

    const historyEntries = [];

    // Track Priority change
    if (payload.priority && payload.priority !== complaint.priority) {
      historyEntries.push({
        action: 'Priority Changed',
        user: userName,
        role: userRole,
        date: new Date(),
        notes: `Priority changed from ${complaint.priority} to ${payload.priority}.`
      });
    }

    // Track Assignment change
    if (payload.assignedTo && payload.assignedTo !== complaint.assignedTo) {
      historyEntries.push({
        action: 'Reassigned',
        user: userName,
        role: userRole,
        date: new Date(),
        notes: `Assigned person changed from "${complaint.assignedTo || 'Unassigned'}" to "${payload.assignedTo}".`
      });
    }

    // Track Status change if sent in update
    if (payload.status && payload.status !== complaint.status) {
      historyEntries.push({
        action: `Status Changed to ${payload.status}`,
        user: userName,
        role: userRole,
        date: new Date(),
        notes: payload.resolutionNotes || payload.actionTaken || `Status changed from ${complaint.status} to ${payload.status}.`
      });

      if (payload.status === 'Resolved') {
        payload.resolvedBy = payload.resolvedBy || userName;
        payload.resolvedDate = payload.resolvedDate || new Date();
      }
      if (payload.status === 'Closed') {
        payload.closedDate = payload.closedDate || new Date();
      }
    }

    if (historyEntries.length === 0) {
      historyEntries.push({
        action: 'Details Updated',
        user: userName,
        role: userRole,
        date: new Date(),
        notes: 'Complaint details were updated.'
      });
    }

    if (req.file) {
      payload.attachmentUrl = '/uploads/' + req.file.filename;
    }

    // Apply updates
    Object.keys(payload).forEach(key => {
      if (key !== 'history' && key !== '_id') {
        complaint[key] = payload[key];
      }
    });

    historyEntries.forEach(entry => complaint.history.push(entry));

    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Complaint updated successfully.',
      data: complaint
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/complaint/:id/status
// ─────────────────────────────────────────────────────────────
exports.updateStatus = async (req, res) => {
  try {
    const { status, actionTaken, resolutionNotes, resolvedBy } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'Status is required.' });

    const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found.' });

    const userName = getUserName(req.user);
    const userRole = req.user?.role || 'Admin';

    if (status === 'Resolved') {
      if (!actionTaken && !complaint.actionTaken && !resolutionNotes && !complaint.resolutionNotes) {
        return res.status(400).json({ success: false, message: 'Please provide the Action Taken or Resolution Notes when resolving a complaint.' });
      }
      complaint.status = 'Resolved';
      complaint.actionTaken = actionTaken ? actionTaken.trim() : complaint.actionTaken;
      complaint.resolutionNotes = resolutionNotes ? resolutionNotes.trim() : complaint.resolutionNotes;
      complaint.resolvedBy = resolvedBy ? resolvedBy.trim() : userName;
      complaint.resolvedDate = new Date();

      complaint.history.push({
        action: 'Complaint Resolved',
        user: userName,
        role: userRole,
        date: new Date(),
        notes: complaint.actionTaken ? `Resolution: ${complaint.actionTaken}` : 'Complaint marked as resolved.'
      });
    } else if (status === 'Closed') {
      complaint.status = 'Closed';
      complaint.closedDate = new Date();
      if (resolutionNotes) {
        complaint.resolutionNotes = resolutionNotes.trim();
      }

      complaint.history.push({
        action: 'Complaint Closed',
        user: userName,
        role: userRole,
        date: new Date(),
        notes: resolutionNotes ? `Closing Notes: ${resolutionNotes}` : 'Complaint permanently closed.'
      });
    } else {
      // Pending or In Progress
      const prevStatus = complaint.status;
      complaint.status = status;

      complaint.history.push({
        action: `Status Changed to ${status}`,
        user: userName,
        role: userRole,
        date: new Date(),
        notes: `Status changed from ${prevStatus} to ${status}.`
      });
    }

    await complaint.save();

    res.status(200).json({
      success: true,
      message: `Complaint status updated to ${status}.`,
      data: complaint
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/complaint/:id/assign
// ─────────────────────────────────────────────────────────────
exports.assign = async (req, res) => {
  try {
    const { assignedTo, assignedToId } = req.body;
    if (!assignedTo || !assignedTo.trim()) {
      return res.status(400).json({ success: false, message: 'Assigned person name is required.' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found.' });

    const userName = getUserName(req.user);
    const userRole = req.user?.role || 'Admin';

    const prevAssigned = complaint.assignedTo || 'Unassigned';
    complaint.assignedTo = assignedTo.trim();
    complaint.assigned = assignedTo.trim();
    if (assignedToId) complaint.assignedToId = assignedToId;

    complaint.history.push({
      action: 'Reassigned',
      user: userName,
      role: userRole,
      date: new Date(),
      notes: `Assigned person changed from "${prevAssigned}" to "${assignedTo.trim()}".`
    });

    await complaint.save();

    res.status(200).json({
      success: true,
      message: `Complaint assigned to ${assignedTo.trim()}.`,
      data: complaint
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/complaint/:id
// ─────────────────────────────────────────────────────────────
exports.remove = async (req, res) => {
  try {
    const data = await Complaint.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Complaint not found' });
    res.status(200).json({ success: true, message: 'Complaint deleted successfully.', data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
