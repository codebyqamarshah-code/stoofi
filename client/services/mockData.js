// Centralized Realistic Seed Data for all ERP Dropdowns and Lookups

export const mockClasses = [
  { _id: 'c1', id: '1', name: 'Class 1', sections: ['A', 'B', 'C'] },
  { _id: 'c2', id: '2', name: 'Class 2', sections: ['A', 'B', 'C'] },
  { _id: 'c3', id: '3', name: 'Class 3', sections: ['A', 'B', 'C'] },
  { _id: 'c4', id: '4', name: 'Class 4', sections: ['A', 'B', 'C'] },
  { _id: 'c5', id: '5', name: 'Class 5', sections: ['A', 'B', 'C', 'D'] },
  { _id: 'c6', id: '6', name: 'Class 6', sections: ['A', 'B', 'C', 'D'] },
  { _id: 'c7', id: '7', name: 'Class 7', sections: ['A', 'B', 'C', 'D'] },
  { _id: 'c8', id: '8', name: 'Class 8', sections: ['A', 'B', 'C', 'D'] },
  { _id: 'c9', id: '9', name: 'Class 9', sections: ['A', 'B', 'C'] },
  { _id: 'c10', id: '10', name: 'Class 10', sections: ['A', 'B', 'C'] },
  { _id: 'c11', id: '11', name: 'O-Levels', sections: ['A', 'B'] },
  { _id: 'c12', id: '12', name: 'A-Levels', sections: ['A', 'B'] },
];

export const mockSections = [
  { _id: 's1', id: 'A', name: 'A' },
  { _id: 's2', id: 'B', name: 'B' },
  { _id: 's3', id: 'C', name: 'C' },
  { _id: 's4', id: 'D', name: 'D' },
];

export const mockSubjects = [
  { _id: 'sub1', id: '1', name: 'Mathematics', code: 'MATH-101', type: 'Theory' },
  { _id: 'sub2', id: '2', name: 'English Language', code: 'ENG-101', type: 'Theory' },
  { _id: 'sub3', id: '3', name: 'Urdu Literature', code: 'URD-101', type: 'Theory' },
  { _id: 'sub4', id: '4', name: 'Physics', code: 'PHY-201', type: 'Theory & Practical' },
  { _id: 'sub5', id: '5', name: 'Chemistry', code: 'CHEM-201', type: 'Theory & Practical' },
  { _id: 'sub6', id: '6', name: 'Biology', code: 'BIO-201', type: 'Theory & Practical' },
  { _id: 'sub7', id: '7', name: 'Computer Science', code: 'CS-301', type: 'Practical' },
  { _id: 'sub8', id: '8', name: 'Islamiat', code: 'ISL-101', type: 'Theory' },
  { _id: 'sub9', id: '9', name: 'Pakistan Studies', code: 'PST-101', type: 'Theory' },
  { _id: 'sub10', id: '10', name: 'General Science', code: 'GSCI-101', type: 'Theory' },
];

export const mockDepartments = [
  { _id: 'd1', id: '1', name: 'Science Department' },
  { _id: 'd2', id: '2', name: 'Mathematics Department' },
  { _id: 'd3', id: '3', name: 'English & Languages' },
  { _id: 'd4', id: '4', name: 'Computer & IT' },
  { _id: 'd5', id: '5', name: 'Administration' },
  { _id: 'd6', id: '6', name: 'Finance & Accounts' },
  { _id: 'd7', id: '7', name: 'Physical Education & Sports' },
];

export const mockDesignations = [
  { _id: 'des1', id: '1', name: 'Principal' },
  { _id: 'des2', id: '2', name: 'Vice Principal' },
  { _id: 'des3', id: '3', name: 'Senior Teacher' },
  { _id: 'des4', id: '4', name: 'Junior Teacher' },
  { _id: 'des5', id: '5', name: 'Head of Department' },
  { _id: 'des6', id: '6', name: 'Accountant' },
  { _id: 'des7', id: '7', name: 'Admin Officer' },
  { _id: 'des8', id: '8', name: 'IT Specialist' },
  { _id: 'des9', id: '9', name: 'Librarian' },
  { _id: 'des10', id: '10', name: 'Lab Assistant' },
];

