import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Setting } from '@/lib/models';

const DEFAULT_BASE_SETUP = [
  { group: 'Gender', items: ['Male', 'Female', 'Other'], expanded: true },
  { group: 'Religion', items: ['Islam', 'Christianity', 'Hinduism', 'Sikhism'], expanded: false },
  { group: 'Blood Group', items: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], expanded: false },
  { group: 'Category', items: ['General', 'OBC', 'SC', 'ST', 'Special Quota'], expanded: false },
  { group: 'Caste', items: ['Syed', 'Rajput', 'Jat', 'Arain', 'Sheikh', 'Malik', 'Gujjar'], expanded: false },
  { group: 'Marital Status', items: ['Single', 'Married', 'Widowed', 'Divorced'], expanded: false }
];

export async function GET() {
  try {
    await connectDB();
    const setting = await Setting.findOne({}).lean();
    const data = (setting?.baseSetups && setting.baseSetups.length > 0) ? setting.baseSetups : DEFAULT_BASE_SETUP;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API /base-setup GET error:', error);
    return NextResponse.json({ success: true, data: DEFAULT_BASE_SETUP });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const { group, name } = await req.json();

    if (!group || !name || !String(name).trim()) {
      return NextResponse.json({ success: false, message: 'Group and Name are required' }, { status: 400 });
    }

    let setting = await Setting.findOne({});
    if (!setting) {
      setting = await Setting.create({ baseSetups: DEFAULT_BASE_SETUP });
    }

    let currentList = (setting.baseSetups && setting.baseSetups.length > 0) ? setting.baseSetups : DEFAULT_BASE_SETUP;
    const cleanName = String(name).trim();

    const existingGroupIndex = currentList.findIndex(g => g.group.toLowerCase() === group.toLowerCase());
    if (existingGroupIndex >= 0) {
      const currentItems = currentList[existingGroupIndex].items || [];
      if (!currentItems.includes(cleanName)) {
        currentList[existingGroupIndex].items.push(cleanName);
      }
    } else {
      currentList.push({ group, items: [cleanName], expanded: true });
    }

    setting.baseSetups = currentList;
    setting.markModified('baseSetups');
    await setting.save();

    return NextResponse.json({
      success: true,
      data: currentList,
      message: 'Base setup item added successfully'
    });
  } catch (error) {
    console.error('API /base-setup POST error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Error saving base setup' }, { status: 500 });
  }
}
