import { AdmissionCounter, Student, StudentEnrollment } from '@/lib/models';

export function extractYear(val) {
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

export async function findHighestExistingAdmissionSeq(year) {
  const yStr = String(year);
  const y2 = yStr.slice(-2);
  let maxSeq = 0;

  try {
    const regex = new RegExp(`ADM[-_]?(?:${yStr}|${y2})[-_]?(\\d+)`, 'i');
    const enrollments = await StudentEnrollment.find(
      { admissionYear: year },
      'admissionNumber'
    ).lean();
    for (const e of enrollments) {
      if (!e.admissionNumber) continue;
      const m = String(e.admissionNumber).match(regex);
      if (m && m[1]) {
        const n = parseInt(m[1], 10);
        if (!isNaN(n) && n < 100000 && n > maxSeq) maxSeq = n;
      }
    }
  } catch (_) {}

  try {
    const regex = new RegExp(`ADM[-_]?(?:${yStr}|${y2})[-_]?(\\d+)`, 'i');
    const students = await Student.find(
      { admissionNo: { $regex: regex } },
      'admissionNo'
    ).lean();

    for (const s of students) {
      if (!s.admissionNo) continue;
      const m = String(s.admissionNo).match(regex);
      if (m && m[1]) {
        const n = parseInt(m[1], 10);
        if (!isNaN(n) && n < 100000 && n > maxSeq) maxSeq = n;
      }
    }
  } catch (_) {}

  return maxSeq;
}

export async function findHighestExistingRollSeq(year) {
  const yStr = String(year);
  const y2 = yStr.slice(-2);
  let maxSeq = 0;

  try {
    const regex = new RegExp(`(?:ROLL|PRC)[-_]?(?:${yStr}|${y2})[-_]?(\\d+)`, 'i');
    const enrollments = await StudentEnrollment.find(
      { admissionYear: year },
      'rollNumber'
    ).lean();
    for (const e of enrollments) {
      if (!e.rollNumber) continue;
      const m = String(e.rollNumber).match(regex);
      if (m && m[1]) {
        const n = parseInt(m[1], 10);
        if (!isNaN(n) && n < 100000 && n > maxSeq) maxSeq = n;
      }
    }
  } catch (_) {}

  try {
    const regex = new RegExp(`(?:ROLL|PRC)[-_]?(?:${yStr}|${y2})[-_]?(\\d+)`, 'i');
    const students = await Student.find(
      { rollNo: { $regex: regex } },
      'rollNo'
    ).lean();

    for (const s of students) {
      if (!s.rollNo) continue;
      const m = String(s.rollNo).match(regex);
      if (m && m[1]) {
        const n = parseInt(m[1], 10);
        if (!isNaN(n) && n < 100000 && n > maxSeq) maxSeq = n;
      }
    }
  } catch (_) {}

  return maxSeq;
}

export async function generateAdmissionNumber(yearInput) {
  const year = extractYear(yearInput);
  const key = `adm-${year}`;

  const highestExisting = await findHighestExistingAdmissionSeq(year);

  let counter = await AdmissionCounter.findOne({ key });
  if (!counter) {
    try {
      counter = await AdmissionCounter.create({
        key,
        type: 'admission',
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
    { $inc: { sequence: 1 }, $setOnInsert: { type: 'admission', year, scope: 'institution' } },
    { new: true, upsert: true }
  );

  const y2 = String(year).slice(-2);
  let seq = updatedCounter.sequence;
  let candidate = `ADM${y2}${String(seq).padStart(4, '0')}`;

  let isDuplicate = await checkAdmissionNoExists(candidate);
  while (isDuplicate) {
    updatedCounter = await AdmissionCounter.findOneAndUpdate(
      { key },
      { $inc: { sequence: 1 } },
      { new: true }
    );
    seq = updatedCounter.sequence;
    candidate = `ADM${y2}${String(seq).padStart(4, '0')}`;
    isDuplicate = await checkAdmissionNoExists(candidate);
  }

  return {
    admissionNumber: candidate,
    admissionNo: candidate,
    year,
    sequence: seq
  };
}

export async function generateRollNumber(yearInput) {
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

  const y2 = String(year).slice(-2);
  let seq = updatedCounter.sequence;
  let candidate = `PRC${y2}${String(seq).padStart(4, '0')}`;

  let isDuplicate = await checkRollNoExists(candidate);
  while (isDuplicate) {
    updatedCounter = await AdmissionCounter.findOneAndUpdate(
      { key },
      { $inc: { sequence: 1 } },
      { returnDocument: 'after' }
    );
    seq = updatedCounter.sequence;
    candidate = `PRC${y2}${String(seq).padStart(4, '0')}`;
    isDuplicate = await checkRollNoExists(candidate);
  }

  return {
    rollNumber: candidate,
    rollNo: candidate,
    year,
    sequence: seq
  };
}

export async function generateStudentCode(yearInput) {
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

export async function checkAdmissionNoExists(admissionNo) {
  const [s, e] = await Promise.all([
    Student.findOne({ admissionNo }).select('_id').lean(),
    StudentEnrollment.findOne({ admissionNumber: admissionNo }).select('_id').lean()
  ]);
  return !!(s || e);
}

export async function checkRollNoExists(rollNo) {
  const [s, e] = await Promise.all([
    Student.findOne({ rollNo }).select('_id').lean(),
    StudentEnrollment.findOne({ rollNumber: rollNo }).select('_id').lean()
  ]);
  return !!(s || e);
}

export async function previewNextAdmissionNumber(yearInput) {
  const year = extractYear(yearInput);
  const y2 = String(year).slice(-2);
  const key = `adm-${year}`;
  const highestExisting = await findHighestExistingAdmissionSeq(year);
  const counter = await AdmissionCounter.findOne({ key }).lean();
  const currentSeq = Math.max(highestExisting, counter?.sequence || 0);
  const nextSeq = currentSeq + 1;
  const candidate = `ADM${y2}${String(nextSeq).padStart(4, '0')}`;
  return {
    nextAdmissionNo: candidate,
    admissionNumber: candidate,
    admissionNo: candidate,
    year,
    nextSequence: nextSeq
  };
}

export async function previewNextRollNumber(yearInput) {
  const year = extractYear(yearInput);
  const y2 = String(year).slice(-2);
  const key = `roll-${year}`;
  const highestExisting = await findHighestExistingRollSeq(year);
  const counter = await AdmissionCounter.findOne({ key }).lean();
  const currentSeq = Math.max(highestExisting, counter?.sequence || 0);
  const nextSeq = currentSeq + 1;
  const candidate = `PRC${y2}${String(nextSeq).padStart(4, '0')}`;
  return {
    nextRollNo: candidate,
    rollNumber: candidate,
    rollNo: candidate,
    year,
    nextSequence: nextSeq
  };
}
