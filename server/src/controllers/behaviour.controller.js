const BehaviourIncident = require('../models/BehaviourIncident');
const AssignedIncident = require('../models/AssignedIncident');
const BehaviourSetting = require('../models/BehaviourSetting');
const Student = require('../models/Student');
const Notification = require('../models/Notification');

// Default initial incidents to seed if empty
const DEFAULT_INCIDENTS = [
  { title: 'Academic Excellence & Consistent Performance', point: 10, pointType: 'positive', description: 'Consistently shows high academic discipline and top scores in evaluations.' },
  { title: 'Helping Peers & Positive Classroom Conduct', point: 5, pointType: 'positive', description: 'Assists fellow classmates, demonstrates leadership, and cooperates with teachers.' },
  { title: 'Outstanding Sportsmanship & Team Spirit', point: 5, pointType: 'positive', description: 'Exemplary conduct during physical education, sports events, and team activities.' },
  { title: 'Perfect Attendance & Punctuality Award', point: 10, pointType: 'positive', description: 'Never arrives late and maintains continuous attendance throughout the month.' },
  { title: 'Disruptive Behaviour in Classroom', point: -5, pointType: 'negative', description: 'Interrupts lectures, talks loudly, and causes disruption to fellow students.' },
  { title: 'Late Arrival / Unexcused Tardiness', point: -3, pointType: 'negative', description: 'Repeatedly arrives after morning assembly or commencement of periods.' },
  { title: 'Uniform & Dress Code Violation', point: -2, pointType: 'negative', description: 'Incomplete school uniform, missing tie/badge, or inappropriate footwear.' },
  { title: 'Incomplete Homework / Assignment Neglect', point: -5, pointType: 'negative', description: 'Fails to submit assigned academic tasks and homework repeatedly without valid reason.' },
  { title: 'Verbal Dispute or Aggression with Peers', point: -10, pointType: 'negative', description: 'Engages in quarreling, disrespect, or physical altercations with schoolmates.' }
];

