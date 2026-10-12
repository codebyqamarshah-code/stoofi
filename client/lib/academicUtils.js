export function getAcademicRank(className) {
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

export function sortClassesAcademic(classList) {
  if (!Array.isArray(classList)) return [];

  // Deduplicate classes with normalized names (e.g. "10" and "Class 10", or identical names)
  const seen = new Map();
  for (const item of classList) {
    if (!item) continue;
    const rawName = String(item?.name || item?.label || item?.title || item?.value || (typeof item === 'string' ? item : '')).trim();
    if (!rawName) continue;

    // Normalization key: e.g. "class 10" -> "class-10", "10" -> "class-10", "grade 10" -> "class-10"
    const numMatch = rawName.match(/^(?:class|grade)?\s*(\d+)(?:st|nd|rd|th)?$/i);
    const normKey = numMatch ? `class-${numMatch[1]}` : rawName.toLowerCase();

    if (!seen.has(normKey)) {
      seen.set(normKey, item);
    } else {
      // If we already have one, prefer "Class X" over bare number "X"
      const existing = seen.get(normKey);
      const existingName = String(existing?.name || existing?.label || existing?.title || existing?.value || '');
      if (!/^class\s*\d+/i.test(existingName) && /^class\s*\d+/i.test(rawName)) {
        seen.set(normKey, item);
      }
    }
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
