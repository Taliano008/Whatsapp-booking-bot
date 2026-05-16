require('dotenv').config();
const express = require('express');
const connectDB = require('./src/config/db');
const webhookRouter = require('./src/routes/webhook');
const reminderService = require('./src/services/reminderService');

const app = express();
app.use(express.json());

connectDB();
reminderService.startScheduler();

app.use('/webhook', webhookRouter);

// Root route – friendly JSON response
app.get('/', (req, res) => {
  res.json({
    message: '👋 Welcome to the Serenity Springs WhatsApp Booking Bot!',
    status: 'ok',
    version: '1.0.0',
    docs: 'https://github.com/Taliano008/Whatsapp-booking-bot#readme'
  });
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bot running on port ${PORT}`));
