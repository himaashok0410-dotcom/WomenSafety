const mongoose = require('mongoose');
const fallbackStore = require('../storage/store');

let isConnectedToMongo = false;
let dbStatus = {
  mode: 'fallback_json_store',
  connected: false,
  message: 'Using persistent JSON storage fallback for local development.'
};

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri || mongoUri.includes('<username>') || mongoUri.trim() === '') {
    console.log('\x1b[33m%s\x1b[0m', 'ℹ [SafeHer DB] No MONGO_URI configured. Running in Development Fallback JSON Storage mode.');
    dbStatus = {
      mode: 'fallback_json_store',
      connected: true,
      message: 'Running in robust local JSON file storage fallback. Data is persisted in server/data/.'
    };
    return;
  }

  try {
    console.log('🔄 [SafeHer DB] Attempting connection to MongoDB Atlas...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
    isConnectedToMongo = true;
    dbStatus = {
      mode: 'mongodb_atlas',
      connected: true,
      message: 'Successfully connected to MongoDB database.'
    };
    console.log('\x1b[32m%s\x1b[0m', '✅ [SafeHer DB] Connected to MongoDB Atlas successfully.');
  } catch (err) {
    isConnectedToMongo = false;
    dbStatus = {
      mode: 'fallback_json_store',
      connected: true,
      message: `MongoDB connection failed (${err.message}). Safely fallen back to local persistent JSON storage.`
    };
    console.warn('\x1b[33m%s\x1b[0m', `⚠️ [SafeHer DB] MongoDB connection failed: ${err.message}. Using fallback storage engine.`);
  }
}

function getDatabase() {
  return fallbackStore;
}

function getDBStatus() {
  return dbStatus;
}

module.exports = {
  connectDB,
  getDatabase,
  getDBStatus,
  isConnectedToMongo: () => isConnectedToMongo
};
