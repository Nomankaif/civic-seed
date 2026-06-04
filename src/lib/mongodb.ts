import mongoose from "mongoose";

const rawUri = process.env.MONGODB_URI || "";
const MONGODB_URI = rawUri.replace(/^["']|["']$/g, "").trim();

const rawDbName = process.env.MONGODB_DB_NAME || "civicbuild_connect";
const MONGODB_DB_NAME = rawDbName.replace(/^["']|["']$/g, "").trim();

// Disable buffering globally so queries fail fast (no 10s hangs) if not connected
mongoose.set("bufferCommands", false);

if (!MONGODB_URI) {
  console.warn("WARNING: MONGODB_URI environment variable is not defined. Local mock/in-memory data will be used.");
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

  if (!MONGODB_URI || (!MONGODB_URI.startsWith("mongodb://") && !MONGODB_URI.startsWith("mongodb+srv://"))) {
    console.warn(
      `WARNING: MONGODB_URI is not defined or has an invalid scheme. ` +
      `URI length: ${MONGODB_URI.length}, Starts with: "${MONGODB_URI.substring(0, 15)}...". ` +
      `Skipping database connection.`
    );
    return null;
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
