require('dotenv').config();
const { getCalendarClient } = require('./src/config/google');

(async () => {
  try {
    const calendar = getCalendarClient();
    console.log('Fetching calendar list...');
    const res = await calendar.calendarList.list();
    const calendars = res.data.items;
    
    if (!calendars || calendars.length === 0) {
      console.log('No calendars found for this service account.');
    } else {
      console.log('Calendars accessible by this service account:');
      calendars.forEach(c => {
        console.log(`- Name: ${c.summary}, ID: ${c.id}, Access: ${c.accessRole}`);
      });
    }
  } catch (error) {
    console.error('Error fetching calendar list:', error.message);
  }
})();
