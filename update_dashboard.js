const fs = require('fs');
let content = fs.readFileSync('server/src/controllers/dashboard.controller.js', 'utf8');

const importStr = "const Notification = require('../models/Notification');\nconst User = require('../models/User');\n";
content = content.replace("const Notice = require('../models/Notice');", importStr + "const Notice = require('../models/Notice');");

const funcStr = `
// =====================
// LIVE UPDATES
// =====================
exports.getLiveUpdates = async (req, res, next) => {
  try {
    // Active students (logged in within last 10 minutes)
    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
    const activeStudents = await User.countDocuments({ role: 'Student', lastLogin: { $gte: tenMinsAgo } });

    // Recent Notifications for Super Admin
    const notifications = await Notification.find({ audience: { $in: ['Super Admin', 'All'] } })
      .sort({ createdAt: -1 })
      .limit(10);

    // Active teachers (logged in within last 10 minutes)
    const activeTeachers = await User.countDocuments({ role: 'Teacher', lastLogin: { $gte: tenMinsAgo } });

    res.status(200).json({ success: true, data: { activeStudents, activeTeachers, notifications } });
  } catch (error) {
    next(error);
  }
};
`;

content = content + funcStr;
fs.writeFileSync('server/src/controllers/dashboard.controller.js', content);
