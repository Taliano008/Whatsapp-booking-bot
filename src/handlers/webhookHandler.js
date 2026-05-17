/**
 * webhookHandler.js
 * =================
 * Full Webhook Connection Flow
 * ----------------------------
 *
 *  Meta Platform                        This Server (/webhook)
 *  ─────────────────────────────────────────────────────────────
 *
 *  [1] VERIFICATION (one-time setup)
 *
 *      Meta ──GET /webhook?hub.mode=subscribe
 *                        &hub.verify_token=<secret>
 *                        &hub.challenge=<nonce>──► handleVerification()
 *                                                      │
 *                                         token match? │
 *                                              ├─ YES ─► 200 + echo challenge ◄── Meta confirms webhook ✓
 *                                              └─ NO  ─► 403 Forbidden
 *
 *  [2] LIVE MESSAGES (every conversation turn)
 *
 *      User sends WhatsApp msg
 *            │
 *            ▼
 *      Meta ──POST /webhook──► handleIncomingMessage(phone, text)
 *                                      │
 *                         ┌───────────▼──────────────┐
 *                         │  Human-handoff check      │
 *                         │  "speak to someone" / #bot│
 *                         └───────────┬──────────────┘
 *                                     │
 *                         ┌───────────▼──────────────┐
 *                         │  Command check            │
 *                         │  CANCEL / RESCHEDULE      │
 *                         └───────────┬──────────────┘
 *                                     │
 *                         ┌───────────▼──────────────┐
 *                         │  AI Flow                  │
 *                         │  getOrCreateClient()      │
 *                         │  detectLanguage()         │
 *                         │  getHistory()             │
 *                         │  getAvailableSlots()      │
 *                         │  getAIResponse() [Claude] │
 *                         │  addToHistory()           │
 *                         │  sendMessage() [WA API]   │
 *                         └──────────────────────────┘
 */

'use strict';

const { getOrCreateClient, addToHistory, getHistory } = require('./sessionHandler');
const { cancelBooking } = require('./bookingHandler');
const { getAIResponse } = require('../services/claudeService');
const { getAvailableSlots } = require('../services/calendarService');
const { detectLanguage } = require('../services/languageService');
const { sendMessage } = require('../services/whatsappService');
const Client = require('../models/Client');

// ─── Webhook Verification ────────────────────────────────────────────────────

/**
 * handleVerification
 * Responds to Meta's one-time GET challenge when registering the webhook.
 * The WEBHOOK_VERIFY_TOKEN in .env must match what is set in the Meta dashboard.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
const handleVerification = (req, res) => {
  const mode      = req.query['hub.mode'];
  const token     = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('[Webhook] Verification attempt — mode:', mode);

  if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    console.log('[Webhook] ✅ Verified successfully');
    return res.status(200).send(challenge);
  }

  console.warn('[Webhook] ❌ Verification failed — token mismatch or bad mode');
  return res.sendStatus(403);
};

// ─── Human Handoff State ─────────────────────────────────────────────────────

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

module.exports = { handleVerification, handleIncomingMessage };
