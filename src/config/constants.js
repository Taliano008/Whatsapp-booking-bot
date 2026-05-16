module.exports = {
  SLOT_DURATION_MINUTES: 60,
  BUFFER_MINUTES: 15,
  WORKING_HOURS: {
    start: '08:00',
    end: '17:00',
    lunchStart: '13:00',
    lunchEnd: '14:00',
    workingDays: [1, 2, 3, 4, 5], // Mon–Fri (0=Sun)
  },
  MAX_SLOTS_TO_SHOW: 3,
  SESSION_EXCHANGES_LIMIT: 5,
  REMINDER_HOURS_BEFORE: [24, 2],

  SERVICES: [
    { id: '1', name: 'Individual therapy', duration: 60 },
    { id: '2', name: 'Couples therapy', duration: 60 },
    { id: '3', name: 'Family therapy', duration: 90 },
    { id: '4', name: 'Initial consultation', duration: 60 },
    { id: '5', name: 'Follow-up session', duration: 30 },
  ],
};
