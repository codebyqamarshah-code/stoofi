const nodemailer = require('nodemailer');

// Setup your SMTP config here. You can use Gmail or any other service.
const transporter = nodemailer.createTransport({
  service: 'gmail', // Standard Gmail service
  auth: {
    user: process.env.SMTP_USER || 'admin@stoofi.com',
    pass: process.env.SMTP_PASS || 'your-app-password'
  }
});

exports.sendLoginAlert = async (userEmail, userName, role, ipAddress) => {
  try {
    const mailOptions = {
      from: '"Stoofi Security" <security@stoofi.com>',
      to: userEmail,
      subject: 'Security Alert: New Login Detected',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #059669;">New Login Alert</h2>
          <p>Hello <strong>${userName}</strong>,</p>
          <p>We noticed a new login to your <strong>${role}</strong> dashboard account.</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>IP Address (Approximated):</strong> ${ipAddress || 'Unknown Device'}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #777;">If this was you, you can safely ignore this email. If you did not log in, please reset your password immediately and contact support.</p>
          <p style="font-size: 12px; color: #777;">Thank you,<br/>Stoofi ERP Security Team</p>
        </div>
      `
    };

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail(mailOptions);
      console.log(`Login alert sent to ${userEmail}`);
    } else {
      console.log(`[MAIL MOCK] Login alert would be sent to ${userEmail} (Configure SMTP_USER/PASS in .env)`);
    }
  } catch (error) {
    console.error('Error sending login alert:', error);
  }
};

exports.sendVerificationOTP = async (userEmail, userName, otpCode) => {
  try {
    const mailOptions = {
      from: '"Stoofi Security" <security@stoofi.com>',
      to: userEmail,
      subject: 'Stoofi ERP - Login Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #059669;">Login Verification</h2>
          <p>Hello <strong>${userName}</strong>,</p>
          <p>Please use the following 6-digit verification code to complete your login:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="color: #1f2937; letter-spacing: 5px; margin: 0;">${otpCode}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;" />
          <p style="font-size: 12px; color: #777;">If you did not attempt to log in, please secure your account immediately.</p>
        </div>
      `
    };

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail(mailOptions);
      console.log('OTP sent to ' + userEmail);
    } else {
      console.log('[MAIL MOCK] OTP for ' + userEmail + ' is: ' + otpCode);
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
  }
};

exports.sendResetPasswordOTP = async (userEmail, userName, otpCode) => {
  try {
    const mailOptions = {
      from: '"Stoofi Security" <security@stoofi.com>',
      to: userEmail,
      subject: 'Stoofi ERP - Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #dc2626;">Password Reset Request</h2>
          <p>Hello <strong>${userName}</strong>,</p>
          <p>We received a request to reset your password for your Stoofi ERP account.</p>
          <p>Please use the following 6-digit verification code to reset your password:</p>
          <div style="background-color: #fef2f2; border: 1px dashed #f87171; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="color: #dc2626; letter-spacing: 5px; margin: 0;">${otpCode}</h1>
          </div>
          <p>This code is valid for <strong>10 minutes</strong>.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;" />
          <p style="font-size: 12px; color: #777;">If you did not request a password reset, please ignore this email or notify your system administrator.</p>
          <p style="font-size: 12px; color: #777;">Thank you,<br/>Stoofi ERP Security Team</p>
        </div>
      `
    };

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail(mailOptions);
      console.log('Password reset OTP sent to ' + userEmail);
    } else {
      console.log('[MAIL MOCK] Password Reset OTP for ' + userEmail + ' is: ' + otpCode);
    }
  } catch (error) {
    console.error('Error sending Password Reset OTP:', error);
  }
};