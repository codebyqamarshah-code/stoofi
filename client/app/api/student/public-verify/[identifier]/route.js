import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { Student, Staff } from '@/lib/models';
import { createHmacSignature } from '@/lib/jwt-secret';

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { identifier } = await params;
    if (!identifier) {
      return NextResponse.json({ success: false, message: 'Identifier is required' }, { status: 400 });
    }

    const clean = decodeURIComponent(String(identifier).trim());
    let student = null;

    // 1. Direct MongoDB _id lookup (24 hex characters)
    if (mongoose.Types.ObjectId.isValid(clean) && clean.length === 24) {
      try {
        student = await Student.findById(clean).lean();
      } catch (_) {}
    }

    // 2. Exact match on admissionNo, rollNo, studentCode, cnic, phone
    if (!student) {
      student = await Student.findOne({
        $or: [
          { admissionNo: { $regex: '^' + escapeRegex(clean) + '$', $options: 'i' } },
          { rollNo: { $regex: '^' + escapeRegex(clean) + '$', $options: 'i' } },
          { studentCode: { $regex: '^' + escapeRegex(clean) + '$', $options: 'i' } },
          { cnic: clean.replace(/\D/g, '') },
          { phone: clean }
        ]
      }).lean();
    }

    // 3. Alphanumeric stripped match (e.g. "PRC-260052" -> "PRC260052" or "ADM-260052" -> "ADM260052")
    if (!student) {
      const stripped = clean.replace(/[^a-zA-Z0-9]/g, '');
      if (stripped && stripped !== clean) {
        student = await Student.findOne({
          $or: [
            { admissionNo: { $regex: '^' + escapeRegex(stripped) + '$', $options: 'i' } },
            { rollNo: { $regex: '^' + escapeRegex(stripped) + '$', $options: 'i' } }
          ]
        }).lean();
      }
    }

    // 4. Number match: extract number groups (e.g. "260052" from "ADM260052", "0052" from "ADM-2026-0052")
    if (!student) {
      const allNumMatches = clean.match(/\d+/g);
      if (allNumMatches && allNumMatches.length > 0) {
        const reversedGroups = [...allNumMatches].reverse();
        for (const rawDigits of reversedGroups) {
          const intVal = parseInt(rawDigits, 10);
          if (isNaN(intVal) || intVal === 0) continue;

          // Suffix match
          student = await Student.findOne({
            $or: [
              { admissionNo: { $regex: rawDigits + '$', $options: 'i' } },
              { rollNo: { $regex: rawDigits + '$', $options: 'i' } }
            ]
          }).lean();
          if (student) break;

          // Padded sequence variations for cards printed with short roll numbers (e.g. PRC0052 -> 52)
          if (intVal < 1000) {
            const padded3 = String(intVal).padStart(3, '0');
            const padded4 = String(intVal).padStart(4, '0');
            student = await Student.findOne({
              $or: [
                { rollNo: { $regex: padded4 + '$', $options: 'i' } },
                { admissionNo: { $regex: padded4 + '$', $options: 'i' } },
                { rollNo: { $regex: padded3 + '$', $options: 'i' } },
                { admissionNo: { $regex: padded3 + '$', $options: 'i' } }
              ]
            }).lean();
            if (student) break;
          }
        }
      }
    }

    // 5. If found as a student, return officially verified student details
    // PRIVACY ENFORCED: Sensitive PII (fatherName, CNIC, phone, address, fees, documents, mother details) are EXCLUDED
    if (student) {
      const fullName = student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Verified Student';
      
      // Cryptographically signed time-limited streaming photo URL (valid for 2 hours)
      const hasPhoto = Boolean(student.photo || student.studentPhoto);
      let securePhotoUrl = null;
      if (hasPhoto) {
        const exp = Math.floor(Date.now() / 1000) + 7200; // 2-hour validity
        const sig = createHmacSignature('student_photo', student._id, exp);
        securePhotoUrl = `/api/student/${student._id}/photo?sig=${sig}&exp=${exp}`;
      }

      return NextResponse.json({
        success: true,
        verified: true,
        college: 'Pak Royal College Sharaqpur',
        data: {
          _id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          name: fullName,
          admissionNo: student.admissionNo,
          rollNo: student.rollNo,
          className: student.className,
          section: student.section,
          academicYear: student.academicYear,
          photo: securePhotoUrl,
          status: student.status || 'Active',
          isStaff: false
        }
      });
    }

    // 6. Check Staff collection in case a staff ID card QR code was scanned
    let staff = null;
    if (mongoose.Types.ObjectId.isValid(clean) && clean.length === 24) {
      try {
        staff = await Staff.findById(clean).lean();
      } catch (_) {}
    }
    if (!staff) {
      staff = await Staff.findOne({
        $or: [
          { staffNo: { $regex: '^' + escapeRegex(clean) + '$', $options: 'i' } },
          { email: { $regex: '^' + escapeRegex(clean) + '$', $options: 'i' } },
          { phone: clean }
        ]
      }).lean();
    }

    if (staff) {
      const staffFullName = staff.name || `${staff.firstName || ''} ${staff.lastName || ''}`.trim() || 'Staff Member';
      
      // Cryptographically signed time-limited streaming staff photo URL (valid for 2 hours)
      const hasStaffPhoto = Boolean(staff.photo || staff.staffPhoto);
      let secureStaffPhotoUrl = null;
      if (hasStaffPhoto) {
        const exp = Math.floor(Date.now() / 1000) + 7200; // 2-hour validity
        const sig = createHmacSignature('staff_photo', staff._id, exp);
        secureStaffPhotoUrl = `/api/staff/${staff._id}/photo?sig=${sig}&exp=${exp}`;
      }

      return NextResponse.json({
        success: true,
        verified: true,
        college: 'Pak Royal College Sharaqpur',
        data: {
          _id: staff._id,
          firstName: staff.firstName,
          lastName: staff.lastName,
          name: staffFullName,
          admissionNo: staff.staffNo || 'STAFF',
          rollNo: staff.staffNo || 'STAFF',
          className: staff.designation || 'Staff',
          section: staff.department || '',
          designation: staff.designation,
          department: staff.department,
          academicYear: staff.joiningDate ? String(new Date(staff.joiningDate).getFullYear()) : 'Active',
          photo: secureStaffPhotoUrl,
          status: staff.status || 'Active',
          isStaff: true
        }
      });
    }

    // 7. If NO record matched, return 404. NEVER fall back to another student or arbitrary record!
    return NextResponse.json({
      success: false,
      verified: false,
      message: `No verified record found for scanned code: ${clean}`
    }, { status: 404 });

  } catch (error) {
    console.error('API /student/public-verify error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
