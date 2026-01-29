import React from 'react';
import { Activity, Zap, Truck, BarChart3, TrendingDown, TrendingUp, Cpu } from 'lucide-react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { useData } from '../hooks/useDataContext';

const VitalItem = ({ label, value, trend, icon: Icon, color }: any) => (
    <div className="flex items-center gap-4 px-8 border-r border-white/5 h-full group hover:bg-white/5 transition-colors cursor-help shrink-0 text-left">
        <div className={`p-2 rounded-lg ${color} bg-opacity-10 group-hover:scale-110 transition-transform shadow-lg border border-white/5`}>
            <Icon size={14} className={color} />
        </div>
        <div className="text-left">
            <p className="text-[8px] font-black uppercase text-slate-500 tracking-[0.2em]">{label}</p>
            <div className="flex items-baseline gap-2">
                <span className="text-xs font-mono font-black text-white">{value}</span>
                {trend === 'down' ? <TrendingDown size={10} className="text-emerald-500" /> : <TrendingUp size={10} className="text-red-500" />}
            </div>
        </div>
    </div>
);

const GridVitalsBar: React.FC = () => {
    const { systemHealth, isGridSaturated } = useData();

    return (
        <div className="w-full h-12 bg-slate-950 border-b border-white/10 flex items-center overflow-x-auto no-scrollbar shadow-2xl relative z-50">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none"></div>
            
            <div className="flex items-center h-full">
                <VitalItem label="Steel Volatility" value="+4.2%" trend="up" icon={Activity} color="text-red-500" />
                <VitalItem label="Grid Load GP" value="94.2%" trend="up" icon={Truck} color="text-blue-500" />
                <VitalItem label="Power Delta" value="Stage 4" trend="up" icon={Zap} color="text-amber-500" />
                <VitalItem label="BEE Flow" value="High" trend="down" icon={BarChart3} color="text-emerald-500" />
                <VitalItem label="Latency" value={`${systemHealth?.latency || 22}ms`} trend="down" icon={Activity} color="text-blue-400" />
            </div>

            <div className="flex-grow"></div>
            
            <div className="px-8 flex items-center gap-6 h-full border-l border-white/5 bg-slate-900/50">
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}>
                     <Cpu size={14} className="text-slate-500 group-hover:text-blue-500 transition-colors" />
                     <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest hidden md:inline">CMD + K</span>
                </div>

                <div className="h-4 w-px bg-white/10"></div>

                <div className="flex items-center gap-3">
                    {isGridSaturated ? (
                        <div className="flex items-center gap-2 text-red-500 animate-pulse">
                            <ExclamationTriangleIcon className="h-3 w-3" />
                            <span className="text-[9px] font-black uppercase tracking-widest leading-none">Nodes Cooling</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
                             <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">Sync: LOCKED</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GridVitalsBar;