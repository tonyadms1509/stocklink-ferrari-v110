import React from 'react';
import { useCurrency } from '../hooks/useCurrency';

const GridVolatilityChart: React.FC = () => {
    const { formatCurrency } = useCurrency();
    const data = [12, 18, 15, 24, 22, 35, 30, 42, 38, 55, 52, 68];
    const max = Math.max(...data);
    const width = 400;
    const height = 120;
    const points = data.map((d, i) => `${(i / (data.length - 1)) * width},${height - (d / max) * height}`).join(' ');

    return (
        <div className="w-full bg-slate-900 rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden shadow-2xl group">
             <div className="absolute inset-0 bg-carbon opacity-5"></div>
             <div className="flex justify-between items-center mb-8 relative z-10 text-left">
                 <div>
                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] mb-1">Index Volatility</h4>
                    <p className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">Material Price <span className="text-red-600">Friction</span></p>
                 </div>
                 <div className="text-right">
                    <p className="text-lg font-black text-red-600 italic tracking-tighter">+4.2%</p>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">MTD Delta</p>
                 </div>
             </div>
             
             <div className="relative h-24 w-full z-10">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full preserve-3d overflow-visible">
                    <defs>
                        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#DC0000" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#DC0000" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <polyline
                        fill="url(#chartGradient)"
                        points={`0,${height} ${points} ${width},${height}`}
                    />
                    <polyline
                        fill="none"
                        stroke="#DC0000"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points}
                        className="animate-draw-chart shadow-[0_0_20px_#DC0000]"
                    />
                </svg>
             </div>

             <div className="flex justify-between mt-6 border-t border-white/5 pt-6 relative z-10 text-left">
                 <div className="text-left">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Anchor Rate</p>
                    <p className="text-sm font-bold text-slate-200">R14,240 <span className="text-[8px] opacity-50">/ Ton</span></p>
                 </div>
                 <div className="text-right">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Global Node Sync</p>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2 justify-end">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                        Nominal
                    </p>
                 </div>
             </div>

             <style>{`
                .animate-draw-chart {
                    stroke-dasharray: 1000;
                    stroke-dashoffset: 1000;
                    animation: draw-chart-anim 5s ease-out forwards;
                }
                @keyframes draw-chart-anim {
                    to { stroke-dashoffset: 0; }
                }
             `}</style>
        </div>
    );
};

export default GridVolatilityChart;