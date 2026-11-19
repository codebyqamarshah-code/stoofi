import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { 
  FeesInvoice, 
  BankPayment, 
  Expense, 
  Payroll, 
  Student, 
  Staff, 
  FinancialAuditLog 
} from '@/lib/models';
import { authenticateRequest } from '@/lib/authGuard';

export async function GET(req) {
  try {
    const auth = await authenticateRequest(req, {
      allowedRoles: ['Accountant', 'Admin', 'Super Admin']
    });
    if (auth.error) return auth.error;

    await connectDB();
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || 'month'; // 'today' | 'week' | 'month' | 'year' | 'custom'
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    const now = new Date();
    let filterStart = new Date();
    let filterEnd = new Date();

    if (range === 'today') {
      filterStart.setHours(0, 0, 0, 0);
      filterEnd.setHours(23, 59, 59, 999);
    } else if (range === 'week') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
      filterStart = new Date(now.setDate(diff));
      filterStart.setHours(0, 0, 0, 0);
      filterEnd = new Date();
      filterEnd.setHours(23, 59, 59, 999);
    } else if (range === 'year') {
      filterStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      filterEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else if (range === 'custom' && startDateParam && endDateParam) {
      filterStart = new Date(startDateParam);
      filterStart.setHours(0, 0, 0, 0);
      filterEnd = new Date(endDateParam);
      filterEnd.setHours(23, 59, 59, 999);
    } else {
      // Default: This Month
      filterStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      filterEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    // Parallel fetch real financial documents from MongoDB
    const [
      allInvoices,
      allBankPayments,
      allExpenses,
      allPayrolls,
      studentsCount,
      staffCount,
      recentAudits
    ] = await Promise.all([
      FeesInvoice.find().sort({ createdAt: -1 }).lean(),
      BankPayment.find({ status: 'Approved' }).sort({ createdAt: -1 }).lean(),
      Expense.find().sort({ date: -1, createdAt: -1 }).lean(),
      Payroll.find().sort({ payDate: -1, createdAt: -1 }).lean(),
      Student.countDocuments(),
      Staff.countDocuments(),
      FinancialAuditLog.find().sort({ createdAt: -1 }).limit(10).lean()
    ]);

    // Financial Metrics Calculation
    let totalFeeCollection = 0;
    let todayCollection = 0;
    let monthlyCollection = 0;
    let filteredPeriodCollection = 0;
    let pendingFees = 0;
    let overdueFees = 0;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const currentBillingMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    (allInvoices || []).forEach(inv => {
      const paid = Number(inv.paid || inv.paidAmount) || 0;
      const total = Number(inv.amount || inv.totalAmount) || 0;
      const unpaid = Math.max(0, total - paid);
      const invDate = new Date(inv.date || inv.createdAt);
      const due = inv.dueDate ? new Date(inv.dueDate) : null;

      totalFeeCollection += paid;

      // Today's Collection
      if (invDate >= todayStart && invDate <= todayEnd) {
        todayCollection += paid;
      }

      // Monthly Collection
      if (inv.billingMonth === currentBillingMonth || (invDate >= monthStart && invDate <= monthEnd)) {
        monthlyCollection += paid;
      }

      // Filtered range collection
      if (invDate >= filterStart && invDate <= filterEnd) {
        filteredPeriodCollection += paid;
      }

      // Pending & Overdue
      if (unpaid > 0) {
        pendingFees += unpaid;
        if (due && due < todayStart) {
          overdueFees += unpaid;
        }
      }
    });

    (allBankPayments || []).forEach(bp => {
      const amt = Number(bp.amount) || 0;
      const bpDate = new Date(bp.date || bp.createdAt);

      totalFeeCollection += amt;
      if (bpDate >= todayStart && bpDate <= todayEnd) todayCollection += amt;
      if (bpDate >= monthStart && bpDate <= monthEnd) monthlyCollection += amt;
      if (bpDate >= filterStart && bpDate <= filterEnd) filteredPeriodCollection += amt;
    });

    // Expenses Calculation
    let totalExpensesAllTime = 0;
    let totalExpensesFiltered = 0;

    (allExpenses || []).forEach(exp => {
      const amt = Number(exp.amount) || 0;
      const expDate = new Date(exp.date || exp.createdAt);
      totalExpensesAllTime += amt;
      if (expDate >= filterStart && expDate <= filterEnd) {
        totalExpensesFiltered += amt;
      }
    });

    // Salaries Calculation
    let staffSalaryPaidAllTime = 0;
    let staffSalaryPaidFiltered = 0;

    (allPayrolls || []).forEach(pay => {
      const amt = Number(pay.netSalary || pay.basicSalary) || 0;
      const payDate = new Date(pay.payDate || pay.createdAt);
      if (pay.status === 'Paid') {
        staffSalaryPaidAllTime += amt;
        if (payDate >= filterStart && payDate <= filterEnd) {
          staffSalaryPaidFiltered += amt;
        }
      }
    });

    const netIncome = filteredPeriodCollection - (totalExpensesFiltered + staffSalaryPaidFiltered);

    // Monthly Collection Chart (Jan - Dec for current year)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyChart = monthNames.map((name, i) => ({
      month: name,
      income: 0,
      expense: 0
    }));

    (allInvoices || []).forEach(inv => {
      const d = new Date(inv.date || inv.createdAt);
      if (d.getFullYear() === now.getFullYear()) {
        monthlyChart[d.getMonth()].income += (Number(inv.paid || inv.paidAmount) || 0);
      }
    });

    (allBankPayments || []).forEach(bp => {
      const d = new Date(bp.date || bp.createdAt);
      if (d.getFullYear() === now.getFullYear()) {
        monthlyChart[d.getMonth()].income += (Number(bp.amount) || 0);
      }
    });

    (allExpenses || []).forEach(exp => {
      const d = new Date(exp.date || exp.createdAt);
      if (d.getFullYear() === now.getFullYear()) {
        monthlyChart[d.getMonth()].expense += (Number(exp.amount) || 0);
      }
    });

    // Recent Fee Payments
    const recentPayments = (allInvoices || [])
      .filter(i => (Number(i.paid || i.paidAmount) || 0) > 0)
      .slice(0, 7)
      .map(i => ({
        id: i._id,
        invoiceNo: i.invoiceNo || i.challanNo || `INV-${String(i._id).slice(-6)}`,
        studentName: i.student || i.studentName || 'Student',
        className: i.className || '',
        amount: Number(i.paid || i.paidAmount) || 0,
        paymentMethod: i.paymentMethod || 'Cash',
        date: i.date || i.createdAt,
        status: i.status || 'Paid'
      }));

    // Recent Expenses
    const recentExpensesList = (allExpenses || []).slice(0, 7).map(e => ({
      id: e._id,
      title: e.title,
      category: e.categoryName || 'General',
      amount: e.amount,
      paymentMethod: e.paymentMethod,
      date: e.date || e.createdAt,
      status: e.status || 'Paid'
    }));

    // Pending Student Payments
    const pendingStudentPayments = (allInvoices || [])
      .filter(i => {
        const p = Number(i.paid || i.paidAmount) || 0;
        const tot = Number(i.amount || i.totalAmount) || 0;
        return (tot - p) > 0;
      })
      .slice(0, 7)
      .map(i => ({
        id: i._id,
        invoiceNo: i.invoiceNo || i.challanNo,
        studentName: i.student || i.studentName,
        className: i.className,
        remainingAmount: (Number(i.amount || i.totalAmount) || 0) - (Number(i.paid || i.paidAmount) || 0),
        dueDate: i.dueDate || null,
        status: i.status || 'Unpaid'
      }));

    return NextResponse.json({
      success: true,
      data: {
        range,
        summary: {
          totalFeeCollection,
          todayCollection,
          monthlyCollection,
          filteredPeriodCollection,
          pendingFees,
          overdueFees,
          totalExpenses: totalExpensesFiltered,
          staffSalaryPaid: staffSalaryPaidFiltered,
          netIncome,
          studentsCount,
          staffCount
        },
        charts: {
          monthly: monthlyChart
        },
        recentPayments,
        recentExpenses: recentExpensesList,
        pendingStudentPayments,
        auditLogs: recentAudits
      }
    });

  } catch (err) {
    console.error('Accountant stats error:', err);
    return NextResponse.json(
      { success: false, message: 'Failed to load accountant statistics: ' + err.message },
      { status: 500 }
    );
  }
}
