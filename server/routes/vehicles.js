const express = require('express');
const router = express.Router();
const vehicles = require('../data/vehicles.json');

router.get('/', (req, res) => {
  res.json(vehicles);
});

router.get('/:id', (req, res) => {
  const vehicle = vehicles.find(v => v.id === req.params.id);
  if (vehicle) {
    res.json(vehicle);
  } else {
    res.status(404).json({ error: 'Vehicle not found' });
  }
});

module.exports = router;
