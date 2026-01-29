import React from 'react';

const MarketTicker: React.FC = () => {
  const items = ["ZAR/USD: 18.42", "CEMENT 42.5N: R98.50", "ESKOM: STAGE 4", "GP GRID: 94% LOAD", "BRICK INDEX: +2.4%"];
  return (
    <div className="bg-slate-950 border-b border-white/5 py-3 overflow-hidden whitespace-nowrap relative z-[60]">
      <div className="flex animate-[ticker_30s_linear_infinite] gap-12">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] italic">{item}</span>
        ))}
      </div>
      <style>{`@keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
    </div>
  );
};

export default MarketTicker;