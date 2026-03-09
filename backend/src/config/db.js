const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || '';

  // Skip MongoDB if no URI configured — use in-memory store instead
  if (!uri || uri.includes('localhost') && process.env.USE_MEMORY_STORE !== 'false') {
    try {
      await mongoose.connect(uri || 'mongodb://localhost:27017/gov-scheme-db', {
        serverSelectionTimeoutMS: 2000,
      });
      console.log('✅ MongoDB Connected');
      global.useMemoryStore = false;
    } catch {
      console.log('⚠️  MongoDB not available — running with in-memory store (data resets on restart)');
      global.useMemoryStore = true;
    }
    return;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    global.useMemoryStore = false;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('⚠️  Falling back to in-memory store.');
    global.useMemoryStore = true;
  }
};

module.exports = connectDB;
