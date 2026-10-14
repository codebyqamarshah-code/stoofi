import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { IDCard } from '@/lib/models';

const DEFAULT_TEMPLATES = [
  {
    title: 'Modern Emerald Vertical Badge',
    role: 'Student',
    cardLayout: 'vertical',
    themeStyle: 'stoofi-emerald',
    headerText: 'OFFICIAL STUDENT ID CARD',
    footerText: 'Principal Signature & Seal',
    showPhoto: true,
    showAdmissionNo: true,
    showRollNo: true,
    showClass: true,
    showSection: true,
    showFatherName: true,
    showPhone: true,
    showBloodGroup: false,
    showDob: true,
    showDesignation: false,
    showDepartment: false,
    showQrBarcode: true,
    status: 'Active',
    isDefault: true
  },
  {
    title: 'Staff & Employee Identity Card',
    role: 'Staff',
    cardLayout: 'vertical',
    themeStyle: 'modern-slate',
    headerText: 'STAFF IDENTITY CARD',
    footerText: 'HR & Administrative Seal',
    showPhoto: true,
    showAdmissionNo: false,
    showRollNo: false,
    showClass: false,
    showSection: false,
    showFatherName: false,
    showPhone: true,
    showBloodGroup: false,
    showDob: false,
    showDesignation: true,
    showDepartment: true,
    showQrBarcode: true,
    status: 'Active',
    isDefault: true
  },
  {
    title: 'Faculty & Teacher Smart ID Card',
    role: 'Teacher',
    cardLayout: 'vertical',
    themeStyle: 'classic-navy',
    headerText: 'FACULTY IDENTITY CARD',
    footerText: 'Director of Academics',
    showPhoto: true,
    showAdmissionNo: false,
    showRollNo: false,
    showClass: false,
    showSection: false,
    showFatherName: false,
    showPhone: true,
    showBloodGroup: false,
    showDob: false,
    showDesignation: true,
    showDepartment: true,
    showQrBarcode: true,
    status: 'Active',
    isDefault: true
  }
];

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';

    const filter = {};
    if (role && role !== 'All') filter.role = role;
    if (status && status !== 'All') filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { headerText: { $regex: search, $options: 'i' } }
      ];
    }

    let total = await IDCard.countDocuments(filter);
    if (total === 0 && Object.keys(filter).length === 0) {
      // Seed default templates if empty
      await IDCard.insertMany(DEFAULT_TEMPLATES).catch(() => null);
      total = await IDCard.countDocuments(filter);
    }

    const cards = await IDCard.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: cards,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    console.error('API /id-card error:', error);
    // Return default templates gracefully on failure
    return NextResponse.json({
      success: true,
      data: DEFAULT_TEMPLATES.map((t, idx) => ({ ...t, _id: `fallback-${idx}` })),
      pagination: {
        page: 1,
        limit: 10,
        total: DEFAULT_TEMPLATES.length,
        totalPages: 1
      }
    });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.title) {
      return NextResponse.json(
        { success: false, message: 'Card title is required.' },
        { status: 400 }
      );
    }

    const newCard = await IDCard.create(body);
    return NextResponse.json({
      success: true,
      message: 'ID Card template created successfully!',
      data: newCard
    }, { status: 201 });
  } catch (error) {
    console.error('API /id-card POST error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to create ID Card template.'
    }, { status: 500 });
  }
}
