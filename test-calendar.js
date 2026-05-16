require('dotenv').config();
const { getAvailableSlots, createCalendarEvent } = require('./src/services/calendarService');

(async () => {
  try {
    console.log('Testing Google Calendar Event Creation...');
    console.log(`Using Calendar ID: ${process.env.GOOGLE_CALENDAR_ID}`);

    // Get an available slot first
    const slots = await getAvailableSlots();
    if (slots.length === 0) {
      console.log('❌ No available slots found to create a test event.');
      return;
    }

    const testSlot = slots[0];
    console.log(`Found a slot: ${testSlot.start} to ${testSlot.end}`);

    // Create a test event
    const eventId = await createCalendarEvent({
      clientName: 'Test Client',
      clientPhone: '+254700000000',
      service: 'Individual Therapy (Test)',
      startTime: testSlot.start,
      endTime: testSlot.end,
      notes: 'This is an automated test event.',
    });

    console.log('✅ Event successfully created!');
    console.log(`Event ID: ${eventId}`);
    console.log('Check your Google Calendar to see the new event.');

  } catch (error) {
    console.error('❌ Calendar event creation failed:');
    if (error.response && error.response.data) {
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
})();
