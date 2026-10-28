import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { AdminSetup } from '@/lib/models';

export async function GET(req) {
  try {
    await connectDB();
    const [total, active, inactive, categories] = await Promise.all([
      AdminSetup.countDocuments(),
      AdminSetup.countDocuments({ status: 'Active' }),
      AdminSetup.countDocuments({ status: 'Inactive' }),
      AdminSetup.distinct('type')
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        total,
        active,
        inactive,
        totalCategories: categories.length
      }
    });
  } catch (error) {
    console.error('API /setup/stats GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
