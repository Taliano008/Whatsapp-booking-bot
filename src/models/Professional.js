const mongoose = require('mongoose');

const professionalSchema = new mongoose.Schema({
  professionalId: { type: String, required: true, unique: true },
  name: String,
  calendarId: String,
  whatsappNumber: String,
  workingDays: [Number],
  startTime: String,
  endTime: String,
  lunchBreak: {
    start: String,
    end: String,
  },
  slotDuration: { type: Number, default: 60 },
  bufferMinutes: { type: Number, default: 15 },
  timezone: { type: String, default: 'Africa/Nairobi' },
});

module.exports = mongoose.model('Professional', professionalSchema);
