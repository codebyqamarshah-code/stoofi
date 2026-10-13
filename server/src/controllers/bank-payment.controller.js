const Model = require("../models/BankPayment");
exports.getAll = async(req,res) => { 
  try { 
    const { class: cls, section, status, search } = req.query;
    const query = {};
    if (cls) query.className = cls;
    if (section) query.section = section;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { admissionNo: { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } },
        { note: { $regex: search, $options: 'i' } }
      ];
    }
    const data = await Model.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch(e) { 
    res.status(500).json({ success: false, message: e.message });
  } 
};
exports.create = async(req,res) => { try{ res.json({success:true, data: await Model.create(req.body)}) } catch(e){ res.status(500).json({success:false, message:e.message}) } };
exports.update = async(req,res) => { try{ res.json({success:true, data: await Model.findByIdAndUpdate(req.params.id, req.body, {new:true})}) } catch(e){ res.status(500).json({success:false, message:e.message}) } };
exports.remove = async(req,res) => { try{ res.json({success:true, data: await Model.findByIdAndDelete(req.params.id)}) } catch(e){ res.status(500).json({success:false, message:e.message}) } };