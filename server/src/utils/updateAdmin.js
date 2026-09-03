const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: '../../.env' });

const updateAdminCredentials = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eskooly_erp');
    console.log('MongoDB connected for admin credentials update');

    // Remove any older admin accounts or update directly
    await User.deleteMany({ email: { $in: ['admin@gmail.com', 'admin@gmail', 'admin@eskooly.com'] } });

    // Create fresh Super Admin user with exact requested credentials
    const admin = new User({
      username: 'Super Admin',
      email: 'admin@gmail.com',
      password: 'school@123',
      role: 'Super Admin',
      status: 'Active'
    });

    await admin.save();
    console.log('✅ Admin user created/updated successfully with:');
    console.log('Email: admin@gmail.com (also accepts admin@gmail)');
    console.log('Password: school@123');

    process.exit(0);
  } catch (error) {
    console.error('Error updating admin credentials:', error);
    process.exit(1);
  }
};

updateAdminCredentials();
