// server/utils/sendWhatsApp.js
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

// Create Twilio client using your credentials from .env
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendWhatsApp(to, message) {
  try {
    await client.messages.create({
      from: "whatsapp:" + process.env.TWILIO_WHATSAPP_NUMBER, // Your Twilio sandbox number
      to: "whatsapp:" + to, // Recipient
      body: message
    });
    console.log(`✅ WhatsApp message sent to ${to}`);
  } catch (err) {
    console.error("❌ Failed to send WhatsApp:", err);
  }
}
