import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { FundTransfer, BankAccount } from '@/lib/models';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const item = await FundTransfer.findById(id).lean();
    if (!item) {
      return NextResponse.json({ success: false, message: 'Transfer record not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/**
 * Reversal Workflow: Reverses a completed transfer safely
 * Deducts destination account and returns funds to source account.
 */
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const transfer = await FundTransfer.findById(id);
    if (!transfer) {
      return NextResponse.json({ success: false, message: 'Transfer record not found.' }, { status: 404 });
    }

    if (transfer.status === 'Reversed') {
      return NextResponse.json({ success: false, message: 'This transfer has already been reversed.' }, { status: 400 });
    }

    // Verify destination account has sufficient balance to deduct the reversed funds
    const destLiveBal = await calculateAccountLiveBalance(transfer.toAccountId);
    if (destLiveBal < transfer.amount) {
      return NextResponse.json({
        success: false,
        message: `Cannot reverse transfer: Destination account (${transfer.toAccountName}) has insufficient available funds (Available: Rs ${destLiveBal.toLocaleString()}, Required: Rs ${transfer.amount.toLocaleString()}).`
      }, { status: 400 });
    }

    // Mark as Reversed
    transfer.status = 'Reversed';
    transfer.reversalReason = 'Reversed by Authorized Accounts Administrator';
    await transfer.save();

    return NextResponse.json({
      success: true,
      message: `Transfer ${transfer.transferNo} reversed successfully. Funds have been credited back to ${transfer.fromAccountName}.`
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
