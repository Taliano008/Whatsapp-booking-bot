const { getOrCreateClient, addToHistory, getHistory } = require('./sessionHandler');
const { cancelBooking } = require('./bookingHandler');
const { getAIResponse } = require('../services/claudeService');
const { getAvailableSlots } = require('../services/calendarService');
const { detectLanguage } = require('../services/languageService');
const { sendMessage } = require('../services/whatsappService');
const Client = require('../models/Client');

// Track human handoff state in memory (extend to Redis for scale)
const handoffActive = new Set();

const handleIncomingMessage = async (phone, messageText) => {
  const text = messageText.trim();

  // --- Human handoff ---
  if (text.toLowerCase() === 'speak to someone') {
    handoffActive.add(phone);
    await sendMessage(phone, 'No problem — a member of our team will be with you shortly. Please hold on.');
    // TODO: alert receptionist via WhatsApp
    return;
  }

  // Receptionist returns control with #bot
  if (text === '#bot') {
    handoffActive.delete(phone);
    await sendMessage(phone, 'You are back with the assistant. How can I help you?');
    return;
  }

  if (handoffActive.has(phone)) {
    // Conversation is with a human — do not respond
    return;
  }

  // --- CANCEL command ---
  if (text.toUpperCase() === 'CANCEL') {
    const cancelled = await cancelBooking(phone);
    if (cancelled) {
      await sendMessage(phone, `Your appointment on ${cancelled.date} at ${cancelled.startTime} has been cancelled. We hope to see you again soon.`);
    } else {
      await sendMessage(phone, 'I could not find an active booking for your number. If you need help, type "speak to someone".');
    }
    return;
  }

  // --- RESCHEDULE command ---
  if (text.toUpperCase() === 'RESCHEDULE') {
    await cancelBooking(phone);
    await sendMessage(phone, 'Your previous booking has been cancelled. Let me find you a new slot...');
    // Fall through to normal flow — Claude will handle the rebooking
  }

  // --- Normal AI flow ---
  const client = await getOrCreateClient(phone);
  const lang = detectLanguage(text);

  // Update language preference
  await Client.updateOne({ phone }, { language: lang });

  const history = await getHistory(phone);
  history.push({ role: 'user', content: text });

  // Fetch available slots for Claude context
  let slots = [];
  try {
    slots = await getAvailableSlots();
  } catch (e) {
    console.error('Calendar fetch failed:', e.message);
  }

  const returningClient = client.name ? { name: client.name, phone } : null;

  let reply;
  try {
    reply = await getAIResponse(history, slots, returningClient);
  } catch (e) {
    console.error('Claude API error:', e.message);
    reply = 'Sorry, I am having a technical issue. Please try again in a moment or type "speak to someone" to reach our team.';
  }

  await addToHistory(phone, 'user', text);
  await addToHistory(phone, 'assistant', reply);

  await sendMessage(phone, reply);
};

module.exports = { handleIncomingMessage };
