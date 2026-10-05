const PostalDispatch = require('../models/PostalDispatch');

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
// GET /api/postal-dispatch
// ─────────────────────────────────────────────────────────────
exports.getAll = async (req, res) => {
  try {
    const { 
      search, 
      status, 
      postalType, 
      dispatchMode, 
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
        { dispatchId: regex },
        { recipientName: regex },
        { toTitle: regex },
        { address: regex },
        { phone: regex },
        { email: regex },
        { subject: regex },
        { referenceNo: regex },
        { fromTitle: regex },
        { department: regex },
        { dispatchedBy: regex },
        { trackingNo: regex },
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

    // 4. Dispatch Mode Filter
    if (dispatchMode && dispatchMode !== 'All') {
      query.dispatchMode = dispatchMode;
    }

    // 5. Department Filter
    if (department && department !== 'All') {
      query.department = department;
    }

    // 6. Date Range Filter
    if (date === 'today') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      query.dispatchDate = { $gte: todayStart, $lte: todayEnd };
    } else if (dateFrom || dateTo) {
      query.dispatchDate = {};
      if (dateFrom) {
        const start = new Date(dateFrom);
        start.setHours(0, 0, 0, 0);
        query.dispatchDate.$gte = start;
      }
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        query.dispatchDate.$lte = end;
      }
    } else if (date && date !== 'all' && date !== 'All') {
      const dStart = new Date(date);
      dStart.setHours(0, 0, 0, 0);
      const dEnd = new Date(date);
      dEnd.setHours(23, 59, 59, 999);
      query.dispatchDate = { $gte: dStart, $lte: dEnd };
    }

    const totalRecords = await PostalDispatch.countDocuments(query);

    let queryExec = PostalDispatch.find(query).sort({ dispatchDate: -1, createdAt: -1 });

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
// GET /api/postal-dispatch/stats
// ─────────────────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [total, dispatchedToday, delivered, returned, draft] = await Promise.all([
      PostalDispatch.countDocuments({}),
      PostalDispatch.countDocuments({ dispatchDate: { $gte: todayStart, $lte: todayEnd }, status: { $ne: 'Draft' } }),
      PostalDispatch.countDocuments({ status: 'Delivered' }),
      PostalDispatch.countDocuments({ status: 'Returned' }),
      PostalDispatch.countDocuments({ status: 'Draft' })
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        dispatchedToday,
        delivered,
        returned,
        draft
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/postal-dispatch/:id
// ─────────────────────────────────────────────────────────────
exports.getById = async (req, res) => {
  try {
    const data = await PostalDispatch.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Postal dispatch record not found' });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/postal-dispatch
// ─────────────────────────────────────────────────────────────
exports.create = async (req, res) => {
  try {
    const {
      recipientName,
      toTitle,
      toCategory,
      address,
      phone,
      email,
      postalType,
      subject,
      referenceNo,
      note,
      fromTitle,
      department,
      dispatchedBy,
      dispatchDate,
      dispatchTime,
      dispatchMode,
      trackingNo,
      status
    } = req.body;

    const actualRecipient = (recipientName || toTitle || '').trim();

    // Validation
    if (!actualRecipient) return res.status(400).json({ success: false, message: 'Recipient name is required.' });
    if (!address || !address.trim()) return res.status(400).json({ success: false, message: 'Address is required.' });
    if (!subject || !subject.trim()) return res.status(400).json({ success: false, message: 'Subject is required.' });
    if (!fromTitle || !fromTitle.trim()) return res.status(400).json({ success: false, message: 'From title is required.' });

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

    const initialStatus = status || 'Dispatched';

    const history = [
      {
        action: initialStatus === 'Draft' ? 'Draft Created' : 'Item Dispatched',
        user: userName,
        role: userRole,
        date: new Date(),
        notes: `Dispatch logged with mode: ${dispatchMode || 'Courier'}.`
      }
    ];

    const dispatchData = {
      recipientName: actualRecipient,
      toTitle: actualRecipient,
      toCategory: toCategory || 'Other',
      address: address.trim(),
      phone: phone ? phone.trim() : '',
      email: email ? email.trim() : '',
      postalType: postalType || 'Letter',
      subject: subject.trim(),
      referenceNo: referenceNo ? referenceNo.trim() : '',
      note: note ? note.trim() : '',
      fromTitle: fromTitle.trim(),
      department: department && department.trim() ? department.trim() : 'Administration',
      dispatchedBy: dispatchedBy && dispatchedBy.trim() ? dispatchedBy.trim() : userName,
      dispatchDate: dispatchDate ? new Date(dispatchDate) : new Date(),
      dispatchTime: dispatchTime ? dispatchTime.trim() : '',
      dispatchMode: dispatchMode || 'Courier',
      trackingNo: trackingNo ? trackingNo.trim() : '',
      status: initialStatus,
      history
    };

    if (req.file) {
      dispatchData.attachmentUrl = '/uploads/' + req.file.filename;
    }

    const postalDispatch = new PostalDispatch(dispatchData);
    await postalDispatch.save();

    res.status(201).json({
      success: true,
      message: 'Postal dispatch recorded successfully.',
      data: postalDispatch
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/postal-dispatch/:id
// ─────────────────────────────────────────────────────────────
exports.update = async (req, res) => {
  try {
    const dispatch = await PostalDispatch.findById(req.params.id);
    if (!dispatch) return res.status(404).json({ success: false, message: 'Postal dispatch record not found' });

    const userName = getUserName(req.user);
    const userRole = req.user?.role || 'Admin';
    const payload = { ...req.body };

    const historyEntries = [];

    // Track Status change
    if (payload.status && payload.status !== dispatch.status) {
      historyEntries.push({
        action: `Status Changed to ${payload.status}`,
        user: userName,
        role: userRole,
        date: new Date(),
        notes: `Status changed from "${dispatch.status}" to "${payload.status}".`
      });

      if (payload.status === 'Delivered' && !payload.deliveryDate) {
        payload.deliveryDate = new Date();
      }
      if (payload.status === 'Returned' && !payload.returnDate) {
        payload.returnDate = new Date();
      }
    }

    // Track Tracking No addition/update
    if (payload.trackingNo && payload.trackingNo !== dispatch.trackingNo) {
      historyEntries.push({
        action: 'Tracking No Updated',
        user: userName,
        role: userRole,
        date: new Date(),
        notes: `Tracking No updated to "${payload.trackingNo}".`
      });
    }

    if (historyEntries.length === 0) {
      historyEntries.push({
        action: 'Details Updated',
        user: userName,
        role: userRole,
        date: new Date(),
        notes: 'Dispatch details updated.'
      });
    }

    if (req.file) {
      payload.attachmentUrl = '/uploads/' + req.file.filename;
    }

    // Apply updates
    Object.keys(payload).forEach(key => {
      if (key !== 'history' && key !== '_id') {
        dispatch[key] = payload[key];
      }
    });

    historyEntries.forEach(entry => dispatch.history.push(entry));

    await dispatch.save();

    res.status(200).json({
      success: true,
      message: 'Postal dispatch updated successfully.',
      data: dispatch
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/postal-dispatch/:id/status
// ─────────────────────────────────────────────────────────────
exports.updateStatus = async (req, res) => {
  try {
    const { status, deliveryDate, deliveryRemarks, deliveredBy, returnDate, returnReason, returnRemarks } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'Status is required.' });

    const validStatuses = ['Draft', 'Dispatched', 'Delivered', 'Returned'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const dispatch = await PostalDispatch.findById(req.params.id);
    if (!dispatch) return res.status(404).json({ success: false, message: 'Postal dispatch record not found' });

    const userName = getUserName(req.user);
    const userRole = req.user?.role || 'Admin';
    const prevStatus = dispatch.status;

    dispatch.status = status;

    if (status === 'Delivered') {
      dispatch.deliveryDate = deliveryDate ? new Date(deliveryDate) : new Date();
      dispatch.deliveryRemarks = deliveryRemarks ? deliveryRemarks.trim() : dispatch.deliveryRemarks;
      dispatch.deliveredBy = deliveredBy ? deliveredBy.trim() : userName;

      dispatch.history.push({
        action: 'Marked as Delivered',
        user: userName,
        role: userRole,
        date: new Date(),
        notes: deliveryRemarks ? `Delivery Remarks: ${deliveryRemarks.trim()}` : 'Package confirmed delivered.'
      });
    } else if (status === 'Returned') {
      dispatch.returnDate = returnDate ? new Date(returnDate) : new Date();
      dispatch.returnReason = returnReason ? returnReason.trim() : 'Address not found / Refused';
      dispatch.returnRemarks = returnRemarks ? returnRemarks.trim() : dispatch.returnRemarks;

      dispatch.history.push({
        action: 'Marked as Returned',
        user: userName,
        role: userRole,
        date: new Date(),
        notes: returnReason ? `Reason: ${returnReason.trim()}` : 'Package returned to school.'
      });
    } else {
      dispatch.history.push({
        action: `Status Changed to ${status}`,
        user: userName,
        role: userRole,
        date: new Date(),
        notes: `Status moved from "${prevStatus}" to "${status}".`
      });
    }

    await dispatch.save();

    res.status(200).json({
      success: true,
      message: `Postal dispatch status updated to ${status}.`,
      data: dispatch
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/postal-dispatch/:id
// ─────────────────────────────────────────────────────────────
exports.remove = async (req, res) => {
  try {
    const data = await PostalDispatch.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Postal dispatch record not found' });
    res.status(200).json({ success: true, message: 'Postal dispatch deleted successfully.', data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
