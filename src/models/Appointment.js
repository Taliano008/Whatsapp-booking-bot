const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  appointmentId: { type: String, required: true, unique: true },
  clientName: String,
  clientPhone: { type: String, required: true },
  service: String,
  professional: String,
  date: String,         // YYYY-MM-DD
  startTime: String,    // HH:MM
  endTime: String,      // HH:MM
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'rescheduled', 'completed'],
    default: 'confirmed',
  },
  calendarEventId: String,
  remindersSent: [String],
  language: { type: String, default: 'en' },
  notes: String,
  bookedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Appointment', appointmentSchema);
