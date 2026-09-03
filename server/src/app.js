const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(cors({
  origin: [process.env.CLIENT_URL || 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Connect to Database
connectDB();

// Serve static files (uploads)
app.use(express.static('public'));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/admission-query', require('./routes/admissionQuery.routes'));
app.use('/api/generate-certificate', require('./routes/certificate.routes'));
app.use('/api/student', require('./routes/student.routes'));
app.use('/api/class', require('./routes/class.routes'));
app.use('/api/section', require('./routes/section.routes'));
app.use('/api/classroom', require('./routes/classroom.routes'));
app.use('/api/subject', require('./routes/subject.routes'));
app.use('/api/id-card', require('./routes/id-card.routes'));
app.use('/api/setup', require('./routes/setup.routes'));
app.use('/api/phone-call-log', require('./routes/phone-call-log.routes'));
app.use('/api/postal-dispatch', require('./routes/postal-dispatch.routes'));
app.use('/api/postal-receive', require('./routes/postal-receive.routes'));
app.use('/api/complaint', require('./routes/complaint.routes'));
app.use('/api/visitor-book', require('./routes/visitor-book.routes'));
app.use('/api/fees', require('./routes/fees.routes'));
app.use('/api/homework', require('./routes/homework.routes'));
app.use('/api/whatsapp', require('./routes/whatsappRoutes'));

app.use('/api/book-category', require('./routes/book-category.routes'));

app.use('/api/library-member', require('./routes/library-member.routes'));

app.use('/api/issue-book', require('./routes/issue-book.routes'));

app.use('/api/transport-route', require('./routes/transport-route.routes'));

app.use('/api/transport-vehicle', require('./routes/transport-vehicle.routes'));

app.use('/api/transport-assign', require('./routes/transport-assign.routes'));

app.use('/api/dormitory-room-type', require('./routes/dormitory-room-type.routes'));

app.use('/api/exam-grade', require('./routes/exam-grade.routes'));

app.use('/api/exam-type', require('./routes/exam-type.routes'));

app.use('/api/exam-setup', require('./routes/exam-setup.routes'));

app.use('/api/exam-schedule', require('./routes/exam-schedule.routes'));

app.use('/api/exam-attendance', require('./routes/exam-attendance.routes'));

app.use('/api/online-exam', require('./routes/online-exam.routes'));

app.use('/api/question-group', require('./routes/question-group.routes'));

app.use('/api/library-subject', require('./routes/library-subject.routes'));

app.use('/api/marks-register', require('./routes/marks-register.routes'));

app.use('/api/designation', require('./routes/designation.routes'));

app.use('/api/department', require('./routes/department.routes'));

app.use('/api/staff', require('./routes/staff.routes'));

app.use('/api/staff-attendance', require('./routes/staff-attendance.routes'));
app.use('/api/fees-invoice', require('./routes/fees-invoice.routes'));
app.use('/api/lms-category', require('./routes/lms-category.routes'));
app.use('/api/bank-payment', require('./routes/bank-payment.routes'));
app.use('/api/sms-sending-time', require('./routes/sms-sending-time.routes'));
app.use('/api/lms-enroll-history', require('./routes/lms-enroll-history.routes'));
app.use('/api/lms-purchase-log', require('./routes/lms-purchase-log.routes'));
app.use('/api/lms-fees-invoice', require('./routes/lms-fees-invoice.routes'));
app.use('/api/lms-course-level', require('./routes/lms-course-level.routes'));
app.use('/api/expense', require('./routes/expense.routes'));
app.use('/api/income', require('./routes/income.routes'));
app.use('/api/fund-transfer', require('./routes/fund-transfer.routes'));
app.use('/api/chart-of-account', require('./routes/chart-of-account.routes'));
app.use('/api/bank-account', require('./routes/bank-account.routes'));
app.use('/api/student-attendance', require('./routes/student-attendance.routes'));

app.use('/api/payroll', require('./routes/payroll.routes'));

app.use('/api/leave-type', require('./routes/leave-type.routes'));

app.use('/api/role', require('./routes/role.routes'));

app.use('/api/question-bank', require('./routes/question-bank.routes'));

app.use('/api/teacher-evaluation', require('./routes/teacher-evaluation.routes'));

// Basic route
app.get('/', (req, res) => {
  res.send('School Management ERP API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  let customMessage = err.message || 'Server Error';
  
  // Friendly error for MongoDB Connection failure
  if (err.message && err.message.includes('ECONNREFUSED')) {
    customMessage = 'Database Connection Failed! Please start your MongoDB server or use a live MongoDB Atlas URI in your .env file.';
  }

  res.status(err.status || 500).json({
    success: false,
    message: customMessage,
    errors: err.errors || []
  });
});

module.exports = app;

