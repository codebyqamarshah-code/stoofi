import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Student, Teacher, Staff, Attendance, StaffAttendance, FeesInvoice, BankPayment, FeePayment, Expense, Notice, Todo } from '@/lib/models';

export async function GET(req) {
  try {
    await connectDB();

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    const currentBillingMonth = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

    // 1. Strict Calendar Date Range for TODAY's Attendance (resets automatically every midnight)
    const startOfDay = new Date(currentYear, currentMonth, now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(currentYear, currentMonth, now.getDate(), 23, 59, 59, 999);

    // 2. Strict Monthly Date Range for FEES Collection (resets on the 1st of every month)
    const startOfMonth = new Date(currentYear, currentMonth, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

    // High-performance parallelized database execution
    const [
      totalStudents,
      maleStudents,
      femaleStudents,
      totalTeachers,
      totalStaffs,
      parentDocs,
      todayStudentsPresent,
      todayStaffPresentAtt,
      todayStaffPresentStaffAtt,
      allFeeInvoices,
      allBankPayments,
      allFeePayments,
      allExpenses,
      noticesList,
      todos
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ gender: 'Male' }),
      Student.countDocuments({ gender: 'Female' }),
      Teacher.countDocuments(),
      Staff.countDocuments(),
      Student.find({}, { fatherCnic: 1, fatherPhone: 1, fatherName: 1, guardianPhone: 1, guardianName: 1 }).lean(),
      Attendance.countDocuments({
        userType: 'Student',
        date: { $gte: startOfDay, $lte: endOfDay },
        status: 'Present'
      }),
      Attendance.countDocuments({
        userType: { $in: ['Staff', 'Teacher'] },
        date: { $gte: startOfDay, $lte: endOfDay },
        status: 'Present'
      }),
      StaffAttendance.countDocuments({
        date: { $gte: startOfDay, $lte: endOfDay },
        status: 'Present'
      }),
      FeesInvoice.find().lean(),
      BankPayment.find().lean(),
      FeePayment.find().lean(),
      Expense.find().lean(),
      Notice.find({ published: true }).sort({ createdAt: -1 }).limit(10).lean(),
      Todo.find().sort({ createdAt: -1 }).lean()
    ]);

    // Live distinct parents count based on real enrolled students
    const distinctParentKeys = new Set();
    parentDocs.forEach(s => {
      const key = (s.fatherCnic || s.fatherPhone || s.fatherName || s.guardianPhone || s.guardianName || '').trim().toLowerCase();
      if (key) distinctParentKeys.add(key);
    });
    const totalParents = distinctParentKeys.size > 0 ? distinctParentKeys.size : (totalStudents > 0 ? Math.ceil(totalStudents * 0.7) : 0);

    // ── ATTENDANCE: STRICTLY FOR TODAY ONLY ──
    // If not marked today yet, it is strictly 0. When marked, it updates. Tomorrow it resets to 0.
    const studentsPresent = todayStudentsPresent || 0;
    const staffPresent = Math.max(todayStaffPresentAtt || 0, todayStaffPresentStaffAtt || 0);

    const studentAttPercent = totalStudents > 0 ? Math.round((studentsPresent / totalStudents) * 100) : 0;
    const staffAttPercent = (totalStaffs + totalTeachers) > 0 ? Math.round((staffPresent / (totalStaffs + totalTeachers)) * 100) : 0;

    // ── MONTHLY FEES COLLECTION: STRICTLY FOR CURRENT MONTH (Resets on 1st of every month) ──
    let monthCollectedFees = 0;
    let monthInvoicedTotal = 0;
    const paidStudentsSet = new Set();

    // Sum invoices for current billing month
    (allFeeInvoices || []).forEach(inv => {
      const invDate = new Date(inv.date || inv.createdAt);
      const isThisMonth = 
        inv.billingMonth === currentBillingMonth ||
        (!inv.billingMonth && invDate >= startOfMonth && invDate <= endOfMonth);

      if (isThisMonth) {
        const paid = Number(inv.paid ?? inv.paidAmount) || 0;
        const total = Number(inv.amount ?? inv.totalAmount) || 0;
        monthCollectedFees += paid;
        monthInvoicedTotal += total;

        if (paid > 0 || inv.status === 'Paid') {
          const key = (inv.admissionNo || inv.student || inv.studentName || '').trim().toLowerCase();
          if (key) paidStudentsSet.add(key);
        }
      }
    });

    // Sum approved bank payments for current month
    (allBankPayments || []).forEach(bp => {
      if (bp.status === 'Approved') {
        const bpDate = new Date(bp.date || bp.createdAt);
        if (bpDate >= startOfMonth && bpDate <= endOfMonth) {
          const amt = Number(bp.amount) || 0;
          monthCollectedFees += amt;
          const key = (bp.admissionNo || bp.studentName || '').trim().toLowerCase();
          if (key) paidStudentsSet.add(key);
        }
      }
    });

    // Sum direct fee payments for current month
    (allFeePayments || []).forEach(fp => {
      const fpDate = new Date(fp.date || fp.createdAt);
      if (fpDate >= startOfMonth && fpDate <= endOfMonth) {
        const amt = Number(fp.netAmount ?? fp.amount) || 0;
        monthCollectedFees += amt;
        const key = (fp.studentName || '').trim().toLowerCase();
        if (key) paidStudentsSet.add(key);
      }
    });

    // Baseline monthly total: if invoices created use invoice total, otherwise 1200 per student
    const baseMonthlyTuition = 1200;
    const totalExpectedMonthFees = totalStudents > 0 
      ? Math.max(monthInvoicedTotal, totalStudents * baseMonthlyTuition, monthCollectedFees)
      : (monthCollectedFees > 0 ? monthCollectedFees : 0);

    const paidStudentsCount = Math.min(totalStudents, paidStudentsSet.size);

    const monthCollectionPercentage = totalExpectedMonthFees > 0 
      ? Math.min(100, Math.round((monthCollectedFees / totalExpectedMonthFees) * 100)) 
      : (monthCollectedFees > 0 ? 100 : 0);

    // Current month expenses
    let currentMonthExpenses = 0;
    (allExpenses || []).forEach(e => {
      const eDate = new Date(e.date || e.createdAt);
      if (eDate >= startOfMonth && eDate <= endOfMonth) {
        currentMonthExpenses += Number(e.amount) || 0;
      }
    });
    const currentMonthProfit = monthCollectedFees - currentMonthExpenses;

    // Notices — only real data, no dummy fallback
    let notices = noticesList || [];

    // Monthly breakdown data (Days 01, 05, 10, 15, 20, 25, 30) for chart
    const monthlyBreakdown = [
      { day: '01', income: 0, expense: 0 },
      { day: '05', income: 0, expense: 0 },
      { day: '10', income: 0, expense: 0 },
      { day: '15', income: 0, expense: 0 },
      { day: '20', income: 0, expense: 0 },
      { day: '25', income: 0, expense: 0 },
      { day: '30', income: 0, expense: 0 },
    ];

    const addIncomeToBreakdown = (dateVal, amt) => {
      const pDate = new Date(dateVal);
      if (pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear) {
        const day = pDate.getDate();
        if (day <= 3) monthlyBreakdown[0].income += amt;
        else if (day <= 7) monthlyBreakdown[1].income += amt;
        else if (day <= 12) monthlyBreakdown[2].income += amt;
        else if (day <= 17) monthlyBreakdown[3].income += amt;
        else if (day <= 22) monthlyBreakdown[4].income += amt;
        else if (day <= 27) monthlyBreakdown[5].income += amt;
        else monthlyBreakdown[6].income += amt;
      }
    };

    (allFeeInvoices || []).forEach(i => {
      const paid = Number(i.paid || i.paidAmount) || 0;
      if (paid > 0) addIncomeToBreakdown(i.date || i.createdAt, paid);
    });
    (allBankPayments || []).forEach(b => {
      if (b.status === 'Approved') addIncomeToBreakdown(b.date || b.createdAt, Number(b.amount) || 0);
    });
    (allFeePayments || []).forEach(f => {
      addIncomeToBreakdown(f.date || f.createdAt, Number(f.netAmount || f.amount) || 0);
    });

    (allExpenses || []).forEach(e => {
      const eDate = new Date(e.date || e.createdAt);
      if (eDate.getMonth() === currentMonth && eDate.getFullYear() === currentYear) {
        const day = eDate.getDate();
        const amt = e.amount || 0;
        if (day <= 3) monthlyBreakdown[0].expense += amt;
        else if (day <= 7) monthlyBreakdown[1].expense += amt;
        else if (day <= 12) monthlyBreakdown[2].expense += amt;
        else if (day <= 17) monthlyBreakdown[3].expense += amt;
        else if (day <= 22) monthlyBreakdown[4].expense += amt;
        else if (day <= 27) monthlyBreakdown[5].expense += amt;
        else monthlyBreakdown[6].expense += amt;
      }
    });

    // Yearly trajectory data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const yearlyTrajectory = monthNames.map(m => ({ month: m, income: 0, expense: 0 }));

    const addIncomeToYearly = (dateVal, amt) => {
      const pDate = new Date(dateVal);
      if (pDate.getFullYear() === currentYear) {
        const mIdx = pDate.getMonth();
        if (mIdx >= 0 && mIdx < 12) {
          yearlyTrajectory[mIdx].income += amt;
        }
      }
    };

    (allFeeInvoices || []).forEach(i => {
      const paid = Number(i.paid || i.paidAmount) || 0;
      if (paid > 0) addIncomeToYearly(i.date || i.createdAt, paid);
    });
    (allBankPayments || []).forEach(b => {
      if (b.status === 'Approved') addIncomeToYearly(b.date || b.createdAt, Number(b.amount) || 0);
    });
    (allFeePayments || []).forEach(f => {
      addIncomeToYearly(f.date || f.createdAt, Number(f.netAmount || f.amount) || 0);
    });

    (allExpenses || []).forEach(e => {
      const eDate = new Date(e.date || e.createdAt);
      if (eDate.getFullYear() === currentYear) {
        const mIdx = eDate.getMonth();
        if (mIdx >= 0 && mIdx < 12) {
          yearlyTrajectory[mIdx].expense += (e.amount || 0);
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          students: {
            total: totalStudents,
            male: maleStudents,
            female: femaleStudents,
            malePercent: totalStudents ? Math.round((maleStudents / totalStudents) * 100) : 0,
            femalePercent: totalStudents ? Math.round((femaleStudents / totalStudents) * 100) : 0
          },
          teachers: totalTeachers,
          parents: totalParents,
          staffs: totalStaffs,
          attendance: {
            studentsPresent,
            studentsTotal: totalStudents,
            staffPresent,
            staffTotal: totalStaffs + totalTeachers,
            studentAttPercent,
            staffAttPercent
          },
          fees: {
            totalIncome: monthCollectedFees,
            totalExpenses: currentMonthExpenses,
            totalProfit: currentMonthProfit,
            totalFees: totalExpectedMonthFees,
            collectedFees: monthCollectedFees,
            collectionPercentage: monthCollectionPercentage,
            paidStudentsCount,
            totalStudents,
            billingMonth: currentBillingMonth
          }
        },
        charts: {
          monthly: monthlyBreakdown,
          yearly: yearlyTrajectory
        },
        notices,
        todos
      }
    });
  } catch (error) {
    console.error('API /dashboard/stats error:', error);
    return NextResponse.json({
      success: true,
      data: {
        stats: {
          students: { total: 0, male: 0, female: 0, malePercent: 0, femalePercent: 0 },
          teachers: 0,
          parents: 0,
          staffs: 0,
          attendance: { studentsPresent: 0, studentsTotal: 0, staffPresent: 0, staffTotal: 0, studentAttPercent: 0, staffAttPercent: 0 },
          fees: { totalIncome: 0, totalExpenses: 0, totalProfit: 0, totalFees: 0, collectedFees: 0, collectionPercentage: 0, paidStudentsCount: 0, totalStudents: 0 }
        },
        charts: {
          monthly: [
            { day: '01', income: 0, expense: 0 },
            { day: '05', income: 0, expense: 0 },
            { day: '10', income: 0, expense: 0 },
            { day: '15', income: 0, expense: 0 },
            { day: '20', income: 0, expense: 0 },
            { day: '25', income: 0, expense: 0 },
            { day: '30', income: 0, expense: 0 }
          ],
          yearly: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => ({ month: m, income: 0, expense: 0 }))
        },
        notices: [],
        todos: []
      }
    });
  }
}
