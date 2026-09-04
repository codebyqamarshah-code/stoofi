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
  { _id: 'st1', id: '1', name: 'Mudassir Bajwa', fullName: 'Mudassir Bajwa', email: 'mudassir@eskooly.edu', phone: '+92 300 1234567', role: 'Teacher', designation: 'Senior Teacher', department: 'Mathematics Department' },
  { _id: 'st2', id: '2', name: 'Fatima Zahra', fullName: 'Fatima Zahra', email: 'fatima.zahra@eskooly.edu', phone: '+92 301 2345678', role: 'Teacher', designation: 'Head of Department', department: 'Science Department' },
  { _id: 'st3', id: '3', name: 'Muhammad Ali', fullName: 'Muhammad Ali', email: 'muhammad.ali@eskooly.edu', phone: '+92 302 3456789', role: 'Teacher', designation: 'Senior Teacher', department: 'Science Department' },
  { _id: 'st4', id: '4', name: 'Ahmed Khan', fullName: 'Ahmed Khan', email: 'ahmed.khan@eskooly.edu', phone: '+92 303 4567890', role: 'Teacher', designation: 'Senior Teacher', department: 'English & Languages' },
  { _id: 'st5', id: '5', name: 'Ayesha Noor', fullName: 'Ayesha Noor', email: 'ayesha.noor@eskooly.edu', phone: '+92 304 5678901', role: 'Staff', designation: 'Admin Officer', department: 'Administration' },
  { _id: 'st6', id: '6', name: 'Dr. Bilal Siddiqui', fullName: 'Dr. Bilal Siddiqui', email: 'bilal.siddiqui@eskooly.edu', phone: '+92 305 6789012', role: 'Principal', designation: 'Vice Principal', department: 'Administration' },
  { _id: 'st7', id: '7', name: 'Usman Tariq', fullName: 'Usman Tariq', email: 'usman.tariq@eskooly.edu', phone: '+92 306 7890123', role: 'Accountant', designation: 'Accountant', department: 'Finance & Accounts' },
  { _id: 'st8', id: '8', name: 'Zainab Bibi', fullName: 'Zainab Bibi', email: 'zainab.bibi@eskooly.edu', phone: '+92 307 8901234', role: 'Librarian', designation: 'Librarian', department: 'Administration' },
  { _id: 'st9', id: '9', name: 'Hamza Raza', fullName: 'Hamza Raza', email: 'hamza.raza@eskooly.edu', phone: '+92 308 9012345', role: 'Staff', designation: 'IT Specialist', department: 'Computer & IT' },
  { _id: 'st10', id: '10', name: 'Tariq Mehmood', fullName: 'Tariq Mehmood', email: 'tariq.mehmood@eskooly.edu', phone: '+92 309 0123456', role: 'Staff', designation: 'Sports Instructor', department: 'Physical Education & Sports' },
];

