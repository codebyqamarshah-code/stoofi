import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { FeeDiscount, Student, FinancialAuditLog } from '@/lib/models';
import { authenticateRequest } from '@/lib/authGuard';

// Accountant default auto-approval limit (e.g., Rs. 5,000). Exceeding this requires Admin approval.
const ACCOUNTANT_DISCOUNT_LIMIT = 5000;

export async function GET(req) {
  try {
    const auth = await authenticateRequest(req, {
      allowedRoles: ['Accountant', 'Admin', 'Super Admin']
    });
    if (auth.error) return auth.error;

    await connectDB();
    const discounts = await FeeDiscount.find().sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      data: discounts
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await authenticateRequest(req, {
      allowedRoles: ['Accountant', 'Admin', 'Super Admin']
    });
    if (auth.error) return auth.error;

    await connectDB();
    const body = await req.json();
    const { studentId, originalFee, discountAmount, reason } = body;

    if (!studentId || !discountAmount || Number(discountAmount) <= 0) {
      return NextResponse.json(
        { success: false, message: 'Valid student ID and discount amount are required.' },
        { status: 400 }
      );
    }

    const student = await Student.findById(studentId).lean();
    if (!student) {
      return NextResponse.json({ success: false, message: 'Student not found.' }, { status: 404 });
    }

    const discNum = Number(discountAmount);
    const origNum = Number(originalFee || 8000);
    const finalFee = Math.max(0, origNum - discNum);

    const isAccountant = auth.user.role === 'Accountant';
    // If Accountant and discount exceeds limit, requires Admin approval
    const status = isAccountant && discNum > ACCOUNTANT_DISCOUNT_LIMIT ? 'Pending' : 'Approved';

    const discountRecord = await FeeDiscount.create({
      studentId: student._id,
      studentName: `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.studentName || 'Student',
      admissionNo: student.admissionNo || '',
      className: student.className || '',
      section: student.section || '',
      originalFee: origNum,
      discountAmount: discNum,
      finalFee,
      reason: reason || 'Merit / Financial Need Discount',
      status,
      createdBy: auth.user._id,
      createdByName: auth.user.fullName || auth.user.username || 'Accountant',
      approvedBy: status === 'Approved' ? auth.user._id : null,
      approvedByName: status === 'Approved' ? (auth.user.fullName || 'Authorized') : null
    });

    // Create Audit Log
    await FinancialAuditLog.create({
      action: 'DISCOUNT_APPLIED',
      module: 'FEES',
      performedBy: auth.user._id,
      performedByName: auth.user.fullName || auth.user.username,
      performedByRole: auth.user.role,
      studentId: student._id,
      amount: discNum,
      referenceId: discountRecord._id.toString(),
      notes: `Discount of Rs. ${discNum} ${status === 'Pending' ? 'submitted for Admin approval' : 'applied'}. Reason: ${reason}`
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: status === 'Pending' 
        ? `Discount exceeds Accountant limit (Rs. ${ACCOUNTANT_DISCOUNT_LIMIT.toLocaleString()}). Submitted to Admin for approval.`
        : 'Fee discount granted successfully.',
      data: discountRecord
    }, { status: 201 });

  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
