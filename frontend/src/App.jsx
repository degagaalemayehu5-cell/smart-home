import React, { useState, useEffect } from 'react';
import SensorCard from './components/SensorCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const App = () => {
  const [data, setData] = useState([]);
  const [latest, setLatest] = useState({ temp: 0, hum: 0, lux: 0, motion: 0 });
  const [status, setStatus] = useState('connecting');
  const [darkMode, setDarkMode] = useState(false);

  const fetchData = async () => {
    try {
      // CHANGED: Removed http://localhost:5000 for deployment
      const response = await fetch('/api/sensors'); 
      const result = await response.json();
      if (result && result.length > 0) {
        setLatest(result[0]);
        setData([...result].reverse());
        setStatus('online');
      }
    } catch (err) {
      setStatus('offline');
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const theme = {
    bg: darkMode ? 'bg-slate-900' : 'bg-[#F4F7FE]',
    card: darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white text-blue-900',
    text: darkMode ? 'text-slate-100' : 'text-blue-900',
    subtext: darkMode ? 'text-slate-400' : 'text-blue-900/40',
    grid: darkMode ? '#334155' : '#f0f2f5'
  };

  return (
    <div className={`min-h-screen p-8 transition-colors duration-500 ${theme.bg} ${theme.text}`}>
      
      {/* Header */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-12">
        <div>
          <h1 className="text-5xl font-black tracking-tight">Smart Home</h1>
          <p className={`${theme.subtext} font-medium mt-1`}>Live Hardware Monitoring</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 rounded-xl shadow-lg transition-all ${darkMode ? 'bg-yellow-400 text-slate-900' : 'bg-slate-800 text-white'}`}
          >
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          
          <div className={`px-5 py-2 rounded-full border transition-colors ${status === 'online' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
            <span className="font-bold text-xs uppercase tracking-widest">{status}</span>
          </div>
        </div>
      </div>

      {/* Sensor Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <SensorCard label="Temperature" value={latest.temp} unit="°C" icon="🌡️" darkMode={darkMode}/>
        <SensorCard label="Humidity" value={latest.hum} unit="%" icon="💧" darkMode={darkMode}/>
        <SensorCard label="Light" value={latest.lux} unit="lx" icon="☀️" darkMode={darkMode}/>
        <SensorCard label="Security" value={latest.motion ? "MOTION" : "SECURE"} isAlert={latest.motion} icon="🛡️" darkMode={darkMode}/>
      </div>

      {/* Graph */}
      <div className={`${theme.card} max-w-7xl mx-auto p-10 rounded-[2.5rem] shadow-xl mb-12 border`}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.grid} />
            <XAxis dataKey="timestamp" hide />
            <YAxis stroke={darkMode ? '#94a3b8' : '#64748b'} />
            <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1e293b' : '#fff', border: 'none' }} />
            <Legend />
            <Line type="monotone" dataKey="temp" stroke="#ff8080" strokeWidth={3} dot={false} name="Temp" />
            <Line type="monotone" dataKey="lux" stroke="#fbbf24" strokeWidth={3} dot={false} name="Light" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Historical Logs Table */}
      <div className={`${theme.card} max-w-7xl mx-auto p-8 rounded-[2.5rem] shadow-xl border overflow-hidden`}>
        <h3 className={`${theme.subtext} font-bold text-xs uppercase tracking-widest mb-6 px-4`}>Historical Logs</h3>
        <table className="w-full text-left">
          <thead>
            <tr className={`border-b ${darkMode ? 'border-slate-700' : 'border-blue-50'}`}>
              <th className="px-6 py-4 text-sm font-bold opacity-60">TIME</th>
              <th className="px-6 py-4 text-sm font-bold opacity-60">TEMP</th>
              <th className="px-6 py-4 text-sm font-bold opacity-60">HUMIDITY</th>
              <th className="px-6 py-4 text-sm font-bold opacity-60">LIGHT (LX)</th>
              <th className="px-6 py-4 text-sm font-bold opacity-60">SECURITY</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? data.slice(0, 10).map((log, i) => (
              <tr key={i} className={`border-b ${darkMode ? 'border-slate-700/50' : 'border-blue-50/50'}`}>
                <td className="px-6 py-4 text-sm">{new Date(log.timestamp).toLocaleTimeString()}</td>
                <td className="px-6 py-4 text-sm font-bold text-red-400">{log.temp}°C</td>
                <td className="px-6 py-4 text-sm font-bold text-blue-400">{log.hum}%</td>
                <td className="px-6 py-4 text-sm font-bold text-yellow-500">{log.lux} lx</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${log.motion ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                    {log.motion ? 'MOTION' : 'SECURE'}
                  </span>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" className="text-center py-10 opacity-30 tracking-widest">WAITING FOR HARDWARE...</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;