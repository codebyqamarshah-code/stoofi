import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Certificate } from '@/lib/models';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const cert = await Certificate.findById(id).lean();

    if (!cert) {
      return NextResponse.json({ success: false, message: 'Certificate template not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: cert });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const cert = await Certificate.findById(id);
    if (!cert) {
      return NextResponse.json({ success: false, message: 'Certificate template not found' }, { status: 404 });
    }

    if (body.title && body.title.trim()) {
      if (body.title.trim().toLowerCase() !== cert.title.toLowerCase()) {
        const duplicate = await Certificate.findOne({ title: body.title.trim() });
        if (duplicate) {
          return NextResponse.json({ success: false, message: 'Another template with this title already exists' }, { status: 400 });
        }
      }
      cert.title = body.title.trim();
    }

    if (body.type && body.type.trim()) cert.type = body.type.trim();
    if (body.description !== undefined) cert.description = (body.description || '').trim();
    if (body.headerTitle !== undefined) cert.headerTitle = (body.headerTitle || '').trim();
    if (body.headerSubtitle !== undefined) cert.headerSubtitle = (body.headerSubtitle || '').trim();
    if (body.templateBody && body.templateBody.trim()) cert.templateBody = body.templateBody.trim();
    if (body.footerLeft !== undefined) cert.footerLeft = (body.footerLeft || '').trim();
    if (body.footerCenter !== undefined) cert.footerCenter = (body.footerCenter || '').trim();
    if (body.footerRight !== undefined) cert.footerRight = (body.footerRight || '').trim();
    if (body.themeStyle) cert.themeStyle = body.themeStyle;
    if (body.status) cert.status = body.status;
    if (body.showStudentPhoto !== undefined) cert.showStudentPhoto = body.showStudentPhoto;
    if (body.showAdmissionNo !== undefined) cert.showAdmissionNo = body.showAdmissionNo;
    if (body.showRollNo !== undefined) cert.showRollNo = body.showRollNo;
    if (body.showClass !== undefined) cert.showClass = body.showClass;
    if (body.showSection !== undefined) cert.showSection = body.showSection;
    if (body.showFatherName !== undefined) cert.showFatherName = body.showFatherName;
    if (body.showDob !== undefined) cert.showDob = body.showDob;
    if (body.showGender !== undefined) cert.showGender = body.showGender;
    if (body.showIssueDate !== undefined) cert.showIssueDate = body.showIssueDate;
    if (body.showQrBarcode !== undefined) cert.showQrBarcode = body.showQrBarcode;
    if (body.showSeal !== undefined) cert.showSeal = body.showSeal;
    if (body.showSignatureLeft !== undefined) cert.showSignatureLeft = body.showSignatureLeft;
    if (body.showSignatureCenter !== undefined) cert.showSignatureCenter = body.showSignatureCenter;
    if (body.showSignatureRight !== undefined) cert.showSignatureRight = body.showSignatureRight;
    if (body.showSchoolHeader !== undefined) cert.showSchoolHeader = body.showSchoolHeader;
    if (body.uploadedBackground !== undefined) cert.uploadedBackground = body.uploadedBackground;

    const updated = await cert.save();
    return NextResponse.json({ success: true, data: updated, message: 'Certificate template updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const cert = await Certificate.findById(id);
    if (!cert) {
      return NextResponse.json({ success: false, message: 'Certificate template not found' }, { status: 404 });
    }

    await Certificate.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Certificate template deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
