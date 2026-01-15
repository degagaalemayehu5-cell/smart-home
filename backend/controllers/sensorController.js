const Sensor = require('../models/Sensor');
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

let lastEmailSentTime = 0;
const EMAIL_COOLDOWN = 10 * 60 * 1000;

// Email Helper
const sendAlertEmail = async (data, reason) => {
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'degagaalemayehu5@gmail.com',
      subject: '🚨 Smart Home Critical Alert',
      html: `<h3>Alert: ${reason}</h3><p>Temp: ${data.temp}°C</p><p>Motion: ${data.motion}</p>`
    });
  } catch (err) { console.error("Email Error:", err); }
};

// POST: Save Data
exports.recordData = async (req, res) => {
  try {
    const { temp, hum, lux, motion } = req.body;
    const newData = new Sensor({ temp, hum, lux, motion });
    await newData.save();

    let isCritical = temp > 35 || motion === true;
    const currentTime = Date.now();

    if (isCritical && (currentTime - lastEmailSentTime > EMAIL_COOLDOWN)) {
      await sendAlertEmail(req.body, "Critical Activity Detected");
      lastEmailSentTime = currentTime;
    }
    res.status(201).json(newData);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

// GET: Live Data (Dashboard List)
exports.getLiveData = async (req, res) => {
  try {
    const data = await Sensor.find().sort({ timestamp: -1 }).limit(50);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET: Real Analytics Comparison (Today vs Yesterday)
exports.getAnalytics = async (req, res) => {
  try {
    const now = new Date();
    
    // Time Ranges
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const endOfYesterday = new Date(startOfToday);

    // MongoDB Aggregation Logic
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
  } catch (err) { res.status(500).json({ error: err.message }); }
};