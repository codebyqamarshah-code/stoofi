import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ChartOfAccount } from '@/lib/models';

export const DEFAULT_CHART_OF_ACCOUNTS = [
  // Assets
  { accountCode: '1010', accountName: 'Cash in Safe / Petty Cash', accountType: 'Asset', openingBalance: 50000, currentBalance: 50000, description: 'Campus on-hand cash reserve and daily petty transactions', isSystem: true },
  { accountCode: '1020', accountName: 'Meezan Bank — Operational A/C', accountType: 'Asset', openingBalance: 500000, currentBalance: 500000, description: 'Primary institutional account for collections and disbursements', isSystem: true },
  { accountCode: '1030', accountName: 'HBL — Student Fee Collection A/C', accountType: 'Asset', openingBalance: 250000, currentBalance: 250000, description: 'Challan fee deposits and admission collections', isSystem: true },
  { accountCode: '1040', accountName: 'Accounts Receivable', accountType: 'Asset', openingBalance: 0, currentBalance: 0, description: 'Pending student dues and receivables', isSystem: true },
  // Liabilities
  { accountCode: '2010', accountName: 'Accounts Payable / Vendor Dues', accountType: 'Liability', openingBalance: 0, currentBalance: 0, description: 'Outstanding invoices for vendors and contractors', isSystem: true },
  { accountCode: '2020', accountName: 'Advance Student Fees', accountType: 'Liability', openingBalance: 0, currentBalance: 0, description: 'Prepaid term and annual fees', isSystem: true },
  // Equity
  { accountCode: '3010', accountName: 'Institutional Capital & Reserve Fund', accountType: 'Equity', openingBalance: 800000, currentBalance: 800000, description: 'Founding capital and permanent academic reserves', isSystem: true },
  // Income
  { accountCode: '4010', accountName: 'Tuition & Academic Program Fees', accountType: 'Income', openingBalance: 0, currentBalance: 0, description: 'Regular student tuition and course charges', isSystem: true },
  { accountCode: '4020', accountName: 'Admission & Prospectus Fees', accountType: 'Income', openingBalance: 0, currentBalance: 0, description: 'New enrollments, registration, and prospectus sales', isSystem: true },
  { accountCode: '4030', accountName: 'Examination & Certification Charges', accountType: 'Income', openingBalance: 0, currentBalance: 0, description: 'Term exams, board clearance, and degree verifications', isSystem: true },
  { accountCode: '4040', accountName: 'Donations, Grants & Sponsorships', accountType: 'Income', openingBalance: 0, currentBalance: 0, description: 'Philanthropic support and merit scholarship funds', isSystem: true },
  { accountCode: '4050', accountName: 'Cafeteria, Uniform & Bookshop Revenue', accountType: 'Income', openingBalance: 0, currentBalance: 0, description: 'Auxiliary campus revenue', isSystem: true },
  { accountCode: '4060', accountName: 'Miscellaneous Revenue', accountType: 'Income', openingBalance: 0, currentBalance: 0, description: 'Other unclassified income receipts', isSystem: true },
  // Expenses
  { accountCode: '5010', accountName: 'Faculty & Administrative Salaries', accountType: 'Expense', openingBalance: 0, currentBalance: 0, description: 'Monthly teaching staff, administration and guard payroll', isSystem: true },
  { accountCode: '5020', accountName: 'Campus Electricity, Gas & Utilities', accountType: 'Expense', openingBalance: 0, currentBalance: 0, description: 'WAPDA electricity, generator diesel and gas bills', isSystem: true },
  { accountCode: '5030', accountName: 'Building Rent & Campus Maintenance', accountType: 'Expense', openingBalance: 0, currentBalance: 0, description: 'Facility rent, civil repair, paint and sanitation', isSystem: true },
  { accountCode: '5040', accountName: 'Laboratory Equipment & Science Supplies', accountType: 'Expense', openingBalance: 0, currentBalance: 0, description: 'OTT, nursing, chemistry and biology lab consumables', isSystem: true },
  { accountCode: '5050', accountName: 'Printing, Stationery & Examination Papers', accountType: 'Expense', openingBalance: 0, currentBalance: 0, description: 'Office paper, badges, registers, and test papers', isSystem: true },
  { accountCode: '5060', accountName: 'Marketing, Banners & Social Advertising', accountType: 'Expense', openingBalance: 0, currentBalance: 0, description: 'Admission campaign flexes, social media and ads', isSystem: true },
  { accountCode: '5070', accountName: 'Student Sports, Events & Extracurriculars', accountType: 'Expense', openingBalance: 0, currentBalance: 0, description: 'Annual gala, trophies, tournaments and welcome parties', isSystem: true }
];

