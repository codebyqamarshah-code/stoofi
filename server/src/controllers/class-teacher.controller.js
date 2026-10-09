const ClassTeacher = require('../models/ClassTeacher');

exports.getAll = async (req, res) => {
  try {
    const { className, section, search } = req.query;
    let query = {};
    if (className && className !== 'All') query.className = className;
    if (section && section !== 'All') query.section = section;
    if (search && search.trim()) {
      query.$or = [
        { className: { $regex: search.trim(), $options: 'i' } },
        { section: { $regex: search.trim(), $options: 'i' } },
        { teacher: { $regex: search.trim(), $options: 'i' } }
      ];
    }
    const data = await ClassTeacher.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { className, section, teacher, teacherId } = req.body;
    if (!className || !className.trim()) {
      return res.status(400).json({ success: false, message: 'Please select a Class.' });
    }
    if (!section || !section.trim()) {
      return res.status(400).json({ success: false, message: 'Please select a Section.' });
    }
    if (!teacher || !teacher.trim()) {
      return res.status(400).json({ success: false, message: 'Please select a Teacher.' });
    }

    const trimmedClass = className.trim();
    const trimmedSection = section.trim();
    const trimmedTeacher = teacher.trim();
    
    // If an assignment already exists for this Class + Section, reassign/update it
    let existing = await ClassTeacher.findOne({ 
      className: { $regex: new RegExp(`^${trimmedClass.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') }, 
      section: { $regex: new RegExp(`^${trimmedSection.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') } 
    });

    if (existing) {
      existing.teacher = trimmedTeacher;
      existing.teacherId = teacherId || existing.teacherId;
      await existing.save();
      return res.status(200).json({ 
        success: true, 
        data: existing, 
        message: `Class teacher for ${trimmedClass} (Section ${trimmedSection}) updated to ${trimmedTeacher}.` 
      });
    }

    const data = await ClassTeacher.create({ 
      className: trimmedClass, 
      section: trimmedSection, 
      teacher: trimmedTeacher, 
      teacherId: teacherId || null 
    });

    res.status(201).json({ 
      success: true, 
      data, 
      message: 'Class teacher assigned successfully.' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { className, section, teacher, teacherId } = req.body;
    if (!className || !section || !teacher) {
      return res.status(400).json({ success: false, message: 'Class, Section and Teacher are required.' });
    }

    const trimmedClass = className.trim();
    const trimmedSection = section.trim();
    const trimmedTeacher = teacher.trim();

    // Check conflict with other record
    const conflict = await ClassTeacher.findOne({
      _id: { $ne: req.params.id },
      className: { $regex: new RegExp(`^${trimmedClass.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') },
      section: { $regex: new RegExp(`^${trimmedSection.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') }
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: `${trimmedClass} Section ${trimmedSection} is already assigned to ${conflict.teacher}.`
      });
    }

    const data = await ClassTeacher.findByIdAndUpdate(
      req.params.id, 
      {
        className: trimmedClass,
        section: trimmedSection,
        teacher: trimmedTeacher,
        teacherId: teacherId || null
      }, 
      { new: true }
    );

    if (!data) return res.status(404).json({ success: false, message: 'Assignment not found.' });
    res.status(200).json({ success: true, data, message: 'Class teacher assignment updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await ClassTeacher.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Assignment not found.' });
    res.status(200).json({ success: true, data: {}, message: 'Class teacher assignment removed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

