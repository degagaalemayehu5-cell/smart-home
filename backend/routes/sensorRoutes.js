const express = require('express');
const router = express.Router();
const Sensor = require('../models/Sensor');

// POST: Save data from ESP8266
router.post('/', async (req, res) => {
  try {
    const newData = new Sensor(req.body);
    await newData.save();
    res.status(201).json({ success: true, data: newData });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET: Fetch data for the Dashboard
router.get('/', async (req, res) => {
  try {
    const sensors = await Sensor.find().sort({ timestamp: -1 }).limit(50);
    res.status(200).json(sensors);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;