async function seedDefaultAccountsIfEmpty() {
  try {
    const count = await ChartOfAccount.countDocuments();
    if (count === 0) {
      for (const item of DEFAULT_CHART_OF_ACCOUNTS) {
        await ChartOfAccount.create(item);
      }
    }
  } catch (e) {
    console.error('Error auto-seeding Chart of Accounts:', e.message);
  }
}

export async function GET(req) {
  try {
    await connectDB();
    await seedDefaultAccountsIfEmpty();

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('search') || '').trim();
    const type = (searchParams.get('type') || '').trim();
    const status = (searchParams.get('status') || '').trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '50', 10));
    const all = searchParams.get('all') === 'true';

    const filter = {};
    if (type && type !== 'All') filter.accountType = type;
    if (status && status !== 'All') filter.status = status;
    if (search) {
      filter.$or = [
        { accountCode: { $regex: search, $options: 'i' } },
        { accountName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const [total, assetCount, liabilityCount, equityCount, incomeCount, expenseCount] = await Promise.all([
      ChartOfAccount.countDocuments(filter),
      ChartOfAccount.countDocuments({ accountType: 'Asset' }),
      ChartOfAccount.countDocuments({ accountType: 'Liability' }),
      ChartOfAccount.countDocuments({ accountType: 'Equity' }),
      ChartOfAccount.countDocuments({ accountType: 'Income' }),
      ChartOfAccount.countDocuments({ accountType: 'Expense' })
    ]);

    const stats = {
      totalAccounts: total,
      assetAccounts: assetCount,
      liabilityAccounts: liabilityCount,
      equityAccounts: equityCount,
      incomeAccounts: incomeCount,
      expenseAccounts: expenseCount
    };

    if (all) {
      const data = await ChartOfAccount.find(filter).sort({ accountCode: 1 }).lean();
      return NextResponse.json({ success: true, data, stats });
    }

    const skip = (page - 1) * limit;
    const data = await ChartOfAccount.find(filter)
      .sort({ accountCode: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data,
      stats,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    console.error('API /chart-of-account GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      accountCode,
      accountName,
      accountType,
      parentAccount = null,
      description = '',
      openingBalance = 0,
      status = 'Active'
    } = body;

    if (!accountCode || !accountCode.trim()) {
      return NextResponse.json({ success: false, message: 'Unique Account Code is required.' }, { status: 400 });
    }
    if (!accountName || !accountName.trim()) {
      return NextResponse.json({ success: false, message: 'Account Name is required.' }, { status: 400 });
    }
    if (!accountType) {
      return NextResponse.json({ success: false, message: 'Account Type is required.' }, { status: 400 });
    }

    const exists = await ChartOfAccount.findOne({ accountCode: accountCode.trim() });
    if (exists) {
      return NextResponse.json({ success: false, message: `Account code "${accountCode}" already exists.` }, { status: 400 });
    }

    const newAccount = await ChartOfAccount.create({
      accountCode: accountCode.trim(),
      accountName: accountName.trim(),
      accountType,
      parentAccount: parentAccount || null,
      description: description.trim(),
      openingBalance: Number(openingBalance) || 0,
      currentBalance: Number(openingBalance) || 0,
      status,
      isSystem: false
    });

    return NextResponse.json({
      success: true,
      message: 'Account created successfully in Chart of Accounts!',
      data: newAccount
    }, { status: 201 });
  } catch (error) {
    console.error('API /chart-of-account POST error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
