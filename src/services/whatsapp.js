const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendMessage(to, message) {
  try {
    const response = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${to}`,
      body: message
    });
    console.log(`✅ Message sent to ${to}: ${response.sid}`);
    return response;
  } catch (err) {
    console.error(`❌ Failed to send message to ${to}:`, err.message);
    throw err;
  }
}

module.exports = { sendMessage };