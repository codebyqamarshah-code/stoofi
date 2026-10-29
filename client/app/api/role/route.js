import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Role } from '@/lib/models';

export const dynamic = 'force-dynamic';

const DEFAULT_SYSTEM_ROLES = [
  { name: 'Super Admin', type: 'System', permissions: ['all'] },
  { name: 'Admin', type: 'System', permissions: ['View Staff', 'Add Staff', 'Edit Staff', 'View Students', 'Add Students', 'Collect Fees', 'View Fees'] },
  { name: 'Teacher', type: 'System', permissions: ['View Students', 'Manage Classes', 'Manage Subjects', 'Manage Exams', 'View Results', 'View Courses'] },
  { name: 'Accountant', type: 'System', permissions: ['View Fees', 'Collect Fees', 'Generate Invoice', 'View Reports', 'Manage Expenses'] },
  { name: 'Librarian', type: 'System', permissions: ['View Books', 'Add Books', 'Issue Books', 'Return Books', 'Manage Members'] }
];

export async function GET() {
  try {
    await connectDB();
    let roles = await Role.find().sort({ createdAt: 1 }).lean();
    if (!roles || roles.length === 0) {
      // Seed default system roles if collection is completely empty
      try {
        await Role.insertMany(DEFAULT_SYSTEM_ROLES);
        roles = await Role.find().sort({ createdAt: 1 }).lean();
      } catch (_) {}
    }
    return NextResponse.json({ success: true, data: roles || [] });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    if (!body.name || !String(body.name).trim()) {
      return NextResponse.json({ success: false, message: 'Role name is required' }, { status: 400 });
    }
    const existing = await Role.findOne({ name: { $regex: new RegExp(`^${body.name.trim()}$`, 'i') } });
    if (existing) {
      return NextResponse.json({ success: false, message: 'A role with this name already exists' }, { status: 400 });
    }
    const created = await Role.create(body);
    return NextResponse.json({ success: true, data: created, message: 'Role created successfully' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
