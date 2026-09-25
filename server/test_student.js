const mongoose = require('mongoose');
const Student = require('./src/models/Student');
require('dotenv').config({ path: './.env' });

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const count = await Student.countDocuments();
  console.log('Total students:', count);
  const students = await Student.find().limit(5);
  console.log('Students:', students.map(s => ({
    name: s.firstName,
    className: s.className,
    section: s.section,
    academicYear: s.academicYear
  })));
  mongoose.disconnect();
}).catch(console.error);
