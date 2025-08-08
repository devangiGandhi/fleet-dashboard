const express = require('express');
const cors = require('cors');
const vehicles = require('./data/vehicles.json');

const vehicleRoutes = require('./routes/vehicles');
const driverRoutes = require('./routes/drivers');


const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/vehicles', (req, res) => {
  res.json(vehicles);
});


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