export const mockStudents = [
  { _id: 'stu1', id: '1', firstName: 'Muhammad', lastName: 'Rayyan', name: 'Muhammad Rayyan', fullName: 'Muhammad Rayyan', admissionNo: 'ADM-2026-001', rollNo: '101', className: 'Class 9', section: 'A', gender: 'Male', phone: '+92 300 1111111', fatherName: 'Shahzad Ahmad', dob: '2010-05-12' },
  { _id: 'stu2', id: '2', firstName: 'Zoya', lastName: 'Fatima', name: 'Zoya Fatima', fullName: 'Zoya Fatima', admissionNo: 'ADM-2026-002', rollNo: '102', className: 'Class 10', section: 'A', gender: 'Female', phone: '+92 300 2222222', fatherName: 'Tariq Mehmood', dob: '2009-08-20' },
  { _id: 'stu3', id: '3', firstName: 'Bilal', lastName: 'Hassan', name: 'Bilal Hassan', fullName: 'Bilal Hassan', admissionNo: 'ADM-2026-003', rollNo: '103', className: 'Class 8', section: 'B', gender: 'Male', phone: '+92 300 3333333', fatherName: 'Hassan Farooq', dob: '2011-03-15' },
  { _id: 'stu4', id: '4', firstName: 'Sara', lastName: 'Khan', name: 'Sara Khan', fullName: 'Sara Khan', admissionNo: 'ADM-2026-004', rollNo: '104', className: 'Class 7', section: 'A', gender: 'Female', phone: '+92 300 4444444', fatherName: 'Imran Khan', dob: '2012-11-09' },
  { _id: 'stu5', id: '5', firstName: 'Hamza', lastName: 'Ali', name: 'Hamza Ali', fullName: 'Hamza Ali', admissionNo: 'ADM-2026-005', rollNo: '105', className: 'Class 6', section: 'C', gender: 'Male', phone: '+92 300 5555555', fatherName: 'Ali Asghar', dob: '2013-02-18' },
  { _id: 'stu6', id: '6', firstName: 'Ayan', lastName: 'Qureshi', name: 'Ayan Qureshi', fullName: 'Ayan Qureshi', admissionNo: 'ADM-2026-006', rollNo: '106', className: 'Class 5', section: 'A', gender: 'Male', phone: '+92 300 6666666', fatherName: 'Rashid Qureshi', dob: '2014-07-25' },
  { _id: 'stu7', id: '7', firstName: 'Dua', lastName: 'Fatima', name: 'Dua Fatima', fullName: 'Dua Fatima', admissionNo: 'ADM-2026-007', rollNo: '107', className: 'Class 4', section: 'B', gender: 'Female', phone: '+92 300 7777777', fatherName: 'Naveed Akhtar', dob: '2015-09-30' },
  { _id: 'stu8', id: '8', firstName: 'Daniyal', lastName: 'Shah', name: 'Daniyal Shah', fullName: 'Daniyal Shah', admissionNo: 'ADM-2026-008', rollNo: '108', className: 'Class 3', section: 'A', gender: 'Male', phone: '+92 300 8888888', fatherName: 'Qamar Shah', dob: '2016-04-14' },
  { _id: 'stu9', id: '9', firstName: 'Mahnoor', lastName: 'Noor', name: 'Mahnoor Noor', fullName: 'Mahnoor Noor', admissionNo: 'ADM-2026-009', rollNo: '109', className: 'Class 2', section: 'B', gender: 'Female', phone: '+92 300 9999999', fatherName: 'Noor Muhammad', dob: '2017-01-05' },
  { _id: 'stu10', id: '10', firstName: 'Ibrahim', lastName: 'Sheikh', name: 'Ibrahim Sheikh', fullName: 'Ibrahim Sheikh', admissionNo: 'ADM-2026-010', rollNo: '110', className: 'Class 1', section: 'A', gender: 'Male', phone: '+92 300 1212121', fatherName: 'Farhan Sheikh', dob: '2018-06-22' },
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
    students: { total: 1240, male: 680, female: 560, malePercent: 55, femalePercent: 45 },
    teachers: 48,
    parents: 920,
    staffs: 24,
    attendance: {
      studentsPresent: 1180,
      studentsTotal: 1240,
      staffPresent: 68,
      staffTotal: 72,
      studentAttPercent: 95,
      staffAttPercent: 94
    },
    fees: {
      totalIncome: 1480000,
      totalExpenses: 420000,
      totalProfit: 1060000,
      totalFees: 1800000,
      collectedFees: 1480000,
      collectionPercentage: 82
    }
  },
  charts: {
    monthly: [
      { day: '01', income: 180000, expense: 45000 },
      { day: '05', income: 320000, expense: 80000 },
      { day: '10', income: 290000, expense: 60000 },
      { day: '15', income: 240000, expense: 95000 },
      { day: '20', income: 210000, expense: 50000 },
      { day: '25', income: 150000, expense: 40000 },
      { day: '30', income: 90000, expense: 50000 },
    ],
    yearly: [
      { month: 'Jan', income: 1200000, expense: 380000 },
      { month: 'Feb', income: 1350000, expense: 410000 },
      { month: 'Mar', income: 1400000, expense: 390000 },
      { month: 'Apr', income: 1280000, expense: 420000 },
      { month: 'May', income: 1500000, expense: 450000 },
      { month: 'Jun', income: 1100000, expense: 350000 },
      { month: 'Jul', income: 950000, expense: 320000 },
      { month: 'Aug', income: 1600000, expense: 480000 },
      { month: 'Sep', income: 1480000, expense: 420000 },
      { month: 'Oct', income: 1420000, expense: 400000 },
      { month: 'Nov', income: 1380000, expense: 390000 },
      { month: 'Dec', income: 1520000, expense: 460000 },
    ]
  },
  notices: [
    {
      _id: 'n1',
      title: 'Annual Sports Gala 2026',
      description: 'Annual Sports Week will commence from next Monday. All classes are requested to finalize athlete lists.',
      audience: 'All',
      date: '2026-09-08',
      createdAt: '2026-09-04T10:00:00.000Z'
    },
    {
      _id: 'n2',
      title: 'First Term Examination Schedule',
      description: 'First Term Date Sheet has been published. Exams will begin from September 20, 2026.',
      audience: 'Students',
      date: '2026-09-15',
      createdAt: '2026-09-03T11:00:00.000Z'
    },
    {
      _id: 'n3',
      title: 'Parent-Teacher Meeting (PTM)',
      description: 'PTM for junior section will be held on Saturday from 9:00 AM to 1:00 PM.',
      audience: 'Parents',
      date: '2026-09-12',
      createdAt: '2026-09-02T09:30:00.000Z'
    }
  ],
  todos: [
    { _id: 't1', title: 'Verify Grade 10 examination roll numbers', completed: false, date: '2026-09-05' },
    { _id: 't2', title: 'Approve staff leave applications', completed: true, date: '2026-09-04' },
    { _id: 't3', title: 'Generate monthly fee invoice reports', completed: false, date: '2026-09-06' }
  ]
};

