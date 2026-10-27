import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Expense, BankAccount, ChartOfAccount } from '@/lib/models';
import { calculateAccountLiveBalance } from '@/lib/accountCalculations';

export const SAMPLE_EXPENSES = [
  {
    voucherNo: 'EXP-2026-0001',
    title: 'Faculty & Allied Health Instructor Monthly Honorarium',
    amount: 180000,
    categoryName: 'Faculty & Administrative Salaries',
    bankAccountName: 'Bank Alfalah',
    date: new Date('2026-10-10'),
    paymentMethod: 'Bank Transfer',
    payeeName: 'Academic Staff Payroll',
    invoiceNo: 'PAY-OCT-2026',
    referenceNo: 'BA-TRF-00192',
    description: 'Faculty honoraria and clinical practical instructors monthly compensation',
    status: 'Paid',
    createdByName: 'Finance Manager'
  },
  {
    voucherNo: 'EXP-2026-0002',
    title: 'WAPDA Commercial Electricity & Generator Fuel',
    amount: 65000,
    categoryName: 'Campus Electricity, Gas & Utilities',
    bankAccountName: 'Meezan Bank Limited',
    date: new Date('2026-10-12'),
    paymentMethod: 'Bank Transfer',
    payeeName: 'LESCO / Local Fuel Supplier',
    invoiceNo: 'UTIL-LESCO-8812',
    referenceNo: 'MZN-EPAY-4412',
    description: 'September-October campus electricity bill and backup generator diesel filling',
    status: 'Paid',
    createdByName: 'Admin Officer'
  },
  {
    voucherNo: 'EXP-2026-0003',
    title: 'Operation Theater Lab & Disposable Medical Kits',
    amount: 42000,
    categoryName: 'Laboratory Equipment & Science Supplies',
    bankAccountName: 'Campus Cash in Safe',
    date: new Date('2026-10-16'),
    paymentMethod: 'Cash',
    payeeName: 'Surgical Instruments & Scientific Supplies Lahore',
    invoiceNo: 'INV-SURG-771',
    referenceNo: 'CSH-VOUCH-312',
    description: 'Sterilization packs, suture needles, gloves, and dissection instruments for OTT practicals',
    status: 'Paid',
    createdByName: 'Lab In-Charge'
  },
  {
    voucherNo: 'EXP-2026-0004',
    title: 'Term Examination Answer Sheets & Student ID Badge Printing',
    amount: 28000,
    categoryName: 'Printing, Stationery & Examination Papers',
    bankAccountName: 'Campus Cash in Safe',
    date: new Date('2026-10-21'),
    paymentMethod: 'Cash',
    payeeName: 'Royal Press Sheikhupura',
    invoiceNo: 'INV-PRINT-904',
    referenceNo: 'CSH-VOUCH-319',
    description: 'Printed student answer booklets, attendance registers and plastic ID smart cards',
    status: 'Paid',
    createdByName: 'Examinations Officer'
  }
];

async function seedDefaultExpensesIfEmpty() {
  try {
    const count = await Expense.countDocuments();
    if (count === 0) {
      const [alfalah, meezan, cash] = await Promise.all([
        BankAccount.findOne({ bankName: { $regex: 'Alfalah', $options: 'i' } }),
        BankAccount.findOne({ bankName: { $regex: 'Meezan', $options: 'i' } }),
        BankAccount.findOne({ bankName: { $regex: 'Cash', $options: 'i' } })
      ]);

      const [salCat, utilCat, labCat, printCat] = await Promise.all([
        ChartOfAccount.findOne({ accountCode: '5010' }),
        ChartOfAccount.findOne({ accountCode: '5020' }),
        ChartOfAccount.findOne({ accountCode: '5040' }),
        ChartOfAccount.findOne({ accountCode: '5050' })
      ]);

      const items = [
        { ...SAMPLE_EXPENSES[0], bankAccountId: alfalah?._id, categoryId: salCat?._id },
        { ...SAMPLE_EXPENSES[1], bankAccountId: meezan?._id, categoryId: utilCat?._id },
        { ...SAMPLE_EXPENSES[2], bankAccountId: cash?._id, categoryId: labCat?._id },
        { ...SAMPLE_EXPENSES[3], bankAccountId: cash?._id, categoryId: printCat?._id }
      ];

      for (const item of items) {
        await Expense.create(item);
      }
    }
  } catch (e) {
    console.error('Error auto-seeding Expenses:', e.message);
  }
}

