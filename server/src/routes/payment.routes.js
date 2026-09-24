const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const User = require('../models/User');

router.post('/', protect, async (req, res) => {
  try {
    const { method, amount, trxId } = req.body;
    
    // Check if a payment method and transaction ID was provided
    if (!method || !amount || !trxId) {
      return res.status(400).json({ success: false, message: 'Please provide payment method, amount, and transaction ID.' });
    }

    // In a real application, you would verify the TRX ID via JazzCash/EasyPaisa API here.
    // We are simulating a successful verification and upgrading the subscription.

    const user = await User.findById(req.user.id);
    
    user.subscription = {
      plan: 'Premium',
      status: 'Active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Extends by 1 month for demo
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully! Your account has been upgraded to Premium.',
      subscription: user.subscription
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
