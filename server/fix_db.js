const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://admin:admin@cluster0.p713f.mongodb.net/stoofi?retryWrites=true&w=majority').then(async () => {
  const Student = require('./src/models/Student');
  const Teacher = require('./src/models/Teacher');
  
  // Fix 1 to 10
  for (let i = 1; i <= 10; i++) {
    await Student.updateMany({ className: String(i) }, { $set: { className: 'Class ' + i } });
    await Teacher.updateMany({ assignedClass: String(i) }, { $set: { assignedClass: 'Class ' + i } });
  }
  console.log('Fixed DB');
  process.exit(0);
}).catch(console.error);
