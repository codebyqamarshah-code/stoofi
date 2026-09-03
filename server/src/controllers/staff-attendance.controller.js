const Attendance = require('../models/Attendance');
const Staff = require('../models/Staff');

exports.getAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    
    // First find all staff
    const staffs = await Staff.find();
    
    // Then find attendance records for this date
    const targetDate = new Date(date || Date.now());
    targetDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date || Date.now());
    endDate.setHours(23, 59, 59, 999);

    const attendanceRecords = await Attendance.find({
      userType: 'Staff',
      date: { $gte: targetDate, $lte: endDate }
    });

    const data = staffs.map(staff => {
      const record = attendanceRecords.find(r => r.recordId.toString() === staff._id.toString());
      return {
        staffId: staff._id,
        name: `${staff.firstName} ${staff.lastName}`,
        department: staff.department,
        designation: staff.designation,
        status: record ? record.status : 'Present',
        note: record ? record.name : ''
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
      let record = await Attendance.findOne({
        userType: 'Staff',
        recordId: item.staffId,
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
          userType: 'Staff',
          recordId: item.staffId,
          name: item.note || item.name,
          status: item.status
        });
      }
    }
    
    res.status(200).json({ success: true, message: 'Staff attendance saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
