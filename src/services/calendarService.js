const { getCalendarClient } = require('../config/google');
const { WORKING_HOURS, SLOT_DURATION_MINUTES, BUFFER_MINUTES, MAX_SLOTS_TO_SHOW } = require('../config/constants');

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';

// Returns busy time blocks from Google Calendar for the next N days
const getBusySlots = async (daysAhead = 7) => {
  const calendar = getCalendarClient();
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + daysAhead);

  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin: now.toISOString(),
      timeMax: future.toISOString(),
      timeZone: 'Africa/Nairobi',
      items: [{ id: CALENDAR_ID }],
    },
  });

  return res.data.calendars[CALENDAR_ID].busy || [];
};

// Generate candidate slots within working hours
const generateCandidateSlots = (daysAhead = 7, slotDuration = SLOT_DURATION_MINUTES) => {
  const slots = [];
  const now = new Date();

  for (let d = 0; d < daysAhead; d++) {
    const day = new Date(now);
    day.setDate(day.getDate() + d);

    const dayOfWeek = day.getDay();
    if (!WORKING_HOURS.workingDays.includes(dayOfWeek)) continue;

    const [startH, startM] = WORKING_HOURS.start.split(':').map(Number);
    const [endH, endM] = WORKING_HOURS.end.split(':').map(Number);
    const [lunchStartH, lunchStartM] = WORKING_HOURS.lunchStart.split(':').map(Number);
    const [lunchEndH, lunchEndM] = WORKING_HOURS.lunchEnd.split(':').map(Number);

    let cursor = new Date(day);
    cursor.setHours(startH, startM, 0, 0);

    const dayEnd = new Date(day);
    dayEnd.setHours(endH, endM, 0, 0);

    while (cursor < dayEnd) {
      const slotEnd = new Date(cursor.getTime() + slotDuration * 60000);
      if (slotEnd > dayEnd) break;

      // Skip lunch
      const lunchStart = new Date(day);
      lunchStart.setHours(lunchStartH, lunchStartM, 0, 0);
      const lunchEnd = new Date(day);
      lunchEnd.setHours(lunchEndH, lunchEndM, 0, 0);

      const overlapsLunch = cursor < lunchEnd && slotEnd > lunchStart;
      const isInPast = cursor <= now;

      if (!overlapsLunch && !isInPast) {
        slots.push({ start: new Date(cursor), end: new Date(slotEnd) });
      }

      cursor = new Date(cursor.getTime() + (slotDuration + BUFFER_MINUTES) * 60000);
    }
  }

  return slots;
};

// Filter out busy slots and return the next available ones
const getAvailableSlots = async (slotDuration = SLOT_DURATION_MINUTES) => {
  const busySlots = await getBusySlots();
  const candidates = generateCandidateSlots(14, slotDuration);

  const available = candidates.filter((slot) => {
    return !busySlots.some((busy) => {
      const busyStart = new Date(busy.start);
      const busyEnd = new Date(busy.end);
      return slot.start < busyEnd && slot.end > busyStart;
    });
  });

  return available.slice(0, MAX_SLOTS_TO_SHOW);
};

// Create a confirmed calendar event
const createCalendarEvent = async ({ clientName, clientPhone, service, startTime, endTime, notes = '' }) => {
  const calendar = getCalendarClient();

  const event = {
    summary: `${service} — ${clientName}`,
    description: `Client: ${clientName}\nPhone: ${clientPhone}\nService: ${service}\n${notes}`,
    start: { dateTime: startTime.toISOString(), timeZone: 'Africa/Nairobi' },
    end: { dateTime: endTime.toISOString(), timeZone: 'Africa/Nairobi' },
  };

  const res = await calendar.events.insert({
    calendarId: CALENDAR_ID,
    requestBody: event,
  });

  return res.data.id;
};

// Delete a calendar event (cancellation)
const deleteCalendarEvent = async (eventId) => {
  const calendar = getCalendarClient();
  await calendar.events.delete({ calendarId: CALENDAR_ID, eventId });
};

// Format a slot for display in WhatsApp message
const formatSlot = (slot, index) => {
  const options = {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit', hour12: true,
    timeZone: 'Africa/Nairobi',
  };
  return `${index + 1}. ${slot.start.toLocaleString('en-KE', options)}`;
};

module.exports = { getAvailableSlots, createCalendarEvent, deleteCalendarEvent, formatSlot };
