const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const compression = require('compression');
const path = require('path');

const app = express();
app.use(compression());

// Universal CORS Middleware for Vercel & Cross-Origin requests
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
  const reqHeaders = req.headers['access-control-request-headers'];
  res.setHeader(
    'Access-Control-Allow-Headers',
    reqHeaders || 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-Device-Id, x-device-id, X-Device-Name, x-device-name'
  );
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(cors({
  origin: true,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With', 'Accept', 'Accept-Version', 'Content-Length', 'Content-MD5', 'Date', 'X-Api-Version', 'X-Device-Id', 'x-device-id', 'X-Device-Name', 'x-device-name']
}));
app.use(express.json({ 
  limit: '50mb',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Connect to Database Middleware for Serverless execution
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error("DB Connection Error:", err);
  }
  next();
});

// Serve static files (uploads)
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use('/api/uploads', express.static(path.join(__dirname, '../public/uploads')));
if (process.env.VERCEL === '1' || process.env.VERCEL_ENV) {
  app.use('/uploads', express.static('/tmp/uploads'));
  app.use('/api/uploads', express.static('/tmp/uploads'));
}

// Fallback for missing uploads: return clean SVG placeholder avatar with 200 OK to eliminate 404 console errors
const defaultAvatarSvg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="100%" height="100%" fill="#f8fafc"/><circle cx="12" cy="8" r="4" fill="#cbd5e1" stroke="none"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="#cbd5e1" stroke="none"/></svg>`
);
app.use(['/uploads', '/api/uploads'], (req, res) => {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.status(200).send(defaultAvatarSvg);
});

// Routes
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/admission-query', require('./routes/admissionQuery.routes'));

// Certificate routes (mounted on /api/certificate, /api/certificates, and /api/generate-certificate)
app.use('/api/certificate', require('./routes/certificate.routes'));
app.use('/api/certificates', require('./routes/certificate.routes'));
app.use('/api/generate-certificate', require('./routes/certificate.routes'));

// Student & Teacher routes (both singular and plural)
app.use('/api/student', require('./routes/student.routes'));
app.use('/api/students', require('./routes/student.routes'));
app.use('/api/student-group', require('./routes/studentGroup.routes'));
app.use('/api/content', require('./routes/content.routes'));
app.use('/api/teacher', require('./routes/teacher.routes'));
app.use('/api/teachers', require('./routes/teacher.routes'));

// Academic & Infrastructure routes
app.use('/api/class', require('./routes/class.routes'));
app.use('/api/classes', require('./routes/class.routes'));
app.use('/api/section', require('./routes/section.routes'));
app.use('/api/sections', require('./routes/section.routes'));
app.use('/api/classroom', require('./routes/classroom.routes'));
app.use('/api/classrooms', require('./routes/classroom.routes'));
app.use('/api/subject', require('./routes/subject.routes'));
app.use('/api/subjects', require('./routes/subject.routes'));
app.use('/api/class-teacher', require('./routes/class-teacher.routes'));
app.use('/api/class-teachers', require('./routes/class-teacher.routes'));
app.use('/api/assign-class-teacher', require('./routes/class-teacher.routes'));
app.use('/api/assign-subject', require('./routes/assign-subject.routes'));
app.use('/api/assign-subjects', require('./routes/assign-subject.routes'));
app.use('/api/class-routine', require('./routes/classRoutine.routes'));
app.use('/api/class-routines', require('./routes/classRoutine.routes'));
app.use('/api/routine', require('./routes/classRoutine.routes'));
app.use('/api/routines', require('./routes/classRoutine.routes'));

// Lesson Plan routes
app.use('/api/lesson', require('./routes/lesson.routes'));
app.use('/api/lessons', require('./routes/lesson.routes'));
app.use('/api/topic', require('./routes/topic.routes'));
app.use('/api/topics', require('./routes/topic.routes'));

// Admin Section routes
app.use('/api/id-card', require('./routes/id-card.routes'));
app.use('/api/id-cards', require('./routes/id-card.routes'));
app.use('/api/generate-id-card', require('./routes/id-card.routes'));
app.use('/api/setup', require('./routes/setup.routes'));
app.use('/api/base-setup', require('./routes/setup.routes'));
app.use('/api/phone-call-log', require('./routes/phone-call-log.routes'));
app.use('/api/postal-dispatch', require('./routes/postal-dispatch.routes'));
app.use('/api/postal-dispatches', require('./routes/postal-dispatch.routes'));
app.use('/api/postal-receive', require('./routes/postal-receive.routes'));
app.use('/api/postal-receives', require('./routes/postal-receive.routes'));
app.use('/api/complaint', require('./routes/complaint.routes'));
app.use('/api/complaints', require('./routes/complaint.routes'));
app.use('/api/visitor-book', require('./routes/visitor-book.routes'));
app.use('/api/fees', require('./routes/fees.routes'));
app.use('/api/homework', require('./routes/homework.routes'));
app.use('/api/whatsapp', require('./routes/whatsappRoutes'));
app.use('/api/behaviour', require('./routes/behaviour.routes'));

app.use('/api/book-category', require('./routes/book-category.routes'));

app.use('/api/library-member', require('./routes/library-member.routes'));

app.use('/api/issue-book', require('./routes/issue-book.routes'));

app.use('/api/transport-route', require('./routes/transport-route.routes'));

app.use('/api/transport-vehicle', require('./routes/transport-vehicle.routes'));

app.use('/api/transport-assign', require('./routes/transport-assign.routes'));

app.use('/api/dormitory-room-type', require('./routes/dormitory-room-type.routes'));

app.use('/api/exam-grade', require('./routes/exam-grade.routes'));
app.use('/api/marks-grade', require('./routes/exam-grade.routes'));

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
app.use('/api/Department', require('./routes/department.routes'));

// Laboratories ERP routes
app.use('/api/labs', require('./routes/lab.routes'));
app.use('/api/lab', require('./routes/lab.routes'));

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
app.use('/api/leave', require('./routes/leave.routes'));
app.use('/api/leave-define', require('./routes/leave.routes'));
app.use('/api/role', require('./routes/role.routes'));
app.use('/api/question-bank', require('./routes/question-bank.routes'));
app.use('/api/teacher-evaluation', require('./routes/teacher-evaluation.routes'));
app.use('/api/teacher-evaluation-settings', require('./routes/teacher-evaluation.routes'));
app.use('/api/book', require('./routes/book.routes'));
app.use('/api/dormitory-room', require('./routes/dormitory-room.routes'));
app.use('/api/dormitory', require('./routes/dormitory.routes'));
app.use('/api/lms-course', require('./routes/lms-course.routes'));
app.use('/api/payment', require('./routes/payment.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/setting', require('./routes/setting.routes'));
app.use('/api/virtual-class', require('./routes/virtual-class.routes'));

// Health check & root endpoints
app.get(['/', '/health', '/api/health'], (req, res) => {
  res.json({ success: true, message: 'School Management ERP API is running', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (req.headers.origin) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  let customMessage = err.message || 'Server Error';
  
  if (err.message && err.message.includes('ECONNREFUSED')) {
    customMessage = 'Database Connection Failed! Please check database connectivity.';
  }

  res.status(err.status || 500).json({
    success: false,
    message: customMessage,
    errors: err.errors || []
  });
});

module.exports = app;

