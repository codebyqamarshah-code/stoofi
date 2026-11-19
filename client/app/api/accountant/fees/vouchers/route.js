import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { FeesInvoice, Student, FinancialAuditLog } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const className = searchParams.get('class');
    const billingMonth = searchParams.get('billingMonth');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const filter = {};
    if (className && className !== 'ALL' && className !== 'All') {
      filter.className = new RegExp(`^${className}$`, 'i');
    }
    if (billingMonth && billingMonth !== 'ALL' && billingMonth !== 'All') {
      filter.billingMonth = billingMonth;
    }
    if (status && status !== 'ALL' && status !== 'All') {
      filter.status = new RegExp(`^${status}$`, 'i');
    }
    if (search) {
      filter.$or = [
        { student: { $regex: search, $options: 'i' } },
        { admissionNo: { $regex: search, $options: 'i' } },
        { invoiceNo: { $regex: search, $options: 'i' } },
        { challanNo: { $regex: search, $options: 'i' } }
      ];
    }

    const vouchers = await FeesInvoice.find(filter).sort({ createdAt: -1 }).limit(200).lean();

    return NextResponse.json({
      success: true,
      data: vouchers
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      mode = 'single', // 'single' | 'class'
      studentId,
      studentName,
      admissionNo,
      className,
      section,
      feeType = 'Tuition Fee',
      dueDate,
      billingMonth,
      heads = [], // [{ head: 'Tuition', amount: 5000 }, ...]
      totalAmount = 0,
      createdBy = null
    } = body;

    const computedTotal = heads.length > 0
      ? heads.reduce((sum, h) => sum + (Number(h.amount) || 0), 0)
      : (Number(totalAmount) || 0);

    const now = new Date();
    const targetMonth = billingMonth || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const targetDueDate = dueDate ? new Date(dueDate) : new Date(now.getFullYear(), now.getMonth(), 15);

    const createdVouchers = [];

    if (mode === 'class') {
      // Find all students in class
      const query = { class: className };
      if (section && section !== 'ALL' && section !== 'All') {
        query.section = section;
      }
      const students = await Student.find(query).lean();

      if (students.length === 0) {
        return NextResponse.json({ success: false, message: `No active students found in Class ${className}` }, { status: 404 });
      }

      for (const st of students) {
        const challanNo = String(Math.floor(100000 + Math.random() * 900000));
        const stName = `${st.firstName || ''} ${st.lastName || ''}`.trim() || st.name || 'Student';
        const stRoll = st.rollNo || st.roll || '';
        const stAdmission = st.admissionNo || st.admissionNumber || st.rollNo || '';

        const existing = await FeesInvoice.findOne({
          admissionNo: stAdmission,
          billingMonth: targetMonth
        });

        if (!existing) {
          const inv = await FeesInvoice.create({
            invoiceNo: `CH-${challanNo}`,
            challanNo,
            billingMonth: targetMonth,
            dueDate: targetDueDate,
            studentId: st._id,
            student: stName,
            fatherName: st.fatherName || '',
            rollNo: stRoll,
            admissionNo: stAdmission,
            className: st.class || className,
            section: st.section || section || '',
            feeType,
            feeItems: heads,
            amount: computedTotal,
            waiver: 0,
            fine: 0,
            paid: 0,
            balance: computedTotal,
            status: 'Unpaid',
            paymentMethod: 'Cash',
            note: `Generated batch voucher for ${targetMonth}`
          });
          createdVouchers.push(inv);
        }
      }

      try {
        await FinancialAuditLog.create({
          action: 'BATCH_VOUCHERS_GENERATED',
          module: 'FEE',
          performedBy: createdBy || null,
          details: `Generated ${createdVouchers.length} fee vouchers for Class ${className} for month ${targetMonth}`,
          changes: { className, count: createdVouchers.length, billingMonth: targetMonth, totalPerStudent: computedTotal }
        });
      } catch (_) {}

      return NextResponse.json({
        success: true,
        message: `Successfully generated ${createdVouchers.length} vouchers for Class ${className}`,
        count: createdVouchers.length,
        vouchers: createdVouchers
      });
    } else {
      // Single student voucher
      const challanNo = String(Math.floor(100000 + Math.random() * 900000));
      const inv = await FeesInvoice.create({
        invoiceNo: `CH-${challanNo}`,
        challanNo,
        billingMonth: targetMonth,
        dueDate: targetDueDate,
        studentId: studentId || null,
        student: studentName || 'Student',
        admissionNo: admissionNo || '',
        className: className || '',
        section: section || '',
        feeType,
        feeItems: heads,
        amount: computedTotal,
        waiver: 0,
        fine: 0,
        paid: 0,
        balance: computedTotal,
        status: 'Unpaid',
        paymentMethod: 'Cash',
        note: `Voucher generated for ${targetMonth}`
      });

      return NextResponse.json({
        success: true,
        message: 'Fee voucher created successfully',
        voucher: inv
      });
    }
  } catch (error) {
    console.error('API /accountant/fees/vouchers POST error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
