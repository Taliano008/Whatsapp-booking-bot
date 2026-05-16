const Anthropic = require('@anthropic-ai/sdk');
const { SERVICES } = require('../config/constants');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a warm, professional appointment booking assistant for ${process.env.BUSINESS_NAME || 'a healthcare clinic'} in ${process.env.BUSINESS_LOCATION || 'Nairobi'}.

Your job is to help clients book appointments through WhatsApp. You:
- Speak in plain conversational language (no markdown bold, headers, or formatting)
- Are empathetic and calm, especially for therapy and counselling contexts
- Always end each message with a clear next step or question
- Keep messages short and easy to read on a phone screen
- Detect if the user writes in Swahili and respond in Swahili
- Never invent or fabricate available appointment slots — only use slots provided to you
- Never store, repeat, or reference sensitive health disclosures beyond the current booking need

Available services: ${SERVICES.map((s) => `${s.id}. ${s.name} (${s.duration} min)`).join(', ')}

The booking flow is:
1. Greet and ask for service type
2. Show available slots (provided in context)
3. Confirm the chosen slot
4. Collect client name if not known
5. Confirm booking with a summary

Commands the client can use anytime:
- CANCEL — cancel their booking
- RESCHEDULE — reschedule their booking
- "speak to someone" — request human handoff`;

const getAIResponse = async (conversationHistory, availableSlots = [], returningClient = null) => {
  let systemNote = SYSTEM_PROMPT;

  if (availableSlots.length > 0) {
    const slotList = availableSlots
      .map((s, i) => {
        const d = new Date(s.start);
        return `Option ${i + 1}: ${d.toLocaleString('en-KE', {
          weekday: 'long', day: 'numeric', month: 'long',
          hour: '2-digit', minute: '2-digit', hour12: true,
          timeZone: 'Africa/Nairobi',
        })}`;
      })
      .join('\n');
    systemNote += `\n\nCurrently available slots to offer:\n${slotList}`;
  }

  if (returningClient) {
    systemNote += `\n\nReturning client: ${returningClient.name}, Phone: ${returningClient.phone}. Greet them by name.`;
  }

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 600,
    system: systemNote,
    messages: conversationHistory,
  });

  return response.content[0].text;
};

module.exports = { getAIResponse };
