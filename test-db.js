require('dotenv').config();
const connectDB = require('./src/config/db');

(async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB connection succeeded');
  } catch (e) {
    console.error('❌ MongoDB connection failed', e.message);
  }
})();
