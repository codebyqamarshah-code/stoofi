const AdmissionCounter = require('../models/AdmissionCounter');
const Student = require('../models/Student');
const StudentEnrollment = require('../models/StudentEnrollment');

/**
 * Extracts 4-digit year from any date string or Date object.
 * e.g. "2023-09-15" -> 2023, "15/08/2024" -> 2024, "2026" -> 2026
 */
function extractYear(val) {
  if (!val) return new Date().getFullYear();
  if (typeof val === 'number' && val >= 1990 && val <= 2100) return val;
  const str = String(val).trim();
  const match = str.match(/\b(19\d{2}|20\d{2})\b/);
  if (match) return parseInt(match[1], 10);
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    if (y >= 1990 && y <= 2100) return y;
  }
  return new Date().getFullYear();
}

/**
 * Scans existing Student and StudentEnrollment collections to find the highest
 * existing admission number sequence for a given year.
 */
async function findHighestExistingAdmissionSeq(year) {
  const yStr = String(year);
  const y2 = yStr.slice(-2); // e.g. "23" for 2023, "26" for 2026

  let maxSeq = 0;

  // 1. Check StudentEnrollment
  try {
    const enrollments = await StudentEnrollment.find(
      { admissionYear: year },
      'admissionNumber'
    ).lean();
    for (const e of enrollments) {
      if (!e.admissionNumber) continue;
      const m = String(e.admissionNumber).match(/(\d+)$/);
      if (m) {
        const n = parseInt(m[1], 10);
        if (!isNaN(n) && n > maxSeq) maxSeq = n;
      }
    }
  } catch (_) {}

  // 2. Check Student collection
  try {
    // Matches ADM-2023-0001, ADM20230001, ADM230001, ADM-2023-1, etc.
    const regex = new RegExp(`ADM[-_]?(${yStr}|${y2})[-_]?(\\d+)`, 'i');
    const students = await Student.find(
      { admissionNo: { $regex: regex } },
      'admissionNo'
    ).lean();

    for (const s of students) {
      if (!s.admissionNo) continue;
      const m = String(s.admissionNo).match(regex);
      if (m && m[2]) {
        const n = parseInt(m[2], 10);
        if (!isNaN(n) && n > maxSeq) maxSeq = n;
      } else {
        const endDigits = String(s.admissionNo).match(/(\d+)$/);
        if (endDigits) {
          const n = parseInt(endDigits[1], 10);
          if (!isNaN(n) && n > maxSeq) maxSeq = n;
        }
      }
    }
  } catch (_) {}

  return maxSeq;
}

/**
 * Scans existing Student and StudentEnrollment to find highest roll number sequence.
 */
async function findHighestExistingRollSeq(year) {
  const yStr = String(year);
  const y2 = yStr.slice(-2);
  let maxSeq = 0;

  try {
    const enrollments = await StudentEnrollment.find(
      { admissionYear: year },
      'rollNumber'
    ).lean();
    for (const e of enrollments) {
      if (!e.rollNumber) continue;
      const m = String(e.rollNumber).match(/(\d+)$/);
      if (m) {
        const n = parseInt(m[1], 10);
        if (!isNaN(n) && n > maxSeq) maxSeq = n;
      }
    }
  } catch (_) {}

  try {
    const regex = new RegExp(`(ROLL|PRC)[-_]?(${yStr}|${y2})[-_]?(\\d+)`, 'i');
    const students = await Student.find(
      { rollNo: { $regex: regex } },
      'rollNo'
    ).lean();

    for (const s of students) {
      if (!s.rollNo) continue;
      const m = String(s.rollNo).match(regex);
      if (m && m[3]) {
        const n = parseInt(m[3], 10);
        if (!isNaN(n) && n > maxSeq) maxSeq = n;
      }
    }
  } catch (_) {}

  return maxSeq;
}

/**
 * Atomically reserves and returns the next official Admission Number for a target year.
 * Concurrency-safe, collision-proof, preserves existing records and starts at 0001 if empty.
 * Format: ADM-YYYY-XXXX (e.g. ADM-2023-0001)
 */
async function generateAdmissionNumber(yearInput) {
  const year = extractYear(yearInput);
  const key = `adm-${year}`;

  const highestExisting = await findHighestExistingAdmissionSeq(year);

  // Atomically find or create the counter document
  let counter = await AdmissionCounter.findOne({ key });
  if (!counter) {
    // If no counter doc exists yet, initialize it at highest existing
    try {
      counter = await AdmissionCounter.create({
        key,
        type: 'admission',
        year,
        scope: 'institution',
        sequence: highestExisting
      });
    } catch (err) {
      // Caught race condition in creation - re-fetch
      counter = await AdmissionCounter.findOne({ key });
    }
  } else if (counter.sequence < highestExisting) {
    // Reconcile counter with existing DB records if records were added out-of-band
    await AdmissionCounter.updateOne(
      { key, sequence: { $lt: highestExisting } },
      { $set: { sequence: highestExisting } }
    );
  }

  // Atomically increment counter
  let updatedCounter = await AdmissionCounter.findOneAndUpdate(
    { key },
    { $inc: { sequence: 1 }, $setOnInsert: { type: 'admission', year, scope: 'institution' } },
    { returnDocument: 'after', upsert: true }
  );

  let seq = updatedCounter.sequence;
  let candidate = `ADM-${year}-${String(seq).padStart(4, '0')}`;

  // Extra safety: ensure candidate is strictly unique against Student & StudentEnrollment
  let isDuplicate = await checkAdmissionNoExists(candidate);
  while (isDuplicate) {
    updatedCounter = await AdmissionCounter.findOneAndUpdate(
      { key },
      { $inc: { sequence: 1 } },
      { returnDocument: 'after' }
    );
    seq = updatedCounter.sequence;
    candidate = `ADM-${year}-${String(seq).padStart(4, '0')}`;
    isDuplicate = await checkAdmissionNoExists(candidate);
  }

  return {
    admissionNumber: candidate,
    admissionNo: candidate,
    year,
    sequence: seq
  };
}

