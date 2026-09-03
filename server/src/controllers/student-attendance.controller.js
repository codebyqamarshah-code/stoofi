const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

exports.getAttendance = async (req, res) => {
  try {
    const { class: className, section, date } = req.query;
    
    // First find all students in this class and section
    const students = await Student.find({ className, section });
    
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
