const Model = require("../models/Homework");
const Student = require("../models/Student");

exports.getAll = async(req,res) => { 
  try { 
    let filter = {};
    if (req.user.role === 'Student') {
      const studentRecord = await Student.findById(req.user.referenceId);
      if (studentRecord) {
        filter = { className: studentRecord.className, section: studentRecord.section };
      } else {
        return res.json({ success: true, data: [] }); // No record, no homework
      }
    }
    res.json({success:true, data: await Model.find(filter).sort({createdAt:-1})}) 
  } catch(e){ res.status(500).json({success:false, message:e.message}) } 
};
exports.create = async(req,res) => { 
  try{ 
    const dataObj = { ...req.body };
    if (req.file) {
      dataObj.file = '/uploads/' + req.file.filename;
    }
    res.json({success:true, data: await Model.create(dataObj)}) 
  } catch(e){ res.status(500).json({success:false, message:e.message}) } 
};
exports.update = async(req,res) => { try{ res.json({success:true, data: await Model.findByIdAndUpdate(req.params.id, req.body, {new:true})}) } catch(e){ res.status(500).json({success:false, message:e.message}) } };
exports.remove = async(req,res) => { try{ res.json({success:true, data: await Model.findByIdAndDelete(req.params.id)}) } catch(e){ res.status(500).json({success:false, message:e.message}) } };