/**
 * Atomically reserves and returns the next official Internal Roll Number for a target year.
 * Format: ROLL-YYYY-XXXX (e.g. ROLL-2023-0001)
 */
async function generateRollNumber(yearInput) {
  const year = extractYear(yearInput);
  const key = `roll-${year}`;

  const highestExisting = await findHighestExistingRollSeq(year);

  let counter = await AdmissionCounter.findOne({ key });
  if (!counter) {
    try {
      counter = await AdmissionCounter.create({
        key,
        type: 'roll',
        year,
        scope: 'institution',
        sequence: highestExisting
      });
    } catch (_) {
      counter = await AdmissionCounter.findOne({ key });
    }
  } else if (counter.sequence < highestExisting) {
    await AdmissionCounter.updateOne(
      { key, sequence: { $lt: highestExisting } },
      { $set: { sequence: highestExisting } }
    );
  }

  let updatedCounter = await AdmissionCounter.findOneAndUpdate(
    { key },
    { $inc: { sequence: 1 }, $setOnInsert: { type: 'roll', year, scope: 'institution' } },
    { returnDocument: 'after', upsert: true }
  );

  let seq = updatedCounter.sequence;
  let candidate = `ROLL-${year}-${String(seq).padStart(4, '0')}`;

  let isDuplicate = await checkRollNoExists(candidate);
  while (isDuplicate) {
    updatedCounter = await AdmissionCounter.findOneAndUpdate(
      { key },
      { $inc: { sequence: 1 } },
      { returnDocument: 'after' }
    );
    seq = updatedCounter.sequence;
    candidate = `ROLL-${year}-${String(seq).padStart(4, '0')}`;
    isDuplicate = await checkRollNoExists(candidate);
  }

  return {
    rollNumber: candidate,
    rollNo: candidate,
    year,
    sequence: seq
  };
}

/**
 * Atomically reserves a permanent Student Code.
 * Format: STU-YYYY-XXXX (e.g. STU-2026-0001)
 */
async function generateStudentCode(yearInput) {
  const year = extractYear(yearInput);
  const key = `stu-${year}`;

  const updatedCounter = await AdmissionCounter.findOneAndUpdate(
    { key },
    { $inc: { sequence: 1 }, $setOnInsert: { type: 'studentCode', year, scope: 'institution' } },
    { new: true, upsert: true }
  );

  const seq = updatedCounter.sequence;
  const candidate = `STU-${year}-${String(seq).padStart(4, '0')}`;
  return {
    studentCode: candidate,
    year,
    sequence: seq
  };
}

/**
 * Check if an admission number is taken
 */
async function checkAdmissionNoExists(admissionNo) {
  const [s, e] = await Promise.all([
    Student.findOne({ admissionNo }).select('_id').lean(),
    StudentEnrollment.findOne({ admissionNumber: admissionNo }).select('_id').lean()
  ]);
  return !!(s || e);
}

/**
 * Check if a roll number is taken
 */
async function checkRollNoExists(rollNo) {
  const [s, e] = await Promise.all([
    Student.findOne({ rollNo }).select('_id').lean(),
    StudentEnrollment.findOne({ rollNumber: rollNo }).select('_id').lean()
  ]);
  return !!(s || e);
}

/**
 * Peeks at what the next admission number will be WITHOUT incrementing counter
 */
async function previewNextAdmissionNumber(yearInput) {
  const year = extractYear(yearInput);
  const key = `adm-${year}`;
  const highestExisting = await findHighestExistingAdmissionSeq(year);
  const counter = await AdmissionCounter.findOne({ key }).lean();
  const currentSeq = Math.max(highestExisting, counter?.sequence || 0);
  const nextSeq = currentSeq + 1;
  const candidate = `ADM-${year}-${String(nextSeq).padStart(4, '0')}`;
  return {
    nextAdmissionNo: candidate,
    admissionNumber: candidate,
    admissionNo: candidate,
    year,
    nextSequence: nextSeq
  };
}

/**
 * Peeks at what the next roll number will be WITHOUT incrementing counter
 */
async function previewNextRollNumber(yearInput) {
  const year = extractYear(yearInput);
  const key = `roll-${year}`;
  const highestExisting = await findHighestExistingRollSeq(year);
  const counter = await AdmissionCounter.findOne({ key }).lean();
  const currentSeq = Math.max(highestExisting, counter?.sequence || 0);
  const nextSeq = currentSeq + 1;
  const candidate = `ROLL-${year}-${String(nextSeq).padStart(4, '0')}`;
  return {
    nextRollNo: candidate,
    rollNumber: candidate,
    rollNo: candidate,
    year,
    nextSequence: nextSeq
  };
}

module.exports = {
  extractYear,
  generateAdmissionNumber,
  generateRollNumber,
  generateStudentCode,
  previewNextAdmissionNumber,
  previewNextRollNumber,
  checkAdmissionNoExists,
  checkRollNoExists
};
