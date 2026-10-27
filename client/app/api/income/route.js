import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Income, BankAccount, ChartOfAccount } from '@/lib/models';

export const SAMPLE_INCOMES = [
  {
    receiptNo: 'INC-2026-0001',
    title: 'Admissions & Prospectus Collection — Batch 2026',
    amount: 125000,
    categoryName: 'Admission & Prospectus Fees',
    bankAccountName: 'Habib Bank Limited (HBL)',
    date: new Date('2026-10-15'),
    paymentMethod: 'Bank Transfer',
    referenceNo: 'HBL-DEP-89021',
    payerName: 'New Admissions Desk',
    payerContact: '+92 300 1234567',
    description: 'Registration fee and admission prospectus receipts for Allied Health Sciences & F.Sc OTT',
    status: 'Received',
    createdByName: 'Accounts Officer'
  },
  {
    receiptNo: 'INC-2026-0002',
    title: 'Philanthropic Merit Scholarship Grant',
    amount: 200000,
    categoryName: 'Donations, Grants & Sponsorships',
    bankAccountName: 'Meezan Bank Limited',
    date: new Date('2026-10-18'),
    paymentMethod: 'Cheque',
    referenceNo: 'CHQ-MEEZAN-9921',
    payerName: 'Al-Khidmat Educational Trust',
    payerContact: '+92 42 35789012',
    description: 'Annual scholarship endowment grant for deserving nursing and medical diploma students',
    status: 'Received',
    createdByName: 'Accounts Officer'
  },
  {
    receiptNo: 'INC-2026-0003',
    title: 'Midterm Examination & Board Clearance Dues',
    amount: 85000,
    categoryName: 'Examination & Certification Charges',
    bankAccountName: 'Campus Cash in Safe',
    date: new Date('2026-10-22'),
    paymentMethod: 'Cash',
    referenceNo: 'CSH-RECEIPT-4410',
    payerName: 'Student Clearance Counter',
    payerContact: '+92 311 4448100',
    description: 'Practical exam charges and verification challan payments received over counter',
    status: 'Received',
    createdByName: 'Accounts Officer'
  },
  {
    receiptNo: 'INC-2026-0004',
    title: 'Campus Cafeteria & Bookshop Concession Revenue',
    amount: 35000,
    categoryName: 'Cafeteria, Uniform & Bookshop Revenue',
    bankAccountName: 'Campus Cash in Safe',
    date: new Date('2026-10-24'),
    paymentMethod: 'Cash',
    referenceNo: 'CONC-OCT-26',
    payerName: 'Campus Bookshop Vendor',
    payerContact: '+92 321 8899001',
    description: 'Monthly commercial license and vendor concession share for October 2026',
    status: 'Received',
    createdByName: 'Accounts Officer'
  }
];

async function seedDefaultIncomesIfEmpty() {
  try {
    const count = await Income.countDocuments();
    if (count === 0) {
      const [hbl, meezan, cash] = await Promise.all([
        BankAccount.findOne({ bankName: { $regex: 'Habib', $options: 'i' } }),
        BankAccount.findOne({ bankName: { $regex: 'Meezan', $options: 'i' } }),
        BankAccount.findOne({ bankName: { $regex: 'Cash', $options: 'i' } })
      ]);

      const [admCat, donCat, examCat, cafeCat] = await Promise.all([
        ChartOfAccount.findOne({ accountCode: '4020' }),
        ChartOfAccount.findOne({ accountCode: '4040' }),
        ChartOfAccount.findOne({ accountCode: '4030' }),
        ChartOfAccount.findOne({ accountCode: '4050' })
      ]);

      const items = [
        { ...SAMPLE_INCOMES[0], bankAccountId: hbl?._id, categoryId: admCat?._id },
        { ...SAMPLE_INCOMES[1], bankAccountId: meezan?._id, categoryId: donCat?._id },
        { ...SAMPLE_INCOMES[2], bankAccountId: cash?._id, categoryId: examCat?._id },
        { ...SAMPLE_INCOMES[3], bankAccountId: cash?._id, categoryId: cafeCat?._id }
      ];

      for (const item of items) {
        await Income.create(item);
      }
    }
  } catch (e) {
    console.error('Error auto-seeding Incomes:', e.message);
  }
}

export async function GET(req) {
  try {
    await connectDB();
    await seedDefaultIncomesIfEmpty();

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
        { receiptNo: searchRegex },
        { referenceNo: searchRegex },
        { payerName: searchRegex },
        { categoryName: searchRegex },
        { bankAccountName: searchRegex }
      ];
    }

    // Calculate Summary Stats
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalAgg, todayAgg, monthAgg, pendingCount, totalRecords] = await Promise.all([
      Income.aggregate([
        { $match: { status: 'Received' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Income.aggregate([
        { $match: { status: 'Received', date: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Income.aggregate([
        { $match: { status: 'Received', date: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Income.countDocuments({ status: 'Pending' }),
      Income.countDocuments(filter)
    ]);

    const stats = {
      totalRecognized: totalAgg[0]?.total || 0,
      receivedToday: todayAgg[0]?.total || 0,
      receivedThisMonth: monthAgg[0]?.total || 0,
      pendingCount: pendingCount || 0
    };

    const skip = (page - 1) * limit;
    const data = await Income.find(filter)
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
    console.error('API /income GET error:', error);
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
      referenceNo = '',
      payerName = '',
      payerContact = '',
      description = '',
      attachment = '',
      status = 'Received'
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, message: 'Income title is required.' }, { status: 400 });
    }
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ success: false, message: 'Valid amount greater than zero is required.' }, { status: 400 });
    }

    // Resolve Bank Account Name
    let resolvedBankName = bankAccountName;
    if (bankAccountId) {
      const bank = await BankAccount.findById(bankAccountId);
      if (bank) resolvedBankName = `${bank.bankName} (${bank.accountTitle})`;
    }

    // Resolve Category Name
    let resolvedCatName = categoryName;
    if (categoryId) {
      const coa = await ChartOfAccount.findById(categoryId);
      if (coa) resolvedCatName = coa.accountName;
    }

    // Generate unique Receipt No
    const count = await Income.countDocuments();
    const year = new Date().getFullYear();
    const receiptNo = `INC-${year}-${String(count + 1).padStart(4, '0')}`;

    const newIncome = await Income.create({
      receiptNo,
      title: title.trim(),
      amount: numAmount,
      categoryId: categoryId || null,
      categoryName: resolvedCatName || 'General Revenue',
      bankAccountId: bankAccountId || null,
      bankAccountName: resolvedBankName || 'Cash in Safe',
      date: date ? new Date(date) : new Date(),
      paymentMethod,
      referenceNo: referenceNo.trim(),
      payerName: payerName.trim(),
      payerContact: payerContact.trim(),
      description: description.trim(),
      attachment: attachment.trim(),
      status
    });

    return NextResponse.json({
      success: true,
      message: 'Income record created successfully!',
      data: newIncome
    }, { status: 201 });
  } catch (error) {
    console.error('API /income POST error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
