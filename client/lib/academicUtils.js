/**
 * Official Academic Utilities for Pak Royal College & Higher Education
 * College Programs: BS Psychology, BS RIT, DPT, FSC Dental, FSC NURSING, FSC OTT
 * Dynamic live data is prioritized from database / API (/class and /section).
 */

export const STANDARD_ACADEMIC_CLASSES = [
  'BS Psychology',
  'BS RIT',
  'DPT',
  'FSC Dental',
  'FSC NURSING',
  'FSC OTT',
];

export const STANDARD_SUBJECTS_LIST = [
  'Anatomy & Physiology',
  'Biochemistry',
  'Pathology',
  'Pharmacology',
  'Microbiology',
  'Clinical Psychology',
  'Radiology & Imaging',
  'Dental Materials',
  'Nursing Fundamentals',
  'Operation Theater Techniques',
  'Medical Ethics',
  'English',
  'Pakistan Studies',
  'Islamic Studies',
];

export const STANDARD_SECTIONS_LIST = [
  'A',
  'B',
  'C',
  'D',
  'E',
];

/**
 * Detects legacy school classes (Class 1-10, Nursery, KG, Prep, etc.)
 * so they are never displayed in this college management system.
 */
export function isSchoolClass(className) {
  if (!className) return false;
  const str = String(className).trim().toLowerCase();
  return /^(playgroup|play group|pg|play|nursery|kg|prep|class\s*\d+|grade\s*\d+|o[-\s]?level|a[-\s]?level)$/i.test(str);
}

export function normalizeClassName(className) {
  if (!className) return '';
  return String(className).trim();
}

export function getAcademicRank(className) {
  if (!className) return 9999;
  const name = String(className).trim().toLowerCase();

  // Top level placeholders
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

/**
 * Sorts and filters class list for college management:
 * - Purges deprecated school classes (Class 1-10, Nursery, Prep, etc.)
 * - Deduplicates classes cleanly
 * - Orders by degree / program hierarchy
 */
export function sortClassesAcademic(classList, options = {}) {
  if (!Array.isArray(classList)) return [];

  const { ensureStandardClasses = false } = options;

  let sourceList = [...classList];
  if (ensureStandardClasses) {
    const existing = new Set(
      classList.map(item => {
        const val = typeof item === 'string' ? item : (item?.name || item?.label || item?.value || '');
        return normalizeClassName(val).toLowerCase();
      })
    );
    for (const std of STANDARD_ACADEMIC_CLASSES) {
      if (!existing.has(std.toLowerCase())) {
        sourceList.push({ label: std, value: std, name: std });
      }
    }
  }

  const seen = new Map();
  for (const item of sourceList) {
    if (!item) continue;
    const isString = typeof item === 'string';
    const rawVal = isString ? item : (item.label ?? item.name ?? item.title ?? item.value ?? '');
    const cleanStr = String(rawVal).trim();
    if (!cleanStr) continue;

    // Filter out school classes (Class 1-10, Nursery, KG, Prep)
    if (isSchoolClass(cleanStr)) {
      continue;
    }

    // Preserve "All Classes" or "Select Class" at top
    if (/^(all classes|all class)$/i.test(cleanStr)) {
      seen.set('__all_classes__', isString ? cleanStr : { ...item, label: cleanStr, value: '' });
      continue;
    }

    const normName = normalizeClassName(cleanStr);
    const normKey = normName.toLowerCase();

    const standardizedItem = isString
      ? normName
      : {
          ...item,
          label: normName,
          value: item.value && typeof item.value === 'string' && item.value.length === 24 ? item.value : normName,
          name: normName,
        };

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
