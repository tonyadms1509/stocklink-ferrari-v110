
import React from 'react';
import { 
    Zap, Activity, TrendingUp, 
    ShieldCheck, Gauge, Sparkles
} from 'lucide-react';
import { useCurrency } from '../hooks/useCurrency';
import AnimatedNumber from './AnimatedNumber';

const VelocityMeter: React.FC<{ value: number; label: string; max: number; color: string }> = ({ value, label, max, color }) => {
    const rotation = (value / max) * 240 - 120;
    return (
        <div className="flex flex-col items-center text-center group">
            <div className="relative w-48 h-32 overflow-hidden">
                <svg viewBox="0 0 100 60" className="w-full h-full">
                    <path d="M 10 55 A 45 45 0 0 1 90 55" fill="none" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 10 55 A 45 45 0 0 1 90 55" fill="none" stroke={color} strokeWidth="8" strokeDasharray="125.6" strokeDashoffset={125.6 - (value / max) * 125.6} strokeLinecap="round" className="opacity-20 transition-all duration-1000" />
                    <line x1="50" y1="55" x2="50" y2="15" stroke="white" strokeWidth="3" strokeLinecap="round" transform={`rotate(${rotation} 50 55)`} className="transition-all duration-1000 ease-out shadow-2xl" />
                    <circle cx="50" cy="55" r="5" fill="#DC0000" />
                </svg>
                <div className="absolute bottom-2 left-0 right-0">
                    <p className="text-3xl font-black text-white tracking-tighter italic"><AnimatedNumber value={value} />%</p>
                </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2 group-hover:text-white transition-colors">{label}</span>
        </div>
    );
};

const CapitalVelocity: React.FC = () => {
    const { formatCurrency } = useCurrency();

    return (
        <div className="bg-slate-900 border border-white/10 p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group text-left">
            <div className="absolute inset-0 bg-carbon opacity-10"></div>
            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-1000"><Zap size={400} className="text-blue-500" /></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row gap-16 items-center text-left">
                <div className="text-left flex-grow">
                    <div className="flex items-center gap-3 mb-6 text-left">
                        <Activity className="h-6 w-6 text-emerald-500 animate-pulse shadow-[0_0_15px_#10b981]" />
                        <span className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.4em]">FISC-CORE v100 REDLINE</span>
                    </div>
                    <h2 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none mb-10 text-left">Capital <span className="text-emerald-500">Velocity</span></h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12 text-left">
                         <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group/box text-left">
                             <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover/box:opacity-100 transition-opacity"></div>
                             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Cash Exhaust Pulse</p>
                             <div className="flex items-baseline gap-4 text-left">
                                <h3 className="text-6xl font-black text-white italic tracking-tighter leading-none"><AnimatedNumber value={42} /></h3>
                                <span className="text-xl font-black text-red-500 uppercase italic">Days</span>
                             </div>
                             <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em] mt-6">Predicted Terminal Liquidity</p>
                         </div>
                         <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group/box text-left">
                             <div className="absolute inset-0 bg-emerald-600/5 opacity-0 group-hover/box:opacity-100 transition-opacity"></div>
                             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Net Yield Forecast</p>
                             <h3 className="text-5xl font-black text-white italic tracking-tighter leading-none">{formatCurrency(845200)}</h3>
                             <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.3em] mt-6 flex items-center gap-2">
                                 <TrendingUp size={12}/> 12.4% Over Baseline
                             </p>
                         </div>
                    </div>

                    <button className="w-full lg:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-black py-6 px-16 rounded-[2.5rem] shadow-2xl transition-all transform active:scale-95 uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-4 border border-white/10">
                        <Sparkles size={16} className="text-yellow-200 animate-pulse"/>
                        Run Liquidity Stress Test
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-12 shrink-0">
                    <VelocityMeter value={84} label="Burn Tempo" max={100} color="#DC0000" />
                    <VelocityMeter value={62} label="Milestone Lock" max={100} color="#2563eb" />
                    <VelocityMeter value={92} label="Efficiency Gear" max={100} color="#10b981" />
                    <VelocityMeter value={15} label="Arbitrage Heat" max={100} color="#f59e0b" />
                </div>
            </div>
            
            <div className="mt-16 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-left">
                 <div className="flex gap-12 text-left">
                    <div className="text-left">
                        <p className="text-[9px] font-black text-slate-600 uppercase mb-1">National Node Arbitrage</p>
                        <p className="text-lg font-black text-white italic">R14,240 <span className="text-emerald-500">+4.2%</span></p>
                    </div>
                    <div className="text-left">
                        <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Operational Delta</p>
                        <p className="text-lg font-black text-white italic">-R2.4k <span className="text-red-500">LOCKED</span></p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 text-emerald-500 bg-emerald-500/5 px-6 py-3 rounded-full border border-emerald-500/10">
                     <ShieldCheck size={18}/>
                     <span className="text-[10px] font-black uppercase tracking-[0.4em]">Settlement Guard: SECURE</span>
                 </div>
            </div>
        </div>
    );
};

export default CapitalVelocity;
