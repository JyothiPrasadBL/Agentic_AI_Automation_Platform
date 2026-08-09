const mongoose = require('mongoose');
const { mongoUri } = require('./env');

let mode = 'memory';

async function connectDatabase() {
  if (!mongoUri) {
    console.info('MONGODB_URI is not configured; using in-memory data store.');
    return mode;
  }
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    mode = 'mongo';
    console.info('MongoDB connected.');
  } catch (error) {
    console.warn(`MongoDB unavailable; using in-memory data store. (${error.message})`);
  }
  return mode;
}

function databaseMode() {
  return mode;
}

module.exports = { connectDatabase, databaseMode };
