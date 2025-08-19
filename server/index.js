import express from "express";
import cors from "cors"
import vehicleRoutes from "./routes/vehicles.js";
import driverRoutes from "./routes/drivers.js"
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();
import vehicleUpdates from "./routes/vehicleUpdates.js";
const vehicles = JSON.parse(fs.readFileSync("./data/vehicles.json", "utf-8"));
const app = express();
app.use(cors());
app.use(express.json());
app.get('/api/vehicles', (req, res) => {
  res.json(vehicles);
});

app.use("/api/vehicle-updates", vehicleUpdates);
import { sendWhatsApp } from "./utils/sendWhatsApp.js";
sendWhatsApp(process.env.MY_PHONE_NUMBER, "Hello from Twilio test!");


app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);

//const PORT = 3001;
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚚 Backend server running on http://localhost:${PORT}`);
});


app.get('/api/vehicle/:id/location', (req, res) => {
  const vehicle = vehicles.find(v => v.id === req.params.id);
  if (vehicle) {
    res.json({ lat: vehicle.lat, lng: vehicle.lng });
  } else {
    res.status(404).json({ error: 'Vehicle not found' });
  }
});

app.listen(3001, () => {
  console.log('🚚 Backend server running at http://localhost:3001');
});