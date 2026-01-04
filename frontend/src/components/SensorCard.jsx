import React from 'react';

const SensorCard = ({ label, value, unit, icon, isAlert, darkMode }) => {
  // Define styles based on Dark Mode and Alert status
  const cardStyles = {
    background: isAlert 
      ? (darkMode ? 'bg-red-900/20' : 'bg-red-50') 
      : (darkMode ? 'bg-slate-800' : 'bg-white'),
    
    border: isAlert
      ? (darkMode ? 'border-red-500/50' : 'border-red-200')
      : (darkMode ? 'border-slate-700' : 'border-blue-50'),
      
    text: darkMode ? 'text-white' : 'text-blue-900',
    label: darkMode ? 'text-slate-400' : 'text-blue-900/40'
  };

  return (
    <div className={`p-8 rounded-[2rem] border transition-all duration-500 shadow-sm ${cardStyles.background} ${cardStyles.border} ${cardStyles.text} 
      ${isAlert ? 'ring-2 ring-red-500 animate-pulse' : ''}`}>
      
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-blue-500/10 rounded-2xl text-2xl">
          {icon}
        </div>
        {isAlert && (
          <span className="flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </div>

      <div>
        <h3 className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-1 ${cardStyles.label}`}>
          {label}
        </h3>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black tracking-tight">
            {value}
          </span>
          <span className="text-lg font-bold opacity-40">
            {unit}
          </span>
        </div>
      </div>
      
      <div className={`mt-4 h-1 w-12 rounded-full ${isAlert ? 'bg-red-500' : 'bg-blue-500/20'}`}></div>
    </div>
  );
};

export default SensorCard;