import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Setting } from '@/lib/models';

const OFFICIAL_COLLEGE_ADDRESS = 'Lal Puli Stop Main Jaranwala Road Sharaqpur Sharif District Sheikhupura';

const DEFAULT_SETTINGS = {
  schoolName: 'Pak Royal College Sharaqpur',
  schoolCode: 'PRC-001',
  phone: '03 111 444 810',
  email: 'info@pakroyalcollege.edu.pk',
  address: OFFICIAL_COLLEGE_ADDRESS,
  schoolLogo: '/pak-royal-college-logo.png',
  currency: 'PKR',
  currencySymbol: 'Rs.',
  academicYear: '2026',
  academicYears: [
    { year: '2025', title: '2025 [Jan-Dec]', start: '2025-01-01', end: '2025-12-31', active: false },
    { year: '2026', title: '2026 [Jan-Dec]', start: '2026-01-01', end: '2026-12-31', active: true }
  ],
  session: '2026',
  sessionStartMonth: 'January',
  dateFormat: 'DD/MM/YYYY',
  language: 'English',
  timezone: 'Asia/Karachi',
  tagline: 'Excellence in Higher Education & Career Readiness',
  footerText: '© 2026 Pak Royal College Sharaqpur Sharif. All Rights Reserved.',
  website: 'https://pakroyalcollege.edu.pk',
  examRule: {
    skipExamSchedule: false,
    skipExamAttendance: false,
    meritListBy: 'Roll Number',
    resultWithProfileImage: true,
    resultWithHeaderBg: true,
    resultWithBodyBg: true,
    resultWithVerticalBorder: false,
    cbt: '0',
    firstTerm: '0'
  },
  feeInvoiceSettings: {
    prefix: 'PRC',
    uniqueIdStart: '001',
    classLimit: '3',
    sectionLimit: '1',
    admissionNoLimit: '4',
    tags: [
      { id: 'prefix', label: 'prefix' },
      { id: 'admission', label: 'Admission No' },
      { id: 'class', label: 'Class' },
      { id: 'section', label: 'Section' }
    ]
  },
  weekendSettings: [
    { id: 1, name: 'Saturday', isWeekend: true },
    { id: 2, name: 'Sunday', isWeekend: true },
    { id: 3, name: 'Monday', isWeekend: false },
    { id: 4, name: 'Tuesday', isWeekend: false },
    { id: 5, name: 'Wednesday', isWeekend: false },
    { id: 6, name: 'Thursday', isWeekend: false },
    { id: 7, name: 'Friday', isWeekend: false }
  ],
  emailSettings: {
    driver: 'smtp',
    fromName: 'Pak Royal College',
    fromEmail: 'info@pakroyalcollege.edu.pk',
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUsername: 'info@pakroyalcollege.edu.pk',
    smtpPassword: '',
    encryption: 'tls',
    status: 'Active'
  },
  smsSettings: {
    provider: 'twilio',
    apiKey: '',
    apiSecret: '',
    senderId: 'PRC-ALERT',
    receiverNumber: '+923111444810',
    status: 'Active'
  },
  paymentSettings: {
    gateways: {
      Cash: true,
      Bank: true,
      JazzCash: true,
      EasyPaisa: true,
      Safepay: true,
      Stripe: false,
      PayPal: false
    },
    bankDetails: {
      bankName: 'Habib Bank Limited (HBL)',
      accountTitle: 'Pak Royal College Sharaqpur',
      accountNumber: '01234567890123',
      iban: 'PK36HABB0000123456789012',
      branchCode: '0452'
    },
    jazzcashDetails: {
      merchantId: '',
      password: '',
      hashKey: ''
    },
    easypaisaDetails: {
      storeId: '',
      hashKey: ''
    }
  },
  twoFactorSettings: {
    enabled: false,
    method: 'email',
    enforceForRoles: ['Super Admin', 'Admin']
  }
};

export async function GET() {
  try {
    await connectDB();
    let setting = await Setting.findOne({}).lean();
    if (!setting) {
      setting = await Setting.create(DEFAULT_SETTINGS);
      return NextResponse.json({ success: true, data: setting.toObject ? setting.toObject() : setting });
    }

    // Merge default fields for any keys not yet stored
    const merged = { ...DEFAULT_SETTINGS, ...setting };
    if (!merged.address || merged.address.includes('Sharaqpur')) {
      merged.address = OFFICIAL_COLLEGE_ADDRESS;
    }
    return NextResponse.json({ success: true, data: merged });
  } catch (error) {
    console.error('API /setting GET error:', error);
    return NextResponse.json({
      success: true,
      data: DEFAULT_SETTINGS
    });
  }
}

export async function POST(req) {
  return handleUpdate(req);
}

export async function PUT(req) {
  return handleUpdate(req);
}

export async function PATCH(req) {
  return handleUpdate(req);
}

async function handleUpdate(req) {
  try {
    await connectDB();
    const body = await req.json();

    let setting = await Setting.findOne({});
    if (!setting) {
      setting = await Setting.create({ ...DEFAULT_SETTINGS, ...body });
    } else {
      // Merge all top-level keys
      for (const [key, value] of Object.entries(body)) {
        if (value !== undefined) {
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            setting[key] = { ...(setting[key] || {}), ...value };
          } else {
            setting[key] = value;
          }
        }
      }
      setting.markModified && setting.markModified('examRule');
      setting.markModified && setting.markModified('feeInvoiceSettings');
      setting.markModified && setting.markModified('studentFieldSettings');
      setting.markModified && setting.markModified('staffFieldSettings');
      setting.markModified && setting.markModified('emailSettings');
      setting.markModified && setting.markModified('smsSettings');
      setting.markModified && setting.markModified('paymentSettings');
      setting.markModified && setting.markModified('weekendSettings');
      setting.markModified && setting.markModified('twoFactorSettings');
      setting.markModified && setting.markModified('customFieldsStudent');
      setting.markModified && setting.markModified('customFieldsStaff');
      setting.markModified && setting.markModified('baseSetups');
      setting.markModified && setting.markModified('themeSettings');
      await setting.save();
    }

    return NextResponse.json({
      success: true,
      data: setting,
      message: 'Settings saved successfully!'
    });
  } catch (error) {
    console.error('API /setting UPDATE error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}