// --- INCIDENTS CONTROLLER ---
exports.getIncidents = async (req, res) => {
  try {
    let list = await BehaviourIncident.find().sort({ createdAt: -1 });
    if (list.length === 0) {
      list = await BehaviourIncident.insertMany(DEFAULT_INCIDENTS);
    }
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createIncident = async (req, res) => {
  try {
    const { title, point, pointType, description } = req.body;
    if (!title || point === undefined) {
      return res.status(400).json({ success: false, message: 'Title and Point are required.' });
    }
    const cleanPoint = Math.abs(Number(point));
    const calculatedPoint = pointType === 'negative' ? -cleanPoint : cleanPoint;

    const incident = await BehaviourIncident.create({
      title,
      point: calculatedPoint,
      pointType: pointType || (calculatedPoint < 0 ? 'negative' : 'positive'),
      description: description || ''
    });
    res.status(201).json({ success: true, data: incident });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, point, pointType, description } = req.body;
    const cleanPoint = Math.abs(Number(point));
    const calculatedPoint = pointType === 'negative' ? -cleanPoint : cleanPoint;

    const updated = await BehaviourIncident.findByIdAndUpdate(
      id,
      {
        title,
        point: calculatedPoint,
        pointType: pointType || (calculatedPoint < 0 ? 'negative' : 'positive'),
        description: description || ''
      },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'Incident not found' });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await BehaviourIncident.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Incident not found' });
    res.status(200).json({ success: true, message: 'Incident deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- ASSIGNED INCIDENTS CONTROLLER ---
exports.getAssignedIncidents = async (req, res) => {
  try {
    const { className, section, studentId, search } = req.query;
    const query = {};
    if (className) query.className = className;
    if (section) query.section = section;
    if (studentId) query.studentId = studentId;
    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { admissionNo: { $regex: search, $options: 'i' } },
        { incidentTitle: { $regex: search, $options: 'i' } }
      ];
    }

    const data = await AssignedIncident.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.assignIncident = async (req, res) => {
  try {
    const {
      studentId,
      studentName,
      admissionNo,
      className,
      section,
      incidentId,
      incidentTitle,
      point,
      pointType,
      incidentDate,
      assignedBy,
      remarks
    } = req.body;

    if (!studentName || !incidentTitle) {
      return res.status(400).json({ success: false, message: 'Student and Incident details are required.' });
    }

    const cleanPoint = Math.abs(Number(point));
    const calculatedPoint = pointType === 'negative' ? -cleanPoint : cleanPoint;

    const assigned = await AssignedIncident.create({
      studentId: studentId || `stu-${Date.now()}`,
      studentName,
      admissionNo: admissionNo || 'N/A',
      className: className || 'FSC OTT',
      section: section || 'A',
      incidentId,
      incidentTitle,
      point: calculatedPoint,
      pointType: pointType || (calculatedPoint < 0 ? 'negative' : 'positive'),
      incidentDate: incidentDate || new Date().toISOString().split('T')[0],
      assignedBy: assignedBy || req.user?.fullName || 'Super Admin',
      remarks: remarks || ''
    });

    // Update student's behaviourPoints and send notification
    try {
      let targetStudent = null;
      if (admissionNo && admissionNo !== 'N/A') {
        targetStudent = await Student.findOne({ admissionNo });
      }
      if (!targetStudent && studentId && studentId.match(/^[0-9a-fA-F]{24}$/)) {
        targetStudent = await Student.findById(studentId);
      }

      if (targetStudent) {
        targetStudent.behaviourPoints = (targetStudent.behaviourPoints || 0) + calculatedPoint;
        await targetStudent.save();

        // Send notification to student if user account is linked
        if (targetStudent.user) {
          const isPos = calculatedPoint >= 0;
          await Notification.create({
            title: isPos ? `🌟 Behaviour Merit: ${incidentTitle}` : `⚠️ Behaviour Infraction: ${incidentTitle}`,
            message: `${isPos ? 'Awarded' : 'Deducted'} ${Math.abs(calculatedPoint)} points on ${incidentDate}. Remarks: ${remarks || 'Evaluated by ' + (assignedBy || 'Administration')}.`,
            type: 'System',
            audience: 'Student',
            recipientId: targetStudent.user,
            isRead: false
          }).catch(() => {});
        }
      }

      // Audit notification for Super Admin
      const isPos = calculatedPoint >= 0;
      await Notification.create({
        title: `📋 Conduct Incident: ${studentName}`,
        message: `${incidentTitle} (${isPos ? `+${calculatedPoint}` : calculatedPoint} pts) recorded for ${studentName} (${className} - ${section}) by ${assignedBy || req.user?.fullName || 'Staff'}.`,
        type: 'System',
        audience: 'Super Admin',
        isRead: false
      }).catch(() => {});
    } catch (notifErr) {
      console.warn('Behaviour notification/points error:', notifErr.message);
    }

    res.status(201).json({ success: true, data: assigned });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAssignedIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await AssignedIncident.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Record not found' });

    // Revert student behaviour points
    try {
      if (deleted.admissionNo && deleted.admissionNo !== 'N/A') {
        await Student.findOneAndUpdate(
          { admissionNo: deleted.admissionNo },
          { $inc: { behaviourPoints: -deleted.point } }
        );
      }
    } catch (revertErr) {
      console.warn('Revert points error:', revertErr.message);
    }

    res.status(200).json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- REPORTS CONTROLLER ---
exports.getStudentReport = async (req, res) => {
  try {
    const { className, section, search } = req.query;
    const query = {};
    if (className) query.className = className;
    if (section) query.section = section;
    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { admissionNo: { $regex: search, $options: 'i' } }
      ];
    }

    const assigned = await AssignedIncident.find(query).sort({ incidentDate: -1 });

    // Group by student
    const studentMap = {};
    assigned.forEach(item => {
      const key = item.admissionNo || item.studentName;
      if (!studentMap[key]) {
        studentMap[key] = {
          studentId: item.studentId,
          studentName: item.studentName,
          admissionNo: item.admissionNo,
          className: item.className,
          section: item.section,
          totalIncidents: 0,
          positivePoints: 0,
          negativePoints: 0,
          totalScore: 0,
          incidentsList: []
        };
      }
      studentMap[key].totalIncidents += 1;
      if (item.point > 0) {
        studentMap[key].positivePoints += item.point;
      } else {
        studentMap[key].negativePoints += item.point;
      }
      studentMap[key].totalScore += item.point;
      studentMap[key].incidentsList.push(item);
    });

    const report = Object.values(studentMap);
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getClassSectionReport = async (req, res) => {
  try {
    const assigned = await AssignedIncident.find();
    const classMap = {};

    assigned.forEach(item => {
      const key = `${item.className}_${item.section}`;
      if (!classMap[key]) {
        classMap[key] = {
          className: item.className,
          section: item.section,
          totalIncidents: 0,
          positiveIncidents: 0,
          negativeIncidents: 0,
          totalPoints: 0,
          studentsSet: new Set()
        };
      }
      classMap[key].totalIncidents += 1;
      if (item.point > 0) classMap[key].positiveIncidents += 1;
      else classMap[key].negativeIncidents += 1;
      classMap[key].totalPoints += item.point;
      classMap[key].studentsSet.add(item.admissionNo || item.studentName);
    });

    const report = Object.values(classMap).map(cls => ({
      className: cls.className,
      section: cls.section,
      totalIncidents: cls.totalIncidents,
      positiveIncidents: cls.positiveIncidents,
      negativeIncidents: cls.negativeIncidents,
      totalPoints: cls.totalPoints,
      studentsCount: cls.studentsSet.size,
      avgScore: cls.studentsSet.size > 0 ? (cls.totalPoints / cls.studentsSet.size).toFixed(1) : 0
    }));

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getIncidentWiseReport = async (req, res) => {
  try {
    const assigned = await AssignedIncident.find();
    const incidentMap = {};

    assigned.forEach(item => {
      const key = item.incidentTitle;
      if (!incidentMap[key]) {
        incidentMap[key] = {
          incidentTitle: item.incidentTitle,
          point: item.point,
          pointType: item.pointType,
          totalCount: 0,
          studentsSet: new Set(),
          classesSet: new Set(),
          lastDate: item.incidentDate
        };
      }
      incidentMap[key].totalCount += 1;
      incidentMap[key].studentsSet.add(item.admissionNo || item.studentName);
      incidentMap[key].classesSet.add(`${item.className} (${item.section})`);
      if (item.incidentDate > incidentMap[key].lastDate) {
        incidentMap[key].lastDate = item.incidentDate;
      }
    });

    const report = Object.values(incidentMap).map(inc => ({
      incidentTitle: inc.incidentTitle,
      point: inc.point,
      pointType: inc.pointType,
      totalCount: inc.totalCount,
      uniqueStudentsCount: inc.studentsSet.size,
      affectedClasses: Array.from(inc.classesSet).join(', '),
      lastDate: inc.lastDate
    }));

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- SETTINGS CONTROLLER ---
exports.getSettings = async (req, res) => {
  try {
    let settings = await BehaviourSetting.findOne();
    if (!settings) {
      settings = await BehaviourSetting.create({});
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.saveSettings = async (req, res) => {
  try {
    let settings = await BehaviourSetting.findOne();
    if (!settings) {
      settings = await BehaviourSetting.create(req.body);
    } else {
      settings = await BehaviourSetting.findByIdAndUpdate(settings._id, req.body, { new: true });
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
