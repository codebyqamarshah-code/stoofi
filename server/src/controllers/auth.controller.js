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
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Determine the role model based on the role
    let roleModel = 'Student';
    const finalRole = role || 'Student';
    if (finalRole === 'Teacher') roleModel = 'Teacher';
    else if (finalRole === 'Parent') roleModel = 'Parent';
    else if (['Accountant', 'Librarian', 'Staff'].includes(finalRole)) roleModel = 'Staff';

    // Create user
    const user = await User.create({
      username: username || (fullName || '').split(' ')[0] || email.split('@')[0],
      email,
      password,
      role: finalRole,
      roleModel,
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
    
    // Auto-create/seed default Super Admin or Admin if logging in for the first time without registration
    if (!user) {
      if (cleanEmail === 'super@gmail.com') {
        if (password !== 'school@123') {
          return res.status(401).json({ success: false, message: 'Incorrect password.' });
        }
        user = await User.create({
          username: 'superadmin',
          email: 'super@gmail.com',
          password: 'school@123',
          role: 'Super Admin',
          status: 'Active'
        });
      } else if (cleanEmail === 'admin@gmail.com' || cleanEmail === 'admin@gamil.com') {
        if (password !== 'school@123') {
          return res.status(401).json({ success: false, message: 'Incorrect password.' });
        }
        user = await User.create({
          username: 'admin',
          email: 'admin@gmail.com',
          password: 'school@123',
          role: 'Admin',
          status: 'Active'
        });
      } else {
        return res.status(401).json({ success: false, message: 'User not found. Please register first.' });
      }
    } else {
      // Check if password matches (allow school@123 for Super Admin / Admin)
      if ((cleanEmail === 'super@gmail.com' || cleanEmail === 'admin@gmail.com' || cleanEmail === 'admin@gamil.com') && password === 'school@123') {
        // Password valid for system accounts
      } else {
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return res.status(401).json({ success: false, message: 'Incorrect password.' });
        }
      }
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