export const mockStaff = [
  { _id: 'st1', staffId: 'STF-001', firstName: 'Ahmad', lastName: 'Khan', role: 'Teacher', designation: 'Senior Teacher', department: 'Science Department', phone: '0300-1122334', email: 'ahmad.khan@stoofi.edu.pk' },
  { _id: 'st2', staffId: 'STF-002', firstName: 'Fatima', lastName: 'Zahra', role: 'Teacher', designation: 'Head of Department', department: 'Mathematics Department', phone: '0301-5566778', email: 'fatima.zahra@stoofi.edu.pk' },
  { _id: 'st3', staffId: 'STF-003', firstName: 'Usman', lastName: 'Tariq', role: 'Accountant', designation: 'Accountant', department: 'Finance & Accounts', phone: '0302-9988776', email: 'usman.tariq@stoofi.edu.pk' },
];

export const mockStudents = [
  {
    _id: 'stu-101',
    admissionNo: 'ADM-2026-001',
    rollNo: '101',
    firstName: 'Muhammad',
    lastName: 'Ali',
    fatherName: 'Tariq Mahmood',
    dob: '2010-05-14',
    className: 'Class 10',
    section: 'A',
    gender: 'Male',
    phone: '0300-1234567',
    academicYear: '2026 [Jan-Dec]',
    currentAddress: 'Gulberg III, Lahore',
    permanentAddress: 'Gulberg III, Lahore',
    religion: 'Islam'
  },
  {
    _id: 'stu-102',
    admissionNo: 'ADM-2026-002',
    rollNo: '102',
    firstName: 'Ayesha',
    lastName: 'Noor',
    fatherName: 'Imran Shah',
    dob: '2011-08-20',
    className: 'Class 9',
    section: 'B',
    gender: 'Female',
    phone: '0301-9876543',
    academicYear: '2026 [Jan-Dec]',
    currentAddress: 'DHA Phase 5, Lahore',
    permanentAddress: 'DHA Phase 5, Lahore',
    religion: 'Islam'
  },
  {
    _id: 'stu-103',
    admissionNo: 'ADM-2026-003',
    rollNo: '103',
    firstName: 'Bilal',
    lastName: 'Hassan',
    fatherName: 'Kamran Hassan',
    dob: '2012-03-11',
    className: 'Class 8',
    section: 'A',
    gender: 'Male',
    phone: '0302-3344556',
    academicYear: '2026 [Jan-Dec]',
    currentAddress: 'Johar Town, Lahore',
    permanentAddress: 'Johar Town, Lahore',
    religion: 'Islam'
  },
  {
    _id: 'stu-104',
    admissionNo: 'ADM-2026-004',
    rollNo: '104',
    firstName: 'Zainab',
    lastName: 'Bibi',
    fatherName: 'Rashid Ali',
    dob: '2013-11-05',
    className: 'Class 7',
    section: 'C',
    gender: 'Female',
    phone: '0303-7788990',
    academicYear: '2026 [Jan-Dec]',
    currentAddress: 'Model Town, Lahore',
    permanentAddress: 'Model Town, Lahore',
    religion: 'Islam'
  },
  {
    _id: 'stu-105',
    admissionNo: 'ADM-2026-005',
    rollNo: '105',
    firstName: 'Hamza',
    lastName: 'Saeed',
    fatherName: 'Saeed Akhtar',
    dob: '2010-09-18',
    className: 'Class 10',
    section: 'B',
    gender: 'Male',
    phone: '0304-4455667',
    academicYear: '2026 [Jan-Dec]',
    currentAddress: 'Faisal Town, Lahore',
    permanentAddress: 'Faisal Town, Lahore',
    religion: 'Islam'
  }
];

