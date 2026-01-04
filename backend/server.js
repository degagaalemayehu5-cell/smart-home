const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Required for file paths
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 1. IMPORT ROUTES (Make sure the path matches your structure)
const sensorRoutes = require('./routes/sensorRoutes');
app.use('/api/sensors', sensorRoutes);

// --- START OF "ONE URL" LOGIC ---

// 2. Point to the 'dist' folder created by Vite
// Since server.js is inside /backend, we go out (..) and into /frontend/dist
const buildPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(buildPath));

// 3. Catch-all: Send the index.html for any request that isn't an API call
app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
});

// --- END OF "ONE URL" LOGIC ---

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI)
    .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
    .catch((err) => console.log(err));