export const mockAuthUser = {
  _id: 'super-admin-001',
  username: 'Super Admin',
  email: 'admin@eskooly.com',
  role: 'Super Admin',
  fullName: 'Administrator'
};

export const mockHomework = [
  { _id: 'hw1', class: 'Class 10', section: 'A', subject: 'Mathematics', title: 'Quadratic Equations Exercise 2.1', homeworkDate: '2026-09-04', submissionDate: '2026-09-06', evaluated: false },
  { _id: 'hw2', class: 'Class 9', section: 'B', subject: 'Physics', title: 'Kinematics Numericals 1 to 5', homeworkDate: '2026-09-04', submissionDate: '2026-09-07', evaluated: true },
  { _id: 'hw3', class: 'Class 8', section: 'A', subject: 'English', title: 'Essay on My Favorite Book', homeworkDate: '2026-09-03', submissionDate: '2026-09-05', evaluated: true },
];

export const mockFeesInvoices = [
  { _id: 'inv1', invoiceNo: 'INV-2026-001', studentName: 'Muhammad Rayyan', class: 'Class 10', section: 'A', amount: 4500, paidAmount: 4500, status: 'Paid', date: '2026-09-01' },
  { _id: 'inv2', invoiceNo: 'INV-2026-002', studentName: 'Zoya Fatima', class: 'Class 9', section: 'A', amount: 4500, paidAmount: 0, status: 'Unpaid', date: '2026-09-01' },
  { _id: 'inv3', invoiceNo: 'INV-2026-003', studentName: 'Abdullah Khan', class: 'Class 8', section: 'B', amount: 4000, paidAmount: 2000, status: 'Partial', date: '2026-09-02' },
];

export const mockAdminQueries = [
  { _id: 'aq1', name: 'Zahid Mehmood', phone: '+92 321 9876543', email: 'zahid@gmail.com', source: 'Website', date: '2026-09-03', status: 'Follow Up' },
  { _id: 'aq2', name: 'Rashid Minhas', phone: '+92 333 4567890', email: 'rashid@yahoo.com', source: 'Walk In', date: '2026-09-04', status: 'Converted' },
];

export const mockComplaints = [
  { _id: 'cmp1', complaintBy: 'Tariq Mehmood (Parent)', complaintType: 'Transport', date: '2026-09-02', status: 'Resolved', description: 'Van Route 3 delayed by 20 mins' },
  { _id: 'cmp2', complaintBy: 'Amina Bibi (Parent)', complaintType: 'Academics', date: '2026-09-03', status: 'Pending', description: 'Request extra coaching in Physics' },
];

export const mockVisitors = [
  { _id: 'v1', name: 'Dr. Tariq Jamil', purpose: 'Campus Inspection', inTime: '10:00 AM', outTime: '11:30 AM', date: '2026-09-04' },
  { _id: 'v2', name: 'Kamran Akmal', purpose: 'Admission Inquiry', inTime: '11:45 AM', outTime: '12:15 PM', date: '2026-09-04' },
];

export const mockCalls = [
  { _id: 'c1', name: 'Sajid Iqbal', phone: '+92 300 1122334', callType: 'Incoming', date: '2026-09-04', duration: '3m 24s', purpose: 'Fee Inquiry' },
];

export const mockPostal = [
  { _id: 'p1', referenceNo: 'REF-2026-901', senderTitle: 'BISE Lahore Board', toTitle: 'Principal', date: '2026-09-02', type: 'Receive' },
];

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

export const mockOnlineExams = [
  { _id: 'oe1', title: 'Physics Mid-Term Online Quiz', class: 'Class 10', subject: 'Physics', totalMarks: 50, passingMarks: 20, status: 'Active' },
  { _id: 'oe2', title: 'Mathematics Chapter 1-3 Assessment', class: 'Class 9', subject: 'Mathematics', totalMarks: 40, passingMarks: 16, status: 'Upcoming' },
];

export const mockAttendanceRecords = [
  { _id: 'att1', studentName: 'Muhammad Rayyan', rollNumber: '101', class: 'Class 10', section: 'A', status: 'Present', date: '2026-09-04' },
  { _id: 'att2', studentName: 'Zoya Fatima', rollNumber: '102', class: 'Class 10', section: 'A', status: 'Present', date: '2026-09-04' },
  { _id: 'att3', studentName: 'Abdullah Khan', rollNumber: '103', class: 'Class 10', section: 'A', status: 'Absent', date: '2026-09-04' },
];

// Endpoint to Mock Data Mapping lookup table
export const endpointMockMap = {
  '/dashboard/stats': mockDashboardStats,
  '/auth/me': mockAuthUser,
  '/class': mockClasses,
  '/section': mockSections,
  '/subject': mockSubjects,
  '/department': mockDepartments,
  '/Department': mockDepartments,
  '/designation': mockDesignations,
  '/staff': mockStaff,
  '/student': mockStudents,
  '/students': mockStudents,
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

