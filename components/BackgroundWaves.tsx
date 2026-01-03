import React from 'react';

export const BackgroundWaves: React.FC = () => {
  return (
    <div className="absolute bottom-0 left-0 w-full h-[50vh] pointer-events-none z-0 opacity-80 overflow-hidden">
      <svg
        viewBox="0 0 1440 600"
        preserveAspectRatio="none"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
            <linearGradient id="gradRed" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B0000" stopOpacity="0" />
                <stop offset="50%" stopColor="#FF0000" stopOpacity="1" />
                <stop offset="100%" stopColor="#8B0000" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradBlue" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00008B" stopOpacity="0" />
                <stop offset="50%" stopColor="#1E90FF" stopOpacity="1" />
                <stop offset="100%" stopColor="#00008B" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradGreen" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#006400" stopOpacity="0" />
                <stop offset="50%" stopColor="#32CD32" stopOpacity="1" />
                <stop offset="100%" stopColor="#006400" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradYellow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#B8860B" stopOpacity="0" />
                <stop offset="50%" stopColor="#FFD700" stopOpacity="1" />
                <stop offset="100%" stopColor="#B8860B" stopOpacity="0" />
            </linearGradient>
        </defs>

        {/* Red Wave */}
        <path
          d="M0,400 C300,200 600,600 900,300 C1200,100 1440,400 1440,400"
          stroke="url(#gradRed)"
          strokeWidth="3"
          fill="none"
          className="animate-[pulse_5s_ease-in-out_infinite]"
        />

        {/* Blue Wave */}
        <path
          d="M0,500 C200,400 500,200 800,450 C1100,600 1440,300 1440,300"
          stroke="url(#gradBlue)"
          strokeWidth="3"
          fill="none"
          className="animate-[pulse_6s_ease-in-out_infinite_1s]"
        />

        {/* Green Wave */}
        <path
          d="M0,300 C400,500 700,300 1000,500 C1200,600 1440,450 1440,450"
          stroke="url(#gradGreen)"
          strokeWidth="3"
          fill="none"
          className="animate-[pulse_7s_ease-in-out_infinite_2s]"
        />

        {/* Yellow Wave */}
        <path
          d="M0,550 C250,500 550,400 850,500 C1150,600 1440,550 1440,550"
          stroke="url(#gradYellow)"
          strokeWidth="3"
          fill="none"
          className="animate-[pulse_8s_ease-in-out_infinite_0.5s]"
        />
      </svg>
    </div>
  );
};