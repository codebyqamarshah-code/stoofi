const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`\n======================================================`);
    console.log(`✅ MongoDB Successfully Connected!`);
    console.log(`📡 Database Name: ${conn.connection.name} (Sara data isi mai jayega)`);
    console.log(`======================================================\n`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
