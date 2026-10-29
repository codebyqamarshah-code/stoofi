const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const dns = require('dns');
const mongoose = require('../node_modules/mongoose');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (_) {}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://codebyqamarshah_db_user:Syed-123%40345@stoofi.btgzyb6.mongodb.net/stoofi?appName=stoofi';

describe('STOOFI Production Stability & Real Workflow Verification', () => {
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

  // 1. Connection & Data Integrity
  it('1. Live MongoDB Atlas Connection & Pooling', async () => {
    assert.strictEqual(mongoose.connection.readyState, 1, 'MongoDB connection must be readyState 1 (connected)');
    assert.strictEqual(mongoose.connection.name, 'stoofi', 'Database name must be stoofi');
  });

  it('2. Existing 99 Students Preserved with Intact Identifiers', async () => {
    const studentCount = await db.collection('students').countDocuments();
    assert.strictEqual(studentCount, 99, `Expected exactly 99 students, got ${studentCount}`);

    // Verify first student record has valid persisted admission number & roll number
    const sampleStudent = await db.collection('students').findOne({ admissionNo: /^ADM/i });
    assert.ok(sampleStudent, 'Must find persisted student with ADM prefix');
    assert.ok(sampleStudent.firstName || sampleStudent.studentName, 'Student must have name');
    assert.ok(sampleStudent.admissionNo, 'Student must have admissionNo');
    assert.ok(sampleStudent.rollNo, 'Student must have rollNo');
    assert.ok(sampleStudent.className, 'Student must have className');
  });

  it('3. Staff & User Accounts Preserved with Role Integrity', async () => {
    const staffCount = await db.collection('staffs').countDocuments();
    assert.strictEqual(staffCount, 3, `Expected 3 staff members, got ${staffCount}`);

    const users = await db.collection('users').find({}).toArray();
    assert.ok(users.length >= 7, 'Must have at least 7 registered users');

    const superAdmin = users.find(u => u.role === 'Super Admin' || u.email?.toLowerCase().includes('admin'));
    assert.ok(superAdmin, 'Super Admin user must exist in database');

    const collegeUser = users.find(u => u.email?.toLowerCase() === 'pakroyalcollege@gmail.com');
    if (collegeUser) {
      assert.ok(collegeUser, 'Pak Royal College account exists');
    }
  });

  // 2. Class & Section Filter Verification
  it('4. Class & Section Filtering Integrity', async () => {
    const classes = await db.collection('classes').find({}).toArray();
    assert.ok(classes.length > 0, 'Classes must exist in database');

    // Test query with class name and projected fields
    const fscStudents = await db.collection('students').find(
      { className: { $regex: 'FSC', $options: 'i' } },
      { projection: { _id: 1, admissionNo: 1, className: 1, section: 1 } }
    ).toArray();
    assert.ok(fscStudents.length > 0, 'Must retrieve students for FSC class');

    // Test section filter
    const sectionStudents = await db.collection('students').find(
      { section: { $regex: '^A$', $options: 'i' } },
      { projection: { _id: 1, admissionNo: 1, className: 1, section: 1 } }
    ).toArray();
    assert.ok(sectionStudents.length > 0, 'Must retrieve section A students');
  });

  // 3. Homework & Real DB Persistence
  it('5. Real Homework Persistence in MongoDB Atlas', async () => {
    const homeworkCount = await db.collection('homeworks').countDocuments();
    assert.ok(homeworkCount >= 2, `Homework records in Atlas must be accessible (found ${homeworkCount})`);
    
    const sample = await db.collection('homeworks').findOne({});
    assert.ok(sample.className, 'Homework must have className');
    assert.ok(sample.subject, 'Homework must have subject');
    assert.ok(sample.description, 'Homework must have description');
  });

  // 4. Behaviour Incidents & Real DB Persistence
  it('6. Real Behaviour Incidents in MongoDB Atlas', async () => {
    const incidentCount = await db.collection('behaviourincidents').countDocuments();
    assert.ok(incidentCount >= 9, `Behaviour incidents in Atlas must be accessible (found ${incidentCount})`);

    const sample = await db.collection('behaviourincidents').findOne({});
    assert.ok(sample.title, 'Incident must have title');
    assert.strictEqual(typeof sample.point, 'number', 'Point must be numeric');
  });

  // 5. ID Cards & Certificates Preserved
  it('7. ID Cards & Certificates Data Preserved', async () => {
    const idCardCount = await db.collection('idcards').countDocuments();
    assert.ok(idCardCount >= 8, `ID card records preserved (found ${idCardCount})`);

    const certCount = await db.collection('certificates').countDocuments();
    assert.ok(certCount >= 6, `Certificate records preserved (found ${certCount})`);
  });

  // 6. Fees Invoices & Bank Payments
  it('8. Fees Invoices & Bank Payments In MongoDB Atlas', async () => {
    const invoiceCount = await db.collection('feesinvoices').countDocuments();
    assert.ok(invoiceCount >= 4, `Fees invoices preserved (found ${invoiceCount})`);

    const bankPaymentCount = await db.collection('bankpayments').countDocuments();
    assert.ok(bankPaymentCount >= 1, `Bank payments preserved (found ${bankPaymentCount})`);
  });

  // 7. Compact Projection & Payload Efficiency
  it('9. Compact Student Projection Prevents Payload Bloat', async () => {
    const t0 = Date.now();
    // Compact query projects metadata, names, contacts, class/section without multi-megabyte base64 photos
    const compactDocs = await db.collection('students').find(
      {},
      {
        projection: {
          _id: 1, admissionNo: 1, rollNo: 1, studentName: 1, name: 1,
          fullName: 1, firstName: 1, lastName: 1, className: 1, section: 1,
          fatherName: 1, status: 1, phone: 1, gender: 1
        }
      }
    ).limit(100).toArray();

    const elapsed = Date.now() - t0;
    const jsonBytes = Buffer.byteLength(JSON.stringify(compactDocs));
    
    assert.ok(elapsed < 2000, `Compact query must execute in < 2000ms (took ${elapsed}ms)`);
    assert.ok(jsonBytes < 50000, `Compact payload must be < 50KB (got ${Math.round(jsonBytes / 1024)} KB)`);
  });
});
