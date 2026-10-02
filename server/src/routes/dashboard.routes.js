const express = require('express');
const { 
  getDashboardStats, 
  quickStudentAdmission,
  quickCollectFee,
  quickMarkAttendance,
  quickAddExpense,
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  createTodo, 
  toggleTodo, 
  deleteTodo,
  getLiveUpdates 
} = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes for landing page
router.get('/notices', getNotices);
router.get('/events', getEvents);

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/live-updates', getLiveUpdates);

// Quick Action routes
router.post('/admission', quickStudentAdmission);
router.post('/collect-fee', quickCollectFee);
router.post('/attendance', quickMarkAttendance);
router.post('/expense', quickAddExpense);

// Notice routes
router.post('/notices', createNotice);
router.put('/notices/:id', updateNotice);
router.delete('/notices/:id', deleteNotice);

// Event routes
router.post('/events', createEvent);
router.put('/events/:id', updateEvent);
router.delete('/events/:id', deleteEvent);

// ToDo routes
router.post('/todos', createTodo);
router.put('/todos/:id', toggleTodo);
router.delete('/todos/:id', deleteTodo);

module.exports = router;
