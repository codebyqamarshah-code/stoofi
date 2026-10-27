import { Staff } from '@/lib/models';

export const STAFF_SEED = [
  {
    staffNo: 'PRC-STF-001',
    firstName: 'Dr. Tariq',
    lastName: 'Mehmood',
    role: 'Principal',
    department: 'Executive Administration',
    designation: 'Principal & Professor of Health Sciences',
    basicSalary: 150000,
    salary: 185000,
    allowances: 35000,
    deductions: 7500,
    email: 'principal@pakroyalcollege.edu.pk',
    phone: '0300-4123456',
    cnic: '35202-1234567-1',
    gender: 'Male',
    dateOfJoining: '2020-01-15',
    bankName: 'Habib Bank Limited (HBL)',
    accountNo: '01234567890123',
    status: 'Active'
  },
  {
    staffNo: 'PRC-STF-002',
    firstName: 'Prof. Aslam',
    lastName: 'Pervez',
    role: 'Teacher',
    department: 'Academic Operations',
    designation: 'Vice Principal & Senior Professor',
    basicSalary: 120000,
    salary: 145000,
    allowances: 25000,
    deductions: 5000,
    email: 'aslam.pervez@pakroyalcollege.edu.pk',
    phone: '0301-5234567',
    cnic: '35202-2345678-3',
    gender: 'Male',
    dateOfJoining: '2021-03-01',
    bankName: 'Meezan Bank',
    accountNo: '02345678901234',
    status: 'Active'
  },
  {
    staffNo: 'PRC-STF-003',
    firstName: 'Dr. Saima',
    lastName: 'Akram',
    role: 'Teacher',
    department: 'Behavioral Sciences & Psychology',
    designation: 'Head of Department (BS Psychology)',
    basicSalary: 95000,
    salary: 115000,
    allowances: 20000,
    deductions: 4000,
    email: 'saima.akram@pakroyalcollege.edu.pk',
    phone: '0302-6345678',
    cnic: '35202-3456789-2',
    gender: 'Female',
    dateOfJoining: '2022-08-15',
    bankName: 'Bank Alfalah',
    accountNo: '03456789012345',
    status: 'Active'
  },
  {
    staffNo: 'PRC-STF-004',
    firstName: 'Dr. Usman',
    lastName: 'Ghani',
    role: 'Teacher',
    department: 'Allied Health Sciences',
    designation: 'Lead Instructor (F.Sc Operation Theater)',
    basicSalary: 90000,
    salary: 110000,
    allowances: 20000,
    deductions: 3800,
    email: 'usman.ghani@pakroyalcollege.edu.pk',
    phone: '0303-7456789',
    cnic: '35202-4567890-5',
    gender: 'Male',
    dateOfJoining: '2022-09-01',
    bankName: 'Allied Bank Limited',
    accountNo: '04567890123456',
    status: 'Active'
  },
  {
    staffNo: 'PRC-STF-005',
    firstName: 'Sister Maryam',
    lastName: 'Bibi',
    role: 'Teacher',
    department: 'Nursing & Patient Care',
    designation: 'Clinical Nursing Supervisor',
    basicSalary: 80000,
    salary: 98000,
    allowances: 18000,
    deductions: 3200,
    email: 'maryam.bibi@pakroyalcollege.edu.pk',
    phone: '0304-8567890',
    cnic: '35202-5678901-4',
    gender: 'Female',
    dateOfJoining: '2023-01-10',
    bankName: 'MCB Bank',
    accountNo: '05678901234567',
    status: 'Active'
  },
  {
    staffNo: 'PRC-STF-006',
    firstName: 'Engr. Salman',
    lastName: 'Farooq',
    role: 'Teacher',
    department: 'Radiology & Imaging',
    designation: 'Senior Lecturer (BS RIT)',
    basicSalary: 85000,
    salary: 104000,
    allowances: 19000,
    deductions: 3500,
    email: 'salman.farooq@pakroyalcollege.edu.pk',
    phone: '0305-9678901',
    cnic: '35202-6789012-7',
    gender: 'Male',
    dateOfJoining: '2023-02-15',
    bankName: 'Faysal Bank',
    accountNo: '06789012345678',
    status: 'Active'
  },
  {
    staffNo: 'PRC-STF-007',
    firstName: 'Muhammad',
    lastName: 'Rizwan',
    role: 'Accountant',
    department: 'Finance & Accounts',
    designation: 'Chief Accountant & Bursar',
    basicSalary: 75000,
    salary: 92000,
    allowances: 17000,
    deductions: 3000,
    email: 'accounts@pakroyalcollege.edu.pk',
    phone: '0306-0789012',
    cnic: '35202-7890123-9',
    gender: 'Male',
    dateOfJoining: '2021-06-01',
    bankName: 'Habib Bank Limited (HBL)',
    accountNo: '07890123456789',
    status: 'Active'
  },
  {
    staffNo: 'PRC-STF-008',
    firstName: 'Prof. Arshad',
    lastName: 'Nadeem',
    role: 'Admin',
    department: 'Examination Branch',
    designation: 'Controller of Examinations',
    basicSalary: 100000,
    salary: 122000,
    allowances: 22000,
    deductions: 4200,
    email: 'exams@pakroyalcollege.edu.pk',
    phone: '0307-1890123',
    cnic: '35202-8901234-1',
    gender: 'Male',
    dateOfJoining: '2020-08-01',
    bankName: 'National Bank of Pakistan (NBP)',
    accountNo: '08901234567890',
    status: 'Active'
  },
  {
    staffNo: 'PRC-STF-009',
    firstName: 'Ms. Sadia',
    lastName: 'Khalid',
    role: 'Staff',
    department: 'Library Services',
    designation: 'Head Librarian',
    basicSalary: 55000,
    salary: 66000,
    allowances: 11000,
    deductions: 2000,
    email: 'library@pakroyalcollege.edu.pk',
    phone: '0308-2901234',
    cnic: '35202-9012345-6',
    gender: 'Female',
    dateOfJoining: '2023-04-01',
    bankName: 'United Bank Limited (UBL)',
    accountNo: '09012345678901',
    status: 'Active'
  },
  {
    staffNo: 'PRC-STF-010',
    firstName: 'Muhammad',
    lastName: 'Bilal',
    role: 'Staff',
    department: 'Science & Computer Laboratories',
    designation: 'Senior Laboratory Technologist',
    basicSalary: 45000,
    salary: 54000,
    allowances: 9000,
    deductions: 1500,
    email: 'labs@pakroyalcollege.edu.pk',
    phone: '0309-3012345',
    cnic: '35202-0123456-8',
    gender: 'Male',
    dateOfJoining: '2023-06-01',
    bankName: 'Askari Bank',
    accountNo: '10123456789012',
    status: 'Active'
  }
];

export function getSeededStaffRecords() {
  return STAFF_SEED;
}

export async function ensureStaffRosterSeeded() {
  try {
    const existingStaffCount = await Staff.countDocuments({ staffNo: { $regex: /^PRC-STF-/ } });
    if (existingStaffCount === 0) {
      for (const stf of STAFF_SEED) {
        await Staff.findOneAndUpdate(
          { staffNo: stf.staffNo },
          { $set: stf },
          { upsert: true, returnDocument: 'after' }
        );
      }
    }
    return true;
  } catch (err) {
    console.error('Client staff roster seed error:', err);
    return false;
  }
}
