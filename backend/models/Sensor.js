const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
  temp: { type: Number, default: 0 },
  hum: { type: Number, default: 0 },
  lux: { type: Number, default: 0 },
  motion: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sensor', sensorSchema);