import React, { useState, useEffect } from 'react';

const BOOT_LINES = [
  { text: '> Initializing FX-Master Trading Terminal...', delay: 200 },
  { text: '> Loading OANDA v20 broker module...', delay: 300 },
  { text: '> Connecting to price feed...', delay: 250 },
  { text: '> Loading market data engine...', delay: 200 },
  { text: '> Initializing chart renderer...', delay: 300 },
  { text: '> Loading order execution module...', delay: 250 },
  { text: '> Risk management system: ACTIVE', delay: 200 },
  { text: '> WebSocket stream: READY', delay: 150 },
  { text: '', delay: 100 },
  { text: '████████████████████████████████████████', delay: 100 },
  { text: '', delay: 50 },
  { text: '  FX-MASTER TERMINAL v2.0', delay: 200 },
  { text: '  Production Trading Environment', delay: 150 },
  { text: '', delay: 100 },
  { text: '> All systems operational. Launching terminal...', delay: 500 },
];

export function StartupScreen({ onComplete }) {
  const [lines, setLines] = useState([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let idx = 0;
    let totalDelay = 0;

    BOOT_LINES.forEach((line, i) => {
      totalDelay += line.delay;
      setTimeout(() => {
        setLines(prev => [...prev, line.text]);
        setProgress(((i + 1) / BOOT_LINES.length) * 100);
      }, totalDelay);
    });

    setTimeout(() => {
      if (onComplete) onComplete();
    }, totalDelay + 600);
  }, [onComplete]);

  return (
    <div className="h-screen w-screen bg-[#08080d] flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        {/* Terminal Output */}
        <div className="font-mono text-[11px] space-y-1 mb-8">
          {lines.map((line, i) => (
            <div key={i} className={`${
              line.includes('████') ? 'text-emerald-400 font-bold' :
              line.includes('FX-MASTER') ? 'text-white font-bold text-lg' :
              line.includes('Production') ? 'text-zinc-500' :
              line.includes('operational') ? 'text-emerald-400' :
              'text-zinc-500'
            }`}>
              {line}
              {i === lines.length - 1 && <span className="animate-pulse text-emerald-400">█</span>}
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-[#1e1e30] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[9px] text-zinc-600 text-center mt-2 font-mono tracking-wider">
          LOADING TERMINAL... {Math.round(progress)}%
        </p>
      </div>
    </div>
  );
}
