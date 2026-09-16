const fs = require('fs');
let content = fs.readFileSync('server/src/controllers/auth.controller.js', 'utf8');

// 1. Add Notification model import
content = content.replace(
  "const User = require('../models/User');",
  "const User = require('../models/User');\nconst Notification = require('../models/Notification');"
);

// 2. Add Notification in register (before generateToken)
content = content.replace(
  "// Generate token\n    const token = generateToken(user);",
  "await Notification.create({ title: 'New Registration', message: `${finalRole} ${resolvedFullName} just registered.`, type: 'Registration', audience: 'Super Admin' });\n\n    // Generate token\n    const token = generateToken(user);"
);

// 3. Add Notification in login (before generateToken)
content = content.replace(
  "// Update last login\n    user.lastLogin = Date.now();\n    await user.save({ validateBeforeSave: false });\n\n    // Generate token\n    const token = generateToken(user);",
  "// Update last login\n    user.lastLogin = Date.now();\n    await user.save({ validateBeforeSave: false });\n\n    await Notification.create({ title: 'User Login', message: `${user.fullName || user.username} just logged in.`, type: 'Login', audience: 'Super Admin' });\n\n    // Generate token\n    const token = generateToken(user);"
);

fs.writeFileSync('server/src/controllers/auth.controller.js', content);
