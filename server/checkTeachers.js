require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const Teacher = require('./server/src/models/Teacher');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/stoofi';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => Teacher.find())
  .then(teachers => {
    console.log('Teachers in DB:', JSON.stringify(teachers, null, 2));
  })
  .catch(err => console.error('Error:', err))
  .finally(() => mongoose.disconnect());
