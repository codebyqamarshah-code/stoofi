const fs = require('fs');
let content = fs.readFileSync('server/src/controllers/auth.controller.js', 'utf8');

const target1 = `await Notification.create({ title: 'New Registration', message: \`\${finalRole} \${resolvedFullName} just registered.\`, type: 'Registration', audience: 'Super Admin' });`;
const replace1 = `await Notification.create({ title: 'New Registration', message: \`\${finalRole} \${resolvedFullName} just registered.\`, type: 'Registration', audience: 'Super Admin' });
    if (finalRole === 'Student') {
      await Notification.create({ title: 'New Student Enrolled', message: \`Student \${resolvedFullName} has registered.\`, type: 'Registration', audience: 'Teacher' });
    }`;

content = content.replace(target1, replace1);
fs.writeFileSync('server/src/controllers/auth.controller.js', content);
