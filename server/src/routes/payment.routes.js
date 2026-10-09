const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const paymentController = require('../controllers/payment.controller');

// Public endpoints
router.get('/calculate', paymentController.calculatePrice);
router.post('/checkout-session', paymentController.createCheckoutSession);
router.post('/start-trial', paymentController.startFreeTrial);
router.post('/verify', paymentController.verifyPayment);
router.post('/safepay/webhook', paymentController.handleWebhook);
router.get('/invoice/:id', paymentController.getInvoiceById);

// Protected endpoints for authenticated users/school admins
router.get('/subscription', protect, paymentController.getSubscription);
router.get('/history', protect, paymentController.getPaymentHistory);
router.post('/cancel-subscription', protect, paymentController.cancelSubscription);

// Legacy test/upgrade handler
router.post('/', protect, paymentController.createCheckoutSession);

module.exports = router;
