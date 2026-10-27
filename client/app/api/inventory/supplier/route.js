import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Supplier, ItemReceive } from '@/lib/models';
import { seedInventoryIfEmpty } from '@/lib/inventoryService';

export async function GET(req) {
  try {
    await connectDB();
    await seedInventoryIfEmpty();

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('search') || '').trim();
    const status = searchParams.get('status');

    const query = {};
    if (status && status !== 'All' && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
      ];
    }

    const suppliers = await Supplier.find(query).sort({ createdAt: -1 }).lean();

    // Aggregate receipts and total value supplied
    const receiptStats = await ItemReceive.aggregate([
      { $match: { status: 'Posted' } },
      {
        $group: {
          _id: '$supplierId',
          receiptCount: { $sum: 1 },
          totalValue: { $sum: '$grandTotal' }
        }
      }
    ]);

    const statMap = {};
    receiptStats.forEach(s => {
      statMap[String(s._id)] = {
        receiptCount: s.receiptCount,
        totalValue: s.totalValue
      };
    });

    const dataWithStats = suppliers.map(sup => {
      const st = statMap[String(sup._id)] || { receiptCount: 0, totalValue: 0 };
      return {
        ...sup,
        receiptCount: st.receiptCount,
        totalReceivedValue: st.totalValue
      };
    });

    return NextResponse.json({
      success: true,
      data: dataWithStats,
      total: dataWithStats.length
    });
  } catch (error) {
    console.error('API /inventory/supplier GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const name = String(body.name || body.supplierName || '').trim();
    const phone = String(body.phone || body.phoneNumber || '').trim();

    if (!name) {
      return NextResponse.json({ success: false, message: 'Supplier name is required.' }, { status: 400 });
    }
    if (!phone) {
      return NextResponse.json({ success: false, message: 'Supplier contact phone is required.' }, { status: 400 });
    }

    let code = String(body.code || '').trim().toUpperCase();
    if (!code) {
      const count = await Supplier.countDocuments();
      code = `SUP-${String(count + 1).padStart(3, '0')}`;
    }

    const created = await Supplier.create({
      name,
      code,
      contactPerson: body.contactPerson || '',
      phone,
      email: body.email ? String(body.email).trim().toLowerCase() : '',
      address: body.address || '',
      city: body.city || 'Lahore',
      companyName: body.companyName || '',
      taxNumber: body.taxNumber || '',
      paymentTerms: body.paymentTerms || 'Net 30',
      notes: body.notes || '',
      status: body.status || 'Active'
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Supplier created successfully!'
    }, { status: 201 });
  } catch (error) {
    console.error('API /inventory/supplier POST error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
