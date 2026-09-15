const User = require('../models/User');
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

    // Determine the role model based on the role
    let roleModel = undefined;
    if (finalRole === 'Student') roleModel = 'Student';
    else if (finalRole === 'Teacher') roleModel = 'Teacher';
    else if (finalRole === 'Parent') roleModel = 'Parent';
    else if (['Accountant', 'Librarian', 'Staff'].includes(finalRole)) roleModel = 'Staff';

    // Create user
    const user = await User.create({
      username: username || (fullName || '').split(' ')[0] || email.split('@')[0],
      email,
      password,
      role: finalRole,
      ...(roleModel ? { roleModel } : {}),
      status: 'Active',
      avatar: picture || ''
    });

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

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar
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
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Clean and check email
    const cleanEmail = email.trim().toLowerCase();

    // Check for user
    let user = await User.findOne({ 
      $or: [
        { email: cleanEmail },
        { username: cleanEmail }
      ]
    }).select('+password');
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please check your email or register first.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password.' });
    }

    // Check if user is active
    if (user.status !== 'Active') {
      return res.status(401).json({ success: false, message: 'Account is inactive' });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken(user);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      token
    });
  } catch (error) {
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
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};


