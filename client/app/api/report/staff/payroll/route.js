import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Staff } from '@/lib/models';
import { ensureStaffRosterSeeded } from '@/lib/reportsSeed.service';

export async function GET(req) {
  try {
    await connectDB();
    await ensureStaffRosterSeeded();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const role = searchParams.get('role') || '';
    const department = searchParams.get('department') || '';
    const statusFilter = searchParams.get('status') || '';
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7);

    let query = { status: 'Active' };
    if (role && role !== 'All') query.role = role;
    if (department && department !== 'All') query.department = department;

    const staffList = await Staff.find(query).lean();

    const records = staffList.map((stf, idx) => {
      const basic = Number(stf.basicSalary || stf.salary || 65000);
      const houseRent = Math.round(basic * 0.15);
      const medical = Math.round(basic * 0.08);
      const allowances = houseRent + medical;
      const gross = basic + allowances;

      const tax = Math.round(basic * 0.035);
      const eobi = 1200;
      const deductions = tax + eobi;
      const net = gross - deductions;

      const slipNo = `SLIP-${month.replace('-', '')}-${String(idx + 1).padStart(3, '0')}`;
      const status = idx === staffList.length - 1 ? 'Pending' : 'Paid';

      return {
        _id: stf._id,
        slipNo,
        staffNo: stf.staffNo || `PRC-STF-${String(idx + 1).padStart(3, '0')}`,
        name: `${stf.firstName || ''} ${stf.lastName || ''}`.trim() || 'Faculty Member',
        role: stf.role || 'Teacher',
        department: stf.department || 'Academic Operations',
        designation: stf.designation || 'Lecturer',
        phone: stf.phone || '',
        bankName: stf.bankName || 'Habib Bank Limited (HBL)',
        accountNo: stf.accountNo || 'PK36HABB00012345678901',
        month,
        basicSalary: basic,
        houseRent,
        medicalAllowance: medical,
        allowances,
        grossSalary: gross,
        incomeTax: tax,
        eobi,
        deductions,
        netSalary: net,
        status,
        paymentDate: `${month}-05`,
        paymentMethod: 'Bank Transfer'
      };
    });

    let filtered = records;
    if (statusFilter && statusFilter !== 'All') {
      filtered = filtered.filter(r => r.status.toLowerCase() === statusFilter.toLowerCase());
    }

    if (search) {
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(search) ||
        r.staffNo.toLowerCase().includes(search) ||
        r.department.toLowerCase().includes(search) ||
        r.slipNo.toLowerCase().includes(search)
      );
    }

    const totalBudget = filtered.reduce((acc, r) => acc + r.netSalary, 0);
    const avgSalary = filtered.length > 0 ? Math.round(totalBudget / filtered.length) : 0;
    const paidCount = filtered.filter(r => r.status === 'Paid').length;
    const pendingCount = filtered.filter(r => r.status === 'Pending').length;

    return NextResponse.json({
      success: true,
      month,
      metrics: {
        totalStaff: filtered.length,
        totalBudget,
        avgSalary,
        paidCount,
        pendingCount
      },
      data: filtered
    });

  } catch (err) {
    console.error('Staff Payroll API Error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
