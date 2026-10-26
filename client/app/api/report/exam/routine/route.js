import { NextResponse } from 'next/server';

const ROUTINE_DATA = {
  'FSC OTT': [
    { paperNo: 1, date: '2026-11-10', day: 'Tuesday', time: '09:00 AM - 12:00 PM', code: 'OTT-101', subject: 'Operation Theater Techniques & Sterilization', hall: 'Hall A (Medical Block)', maxMarks: 100, invigilator: 'Dr. Usman Ghani' },
    { paperNo: 2, date: '2026-11-12', day: 'Thursday', time: '09:00 AM - 12:00 PM', code: 'ANAT-101', subject: 'Surgical Anatomy & Human Physiology', hall: 'Hall A (Medical Block)', maxMarks: 100, invigilator: 'Prof. Aslam Pervez' },
    { paperNo: 3, date: '2026-11-16', day: 'Monday', time: '09:00 AM - 12:00 PM', code: 'ANES-101', subject: 'Anesthesia Principles & Pharmacology', hall: 'Hall B (Main Block)', maxMarks: 100, invigilator: 'Dr. Tariq Mehmood' },
    { paperNo: 4, date: '2026-11-18', day: 'Wednesday', time: '09:00 AM - 12:00 PM', code: 'ENG-101', subject: 'English Communication Skills', hall: 'Hall B (Main Block)', maxMarks: 100, invigilator: 'Prof. Arshad Nadeem' },
    { paperNo: 5, date: '2026-11-20', day: 'Friday', time: '08:30 AM - 11:30 AM', code: 'ISL-101', subject: 'Islamic Studies / Ethics', hall: 'Hall A (Medical Block)', maxMarks: 100, invigilator: 'Ms. Sadia Khalid' }
  ],
  'BS Psychology': [
    { paperNo: 1, date: '2026-11-09', day: 'Monday', time: '01:30 PM - 04:30 PM', code: 'PSY-101', subject: 'Introduction to Behavioral Psychology', hall: 'Auditorium Hall', maxMarks: 100, invigilator: 'Dr. Saima Akram' },
    { paperNo: 2, date: '2026-11-11', day: 'Wednesday', time: '01:30 PM - 04:30 PM', code: 'PSY-102', subject: 'Biological Basis of Human Behavior', hall: 'Auditorium Hall', maxMarks: 100, invigilator: 'Prof. Aslam Pervez' },
    { paperNo: 3, date: '2026-11-13', day: 'Friday', time: '02:00 PM - 05:00 PM', code: 'STAT-101', subject: 'Statistics in Behavioral Sciences', hall: 'Lab Complex 2', maxMarks: 100, invigilator: 'Muhammad Bilal' },
    { paperNo: 4, date: '2026-11-17', day: 'Tuesday', time: '01:30 PM - 04:30 PM', code: 'ENG-102', subject: 'Academic Reading & Scientific Writing', hall: 'Auditorium Hall', maxMarks: 100, invigilator: 'Prof. Arshad Nadeem' },
    { paperNo: 5, date: '2026-11-19', day: 'Thursday', time: '01:30 PM - 04:30 PM', code: 'PAK-101', subject: 'Pakistan Studies & Constitutional History', hall: 'Auditorium Hall', maxMarks: 100, invigilator: 'Ms. Sadia Khalid' }
  ],
  'BS RIT': [
    { paperNo: 1, date: '2026-11-10', day: 'Tuesday', time: '09:00 AM - 12:00 PM', code: 'RIT-101', subject: 'Radiation Physics & Radiobiology', hall: 'Radiology Seminar Hall', maxMarks: 100, invigilator: 'Engr. Salman Farooq' },
    { paperNo: 2, date: '2026-11-12', day: 'Thursday', time: '09:00 AM - 12:00 PM', code: 'RIT-102', subject: 'Radiographic Anatomy & Positioning', hall: 'Radiology Seminar Hall', maxMarks: 100, invigilator: 'Dr. Tariq Mehmood' },
    { paperNo: 3, date: '2026-11-16', day: 'Monday', time: '09:00 AM - 12:00 PM', code: 'RIT-103', subject: 'Clinical Imaging Modalities (CT / MRI)', hall: 'Radiology Seminar Hall', maxMarks: 100, invigilator: 'Dr. Usman Ghani' },
    { paperNo: 4, date: '2026-11-18', day: 'Wednesday', time: '09:00 AM - 12:00 PM', code: 'ENG-101', subject: 'Technical & Medical English', hall: 'Hall B', maxMarks: 100, invigilator: 'Prof. Arshad Nadeem' }
  ],
  'FSC Nursing': [
    { paperNo: 1, date: '2026-11-09', day: 'Monday', time: '09:00 AM - 12:00 PM', code: 'NUR-101', subject: 'Fundamentals of Nursing & Clinical Care', hall: 'Nursing Skills Lab', maxMarks: 100, invigilator: 'Sister Maryam Bibi' },
    { paperNo: 2, date: '2026-11-11', day: 'Wednesday', time: '09:00 AM - 12:00 PM', code: 'ANAT-102', subject: 'Human Anatomy & Physiology', hall: 'Hall A', maxMarks: 100, invigilator: 'Prof. Aslam Pervez' },
    { paperNo: 3, date: '2026-11-13', day: 'Friday', time: '08:30 AM - 11:30 AM', code: 'MICRO-101', subject: 'Microbiology & Infection Control', hall: 'Nursing Skills Lab', maxMarks: 100, invigilator: 'Dr. Saima Akram' },
    { paperNo: 4, date: '2026-11-17', day: 'Tuesday', time: '09:00 AM - 12:00 PM', code: 'ENG-101', subject: 'English Communication', hall: 'Hall B', maxMarks: 100, invigilator: 'Prof. Arshad Nadeem' }
  ]
};

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const className = searchParams.get('className') || 'FSC OTT';
    const examTerm = searchParams.get('examTerm') || 'Final Examination 2026';

    const schedule = ROUTINE_DATA[className] || ROUTINE_DATA['FSC OTT'];

    return NextResponse.json({
      success: true,
      className,
      examTerm,
      session: 'Session 2026-2028',
      centerCode: 'PRC-EXAM-CTR-01',
      centerName: 'Pak Royal College Main Examination Center, Sharaqpur Sharif',
      instructions: [
        'Candidates must carry original Student College ID Card and Roll Number Slip.',
        'Entry into examination hall is strictly barred 15 minutes after paper commencement.',
        'Mobile phones, programmable calculators, and smartwatches are strictly prohibited.',
        'Candidates must use blue or black ballpoint pen only on official examination answer books.'
      ],
      data: schedule
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
