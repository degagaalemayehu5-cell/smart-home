require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const sensorRoutes = require('./routes/sensorRoutes');

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// 1. API Routes (Place these BEFORE the static assets)
app.use('/api/sensors', sensorRoutes);

// 2. Serve Static Assets (Frontend)
// We use path.resolve to ensure the path is absolute and stable on Render
const frontendPath = path.resolve(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendPath));

// 3. The "Catch-All" Route
// This MUST be the last route. It serves index.html for any non-API request.
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
    if (err) {
      res.status(500).send("Frontend build not found. Did you run 'npm run build'?");
    }
  });
});

// 4. Server Start
// Render automatically assigns a PORT; process.env.PORT is mandatory here.
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📂 Frontend path: ${frontendPath}`);
});