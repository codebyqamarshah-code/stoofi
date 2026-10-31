import mongoose from 'mongoose';
import dns from 'dns';

// Optimize DNS lookup order for cloud environments
try {
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (_) {}

// Only apply custom public DNS resolvers in local development/test if not running in Vercel or AWS Lambda,
// as Vercel AWS Lambda handles DNS SRV resolution via AWS VPC internal Route53.
if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (_) {}
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://codebyqamarshah_db_user:Syed-123%40345@stoofi.btgzyb6.mongodb.net/stoofi?appName=stoofi';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Connection options tuned for MongoDB Atlas Replica Sets on AWS + Vercel Serverless
const connectionOptions = {
  serverSelectionTimeoutMS: 8000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 15000,
  maxPoolSize: 10,
  minPoolSize: 0,
  maxIdleTimeMS: 30000,
  bufferCommands: false,
  retryWrites: true,
  retryReads: true,
};

async function executeConnectWithRetry(retries = 2, delayMs = 350) {
  let lastError;
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      return await mongoose.connect(MONGODB_URI, connectionOptions);
    } catch (err) {
      lastError = err;
      const isTransient =
        err.message?.includes('SSL') ||
        err.message?.includes('tlsv1 alert') ||
        err.message?.includes('MongoNetworkError') ||
        err.message?.includes('ServerSelectionError') ||
        err.message?.includes('ECONNRESET') ||
        err.message?.includes('ETIMEDOUT') ||
        err.name === 'MongooseServerSelectionError';

      if (attempt <= retries && isTransient) {
        console.warn(`[MongoDB Atlas] Transient connection error (attempt ${attempt}/${retries + 1}): ${err.message}. Retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
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
    cached.promise = executeConnectWithRetry()
      .then((mongooseInstance) => {
        console.log('✅ Next.js API connected to MongoDB Atlas Live!');
        cached.conn = mongooseInstance;
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        cached.conn = null;
        console.error('❌ MongoDB Atlas connection error after retries:', err.message);
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
