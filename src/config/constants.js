module.exports = {
  SLOT_DURATION_MINUTES: 60,
  BUFFER_MINUTES: 15,
  WORKING_HOURS: {
    weekday: {
      start: '08:00',
      end: '19:00',
      lunchStart: '13:00',
      lunchEnd: '14:00',
    },
    saturday: {
      start: '09:00',
      end: '16:00',
      lunchStart: '13:00',
      lunchEnd: '14:00',
    },
    workingDays: [1, 2, 3, 4, 5, 6], // Mon–Sat
  },
  MAX_SLOTS_TO_SHOW: 3,
  SESSION_EXCHANGES_LIMIT: 5,
  REMINDER_HOURS_BEFORE: [24, 2],

  SERVICES: [
    { id: '1', name: 'Individual Therapy', duration: 60, price: 'KES 4,500' },
    { id: '2', name: 'Couples & Marriage Counselling', duration: 60, price: 'KES 6,500' },
    { id: '3', name: 'Child & Adolescent Therapy', duration: 60, price: 'KES 5,000' },
    { id: '4', name: 'Addiction Recovery Program', duration: 60, price: 'KES 18,000/month' },
    { id: '5', name: 'Family Therapy', duration: 90, price: 'KES 7,500' },
    { id: '6', name: 'Corporate Wellness Workshop', duration: 120, price: 'Starting at KES 35,000' },
  ],
};
