
import React, { useEffect, useState } from 'react';

interface AnimatedSplashProps {
  onComplete: () => void;
}

export const AnimatedSplash: React.FC<AnimatedSplashProps> = ({ onComplete }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Stage 1: Reveal the name (faster start)
    const t1 = setTimeout(() => setStage(1), 100);
    // Stage 2: Trigger tagline and underline (faster follow-up)
    const t2 = setTimeout(() => setStage(2), 600);
    // Complete the splash (reduced total duration)
    const t3 = setTimeout(() => onComplete(), 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center overflow-hidden px-4">
      {/* Background depth with very soft radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_75%)] animate-pulse-slow pointer-events-none" />
      
      <div className="relative flex flex-col items-center w-full">
        {/* Premium Typography Section */}
        <div className="relative flex flex-col items-center w-full">
          <h1 
            className={`
              premium-text font-black uppercase transition-all duration-[800ms] ease-[cubic-bezier(0.22, 1, 0.36, 1)]
              ${stage >= 1 
                ? 'opacity-100 scale-100 translate-y-0 tracking-[0.2em] sm:tracking-[0.35em]' 
                : 'opacity-0 scale-[0.98] translate-y-4 tracking-[0.1em]'
              }
              text-5xl sm:text-6xl md:text-8xl leading-tight text-center
            `}
            style={{ 
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            CHARTXO
          </h1>

          {/* Premium Glowing Underline - Now Blue */}
          <div className="relative mt-4 h-[2px] w-full max-w-[320px] overflow-visible">
            {/* The Beam */}
            <div 
              className={`
                absolute inset-0 h-full bg-gradient-to-r from-transparent via-blue-600 to-transparent transition-all duration-[1000ms] delay-300 ease-out
                ${stage >= 2 ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}
              `}
              style={{ transformOrigin: 'center' }}
            />
            {/* The Glow */}
            <div 
              className={`
                absolute inset-0 h-full bg-blue-500 blur-[8px] transition-all duration-[1000ms] delay-300 ease-out
                ${stage >= 2 ? 'scale-x-100 opacity-40' : 'scale-x-0 opacity-0'}
              `}
              style={{ transformOrigin: 'center' }}
            />
          </div>
        </div>
      </div>

      {/* Very faint decorative corner elements */}
      <div className={`absolute top-12 left-12 w-12 h-[1px] bg-white/5 transition-opacity duration-700 delay-200 ${stage >= 1 ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`absolute top-12 left-12 w-[1px] h-12 bg-white/5 transition-opacity duration-700 delay-200 ${stage >= 1 ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`absolute bottom-12 right-12 w-12 h-[1px] bg-white/5 transition-opacity duration-700 delay-200 ${stage >= 1 ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`absolute bottom-12 right-12 w-[1px] h-12 bg-white/5 transition-opacity duration-700 delay-200 ${stage >= 1 ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  );
};
