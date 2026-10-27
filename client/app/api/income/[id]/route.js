import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Income, BankAccount, ChartOfAccount } from '@/lib/models';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const item = await Income.findById(id).lean();
    if (!item) {
      return NextResponse.json({ success: false, message: 'Income record not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const record = await Income.findById(id);
    if (!record) {
      return NextResponse.json({ success: false, message: 'Income record not found.' }, { status: 404 });
    }

    if (body.title) record.title = body.title.trim();
    if (body.amount !== undefined) {
      const amt = Number(body.amount);
      if (isNaN(amt) || amt <= 0) {
        return NextResponse.json({ success: false, message: 'Amount must be greater than zero.' }, { status: 400 });
      }
      record.amount = amt;
    }

    if (body.bankAccountId) {
      record.bankAccountId = body.bankAccountId;
      const bank = await BankAccount.findById(body.bankAccountId);
      if (bank) record.bankAccountName = `${bank.bankName} (${bank.accountTitle})`;
    }

    if (body.categoryId) {
      record.categoryId = body.categoryId;
      const coa = await ChartOfAccount.findById(body.categoryId);
      if (coa) record.categoryName = coa.accountName;
    } else if (body.categoryName) {
      record.categoryName = body.categoryName;
    }

    if (body.date) record.date = new Date(body.date);
    if (body.paymentMethod) record.paymentMethod = body.paymentMethod;
    if (body.referenceNo !== undefined) record.referenceNo = body.referenceNo.trim();
    if (body.payerName !== undefined) record.payerName = body.payerName.trim();
    if (body.payerContact !== undefined) record.payerContact = body.payerContact.trim();
    if (body.description !== undefined) record.description = body.description.trim();
    if (body.attachment !== undefined) record.attachment = body.attachment.trim();
    if (body.status) record.status = body.status;

    await record.save();
    return NextResponse.json({ success: true, message: 'Income record updated successfully!', data: record });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const record = await Income.findById(id);
    if (!record) {
      return NextResponse.json({ success: false, message: 'Income record not found.' }, { status: 404 });
    }

    // Mark as Void rather than destructive hard-delete if requested or safe delete
    const { searchParams } = new URL(req.url);
    const force = searchParams.get('force') === 'true';

    if (!force) {
      record.status = 'Void';
      await record.save();
      return NextResponse.json({ success: true, message: 'Income record marked as Void.' });
    }

    await Income.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Income record deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