export const mockExamTypes = [
  { _id: 'et1', id: '1', name: '1st Term Examination', title: '1st Term Examination' },
  { _id: 'et2', id: '2', name: 'Mid-Term Examination', title: 'Mid-Term Examination' },
  { _id: 'et3', id: '3', name: '2nd Term Examination', title: '2nd Term Examination' },
  { _id: 'et4', id: '4', name: 'Final Term Examination', title: 'Final Term Examination' },
  { _id: 'et5', id: '5', name: 'Monthly Assessment Test', title: 'Monthly Assessment Test' },
  { _id: 'et6', id: '6', name: 'Pre-Board Examination', title: 'Pre-Board Examination' },
];

export const mockExamGrades = [
  { _id: 'eg1', grade: 'A+', gpa: '4.0', markFrom: 90, markUpto: 100, comment: 'Outstanding' },
  { _id: 'eg2', grade: 'A', gpa: '3.7', markFrom: 80, markUpto: 89, comment: 'Excellent' },
  { _id: 'eg3', grade: 'B', gpa: '3.0', markFrom: 70, markUpto: 79, comment: 'Very Good' },
  { _id: 'eg4', grade: 'C', gpa: '2.5', markFrom: 60, markUpto: 69, comment: 'Good' },
  { _id: 'eg5', grade: 'D', gpa: '2.0', markFrom: 50, markUpto: 59, comment: 'Satisfactory' },
  { _id: 'eg6', grade: 'F', gpa: '0.0', markFrom: 0, markUpto: 49, comment: 'Failed' },
];

export const mockFeesGroups = [
  { _id: 'fg1', id: '1', name: 'Tuition Fee 2026', description: 'Regular monthly academic fee' },
  { _id: 'fg2', id: '2', name: 'Admission & Registration Fee', description: 'One-time admission charge' },
  { _id: 'fg3', id: '3', name: 'Exam Fee 2026', description: 'Semester and terminal examination fee' },
  { _id: 'fg4', id: '4', name: 'Laboratory & Computer Fee', description: 'Practical labs maintenance' },
  { _id: 'fg5', id: '5', name: 'Transport Route Fee', description: 'Monthly bus commute fare' },
  { _id: 'fg6', id: '6', name: 'Sports & Activity Fund', description: 'Annual extracurricular fund' },
];

export const mockFeesTypes = [
  { _id: 'ft1', id: '1', name: 'Monthly Tuition', code: 'TUIT-01', amount: 3500 },
  { _id: 'ft2', id: '2', name: 'Annual Admission', code: 'ADM-01', amount: 15000 },
  { _id: 'ft3', id: '3', name: 'Mid-Term Exam Fee', code: 'EXM-MID', amount: 1200 },
  { _id: 'ft4', id: '4', name: 'Final Exam Fee', code: 'EXM-FIN', amount: 1500 },
  { _id: 'ft5', id: '5', name: 'School Bus Transport', code: 'TRN-BUS', amount: 2500 },
  { _id: 'ft6', id: '6', name: 'Hostel Accommodation', code: 'HST-01', amount: 8000 },
  { _id: 'ft7', id: '7', name: 'Late Payment Fine', code: 'FINE-01', amount: 200 },
];

export const mockDormitories = [
  { _id: 'dm1', id: '1', name: 'Iqbal Hall (Boys)', type: 'Boys', capacity: 120, address: 'North Campus Wing A' },
  { _id: 'dm2', id: '2', name: 'Jinnah Hall (Boys)', type: 'Boys', capacity: 150, address: 'North Campus Wing B' },
  { _id: 'dm3', id: '3', name: 'Fatima Hall (Girls)', type: 'Girls', capacity: 100, address: 'South Campus Wing C' },
  { _id: 'dm4', id: '4', name: 'Sir Syed Hall (Boys)', type: 'Boys', capacity: 80, address: 'East Campus Wing D' },
];

