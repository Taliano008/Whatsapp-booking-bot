const express = require('express');
const router = express.Router();
const { handleIncomingMessage } = require('../handlers/webhookHandler');

// Meta webhook verification
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('Webhook verified');
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// Incoming messages
router.post('/', async (req, res) => {
  // Acknowledge immediately — WhatsApp requires a fast 200
  res.sendStatus(200);

  try {
    const body = req.body;
    if (body.object !== 'whatsapp_business_account') return;

    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (!message || message.type !== 'text') return;

    const phone = message.from;
    const text = message.text.body;

    await handleIncomingMessage(phone, text);
  } catch (err) {
    console.error('Webhook processing error:', err.message);
  }
});

module.exports = router;
