const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Class = require('./src/models/Class');
const Section = require('./src/models/Section');
const Subject = require('./src/models/Subject');
const ClassRoom = require('./src/models/ClassRoom');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eskooly_erp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('MongoDB Connected for Seeding');

  // Seed Sections
  const sections = ['A', 'B', 'C', 'D'];
  for (const s of sections) {
    const exists = await Section.findOne({ name: s });
    if (!exists) {
      await Section.create({ name: s });
    }
  }
  console.log('Sections Seeded');

  // Seed Classes
  for (let i = 1; i <= 10; i++) {
    const className = `Class ${i}`;
    const exists = await Class.findOne({ name: className });
    if (!exists) {
      await Class.create({ name: className, sections: ['A', 'B', 'C'] });
    }
  }
  console.log('Classes Seeded');

  console.log('Database Seeding Completed!');
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit(1);
});