export const mockDormitoryRoomTypes = [
  { _id: 'drt1', id: '1', name: 'Single AC Room', cost: 12000, description: 'Private room with attached bath and AC' },
  { _id: 'drt2', id: '2', name: 'Double AC Room', cost: 8000, description: 'Two sharing with AC and study tables' },
  { _id: 'drt3', id: '3', name: 'Standard 3-Bed Room', cost: 5500, description: 'Three sharing standard accommodation' },
  { _id: 'drt4', id: '4', name: 'Economy 4-Bed Dorm', cost: 4000, description: 'Four beds dormitory style' },
];

export const mockDormitoryRooms = [
  { _id: 'dr1', id: '1', name: 'Room 101', roomNo: '101', dormitory: 'Iqbal Hall (Boys)', roomType: 'Single AC Room', numOfBed: 1, costPerBed: 12000 },
  { _id: 'dr2', id: '2', name: 'Room 102', roomNo: '102', dormitory: 'Iqbal Hall (Boys)', roomType: 'Double AC Room', numOfBed: 2, costPerBed: 8000 },
  { _id: 'dr3', id: '3', name: 'Room 201', roomNo: '201', dormitory: 'Fatima Hall (Girls)', roomType: 'Double AC Room', numOfBed: 2, costPerBed: 8000 },
  { _id: 'dr4', id: '4', name: 'Room 202', roomNo: '202', dormitory: 'Fatima Hall (Girls)', roomType: 'Standard 3-Bed Room', numOfBed: 3, costPerBed: 5500 },
  { _id: 'dr5', id: '5', name: 'Room 301', roomNo: '301', dormitory: 'Jinnah Hall (Boys)', roomType: 'Economy 4-Bed Dorm', numOfBed: 4, costPerBed: 4000 },
];

export const mockTransportRoutes = [
  { _id: 'tr1', id: '1', name: 'Route 1: Gulberg - Model Town - Campus', routeTitle: 'Route 1: Gulberg - Model Town - Campus', fare: 2500 },
  { _id: 'tr2', id: '2', name: 'Route 2: DHA Phase 5 - Cantt - Campus', routeTitle: 'Route 2: DHA Phase 5 - Cantt - Campus', fare: 2800 },
  { _id: 'tr3', id: '3', name: 'Route 3: Johar Town - Wapda Town - Campus', routeTitle: 'Route 3: Johar Town - Wapda Town - Campus', fare: 2200 },
  { _id: 'tr4', id: '4', name: 'Route 4: Bahria Town - Thokar - Campus', routeTitle: 'Route 4: Bahria Town - Thokar - Campus', fare: 3000 },
];

export const mockTransportVehicles = [
  { _id: 'tv1', id: '1', vehicleNo: 'Bus No. 12', vehicleModel: 'Toyota Coaster (30 Seater)', driverName: 'Muhammad Aslam', driverPhone: '+92 321 4455667', driverLicense: 'LHR-88214' },
  { _id: 'tv2', id: '2', vehicleNo: 'Bus No. 15', vehicleModel: 'Hino Bus (50 Seater)', driverName: 'Ghulam Rasool', driverPhone: '+92 322 5566778', driverLicense: 'LHR-99321' },
  { _id: 'tv3', id: '3', vehicleNo: 'Van No. 04', vehicleModel: 'Toyota Hiace (15 Seater)', driverName: 'Zahid Mehmood', driverPhone: '+92 323 6677889', driverLicense: 'LHR-77142' },
  { _id: 'tv4', id: '4', vehicleNo: 'Bus No. 18', vehicleModel: 'Toyota Coaster (30 Seater)', driverName: 'Akram Sheikh', driverPhone: '+92 324 7788990', driverLicense: 'LHR-66512' },
];

