import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { BankAccount, Income, Expense, FundTransfer } from '@/lib/models';
import { calculateAccountLiveBalance } from '@/lib/accountCalculations';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const account = await BankAccount.findById(id)
      .populate('chartOfAccountId', 'accountCode accountName')
      .lean();

    if (!account) {
      return NextResponse.json({ success: false, message: 'Bank account not found.' }, { status: 404 });
    }

    const liveBal = await calculateAccountLiveBalance(account._id, account.openingBalance);
    account.currentBalance = liveBal;

    // Fetch recent transaction history
    const [incomes, expenses, transfersIn, transfersOut] = await Promise.all([
      Income.find({ bankAccountId: id }).sort({ date: -1 }).limit(20).lean(),
      Expense.find({ bankAccountId: id }).sort({ date: -1 }).limit(20).lean(),
      FundTransfer.find({ toAccountId: id }).sort({ date: -1 }).limit(20).lean(),
      FundTransfer.find({ fromAccountId: id }).sort({ date: -1 }).limit(20).lean()
    ]);

    const unifiedHistory = [
      ...incomes.map(i => ({
        id: i._id,
        type: 'Income (Credit)',
        amount: i.amount,
        direction: 'credit',
        date: i.date,
        title: i.title,
        reference: i.receiptNo || i.referenceNo || 'INC',
        status: i.status
      })),
      ...expenses.map(e => ({
        id: e._id,
        type: 'Expense (Debit)',
        amount: e.amount,
        direction: 'debit',
        date: e.date,
        title: e.title,
        reference: e.voucherNo || e.referenceNo || 'EXP',
        status: e.status
      })),
      ...transfersIn.map(t => ({
        id: t._id,
        type: 'Transfer In (Credit)',
        amount: t.amount,
        direction: 'credit',
        date: t.date,
        title: `Transfer from ${t.fromAccountName}`,
        reference: t.transferNo || 'TRF-IN',
        status: t.status
      })),
      ...transfersOut.map(t => ({
        id: t._id,
        type: 'Transfer Out (Debit)',
        amount: t.amount,
        direction: 'debit',
        date: t.date,
        title: `Transfer to ${t.toAccountName}`,
        reference: t.transferNo || 'TRF-OUT',
        status: t.status
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 30);

    return NextResponse.json({
      success: true,
      data: {
        ...account,
        history: unifiedHistory
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const account = await BankAccount.findById(id);
    if (!account) {
      return NextResponse.json({ success: false, message: 'Bank account not found.' }, { status: 404 });
    }

    if (body.accountNumber && body.accountNumber.trim().toLowerCase() !== account.accountNumber.toLowerCase()) {
      const duplicate = await BankAccount.findOne({ accountNumber: body.accountNumber.trim() });
      if (duplicate) {
        return NextResponse.json({ success: false, message: `Another account with number "${body.accountNumber}" already exists.` }, { status: 400 });
      }
      account.accountNumber = body.accountNumber.trim();
    }

    if (body.bankName) account.bankName = body.bankName.trim();
    if (body.accountTitle) account.accountTitle = body.accountTitle.trim();
    if (body.branchName !== undefined) account.branchName = body.branchName.trim();
    if (body.branchCode !== undefined) account.branchCode = body.branchCode.trim();
    if (body.accountType) account.accountType = body.accountType;
    if (body.chartOfAccountId !== undefined) account.chartOfAccountId = body.chartOfAccountId || null;
    if (body.description !== undefined) account.description = body.description.trim();
    if (body.status) account.status = body.status;
    if (body.openingBalance !== undefined) account.openingBalance = Number(body.openingBalance) || 0;

    await account.save();
    return NextResponse.json({ success: true, message: 'Bank account updated successfully!', data: account });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const account = await BankAccount.findById(id);
    if (!account) {
      return NextResponse.json({ success: false, message: 'Bank account not found.' }, { status: 404 });
    }

    // Safety checks: do not delete if financial transactions reference this account
    const [incomeCount, expenseCount, transferCount] = await Promise.all([
      Income.countDocuments({ bankAccountId: id }),
      Expense.countDocuments({ bankAccountId: id }),
      FundTransfer.countDocuments({ $or: [{ fromAccountId: id }, { toAccountId: id }] })
    ]);

    if (incomeCount > 0 || expenseCount > 0 || transferCount > 0) {
      account.status = 'Inactive';
      await account.save();
      return NextResponse.json({
        success: true,
        message: 'Account has linked financial transactions. Safely deactivated instead of deleted to protect ledger integrity.'
      });
    }

    await BankAccount.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Bank account deleted successfully!' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
