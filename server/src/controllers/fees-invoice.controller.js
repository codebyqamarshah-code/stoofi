const Model = require("../models/FeesInvoice");

function deriveBillingMonth(dateVal) {
  try {
    const d = dateVal ? new Date(dateVal) : new Date();
    if (!isNaN(d.getTime())) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }
  } catch (_) {}
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

exports.getAll = async(req,res) => { 
  try { 
    const { page = 1, limit = 10, search = '', status, billingMonth } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { student: { $regex: search, $options: 'i' } },
        { admissionNo: { $regex: search, $options: 'i' } },
        { invoiceNo: { $regex: search, $options: 'i' } },
        { challanNo: { $regex: search, $options: 'i' } },
        { feeType: { $regex: search, $options: 'i' } }
      ];
    }
    if (status && status !== 'ALL') {
      query.status = new RegExp(`^${status}$`, 'i');
    }
    if (billingMonth && billingMonth !== 'ALL') {
      query.billingMonth = billingMonth;
    }

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const data = await Model.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    const total = await Model.countDocuments(query);

    res.json({
      success: true, 
      data,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    });
  } catch(e) { 
    res.status(500).json({success:false, message:e.message}) 
  } 
};

exports.create = async(req,res) => {
  try {
    const body = { ...req.body };
    if (!body.billingMonth) {
      body.billingMonth = deriveBillingMonth(body.date);
    }
    if (!body.challanNo) {
      body.challanNo = body.invoiceNo || String(Math.floor(10000 + Math.random() * 90000));
    }
    if (!body.invoiceNo) {
      body.invoiceNo = `CH-${body.challanNo}`;
    }

    if (body.upsertMonthly && body.admissionNo && body.billingMonth) {
      const existing = await Model.findOne({
        admissionNo: body.admissionNo,
        billingMonth: body.billingMonth
      });
      if (existing) {
        const updated = await Model.findByIdAndUpdate(existing._id, body, { new: true });
        return res.json({ success: true, data: updated });
      }
    }

    const created = await Model.create(body);
    res.json({ success: true, data: created });
  } catch(e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.update = async(req,res) => { try{ res.json({success:true, data: await Model.findByIdAndUpdate(req.params.id, req.body, {new:true})}) } catch(e){ res.status(500).json({success:false, message:e.message}) } };
exports.remove = async(req,res) => { try{ res.json({success:true, data: await Model.findByIdAndDelete(req.params.id)}) } catch(e){ res.status(500).json({success:false, message:e.message}) } };