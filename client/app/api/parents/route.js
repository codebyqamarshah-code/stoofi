import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Student } from '@/lib/models';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('search') || '').trim().toLowerCase();
    const classFilter = (searchParams.get('class') || '').trim();

    // Safe, compact projection of student parent info
    const students = await Student.find({}, {
      studentName: 1,
      name: 1,
      firstName: 1,
      lastName: 1,
      admissionNo: 1,
      rollNo: 1,
      className: 1,
      section: 1,
      status: 1,
      fatherName: 1,
      fatherPhone: 1,
      fatherCnic: 1,
      fatherOccupation: 1,
      'father.name': 1,
      'father.phone': 1,
      'father.cnic': 1,
      'father.occupation': 1,
      motherName: 1,
      motherPhone: 1,
      motherOccupation: 1,
      guardianName: 1,
      guardianPhone: 1,
      guardianCnic: 1,
      guardianRelation: 1,
      guardianOccupation: 1,
      address: 1,
      currentAddress: 1,
      permanentAddress: 1,
      city: 1,
      phone: 1
    }).sort({ admissionNo: 1 }).lean();

    const parentsMap = new Map();

    students.forEach((s) => {
      const fName = s.fatherName || s.father?.name || '';
      const gName = s.guardianName || '';
      const mName = s.motherName || '';
      const parentName = (fName || gName || mName || 'Parent of ' + (s.studentName || s.admissionNo)).trim();
      const phone = (s.fatherPhone || s.father?.phone || s.guardianPhone || s.phone || '').trim();
      const cnic = (s.fatherCnic || s.father?.cnic || s.guardianCnic || '').trim();
      const occupation = s.fatherOccupation || s.father?.occupation || s.guardianOccupation || '—';
      const address = (s.currentAddress || s.address || s.permanentAddress || s.city || '').trim();
      const relation = s.guardianRelation || (fName ? 'Father' : (gName ? 'Guardian' : (mName ? 'Mother' : 'Parent')));

      // Unique parent grouping key: CNIC (if valid) or Phone (if valid) or Name + City
      const key = (cnic || phone || (parentName.toLowerCase() + '-' + (s.city || ''))).toLowerCase();

      const child = {
        studentId: String(s._id),
        studentName: (s.studentName || s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim() || `Student ${s.admissionNo}`).trim(),
        admissionNo: s.admissionNo || '—',
        rollNo: s.rollNo || '—',
        className: s.className || 'General',
        section: s.section || 'A',
        status: s.status || 'Active'
      };

      if (!parentsMap.has(key)) {
        parentsMap.set(key, {
          id: `PRNT-${String(parentsMap.size + 1).padStart(3, '0')}`,
          parentName,
          fatherName: fName,
          motherName: mName,
          guardianName: gName,
          relation,
          phone,
          cnic: cnic || '—',
          occupation,
          address: address || '—',
          city: s.city || '—',
          children: [child]
        });
      } else {
        const existing = parentsMap.get(key);
        // Avoid duplicate children entries
        if (!existing.children.some(c => c.studentId === child.studentId)) {
          existing.children.push(child);
        }
      }
    });

    let parentList = Array.from(parentsMap.values());

    // Filter by Class if requested
    if (classFilter && classFilter !== 'ALL') {
      parentList = parentList.filter(p => 
        p.children.some(c => c.className.toLowerCase() === classFilter.toLowerCase())
      );
    }

    // Filter by Search query
    if (search) {
      parentList = parentList.filter(p => {
        const matchesParent = 
          p.parentName.toLowerCase().includes(search) ||
          p.phone.toLowerCase().includes(search) ||
          p.cnic.toLowerCase().includes(search) ||
          p.occupation.toLowerCase().includes(search) ||
          p.address.toLowerCase().includes(search) ||
          p.fatherName.toLowerCase().includes(search) ||
          p.motherName.toLowerCase().includes(search);

        const matchesChild = p.children.some(c =>
          c.studentName.toLowerCase().includes(search) ||
          c.admissionNo.toLowerCase().includes(search) ||
          c.rollNo.toLowerCase().includes(search) ||
          c.className.toLowerCase().includes(search)
        );

        return matchesParent || matchesChild;
      });
    }

    // Collect distinct classes for filter dropdown
    const classSet = new Set();
    students.forEach(s => {
      if (s.className) classSet.add(s.className);
    });

    return NextResponse.json({
      success: true,
      totalParents: parentsMap.size,
      matchedCount: parentList.length,
      classes: Array.from(classSet).sort(),
      data: parentList
    });
  } catch (error) {
    console.error('Error fetching parents:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
