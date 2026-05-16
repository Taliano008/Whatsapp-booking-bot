require('dotenv').config();
const { getCalendarClient } = require('./src/config/google');

(async () => {
  try {
    const calendar = getCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    console.log(`Checking metadata for calendar: ${calendarId}`);
    const res = await calendar.calendars.get({ calendarId });
    console.log('Successfully retrieved calendar metadata:');
    console.log(`Summary: ${res.data.summary}`);
    console.log(`Timezone: ${res.data.timeZone}`);
  } catch (error) {
    console.error('Error fetching calendar metadata:', error.message);
  }
})();
