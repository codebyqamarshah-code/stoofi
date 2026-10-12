const Model = require("../models/Homework");
const Student = require("../models/Student");
const Notification = require("../models/Notification");
const User = require("../models/User");

exports.getAll = async (req, res) => {
  try {
    let filter = {};
    if (req.user && req.user.role === 'Student') {
      // Lookup student record by referenceId, user._id, email, or username
      let studentRecord = await Student.findOne({
        $or: [
          ...(req.user.referenceId ? [{ _id: req.user.referenceId }] : []),
          { user: req.user._id }
        ]
      });

      if (!studentRecord && (req.user.email || req.user.username)) {
        studentRecord = await Student.findOne({
          $or: [
            ...(req.user.email ? [{ email: req.user.email }] : []),
            ...(req.user.username ? [{ admissionNo: req.user.username }, { rollNo: req.user.username }] : [])
          ]
        });
      }

      const rawClass = (studentRecord?.className || req.user.className || '').toString().trim();
      const rawSec = (studentRecord?.section || req.user.section || '').toString().trim();

      if (rawClass) {
        // Strip "Class" or "Section" prefixes for flexible regex matching
        const classNum = rawClass.replace(/^class\s*/i, '');
        const secLetter = rawSec.replace(/^section\s*/i, '');

        filter = {
          $and: [
            { className: { $regex: new RegExp(`(^${rawClass}$|^Class\\s*${classNum}$|^${classNum}$)`, 'i') } },
            ...(secLetter ? [{ section: { $regex: new RegExp(`(^${rawSec}$|^Section\\s*${secLetter}$|^${secLetter}$)`, 'i') } }] : [])
          ]
        };
      }
    } else if (req.query.className) {
      filter.className = { $regex: new RegExp(`^${req.query.className.trim()}$`, 'i') };
      if (req.query.section) {
        filter.section = { $regex: new RegExp(`^${req.query.section.trim()}$`, 'i') };
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
    if (dataObj.className) dataObj.className = dataObj.className.trim();
    if (dataObj.section) dataObj.section = dataObj.section.trim();
    if (dataObj.subject) dataObj.subject = dataObj.subject.trim();

    const hw = await Model.create(dataObj);

    // Push notification to students of the target class/section
    try {
      const deadlineStr = hw.submissionDate ? new Date(hw.submissionDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No deadline';
      
      // 1. Audit notification for Super Admin
      await Notification.create({
        title: `📚 Homework Published: ${hw.subject} (${hw.className})`,
        message: `Homework for ${hw.className}${hw.section ? ` - Section ${hw.section}` : ''} was published. Subject: ${hw.subject}. Due: ${deadlineStr}.`,
        type: 'System',
        audience: 'Super Admin',
        isRead: false
      }).catch(() => {});

      // 2. Targeted notifications to students enrolled in this specific class
      const classNum = hw.className.replace(/^class\s*/i, '').trim();
      const classRegex = new RegExp(`(^${hw.className}$|^Class\\s*${classNum}$|^${classNum}$)`, 'i');
      
      const targetStudents = await Student.find({
        className: { $regex: classRegex }
      }).lean();

      const notifiedUserIds = new Set();

      for (const st of targetStudents) {
        let uId = st.user ? String(st.user) : null;
        if (!uId) {
          const orConditions = [];
          if (st.email) orConditions.push({ email: st.email });
          if (st.admissionNo) orConditions.push({ username: st.admissionNo });
          if (st.rollNo) orConditions.push({ username: st.rollNo });
          if (orConditions.length > 0) {
            const matchedUser = await User.findOne({ role: 'Student', $or: orConditions }).select('_id').lean();
            if (matchedUser) {
              uId = String(matchedUser._id);
              Student.findByIdAndUpdate(st._id, { user: matchedUser._id }).catch(() => {});
            }
          }
        }

        if (uId && !notifiedUserIds.has(uId)) {
          notifiedUserIds.add(uId);
          await Notification.create({
            title: `📝 New Homework: ${hw.subject}`,
            message: `New homework assigned for ${hw.className}${hw.section ? ` - Section ${hw.section}` : ''}: "${hw.description}". Due: ${deadlineStr}.`,
            type: 'System',
            audience: 'Student',
            recipientId: uId,
            isRead: false
          }).catch(() => {});
        }
      }

      // 3. Also check User records registered with this class directly
      const usersInClass = await User.find({
        role: 'Student',
        className: { $regex: classRegex }
      }).select('_id').lean();

      for (const u of usersInClass) {
        const uId = String(u._id);
        if (!notifiedUserIds.has(uId)) {
          notifiedUserIds.add(uId);
          await Notification.create({
            title: `📝 New Homework: ${hw.subject}`,
            message: `New homework assigned for ${hw.className}${hw.section ? ` - Section ${hw.section}` : ''}: "${hw.description}". Due: ${deadlineStr}.`,
            type: 'System',
            audience: 'Student',
            recipientId: uId,
            isRead: false
          }).catch(() => {});
        }
      }
    } catch (notifErr) {
      console.error('Notification creation failed:', notifErr.message);
    }

    res.json({ success: true, data: hw, message: 'Homework saved and published successfully.' });
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
