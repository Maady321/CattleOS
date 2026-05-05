import React from 'react';

export const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <svg 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Background/Shadow Circle (Optional) */}
      <circle cx="100" cy="100" r="90" fill="black" />
      
      {/* Horns */}
      <path 
        d="M40 60C50 40 80 40 100 80C120 40 150 40 160 60C170 80 150 110 100 130C50 110 30 80 40 60Z" 
        fill="#FDF5E6" 
      />
      
      {/* Circuit Lines - Left */}
      <path d="M70 90H40" stroke="#2ECC71" strokeWidth="3" strokeLinecap="round" />
      <circle cx="40" cy="90" r="3" fill="#2ECC71" />
      <path d="M75 105H50" stroke="#2ECC71" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="105" r="3" fill="#2ECC71" />
      <path d="M80 120H60" stroke="#2ECC71" strokeWidth="3" strokeLinecap="round" />
      <circle cx="60" cy="120" r="3" fill="#2ECC71" />
      
      {/* Circuit Lines - Right */}
      <path d="M130 90H160" stroke="#2ECC71" strokeWidth="3" strokeLinecap="round" />
      <circle cx="160" cy="90" r="3" fill="#2ECC71" />
      <path d="M125 105H150" stroke="#2ECC71" strokeWidth="3" strokeLinecap="round" />
      <circle cx="150" cy="105" r="3" fill="#2ECC71" />
      <path d="M120 120H140" stroke="#2ECC71" strokeWidth="3" strokeLinecap="round" />
      <circle cx="140" cy="120" r="3" fill="#2ECC71" />
      
      {/* Vertical Lines */}
      <path d="M100 130V160" stroke="#2ECC71" strokeWidth="3" strokeLinecap="round" />
      <circle cx="100" cy="160" r="3" fill="#2ECC71" />
      <path d="M110 80V50" stroke="#2ECC71" strokeWidth="3" strokeLinecap="round" />
      <circle cx="110" cy="50" r="3" fill="#2ECC71" />
      <path d="M90 80V50" stroke="#2ECC71" strokeWidth="3" strokeLinecap="round" />
      <circle cx="90" cy="50" r="3" fill="#2ECC71" />

      {/* Center Chip */}
      <rect x="80" y="80" width="40" height="40" rx="8" fill="#1A1A1A" stroke="#2ECC71" strokeWidth="2" />
      <text 
        x="100" 
        y="110" 
        textAnchor="middle" 
        fill="#2ECC71" 
        style={{ fontSize: '24px', fontWeight: '900', fontFamily: 'Arial Black' }}
      >
        C
      </text>
      
      {/* Glow Effect */}
      <circle cx="100" cy="100" r="10" fill="#2ECC71" fillOpacity="0.2">
        <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
        <animate attributeName="fillOpacity" values="0.1;0.4;0.1" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
};
