import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { FeesInvoice } from '@/lib/models';

function deriveBillingMonth(dateVal) {
  try {
    const d = dateVal ? new Date(dateVal) : new Date();
    if (!isNaN(d.getTime())) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }
  } catch (_) {}
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const billingMonth = searchParams.get('billingMonth');
    const className = searchParams.get('class') || searchParams.get('className');
    const admissionNo = searchParams.get('admissionNo');

    const query = {};
    if (search) {
      query.$or = [
        { student: { $regex: search, $options: 'i' } },
        { admissionNo: { $regex: search, $options: 'i' } },
        { invoiceNo: { $regex: search, $options: 'i' } },
        { challanNo: { $regex: search, $options: 'i' } },
        { feeType: { $regex: search, $options: 'i' } }
      ];
    }
    if (status && status !== 'ALL') {
      query.status = new RegExp(`^${status}$`, 'i');
    }
    if (billingMonth && billingMonth !== 'ALL') {
      query.billingMonth = billingMonth;
    }
    if (className && className !== 'ALL') {
      query.className = new RegExp(`^${className}$`, 'i');
    }
    if (admissionNo) {
      query.admissionNo = admissionNo;
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      FeesInvoice.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      FeesInvoice.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    console.error('API /fees-invoice GET error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.billingMonth) {
      body.billingMonth = deriveBillingMonth(body.date);
    }
    if (!body.challanNo) {
      body.challanNo = body.invoiceNo || String(Math.floor(10000 + Math.random() * 90000));
    }
    if (!body.invoiceNo) {
      body.invoiceNo = `CH-${body.challanNo}`;
    }

    // Auto-compute balance if amount/paid provided
    if (body.amount !== undefined && body.balance === undefined) {
      const amt = Number(body.amount) || 0;
      const pd = Number(body.paid) || 0;
      const wf = Number(body.waiver) || 0;
      const fn = Number(body.fine) || 0;
      body.balance = Math.max(0, (amt + fn) - (pd + wf));
    }

    if (body.upsertMonthly && body.admissionNo && body.billingMonth) {
      const existing = await FeesInvoice.findOne({
        admissionNo: body.admissionNo,
        billingMonth: body.billingMonth
      });
      if (existing) {
        const updated = await FeesInvoice.findByIdAndUpdate(existing._id, body, { new: true });
        return NextResponse.json({ success: true, data: updated, message: 'Invoice updated successfully' });
      }
    }

    const created = await FeesInvoice.create(body);
    return NextResponse.json({ success: true, data: created, message: 'Invoice created successfully' }, { status: 201 });
  } catch (error) {
    console.error('API /fees-invoice POST error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to record invoice' }, { status: 500 });
  }
}
