const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  name: String,
  email: String,
  language: { type: String, default: 'en' },
  lastSeen: Date,
  sessionHistory: [
    {
      role: { type: String, enum: ['user', 'assistant'] },
      content: String,
      timestamp: Date,
    },
  ],
});

module.exports = mongoose.model('Client', clientSchema);
