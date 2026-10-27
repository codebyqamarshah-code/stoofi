import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Student, FeesInvoice } from '@/lib/models';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const cls = searchParams.get('class');
    const section = searchParams.get('section');
    const search = searchParams.get('search');

    const conditions = [];
    if (cls && cls.trim()) {
      const cleanCls = cls.replace(/^class\s+/i, '').trim();
      conditions.push({
        $or: [
          { className: new RegExp(`^${cls.trim()}$`, 'i') },
          { className: new RegExp(`^Class\\s*${cleanCls}$`, 'i') },
          { className: new RegExp(`^${cleanCls}$`, 'i') }
        ]
      });
    }

    if (section && section.trim()) {
      const cleanSec = section.replace(/^section\s+/i, '').trim();
      conditions.push({
        $or: [
          { section: new RegExp(`^${section.trim()}$`, 'i') },
          { section: new RegExp(`^Section\\s*${cleanSec}$`, 'i') },
          { section: new RegExp(`^${cleanSec}$`, 'i') }
        ]
      });
    }

    if (search && search.trim()) {
      const sReg = new RegExp(search.trim(), 'i');
      conditions.push({
        $or: [
          { firstName: sReg },
          { lastName: sReg },
          { admissionNo: sReg },
          { rollNo: sReg }
        ]
      });
    }

    const query = conditions.length > 0 ? { $and: conditions } : {};
    const students = await Student.find(query).select('-studentPhoto -photo').lean();

    students.sort((a, b) => {
      const rA = String(a.rollNo || '').trim();
      const rB = String(b.rollNo || '').trim();
      if (rA !== rB) return rA.localeCompare(rB, undefined, { numeric: true, sensitivity: 'base' });
      return String(a.admissionNo || '').localeCompare(String(b.admissionNo || ''), undefined, { numeric: true, sensitivity: 'base' });
    });

    const studentAdmissions = students.map(s => s.admissionNo).filter(Boolean);
    const unpaidInvoices = await FeesInvoice.find({
      admissionNo: { $in: studentAdmissions },
      status: { $in: ['Unpaid', 'Partial', 'UNPAID', 'PARTIAL'] }
    }).lean();

    const data = students.map(st => {
      const stuInvoices = unpaidInvoices.filter(inv => inv.admissionNo === st.admissionNo);
      const pendingBalance = stuInvoices.reduce((acc, inv) => acc + (Number(inv.balance) || 0), 0);
      const previousArrears = Number(st.carryForwardAmount) || 0;
      const totalDue = pendingBalance > 0 ? pendingBalance : previousArrears;

      return {
        _id: st._id,
        admissionNo: st.admissionNo,
        rollNo: st.rollNo || '—',
        studentName: `${st.firstName || ''} ${st.lastName || ''}`.trim() || 'Student',
        className: st.className,
        section: st.section,
        fatherName: st.fatherName || '—',
        previousBalance: totalDue,
        carryForwardAmount: totalDue,
        status: totalDue > 0 ? 'Pending Dues' : 'Cleared'
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API /fees/carry-forward GET error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch carry forward data' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const items = body.items;
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: 'No items provided' }, { status: 400 });
    }

    const updated = [];
    for (const item of items) {
      const amount = Number(item.carryForwardAmount) || 0;
      if (item.studentId) {
        await Student.findByIdAndUpdate(item.studentId, { carryForwardAmount: amount });
      }

      if (amount > 0 && item.admissionNo) {
        const invNo = `CF-${item.admissionNo}-${new Date().getFullYear()}`;
        await FeesInvoice.findOneAndUpdate(
          { invoiceNo: invNo },
          {
            student: item.studentName,
            admissionNo: item.admissionNo,
            className: item.className,
            feeType: 'Previous Session Arrears',
            amount: amount,
            waiver: 0,
            fine: 0,
            paid: 0,
            balance: amount,
            status: 'Unpaid',
            date: new Date(),
            note: 'Carried forward from previous academic session'
          },
          { upsert: true, new: true }
        );
      }
      updated.push(item);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully carried forward fees for ${updated.length} students`,
      data: updated
    });
  } catch (error) {
    console.error('API /fees/carry-forward POST error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to save carry forward' }, { status: 500 });
  }
}
