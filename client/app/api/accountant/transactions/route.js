import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { FeesInvoice, Expense, Payroll, BankPayment } from '@/lib/models';
import { authenticateRequest } from '@/lib/authGuard';

export async function GET(req) {
  try {
    const auth = await authenticateRequest(req, {
      allowedRoles: ['Accountant', 'Admin', 'Super Admin']
    });
    if (auth.error) return auth.error;

    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('search') || '').trim().toLowerCase();
    const type = searchParams.get('type') || 'ALL'; // 'ALL' | 'Student Fee' | 'Expense' | 'Salary'
    const method = searchParams.get('method') || 'ALL';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Fetch from all financial models
    const [invoices, expenses, payrolls, bankPayments] = await Promise.all([
      FeesInvoice.find().sort({ createdAt: -1 }).lean(),
      Expense.find().sort({ createdAt: -1 }).lean(),
      Payroll.find().sort({ createdAt: -1 }).lean(),
      BankPayment.find({ status: 'Approved' }).sort({ createdAt: -1 }).lean()
    ]);

    const transactions = [];

    // 1. Student Fee transactions (from invoices with paid amount)
    (invoices || []).forEach(inv => {
      const paid = Number(inv.paid || inv.paidAmount) || 0;
      if (paid > 0) {
        transactions.push({
          id: `TXN-FEE-${String(inv._id).slice(-8).toUpperCase()}`,
          rawId: inv._id,
          type: 'Student Fee',
          party: inv.student || inv.studentName || 'Student',
          detail: `${inv.className || ''} ${inv.section ? `(${inv.section})` : ''} - ${inv.feeType || 'Tuition Fee'}`.trim(),
          amount: paid,
          direction: 'INFLOW',
          paymentMethod: inv.paymentMethod || 'Cash',
          date: inv.date || inv.createdAt,
          referenceNo: inv.challanNo || inv.invoiceNo || 'REF-FEE',
          status: 'Completed',
          createdBy: 'Accounts Officer'
        });
      }
    });

    // 2. Bank Payments
    (bankPayments || []).forEach(bp => {
      transactions.push({
        id: `TXN-BNK-${String(bp._id).slice(-8).toUpperCase()}`,
        rawId: bp._id,
        type: 'Student Fee',
        party: bp.studentName || 'Student',
        detail: `Online Bank Transfer - ${bp.bankName || 'Bank'}`,
        amount: Number(bp.amount) || 0,
        direction: 'INFLOW',
        paymentMethod: 'Bank Transfer',
        date: bp.date || bp.createdAt,
        referenceNo: bp.transactionId || 'REF-BNK',
        status: bp.status || 'Approved',
        createdBy: 'Bank Portal'
      });
    });

    // 3. Expenses
    (expenses || []).forEach(exp => {
      transactions.push({
        id: `TXN-EXP-${String(exp._id).slice(-8).toUpperCase()}`,
        rawId: exp._id,
        type: 'Expense',
        party: exp.payeeName || exp.categoryName || 'Vendor',
        detail: exp.title || 'School Operational Expense',
        amount: Number(exp.amount) || 0,
        direction: 'OUTFLOW',
        paymentMethod: exp.paymentMethod || 'Cash',
        date: exp.date || exp.createdAt,
        referenceNo: exp.referenceNo || exp.invoiceNo || exp.voucherNo || 'EXP-REF',
        status: exp.status || 'Paid',
        createdBy: exp.createdByName || 'Accounts Officer'
      });
    });

    // 4. Payroll / Salaries
    (payrolls || []).forEach(p => {
      transactions.push({
        id: `TXN-SAL-${String(p._id).slice(-8).toUpperCase()}`,
        rawId: p._id,
        type: 'Salary',
        party: p.staffName || 'Staff Member',
        detail: `Salary for ${p.month || ''} ${p.year || ''} (${p.designation || 'Staff'})`.trim(),
        amount: Number(p.netSalary || p.basicSalary) || 0,
        direction: 'OUTFLOW',
        paymentMethod: p.paymentMethod || 'Bank Transfer',
        date: p.payDate || p.createdAt,
        referenceNo: `SAL-${p.staffNo || String(p._id).slice(-4)}`,
        status: p.status || 'Paid',
        createdBy: 'Payroll System'
      });
    });

    // Sort by date descending
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Filtering
    const filtered = transactions.filter(t => {
      if (type !== 'ALL' && t.type !== type) return false;
      if (method !== 'ALL' && t.paymentMethod.toLowerCase() !== method.toLowerCase()) return false;
      
      const tDate = new Date(t.date);
      if (startDate && tDate < new Date(startDate)) return false;
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (tDate > end) return false;
      }

      if (search) {
        const matchesParty = t.party.toLowerCase().includes(search);
        const matchesDetail = t.detail.toLowerCase().includes(search);
        const matchesId = t.id.toLowerCase().includes(search);
        const matchesRef = t.referenceNo.toLowerCase().includes(search);
        if (!matchesParty && !matchesDetail && !matchesId && !matchesRef) return false;
      }

      return true;
    });

    return NextResponse.json({
      success: true,
      totalCount: filtered.length,
      data: filtered
    });

  } catch (err) {
    console.error('Accountant transactions error:', err);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve transactions: ' + err.message },
      { status: 500 }
    );
  }
}
