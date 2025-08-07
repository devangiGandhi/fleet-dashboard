const express = require('express');
const router = express.Router();
const drivers = require('../data/drivers.json');

router.get('/', (req, res) => {
  res.json(drivers);
});

router.get('/:id', (req, res) => {
  const driver = drivers.find(d => d.id === req.params.id);
  if (driver) {
    res.json(driver);
  } else {
    res.status(404).json({ error: 'Driver not found' });
  }
});

module.exports = router;
