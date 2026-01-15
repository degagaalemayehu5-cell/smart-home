const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');

// Standard live data and recording
router.post('/', sensorController.recordData);
router.get('/', sensorController.getLiveData);

// The new analytics endpoint
router.get('/analytics', sensorController.getAnalytics);

module.exports = router;