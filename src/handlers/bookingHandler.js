const { v4: uuidv4 } = require('crypto').webcrypto
  ? require('crypto')
  : require('crypto');
const Appointment = require('../models/Appointment');
const { createCalendarEvent, deleteCalendarEvent, getAvailableSlots } = require('../services/calendarService');
const { sendMessage } = require('../services/whatsappService');

// Generate a short reference like APT-20260519-3821
const generateRef = () => {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `APT-${d}-${rand}`;
};

const confirmBooking = async ({ clientPhone, clientName, service, slotStart, slotEnd, language = 'en' }) => {
  const appointmentId = generateRef();

  const calendarEventId = await createCalendarEvent({
    clientName,
    clientPhone,
    service,
    startTime: slotStart,
    endTime: slotEnd,
  });

  const appointment = await Appointment.create({
    appointmentId,
    clientName,
    clientPhone,
    service,
    date: slotStart.toISOString().slice(0, 10),
    startTime: slotStart.toISOString().slice(11, 16),
    endTime: slotEnd.toISOString().slice(11, 16),
    calendarEventId,
    language,
    status: 'confirmed',
  });

  const summary =
    `Your appointment is confirmed!\n\n` +
    `Service: ${service}\n` +
    `Date: ${appointment.date}\n` +
    `Time: ${appointment.startTime} – ${appointment.endTime}\n` +
    `Location: ${process.env.BUSINESS_LOCATION}\n` +
    `Reference: ${appointmentId}\n\n` +
    `You will receive a reminder 24 hours before.\n` +
    `Reply CANCEL anytime to cancel.`;

  await sendMessage(clientPhone, summary);
  return appointment;
};

const cancelBooking = async (phone) => {
  const apt = await Appointment.findOne({ clientPhone: phone, status: 'confirmed' });
  if (!apt) return null;

  if (apt.calendarEventId) {
    await deleteCalendarEvent(apt.calendarEventId);
  }

  apt.status = 'cancelled';
  await apt.save();
  return apt;
};

module.exports = { confirmBooking, cancelBooking };
