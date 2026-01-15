import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area 
} from 'recharts';

// --- HELPER COMPONENT: TREND CARD ---
const StatComparison = ({ label, today, yesterday, unit }) => {
  const diff = today - yesterday;
  const isIncrease = diff > 0;
  
  const valToday = today || 0;
  const valYesterday = yesterday || 0;

  return (
    <div className="flex flex-col items-center p-4">
      <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black tracking-tighter">
          {valToday.toFixed(1)}{unit}
        </span>
        <span className={`text-xs font-bold ${isIncrease ? 'text-red-500' : 'text-emerald-500'}`}>
          {isIncrease ? '↑' : '↓'} {Math.abs(diff).toFixed(1)}
        </span>
      </div>
      <span className="text-[9px] opacity-40 italic">vs Yesterday</span>
    </div>
  );
};

// --- HELPER COMPONENT: SENSOR CARD ---
const SensorCard = ({ label, value, unit, icon, darkMode, isAlert }) => (
  <div className={`p-6 rounded-[2rem] border transition-all duration-500 shadow-sm ${
    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-blue-50 text-blue-900'
  } ${isAlert ? 'ring-2 ring-red-500 animate-pulse' : ''}`}>
    <div className="flex justify-between items-start mb-4">
      <span className="text-3xl">{icon}</span>
      <span className={`text-[10px] font-bold uppercase tracking-widest opacity-40`}>{label}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <h2 className="text-4xl font-black italic">{value}</h2>
      <span className="text-sm font-bold opacity-30">{unit}</span>
    </div>
  </div>
);

const App = () => {
  const [data, setData] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [status, setStatus] = useState('connecting');
  const [darkMode, setDarkMode] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // CONFIG: Your Live Render Production URL
  const API_BASE_URL = "https://smart-home-1-zrth.onrender.com"; 

  const fetchAllData = async () => {
    try {
      // 1. Fetch Live Data
      const resLive = await fetch(`${API_BASE_URL}/api/sensors`);
      if (!resLive.ok) throw new Error('Network response was not ok');
      const liveData = await resLive.json();
      setData(liveData);
      
      // 2. Fetch Comparison Analytics
      const resAnalytics = await fetch(`${API_BASE_URL}/api/sensors/analytics`);
      const analyticsData = await resAnalytics.json();
      setAnalytics(analyticsData);

      setStatus('online');
    } catch (err) {
      console.error("Fetch Error:", err);
      setStatus('offline');
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 5000); 
    return () => clearInterval(interval);
  }, []);

  const theme = {
    bg: darkMode ? 'bg-slate-900' : 'bg-[#F4F7FE]',
    card: darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white text-blue-900 border-blue-50',
    text: darkMode ? 'text-slate-100' : 'text-blue-900',
    grid: darkMode ? '#334155' : '#f0f2f5'
  };

  const latest = data[0] || { temp: 0, hum: 0, lux: 0, motion: false };

  return (
    <div className={`min-h-screen p-8 transition-colors duration-500 ${theme.bg} ${theme.text}`}>
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1 className="text-5xl font-black tracking-tighter italic">IoT.CORE</h1>
          <p className="opacity-40 font-bold text-xs uppercase tracking-widest mt-1">Cloud Network Active</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg cursor-pointer transition-all active:scale-90"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <div className={`px-4 py-2 rounded-full border text-[10px] font-bold ${status === 'online' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
            {status.toUpperCase()}
          </div>
        </div>
      </div>

      {/* ANALYTICS SUMMARY BAR */}
      {analytics && (
        <div className={`${theme.card} max-w-7xl mx-auto rounded-[2.5rem] mb-8 border shadow-xl flex justify-around items-center p-2`}>
          <StatComparison 
            label="Avg Temp" 
            today={analytics.today.avgTemp} 
            yesterday={analytics.yesterday.avgTemp} 
            unit="°C" 
          />
          <div className="h-12 w-px bg-gray-200 opacity-20" />
          <StatComparison 
            label="Peak Heat" 
            today={analytics.today.maxTemp} 
            yesterday={analytics.yesterday.maxTemp} 
            unit="°C" 
          />
          <div className="h-12 w-px bg-gray-200 opacity-20" />
          <StatComparison 
            label="Motion Hits" 
            today={analytics.today.totalMotion} 
            yesterday={analytics.yesterday.totalMotion} 
            unit="" 
          />
        </div>
      )}

      {/* SENSOR CARDS */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <SensorCard label="Temp" value={latest.temp} unit="°C" icon="🌡️" darkMode={darkMode} />
        <SensorCard label="Humid" value={latest.hum} unit="%" icon="💧" darkMode={darkMode} />
        <SensorCard label="Light" value={latest.lux} unit="lx" icon="☀️" darkMode={darkMode} />
        <SensorCard label="Security" value={latest.motion ? "ALERT" : "SAFE"} unit="" icon="🛡️" darkMode={darkMode} isAlert={latest.motion} />
      </div>

      {/* TREND CHART */}
      <div className={`${theme.card} max-w-7xl mx-auto p-10 rounded-[2.5rem] shadow-xl mb-12 border`}>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={[...data].reverse()}>
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff8080" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ff8080" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.grid} />
            <XAxis dataKey="timestamp" tickFormatter={(t) => new Date(t).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} />
            <YAxis />
            <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: darkMode ? '#1e293b' : '#fff' }} />
            <Legend verticalAlign="top" height={36}/>
            <Area name="Temperature" type="monotone" dataKey="temp" stroke="#ff8080" fillOpacity={1} fill="url(#colorTemp)" strokeWidth={4} />
            <Line name="Light Level" type="monotone" dataKey="lux" stroke="#fbbf24" strokeWidth={3} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* EVENT LOG */}
      <div className={`${theme.card} max-w-7xl mx-auto rounded-[2.5rem] shadow-xl border overflow-hidden`}>
        <div className="p-8 flex justify-between items-center">
          <h3 className="font-black text-xl italic uppercase tracking-tighter">Event Log</h3>
          <button 
            onClick={() => setShowAll(!showAll)}
            className="text-[10px] font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full cursor-pointer transition-all active:scale-95 shadow-md"
          >
            {showAll ? 'Hide History ↑' : 'View Full Details ↓'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="opacity-40 text-[10px] font-bold uppercase tracking-widest">
              <tr>
                <th className="px-8 py-4">Time</th>
                <th className="px-8 py-4">Temp</th>
                <th className="px-8 py-4">Humid</th>
                <th className="px-8 py-4">Light</th>
                <th className="px-8 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium">
              {(showAll ? data : data.slice(0, 5)).map((row, i) => (
                <tr key={i} className={`border-t ${darkMode ? 'border-slate-700/50' : 'border-gray-100/10'}`}>
                  <td className="px-8 py-4 opacity-50">{new Date(row.timestamp).toLocaleTimeString()}</td>
                  <td className="px-8 py-4 font-black">{row.temp}°C</td>
                  <td className="px-8 py-4 font-black text-blue-500">{row.hum}%</td>
                  <td className="px-8 py-4 text-yellow-500">{row.lux} lx</td>
                  <td className="px-8 py-4">
                    <span className={`px-4 py-1 rounded-full text-[10px] font-bold ${row.motion ? 'bg-red-500 text-white shadow-lg' : 'bg-emerald-500/10 text-emerald-500'}`}>
                      {row.motion ? '🚨 MOTION' : '🛡️ SECURE'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default App;