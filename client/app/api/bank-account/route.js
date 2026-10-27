import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { BankAccount, ChartOfAccount, Income, Expense, FundTransfer } from '@/lib/models';
import { calculateAccountLiveBalance } from '@/lib/accountCalculations';

export const DEFAULT_BANK_ACCOUNTS = [
  {
    bankName: 'Meezan Bank Limited',
    accountTitle: 'Pak Royal College — Main Campus Account',
    accountNumber: '0102-0103456789',
    branchName: 'Sharaqpur Sharif Branch',
    branchCode: '0102',
    accountType: 'Current',
    openingBalance: 500000,
    currentBalance: 500000,
    currency: 'PKR',
    description: 'Main institutional operational account for vendor payments, payroll and fee deposits',
    status: 'Active'
  },
  {
    bankName: 'Habib Bank Limited (HBL)',
    accountTitle: 'Pak Royal College — Fee Collection Account',
    accountNumber: '1204-7890123456',
    branchName: 'Main Jaranwala Road Branch',
    branchCode: '1204',
    accountType: 'Current',
    openingBalance: 250000,
    currentBalance: 250000,
    currency: 'PKR',
    description: 'Designated account for student challan fees, admission vouchers and bank transfers',
    status: 'Active'
  },
  {
    bankName: 'Bank Alfalah',
    accountTitle: 'Pak Royal College — Faculty Payroll Account',
    accountNumber: '0045-9876543210',
    branchName: 'Civil Lines Sheikhupura',
    branchCode: '0045',
    accountType: 'Current',
    openingBalance: 150000,
    currentBalance: 150000,
    currency: 'PKR',
    description: 'Dedicated account for faculty monthly salary disbursements and operational reserves',
    status: 'Active'
  },
  {
    bankName: 'Campus Cash in Safe',
    accountTitle: 'Cashier & Principal Petty Cash Reserve',
    accountNumber: '0000-PETTY-CASH',
    branchName: 'Campus Accounts Office',
    branchCode: '0000',
    accountType: 'Cash Account',
    openingBalance: 50000,
    currentBalance: 50000,
    currency: 'PKR',
    description: 'On-premises physical vault cash for daily urgent campus operational expenses',
    status: 'Active'
  }
];

async function seedDefaultBankAccountsIfEmpty() {
  try {
    const count = await BankAccount.countDocuments();
    if (count === 0) {
      for (const item of DEFAULT_BANK_ACCOUNTS) {
        // Link to matching Chart of Account if possible
        const coa = await ChartOfAccount.findOne({ accountName: { $regex: item.bankName.slice(0, 5), $options: 'i' } });
        await BankAccount.create({
          ...item,
          chartOfAccountId: coa?._id || null
        });
      }
    }
  } catch (e) {
    console.error('Error auto-seeding Bank Accounts:', e.message);
  }
}

// calculateAccountLiveBalance imported from '@/lib/accountCalculations'

export async function GET(req) {
  try {
    await connectDB();
    await seedDefaultBankAccountsIfEmpty();

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('search') || '').trim();
    const status = (searchParams.get('status') || '').trim();
    const type = (searchParams.get('type') || '').trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '50', 10));
    const all = searchParams.get('all') === 'true';

    const filter = {};
    if (status && status !== 'All') filter.status = status;
    if (type && type !== 'All') filter.accountType = type;
    if (search) {
      filter.$or = [
        { bankName: { $regex: search, $options: 'i' } },
        { accountTitle: { $regex: search, $options: 'i' } },
        { accountNumber: { $regex: search, $options: 'i' } },
        { branchName: { $regex: search, $options: 'i' } }
      ];
    }

    const accounts = await BankAccount.find(filter)
      .sort({ createdAt: 1 })
      .populate('chartOfAccountId', 'accountCode accountName')
      .lean();

    // Recompute live balances for all matching accounts
    const enrichedAccounts = await Promise.all(
      accounts.map(async (acc) => {
        const liveBal = await calculateAccountLiveBalance(acc._id, acc.openingBalance);
        return {
          ...acc,
          currentBalance: liveBal,
          maskedAccountNumber: acc.accountNumber && acc.accountNumber.length > 4
            ? `••••-••••-${acc.accountNumber.slice(-4)}`
            : acc.accountNumber
        };
      })
    );

    const totalAccounts = enrichedAccounts.length;
    const activeAccounts = enrichedAccounts.filter(a => a.status === 'Active').length;
    const totalOpeningBalance = enrichedAccounts.reduce((sum, a) => sum + (Number(a.openingBalance) || 0), 0);
    const totalCurrentBalance = enrichedAccounts.reduce((sum, a) => sum + (Number(a.currentBalance) || 0), 0);

    const stats = {
      totalAccounts,
      activeAccounts,
      totalOpeningBalance,
      totalCurrentBalance
    };

    if (all) {
      return NextResponse.json({ success: true, data: enrichedAccounts, stats });
    }

    const skip = (page - 1) * limit;
    const paginated = enrichedAccounts.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      data: paginated,
      stats,
      pagination: {
        total: totalAccounts,
        page,
        limit,
        totalPages: Math.ceil(totalAccounts / limit) || 1
      }
    });
  } catch (error) {
    console.error('API /bank-account GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      bankName,
      accountTitle,
      accountNumber,
      branchName = '',
      branchCode = '',
      accountType = 'Current',
      chartOfAccountId = null,
      openingBalance = 0,
      currency = 'PKR',
      description = '',
      status = 'Active'
    } = body;

    if (!bankName || !bankName.trim()) {
      return NextResponse.json({ success: false, message: 'Bank Name is required.' }, { status: 400 });
    }
    if (!accountTitle || !accountTitle.trim()) {
      return NextResponse.json({ success: false, message: 'Account Title is required.' }, { status: 400 });
    }
    if (!accountNumber || !accountNumber.trim()) {
      return NextResponse.json({ success: false, message: 'Account Number is required.' }, { status: 400 });
    }

    const exists = await BankAccount.findOne({ accountNumber: accountNumber.trim() });
    if (exists) {
      return NextResponse.json({ success: false, message: `Account with number "${accountNumber}" already exists.` }, { status: 400 });
    }

    const newAccount = await BankAccount.create({
      bankName: bankName.trim(),
      accountTitle: accountTitle.trim(),
      accountNumber: accountNumber.trim(),
      branchName: branchName.trim(),
      branchCode: branchCode.trim(),
      accountType,
      chartOfAccountId: chartOfAccountId || null,
      openingBalance: Number(openingBalance) || 0,
      openingBalanceDate: new Date(),
      currentBalance: Number(openingBalance) || 0,
      currency,
      description: description.trim(),
      status
    });

    return NextResponse.json({
      success: true,
      message: 'Bank account added successfully!',
      data: newAccount
    }, { status: 201 });
  } catch (error) {
    console.error('API /bank-account POST error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
