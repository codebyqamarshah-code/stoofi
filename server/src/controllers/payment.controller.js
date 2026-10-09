const safepayService = require('../services/safepay.service');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const User = require('../models/User');

/**
 * Calculate Price (Server-Side Canonical Breakdown)
 */
exports.calculatePrice = async (req, res) => {
  try {
    const { plan, billingCycle, studentCount } = req.query;
    const pricing = safepayService.calculatePrice(plan, billingCycle, studentCount);
    res.status(200).json({ success: true, data: pricing });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Create Safepay Checkout Session
 */
exports.createCheckoutSession = async (req, res) => {
  try {
    const {
      schoolName,
      adminName,
      adminEmail,
      phone,
      plan,
      billingCycle,
      studentCount
    } = req.body;

    // Validation
    if (!adminEmail || !adminEmail.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please provide a valid admin email address.' });
    }

    if (!schoolName || schoolName.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Please provide your school name.' });
    }

    if (!adminName || adminName.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Please provide the administrator full name.' });
    }

    // Phone validation for Pakistan format
    const cleanPhone = String(phone || '').replace(/[\s-]/g, '');
    if (cleanPhone && !cleanPhone.match(/^((\+92)|(0092)|(0))?3[0-9]{9}$|^(\+?[1-9]\d{1,14})$/)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid Pakistani mobile number (e.g. 03001234567 or +923001234567).' });
    }

    const count = parseInt(studentCount, 10);
    if (isNaN(count) || count < 1) {
      return res.status(400).json({ success: false, message: 'Student count must be a valid positive number.' });
    }

    const clientUrl = req.headers.origin || req.headers.referer || process.env.CLIENT_URL;

    // If user is authenticated, use their ID; otherwise find or create guest user
    let userId = req.user?.id;
    if (!userId) {
      let existingUser = await User.findOne({ email: adminEmail.toLowerCase().trim() });
      if (!existingUser) {
        // Create user placeholder for guest checkout
        const randomPass = Math.random().toString(36).slice(-8) + 'A1!';
        existingUser = await User.create({
          fullName: adminName,
          username: adminEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + Math.floor(100 + Math.random() * 900),
          email: adminEmail.toLowerCase().trim(),
          password: randomPass,
          role: 'Admin',
          schoolName,
          phone: cleanPhone
        });
      }
      userId = existingUser._id;
    }

    const session = await safepayService.createPaymentSession({
      userId,
      schoolId: req.user?.schoolId || userId,
      schoolName,
      adminName,
      adminEmail,
      phone: cleanPhone,
      plan,
      billingCycle,
      studentCount: count,
      clientUrl
    });

    res.status(200).json(session);
  } catch (error) {
    console.error('Checkout creation error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to initialize payment session.' });
  }
};

/**
 * Start 1-Month Free Trial
 */
exports.startFreeTrial = async (req, res) => {
  try {
    const {
      schoolName,
      adminName,
      adminEmail,
      phone,
      plan,
      studentCount
    } = req.body;

    if (!adminEmail || !adminEmail.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please provide a valid admin email address.' });
    }

    let userId = req.user?.id;
    if (!userId) {
      let existingUser = await User.findOne({ email: adminEmail.toLowerCase().trim() });
      if (!existingUser) {
        const randomPass = Math.random().toString(36).slice(-8) + 'A1!';
        existingUser = await User.create({
          fullName: adminName || 'Admin',
          username: adminEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + Math.floor(100 + Math.random() * 900),
          email: adminEmail.toLowerCase().trim(),
          password: randomPass,
          role: 'Admin',
          schoolName: schoolName || 'My School',
          phone: phone || ''
        });
      }
      userId = existingUser._id;
    }

    const result = await safepayService.startFreeTrial({
      userId,
      schoolId: req.user?.schoolId || userId,
      schoolName,
      adminName,
      adminEmail,
      phone,
      plan: plan || 'Professional',
      studentCount: studentCount || 200
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Free trial error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to start free trial.' });
  }
};

/**
 * Verify Payment on Redirect
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { order_id, orderId, tracker, beacon, token, sig } = req.body;

    const result = await safepayService.verifyPayment({
      orderId: order_id || orderId,
      tracker: tracker || beacon || token,
      beacon,
      token,
      sig
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(400).json({ success: false, message: error.message || 'Payment verification failed.' });
  }
};

/**
 * Webhook Handler for Safepay Asynchronous Events
 */
exports.handleWebhook = async (req, res) => {
  try {
    const headers = req.headers;
    const body = req.body;
    const rawBody = req.rawBody || JSON.stringify(body);

    const sigCheck = safepayService.verifyWebhookSignature(headers, rawBody);
    if (!sigCheck.isValid && process.env.NODE_ENV === 'production') {
      return res.status(401).json({ success: false, message: 'Invalid webhook signature.' });
    }

    const result = await safepayService.processWebhook(headers, body, rawBody);
    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get School's Active Subscription Details
 */
exports.getSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    let subscription = await Subscription.findOne({ userId }).populate('latestPaymentId');

    if (!subscription) {
      // Default initial trial state for registered admin
      const now = new Date();
      const trialEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      subscription = {
        plan: 'Professional',
        billingCycle: 'monthly',
        studentCount: 200,
        amount: 2400,
        currency: 'PKR',
        status: 'trialing',
        trialStartDate: now,
        trialEndDate: trialEnd,
        nextBillingDate: trialEnd,
        hasAccess: true
      };
    }

    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Payment History & Invoices
 */
exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Printable Invoice by ID or Invoice Number
 */
exports.getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findOne({
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { invoiceNumber: id },
        { providerReference: id }
      ]
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Cancel Subscription
 */
exports.cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const subscription = await Subscription.findOne({ userId });
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'No active subscription found.' });
    }

    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    await subscription.save();

    res.status(200).json({ success: true, message: 'Subscription cancelled successfully.', data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
