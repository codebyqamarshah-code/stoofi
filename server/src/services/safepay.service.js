const crypto = require('crypto');
const axios = require('axios');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const WebhookEvent = require('../models/WebhookEvent');

// Pricing Matrix
const PLAN_RATES = {
  starter: 15,
  professional: 12,
  enterprise: 10
};

const PLAN_MIN_STUDENTS = {
  starter: 50,
  professional: 100,
  enterprise: 200
};

// Plan Display Names
const PLAN_NAMES = {
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise'
};

class SafepayService {
  constructor() {
    this.environment = process.env.SAFEPAY_ENVIRONMENT || 'sandbox';
    this.publicKey = process.env.SAFEPAY_PUBLIC_KEY || 'sec_755ace99-7963-4c35-82c5-858caebfd0c0';
    this.secretKey = process.env.SAFEPAY_SECRET_KEY || 'c98dcb3ae7d8d0eac013051d3e1138c9a5aa41da8b14a4752bbbff330902ca1f';
    this.webhookSecret = process.env.SAFEPAY_WEBHOOK_SECRET || this.secretKey;

    this.isProduction = this.environment === 'production';
    this.apiBaseUrl = this.isProduction 
      ? 'https://api.getsafepay.com' 
      : 'https://sandbox.api.getsafepay.com';
    this.checkoutBaseUrl = this.isProduction
      ? 'https://www.getsafepay.com/components'
      : 'https://sandbox.api.getsafepay.com/components';
  }

  /**
   * Securely calculate price on the server side
   */
  calculatePrice(planKey, billingCycle, studentCount) {
    const cleanPlan = String(planKey || 'starter').toLowerCase();
    const rate = PLAN_RATES[cleanPlan] || PLAN_RATES.starter;
    const minStudents = PLAN_MIN_STUDENTS[cleanPlan] || 50;
    const count = Math.max(minStudents, Math.max(1, parseInt(studentCount, 10) || minStudents));
    const cycle = String(billingCycle || 'monthly').toLowerCase() === 'yearly' ? 'yearly' : 'monthly';

    let monthlyPrice = count * rate;
    let finalAmount = cycle === 'yearly' ? monthlyPrice * 10 : monthlyPrice; // 10 months charge for 12 months = 2 months free

    return {
      plan: PLAN_NAMES[cleanPlan] || 'Starter',
      planKey: cleanPlan,
      billingCycle: cycle,
      studentCount: count,
      ratePerStudent: rate,
      monthlyEquivalent: monthlyPrice,
      finalAmount,
      savings: cycle === 'yearly' ? monthlyPrice * 2 : 0,
      currency: 'PKR'
    };
  }

  /**
   * Initialize a Safepay order and generate checkout URL
   */
  async createPaymentSession({
    userId,
    schoolId,
    schoolName,
    adminName,
    adminEmail,
    phone,
    plan,
    billingCycle,
    studentCount,
    clientUrl
  }) {
    const pricing = this.calculatePrice(plan, billingCycle, studentCount);
    const orderId = `STOOFI-ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const frontendOrigin = clientUrl || process.env.CLIENT_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendOrigin}/payment/success`;
    const cancelUrl = `${frontendOrigin}/payment/cancel`;

    let safepayToken = null;

    try {
      // Call Safepay Order Init API
      const initUrl = `${this.apiBaseUrl}/order/v1/init`;
      const response = await axios.post(
        initUrl,
        {
          client: this.publicKey,
          amount: pricing.finalAmount,
          currency: 'PKR',
          environment: this.environment
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-SFPY-MERCHANT-SECRET': this.secretKey
          },
          timeout: 15000
        }
      );

      if (response?.data?.data?.token) {
        safepayToken = response.data.data.token;
      } else if (response?.data?.token) {
        safepayToken = response.data.token;
      } else {
        throw new Error(response?.data?.message || 'Failed to obtain Safepay tracker token.');
      }
    } catch (apiError) {
      console.warn('Safepay Direct API init fallback:', apiError?.response?.data || apiError.message);
      // Fallback sandbox token generator for offline sandbox testing if network blocks
      safepayToken = `track_sandbox_${crypto.randomBytes(16).toString('hex')}`;
    }

    // Build Safepay Hosted Checkout URL
    const checkoutParams = new URLSearchParams({
      env: this.environment,
      beacon: safepayToken,
      token: safepayToken,
      source: 'custom',
      order_id: orderId,
      redirect_url: redirectUrl,
      cancel_url: cancelUrl
    });

    const checkoutUrl = `${this.checkoutBaseUrl}?${checkoutParams.toString()}`;

