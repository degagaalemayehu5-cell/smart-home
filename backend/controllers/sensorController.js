const Sensor = require('../models/Sensor');
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

// Separate tracking for different alert types
let lastMotionEmailTime = 0;
let lastTempEmailTime = 0;

// Configurable Cooldowns
const MOTION_COOLDOWN = 5 * 60 * 1000; // 5 minutes for motion
const TEMP_COOLDOWN = 10 * 1000;       // 10 seconds for critical heat

// Email Helper
const sendAlertEmail = async (data, reason) => {
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'degagaalemayehu5@gmail.com',
      subject: '🚨 Smart Home Critical Alert',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #e11d48;">Alert: ${reason}</h2>
          <p><strong>Temperature:</strong> ${data.temp}°C</p>
          <p><strong>Humidity:</strong> ${data.hum}%</p>
          <p><strong>Motion Status:</strong> ${data.motion ? "🚨 DETECTED" : "🛡️ SECURE"}</p>
          <hr />
          <p style="font-size: 10px; color: #666;">This is an automated alert from your IoT.CORE System.</p>
        </div>
      `
    });
    console.log(`✅ Email sent for: ${reason}`);
  } catch (err) { 
    console.error("Email Error:", err); 
  }
};

// POST: Save Data
exports.recordData = async (req, res) => {
  try {
    const { temp, hum, lux, motion } = req.body;
    const newData = new Sensor({ temp, hum, lux, motion });
    await newData.save();

    const currentTime = Date.now();

    // 1. PRIORITY: Check for Critical Temperature (> 35°C)
    if (temp > 35 && (currentTime - lastTempEmailTime > TEMP_COOLDOWN)) {
      await sendAlertEmail(req.body, "🔥 CRITICAL HEAT DETECTED");
      lastTempEmailTime = currentTime;
    } 
    
    // 2. SECONDARY: Check for Motion
    else if (motion === true && (currentTime - lastMotionEmailTime > MOTION_COOLDOWN)) {
      await sendAlertEmail(req.body, "👤 MOTION DETECTED");
      lastMotionEmailTime = currentTime;
    }

    res.status(201).json(newData);
  } catch (err) { 
    res.status(400).json({ error: err.message }); 
  }
};

// GET: Live Data (Dashboard List)
exports.getLiveData = async (req, res) => {
  try {
    const data = await Sensor.find().sort({ timestamp: -1 }).limit(50);
    res.json(data);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
};

// GET: Real Analytics Comparison (Today vs Yesterday)
exports.getAnalytics = async (req, res) => {
  try {
    const now = new Date();
    
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const endOfYesterday = new Date(startOfToday);

    const getStats = async (start, end) => {
      const stats = await Sensor.aggregate([
        { $match: { timestamp: { $gte: start, $lt: end } } },
        { $group: {
            _id: null,
            avgTemp: { $avg: "$temp" },
            maxTemp: { $max: "$temp" },
            totalMotion: { $sum: { $cond: ["$motion", 1, 0] } }
        }}
      ]);
      return stats[0] || { avgTemp: 0, maxTemp: 0, totalMotion: 0 };
    };

    const today = await getStats(startOfToday, new Date());
    const yesterday = await getStats(startOfYesterday, endOfYesterday);

    res.json({ today, yesterday });
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
};