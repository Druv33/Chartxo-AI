
import React from 'react';

interface LogoProps {
  className?: string;
  onClick?: () => void;
  variant?: 'orange' | 'white';
}

export const SnapChartLogo: React.FC<LogoProps> = ({ className, onClick, variant = 'orange' }) => {
  const isWhite = variant === 'white';
  
  // Dynamic IDs to prevent gradient conflicts if multiple logos exist
  const gradientId = `cameraGradient-${variant}`;
  const arrowGradientId = `arrowGradient-${variant}`;

  return (
    <div 
      className={`relative group cursor-pointer ${className}`} 
      onClick={onClick}
      role="button"
      aria-label="Upload Chart"
    >
      {/* Outer Glow Effect */}
      <div className={`absolute inset-0 ${isWhite ? 'bg-white/20' : 'bg-orange-500/20'} blur-3xl rounded-full ${isWhite ? 'group-hover:bg-white/30' : 'group-hover:bg-orange-500/30'} transition-all duration-500`} />
      
      <svg
        viewBox="0 0 200 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_0_15px_rgba(255,95,31,0.6)]"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="200" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isWhite ? "#FFFFFF" : "#FF8C00"} />
            <stop offset="100%" stopColor={isWhite ? "#A0A0A0" : "#FF4500"} />
          </linearGradient>
          <linearGradient id={arrowGradientId} x1="50" y1="100" x2="150" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isWhite ? "#FFFFFF" : "#FFD700"} />
            <stop offset="100%" stopColor={isWhite ? "#D4D4D4" : "#FF0000"} />
          </linearGradient>
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Camera Body Outline */}
        <path
          d="M40 40 H60 L70 25 H130 L140 40 H160 C171.046 40 180 48.9543 180 60 V130 C180 141.046 171.046 150 160 150 H40 C28.9543 150 20 141.046 20 130 V60 C20 48.9543 28.9543 40 40 40 Z"
          stroke={`url(#${gradientId})`}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="group-hover:stroke-[10px] transition-all duration-300"
        />

        <rect x="50" y="80" width="12" height="30" fill="#DC2626" opacity="0.9" />
        <line x1="56" y1="70" x2="56" y2="120" stroke="#DC2626" strokeWidth="3" />

        <rect x="80" y="60" width="12" height="40" fill="#22C55E" opacity="0.9" />
        <line x1="86" y1="50" x2="86" y2="110" stroke="#22C55E" strokeWidth="3" />

        <rect x="110" y="90" width="12" height="10" fill="#DC2626" opacity="0.9" />
        <line x1="116" y1="75" x2="116" y2="115" stroke="#DC2626" strokeWidth="3" />
        
        <rect x="135" y="75" width="12" height="25" fill="#22C55E" opacity="0.9" />
        <line x1="141" y1="65" x2="141" y2="105" stroke="#22C55E" strokeWidth="3" />

        <path
          d="M45 125 L85 95 L115 115 L165 55 M165 55 V85 M165 55 H135"
          stroke={`url(#${arrowGradientId})`}
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter="url(#neonGlow)"
          className="animate-pulse-slow"
        />
      </svg>
    </div>
  );
};
