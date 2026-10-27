import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Income, Expense, FeesInvoice } from '@/lib/models';

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'year';
    const customStart = searchParams.get('startDate');
    const customEnd = searchParams.get('endDate');

    const now = new Date();
    let startDate = new Date(now.getFullYear(), 0, 1); // default start of current year
    let endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

    if (period === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (period === 'week') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
      startDate = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), diff + 6, 23, 59, 59, 999);
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (period === 'prev_month') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    } else if (period === 'quarter') {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), currentQuarter * 3, 1, 0, 0, 0);
      endDate = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0, 23, 59, 59, 999);
    } else if (period === 'custom' && customStart) {
      startDate = new Date(customStart);
      startDate.setHours(0, 0, 0, 0);
      endDate = customEnd ? new Date(customEnd) : new Date();
      endDate.setHours(23, 59, 59, 999);
    }

    const dateQuery = { $gte: startDate, $lte: endDate };

    // Fetch recognized Incomes, Student Fee Invoices, and Expenses
    const [incomes, feeInvoices, expenses] = await Promise.all([
      Income.find({ date: dateQuery, status: 'Received' }).sort({ date: 1 }).lean(),
      FeesInvoice.find({ date: dateQuery, status: 'Paid' }).sort({ date: 1 }).lean(),
      Expense.find({ date: dateQuery, status: 'Paid' }).sort({ date: 1 }).lean()
    ]);

    // Format all income transactions (General Incomes + Paid Student Fee Invoices)
    const combinedIncomes = [
      ...incomes.map(i => ({
        id: i._id,
        title: i.title,
        amount: Number(i.amount) || 0,
        category: i.categoryName || 'General Revenue',
        date: i.date,
        reference: i.receiptNo || i.referenceNo || 'INC',
        paymentMethod: i.paymentMethod,
        type: 'Income'
      })),
      ...feeInvoices.map(f => ({
        id: f._id,
        title: `Student Tuition Fee — ${f.student} (${f.admissionNo || ''})`,
        amount: Number(f.paid || f.amount) || 0,
        category: 'Tuition & Academic Program Fees',
        date: f.date || f.createdAt,
        reference: f.challanNo || f.invoiceNo || 'FEE',
        paymentMethod: f.paymentMethod || 'Cash',
        type: 'Fee Collection'
      }))
    ];

    const formattedExpenses = expenses.map(e => ({
      id: e._id,
      title: e.title,
      amount: Number(e.amount) || 0,
      category: e.categoryName || 'Operating Expense',
      date: e.date,
      reference: e.voucherNo || e.referenceNo || 'EXP',
      paymentMethod: e.paymentMethod,
      type: 'Expense'
    }));

    // Overall Totals
    const totalIncome = combinedIncomes.reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = formattedExpenses.reduce((sum, item) => sum + item.amount, 0);
    const netProfitLoss = totalIncome - totalExpense;
    const totalTransactions = combinedIncomes.length + formattedExpenses.length;

    // Monthly Grouping: Generate 12 months for the current reporting range
    const monthsMap = {};
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // Pre-populate months in range
    const startM = startDate.getMonth();
    const endM = endDate.getMonth();
    const yearNum = startDate.getFullYear();

    for (let m = 0; m < 12; m++) {
      const key = `${monthNames[m]} ${yearNum}`;
      monthsMap[key] = {
        month: key,
        monthIndex: m,
        income: 0,
        expense: 0,
        net: 0,
        count: 0
      };
    }

    // Accumulate incomes into monthly buckets
    for (const inc of combinedIncomes) {
      const d = new Date(inc.date);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      if (!monthsMap[key]) {
        monthsMap[key] = { month: key, monthIndex: d.getMonth(), income: 0, expense: 0, net: 0, count: 0 };
      }
      monthsMap[key].income += inc.amount;
      monthsMap[key].count += 1;
    }

    // Accumulate expenses into monthly buckets
    for (const exp of formattedExpenses) {
      const d = new Date(exp.date);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      if (!monthsMap[key]) {
        monthsMap[key] = { month: key, monthIndex: d.getMonth(), income: 0, expense: 0, net: 0, count: 0 };
      }
      monthsMap[key].expense += exp.amount;
      monthsMap[key].count += 1;
    }

    // Compute net profit/loss per month
    const monthlyBreakdown = Object.values(monthsMap)
      .map(m => ({
        ...m,
        net: m.income - m.expense
      }))
      .filter(m => m.income > 0 || m.expense > 0 || period === 'year')
      .sort((a, b) => a.monthIndex - b.monthIndex);

    // Category Breakdown
    const incomeCategories = {};
    for (const i of combinedIncomes) {
      incomeCategories[i.category] = (incomeCategories[i.category] || 0) + i.amount;
    }

    const expenseCategories = {};
    for (const e of formattedExpenses) {
      expenseCategories[e.category] = (expenseCategories[e.category] || 0) + e.amount;
    }

    return NextResponse.json({
      success: true,
      period,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      summary: {
        totalIncome,
        totalExpense,
        netProfitLoss,
        totalTransactions,
        isProfitable: netProfitLoss >= 0
      },
      monthlyBreakdown,
      categories: {
        income: Object.entries(incomeCategories).map(([name, amount]) => ({ name, amount })),
        expense: Object.entries(expenseCategories).map(([name, amount]) => ({ name, amount }))
      },
      recentTransactions: [
        ...combinedIncomes.slice(-15),
        ...formattedExpenses.slice(-15)
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20)
    });
  } catch (error) {
    console.error('API /profit-loss GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
