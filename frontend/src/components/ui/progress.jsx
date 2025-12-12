import React from 'react';

export const Progress = ({ value, max = 100, className = '', indicatorColor = 'bg-gradient-to-r from-blue-500 to-cyan-400' }) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className={`w-full h-2 bg-gray-800 rounded-full overflow-hidden ${className}`}>
      <div 
        className={`h-full rounded-full transition-all duration-300 ${indicatorColor}`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};
