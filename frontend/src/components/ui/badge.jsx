import React from 'react';

export const Badge = ({ children, className = '', variant = 'default', ...props }) => {
  const variants = {
    default: 'bg-gray-800 text-gray-300 border border-gray-700',
    active: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white',
    idle: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
    stopped: 'bg-gradient-to-r from-gray-600 to-gray-700 text-white',
    blue: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
  };
  
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
