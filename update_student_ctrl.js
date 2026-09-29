const fs = require('fs');
let content = fs.readFileSync('server/src/controllers/student.controller.js', 'utf8');

if (!content.includes("const Notification = require('../models/Notification');")) {
    content = "const Notification = require('../models/Notification');\n" + content;
}

const replacement = `    const data = await Student.create(dataObj);
    
    // Create Notification for Super Admin and Admin
    try {
        await Notification.create([
            {
                title: 'New Student Registration',
                message: \`New student \${data.firstName || ''} \${data.lastName || ''} (Adm No: \${data.admissionNo}) has just registered/been added.\`,
                type: 'Registration',
                audience: 'Super Admin'
            },
            {
                title: 'New Student Registration',
                message: \`New student \${data.firstName || ''} \${data.lastName || ''} (Adm No: \${data.admissionNo}) has just registered/been added.\`,
                type: 'Registration',
                audience: 'Admin'
            }
        ]);
    } catch(notifErr) {
        console.log('Notification error:', notifErr);
    }
    
    res.status(201).json({ success: true, data });`;

content = content.replace(
    /const data = await Student\.create\(dataObj\);\s*res\.status\(201\)\.json\(\{ success: true, data \}\);/,
    replacement
);

fs.writeFileSync('server/src/controllers/student.controller.js', content);
console.log('Student controller updated with Notification creation');
