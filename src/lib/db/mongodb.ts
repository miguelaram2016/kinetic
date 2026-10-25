import mongoose from 'mongoose';
import { getMongoConnectionOptions } from './connection-policy';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function dbConnect(): Promise<typeof mongoose> {
  // A warm serverless instance can retain a disconnected Mongoose object.
  // A resolved cached promise must also be cleared before reconnecting.
  if (cached.conn?.connection.readyState === 1) {
    return cached.conn;
  }

  if (cached.conn) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const { uri, options } = getMongoConnectionOptions(process.env);
    cached.promise = mongoose.connect(uri, options);
  }

  try {
    const connection = await cached.promise;
    if (connection.connection.readyState !== 1) {
      throw new Error('MongoDB connection is not ready');
    }
    cached.conn = connection;
    return connection;
  } catch (error) {
    // Do not cache rejections or disconnected connections across requests.
    cached.conn = null;
    cached.promise = null;
    throw error;
  }
}

export default dbConnect;