export const mockBooks = [
  { _id: 'bk1', id: '1', name: 'Calculus: Early Transcendentals', bookTitle: 'Calculus: Early Transcendentals', bookNo: 'BK-1001', isbnNo: '978-0134766829', category: 'Mathematics', author: 'James Stewart', quantity: 25 },
  { _id: 'bk2', id: '2', name: 'University Physics with Modern Physics', bookTitle: 'University Physics with Modern Physics', bookNo: 'BK-1002', isbnNo: '978-0135159552', category: 'Science & Technology', author: 'Hugh D. Young', quantity: 18 },
  { _id: 'bk3', id: '3', name: 'Fundamentals of Chemistry', bookTitle: 'Fundamentals of Chemistry', bookNo: 'BK-1003', isbnNo: '978-0078021510', category: 'Science & Technology', author: 'Raymond Chang', quantity: 20 },
  { _id: 'bk4', id: '4', name: 'English Grammar in Use', bookTitle: 'English Grammar in Use', bookNo: 'BK-1004', isbnNo: '978-1108457651', category: 'English Literature', author: 'Raymond Murphy', quantity: 35 },
  { _id: 'bk5', id: '5', name: 'Introduction to Algorithms', bookTitle: 'Introduction to Algorithms', bookNo: 'BK-1005', isbnNo: '978-0262033848', category: 'Computer Science', author: 'Thomas H. Cormen', quantity: 15 },
  { _id: 'bk6', id: '6', name: 'A Brief History of Time', bookTitle: 'A Brief History of Time', bookNo: 'BK-1006', isbnNo: '978-0553380163', category: 'General Knowledge', author: 'Stephen Hawking', quantity: 12 },
];

export const mockBookCategories = [
  { _id: 'bc1', id: '1', name: 'Science & Technology', categoryName: 'Science & Technology' },
  { _id: 'bc2', id: '2', name: 'Mathematics & Statistics', categoryName: 'Mathematics & Statistics' },
  { _id: 'bc3', id: '3', name: 'English Literature & Grammar', categoryName: 'English Literature & Grammar' },
  { _id: 'bc4', id: '4', name: 'Islamic Studies & Ethics', categoryName: 'Islamic Studies & Ethics' },
  { _id: 'bc5', id: '5', name: 'Computer Science & IT', categoryName: 'Computer Science & IT' },
  { _id: 'bc6', id: '6', name: 'General Knowledge & Encyclopedias', categoryName: 'General Knowledge & Encyclopedias' },
];

export const mockLeaveTypes = [
  { _id: 'lt1', id: '1', name: 'Casual Leave', type: 'Casual', days: 12 },
  { _id: 'lt2', id: '2', name: 'Medical / Sick Leave', type: 'Medical', days: 15 },
  { _id: 'lt3', id: '3', name: 'Annual Leave', type: 'Annual', days: 30 },
  { _id: 'lt4', id: '4', name: 'Maternity Leave', type: 'Maternity', days: 90 },
  { _id: 'lt5', id: '5', name: 'Study Leave', type: 'Study', days: 60 },
  { _id: 'lt6', id: '6', name: 'Emergency Leave', type: 'Emergency', days: 5 },
];

export const mockClassRooms = [
  { _id: 'cr1', id: '1', roomNo: 'Room 101', capacity: 40, description: 'Ground Floor Room 101' },
  { _id: 'cr2', id: '2', roomNo: 'Room 102', capacity: 40, description: 'Ground Floor Room 102' },
  { _id: 'cr3', id: '3', roomNo: 'Room 201', capacity: 45, description: 'First Floor Room 201' },
  { _id: 'cr4', id: '4', roomNo: 'Room 202', capacity: 45, description: 'First Floor Room 202' },
  { _id: 'cr5', id: '5', roomNo: 'Physics Lab', capacity: 35, description: 'Second Floor Science Wing' },
  { _id: 'cr6', id: '6', roomNo: 'Computer Lab 1', capacity: 50, description: 'First Floor IT Wing' },
];

