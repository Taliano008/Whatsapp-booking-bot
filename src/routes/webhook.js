const express = require('express');
const router = express.Router();
const { handleVerification, handleIncomingMessage } = require('../handlers/webhookHandler');

// [1] Meta webhook verification (GET) — delegates to handleVerification in webhookHandler
router.get('/', handleVerification);

// [2] Incoming messages (POST) — acknowledge immediately, then process
router.post('/', async (req, res) => {
  // Acknowledge immediately — WhatsApp requires a fast 200
  res.sendStatus(200);

  try {
    const body = req.body;
    if (body.object !== 'whatsapp_business_account') return;

    const entry   = body.entry?.[0];
    const change  = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (!message || message.type !== 'text') return;

    const phone = message.from;
    const text  = message.text.body;

    await handleIncomingMessage(phone, text);
  } catch (err) {
    console.error('Webhook processing error:', err.message);
  }
});

module.exports = router;
