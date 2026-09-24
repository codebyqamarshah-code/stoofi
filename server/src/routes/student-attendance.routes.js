const express = require('express');
const { getAttendance, saveAttendance, getAttendanceReport } = require('../controllers/student-attendance.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(protect);

router.get('/report', getAttendanceReport);
router.route('/').get(getAttendance).post(saveAttendance);

module.exports = router;
