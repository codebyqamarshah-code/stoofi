export const STANDARD_ACADEMIC_CLASSES = [
  'Nursery',
  'KG',
  'Prep',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'O-Levels',
  'A-Levels',
];

export const STANDARD_SUBJECTS_LIST = [
  'Mathematics',
  'English Language',
  'Urdu',
  'General Science',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Islamiat',
  'Pakistan Studies',
];

export const STANDARD_SECTIONS_LIST = [
  'A',
  'B',
  'C',
  'D',
];

export function normalizeClassName(className) {
  if (!className) return '';
  const str = String(className).trim();

  // If already standard full name like "Class 9", "Class 10", "Grade 9"
  const numMatch = str.match(/^(?:class|grade)?\s*(\d+)(?:st|nd|rd|th)?$/i);
  if (numMatch) {
    return `Class ${numMatch[1]}`;
  }

  // Common variations
  if (/^(playgroup|play group|pg|play)$/i.test(str)) return 'Playgroup';
  if (/^(nursery)$/i.test(str)) return 'Nursery';
  if (/^(kg|kindergarten)$/i.test(str)) return 'KG';
  if (/^(prep|pre-school|preschool|pre school)$/i.test(str)) return 'Prep';
  if (/^o[-\s]?levels?$/i.test(str)) return 'O-Levels';
  if (/^a[-\s]?levels?$/i.test(str)) return 'A-Levels';

  return str;
}

export function getAcademicRank(className) {
  if (!className) return 9999;
  const name = String(className).trim().toLowerCase();

  // Top level placeholders
  if (/^(all classes|all class|select class|select\.\.\.)$/i.test(name)) return -1;

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

export function sortClassesAcademic(classList, options = {}) {
  if (!Array.isArray(classList)) return [];

  const { ensureStandardClasses = false } = options;

  let sourceList = [...classList];
  if (ensureStandardClasses) {
    const existing = new Set(
      classList.map(item => {
        const val = typeof item === 'string' ? item : (item?.name || item?.label || item?.value || '');
        return normalizeClassName(val);
      })
    );
    for (const std of STANDARD_ACADEMIC_CLASSES) {
      if (!existing.has(std)) {
        sourceList.push({ label: std, value: std, name: std });
      }
    }
  }

  // Deduplicate classes with normalized names (e.g. "9" and "Class 9", or identical names)
  const seen = new Map();
  for (const item of sourceList) {
    if (!item) continue;
    const isString = typeof item === 'string';
    const rawVal = isString ? item : (item.label ?? item.name ?? item.title ?? item.value ?? '');
    const cleanStr = String(rawVal).trim();
    if (!cleanStr) continue;

    // Preserve "All Classes" or "Select Class" at top
    if (/^(all classes|all class)$/i.test(cleanStr)) {
      seen.set('__all_classes__', isString ? cleanStr : { ...item, label: cleanStr, value: '' });
      continue;
    }

    const normName = normalizeClassName(cleanStr);
    const numMatch = cleanStr.match(/^(?:class|grade)?\s*(\d+)(?:st|nd|rd|th)?$/i);
    const normKey = numMatch ? `class-${numMatch[1]}` : normName.toLowerCase();

    // Standardize the display label so bare numbers "9" or "10" always show cleanly as "Class 9", "Class 10"
    const standardizedItem = isString
      ? normName
      : {
          ...item,
          label: normName,
          // Keep original id value if it was a mongodb _id, otherwise use standardized name
          value: item.value && typeof item.value === 'string' && item.value.length === 24 ? item.value : normName,
          name: normName,
        };

    // If seen already, overwrite to ensure standardized item is used
    seen.set(normKey, standardizedItem);
  }

  const uniqueList = Array.from(seen.values());

  return uniqueList.sort((a, b) => {
    const nameA = a?.name || a?.label || a?.title || a?.value || (typeof a === 'string' ? a : '');
    const nameB = b?.name || b?.label || b?.title || b?.value || (typeof b === 'string' ? b : '');
    const rankA = getAcademicRank(nameA);
    const rankB = getAcademicRank(nameB);
    if (rankA !== rankB) {
      return rankA - rankB;
    }
    return String(nameA).localeCompare(String(nameB), undefined, { numeric: true, sensitivity: 'base' });
  });
}
