const express = require('express');
const { 
  register, 
  login, 
  logout, 
  getMe, 
  updateProfile,
  getRegistrationStatus,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  resendOtp,
  resetAllUsersData
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/registration-status', getRegistrationStatus);
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/profile', protect, updateProfile);
router.post('/resend-otp', resendOtp);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);
router.post('/reset-database', resetAllUsersData);

module.exports = router;
