# WhatsApp Booking Bot for Serenity Springs Wellness Centre

A Node.js/Express application that integrates **WhatsApp Cloud API**, **Claude (Anthropic) AI**, **Google Calendar**, and **MongoDB** to automate appointment booking for the Serenity Springs Wellness Centre.

---

## 📚 Overview

- **WhatsApp Bot** – Handles incoming messages via Meta's WhatsApp Cloud API.
- **AI Persona** – Powered by Claude, providing a warm, professional tone aligned with the centre’s branding.
- **Google Calendar Integration** – Reads available slots and creates events automatically.
- **MongoDB** – Stores client and appointment data.
- **Admin UI** – (future) to manage services, therapists, and bookings.

---

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Taliano008/Whatsapp-booking-bot.git
   cd Whatsapp-booking-bot
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Create a `.env` file** (copy from `.env.example` if you have one) and fill in the required values:
   ```dotenv
   # Server
   PORT=3000
   NODE_ENV=development

   # WhatsApp / Meta
   WHATSAPP_TOKEN=YOUR_WHATSAPP_TOKEN
   WHATSAPP_PHONE_NUMBER_ID=YOUR_PHONE_NUMBER_ID
   WHATSAPP_BUSINESS_ACCOUNT_ID=YOUR_BUSINESS_ACCOUNT_ID
   WEBHOOK_VERIFY_TOKEN=YOUR_VERIFY_TOKEN

   # Anthropic (Claude)
   ANTHROPIC_API_KEY=YOUR_ANTHROPIC_API_KEY

   # Google Calendar
   GOOGLE_SERVICE_ACCOUNT_FILE=./credentials/google-service-account.json
   GOOGLE_CALENDAR_ID=YOUR_GOOGLE_CALENDAR_ID   # e.g. abc123@group.calendar.com

   # MongoDB
   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority

   # Business Config (Serenity Springs)
   BUSINESS_NAME="Serenity Springs Wellness Centre"
   BUSINESS_LOCATION="KFA Building, 3rd Floor, Kenyatta Avenue, Nakuru"
   TIMEZONE=Africa/Nairobi
   ```
4. **Enable Google Calendar API**
   - Open the Google Cloud console, enable *Google Calendar API* for the project.
   - Share the target calendar with the service‑account email (`booking-bot-service@whatsapp-booking-bot-496507.iam.gserviceaccount.com`) **with "Make changes to events"** permission.
5. **Run the bot**
   ```bash
   npm start   # runs server.js on PORT (default 3000)
   ```
   Or for hot‑reloading during development:
   ```bash
   npm run dev
   ```
6. **Test Google Calendar integration**
   ```bash
   node test-calendar.js
   ```
   The script will fetch an available slot and create a test event (e.g., "John – Drugs counselling").

---

## 📂 Project Structure

```
whatsapp-booking-bot/
├─ src/
│  ├─ config/          # db.js, google.js, constants.js
│  ├─ models/          # Mongoose schemas (Appointment, Client, Professional)
│  ├─ services/        # calendarService.js, claudeService.js, whatsappService.js, etc.
│  └─ routes/          # webhook route handling
├─ credentials/        # Google service‑account JSON (keep secret!)
├─ test-calendar.js    # Simple script to verify calendar connection & event creation
├─ list-calendars.js   # Helper to list calendars accessible by the service account
├─ .env                # Environment variables (do NOT commit!)
├─ .gitignore          # Excludes node_modules, .env, credentials, etc.
└─ package.json
```

---

## 📤 Pushing Changes to GitHub

After you make changes (e.g., adding the README or updating code):
```bash
git add .
git commit -m "Add README with setup instructions"
git push origin main
```
Make sure your `.gitignore` keeps sensitive files (`.env`, `credentials/`) out of the repo.

---

## 🛠️ Troubleshooting

- **Port already in use** – Kill the process using `netstat -ano | find "3000"` and then `taskkill /PID <pid> /F`.
- **Google Calendar permission errors** – Verify the service‑account email has *Make changes to events* on the calendar ID you set in `.env`.
- **MongoDB connection error** – Ensure `MONGODB_URI` is a proper connection string and the database user has read/write rights.

---

## 🎉 Enjoy!

You now have a fully‑functional WhatsApp appointment‑booking bot tailored for **Serenity Springs Wellness Centre**. Feel free to extend it with more services, richer AI prompts, or a front‑end dashboard.
