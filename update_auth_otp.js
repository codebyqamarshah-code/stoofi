const fs = require('fs');

const authPath = 'server/src/controllers/auth.controller.js';
let content = fs.readFileSync(authPath, 'utf8');

// Ensure sendVerificationOTP is imported
if (!content.includes('sendVerificationOTP')) {
    content = content.replace("const { sendLoginAlert } = require('../utils/mailer');", "const { sendLoginAlert, sendVerificationOTP } = require('../utils/mailer');");
}

const loginRegex = /exports\.login = async \(req, res, next\) => \{([\s\S]*?)exports\.logout =/m;

const newLoginLogic = `exports.login = async (req, res, next) => {
  try {
    const { email, password, otp } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const cleanEmail = email.trim().toLowerCase();

    let user = await User.findOne({ 
      $or: [
        { email: cleanEmail },
        { username: cleanEmail }
      ]
    }).select('+password +emailOtp +otpExpires');
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please check your email or register first.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password.' });
    }

    if (user.status !== 'Active') {
      return res.status(401).json({ success: false, message: 'Account is inactive' });
    }

    // --- OTP VERIFICATION FLOW ---
    if (!otp) {
      // Step 1: Generate and Send OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.emailOtp = otpCode;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
      await user.save({ validateBeforeSave: false });
      
      await sendVerificationOTP(user.email, user.fullName || user.username, otpCode);
      
      return res.status(200).json({ 
        success: true, 
        requireOtp: true, 
        email: user.email, 
        message: 'Verification code sent to your email.' 
      });
    } else {
      // Step 2: Validate OTP
      if (user.emailOtp !== otp || !user.otpExpires || user.otpExpires < new Date()) {
        return res.status(400).json({ success: false, message: 'Invalid or expired verification code.' });
      }
      
      // OTP is valid
      user.emailOtp = undefined;
      user.otpExpires = undefined;
      user.isEmailVerified = true;
      user.lastLogin = Date.now();
      await user.save({ validateBeforeSave: false });
    }
    // --- END OTP VERIFICATION FLOW ---

    await Notification.create({ title: 'User Login', message: \`\${user.fullName || user.username} just logged in.\`, type: 'Login', audience: 'Super Admin' });

    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    let additionalData = {};
    if (user.role === 'Student') {
      const studentData = await Student.findOne({ user: user._id });
      if (studentData) {
        additionalData.className = studentData.className;
        additionalData.section = studentData.section;
      }
    }

    // Send email alert for high-privileged roles
    if (user.role === 'Super Admin' || user.role === 'Admin') {
        const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'Unknown';
        sendLoginAlert(user.email, user.firstName + ' ' + user.lastName, user.role, ip);
    }
    
    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        fullName: user.fullName || user.username,
        name: user.fullName || user.username,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        ...additionalData
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

exports.logout =`;

content = content.replace(loginRegex, newLoginLogic);
fs.writeFileSync(authPath, content, 'utf8');
console.log('auth.controller.js updated with full OTP logic');
