import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const fiscalYear = searchParams.get('year') || '2026';

    const incomeBreakdown = [
      { head: 'Student Tuition Fees', amount: 4850000, percentage: 68.2 },
      { head: 'Admission & Prospectus Registration', amount: 480000, percentage: 6.7 },
      { head: 'Clinical & Laboratory Practice Charges', amount: 620000, percentage: 8.7 },
      { head: 'Hostel Accommodation Fees', amount: 580000, percentage: 8.2 },
      { head: 'Transport Facility Subscriptions', amount: 380000, percentage: 5.3 },
      { head: 'Examination & Certification Fees', amount: 200000, percentage: 2.9 }
    ];

    const expenseBreakdown = [
      { head: 'Faculty & Administrative Staff Salaries', amount: 3240000, percentage: 62.1 },
      { head: 'Campus Electricity & Backup Power (Diesel)', amount: 680000, percentage: 13.0 },
      { head: 'Lab Consumables, OT Equipment & Reagents', amount: 420000, percentage: 8.1 },
      { head: 'Security & Campus Facility Operations', amount: 390000, percentage: 7.5 },
      { head: 'Examination Printing & Stationery', amount: 220000, percentage: 4.2 },
      { head: 'IT Infrastructure, ERP & High-Speed Internet', amount: 150000, percentage: 2.9 },
      { head: 'Building Maintenance & Sanitization', amount: 120000, percentage: 2.2 }
    ];

    const totalIncome = incomeBreakdown.reduce((sum, i) => sum + i.amount, 0);
    const totalExpense = expenseBreakdown.reduce((sum, e) => sum + e.amount, 0);
    const netSurplus = totalIncome - totalExpense;
    const netMarginPercent = ((netSurplus / totalIncome) * 100).toFixed(1);

    const monthlyTrends = [
      { month: 'May 2026', income: 1150000, expense: 850000, surplus: 300000 },
      { month: 'Jun 2026', income: 1080000, expense: 820000, surplus: 260000 },
      { month: 'Jul 2026', income: 1240000, expense: 880000, surplus: 360000 },
      { month: 'Aug 2026', income: 1320000, expense: 890000, surplus: 430000 },
      { month: 'Sep 2026', income: 1100000, expense: 860000, surplus: 240000 },
      { month: 'Oct 2026', income: 1220000, expense: 920000, surplus: 300000 }
    ];

    return NextResponse.json({
      success: true,
      fiscalYear,
      metrics: {
        totalIncome,
        totalExpense,
        netSurplus,
        netMarginPercent
      },
      incomeBreakdown,
      expenseBreakdown,
      monthlyTrends
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
