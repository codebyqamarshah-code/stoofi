import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { FundTransfer, BankAccount } from '@/lib/models';
import { calculateAccountLiveBalance } from '@/lib/accountCalculations';

export const SAMPLE_TRANSFERS = [
  {
    transferNo: 'TRF-2026-0001',
    amount: 100000,
    transferMethod: 'Internal Transfer',
    referenceNo: 'BANK-CHQ-11029',
    description: 'Scheduled liquidity transfer from HBL fee collections into Meezan main operational account',
    date: new Date('2026-10-17'),
    status: 'Completed',
    createdByName: 'Finance Manager'
  }
];

async function seedDefaultTransfersIfEmpty() {
  try {
    const count = await FundTransfer.countDocuments();
    if (count === 0) {
      const [hbl, meezan] = await Promise.all([
        BankAccount.findOne({ bankName: { $regex: 'Habib', $options: 'i' } }),
        BankAccount.findOne({ bankName: { $regex: 'Meezan', $options: 'i' } })
      ]);

      if (hbl && meezan) {
        await FundTransfer.create({
          ...SAMPLE_TRANSFERS[0],
          fromAccountId: hbl._id,
          fromAccountName: `${hbl.bankName} (${hbl.accountTitle})`,
          toAccountId: meezan._id,
          toAccountName: `${meezan.bankName} (${meezan.accountTitle})`
        });
      }
    }
  } catch (e) {
    console.error('Error auto-seeding Fund Transfers:', e.message);
  }
}

export async function GET(req) {
  try {
    await connectDB();
    await seedDefaultTransfersIfEmpty();

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('search') || '').trim();
    const fromAccount = (searchParams.get('fromAccount') || '').trim();
    const toAccount = (searchParams.get('toAccount') || '').trim();
    const status = (searchParams.get('status') || '').trim();
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '20', 10));

    const filter = {};

    if (fromAccount && fromAccount !== 'All') filter.fromAccountId = fromAccount;
    if (toAccount && toAccount !== 'All') filter.toAccountId = toAccount;
    if (status && status !== 'All') filter.status = status;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filter.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      filter.$or = [
        { transferNo: searchRegex },
        { referenceNo: searchRegex },
        { fromAccountName: searchRegex },
        { toAccountName: searchRegex },
        { description: searchRegex }
      ];
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalAgg, todayAgg, monthAgg, totalCount] = await Promise.all([
      FundTransfer.aggregate([
        { $match: { status: 'Completed' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      FundTransfer.aggregate([
        { $match: { status: 'Completed', date: { $gte: startOfToday } } },
        { $group: { _id: null, count: { $sum: 1 } } }
      ]),
      FundTransfer.aggregate([
        { $match: { status: 'Completed', date: { $gte: startOfMonth } } },
        { $group: { _id: null, count: { $sum: 1 } } }
      ]),
      FundTransfer.countDocuments(filter)
    ]);

    const stats = {
      totalTransfers: totalAgg[0]?.count || 0,
      totalVolume: totalAgg[0]?.total || 0,
      transfersToday: todayAgg[0]?.count || 0,
      transfersThisMonth: monthAgg[0]?.count || 0
    };

    const skip = (page - 1) * limit;
    const data = await FundTransfer.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data,
      stats,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit) || 1
      }
    });
  } catch (error) {
    console.error('API /fund-transfer GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      fromAccountId,
      toAccountId,
      amount,
      date = new Date(),
      referenceNo = '',
      transferMethod = 'Internal Transfer',
      description = '',
      attachment = '',
      status = 'Completed'
    } = body;

    if (!fromAccountId || !toAccountId) {
      return NextResponse.json({ success: false, message: 'Source and destination accounts are both required.' }, { status: 400 });
    }

    if (String(fromAccountId) === String(toAccountId)) {
      return NextResponse.json({ success: false, message: 'Source and destination accounts must be different.' }, { status: 400 });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ success: false, message: 'Transfer amount must be greater than zero.' }, { status: 400 });
    }

    const [sourceAccount, destAccount] = await Promise.all([
      BankAccount.findById(fromAccountId),
      BankAccount.findById(toAccountId)
    ]);

    if (!sourceAccount || sourceAccount.status !== 'Active') {
      return NextResponse.json({ success: false, message: 'Source account not found or is inactive.' }, { status: 404 });
    }
    if (!destAccount || destAccount.status !== 'Active') {
      return NextResponse.json({ success: false, message: 'Destination account not found or is inactive.' }, { status: 404 });
    }

    // Check available source funds
    const availableBalance = await calculateAccountLiveBalance(sourceAccount._id, sourceAccount.openingBalance);
    if (status === 'Completed' && availableBalance < numAmount) {
      return NextResponse.json({
        success: false,
        message: `Insufficient funds in ${sourceAccount.bankName}. Available: Rs ${availableBalance.toLocaleString()}, Transfer: Rs ${numAmount.toLocaleString()}.`
      }, { status: 400 });
    }

    // Generate unique Transfer No
    const count = await FundTransfer.countDocuments();
    const year = new Date().getFullYear();
    const transferNo = `TRF-${year}-${String(count + 1).padStart(4, '0')}`;

    const fromAccountName = `${sourceAccount.bankName} (${sourceAccount.accountTitle})`;
    const toAccountName = `${destAccount.bankName} (${destAccount.accountTitle})`;

    const transfer = await FundTransfer.create({
      transferNo,
      fromAccountId: sourceAccount._id,
      fromAccountName,
      toAccountId: destAccount._id,
      toAccountName,
      amount: numAmount,
      date: date ? new Date(date) : new Date(),
      referenceNo: referenceNo.trim(),
      transferMethod,
      description: description.trim(),
      attachment: attachment.trim(),
      status
    });

    return NextResponse.json({
      success: true,
      message: `Successfully transferred Rs ${numAmount.toLocaleString()} from ${sourceAccount.bankName} to ${destAccount.bankName}.`,
      data: transfer
    }, { status: 201 });
  } catch (error) {
    console.error('API /fund-transfer POST error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
