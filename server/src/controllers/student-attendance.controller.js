const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

exports.getAttendance = async (req, res) => {
  try {
    const { class: className, section, date } = req.query;
    
    // First find all students in this class and section with flexible matching
    const studentQuery = {};
    if (className) {
      const cleanClass = className.replace(/^Class\s*/i, '').trim();
      studentQuery.className = { $regex: new RegExp(`^(Class\\s*)?${cleanClass}$`, 'i') };
    }
    if (section) {
      const cleanSec = section.replace(/^Section\s*/i, '').trim();
      studentQuery.section = { $regex: new RegExp(`^(Section\\s*)?${cleanSec}$`, 'i') };
    }
    const students = await Student.find(studentQuery);
    
    // Then find attendance records for this date
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const attendanceRecords = await Attendance.find({
      userType: 'Student',
      date: { $gte: targetDate, $lte: endDate }
    });

    // Map students to their attendance status (default to Present if not marked yet)
    const data = students.map(student => {
      const record = attendanceRecords.find(r => r.recordId.toString() === student._id.toString());
      return {
        studentId: student._id,
        admissionNo: student.admissionNo,
        rollNo: student.rollNumber,
        name: `${student.firstName} ${student.lastName}`,
        status: record ? record.status : 'Present', // Default assumption before saving
        note: record ? record.name : '' // we can store note in 'name' field or just return it
      };
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.saveAttendance = async (req, res) => {
  try {
    const { date, attendanceData } = req.body;
    const targetDate = new Date(date);
    
    for (const item of attendanceData) {
      // Find existing
      let record = await Attendance.findOne({
        userType: 'Student',
        recordId: item.studentId,
        date: {
          $gte: new Date(targetDate.setHours(0,0,0,0)),
          $lte: new Date(targetDate.setHours(23,59,59,999))
        }
      });

      if (record) {
        record.status = item.status;
        record.name = item.note || item.name;
        await record.save();
      } else {
        await Attendance.create({
          date: new Date(date),
          userType: 'Student',
          recordId: item.studentId,
          name: item.note || item.name,
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
