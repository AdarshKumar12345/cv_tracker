import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cv_tracker';

  try {
    // 10s timeout for remote cloud Atlas connections
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[Database] Connected successfully to MongoDB at ${mongoose.connection.host}`);
  } catch (err: any) {
    if (process.env.NODE_ENV === 'production') {
      console.error(`[Database] Failed to connect to MongoDB Atlas in production: ${err.message}`);
      return;
    }
    console.warn(`[Database] Standard MongoDB connection failed (${err.message}). Starting in-memory MongoDB instance for development...`);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      await mongoose.connect(memUri);
      console.log(`[Database] Connected to In-Memory MongoDB at ${memUri}`);
    } catch (memErr: any) {
      console.error('[Database] Failed to initialize in-memory MongoDB:', memErr);
    }
  }
};
