
import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 100 120" 
        fill="none"
        className={className || "h-12 w-auto"}
    >
        <defs>
            <linearGradient id="metallicRed" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF1A1A" />
                <stop offset="50%" stopColor="#DC0000" />
                <stop offset="100%" stopColor="#8B0000" />
            </linearGradient>
            <linearGradient id="carbonGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2A2A2A" />
                <stop offset="100%" stopColor="#0A0A0A" />
            </linearGradient>
            <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>

        {/* Outer Aerodynamic Shield */}
        <path 
            d="M50 5 L95 28 V75 C95 95 75 115 50 115 C25 115 5 95 5 75 V28 L50 5 Z" 
            fill="url(#metallicRed)" 
            stroke="white" 
            strokeWidth="2"
            filter="url(#glow)"
        />
        
        {/* Inner Carbon Core */}
        <path 
            d="M50 12 L88 32 V72 C88 88 72 105 50 105 C28 105 12 88 12 72 V32 L50 12 Z" 
            fill="url(#carbonGradient)" 
        />
        
        {/* Central Diamond Blade */}
        <path 
            d="M50 30 L70 48 V70 L50 88 L30 70 V48 L50 30 Z" 
            fill="white" 
            fillOpacity="0.9"
        />
        
        {/* Vertical Redline Stripe */}
        <rect x="48" y="40" width="4" height="40" fill="#DC0000" rx="2" />
        
        {/* Horizontal Force Lines */}
        <path d="M38 55 H42 M38 65 H42 M38 75 H42" stroke="#DC0000" strokeWidth="3" strokeLinecap="round" />
        <path d="M58 55 H62 M58 65 H62 M58 75 H62" stroke="#DC0000" strokeWidth="3" strokeLinecap="round" />
        
        {/* Top Aero Wing */}
        <path d="M35 30 L50 18 L65 30" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

export default Logo;
