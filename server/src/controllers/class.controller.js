const Class = require('../models/Class');

function getAcademicRank(className) {
  if (!className) return 9999;
  const name = String(className).trim().toLowerCase();

  // Playgroup / Nursery / KG / Prep
  if (/^(playgroup|play group|pg|play)\b/i.test(name)) return 1;
  if (/^nursery\s*1/i.test(name)) return 2;
  if (/^nursery\s*2/i.test(name)) return 3;
  if (/^nursery/i.test(name)) return 4;
  if (/^(lkg|lower kg|junior kg)/i.test(name)) return 5;
  if (/^(ukg|upper kg|senior kg)/i.test(name)) return 6;
  if (/^kg\s*1/i.test(name)) return 7;
  if (/^kg\s*2/i.test(name)) return 8;
  if (/^(kg|kindergarten)/i.test(name)) return 9;
  if (/^(prep|pre-school|preschool|pre school|pre-prep)/i.test(name)) return 10;

  // Numeric Class 1 to 12
  const numMatch = name.match(/^(?:class|grade)?\s*(\d+)(?:st|nd|rd|th)?/i);
  if (numMatch) {
    const num = parseInt(numMatch[1], 10);
    return 100 + num;
  }

  // Intermediate / College
  if (/^(1st year|first year|xi|11th)/i.test(name)) return 111;
  if (/^(2nd year|second year|xii|12th)/i.test(name)) return 112;
  if (/^(fsc|ics|fa|i\.com|icom)\s*1/i.test(name)) return 113;
  if (/^(fsc|ics|fa|i\.com|icom)\s*2/i.test(name)) return 114;

  // O/A Levels
  if (/^o[-\s]?level/i.test(name)) return 120;
  if (/^a[-\s]?level/i.test(name)) return 130;

  return 200;
}

function normalizeClassName(className) {
  if (!className) return '';
  const str = String(className).trim();
  const numMatch = str.match(/^(?:class|grade)?\s*(\d+)(?:st|nd|rd|th)?$/i);
  if (numMatch) return `Class ${numMatch[1]}`;
  if (/^(playgroup|play group|pg|play)$/i.test(str)) return 'Playgroup';
  if (/^(nursery)$/i.test(str)) return 'Nursery';
  if (/^(kg|kindergarten)$/i.test(str)) return 'KG';
  if (/^(prep|pre-school|preschool)$/i.test(str)) return 'Prep';
  if (/^o[-\s]?levels?$/i.test(str)) return 'O-Levels';
  if (/^a[-\s]?levels?$/i.test(str)) return 'A-Levels';
  return str;
}

function sortClasses(classList) {
  const seen = new Map();
  for (const item of classList) {
    if (!item) continue;
    const rawName = String(item.name || item.label || item.title || (typeof item === 'string' ? item : '')).trim();
    if (!rawName) continue;

    const normName = normalizeClassName(rawName);
    const numMatch = rawName.match(/^(?:class|grade)?\s*(\d+)(?:st|nd|rd|th)?$/i);
    const normKey = numMatch ? `class-${numMatch[1]}` : normName.toLowerCase();

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

    // Check duplicate
    const numMatch = rawName.match(/^(?:class|grade)?\s*(\d+)(?:st|nd|rd|th)?$/i);
    const regexPattern = numMatch ? `^(class\\s*|grade\\s*)?${numMatch[1]}$` : `^${rawName}$`;
    const existing = await Class.findOne({ name: { $regex: new RegExp(regexPattern, 'i') } });
    if (existing) {
      return res.status(400).json({ success: false, message: `Class "${existing.name}" already exists.` });
    }

    const data = await Class.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await Class.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
