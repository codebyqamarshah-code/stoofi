const express = require('express');
const { getAttendance, saveAttendance } = require('../controllers/student-attendance.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(protect);

router.route('/').get(getAttendance).post(saveAttendance);

module.exports = router;
