const express = require('express');
const { 
  register, 
  login, 
  logout, 
  getMe, 
  getRegistrationStatus,
  forgotPassword,
  verifyResetOtp,
  resetPassword
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/registration-status', getRegistrationStatus);
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);

module.exports = router;
