const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const User = require('../models/User');

// Helper to resolve student for a request
async function resolveStudent(req) {
  const studentId = req.query.studentId || req.params?.studentId;

  // 1. Explicit studentId passed
  if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
    const s = await Student.findById(studentId);
    if (s) return s;
  }
  if (studentId) {
    const s = await Student.findOne({
      $or: [{ admissionNo: studentId }, { rollNo: studentId }, { phone: studentId }]
    });
    if (s) return s;
  }

  // 2. User session
  if (req.user) {
    if (req.user.referenceId && mongoose.Types.ObjectId.isValid(req.user.referenceId)) {
      const s = await Student.findById(req.user.referenceId);
      if (s) return s;
    }
    const sByUser = await Student.findOne({ user: req.user._id });
    if (sByUser) {
      if (!req.user.referenceId) {
        await User.findByIdAndUpdate(req.user._id, { referenceId: sByUser._id }).catch(() => {});
      }
      return sByUser;
    }
    if (req.user.email) {
      const sByEmail = await Student.findOne({ email: req.user.email });
      if (sByEmail) {
        await Student.findByIdAndUpdate(sByEmail._id, { user: req.user._id }).catch(() => {});
        await User.findByIdAndUpdate(req.user._id, { referenceId: sByEmail._id }).catch(() => {});
        return sByEmail;
      }
    }
    if (req.user.admissionNo || req.user.username) {
      const sByAdm = await Student.findOne({
        $or: [
          ...(req.user.admissionNo ? [{ admissionNo: req.user.admissionNo }] : []),
          ...(req.user.username ? [{ admissionNo: req.user.username }, { rollNo: req.user.username }] : [])
        ]
      });
      if (sByAdm) {
        await Student.findByIdAndUpdate(sByAdm._id, { user: req.user._id }).catch(() => {});
        await User.findByIdAndUpdate(req.user._id, { referenceId: sByAdm._id }).catch(() => {});
        return sByAdm;
      }
    }

    // Try name match within class/section if user has class/section
    if (req.user.className) {
      const cleanClass = req.user.className.replace(/^Class\s*/i, '').trim();
      const studentQuery = {
        className: { $regex: new RegExp(`^(Class\\s*)?${cleanClass}$`, 'i') }
      };
      if (req.user.section && req.user.section !== 'All') {
        const cleanSec = req.user.section.replace(/^Section\s*/i, '').trim();
        studentQuery.section = { $regex: new RegExp(`^(Section\\s*)?${cleanSec}$`, 'i') };
      }
      const fullName = (req.user.fullName || req.user.name || '').trim();
      if (fullName) {
        const first = fullName.split(' ')[0];
        studentQuery.firstName = { $regex: new RegExp(`^${first}`, 'i') };
      }
      const sByClass = await Student.findOne(studentQuery);
      if (sByClass) {
        await Student.findByIdAndUpdate(sByClass._id, { user: req.user._id }).catch(() => {});
        await User.findByIdAndUpdate(req.user._id, { referenceId: sByClass._id }).catch(() => {});
        return sByClass;
      }
      // If only 1 student in that class/section or matching user
      if (req.user.role === 'Student') {
        const anyInClass = await Student.findOne({
          className: { $regex: new RegExp(`^(Class\\s*)?${cleanClass}$`, 'i') }
        });
        if (anyInClass) return anyInClass;
      }
    }
  }
  return null;
}

