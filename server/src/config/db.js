const mongoose = require('mongoose');

let cachedPromise = null;

const connectDB = async () => {
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2 && cachedPromise) {
    try {
      return await cachedPromise;
    } catch (_) {
      cachedPromise = null;
    }
  }

  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
      console.error('❌ MONGODB_URI or MONGO_URI environment variable is missing!');
      return null;
    }

    cachedPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });

    const conn = await cachedPromise;
    console.log(`✅ MongoDB Successfully Connected to ${conn.connection.name}`);
    return conn;
  } catch (error) {
    cachedPromise = null;
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    // Do not call process.exit(1) in serverless environments to prevent Vercel process crashes
    return null;
  }
};

module.exports = connectDB;