export const mockBankAccounts = [
  { _id: 'ba1', id: '1', accountName: 'Meezan Bank - Main Fee Account', bankName: 'Meezan Bank Ltd', accountNumber: '0102-003849102', branch: 'Gulberg Branch' },
  { _id: 'ba2', id: '2', accountName: 'HBL - Operational Account', bankName: 'Habib Bank Limited', accountNumber: '2201-998231405', branch: 'Mall Road Branch' },
  { _id: 'ba3', id: '3', accountName: 'Allied Bank - Salary Account', bankName: 'Allied Bank Limited', accountNumber: '1104-554620109', branch: 'Model Town Branch' },
];

export const mockItemCategories = [
  { _id: 'ic1', id: '1', name: 'Stationery & Printing', categoryName: 'Stationery & Printing' },
  { _id: 'ic2', id: '2', name: 'Computer Hardware & Networking', categoryName: 'Computer Hardware & Networking' },
  { _id: 'ic3', id: '3', name: 'Laboratory Equipment & Chemicals', categoryName: 'Laboratory Equipment & Chemicals' },
  { _id: 'ic4', id: '4', name: 'Classroom & Office Furniture', categoryName: 'Classroom & Office Furniture' },
  { _id: 'ic5', id: '5', name: 'Sports Goods & Fitness Kits', categoryName: 'Sports Goods & Fitness Kits' },
];

export const mockQuestionGroups = [
  { _id: 'qg1', id: '1', name: 'Mathematics Objective MCQs', title: 'Mathematics Objective MCQs' },
  { _id: 'qg2', id: '2', name: 'Physics Numerical & Theory', title: 'Physics Numerical & Theory' },
  { _id: 'qg3', id: '3', name: 'English Reading Comprehension', title: 'English Reading Comprehension' },
  { _id: 'qg4', id: '4', name: 'Chemistry Formula & Reactions', title: 'Chemistry Formula & Reactions' },
  { _id: 'qg5', id: '5', name: 'General Science Fundamental Qs', title: 'General Science Fundamental Qs' },
];

export const mockCertificates = [
  { _id: 'crt1', id: '1', name: 'Character Certificate', title: 'Character Certificate', type: 'Student' },
  { _id: 'crt2', id: '2', name: 'School Leaving Certificate (SLC)', title: 'School Leaving Certificate', type: 'Student' },
  { _id: 'crt3', id: '3', name: 'Academic Merit Certificate', title: 'Academic Merit Certificate', type: 'Student' },
  { _id: 'crt4', id: '4', name: 'Experience Certificate', title: 'Experience Certificate', type: 'Staff' },
];

export const mockIdCards = [
  { _id: 'idc1', id: '1', name: 'Student Smart ID Card 2026', title: 'Student Smart ID Card 2026', role: 'Student' },
  { _id: 'idc2', id: '2', name: 'Faculty & Teacher ID Card', title: 'Faculty & Teacher ID Card', role: 'Teacher' },
  { _id: 'idc3', id: '3', name: 'Staff Identification Card', title: 'Staff Identification Card', role: 'Staff' },
];