exports.getAttendance = async (req, res) => {
  try {
    const { class: className, section, date, studentId, year, month } = req.query;

    // ── CASE 1: Teacher/Admin searching attendance for a whole Class on a specific Date ──
    if (className) {
      const cleanClass = className.replace(/^Class\s*/i, '').trim();
      const studentQuery = {
        className: { $regex: new RegExp(`^(Class\\s*)?${cleanClass}$`, 'i') }
      };
      if (section && section !== 'All' && section !== 'All Sections') {
        const cleanSec = section.replace(/^Section\s*/i, '').trim();
        studentQuery.section = { $regex: new RegExp(`^(Section\\s*)?${cleanSec}$`, 'i') };
      }
      const students = await Student.find(studentQuery);

      let targetDate = date ? new Date(date) : new Date();
      if (isNaN(targetDate.getTime())) targetDate = new Date();

      const dateStr = typeof date === 'string' && date ? date.split('T')[0] : targetDate.toISOString().split('T')[0];
      const [y, m, d] = dateStr.split('-').map(Number);
      const startOfDay = new Date(y, m - 1, d, 0, 0, 0, 0);
      const endOfDay = new Date(y, m - 1, d, 23, 59, 59, 999);

      const attendanceRecords = await Attendance.find({
        userType: 'Student',
        date: { $gte: startOfDay, $lte: endOfDay }
      });

      // Map students to their attendance status
      const data = students.map(student => {
        const record = attendanceRecords.find(r => 
          r.recordId.toString() === student._id.toString() ||
          (student.user && r.recordId.toString() === student.user.toString())
        );
        return {
          studentId: student._id,
          admissionNo: student.admissionNo || student.rollNo || 'N/A',
          rollNo: student.rollNo || student.rollNumber || '1',
          name: `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student',
          status: record ? record.status : 'Present',
          note: record ? record.name : ''
        };
      });

      return res.status(200).json({ success: true, data });
    }

    // ── CASE 2: Student individual attendance (or by studentId / logged in student user) ──
    const student = await resolveStudent(req);
    const possibleIds = [
      student?._id,
      req.user?._id,
      student?.user,
      studentId
    ].filter(id => id && mongoose.Types.ObjectId.isValid(id));

    if (possibleIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        summary: { present: 0, late: 0, absent: 0, halfDay: 0, holiday: 0, total: 0, percentage: 0 },
        days: {}
      });
    }

    const attendanceFilter = {
      userType: 'Student',
      recordId: { $in: possibleIds }
    };

    // Date/Month/Year filters
    if (year && month) {
      const y = parseInt(year, 10);
      const m = parseInt(month, 10);
      const mIdx = m >= 1 && m <= 12 ? m - 1 : m;
      const start = new Date(y, mIdx, 1, 0, 0, 0, 0);
      const end = new Date(y, mIdx + 1, 0, 23, 59, 59, 999);
      attendanceFilter.date = { $gte: start, $lte: end };
    } else if (year) {
      const y = parseInt(year, 10);
      const start = new Date(y, 0, 1, 0, 0, 0, 0);
      const end = new Date(y, 11, 31, 23, 59, 59, 999);
      attendanceFilter.date = { $gte: start, $lte: end };
    }

    const records = await Attendance.find(attendanceFilter).sort({ date: -1 });

    // Calculate monthly summary & day map
    let presentCount = 0;
    let lateCount = 0;
    let absentCount = 0;
    let halfDayCount = 0;
    let holidayCount = 0;
    const dayMap = {};

    records.forEach(r => {
      const st = r.status || 'Present';
      if (st === 'Present') presentCount++;
      else if (st === 'Late') lateCount++;
      else if (st === 'Absent') absentCount++;
      else if (st === 'Half Day') halfDayCount++;
      else if (st === 'Holiday') holidayCount++;

      const d = new Date(r.date);
      const dayNum = d.getDate();
      if (!dayMap[dayNum]) {
        let code = 'P';
        if (st === 'Present') code = 'P';
        else if (st === 'Late') code = 'L';
        else if (st === 'Absent') code = 'A';
        else if (st === 'Half Day') code = 'F';
        else if (st === 'Holiday') code = 'H';
        dayMap[dayNum] = {
          code,
          status: st,
          date: r.date,
          note: r.name || ''
        };
      }
    });

    const totalCount = records.length;
    const effectiveDays = totalCount - holidayCount;
    const percentage = effectiveDays > 0 
      ? Math.round(((presentCount + lateCount + halfDayCount) / effectiveDays) * 100) 
      : (totalCount > 0 ? 100 : 0);

    return res.status(200).json({
      success: true,
      data: records,
      summary: {
        present: presentCount,
        late: lateCount,
        absent: absentCount,
        halfDay: halfDayCount,
        holiday: holidayCount,
        total: totalCount,
        percentage
      },
      days: dayMap,
      student: student ? {
        _id: student._id,
        name: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
        admissionNo: student.admissionNo,
        className: student.className,
        section: student.section
      } : null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.saveAttendance = async (req, res) => {
  try {
    const { date, attendanceData } = req.body;
    if (!date || !Array.isArray(attendanceData)) {
      return res.status(400).json({ success: false, message: 'Date and attendance data are required' });
    }

    const dateStr = typeof date === 'string' && date ? date.split('T')[0] : new Date(date).toISOString().split('T')[0];
    const [y, m, d] = dateStr.split('-').map(Number);
    const startOfDay = new Date(y, m - 1, d, 0, 0, 0, 0);
    const endOfDay = new Date(y, m - 1, d, 23, 59, 59, 999);
    
    for (const item of attendanceData) {
      if (!item.studentId) continue;

      let record = await Attendance.findOne({
        userType: 'Student',
        recordId: item.studentId,
        date: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      });

      if (record) {
        record.status = item.status;
        record.name = item.note || item.name || '';
        await record.save();
      } else {
        await Attendance.create({
          date: new Date(y, m - 1, d, 12, 0, 0),
          userType: 'Student',
          recordId: item.studentId,
          name: item.note || item.name || '',
          status: item.status
        });
      }
    }
    
    res.status(200).json({ success: true, message: 'Attendance saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAttendanceReport = async (req, res) => {
  try {
    const { className, search } = req.query;
    
    // Build student query
    const studentQuery = {};
    if (className) studentQuery.className = className;
    if (search) {
      studentQuery.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { admissionNo: { $regex: search, $options: 'i' } }
      ];
    }
    
    const students = await Student.find(studentQuery);
    const studentIds = students.map(s => s._id);

    const attendanceRecords = await Attendance.find({
      userType: 'Student',
      recordId: { $in: studentIds }
    });

    const data = students.map(student => {
      const studentRecords = attendanceRecords.filter(r => r.recordId.toString() === student._id.toString());
      const totalDays = studentRecords.length;
      const presentDays = studentRecords.filter(r => r.status === 'Present').length;
      const absentDays = studentRecords.filter(r => r.status === 'Absent').length;
      const lateDays = studentRecords.filter(r => r.status === 'Late').length;
      const halfDays = studentRecords.filter(r => r.status === 'Half Day').length;
      
      const percentage = totalDays > 0 ? ((presentDays + lateDays + halfDays) / totalDays) * 100 : 0;

      return {
        _id: student._id,
        admissionNo: student.admissionNo,
        name: `${student.firstName} ${student.lastName}`,
        className: student.className,
        section: student.section,
        present: presentDays,
        absent: absentDays,
        late: lateDays,
        halfDay: halfDays,
        total: totalDays,
        percentage: percentage.toFixed(2)
      };
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
