// backend/routes/vehicleUpdates.js
import express from 'express';
import { sendWhatsApp } from "../utils/sendWhatsApp.js";
import { haversineDistance } from '../utils/geo.js';

const router = express.Router();

let notificationsEnabled = true; // Toggle control

router.post("/update", async (req, res) => {
  const { vehicleName, status } = req.body;

  const toNumber = process.env.MY_PHONE_NUMBER; // From your .env
    try {
    if (notificationsEnabled) {
    await sendWhatsApp(toNumber, `🚚 ${vehicleName} status: ${status}`);
    res.json({ success: true });

    }
    }catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send WhatsApp" });
  }
});

router.post("/toggle-notifications", (req, res) => {
  notificationsEnabled = !notificationsEnabled;
  res.json({ success: true, notificationsEnabled });
});

router.post('/:id/location', (req, res) => {
  const { lat, lng, destination } = req.body;
  const { id } = req.params;

  const distance = haversineDistance({ lat, lng }, destination);

  if (distance < 1) {
    sendWhatsAppMessage(`🚚 Vehicle ${id} is almost at the destination! ETA: <5 min`);
  }

  res.json({ status: 'Location updated', distance });
});
export default router;

