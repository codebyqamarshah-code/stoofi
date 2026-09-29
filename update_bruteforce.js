const fs = require('fs');

const authPath = 'server/src/controllers/auth.controller.js';
let content = fs.readFileSync(authPath, 'utf8');

const regexFindUser = /let user = await User\.findOne\([\s\S]*?\}\)\.select\('\+password \+emailOtp \+otpExpires'\);/;
const replacementFindUser = `let user = await User.findOne({ 
      $or: [
        { email: cleanEmail },
        { username: cleanEmail }
      ]
    }).select('+password +emailOtp +otpExpires +loginAttempts +lockUntil');`;

content = content.replace(regexFindUser, replacementFindUser);

const regexCheckPass = /const isMatch = await user\.comparePassword\(password\);\s*if \(!isMatch\) \{\s*return res\.status\(401\)\.json\(\{ success: false, message: 'Incorrect password\.' \}\);\s*\}/;

const replacementCheckPass = `// Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({ 
        success: false, 
        message: \`Account temporarily locked due to too many failed attempts. Try again in \${remaining} minutes.\` 
      });
    }

    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      
      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 minutes
        
        // Notify Super Admin
        await Notification.create({
          title: 'Security Alert: Brute Force Blocked',
          message: \`Multiple failed login attempts detected for account: \${user.email}. Account temporarily locked for 15 minutes.\`,
          type: 'System',
          audience: 'Super Admin'
        });
      }
      
      await user.save({ validateBeforeSave: false });
      
      const attemptsLeft = 5 - user.loginAttempts;
      const errorMsg = user.loginAttempts >= 5 
        ? 'Account locked due to too many failed attempts.' 
        : \`Incorrect password. \${attemptsLeft} attempts remaining.\`;
        
      return res.status(401).json({ success: false, message: errorMsg });
    }

    // Reset login attempts on successful password match
    if (user.loginAttempts > 0 || user.lockUntil) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save({ validateBeforeSave: false });
    }`;

content = content.replace(regexCheckPass, replacementCheckPass);

fs.writeFileSync(authPath, content, 'utf8');
console.log('auth.controller.js updated with brute-force lockout logic');
