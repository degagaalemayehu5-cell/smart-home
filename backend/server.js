require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); // Added for file path handling
const connectDB = require('./config/db');
const sensorRoutes = require('./routes/sensorRoutes');

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// 1. API Routes
app.use('/api/sensors', sensorRoutes);

// 2. Serve Static Assets (Frontend)
// This tells Express to serve the built React files from the 'dist' folder
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// 3. The "Catch-All" Route
// If someone visits a page like /dashboard, send them the React index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// 4. Server Start
// Note: We removed the hardcoded IP '10.15.156.2' so Render can bind automatically
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📂 Serving frontend from: ${frontendPath}`);
});