export async function GET(req) {
  try {
    await connectDB();
    await seedDefaultExpensesIfEmpty();

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('search') || '').trim();
    const category = (searchParams.get('category') || '').trim();
    const paymentMethod = (searchParams.get('paymentMethod') || '').trim();
    const bankAccountId = (searchParams.get('bankAccountId') || '').trim();
    const status = (searchParams.get('status') || '').trim();
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '20', 10));

    const filter = {};

    if (category && category !== 'All') {
      filter.$or = [{ categoryName: category }, { categoryId: category }];
    }
    if (paymentMethod && paymentMethod !== 'All') {
      filter.paymentMethod = paymentMethod;
    }
    if (bankAccountId && bankAccountId !== 'All') {
      filter.bankAccountId = bankAccountId;
    }
    if (status && status !== 'All') {
      filter.status = status;
    }

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
        { title: searchRegex },
        { voucherNo: searchRegex },
        { referenceNo: searchRegex },
        { invoiceNo: searchRegex },
        { payeeName: searchRegex },
        { categoryName: searchRegex },
        { bankAccountName: searchRegex }
      ];
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalAgg, todayAgg, monthAgg, pendingCount, totalRecords] = await Promise.all([
      Expense.aggregate([
        { $match: { status: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: { status: 'Paid', date: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: { status: 'Paid', date: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.countDocuments({ status: 'Pending' }),
      Expense.countDocuments(filter)
    ]);

    const stats = {
      totalRecognized: totalAgg[0]?.total || 0,
      expensesToday: todayAgg[0]?.total || 0,
      expensesThisMonth: monthAgg[0]?.total || 0,
      pendingCount: pendingCount || 0
    };

    const skip = (page - 1) * limit;
    const data = await Expense.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data,
      stats,
      pagination: {
        total: totalRecords,
        page,
        limit,
        totalPages: Math.ceil(totalRecords / limit) || 1
      }
    });
  } catch (error) {
    console.error('API /expense GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      title,
      amount,
      categoryId,
      categoryName = '',
      bankAccountId,
      bankAccountName = '',
      date = new Date(),
      paymentMethod = 'Cash',
      payeeName = '',
      invoiceNo = '',
      referenceNo = '',
      description = '',
      attachment = '',
      status = 'Paid'
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, message: 'Expense title is required.' }, { status: 400 });
    }
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ success: false, message: 'Valid amount greater than zero is required.' }, { status: 400 });
    }

    // Resolve Bank Account Name & check sufficient balance
    let resolvedBankName = bankAccountName;
    if (bankAccountId) {
      const bank = await BankAccount.findById(bankAccountId);
      if (bank) {
        resolvedBankName = `${bank.bankName} (${bank.accountTitle})`;
        if (status === 'Paid') {
          const liveBal = await calculateAccountLiveBalance(bank._id, bank.openingBalance);
          if (liveBal < numAmount) {
            return NextResponse.json({
              success: false,
              message: `Insufficient funds in ${bank.bankName}. Available: Rs ${liveBal.toLocaleString()}, Required: Rs ${numAmount.toLocaleString()}.`
            }, { status: 400 });
          }
        }
      }
    }

    // Resolve Category Name
    let resolvedCatName = categoryName;
    if (categoryId) {
      const coa = await ChartOfAccount.findById(categoryId);
      if (coa) resolvedCatName = coa.accountName;
    }

    // Generate unique Voucher No
    const count = await Expense.countDocuments();
    const year = new Date().getFullYear();
    const voucherNo = `EXP-${year}-${String(count + 1).padStart(4, '0')}`;

    const newExpense = await Expense.create({
      voucherNo,
      title: title.trim(),
      amount: numAmount,
      categoryId: categoryId || null,
      categoryName: resolvedCatName || 'General Operating Expense',
      bankAccountId: bankAccountId || null,
      bankAccountName: resolvedBankName || 'Cash in Safe',
      date: date ? new Date(date) : new Date(),
      paymentMethod,
      payeeName: payeeName.trim(),
      invoiceNo: invoiceNo.trim(),
      referenceNo: referenceNo.trim(),
      description: description.trim(),
      attachment: attachment.trim(),
      status
    });

    return NextResponse.json({
      success: true,
      message: 'Expense record created successfully!',
      data: newExpense
    }, { status: 201 });
  } catch (error) {
    console.error('API /expense POST error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
