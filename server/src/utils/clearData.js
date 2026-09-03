const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Staff = require('../models/Staff');
const Notice = require('../models/Notice');
const Todo = require('../models/Todo');
const Expense = require('../models/Expense');
const FeePayment = require('../models/FeePayment');
const Attendance = require('../models/Attendance');

dotenv.config({ path: '../../.env' });

const clearDummyData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eskooly_erp');
    console.log('MongoDB connected to reset collections to 0');

    await Student.deleteMany({});
    await Teacher.deleteMany({});
    await Staff.deleteMany({});
    await Notice.deleteMany({});
    await Todo.deleteMany({});
    await Expense.deleteMany({});
    await FeePayment.deleteMany({});
    await Attendance.deleteMany({});

    console.log('✅ All dummy records cleared. Everything is now set to 0!');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing data:', error);
    process.exit(1);
  }
};

clearDummyData();
