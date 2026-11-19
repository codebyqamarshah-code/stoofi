import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { FeesInvoice, BankPayment, FeePayment, Expense, Payroll, Student, Staff } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'daily';
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const monthParam = searchParams.get('month'); // e.g. "2026-11"
    const yearParam = searchParams.get('year') || String(new Date().getFullYear());

    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    if (type === 'daily') {
      const targetDate = startDateParam ? new Date(startDateParam) : now;
      startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
      endDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);
    } else if (type === 'weekly') {
      const d = startDateParam ? new Date(startDateParam) : now;
      const day = d.getDay();
      const diffToMon = d.getDate() - day + (day === 0 ? -6 : 1);
      startDate = new Date(d.getFullYear(), d.getMonth(), diffToMon, 0, 0, 0, 0);
      endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
      endDate.setHours(23, 59, 59, 999);
    } else if (type === 'monthly') {
      let targetYear = now.getFullYear();
      let targetMonth = now.getMonth();
      if (monthParam) {
        const parts = monthParam.split('-');
        if (parts.length === 2) {
          targetYear = parseInt(parts[0], 10);
          targetMonth = parseInt(parts[1], 10) - 1;
        }
      }
      startDate = new Date(targetYear, targetMonth, 1, 0, 0, 0, 0);
      endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);
    } else if (type === 'annual') {
      const y = parseInt(yearParam, 10) || now.getFullYear();
      startDate = new Date(y, 0, 1, 0, 0, 0, 0);
      endDate = new Date(y, 11, 31, 23, 59, 59, 999);
    } else if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    // Parallel fetch from all financial models
    const [
      invoices,
      bankPayments,
      feePayments,
      expenses,
      payrolls,
      students,
      staffMembers
    ] = await Promise.all([
      FeesInvoice.find().sort({ createdAt: -1 }).lean(),
      BankPayment.find().sort({ createdAt: -1 }).lean(),
      FeePayment.find().sort({ createdAt: -1 }).lean(),
      Expense.find().sort({ createdAt: -1 }).lean(),
      Payroll.find().sort({ createdAt: -1 }).lean(),
      Student.find().select('name firstName lastName rollNo admissionNo class section fee').lean(),
      Staff.find().select('name employeeId designation department basicSalary').lean()
    ]);

    // Build unified collection list in date range
    const collectionsInRange = [];
    let totalFeeCollection = 0;

    feePayments.forEach(fp => {
      const d = new Date(fp.date || fp.createdAt);
      if (d >= startDate && d <= endDate) {
        const amt = Number(fp.netAmount ?? fp.amount) || 0;
        totalFeeCollection += amt;
        collectionsInRange.push({
          id: fp._id.toString(),
          type: 'Fee Payment',
          reference: fp.note || 'Cash Desk',
          name: fp.studentName,
          amount: amt,
          method: fp.paymentMethod || 'Cash',
          date: d,
          status: 'Paid'
        });
      }
    });

    bankPayments.forEach(bp => {
      if (bp.status === 'Approved') {
        const d = new Date(bp.date || bp.createdAt);
        if (d >= startDate && d <= endDate) {
          const amt = Number(bp.amount) || 0;
          totalFeeCollection += amt;
          collectionsInRange.push({
            id: bp._id.toString(),
            type: 'Bank Payment',
            reference: bp.transactionId || bp.bankName || 'Bank',
            name: bp.studentName,
            amount: amt,
            method: bp.bankName || 'Bank Transfer',
            date: d,
            status: 'Approved'
          });
        }
      }
    });

    // Expenses in range
    const expensesInRange = [];
    let totalExpenses = 0;
    const categoryTotals = {};

    expenses.forEach(e => {
      const d = new Date(e.date || e.createdAt);
      if (d >= startDate && d <= endDate) {
        const amt = Number(e.amount) || 0;
        totalExpenses += amt;
        const cat = e.category || 'General';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
        expensesInRange.push({
          id: e._id.toString(),
          title: e.title || e.name || 'Expense',
          category: cat,
          vendor: e.vendor || e.recipient || 'N/A',
          amount: amt,
          method: e.paymentMethod || 'Cash',
          invoiceNo: e.invoiceNo || 'N/A',
          date: d
        });
      }
    });

    // Salaries in range
    const salariesInRange = [];
    let totalSalaryPaid = 0;
    payrolls.forEach(p => {
      const d = new Date(p.paymentDate || p.createdAt);
      if (d >= startDate && d <= endDate) {
        const amt = Number(p.netSalary ?? p.amount) || 0;
        totalSalaryPaid += amt;
        salariesInRange.push({
          id: p._id.toString(),
          employeeId: p.staffId || p.employeeId || 'N/A',
          name: p.staffName || p.name || 'Staff Member',
          month: p.month || 'Current',
          year: p.year || yearParam,
          amount: amt,
          method: p.paymentMethod || 'Cash',
          date: d,
          status: p.status || 'Paid'
        });
      }
    });

    // Outstanding fees
    const outstandingList = [];
    let totalOutstanding = 0;
    invoices.forEach(inv => {
      const bal = Number(inv.balance) || 0;
      if (bal > 0 && inv.status !== 'Paid') {
        totalOutstanding += bal;
        outstandingList.push({
          id: inv._id.toString(),
          invoiceNo: inv.invoiceNo || inv.challanNo,
          studentName: inv.student,
          admissionNo: inv.admissionNo,
          className: inv.className,
          section: inv.section,
          totalAmount: Number(inv.amount) || 0,
          paidAmount: Number(inv.paid) || 0,
          balance: bal,
          dueDate: inv.dueDate,
          isOverdue: inv.dueDate ? new Date(inv.dueDate) < now : false,
          status: inv.status
        });
      }
    });

    const netIncome = totalFeeCollection - (totalExpenses + totalSalaryPaid);

    return NextResponse.json({
      success: true,
      reportType: type,
      period: {
        startDate,
        endDate,
        year: yearParam,
        month: monthParam
      },
      summary: {
        totalFeeCollection,
        totalExpenses,
        totalSalaryPaid,
        totalOutflow: totalExpenses + totalSalaryPaid,
        netIncome,
        totalOutstanding,
        collectionsCount: collectionsInRange.length,
        expensesCount: expensesInRange.length,
        salariesCount: salariesInRange.length,
        outstandingCount: outstandingList.length
      },
      collections: collectionsInRange,
      expenses: expensesInRange,
      salaries: salariesInRange,
      outstanding: outstandingList,
      categoryBreakdown: Object.entries(categoryTotals).map(([name, value]) => ({ name, value }))
    });
  } catch (error) {
    console.error('API /accountant/reports error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
