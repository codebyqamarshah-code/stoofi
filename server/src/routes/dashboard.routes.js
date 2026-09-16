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
  createTodo, 
  toggleTodo, 
  deleteTodo,
  getLiveUpdates 
} = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/live-updates', getLiveUpdates);

// Quick Action routes
router.post('/admission', quickStudentAdmission);
router.post('/collect-fee', quickCollectFee);
router.post('/attendance', quickMarkAttendance);
router.post('/expense', quickAddExpense);

// Notice routes
router.get('/notices', getNotices);
router.post('/notices', createNotice);
router.put('/notices/:id', updateNotice);
router.delete('/notices/:id', deleteNotice);

// ToDo routes
router.post('/todos', createTodo);
router.put('/todos/:id', toggleTodo);
router.delete('/todos/:id', deleteTodo);

module.exports = router;
