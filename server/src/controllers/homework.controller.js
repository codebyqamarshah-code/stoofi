const Model = require("../models/Homework");
const Student = require("../models/Student");
const Notification = require("../models/Notification");

exports.getAll = async (req, res) => {
  try {
    let filter = {};
    if (req.user && req.user.role === 'Student') {
      // Lookup student record by referenceId OR by user._id
      const studentRecord = await Student.findOne({
        $or: [
          ...(req.user.referenceId ? [{ _id: req.user.referenceId }] : []),
          { user: req.user._id }
        ]
      });

      if (studentRecord && studentRecord.className) {
        const rawClass = studentRecord.className.toString().trim();
        const rawSec = (studentRecord.section || '').toString().trim();

        // Strip "Class" or "Section" prefixes for flexible regex matching
        const classNum = rawClass.replace(/^class\s*/i, '');
        const secLetter = rawSec.replace(/^section\s*/i, '');

        filter = {
          $and: [
            { className: { $regex: new RegExp(`(${rawClass}|Class ${classNum}|${classNum})`, 'i') } },
            ...(secLetter ? [{ section: { $regex: new RegExp(`(${rawSec}|Section ${secLetter}|${secLetter})`, 'i') } }] : [])
          ]
        };
      }
    }

    const homework = await Model.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: homework });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const dataObj = { ...req.body };
    if (req.file) {
      dataObj.file = '/uploads/' + req.file.filename;
    }
    const hw = await Model.create(dataObj);

    // Push notification to students of the target class/section
    try {
      await Notification.create({
        title: `New Homework: ${hw.subject}`,
        message: `New homework assigned for Class ${hw.className}, Section ${hw.section || 'All'}. Subject: ${hw.subject}. Deadline: ${hw.submissionDate ? new Date(hw.submissionDate).toLocaleDateString() : 'N/A'}`,
        type: 'System',
        audience: 'Student',
        isRead: false
      });
    } catch (notifErr) {
      console.error('Notification creation failed:', notifErr.message);
    }

    res.json({ success: true, data: hw });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    res.json({ success: true, data: await Model.findByIdAndUpdate(req.params.id, req.body, { new: true }) });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    res.json({ success: true, data: await Model.findByIdAndDelete(req.params.id) });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.submitHomework = async (req, res) => {
  try {
    const hwId = req.params.id;
    const userId = req.user._id;

    const hw = await Model.findById(hwId);
    if (!hw) {
      return res.status(404).json({ success: false, message: 'Homework not found' });
    }

    if (!hw.completedBy) hw.completedBy = [];

    // Prevent duplicate
    const alreadyDone = hw.completedBy.some(id => id.toString() === userId.toString());
    if (!alreadyDone) {
      hw.completedBy.push(userId);
      await hw.save();
    }

    res.json({ success: true, message: 'Homework marked as completed' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
