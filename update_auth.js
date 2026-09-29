const fs = require('fs');

const path = 'server/src/controllers/auth.controller.js';
let content = fs.readFileSync(path, 'utf8');

const regex = /if \(!isMatch\) \{[\s\S]*?return res\.status\(401\)\.json\(\{ success: false, message: errorMsg \}\);\s*\}/;

const replacement = if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      
      // Send notification for EVERY failed attempt as requested by user
      try {
        const attemptsLeft = Math.max(0, 5 - user.loginAttempts);
        const title = user.loginAttempts >= 5 ? 'Security Alert: Account Locked' : 'Security Alert: Failed Login Attempt';
        const msg = user.loginAttempts >= 5 
          ? \Account \ has been locked for 15 minutes due to 5 consecutive failed login attempts.\
          : \Failed login attempt (\/5) detected for account: \.\;

        await Notification.create({
          title: title,
          message: msg,
          type: 'System',
          audience: 'Super Admin'
        });
      } catch (notifErr) {
        console.error('Failed to send brute-force notification:', notifErr);
      }
      
      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 minutes
      }
      
      try {
        await user.save({ validateBeforeSave: false });
      } catch (saveErr) {
        console.error('Failed to update user login attempts:', saveErr);
      }
      
      const attemptsLeft = Math.max(0, 5 - user.loginAttempts);
      const errorMsg = user.loginAttempts >= 5 
        ? 'Account locked due to too many failed attempts.' 
        : \Incorrect password. \ attempts remaining.\;
        
      return res.status(401).json({ success: false, message: errorMsg });
    };

content = content.replace(regex, replacement);
fs.writeFileSync(path, content, 'utf8');
console.log('auth.controller.js updated');
