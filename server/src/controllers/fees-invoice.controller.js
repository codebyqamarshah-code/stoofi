const Model = require("../models/FeesInvoice");
exports.getAll = async(req,res) => { 
  try { 
    const { page = 1, limit = 10, search = '', status } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { student: { $regex: search, $options: 'i' } },
        { admissionNo: { $regex: search, $options: 'i' } },
        { feeType: { $regex: search, $options: 'i' } }
      ];
    }
    if (status && status !== 'ALL') {
      query.status = status;
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

exports.create = async(req,res) => { try{ res.json({success:true, data: await Model.create(req.body)}) } catch(e){ res.status(500).json({success:false, message:e.message}) } };
exports.update = async(req,res) => { try{ res.json({success:true, data: await Model.findByIdAndUpdate(req.params.id, req.body, {new:true})}) } catch(e){ res.status(500).json({success:false, message:e.message}) } };
exports.remove = async(req,res) => { try{ res.json({success:true, data: await Model.findByIdAndDelete(req.params.id)}) } catch(e){ res.status(500).json({success:false, message:e.message}) } };