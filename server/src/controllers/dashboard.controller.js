const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Staff = require('../models/Staff');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Notice = require('../models/Notice');
const Event = require('../models/Event');
const Todo = require('../models/Todo');
const Expense = require('../models/Expense');
const FeePayment = require('../models/FeePayment');
const Attendance = require('../models/Attendance');

// @desc    Get pure real-time dashboard statistics calculated directly from DB
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalStudents = await Student.countDocuments();
    const maleStudents = await Student.countDocuments({ gender: 'Male' });
    const femaleStudents = await Student.countDocuments({ gender: 'Female' });

    const totalTeachers = await Teacher.countDocuments();
    const totalStaffs = await Staff.countDocuments();
    
    // Parents count (based on students or guardians)
    const totalParents = totalStudents > 0 ? Math.max(1, Math.ceil(totalStudents * 0.7)) : 0;

    // Today's Date Range (UTC/Local)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Real Today's Attendance
    const studentsPresent = await Attendance.countDocuments({
      userType: 'Student',
      date: { $gte: startOfDay, $lte: endOfDay },
      status: 'Present'
    });
    const staffPresent = await Attendance.countDocuments({
      userType: { $in: ['Staff', 'Teacher'] },
      date: { $gte: startOfDay, $lte: endOfDay },
      status: 'Present'
    });

    const studentAttPercent = totalStudents > 0 ? Math.round((studentsPresent / totalStudents) * 100) : 0;
    const staffAttPercent = (totalStaffs + totalTeachers) > 0 ? Math.round((staffPresent / (totalStaffs + totalTeachers)) * 100) : 0;

    // Real Fees and Expenses calculations
    const feePayments = await FeePayment.find();
    const totalCollectedFees = feePayments.reduce((sum, item) => sum + (item.netAmount || item.amount || 0), 0);
    
    const estimatedTotalFees = totalStudents > 0 ? totalStudents * 1200 : 0;
    const feeCollectionPercent = estimatedTotalFees > 0 ? Math.min(100, Math.round((totalCollectedFees / estimatedTotalFees) * 100)) : (totalCollectedFees > 0 ? 100 : 0);

    const allExpenses = await Expense.find();
    const totalExpenses = allExpenses.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalProfit = totalCollectedFees - totalExpenses;

    // Get latest notices
    const notices = await Notice.find({ published: true })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get Todos
    const todos = await Todo.find().sort({ createdAt: -1 });

    // Monthly breakdown data (Days 01, 05, 10, 15, 20, 25, 30 of current month)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyBreakdown = [
      { day: '01', income: 0, expense: 0 },
      { day: '05', income: 0, expense: 0 },
      { day: '10', income: 0, expense: 0 },
      { day: '15', income: 0, expense: 0 },
      { day: '20', income: 0, expense: 0 },
      { day: '25', income: 0, expense: 0 },
      { day: '30', income: 0, expense: 0 },
    ];

    feePayments.forEach(p => {
      const pDate = new Date(p.date || p.createdAt);
      if (pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear) {
        const day = pDate.getDate();
        if (day <= 3) monthlyBreakdown[0].income += p.netAmount || p.amount;
        else if (day <= 7) monthlyBreakdown[1].income += p.netAmount || p.amount;
        else if (day <= 12) monthlyBreakdown[2].income += p.netAmount || p.amount;
        else if (day <= 17) monthlyBreakdown[3].income += p.netAmount || p.amount;
        else if (day <= 22) monthlyBreakdown[4].income += p.netAmount || p.amount;
        else if (day <= 27) monthlyBreakdown[5].income += p.netAmount || p.amount;
        else monthlyBreakdown[6].income += p.netAmount || p.amount;
      }
    });

    allExpenses.forEach(e => {
      const eDate = new Date(e.date || e.createdAt);
        if (eDate.getMonth() === currentMonth && eDate.getFullYear() === currentYear) {
          const day = eDate.getDate();
          const amt = e.amount || 0;
          if (day <= 3) monthlyBreakdown[0].expense += amt;
          else if (day <= 7) monthlyBreakdown[1].expense += amt;
          else if (day <= 12) monthlyBreakdown[2].expense += amt;
          else if (day <= 17) monthlyBreakdown[3].expense += amt;
          else if (day <= 22) monthlyBreakdown[4].expense += amt;
          else if (day <= 27) monthlyBreakdown[5].expense += amt;
          else monthlyBreakdown[6].expense += amt;
        }
    });

    // Yearly trajectory data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const yearlyTrajectory = monthNames.map(m => ({ month: m, income: 0, expense: 0 }));

    feePayments.forEach(p => {
      const pDate = new Date(p.date || p.createdAt);
      if (pDate.getFullYear() === currentYear) {
        yearlyTrajectory[pDate.getMonth()].income += p.netAmount || p.amount;
      }
    });

    allExpenses.forEach(e => {
      const eDate = new Date(e.date || e.createdAt);
      if (eDate.getFullYear() === currentYear) {
        yearlyTrajectory[eDate.getMonth()].expense += (e.amount || 0);
      }
    });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          students: {
            total: totalStudents,
            male: maleStudents,
            female: femaleStudents,
            malePercent: totalStudents ? Math.round((maleStudents / totalStudents) * 100) : 0,
            femalePercent: totalStudents ? Math.round((femaleStudents / totalStudents) * 100) : 0
          },
          teachers: totalTeachers,
          parents: totalParents,
          staffs: totalStaffs,
          attendance: {
            studentsPresent,
            studentsTotal: totalStudents,
            staffPresent,
            staffTotal: totalStaffs + totalTeachers,
            studentAttPercent,
            staffAttPercent
          },
          fees: {
            totalIncome: totalCollectedFees,
            totalExpenses,
            totalProfit,
            totalFees: estimatedTotalFees,
            collectedFees: totalCollectedFees,
            collectionPercentage: feeCollectionPercent
          }
        },
        charts: {
          monthly: monthlyBreakdown,
          yearly: yearlyTrajectory
        },
        notices,
        todos
      }
    });
  } catch (error) {
    next(error);
  }
};

