import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "civicbuild_connect";

if (!MONGODB_URI) {
  console.warn("WARNING: MONGODB_URI environment variable is not defined. Local mock/in-memory data might be needed if database is offline.");
}

interface MongooseGlobal {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend global type safely
declare global {
  var mongooseGlobal: MongooseGlobal | undefined;
}

let cached = global.mongooseGlobal || { conn: null, promise: null };

if (!global.mongooseGlobal) {
  global.mongooseGlobal = cached;
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      dbName: MONGODB_DB_NAME,
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
