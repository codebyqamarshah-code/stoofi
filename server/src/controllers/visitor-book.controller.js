const Visitor = require('../models/Visitor');

// ─────────────────────────────────────────────────────────────
// Helper to format 12-hour time (e.g. "02:30 PM")
// ─────────────────────────────────────────────────────────────
function formatCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

// ─────────────────────────────────────────────────────────────
// GET /api/visitor-book
// ─────────────────────────────────────────────────────────────
exports.getAll = async (req, res) => {
  try {
    const { search, visitorType, status, date, dateFrom, dateTo } = req.query;
    const query = {};

    // 1. Search Query across Name, Phone, Purpose, WhomToMeet
    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: regex },
        { phone: regex },
        { purpose: regex },
        { whomToMeet: regex },
        { cnic: regex }
      ];
    }

    // 2. Visitor Type Filter
    if (visitorType && visitorType !== 'All') {
      query.visitorType = visitorType;
    }

    // 3. Status Filter
    if (status && status !== 'All') {
      query.status = status;
    }

    // 4. Date Filter
    if (date === 'today') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      query.date = { $gte: todayStart, $lte: todayEnd };
    } else if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) {
        const start = new Date(dateFrom);
        start.setHours(0, 0, 0, 0);
        query.date.$gte = start;
      }
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    } else if (date && date !== 'all') {
      const dStart = new Date(date);
      dStart.setHours(0, 0, 0, 0);
      const dEnd = new Date(date);
      dEnd.setHours(23, 59, 59, 999);
      query.date = { $gte: dStart, $lte: dEnd };
    }

    const data = await Visitor.find(query).sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/visitor-book/stats
// ─────────────────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [todayVisitors, currentlyInsideList, checkedOutTodayList] = await Promise.all([
      Visitor.find({ date: { $gte: todayStart, $lte: todayEnd } }),
      Visitor.find({ status: 'Inside' }),
      Visitor.find({ date: { $gte: todayStart, $lte: todayEnd }, status: 'Checked Out' })
    ]);

    const totalPersonsToday = todayVisitors.reduce((sum, v) => sum + (Number(v.noOfPerson) || 1), 0);

    res.status(200).json({
      success: true,
      data: {
        todayVisitors: todayVisitors.length,
        currentlyInside: currentlyInsideList.length,
        checkedOutToday: checkedOutTodayList.length,
        totalVisitsToday: todayVisitors.length,
        totalPersonsToday
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/visitor-book
// ─────────────────────────────────────────────────────────────
exports.create = async (req, res) => {
  try {
    const {
      name,
      noOfPerson,
      phone,
      visitorType,
      purpose,
      whomToMeet,
      date,
      inTime,
      outTime,
      cnic,
      address,
      notes
    } = req.body;

    // Backend Validation
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Visitor name is required.' });
    if (!phone || !phone.trim()) return res.status(400).json({ success: false, message: 'Phone number is required.' });
    if (!purpose || !purpose.trim()) return res.status(400).json({ success: false, message: 'Purpose is required.' });
    if (!whomToMeet || !whomToMeet.trim()) return res.status(400).json({ success: false, message: 'Whom to meet is required.' });
    if (!inTime || !inTime.trim()) return res.status(400).json({ success: false, message: 'In time is required.' });

    const numPersons = parseInt(noOfPerson, 10);
    if (isNaN(numPersons) || numPersons < 1) {
      return res.status(400).json({ success: false, message: 'Number of persons must be at least 1.' });
    }

    const dataObj = {
      name: name.trim(),
      noOfPerson: numPersons,
      phone: phone.trim(),
      visitorType: visitorType || 'Parent / Guardian',
      purpose: purpose.trim(),
      whomToMeet: whomToMeet.trim(),
      date: date ? new Date(date) : new Date(),
      inTime: inTime.trim(),
      outTime: outTime && outTime.trim() ? outTime.trim() : null,
      status: outTime && outTime.trim() ? 'Checked Out' : 'Inside',
      cnic: cnic ? cnic.trim() : '',
      address: address ? address.trim() : '',
      notes: notes ? notes.trim() : ''
    };

    if (req.file) {
      dataObj.documentUrl = '/uploads/' + req.file.filename;
    }

    const data = await Visitor.create(dataObj);
    res.status(201).json({ success: true, message: 'Visitor registered successfully.', data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/visitor-book/:id
// ─────────────────────────────────────────────────────────────
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = { ...req.body };

    if (updatePayload.noOfPerson) {
      updatePayload.noOfPerson = parseInt(updatePayload.noOfPerson, 10) || 1;
    }

    if (updatePayload.outTime && updatePayload.outTime.trim() !== '') {
      updatePayload.status = 'Checked Out';
    } else if (updatePayload.outTime === '' || updatePayload.outTime === null) {
      updatePayload.outTime = null;
      updatePayload.status = 'Inside';
    }

    const data = await Visitor.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ success: false, message: 'Visitor record not found.' });

    res.status(200).json({ success: true, message: 'Visitor updated successfully.', data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/visitor-book/:id/checkout
// ─────────────────────────────────────────────────────────────
exports.checkout = async (req, res) => {
  try {
    const { id } = req.params;
    const visitor = await Visitor.findById(id);
    if (!visitor) return res.status(404).json({ success: false, message: 'Visitor record not found.' });

    if (visitor.status === 'Checked Out' && visitor.outTime) {
      return res.status(400).json({ success: false, message: 'Visitor has already checked out.' });
    }

    const outTime = req.body.outTime || formatCurrentTime();
    visitor.outTime = outTime;
    visitor.status = 'Checked Out';
    await visitor.save();

    res.status(200).json({
      success: true,
      message: `${visitor.name} checked out at ${outTime}.`,
      data: visitor
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/visitor-book/:id
// ─────────────────────────────────────────────────────────────
exports.remove = async (req, res) => {
  try {
    const data = await Visitor.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Visitor record not found.' });

    res.status(200).json({ success: true, message: 'Visitor deleted successfully.', data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
