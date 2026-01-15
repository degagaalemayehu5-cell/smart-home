const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');

// --- 1. SPECIAL ANALYTICS ROUTE (Must be first) ---
// This handles: GET /api/sensors/analytics
router.get('/analytics', sensorController.getAnalytics);

// --- 2. STANDARD DATA ROUTES ---
// This handles: POST /api/sensors (from NodeMCU)
router.post('/', sensorController.recordData);

// This handles: GET /api/sensors (for the Dashboard list)
router.get('/', sensorController.getLiveData);

module.exports = router;