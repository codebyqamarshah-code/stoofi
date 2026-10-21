const Class = require('../models/Class');

function isSchoolClass(name) {
  if (!name) return false;
  return /^(playgroup|play group|pg|play|nursery|kg|prep|class\s*\d+|grade\s*\d+|o[-\s]?level|a[-\s]?level)$/i.test(String(name).trim());
}

function getAcademicRank(className) {
  if (!className) return 9999;
  const name = String(className).trim().toLowerCase();

  if (/^(all classes|all class|select class|select\.\.\.)$/i.test(name)) return -1;

  // College Degree & Diploma Ranks
  if (/^bs\s*psychology/i.test(name)) return 10;
  if (/^bs\s*rit/i.test(name)) return 11;
  if (/^bs\b/i.test(name)) return 15;
  if (/^dpt\b/i.test(name)) return 20;
  if (/^pharm\b/i.test(name)) return 25;
  if (/^fsc\s*nursing/i.test(name)) return 30;
  if (/^fsc\s*ott/i.test(name)) return 31;
  if (/^fsc\s*dental/i.test(name)) return 32;
  if (/^fsc\b/i.test(name)) return 35;

  return 50;
}

function normalizeClassName(className) {
  if (!className) return '';
  return String(className).trim();
}

function sortClasses(classList) {
  const seen = new Map();
  for (const item of classList) {
    if (!item) continue;
    const rawName = String(item.name || item.label || item.title || (typeof item === 'string' ? item : '')).trim();
    if (!rawName) continue;

    // Filter out school classes
    if (isSchoolClass(rawName)) continue;

    const normName = normalizeClassName(rawName);
    const normKey = normName.toLowerCase();

    const normalizedObj = typeof item === 'object' && item !== null
      ? (item._doc ? { ...item._doc, name: normName } : { ...item, name: normName, label: normName })
      : normName;

    seen.set(normKey, normalizedObj);
  }

  const uniqueList = Array.from(seen.values());

  return uniqueList.sort((a, b) => {
    const nameA = a.name || a.label || a.title || (typeof a === 'string' ? a : '');
    const nameB = b.name || b.label || b.title || (typeof b === 'string' ? b : '');
    const rankA = getAcademicRank(nameA);
    const rankB = getAcademicRank(nameB);
    if (rankA !== rankB) {
      return rankA - rankB;
    }
    return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
  });
}

exports.sortClasses = sortClasses;

exports.getAll = async (req, res) => {
  try {
    const data = await Class.find();
    const sorted = sortClasses(data || []);
    res.status(200).json({ success: true, data: sorted });
  } catch (error) {
    console.error("getAll classes error:", error);
    res.status(200).json({ success: true, data: [] });
  }
};

exports.create = async (req, res) => {
  try {
    const rawName = (req.body.name || '').trim();
    if (!rawName) {
      return res.status(400).json({ success: false, message: 'Class name is required' });
    }

    const name = normalizeClassName(rawName);
    const existing = await Class.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Class already exists' });
    }

    const newClass = await Class.create({
      name,
      sections: req.body.sections || []
    });

    res.status(201).json({ success: true, data: newClass });
  } catch (error) {
    console.error("create class error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const rawName = (req.body.name || '').trim();
    if (!rawName) {
      return res.status(400).json({ success: false, message: 'Class name is required' });
    }

    const name = normalizeClassName(rawName);
    const existing = await Class.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      _id: { $ne: id }
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Another class with this name already exists' });
    }

    const updated = await Class.findByIdAndUpdate(
      id,
      { name, sections: req.body.sections || [] },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("update class error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Class.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }
    res.status(200).json({ success: true, message: 'Class deleted successfully' });
  } catch (error) {
    console.error("delete class error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.remove = exports.delete;
