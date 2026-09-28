import mongoose, { type Model, type Schema } from "mongoose";

const globalCache = globalThis as unknown as {
  __uaeJobMongoose?: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
    failedAt: number;
  };
};

function cache() {
  if (!globalCache.__uaeJobMongoose) {
    globalCache.__uaeJobMongoose = { conn: null, promise: null, failedAt: 0 };
  }
  return globalCache.__uaeJobMongoose;
}

export async function connectDB() {
  const state = cache();
  if (state.conn) return state.conn;
  if (state.failedAt && Date.now() - state.failedAt < 15_000) return null;

  if (process.env.NEXT_RUNTIME) {
    try {
      const { connection } = await import("next/server");
      await connection();
    } catch {
      // Scripts run outside a Next.js request.
    }
  }

  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) return null;

  try {
    if (!state.promise) {
      state.promise = mongoose.connect(uri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
      });
    }
    state.conn = await state.promise;
    state.failedAt = 0;
    return state.conn;
  } catch (error) {
    state.promise = null;
    state.conn = null;
    state.failedAt = Date.now();
    console.error("MongoDB connection failed", error instanceof Error ? error.message : error);
    return null;
  }
}

export function registerModel<T>(name: string, schema: Schema<T>): Model<T> {
  return (mongoose.models[name] as Model<T> | undefined) ?? mongoose.model<T>(name, schema);
}
