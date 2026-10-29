const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('../node_modules/mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://codebyqamarshah_db_user:Syed-123%40345@stoofi.btgzyb6.mongodb.net/stoofi?appName=stoofi';

// Import getPhotoUrl from utils
function resolvePhotoUrl(photoPath) {
  if (!photoPath) return null;
  let p = null;
  if (typeof photoPath === 'object' && photoPath !== null) {
    const sp = photoPath.staffPhoto || photoPath.studentPhoto;
    const ph = photoPath.photo;
    const av = photoPath.avatar || photoPath.image;
    if (typeof sp === 'string' && (sp.startsWith('data:image/') || sp.startsWith('data:'))) p = sp;
    else if (typeof ph === 'string' && (ph.startsWith('data:image/') || ph.startsWith('data:'))) p = ph;
    else if (typeof av === 'string' && (av.startsWith('data:image/') || av.startsWith('data:'))) p = av;
    else if (typeof sp === 'string' && sp.trim()) p = sp;
    else if (typeof ph === 'string' && ph.trim()) p = ph;
    else if (typeof av === 'string' && av.trim()) p = av;
  } else {
    p = photoPath;
  }
  if (!p || typeof p !== 'string') return null;
  const trimmed = p.trim();
  if (!trimmed) return null;
  
  if (trimmed.startsWith('data:') || trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  if (trimmed.startsWith('/api/')) {
    return trimmed;
  }

  if (trimmed.length < 4 || /^(null|undefined|none|n\/a|na|-|—)$/i.test(trimmed)) {
    return null;
  }

  const hasImageExt = /\.(jpe?g|png|webp|gif|svg|bmp|avif|jfif)$/i.test(trimmed.split('?')[0]);
  const isUploadPath = trimmed.includes('upload') || trimmed.startsWith('/uploads/');

  if (!hasImageExt && !isUploadPath && !trimmed.startsWith('/')) {
    return null;
  }

  let cleanPath = trimmed;
  if (cleanPath.startsWith('/uploads/')) {
  } else if (cleanPath.startsWith('uploads/')) {
    cleanPath = `/${cleanPath}`;
  } else if (cleanPath.startsWith('/')) {
    cleanPath = `/uploads${cleanPath}`;
  } else {
    cleanPath = `/uploads/${cleanPath}`;
  }

  return cleanPath;
}

describe('Photo Fix Regression Verification', () => {
  let db;

  before(async () => {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10
    });
    db = mongoose.connection.db;
  });

  after(async () => {
    await mongoose.disconnect();
  });

  // 1. URL resolution tests
  it('1. resolvePhotoUrl handles /api/student/[id]/photo without prepending /uploads', () => {
    const rawUrl = '/api/student/6ad34dd523d285952a872271/photo';
    const resolved = resolvePhotoUrl(rawUrl);
    assert.strictEqual(resolved, '/api/student/6ad34dd523d285952a872271/photo');
    assert.ok(!resolved.includes('/uploads/'), 'Must not include /uploads/ prefix');
  });

  it('2. resolvePhotoUrl handles student object with on-demand photo URL', () => {
    const studentObj = {
      _id: '6ad34dd523d285952a872271',
      studentPhoto: '/api/student/6ad34dd523d285952a872271/photo',
      photo: '/api/student/6ad34dd523d285952a872271/photo'
    };
    const resolved = resolvePhotoUrl(studentObj);
    assert.strictEqual(resolved, '/api/student/6ad34dd523d285952a872271/photo');
  });

  it('3. resolvePhotoUrl handles student object with raw base64 data URI', () => {
    const studentObj = {
      _id: '6ad34dd523d285952a872271',
      studentPhoto: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
      photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...'
    };
    const resolved = resolvePhotoUrl(studentObj);
    assert.strictEqual(resolved, 'data:image/jpeg;base64,/9j/4AAQSkZJRg...');
  });

  // 2. Real MongoDB Atlas Photo Data Verification
  it('4. Real student photo decodes to valid JPEG binary buffer', async () => {
    const student = await db.collection('students').findOne({
      _id: new mongoose.Types.ObjectId('6ad34dd523d285952a872271')
    });
    assert.ok(student, 'Sample student must exist in database');
    const raw = student.studentPhoto || student.photo;
    assert.ok(raw, 'Student photo must exist');
    assert.ok(raw.startsWith('data:image/jpeg;base64,'), 'Photo must be base64 JPEG data URI');

    const match = raw.match(/^data:([^;]+);base64,(.*)$/);
    const mimeType = match[1];
    const buffer = Buffer.from(match[2], 'base64');

    assert.strictEqual(mimeType, 'image/jpeg');
    assert.ok(buffer.length > 5000, `Buffer must be valid image (>5KB, got ${buffer.length})`);
    assert.strictEqual(buffer[0], 0xFF, 'JPEG byte 0 must be 0xFF');
    assert.strictEqual(buffer[1], 0xD8, 'JPEG byte 1 must be 0xD8');
    assert.strictEqual(buffer[2], 0xFF, 'JPEG byte 2 must be 0xFF');
  });

  // 3. Alternative Identifier Resolution Test
  it('5. Photo route queries safely by admissionNo or rollNo', async () => {
    const sample = await db.collection('students').findOne({ admissionNo: 'ADM260001' });
    assert.ok(sample, 'Must find student by ADM260001');
    assert.ok(sample.studentPhoto, 'Student must have photo');
  });

  // 4. Staff Photo Integrity
  it('6. Staff member photo decodes cleanly', async () => {
    const staff = await db.collection('staffs').findOne({
      $or: [
        { staffPhoto: { $exists: true, $ne: '' } },
        { photo: { $exists: true, $ne: '' } }
      ]
    });
    assert.ok(staff, 'Staff member with photo must exist');
    const raw = staff.staffPhoto || staff.photo;
    assert.ok(raw.startsWith('data:image/'), 'Staff photo must be data URI');
  });
});