export const mockDashboardStats = {
  stats: {
    students: { total: 0, male: 0, female: 0, malePercent: 0, femalePercent: 0 },
    teachers: 0,
    parents: 0,
    staffs: 0,
    attendance: {
      studentsPresent: 0,
      studentsTotal: 0,
      staffPresent: 0,
      staffTotal: 0,
      studentAttPercent: 0,
      staffAttPercent: 0
    },
    fees: {
      totalIncome: 0,
      totalExpenses: 0,
      totalProfit: 0,
      totalFees: 0,
      collectedFees: 0,
      collectionPercentage: 0
    }
  },
  charts: {
    monthly: [
      { day: '01', income: 0, expense: 0 },
      { day: '05', income: 0, expense: 0 },
      { day: '10', income: 0, expense: 0 },
      { day: '15', income: 0, expense: 0 },
      { day: '20', income: 0, expense: 0 },
      { day: '25', income: 0, expense: 0 },
      { day: '30', income: 0, expense: 0 },
    ],
    yearly: [
      { month: 'Jan', income: 0, expense: 0 },
      { month: 'Feb', income: 0, expense: 0 },
      { month: 'Mar', income: 0, expense: 0 },
      { month: 'Apr', income: 0, expense: 0 },
      { month: 'May', income: 0, expense: 0 },
      { month: 'Jun', income: 0, expense: 0 },
      { month: 'Jul', income: 0, expense: 0 },
      { month: 'Aug', income: 0, expense: 0 },
      { month: 'Sep', income: 0, expense: 0 },
      { month: 'Oct', income: 0, expense: 0 },
      { month: 'Nov', income: 0, expense: 0 },
      { month: 'Dec', income: 0, expense: 0 },
    ]
  },
  notices: [],
  todos: []
};

export const mockAuthUser = {
  _id: 'super-admin-001',
  username: 'Super Admin',
  email: 'admin@stoofi.com',
  role: 'Super Admin',
  fullName: 'Administrator'
};

export const mockHomework = [];

export const mockFeesInvoices = [
  {
    _id: 'inv-101',
    invoiceNo: 'INV-2026-001',
    student: 'Muhammad Ali',
    admissionNo: 'ADM-2026-001',
    className: 'Class 10 (A)',
    feeType: 'Tuition Fee 2026',
    amount: 15000,
    waiver: 1000,
    fine: 0,
    paid: 14000,
    balance: 0,
    status: 'PAID',
    paymentMethod: 'Cash',
    date: '2026-09-01'
  },
  {
    _id: 'inv-102',
    invoiceNo: 'INV-2026-002',
    student: 'Ayesha Noor',
    admissionNo: 'ADM-2026-002',
    className: 'Class 9 (B)',
    feeType: 'Tuition Fee 2026',
    amount: 14000,
    waiver: 0,
    fine: 500,
    paid: 10000,
    balance: 4500,
    status: 'PARTIAL',
    paymentMethod: 'Online Bank Transfer',
    date: '2026-09-03'
  },
  {
    _id: 'inv-103',
    invoiceNo: 'INV-2026-003',
    student: 'Bilal Hassan',
    admissionNo: 'ADM-2026-003',
    className: 'Class 8 (A)',
    feeType: 'Admission & Registration Fee',
    amount: 25000,
    waiver: 2000,
    fine: 0,
    paid: 23000,
    balance: 0,
    status: 'PAID',
    paymentMethod: 'Cash',
    date: '2026-09-05'
  },
  {
    _id: 'inv-104',
    invoiceNo: 'INV-2026-004',
    student: 'Zainab Bibi',
    admissionNo: 'ADM-2026-004',
    className: 'Class 7 (C)',
    feeType: 'Exam Fee 2026',
    amount: 8000,
    waiver: 0,
    fine: 0,
    paid: 0,
    balance: 8000,
    status: 'UNPAID',
    paymentMethod: 'Pending',
    date: '2026-09-07'
  }
];

export const mockAdminQueries = [
  { _id: 'aq1', name: 'Zahid Mehmood', phone: '+92 321 9876543', email: 'zahid@gmail.com', source: 'Website', date: '2026-09-03', status: 'Follow Up' },
  { _id: 'aq2', name: 'Rashid Minhas', phone: '+92 333 4567890', email: 'rashid@yahoo.com', source: 'Walk In', date: '2026-09-04', status: 'Converted' },
];

export const mockComplaints = [];

export const mockVisitors = [];

export const mockCalls = [];

export const mockPostal = [];

