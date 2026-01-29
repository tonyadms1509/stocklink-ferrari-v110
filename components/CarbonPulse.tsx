import React from 'react';
import { Leaf, Zap, CloudFog, BarChart3, ShieldCheck } from 'lucide-react';
import { CarbonGrade } from '../types';
import AnimatedNumber from './AnimatedNumber';

interface CarbonPulseProps {
  grade: CarbonGrade;
  totalKg: number;
  offsetPercentage: number;
}

const CarbonPulse: React.FC<CarbonPulseProps> = ({ grade, totalKg, offsetPercentage }) => {
  const getGradeColor = (g: CarbonGrade) => {
    if (g.startsWith('A')) return 'text-emerald-400 border-emerald-400';
    if (g.startsWith('B')) return 'text-blue-400 border-blue-400';
    if (g.startsWith('C')) return 'text-amber-400 border-amber-400';
    return 'text-red-400 border-red-400';
  };

  return (
    <div className="bg-slate-900 border border-white/5 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-carbon opacity-10"></div>
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000">
        <Leaf size={150} className="text-emerald-500" />
      </div>

      <div className="relative z-10 text-left">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <CloudFog className="h-6 w-6 text-emerald-500 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.4em]">Eco-Logic Grid v2.1</p>
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Sustainability <span className="text-emerald-500">Pulse</span></h3>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-10">
          <div className="text-left">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Carbon Intensity</p>
            <h2 className="text-6xl font-black text-white tracking-tighter italic leading-none">
              <AnimatedNumber value={totalKg} /> <span className="text-2xl text-slate-600">KG</span>
            </h2>
          </div>
          <div className={`px-6 py-3 rounded-2xl border-4 font-black italic text-2xl uppercase tracking-tighter shadow-2xl ${getGradeColor(grade)} bg-black/40`}>
            {grade.split(' ')[0]}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Offset Threshold</span>
            <span className="text-xs font-black text-emerald-400 italic">{offsetPercentage}% Optimized</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-emerald-500 shadow-[0_0_15px_#10b981] transition-all duration-2000"
              style={{ width: `${offsetPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button className="flex-1 bg-white/5 hover:bg-white/10 text-slate-400 font-black py-4 rounded-2xl border border-white/10 text-[9px] uppercase tracking-widest transition-all">Audit BOM</button>
          <button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl shadow-xl transition-all transform active:scale-95 uppercase text-[9px] tracking-widest flex items-center justify-center gap-2">
            <ShieldCheck size={14} /> Low-Carbon Sourcing
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarbonPulse;