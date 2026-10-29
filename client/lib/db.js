import mongoose from 'mongoose';
import dns from 'dns';

// Ensure DNS SRV lookups for MongoDB Atlas resolve reliably across all networks
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (_) {}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://codebyqamarshah_db_user:Syed-123%40345@stoofi.btgzyb6.mongodb.net/stoofi?appName=stoofi';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState === 1) {
    cached.conn = mongoose.connection;
    return cached.conn;
  }

  if (mongoose.connection.readyState === 2 && cached.promise) {
    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (_) {
      cached.promise = null;
      cached.conn = null;
    }
  }

  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('✅ Next.js API connected to MongoDB Atlas Live!');
      cached.conn = mongooseInstance;
      return mongooseInstance;
    }).catch((err) => {
      cached.promise = null;
      cached.conn = null;
      console.error('❌ MongoDB Atlas connection error:', err.message);
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.conn = null;
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