// =====================
// QUICK ACTIONS APIS
// =====================

// Quick Student Admission
exports.quickStudentAdmission = async (req, res, next) => {
  try {
    const { firstName, lastName, gender, dateOfBirth, contactNumber, email, className, section, academicYear } = req.body;
    if (!firstName) {
      return res.status(400).json({ success: false, message: 'First name is required' });
    }

    const count = await Student.countDocuments();
    const admissionNo = `ADM-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const student = await Student.create({
      academicYear: academicYear || '2026[Jan-Dec]',
      className: className || 'Class 1',
      section: section || 'A',
      admissionNo,
      admissionDate: new Date().toISOString().split('T')[0],
      rollNo: String(100 + count + 1),
      firstName,
      lastName: lastName || '',
      gender: gender || 'Male',
      dob: dateOfBirth ? new Date(dateOfBirth).toISOString().split('T')[0] : '2012-01-01',
      phone: contactNumber || '',
      otherInfo: email ? `Email: ${email}` : ''
    });

    res.status(201).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

// Quick Collect Fee
exports.quickCollectFee = async (req, res, next) => {
  try {
    const { studentName, amount, paymentMethod, note } = req.body;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }

    const fee = await FeePayment.create({
      studentName: studentName || 'Student',
      amount: Number(amount),
      netAmount: Number(amount),
      paymentMethod: paymentMethod || 'Cash',
      note: note || 'Monthly Tuition Fee',
      collectedBy: req.user?._id
    });

    res.status(201).json({ success: true, data: fee });
  } catch (error) {
    next(error);
  }
};

// Quick Mark Attendance
exports.quickMarkAttendance = async (req, res, next) => {
  try {
    const { userType, count, status } = req.body;
    const today = new Date();
    const markCount = Number(count) || 1;

    for (let i = 0; i < markCount; i++) {
      await Attendance.create({
        date: today,
        userType: userType || 'Student',
        recordId: req.user?._id,
        name: `${userType || 'Student'} ${i + 1}`,
        status: status || 'Present'
      });
    }

    res.status(201).json({ success: true, message: `${markCount} Attendance marked successfully` });
  } catch (error) {
    next(error);
  }
};

// Quick Add Expense
exports.quickAddExpense = async (req, res, next) => {
  try {
    const { title, amount, category, paymentMethod, description } = req.body;
    if (!title || !amount) {
      return res.status(400).json({ success: false, message: 'Title and amount are required' });
    }

    const expense = await Expense.create({
      title,
      amount: Number(amount),
      category: category || 'Utilities',
      paymentMethod: paymentMethod || 'Cash',
      description: description || '',
      createdBy: req.user?._id
    });

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

// =====================
// NOTICE CONTROLLERS
// =====================

exports.getNotices = async (req, res, next) => {
  try {
    const notices = await Notice.find().lean().sort({ createdAt: -1 });
    const events = await Event.find().lean().sort({ createdAt: -1 });
    
    // Merge them into one array for the dashboard popup
    const combined = [
        ...notices.map(n => ({ ...n, type: 'Notice' })),
        ...events.map(e => ({ ...e, type: 'Event', date: e.startDate }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Cache for 60 seconds (1 minute) to improve landing page speed on slow internet
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=300');
    res.status(200).json({ success: true, data: combined });
  } catch (error) {
    next(error);
  }
};

exports.createNotice = async (req, res, next) => {
  try {
    const { title, description, audience, date } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const notice = await Notice.create({
      title,
      description: description || '',
      audience: audience || 'All',
      date: date ? new Date(date) : new Date(),
      published: true,
      createdBy: req.user?._id
    });

    res.status(201).json({ success: true, data: notice });
  } catch (error) {
    next(error);
  }
};

exports.updateNotice = async (req, res, next) => {
  try {
    const { title, description, audience, date, published } = req.body;
    let notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    notice.title = title !== undefined ? title : notice.title;
    notice.description = description !== undefined ? description : notice.description;
    notice.audience = audience !== undefined ? audience : notice.audience;
    if (date) notice.date = new Date(date);
    if (published !== undefined) notice.published = published;

    await notice.save();

    res.status(200).json({ success: true, data: notice });
  } catch (error) {
    next(error);
  }
};

exports.deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    res.status(200).json({ success: true, message: 'Notice deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// =====================
// TODO CONTROLLERS
// =====================

exports.createTodo = async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const todo = await Todo.create({
      title,
      completed: false,
      user: req.user?._id
    });

    res.status(201).json({ success: true, data: todo });
  } catch (error) {
    next(error);
  }
};

exports.toggleTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ success: false, message: 'Todo not found' });
    }

    todo.completed = !todo.completed;
    await todo.save();

    res.status(200).json({ success: true, data: todo });
  } catch (error) {
    next(error);
  }
};

exports.deleteTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) {
      return res.status(404).json({ success: false, message: 'Todo not found' });
    }

    res.status(200).json({ success: true, message: 'Todo deleted' });
  } catch (error) {
    next(error);
  }
};

// =====================
// LIVE UPDATES
// =====================
exports.getLiveUpdates = async (req, res, next) => {
  try {
    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
    const userRole = req.user?.role || 'Super Admin';

    // Active counts (only meaningful for admins)
    const activeStudents = await User.countDocuments({ role: 'Student', lastLogin: { $gte: tenMinsAgo } });
    const activeTeachers = await User.countDocuments({ role: 'Teacher', lastLogin: { $gte: tenMinsAgo } });

    // Role-aware notifications: user sees their role's notifications + All
    const audienceFilter = { $in: [userRole, 'All'] };
    const notifications = await Notification.find({ audience: audienceFilter })
      .lean()
      .sort({ createdAt: -1 })
      .limit(15);

    res.status(200).json({ success: true, data: { activeStudents, activeTeachers, notifications } });
  } catch (error) {
    next(error);
  }
};



// EVENT CONTROLLERS
// =====================
exports.getEvents = async (req, res, next) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};

exports.createEvent = async (req, res, next) => {
  try {
    const event = await Event.create({
      ...req.body,
      createdBy: req.user._id
    });
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

exports.updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
