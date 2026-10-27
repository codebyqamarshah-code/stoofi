import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ChartOfAccount, Income, Expense, BankAccount } from '@/lib/models';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const item = await ChartOfAccount.findById(id).lean();
    if (!item) {
      return NextResponse.json({ success: false, message: 'Account not found.' }, { status: 404 });
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

    const account = await ChartOfAccount.findById(id);
    if (!account) {
      return NextResponse.json({ success: false, message: 'Account not found.' }, { status: 404 });
    }

    if (body.accountCode && body.accountCode.trim().toLowerCase() !== account.accountCode.toLowerCase()) {
      const duplicate = await ChartOfAccount.findOne({ accountCode: body.accountCode.trim() });
      if (duplicate) {
        return NextResponse.json({ success: false, message: `Another account with code "${body.accountCode}" already exists.` }, { status: 400 });
      }
      account.accountCode = body.accountCode.trim();
    }

    if (body.accountName) account.accountName = body.accountName.trim();
    if (body.accountType) account.accountType = body.accountType;
    if (body.description !== undefined) account.description = body.description.trim();
    if (body.status) account.status = body.status;
    if (body.openingBalance !== undefined) account.openingBalance = Number(body.openingBalance) || 0;

    await account.save();
    return NextResponse.json({ success: true, message: 'Account updated successfully!', data: account });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const account = await ChartOfAccount.findById(id);
    if (!account) {
      return NextResponse.json({ success: false, message: 'Account not found.' }, { status: 404 });
    }

    // Safety checks: do not delete if financial transactions or bank accounts reference this
    const [incomeCount, expenseCount, bankCount] = await Promise.all([
      Income.countDocuments({ categoryId: id }),
      Expense.countDocuments({ categoryId: id }),
      BankAccount.countDocuments({ chartOfAccountId: id })
    ]);

    if (incomeCount > 0 || expenseCount > 0 || bankCount > 0) {
      // Deactivate instead of destructive deletion
      account.status = 'Inactive';
      await account.save();
      return NextResponse.json({ 
        success: true, 
        message: 'Account has linked financial history. Safely deactivated instead of deleted to protect ledger integrity.' 
      });
    }

    await ChartOfAccount.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Account deleted successfully!' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
