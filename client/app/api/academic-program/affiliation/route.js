import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Affiliation } from '@/lib/models';
import { ensureAcademicHierarchySeeded } from '@/lib/academicSeed.service';

export async function GET() {
  try {
    await connectDB();
    await ensureAcademicHierarchySeeded();
    const affiliations = await Affiliation.find().sort({ name: 1 }).lean();
    return NextResponse.json({ success: true, data: affiliations });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, code, type, approvalReference, verificationEvidence, validityFrom, validityTo, contactPerson, contactPhone, contactEmail, address, authorizationStatus, isActive } = body;
    if (!name || !code) {
      return NextResponse.json({ success: false, message: 'Name and Code are required.' }, { status: 400 });
    }
    const aff = await Affiliation.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      type: type || 'Technical Board',
      approvalReference: approvalReference || '',
      verificationEvidence: verificationEvidence || '',
      validityFrom: validityFrom || '',
      validityTo: validityTo || '',
      contactPerson: contactPerson || '',
      contactPhone: contactPhone || '',
      contactEmail: contactEmail || '',
      address: address || '',
      authorizationStatus: authorizationStatus || 'Approved',
      isActive: isActive !== false
    });
    return NextResponse.json({ success: true, data: aff }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