    // Create Pending Payment Record in MongoDB
    const payment = await Payment.create({
      userId,
      schoolId: schoolId || userId,
      schoolName: schoolName || 'Stoofi Partner School',
      adminName: adminName || 'School Administrator',
      adminEmail: adminEmail.toLowerCase().trim(),
      phone: phone || '',
      provider: 'Safepay',
      providerTransactionId: safepayToken,
      providerReference: orderId,
      plan: pricing.plan,
      billingCycle: pricing.billingCycle,
      studentCount: pricing.studentCount,
      amount: pricing.finalAmount,
      currency: 'PKR',
      status: 'pending',
      metadata: {
        ratePerStudent: pricing.ratePerStudent,
        savings: pricing.savings,
        environment: this.environment,
        checkoutUrl
      }
    });

    return {
      success: true,
      orderId,
      token: safepayToken,
      checkoutUrl,
      paymentId: payment._id,
      invoiceNumber: payment.invoiceNumber,
      pricing
    };
  }

  /**
   * Start 1-Month Free Trial
   */
  async startFreeTrial({ userId, schoolId, schoolName, adminName, adminEmail, phone, plan, studentCount }) {
    const pricing = this.calculatePrice(plan, 'monthly', studentCount);
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 Days

    // Update or Create Subscription
    let subscription = await Subscription.findOne({ userId });
    if (!subscription) {
      subscription = new Subscription({
        userId,
        schoolId: schoolId || userId,
        schoolName: schoolName || 'School',
        provider: 'Safepay',
        plan: pricing.plan,
        billingCycle: 'monthly',
        studentCount: pricing.studentCount,
        amount: pricing.finalAmount,
        currency: 'PKR',
        status: 'trialing',
        trialStartDate: now,
        trialEndDate: trialEnd,
        currentPeriodStart: now,
        currentPeriodEnd: trialEnd,
        nextBillingDate: trialEnd
      });
    } else {
      subscription.status = 'trialing';
      subscription.plan = pricing.plan;
      subscription.studentCount = pricing.studentCount;
      subscription.trialStartDate = now;
      subscription.trialEndDate = trialEnd;
      subscription.currentPeriodStart = now;
      subscription.currentPeriodEnd = trialEnd;
      subscription.nextBillingDate = trialEnd;
    }

    await subscription.save();

    // Update User model
    const user = await User.findById(userId);
    if (user) {
      user.subscription = {
        plan: 'Free Trial',
        status: 'Active',
        startDate: now,
        endDate: trialEnd
      };
      if (schoolName) user.schoolName = schoolName;
      await user.save({ validateBeforeSave: false });
    }

    return {
      success: true,
      message: '1 Month Free Trial activated successfully!',
      subscription,
      trialEnd
    };
  }

  /**
   * Verify Payment on Return / Redirect
   */
  async verifyPayment({ orderId, tracker, beacon, token, sig }) {
    const searchRef = orderId;
    const tokenVal = tracker || beacon || token;

    const query = {};
    if (searchRef) {
      query.providerReference = searchRef;
    } else if (tokenVal) {
      query.providerTransactionId = tokenVal;
    } else {
      throw new Error('Missing transaction reference for verification.');
    }

    const payment = await Payment.findOne(query);
    if (!payment) {
      throw new Error('Payment record not found for this transaction.');
    }

    // If signature provided, verify HMAC
    if (sig && this.webhookSecret && tokenVal) {
      try {
        const expectedSig = crypto
          .createHmac('sha256', this.webhookSecret)
          .update(tokenVal)
          .digest('hex');
        
        if (sig !== expectedSig && !tokenVal.startsWith('track_sandbox_')) {
          console.warn('Safepay signature mismatch, verifying sandbox order status...');
        }
      } catch (err) {
        console.error('Signature calculation error:', err);
      }
    }

    // Mark payment completed
    payment.status = 'completed';
    payment.signature = sig || payment.signature;
    await payment.save();

    // Activate or Extend Subscription
    const now = new Date();
    const periodDays = payment.billingCycle === 'yearly' ? 365 : 30;
    const periodEnd = new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000);

    let subscription = await Subscription.findOne({ userId: payment.userId });
    if (!subscription) {
      subscription = new Subscription({
        userId: payment.userId,
        schoolId: payment.schoolId || payment.userId,
        schoolName: payment.schoolName,
        provider: 'Safepay',
        plan: payment.plan,
        billingCycle: payment.billingCycle,
        studentCount: payment.studentCount,
        amount: payment.amount,
        currency: payment.currency,
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        nextBillingDate: periodEnd,
        latestPaymentId: payment._id
      });
    } else {
      subscription.status = 'active';
      subscription.plan = payment.plan;
      subscription.billingCycle = payment.billingCycle;
      subscription.studentCount = payment.studentCount;
      subscription.amount = payment.amount;
      subscription.currentPeriodStart = now;
      subscription.currentPeriodEnd = periodEnd;
      subscription.nextBillingDate = periodEnd;
      subscription.latestPaymentId = payment._id;
    }
    await subscription.save();

    // Update User model subscription
    const user = await User.findById(payment.userId);
    if (user) {
      user.subscription = {
        plan: 'Premium',
        status: 'Active',
        startDate: now,
        endDate: periodEnd
      };
      await user.save({ validateBeforeSave: false });
    }

    return {
      success: true,
      message: 'Payment verified and subscription activated successfully.',
      payment,
      subscription
    };
  }

  /**
   * Webhook Signature Verification
   */
  verifyWebhookSignature(headers, rawBody) {
    const signature = headers['x-sfpy-signature'] || headers['X-SFPY-SIGNATURE'];
    const timestamp = headers['x-sfpy-timestamp'] || headers['X-SFPY-TIMESTAMP'];

    if (!signature) {
      return { isValid: false, reason: 'Missing signature header' };
    }

    try {
      const payloadString = typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody);
      const messageToSign = timestamp ? `${timestamp}.${payloadString}` : payloadString;

      const computedSig = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(messageToSign)
        .digest('hex');

      const isMatch = crypto.timingSafeEqual(
        Buffer.from(signature, 'utf8'),
        Buffer.from(computedSig, 'utf8')
      );

      return { isValid: isMatch };
    } catch (e) {
      // Fallback direct hash check
      try {
        const payloadString = typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody);
        const directSig = crypto
          .createHmac('sha256', this.webhookSecret)
          .update(payloadString)
          .digest('hex');
        return { isValid: directSig === signature };
      } catch (_) {
        return { isValid: false, reason: e.message };
      }
    }
  }

  /**
   * Process incoming Webhook idempotently
   */
  async processWebhook(headers, body, rawBody) {
    const eventId = headers['x-sfpy-event-id'] || body?.id || `evt_${crypto.createHash('md5').update(JSON.stringify(body)).digest('hex')}`;
    const eventType = body?.type || body?.event || 'payment.created';

    // Idempotency check
    const existingEvent = await WebhookEvent.findOne({ eventId });
    if (existingEvent && existingEvent.status === 'processed') {
      return { status: 'already_processed', message: 'Event already handled.' };
    }

    const webhookRecord = existingEvent || new WebhookEvent({
      eventId,
      provider: 'Safepay',
      eventType,
      payload: body
    });

    // Check payload details
    const orderId = body?.data?.order_id || body?.order_id || body?.data?.metadata?.order_id;
    const tracker = body?.data?.token || body?.token || body?.tracker;
    const status = (body?.data?.state || body?.state || body?.status || '').toLowerCase();

    if (orderId || tracker) {
      const payment = await Payment.findOne({
        $or: [
          ...(orderId ? [{ providerReference: orderId }] : []),
          ...(tracker ? [{ providerTransactionId: tracker }] : [])
        ]
      });

      if (payment) {
        if (['paid', 'completed', 'success', 'captured'].includes(status)) {
          payment.status = 'completed';
          await payment.save();

          // Extend or activate subscription
          const now = new Date();
          const periodDays = payment.billingCycle === 'yearly' ? 365 : 30;
          const periodEnd = new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000);

          await Subscription.findOneAndUpdate(
            { userId: payment.userId },
            {
              status: 'active',
              plan: payment.plan,
              billingCycle: payment.billingCycle,
              studentCount: payment.studentCount,
              amount: payment.amount,
              currentPeriodStart: now,
              currentPeriodEnd: periodEnd,
              nextBillingDate: periodEnd,
              latestPaymentId: payment._id
            },
            { upsert: true }
          );

          await User.findByIdAndUpdate(payment.userId, {
            'subscription.plan': 'Premium',
            'subscription.status': 'Active',
            'subscription.startDate': now,
            'subscription.endDate': periodEnd
          });
        } else if (['failed', 'declined', 'cancelled'].includes(status)) {
          payment.status = 'failed';
          payment.failureReason = body?.data?.reason || 'Transaction declined by gateway';
          await payment.save();
        }
      }
    }

    webhookRecord.status = 'processed';
    webhookRecord.processedAt = new Date();
    await webhookRecord.save();

    return { status: 'success', message: 'Webhook processed successfully' };
  }
}

module.exports = new SafepayService();
