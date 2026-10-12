const ClassRoutine = require('../models/ClassRoutine');

// Get all class routines or lab schedules
exports.getRoutines = async (req, res) => {
  try {
    const { className, sectionName, isLab, labId, day, status, search } = req.query;
    const filter = {};

    if (className) {
      filter.className = new RegExp(`^${className.trim()}$`, 'i');
    }

    if (sectionName) {
      filter.sectionName = new RegExp(`^${sectionName.trim()}$`, 'i');
    }

    if (isLab !== undefined) {
      if (isLab === 'true' || isLab === true) {
        filter.$or = [
          { isLab: true },
          { labName: { $exists: true, $ne: '' } },
          { labId: { $exists: true, $ne: '' } }
        ];
      } else if (isLab === 'false' || isLab === false) {
        filter.isLab = false;
      }
    }

    if (labId) {
      filter.labId = labId;
    }

    if (day && day !== 'All') {
      filter.day = day;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      const searchConditions = [
        { subject: searchRegex },
        { teacher: searchRegex },
        { className: searchRegex },
        { sectionName: searchRegex },
        { room: searchRegex },
        { labName: searchRegex },
        { topic: searchRegex },
        { batch: searchRegex }
      ];

      if (filter.$or) {
        filter.$and = [
          { $or: filter.$or },
          { $or: searchConditions }
        ];
        delete filter.$or;
      } else {
        filter.$or = searchConditions;
      }
    }

    const routines = await ClassRoutine.find(filter).sort({ day: 1, startTime: 1, createdAt: -1 });
    res.json({ success: true, count: routines.length, data: routines });
  } catch (error) {
    console.error('Error fetching routines:', error);
    res.status(500).json({ success: false, message: 'Server error fetching class routines', error: error.message });
  }
};

// Get single routine by ID
exports.getRoutineById = async (req, res) => {
  try {
    const routine = await ClassRoutine.findById(req.params.id);
    if (!routine) {
      return res.status(404).json({ success: false, message: 'Class routine not found' });
    }
    res.json({ success: true, data: routine });
  } catch (error) {
    console.error('Error fetching routine by ID:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Create new routine / lab schedule slot
exports.createRoutine = async (req, res) => {
  try {
    const routineData = { ...req.body };

    // Auto-detect isLab if labName or labId is present
    if (routineData.labName || routineData.labId) {
      routineData.isLab = true;
    }

    if (!routineData.className || !routineData.sectionName || !routineData.subject || !routineData.day || !routineData.startTime || !routineData.endTime) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: className, sectionName, subject, day, startTime, endTime'
      });
    }

    const newRoutine = await ClassRoutine.create(routineData);
    res.status(201).json({ success: true, message: 'Class routine created successfully', data: newRoutine });
  } catch (error) {
    console.error('Error creating routine:', error);
    res.status(500).json({ success: false, message: 'Server error creating class routine', error: error.message });
  }
};

// Update routine
exports.updateRoutine = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.labName || updateData.labId) {
      updateData.isLab = true;
    }

    const updated = await ClassRoutine.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Class routine not found' });
    }
    res.json({ success: true, message: 'Class routine updated successfully', data: updated });
  } catch (error) {
    console.error('Error updating routine:', error);
    res.status(500).json({ success: false, message: 'Server error updating class routine', error: error.message });
  }
};

// Delete routine
exports.deleteRoutine = async (req, res) => {
  try {
    const deleted = await ClassRoutine.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Class routine not found' });
    }
    res.json({ success: true, message: 'Class routine deleted successfully', data: deleted });
  } catch (error) {
    console.error('Error deleting routine:', error);
    res.status(500).json({ success: false, message: 'Server error deleting class routine', error: error.message });
  }
};
