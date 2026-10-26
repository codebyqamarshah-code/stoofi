import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Staff, Payroll } from '@/lib/models';
import { ensureStaffRosterSeeded, STAFF_SEED } from '@/lib/reportsSeed.service';

export async function GET(req) {
  try {
    await connectDB();
    await ensureStaffRosterSeeded();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const role = searchParams.get('role') || '';
    const department = searchParams.get('department') || '';
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7); // e.g. "2026-10"

    // Fetch active staff
    let staffQuery = { status: 'Active' };
    if (role && role !== 'All') staffQuery.role = role;
    if (department && department !== 'All') staffQuery.department = department;

    const staffList = await Staff.find(staffQuery).lean();

    // Map each staff member with their monthly payroll record
    const records = staffList.map((stf, idx) => {
      const basic = Number(stf.basicSalary || stf.salary || 65000);
      const allowances = Number(stf.allowances || Math.round(basic * 0.22));
      const gross = basic + allowances;
      const deductions = Number(stf.deductions || Math.round(basic * 0.05));
      const net = gross - deductions;

      const voucherYear = month.slice(0, 4);
      const voucherNo = `PRC-PAY-${voucherYear}-${String(idx + 1).padStart(4, '0')}`;
      const payDate = `${month}-05`;

      return {
        _id: stf._id,
        voucherNo,
        staffId: stf._id,
        staffNo: stf.staffNo || `PRC-STF-${String(idx + 1).padStart(3, '0')}`,
        name: `${stf.firstName || ''} ${stf.lastName || ''}`.trim() || 'Staff Member',
        role: stf.role || 'Faculty',
        department: stf.department || 'Academic Operations',
        designation: stf.designation || 'Lecturer',
        email: stf.email || '',
        phone: stf.phone || '',
        cnic: stf.cnic || '',
        bankName: stf.bankName || 'Habib Bank Limited (HBL)',
        accountNo: stf.accountNo || 'PK36HABB00012345678901',
        month,
        basicSalary: basic,
        allowances,
        grossSalary: gross,
        deductions,
        netSalary: net,
        status: idx === staffList.length - 1 ? 'Processing' : 'Paid',
        payDate,
        paymentMethod: 'Bank Transfer'
      };
    });

    // Filter by search query if provided
    const filteredRecords = search
      ? records.filter(r => 
          r.name.toLowerCase().includes(search) || 
          r.staffNo.toLowerCase().includes(search) ||
          r.department.toLowerCase().includes(search) ||
          r.voucherNo.toLowerCase().includes(search)
        )
      : records;

    // Calculate aggregated financial metrics
    const totalGross = filteredRecords.reduce((acc, r) => acc + r.grossSalary, 0);
    const totalAllowances = filteredRecords.reduce((acc, r) => acc + r.allowances, 0);
    const totalDeductions = filteredRecords.reduce((acc, r) => acc + r.deductions, 0);
    const totalDisbursedNet = filteredRecords.reduce((acc, r) => acc + r.netSalary, 0);
    const paidCount = filteredRecords.filter(r => r.status === 'Paid').length;
    const processingCount = filteredRecords.filter(r => r.status === 'Processing').length;

    return NextResponse.json({
      success: true,
      month,
      metrics: {
        totalStaff: filteredRecords.length,
        totalGross,
        totalAllowances,
        totalDeductions,
        totalDisbursedNet,
        paidCount,
        processingCount
      },
      data: filteredRecords
    });

  } catch (err) {
    console.error('Accounts Payroll API Error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
