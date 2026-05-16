const { CronJob } = require('cron');
const Appointment = require('../models/Appointment');
const { sendMessage } = require('./whatsappService');

const sendReminder = async (appointment, hoursLabel) => {
  const msg =
    `Reminder: You have an appointment tomorrow.\n\n` +
    `Service: ${appointment.service}\n` +
    `Date: ${appointment.date}\n` +
    `Time: ${appointment.startTime}\n` +
    `Location: ${process.env.BUSINESS_LOCATION}\n\n` +
    `Reply CANCEL to cancel or RESCHEDULE to change your time.`;

  await sendMessage(appointment.clientPhone, msg);

  await Appointment.updateOne(
    { appointmentId: appointment.appointmentId },
    { $push: { remindersSent: hoursLabel } }
  );
};

const checkAndSendReminders = async () => {
  const now = new Date();
  const appointments = await Appointment.find({ status: 'confirmed' });

  for (const apt of appointments) {
    const aptDateTime = new Date(`${apt.date}T${apt.startTime}:00+03:00`);
    const hoursUntil = (aptDateTime - now) / 3600000;

    if (hoursUntil > 23 && hoursUntil <= 25 && !apt.remindersSent.includes('24h')) {
      await sendReminder(apt, '24h');
    }

    if (hoursUntil > 1.5 && hoursUntil <= 2.5 && !apt.remindersSent.includes('2h')) {
      await sendReminder(apt, '2h');
    }
  }
};

const startScheduler = () => {
  // Run every 30 minutes
  new CronJob('*/30 * * * *', checkAndSendReminders, null, true, 'Africa/Nairobi');
  console.log('Reminder scheduler started');
};

module.exports = { startScheduler };
