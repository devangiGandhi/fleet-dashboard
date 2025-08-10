import express from "express";
import { haversineDistance } from "../utils/haversine.js";
import fs from "fs";
const vehicles = JSON.parse(fs.readFileSync("./data/vehicles.json", "utf-8"));
const router = express.Router();

const calculateETA = (vehicle) => {
  const distance = haversineDistance(
    { lat: vehicle.lat, lng: vehicle.lng },
    vehicle.destination
  );
  const etaMinutes = vehicle.speed > 0
    ? Math.round((distance / vehicle.speed) * 60)
    : null;

  return { distance: distance.toFixed(2), eta: etaMinutes };
};

// GET all vehicles with distance & ETA
router.get("/", (req, res) => {
  const updatedVehicles = vehicles.map(v => {
    const { distance, eta } = calculateETA(v);
    return { ...v, distance, eta };
  });
  res.json(updatedVehicles);
});

// GET location by ID
router.get("/:id/location", (req, res) => {
  const vehicle = vehicles.find(v => v.id === req.params.id);
  if (vehicle) {
    res.json({ lat: vehicle.lat, lng: vehicle.lng });
  } else {
    res.status(404).json({ error: "Vehicle not found" });
  }
});

export default router;
