const { sendLoginAlert, sendVerificationOTP, sendResetPasswordOTP } = require('../utils/mailer');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Staff = require('../models/Staff');
const jwt = require('jsonwebtoken');

// Helper to generate tokens
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

exports.register = async (req, res, next) => {
  try {
    const { 
      username, email, password, role, 
      fullName, address, fatherName, phone, 
      dob, joiningDate, studentClass, section, cnic,
      picture
    } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const finalRole = role || 'Student';

    // Enforce single Super Admin constraint
    if (finalRole === 'Super Admin') {
      const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
      if (existingSuperAdmin) {
        return res.status(400).json({ 
          success: false, 
          message: 'Super Admin is already registered. Only one Super Admin account is allowed.' 
        });
      }
    }

    // Enforce single Admin constraint
    if (finalRole === 'Admin') {
      const existingAdmin = await User.findOne({ role: 'Admin' });
      if (existingAdmin) {
        return res.status(400).json({ 
          success: false, 
          message: 'Admin is already registered. Only one Admin account is allowed.' 
        });
      }
    }

    let roleModel = undefined;
    if (finalRole === 'Student') roleModel = 'Student';
    else if (finalRole === 'Teacher') roleModel = 'Teacher';
    else if (finalRole === 'Parent') roleModel = 'Parent';
    else if (['Accountant', 'Librarian', 'Staff', 'Super Admin', 'Admin'].includes(finalRole)) roleModel = 'Staff';

    const resolvedFullName = fullName ? fullName.trim() : (username || email.split('@')[0]);

    const userPayload = {
      fullName: resolvedFullName,
      username: username || `${(fullName || '').split(' ')[0]}_${Date.now().toString().slice(-4)}` || email.split('@')[0],
      email,
      password,
      role: finalRole,
      ...(roleModel ? { roleModel } : {}),
      status: 'Active',
      avatar: picture || ''
    };

    if (finalRole === 'Student') {
      userPayload.subscription = {
        plan: 'Free Trial',
        status: 'Active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };
    }

    const user = await User.create(userPayload);

    let referenceId = null;

    // Extract first and last name safely
    const nameParts = (fullName || username || '').split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create the associated record based on role
    if (finalRole === 'Student') {
      const student = await Student.create({
        user: user._id,
        firstName,
        lastName,
        phone: phone || '',
        currentAddress: address || '',
        fatherName: fatherName || '',
        dob: dob || new Date().toISOString(),
        className: studentClass || '1',
        section: section || 'A',
        academicYear: new Date().getFullYear().toString(),
        admissionNo: 'ADM-' + Date.now(),
        gender: 'Male', // Default
        studentPhoto: picture || ''
      });
      referenceId = student._id;
    } else if (finalRole === 'Teacher') {
      const teacher = await Teacher.create({
        user: user._id,
        firstName,
        lastName,
        email,
        phone: phone || '',
        joiningDate: joiningDate || Date.now(),
        cnic: cnic || '',
        avatar: picture || '',
        gender: 'Male'
      });
      referenceId = teacher._id;
    } else if (roleModel === 'Staff') {
      const staff = await Staff.create({
        user: user._id,
        firstName,
        lastName,
        email,
        phone: phone || '',
        role: finalRole,
        cnic: cnic || '',
        joiningDate: joiningDate || Date.now()
      });
      referenceId = staff._id;
    }

    // Update the user with the reference ID
    if (referenceId) {
      user.referenceId = referenceId;
      await user.save();
    }

    try {
      await Notification.create({ title: 'New Registration', message: `${finalRole} ${resolvedFullName} just registered.`, type: 'Registration', audience: 'Super Admin' });
      if (finalRole === 'Student') {
        await Notification.create({ title: 'New Student Enrolled', message: `Student ${resolvedFullName} has registered.`, type: 'Registration', audience: 'Teacher' });
      }
    } catch (e) {
      console.error('Notification creation error during register:', e);
    }

    // Generate token
    const token = generateToken(user);

    let additionalData = {};
    if (finalRole === 'Student' && referenceId) {
      additionalData.className = studentClass || '1';
      additionalData.section = section || 'A';
    }

    res.status(201).json({
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
    console.error("Registration error: ", error);
    next(error);
  }
};

exports.getRegistrationStatus = async (req, res, next) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const hasSuperAdmin = await User.exists({ role: 'Super Admin' });
    const hasAdmin = await User.exists({ role: 'Admin' });
    
    res.status(200).json({
      success: true,
      hasSuperAdmin: Boolean(hasSuperAdmin),
      hasAdmin: Boolean(hasAdmin)
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
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
    }).select('+password +emailOtp +otpExpires +loginAttempts +lockUntil');
    
    if (!user) {
      // Send Security Alert to Super Admin for unrecognized login attempt
      try {
        await Notification.create({
          title: 'Security Alert: Unknown Account Login Attempt',
          message: `Unsuccessful login attempt using unregistered email/username: "${cleanEmail}".`,
          type: 'System',
          audience: 'Super Admin'
        });
      } catch (e) {}

      return res.status(401).json({ success: false, message: 'Invalid credentials. Please check your email or register first.' });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({ 
        success: false, 
        message: `Account temporarily locked due to too many failed attempts. Try again in ${remaining} minutes.` 
      });
    }

    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      
      // Notify Super Admin on EVERY failed attempt for security tracking
      try {
        const attemptsLeft = Math.max(0, 5 - user.loginAttempts);
        const title = user.loginAttempts >= 5 ? 'Security Alert: Account Locked' : 'Security Alert: Incorrect Password Entered';
        const message = user.loginAttempts >= 5
          ? `Account ${user.email} has been locked for 15 minutes after 5 failed login attempts.`
          : `Failed password attempt (${user.loginAttempts}/5) detected for account: ${user.email}.`;

        await Notification.create({
          title,
          message,
          type: 'System',
          audience: 'Super Admin'
        });
      } catch (notifErr) {
        console.error('Failed to create login attempt notification:', notifErr);
      }

      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 minutes
      }
      
      try {
        await user.save({ validateBeforeSave: false });
      } catch (saveErr) {
        console.error('Error saving user login attempts:', saveErr);
      }
      
      const attemptsLeft = Math.max(0, 5 - user.loginAttempts);
      const errorMsg = user.loginAttempts >= 5 
        ? 'Account locked due to too many failed attempts.' 
        : `Incorrect password. ${attemptsLeft} attempts remaining.`;
        
      return res.status(401).json({ success: false, message: errorMsg });
    }

    // Reset login attempts on successful password match
    if (user.loginAttempts > 0 || user.lockUntil) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save({ validateBeforeSave: false });
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
      
      try {
        await sendVerificationOTP(user.email, user.fullName || user.username, otpCode);
      } catch (e) {
        console.error('Error in sendVerificationOTP:', e);
      }
      
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

    try {
      await Notification.create({ 
        title: 'User Login', 
        message: `${user.fullName || user.username} (${user.role}) successfully logged in.`, 
        type: 'Login', 
        audience: 'Super Admin' 
      });
    } catch (e) {}

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
      try {
        const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'Unknown';
        await sendLoginAlert(user.email, user.fullName || user.username, user.role, ip);
      } catch (e) {
        console.error('Login alert email error:', e);
      }
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
    console.error('Login Endpoint Exception:', error);
    next(error);
  }
};

exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (user.role === 'Student' && user.referenceId) {
      const studentData = await Student.findById(user.referenceId).lean();
      if (studentData) {
        user.className = studentData.className;
        user.section = studentData.section;
        user.rollNo = studentData.rollNo;
        user.admissionNo = studentData.admissionNo;
        user.gender = studentData.gender;
      }
    }

    if (user.role === 'Teacher' && user.referenceId) {
      const Teacher = require('../models/Teacher');
      const teacherData = await Teacher.findById(user.referenceId).lean();
      if (teacherData) {
        user.subject = teacherData.subject;
        user.gender = teacherData.gender;
      }
    }
    
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ 
      $or: [{ email: cleanEmail }, { username: cleanEmail }] 
    });

    if (!user) {
      // Ambiguous response for security
      return res.status(200).json({ 
        success: true, 
        message: 'If an account exists for this email, a verification code has been sent.' 
      });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otpCode;
    user.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await user.save({ validateBeforeSave: false });

    try {
      await sendResetPasswordOTP(user.email, user.fullName || user.username, otpCode);
    } catch (e) {
      console.error('sendResetPasswordOTP error:', e);
    }

    return res.status(200).json({
      success: true,
      message: 'Password reset code sent to your email.'
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyResetOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP code are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ 
      $or: [{ email: cleanEmail }, { username: cleanEmail }] 
    }).select('+resetOtp +resetOtpExpires');

    if (!user || user.resetOtp !== otp || !user.resetOtpExpires || user.resetOtpExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code.' });
    }

    return res.status(200).json({ success: true, message: 'OTP verified successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ 
      $or: [{ email: cleanEmail }, { username: cleanEmail }] 
    }).select('+password +resetOtp +resetOtpExpires');

    if (!user || user.resetOtp !== otp || !user.resetOtpExpires || user.resetOtpExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired session. Please request a new code.' });
    }

    user.password = newPassword;
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    try {
      await Notification.create({
        title: 'Security Alert: Password Changed',
        message: `Password was successfully reset for account: ${user.email}.`,
        type: 'System',
        audience: 'Super Admin'
      });
    } catch (e) {}

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.'
    });
  } catch (error) {
    next(error);
  }
};
