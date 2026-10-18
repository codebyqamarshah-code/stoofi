const OnlineExam = require('../models/OnlineExam');
const OnlineExamResult = require('../models/OnlineExamResult');
const Student = require('../models/Student');

// @desc    Get all online exams
// @route   GET /api/online-exam
// @access  Protected
exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.classId) filter.classId = req.query.classId;
    if (req.query.subjectId) filter.subjectId = req.query.subjectId;
    if (req.query.status) filter.status = req.query.status;

    const data = await OnlineExam.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single online exam by ID
// @route   GET /api/online-exam/:id
// @access  Protected
exports.getById = async (req, res) => {
  try {
    const exam = await OnlineExam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Online exam not found' });
    }

    // Check if the student has already taken this exam
    let existingResult = null;
    if (req.user) {
      existingResult = await OnlineExamResult.findOne({
        examId: exam._id,
        $or: [
          { userId: req.user._id },
          ...(req.user.studentId ? [{ studentId: req.user.studentId }] : [])
        ]
      });
    }

    // For students who haven't submitted yet, hide the correctAnswer field
    let questionsForResponse = exam.questions;
    const isStudent = req.user?.role === 'Student';
    if (isStudent && !existingResult) {
      questionsForResponse = exam.questions.map(q => ({
        _id: q._id,
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        marks: q.marks
      }));
    }

    res.status(200).json({
      success: true,
      data: {
        ...exam.toObject(),
        questions: questionsForResponse,
        hasSubmitted: !!existingResult,
        submission: existingResult
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create online exam
// @route   POST /api/online-exam
// @access  Protected (Admin / Teacher)
exports.create = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.examCode) {
      payload.examCode = 'EXAM-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    // If questions are provided, calculate total marks
    if (Array.isArray(payload.questions) && payload.questions.length > 0) {
      payload.totalMarks = payload.questions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);
    }

    const data = await OnlineExam.create(payload);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update online exam
// @route   PUT /api/online-exam/:id
// @access  Protected (Admin / Teacher)
exports.update = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (Array.isArray(payload.questions)) {
      payload.totalMarks = payload.questions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);
    }

    const data = await OnlineExam.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete online exam
// @route   DELETE /api/online-exam/:id
// @access  Protected (Admin / Teacher)
exports.remove = async (req, res) => {
  try {
    const data = await OnlineExam.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Not found' });
    // Also remove associated results
    await OnlineExamResult.deleteMany({ examId: req.params.id });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit student answers for an exam
// @route   POST /api/online-exam/:id/submit
// @access  Protected (Student)
exports.submitExam = async (req, res) => {
  try {
    const exam = await OnlineExam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Online exam not found' });
    }

    const { answers = {} } = req.body;
    const user = req.user;

    // Check if student profile exists for user
    let student = null;
    if (user?.studentId) {
      student = await Student.findById(user.studentId);
    } else if (user?.email) {
      student = await Student.findOne({ email: user.email });
    }

    // Evaluate answers
    let score = 0;
    let totalMarks = 0;
    let correctCount = 0;
    let wrongCount = 0;
    const questions = exam.questions || [];

    questions.forEach((q, idx) => {
      const qMarks = Number(q.marks) || 1;
      totalMarks += qMarks;

      // Student chosen answer can be keyed by q._id or by index
      const chosen = answers[q._id] || answers[String(idx)];
      if (chosen && String(chosen).toUpperCase() === String(q.correctAnswer).toUpperCase()) {
        score += qMarks;
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    const minPass = Number(exam.minPercentage) || 50;
    const status = percentage >= minPass ? 'Passed' : 'Failed';

    const resultData = {
      examId: exam._id,
      examTitle: exam.title,
      studentId: student?._id,
      userId: user?._id,
      studentName: student ? `${student.firstName} ${student.lastName}` : (user?.fullName || user?.username || 'Student'),
      admissionNo: student?.admissionNo || '',
      rollNo: student?.rollNo || '',
      className: student?.className || exam.classId || '',
      section: student?.section || exam.sectionId || '',
      answers,
      totalQuestions: questions.length,
      correctCount,
      wrongCount,
      score,
      totalMarks,
      percentage,
      status,
      submittedAt: new Date()
    };

    // Upsert submission
    const existing = await OnlineExamResult.findOne({
      examId: exam._id,
      $or: [
        { userId: user._id },
        ...(student?._id ? [{ studentId: student._id }] : [])
      ]
    });

    let savedResult;
    if (existing) {
      savedResult = await OnlineExamResult.findByIdAndUpdate(existing._id, resultData, { new: true });
    } else {
      savedResult = await OnlineExamResult.create(resultData);
    }

    res.status(200).json({
      success: true,
      message: 'Exam submitted successfully',
      data: savedResult
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get results for an exam
// @route   GET /api/online-exam/:id/results
// @access  Protected
exports.getExamResults = async (req, res) => {
  try {
    const results = await OnlineExamResult.find({ examId: req.params.id }).sort({ score: -1 });
    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get student's own exam results
// @route   GET /api/online-exam/student/results
// @access  Protected
exports.getStudentResults = async (req, res) => {
  try {
    const user = req.user;
    const query = {
      $or: [
        { userId: user._id },
        ...(user.studentId ? [{ studentId: user.studentId }] : [])
      ]
    };
    const results = await OnlineExamResult.find(query).sort({ submittedAt: -1 });
    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
