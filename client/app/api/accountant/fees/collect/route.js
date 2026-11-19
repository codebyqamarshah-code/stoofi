import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { FeesInvoice, FeePayment, FinancialAuditLog, Student } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      studentId,
      studentName,
      admissionNo,
      className,
      section,
      feeType = 'Tuition Fee',
      amount = 0,
      fine = 0,
      discount = 0,
      paidAmount = 0,
      paymentMethod = 'Cash',
      paymentDate = new Date(),
      transactionRef = '',
      remarks = '',
      invoiceId = null,
      collectedBy = null
    } = body;

    const numAmount = Number(amount) || 0;
    const numFine = Number(fine) || 0;
    const numDiscount = Number(discount) || 0;
    const numPaid = Number(paidAmount) || 0;

    if (numPaid <= 0) {
      return NextResponse.json({ success: false, message: 'Paid amount must be greater than 0' }, { status: 400 });
    }

    const netPayable = Math.max(0, (numAmount + numFine) - numDiscount);
    const receiptNo = `REC-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const now = new Date(paymentDate);
    const billingMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // 1. Create FeePayment record
    const feePayment = await FeePayment.create({
      student: studentId || null,
      studentName: studentName || 'Student',
      amount: numAmount,
      fine: numFine,
      discount: numDiscount,
      netAmount: numPaid,
      paymentMethod: paymentMethod || 'Cash',
      date: now,
      note: `${remarks ? remarks + ' | ' : ''}Ref: ${transactionRef || 'N/A'} | Receipt: ${receiptNo}`,
      collectedBy: collectedBy || null
    });

    // 2. Update or Create FeesInvoice
    let targetInvoice = null;
    if (invoiceId) {
      targetInvoice = await FeesInvoice.findById(invoiceId);
    } else if (admissionNo) {
      targetInvoice = await FeesInvoice.findOne({
        admissionNo,
        billingMonth
      });
    }

    let updatedInvoice;
    if (targetInvoice) {
      const currentPaid = Number(targetInvoice.paid) || 0;
      const newPaid = currentPaid + numPaid;
      const totalAmount = Number(targetInvoice.amount) || numAmount;
      const currentFine = Number(targetInvoice.fine) || numFine;
      const currentDiscount = Number(targetInvoice.waiver || targetInvoice.discount) || numDiscount;
      const effectiveTotal = Math.max(0, (totalAmount + currentFine) - currentDiscount);
      const remainingBalance = Math.max(0, effectiveTotal - newPaid);

      targetInvoice.paid = newPaid;
      targetInvoice.balance = remainingBalance;
      targetInvoice.status = remainingBalance <= 0 ? 'Paid' : (newPaid > 0 ? 'Partial' : 'Unpaid');
      targetInvoice.paymentMethod = paymentMethod;
      targetInvoice.note = `${targetInvoice.note ? targetInvoice.note + '; ' : ''}Paid Rs. ${numPaid} on ${now.toISOString().slice(0, 10)} (${paymentMethod})`;
      updatedInvoice = await targetInvoice.save();
    } else {
      const remainingBalance = Math.max(0, netPayable - numPaid);
      updatedInvoice = await FeesInvoice.create({
        invoiceNo: `INV-${Date.now().toString().slice(-5)}`,
        challanNo: String(Math.floor(10000 + Math.random() * 90000)),
        billingMonth,
        dueDate: new Date(now.getFullYear(), now.getMonth(), 15),
        studentId: studentId || null,
        student: studentName,
        admissionNo,
        className,
        section,
        feeType,
        amount: numAmount,
        fine: numFine,
        waiver: numDiscount,
        paid: numPaid,
        balance: remainingBalance,
        status: remainingBalance <= 0 ? 'Paid' : (numPaid > 0 ? 'Partial' : 'Unpaid'),
        paymentMethod,
        note: `Payment recorded via Accountant Portal: ${remarks || 'Collected'}`
      });
    }

    // 3. Create Financial Audit Log
    try {
      await FinancialAuditLog.create({
        action: 'FEE_COLLECTION',
        module: 'FEE',
        performedBy: collectedBy || null,
        referenceId: feePayment._id.toString(),
        amount: numPaid,
        details: `Collected Rs. ${numPaid} for student ${studentName} (${admissionNo || 'N/A'}) via ${paymentMethod}`,
        changes: {
          receiptNo,
          invoiceId: updatedInvoice._id.toString(),
          feeType,
          paymentMethod,
          previousBalance: (targetInvoice ? targetInvoice.balance + numPaid : netPayable),
          remainingBalance: updatedInvoice.balance
        }
      });
    } catch (auditErr) {
      console.warn('Audit log creation error (non-fatal):', auditErr.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Fee payment collected successfully',
      receipt: {
        receiptNo,
        paymentId: feePayment._id,
        invoiceId: updatedInvoice._id,
        studentName,
        admissionNo,
        className,
        section,
        feeType,
        amount: numAmount,
        fine: numFine,
        discount: numDiscount,
        netPayable,
        paidAmount: numPaid,
        remainingBalance: updatedInvoice.balance,
        paymentMethod,
        paymentDate: now,
        transactionRef,
        remarks,
        status: updatedInvoice.status
      }
    });
  } catch (error) {
    console.error('API /accountant/fees/collect error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Fee collection failed' }, { status: 500 });
  }
}
