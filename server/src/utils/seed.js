const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Staff = require('../models/Staff');
const Notice = require('../models/Notice');
const Todo = require('../models/Todo');

dotenv.config({ path: '../../.env' });

const seedAllData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eskooly_erp');
    console.log('MongoDB Connected for comprehensive seeding');

    // 1. Check or Create Super Admin
    let admin = await User.findOne({ email: 'admin@gmail.com' });
    if (!admin) {
      admin = await User.create({
        username: 'Super Admin',
        email: 'admin@gmail.com',
        password: 'school@123',
        role: 'Super Admin',
        status: 'Active'
      });
      console.log('Super Admin user created:', admin.email);
    }

    // 2. Seed Teachers
    const teacherCount = await Teacher.countDocuments();
    if (teacherCount === 0) {
      await Teacher.create({
        firstName: 'Ahmed',
        lastName: 'Khan',
        email: 'ahmed.khan@eskooly.com',
        phone: '+92 300 1234567',
        gender: 'Male',
        designation: 'Headmaster',
        department: 'Science'
      });
      console.log('Teacher seeded');
    }

    // 3. Seed Staff
    const staffCount = await Staff.countDocuments();
    if (staffCount === 0) {
      await Staff.insertMany([
        { firstName: 'Zainab', lastName: 'Bibi', email: 'zainab@eskooly.com', role: 'Accountant', department: 'Accounts' },
        { firstName: 'Bilal', lastName: 'Raza', email: 'bilal@eskooly.com', role: 'Librarian', department: 'Library' },
        { firstName: 'Fatima', lastName: 'Noor', email: 'fatima@eskooly.com', role: 'Receptionist', department: 'Front Desk' },
        { firstName: 'Tariq', lastName: 'Mehmood', email: 'tariq@eskooly.com', role: 'Security Head', department: 'Operations' },
      ]);
      console.log('Staff members seeded');
    }

    // 4. Seed Students
    const studentCount = await Student.countDocuments();
    if (studentCount === 0) {
      await Student.insertMany([
        {
          user: admin._id,
          admissionNumber: 'ADM-2026-001',
          rollNumber: '101',
          firstName: 'Ali',
          lastName: 'Hassan',
          gender: 'Male',
          dateOfBirth: new Date('2012-05-14'),
          contactNumber: '+92 312 9876543',
          email: 'ali.hassan@student.com'
        },
        {
          user: admin._id,
          admissionNumber: 'ADM-2026-002',
          rollNumber: '102',
          firstName: 'Ayesha',
          lastName: 'Malik',
          gender: 'Female',
          dateOfBirth: new Date('2013-08-20'),
          contactNumber: '+92 321 4567890',
          email: 'ayesha.malik@student.com'
        },
        {
          user: admin._id,
          admissionNumber: 'ADM-2026-003',
          rollNumber: '103',
          firstName: 'Sara',
          lastName: 'Ahmed',
          gender: 'Female',
          dateOfBirth: new Date('2012-11-10'),
          contactNumber: '+92 333 1122334',
          email: 'sara.ahmed@student.com'
        }
      ]);
      console.log('Students seeded');
    }

    // 5. Seed Notices
    const noticeCount = await Notice.countDocuments();
    if (noticeCount === 0) {
      await Notice.insertMany([
        { title: 'Annual Sports Gala 2026 announced', description: 'Annual sports competitions start next week.', audience: 'All', createdBy: admin._id },
        { title: 'Monthly Parent-Teacher Meeting Schedule', description: 'PTM will be held on the upcoming Saturday.', audience: 'Parents', createdBy: admin._id },
        { title: 'First Term Examination Syllabus Uploaded', description: 'Students can check syllabus from LMS.', audience: 'Students', createdBy: admin._id },
        { title: 'Submission of Tuition Fees for August', description: 'Kindly clear remaining dues before the 10th.', audience: 'Parents', createdBy: admin._id },
        { title: 'Staff Training & Orientation Workshop', description: 'Mandatory workshop for all faculty members.', audience: 'Teachers', createdBy: admin._id },
      ]);
      console.log('Notices seeded');
    }

    // 6. Seed Todos
    const todoCount = await Todo.countDocuments();
    if (todoCount === 0) {
      await Todo.insertMany([
        { title: 'Review student admissions for Class 9', completed: false, user: admin._id },
        { title: 'Verify monthly fee collection reports', completed: true, user: admin._id },
        { title: 'Publish midterm exam timetable', completed: false, user: admin._id },
      ]);
      console.log('Todos seeded');
    }

    console.log('Comprehensive seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedAllData();
