import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

// Extend global type safely without using var
type MongooseGlobal = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // Only modify global once
  namespace NodeJS {
    interface Global {
      _mongoose: MongooseGlobal;
    }
  }
}

// Initialize the global object if not already
const globalWithMongoose = global as typeof global & {
  _mongoose?: MongooseGlobal;
};

if (!globalWithMongoose._mongoose) {
  globalWithMongoose._mongoose = {
    conn: null,
    promise: null,
  };
}

async function dbConnect() {
  const cached = globalWithMongoose._mongoose!;

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => mongoose);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default dbConnect;