export const mockLmsCourses = [
  { _id: 'lms1', title: 'Full Stack Web Development (MERN)', category: 'Computer Science', instructor: 'Jessica Pearson', price: 0, status: 'Published', studentsCount: 145 },
  { _id: 'lms2', title: 'Cambridge O-Level Physics Complete', category: 'Science', instructor: 'Sarah Connor', price: 0, status: 'Published', studentsCount: 98 },
  { _id: 'lms3', title: 'Mathematics Olympiad Mastery', category: 'Mathematics', instructor: 'John Doe', price: 0, status: 'Published', studentsCount: 112 },
];

export const mockLmsCategories = [
  { _id: 'cat1', title: 'Computer Science & IT', totalCourses: 6 },
  { _id: 'cat2', title: 'Mathematics & Logic', totalCourses: 4 },
  { _id: 'cat3', title: 'Natural Sciences', totalCourses: 5 },
  { _id: 'cat4', title: 'Languages & Communication', totalCourses: 3 },
];

export const mockOnlineExams = [];

export const mockAttendanceRecords = [];

export const endpointMockMap = {
  '/auth/me': mockAuthUser,
  '/student': mockStudents,
  '/staff': mockStaff,
  '/class': mockClasses,
  '/section': mockSections,
  '/subject': mockSubjects,
  '/department': mockDepartments,
  '/Department': mockDepartments,
  '/designation': mockDesignations,
  '/exam-type': mockExamTypes,
  '/exam-grade': mockExamGrades,
  '/exam-setup': mockExamTypes,
  '/marks-register': mockExamGrades,
  '/fees/group': mockFeesGroups,
  '/fees/type': mockFeesTypes,
  '/fees-invoice': mockFeesInvoices,
  '/dormitory': mockDormitories,
  '/dormitory-room-type': mockDormitoryRoomTypes,
  '/dormitory-room': mockDormitoryRooms,
  '/transport-route': mockTransportRoutes,
  '/transport-vehicle': mockTransportVehicles,
  '/transport-assign': mockTransportRoutes,
  '/book': mockBooks,
  '/book-category': mockBookCategories,
  '/issue-book': mockBooks,
  '/library-subject': mockSubjects,
  '/library-member': [...mockStaff, ...mockStudents],
  '/leave': mockLeaveTypes,
  '/leave-type': mockLeaveTypes,
  '/leave-define': mockLeaveTypes,
  '/classroom': mockClassRooms,
  '/bank-account': mockBankAccounts,
  '/bank-payment': mockBankAccounts,
  '/chart-of-account': mockBankAccounts,
  '/fund-transfer': [],
  '/income': [],
  '/expense': [],
  '/payroll': mockStaff,
  '/item-category': mockItemCategories,
  '/question-group': mockQuestionGroups,
  '/question-bank': mockQuestionGroups,
  '/certificate': mockCertificates,
  '/id-card': mockIdCards,
  '/admission-query': mockAdminQueries,
  '/complaint': mockComplaints,
  '/visitor-book': mockVisitors,
  '/phone-call-log': mockCalls,
  '/postal-dispatch': mockPostal,
  '/postal-receive': mockPostal,
  '/homework': mockHomework,
  '/lms-category': mockLmsCategories,
  '/lms-course': mockLmsCourses,
  '/lms-course-level': [{ id: '1', name: 'Beginner' }, { id: '2', name: 'Intermediate' }, { id: '3', name: 'Advanced' }],
  '/lms-enroll-history': [],
  '/lms-fees-invoice': mockFeesInvoices,
  '/lms-purchase-log': [],
  '/online-exam': mockOnlineExams,
  '/sms-sending-time': [],
  '/staff-attendance': mockStaff,
  '/student-attendance': mockAttendanceRecords,
  '/teacher-evaluation/approved': mockStaff,
  '/teacher-evaluation/pending': mockStaff,
  '/teacher-evaluation/teacher-wise': mockStaff,
  '/setup': {},
  '/whatsapp/contacts': mockStaff,
};

