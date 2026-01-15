const mongoose = require('mongoose');

/**
 * Sensor Data Schema
 * This defines how the data from your ESP8266 is stored in MongoDB Atlas.
 */
const sensorSchema = new mongoose.Schema({
  // Temperature in Celsius
  temp: { 
    type: Number, 
    default: 0 
  },
  // Humidity percentage
  hum: { 
    type: Number, 
    default: 0 
  },
  // Light intensity in Lux
  lux: { 
    type: Number, 
    default: 0 
  },
  // Motion detection (true = motion, false = secure)
  // We use Boolean to match the ESP8266 "true/false" payload
  motion: { 
    type: Boolean, 
    default: false 
  },
  // Automatic timestamp for every reading
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

// Export the model so it can be used in your routes and server.js
module.exports = mongoose.model('Sensor', sensorSchema);