const PostalReceive = require('../models/PostalReceive');

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
// GET /api/postal-receive
// ─────────────────────────────────────────────────────────────
exports.getAll = async (req, res) => {
  try {
    const { 
      search, 
      status, 
      postalType, 
      department, 
      date, 
      dateFrom, 
      dateTo,
      page,
      limit 
    } = req.query;

    const query = {};

    // 1. Search across multiple fields
    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { receiveId: regex },
        { fromTitle: regex },
        { senderName: regex },
        { referenceNo: regex },
        { address: regex },
        { phone: regex },
        { email: regex },
        { subject: regex },
        { toTitle: regex },
        { department: regex },
        { recipientStaffName: regex },
        { forwardedTo: regex },
        { note: regex }
      ];
    }

    // 2. Status Filter
    if (status && status !== 'All') {
      query.status = status;
    }

    // 3. Postal Type Filter
    if (postalType && postalType !== 'All') {
      query.postalType = postalType;
    }

    // 4. Department / Destination Filter
    if (department && department !== 'All') {
      query.$or = [
        { department: department },
        { toTitle: department }
      ];
    }

    // 5. Date Range Filter
    if (date === 'today') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      query.receiveDate = { $gte: todayStart, $lte: todayEnd };
    } else if (dateFrom || dateTo) {
      query.receiveDate = {};
      if (dateFrom) {
        const start = new Date(dateFrom);
        start.setHours(0, 0, 0, 0);
        query.receiveDate.$gte = start;
      }
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        query.receiveDate.$lte = end;
      }
    } else if (date && date !== 'all' && date !== 'All') {
      const dStart = new Date(date);
      dStart.setHours(0, 0, 0, 0);
      const dEnd = new Date(date);
      dEnd.setHours(23, 59, 59, 999);
      query.receiveDate = { $gte: dStart, $lte: dEnd };
    }

    const totalRecords = await PostalReceive.countDocuments(query);

    let queryExec = PostalReceive.find(query).sort({ receiveDate: -1, createdAt: -1 });

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
// GET /api/postal-receive/stats
// ─────────────────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [total, receivedToday, inProcess, completed, forwarded] = await Promise.all([
      PostalReceive.countDocuments({}),
      PostalReceive.countDocuments({ receiveDate: { $gte: todayStart, $lte: todayEnd } }),
      PostalReceive.countDocuments({ status: { $in: ['In Process', 'Forwarded'] } }),
      PostalReceive.countDocuments({ status: 'Completed' }),
      PostalReceive.countDocuments({ status: 'Forwarded' })
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        receivedToday,
        inProcess,
        completed,
        forwarded
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/postal-receive/:id
// ─────────────────────────────────────────────────────────────
exports.getById = async (req, res) => {
  try {
    const data = await PostalReceive.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Postal receive record not found' });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/postal-receive
// ─────────────────────────────────────────────────────────────
exports.create = async (req, res) => {
  try {
    const {
      fromTitle,
      senderName,
      senderType,
      address,
      phone,
      email,
      postalType,
      subject,
      referenceNo,
      note,
      receiveDate,
      receiveTime,
      receivedBy,
      toTitle,
      department,
      recipientStaffId,
      recipientStaffName,
      forwardedTo,
      forwardedToId,
      forwardDate,
      forwardRemarks,
      status
    } = req.body;

    const actualSender = (fromTitle || senderName || '').trim();

    // Validation
    if (!actualSender) return res.status(400).json({ success: false, message: 'Sender / From title is required.' });
    if (!subject || !subject.trim()) return res.status(400).json({ success: false, message: 'Subject is required.' });
    if (!toTitle || !toTitle.trim()) return res.status(400).json({ success: false, message: 'To / Destination title is required.' });

    // Phone validation if provided
    if (phone && phone.trim()) {
      const cleaned = phone.replace(/[\s\-()]/g, '');
      if (cleaned.length < 7 || cleaned.length > 15 || /^0+$/.test(cleaned)) {
        return res.status(400).json({ success: false, message: 'Please enter a valid phone number.' });
      }
    }

    // Email validation if provided
    if (email && email.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
      }
    }

    const userName = getUserName(req.user);
    const userRole = req.user?.role || 'Admin';

    const initialStatus = status || (forwardedTo && forwardedTo.trim() ? 'Forwarded' : 'Received');

    const history = [
      {
        action: 'Postal Item Received',
        user: userName,
        role: userRole,
        date: new Date(),
        notes: `Received from ${actualSender}. Addressed to ${toTitle.trim()}.`
      }
    ];

    if (forwardedTo && forwardedTo.trim()) {
      history.push({
        action: 'Forwarded / Assigned',
        user: userName,
        role: userRole,
        date: new Date(),
        notes: `Forwarded to ${forwardedTo.trim()}.${forwardRemarks ? ` Remarks: ${forwardRemarks.trim()}` : ''}`
      });
    }

    const receiveData = {
      fromTitle: actualSender,
      senderName: actualSender,
      senderType: senderType || 'Individual',
      address: address ? address.trim() : '',
      phone: phone ? phone.trim() : '',
      email: email ? email.trim() : '',
      postalType: postalType || 'Letter',
      subject: subject.trim(),
      referenceNo: referenceNo ? referenceNo.trim() : '',
      note: note ? note.trim() : '',
      receiveDate: receiveDate ? new Date(receiveDate) : new Date(),
      receiveTime: receiveTime ? receiveTime.trim() : '',
      receivedBy: receivedBy && receivedBy.trim() ? receivedBy.trim() : userName,
      toTitle: toTitle.trim(),
      department: department && department.trim() ? department.trim() : 'Administration',
      recipientStaffId: recipientStaffId || null,
      recipientStaffName: recipientStaffName ? recipientStaffName.trim() : '',
      forwardedTo: forwardedTo ? forwardedTo.trim() : '',
      forwardedToId: forwardedToId || null,
      forwardDate: forwardDate ? new Date(forwardDate) : (forwardedTo ? new Date() : null),
      forwardRemarks: forwardRemarks ? forwardRemarks.trim() : '',
      status: initialStatus,
      history
    };

    if (req.file) {
      receiveData.attachmentUrl = '/uploads/' + req.file.filename;
    }

    const postalReceive = new PostalReceive(receiveData);
    await postalReceive.save();

    res.status(201).json({
      success: true,
      message: 'Postal receive record saved successfully.',
      data: postalReceive
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/postal-receive/:id
// ─────────────────────────────────────────────────────────────
exports.update = async (req, res) => {
  try {
    const receive = await PostalReceive.findById(req.params.id);
    if (!receive) return res.status(404).json({ success: false, message: 'Postal receive record not found' });

    const userName = getUserName(req.user);
    const userRole = req.user?.role || 'Admin';
    const payload = { ...req.body };

    const historyEntries = [];

    // Track Status change
    if (payload.status && payload.status !== receive.status) {
      historyEntries.push({
        action: `Status Changed to ${payload.status}`,
        user: userName,
        role: userRole,
        date: new Date(),
        notes: `Status changed from "${receive.status}" to "${payload.status}".`
      });

      if (payload.status === 'Completed' && !payload.completedDate) {
        payload.completedDate = new Date();
        payload.completedBy = payload.completedBy || userName;
      }
    }

    // Track Forwarding change
    if (payload.forwardedTo && payload.forwardedTo !== receive.forwardedTo) {
      historyEntries.push({
        action: 'Forwarded / Reassigned',
        user: userName,
        role: userRole,
        date: new Date(),
        notes: `Forwarded to "${payload.forwardedTo}".${payload.forwardRemarks ? ` Remarks: ${payload.forwardRemarks}` : ''}`
      });
      payload.forwardDate = payload.forwardDate || new Date();
      if (receive.status === 'Received') {
        payload.status = 'Forwarded';
      }
    }

    if (historyEntries.length === 0) {
      historyEntries.push({
        action: 'Details Updated',
        user: userName,
        role: userRole,
        date: new Date(),
        notes: 'Postal receive details were updated.'
      });
    }

    if (req.file) {
      payload.attachmentUrl = '/uploads/' + req.file.filename;
    }

    // Apply updates
    Object.keys(payload).forEach(key => {
      if (key !== 'history' && key !== '_id') {
        receive[key] = payload[key];
      }
    });

    historyEntries.forEach(entry => receive.history.push(entry));

    await receive.save();

    res.status(200).json({
      success: true,
      message: 'Postal receive record updated successfully.',
      data: receive
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/postal-receive/:id/forward
// ─────────────────────────────────────────────────────────────
exports.forward = async (req, res) => {
  try {
    const { forwardedTo, forwardedToId, forwardDate, forwardRemarks } = req.body;
    if (!forwardedTo || !forwardedTo.trim()) {
      return res.status(400).json({ success: false, message: 'Please select a recipient / staff to forward to.' });
    }

    const receive = await PostalReceive.findById(req.params.id);
    if (!receive) return res.status(404).json({ success: false, message: 'Postal receive record not found' });

    const userName = getUserName(req.user);
    const userRole = req.user?.role || 'Admin';

    receive.forwardedTo = forwardedTo.trim();
    if (forwardedToId) receive.forwardedToId = forwardedToId;
    receive.forwardDate = forwardDate ? new Date(forwardDate) : new Date();
    receive.forwardRemarks = forwardRemarks ? forwardRemarks.trim() : receive.forwardRemarks;
    receive.status = 'Forwarded';

    receive.history.push({
      action: 'Forwarded',
      user: userName,
      role: userRole,
      date: new Date(),
      notes: `Forwarded to ${forwardedTo.trim()}.${forwardRemarks ? ` Remarks: ${forwardRemarks.trim()}` : ''}`
    });

    await receive.save();

    res.status(200).json({
      success: true,
      message: `Postal item forwarded to ${forwardedTo.trim()}.`,
      data: receive
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/postal-receive/:id/status
// ─────────────────────────────────────────────────────────────
exports.updateStatus = async (req, res) => {
  try {
    const { status, completedDate, completionRemarks, completedBy } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'Status is required.' });

    const validStatuses = ['Received', 'Forwarded', 'In Process', 'Completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const receive = await PostalReceive.findById(req.params.id);
    if (!receive) return res.status(404).json({ success: false, message: 'Postal receive record not found' });

    const userName = getUserName(req.user);
    const userRole = req.user?.role || 'Admin';
    const prevStatus = receive.status;

    receive.status = status;

    if (status === 'Completed') {
      receive.completedDate = completedDate ? new Date(completedDate) : new Date();
      receive.completionRemarks = completionRemarks ? completionRemarks.trim() : receive.completionRemarks;
      receive.completedBy = completedBy ? completedBy.trim() : userName;

      receive.history.push({
        action: 'Marked as Completed',
        user: userName,
        role: userRole,
        date: new Date(),
        notes: completionRemarks ? `Remarks: ${completionRemarks.trim()}` : 'Postal item processing completed.'
      });
    } else {
      receive.history.push({
        action: `Status Changed to ${status}`,
        user: userName,
        role: userRole,
        date: new Date(),
        notes: `Status changed from "${prevStatus}" to "${status}".`
      });
    }

    await receive.save();

    res.status(200).json({
      success: true,
      message: `Postal receive status updated to ${status}.`,
      data: receive
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/postal-receive/:id
// ─────────────────────────────────────────────────────────────
exports.remove = async (req, res) => {
  try {
    const data = await PostalReceive.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Postal receive record not found' });
    res.status(200).json({ success: true, message: 'Postal receive record deleted successfully.', data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
