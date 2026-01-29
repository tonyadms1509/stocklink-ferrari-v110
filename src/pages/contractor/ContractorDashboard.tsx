import React, { useMemo, useEffect } from 'react';
import { 
  Zap, Target, Globe, Cpu, Activity, Wind, ShieldAlert,
  ArrowUpRight, ArrowDownRight, ShieldCheck, TrendingUp,
  Sun, Phone, Camera, Wrench
} from 'lucide-react';
import { SparklesIcon, CheckCircleIcon, ArrowPathIcon, ExclamationTriangleIcon, BoltIcon } from '@heroicons/react/24/solid';
import { useCurrency } from '../../hooks/useCurrency';
import { useData } from '../../hooks/useDataContext';
import ProjectInterventionAlert from '../../components/ProjectInterventionAlert';
import AnimatedNumber from '../../components/AnimatedNumber';

const CylinderPulse = () => {
    return (
        <div className="flex gap-1.5 h-10 items-end px-4 py-2 bg-black/40 rounded-xl border border-white/5 shadow-inner">
            {[...Array(12)].map((_, i) => (
                <div 
                    key={i} 
                    className="w-1.5 bg-red-600 rounded-full transition-all duration-150 animate-cylinder-fire shadow-[0_0_10px_rgba(220,0,0,0.8)]"
                    style={{ 
                        animationDelay: `${i * 0.08}s`,
                        height: `${30 + Math.random() * 70}%` 
                    }}
                ></div>
            ))}
        </div>
    );
};

const TorqueGauge = ({ value, label, color }: { value: number, label: string, color: string }) => {
    const rotation = (value / 100) * 180 - 90;
    const { isRuggedMode } = useData();
    return (
        <div className="flex flex-col items-center gap-2 group">
            <div className="relative w-36 h-20 overflow-hidden">
                <svg viewBox="0 0 100 50" className="w-full h-full">
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={isRuggedMode ? "#000" : "#1e293b"} strokeWidth="8" strokeLinecap="round" />
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={color} strokeWidth="8" strokeDasharray="125.6" strokeDashoffset={125.6 - (value / 100) * 125.6} className="transition-all duration-1000" strokeLinecap="round" opacity={isRuggedMode ? 1 : 0.4} />
                    <line x1="50" y1="50" x2="50" y2="10" stroke={isRuggedMode ? "#000" : "white"} strokeWidth="4" strokeLinecap="round" transform={`rotate(${rotation} 50 50)`} className="transition-all duration-1000 ease-out shadow-2xl" />
                </svg>
                <div className="absolute bottom-0 left-0 right-0 text-center flex flex-col items-center">
                    <span className={`text-2xl font-black italic tracking-tighter leading-none ${isRuggedMode ? 'text-black' : 'text-white'}`}>{value}%</span>
                </div>
            </div>
            <span className={`text-[8px] font-black uppercase tracking-[0.4em] ${isRuggedMode ? 'text-black font-bold' : 'text-slate-500'} group-hover:text-red-500 transition-colors`}>{label}</span>
        </div>
    );
};

const HUDCard = ({ title, value, sub, color, icon: Icon, isCurrency = false, id, torque }: any) => {
    const { formatCurrency } = useCurrency();
    const { isRuggedMode } = useData();
    return (
      <div id={id} className={`bg-slate-900 border ${isRuggedMode ? 'border-black border-[4px]' : 'border-white/5'} p-8 rounded-[3rem] shadow-2xl flex flex-col justify-between group transition-all duration-500 relative overflow-hidden text-left min-h-[300px] ${!isRuggedMode && 'breathe-red'}`}>
        {!isRuggedMode && <div className="absolute inset-0 bg-carbon opacity-5 group-hover:opacity-10 transition-opacity"></div>}
        
        <div className="flex justify-between items-start mb-8 relative z-10">
            <div className={`p-5 rounded-3xl ${color} bg-opacity-10 transition-all group-hover:scale-110 shadow-2xl border ${isRuggedMode ? 'border-black border-2' : 'border-white/5'}`}>
                <Icon size={36} className={`${isRuggedMode ? 'text-black' : color.replace('bg-', 'text-')}`} />
            </div>
            {torque !== undefined ? (
                <TorqueGauge value={torque} label="Pace Factor" color={isRuggedMode ? '#FF4D00' : color.includes('red') ? '#DC0000' : '#3b82f6'} />
            ) : (
                <div className="flex flex-col items-end gap-2">
                    <CylinderPulse />
                    <span className={`text-[8px] font-black tracking-[0.4em] uppercase ${isRuggedMode ? 'text-black font-bold' : 'text-slate-600'}`}>V12_CORE_READY</span>
                </div>
            )}
        </div>
        <div className="relative z-10 text-left">
            <h3 className={`text-6xl font-black tracking-tighter italic uppercase leading-none ${isRuggedMode ? 'text-black' : 'text-white'}`}>
                {typeof value === 'number' ? (
                    <AnimatedNumber value={value} format={isCurrency ? formatCurrency : undefined} />
                ) : value}
            </h3>
            <div className={`flex items-center gap-4 mt-8 border-l-8 ${isRuggedMode ? 'border-black' : 'border-red-600'} pl-6`}>
                <div>
                    <p className={`text-[12px] font-black uppercase tracking-[0.4em] ${isRuggedMode ? 'text-black font-bold' : 'text-slate-400'}`}>{title}</p>
                    <p className={`text-[10px] mt-1 font-bold tracking-[0.2em] opacity-80 italic uppercase ${isRuggedMode ? 'text-black font-bold' : 'text-slate-500'}`}>{sub}</p>
                </div>
            </div>
        </div>
      </div>
    );
};

const ContractorDashboard: React.FC<{ onNavigate: (tab: string) => void; onEnterOnSiteMode: () => void }> = ({ onNavigate, onEnterOnSiteMode }) => {
  const { 
    projects = [], 
    projectBudgets = [], 
    interventionTickets = [], 
    resolveIntervention, 
    dailyBriefing, 
    isAILoading, 
    generateDailyBriefing,
    isRuggedMode,
    toggleRuggedMode
  } = useData();

  useEffect(() => {
      if (!dailyBriefing && !isAILoading.briefing) generateDailyBriefing();
  }, [dailyBriefing, isAILoading.briefing, generateDailyBriefing]);

  const metrics = useMemo(() => {
    const budgets = Array.isArray(projectBudgets) ? projectBudgets : [];
    const activeValue = budgets.reduce((sum, b) => sum + (b.totalBudget || 0), 0);
    const sitesCount = Array.isArray(projects) ? projects.length : 0;
    return { activeValue, sitesCount };
  }, [projectBudgets, projects]);

  const activeInterventions = Array.isArray(interventionTickets) ? interventionTickets.filter(t => t.status === 'Pending') : [];
  
  return (
    <div className={`space-y-12 animate-fade-in pb-24 text-left relative selection:bg-red-600/20 ${isRuggedMode ? 'rugged-view' : ''}`}>
      <header className={`flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 border-b-2 pb-12 ${isRuggedMode ? 'border-black' : 'border-white/5'}`}>
        <div className="flex-grow text-left">
           <div className="flex items-center gap-5 mb-8">
                <div className={`flex items-center gap-4 px-6 py-3 rounded-2xl backdrop-blur-md border-2 transition-all duration-700 ${isRuggedMode ? 'bg-black text-white border-black' : 'bg-red-600/10 border-red-500 text-red-600'}`}>
                    <div className={`w-3 h-3 rounded-full animate-pulse ${isRuggedMode ? 'bg-white' : 'bg-red-600 shadow-[0_0_20px_#DC0000]'}`}></div>
                    <span className={`text-[12px] font-black uppercase tracking-widest italic`}>ENGINE STATE: V12_STABLE</span>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-[0.8em] font-mono ${isRuggedMode ? 'text-black' : 'text-slate-600'}`}>OS_REDLINE_v110</span>
            </div>
          <h1 className={`text-8xl md:text-[10rem] font-black tracking-tighter uppercase italic leading-[0.7] ${isRuggedMode ? 'text-black' : 'text-white'}`}>MISSION <span className={isRuggedMode ? 'text-orange-600' : 'text-red-600 text-glow-red'}>HUD</span></h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 w-full lg:w-auto">
            <button 
                onClick={toggleRuggedMode}
                className={`p-8 rounded-[2.5rem] border-4 transition-all flex items-center justify-center gap-6 transform active:scale-95 shadow-2xl ${isRuggedMode ? 'bg-black border-black text-white font-black scale-105' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                title="Sunlight Visibility Optimization (Aero Protocol)"
            >
                <Sun size={32} className={isRuggedMode ? 'animate-spin-slow' : ''} />
                <div className="text-left">
                    <span className="block text-xs font-black uppercase tracking-widest leading-none mb-1">{isRuggedMode ? 'Night Mode' : 'Sunlight Mode'}</span>
                    <span className="block text-[10px] font-bold uppercase opacity-60 tracking-widest">Aero Protocol</span>
                </div>
            </button>
            <div id="ignition-btn" className="flex-grow sm:flex-grow-0">
                <button 
                    onClick={onEnterOnSiteMode}
                    className={`w-full h-full ${isRuggedMode ? 'bg-orange-600 border-black' : 'bg-red-600 border-slate-950'} hover:brightness-110 text-white font-black py-8 px-20 rounded-[3rem] shadow-2xl transition-all flex items-center justify-center gap-8 transform active:scale-95 uppercase text-lg tracking-[0.5em] border-4 group relative overflow-hidden`}
                >
                    {!isRuggedMode && <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>}
                    <BoltIcon className="h-8 w-8 text-white fill-current relative z-10 animate-pulse" />
                    <span className="relative z-10 italic">Ignition</span>
                </button>
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <HUDCard title="Active Liquidity" value={metrics.activeValue} sub="Total Site Capitalization" color="text-emerald-400" icon={Target} isCurrency torque={88} />
        <HUDCard title="Operational Nodes" value={metrics.sitesCount} sub="Assigned Deployment Zones" color="text-blue-500" icon={Globe} torque={64} />
        <HUDCard title="Core Integrity" value="OPTIMAL" sub="Sync Redline v110" color="text-red-600" icon={ShieldCheck} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
            
            {/* National Strategy Hub */}
            <div className={`bg-slate-900 border ${isRuggedMode ? 'border-black border-[4px]' : 'border-white/10'} rounded-[4rem] p-12 shadow-2xl relative overflow-hidden group text-left`}>
                 {!isRuggedMode && <div className="absolute inset-0 bg-carbon opacity-10"></div>}
                 <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all"><TrendingUp size={450} className={isRuggedMode ? 'text-black' : 'text-white'} /></div>
                 
                 <div className="relative z-10 flex flex-col md:flex-row items-center gap-12 text-left">
                     <div className={`w-64 h-64 rounded-full border-[12px] ${isRuggedMode ? 'border-black bg-white' : 'border-red-600 bg-slate-950'} flex flex-col items-center justify-center relative shadow-2xl shrink-0`}>
                         {!isRuggedMode && <div className="absolute inset-0 rounded-full border-8 border-white/5 animate-spin-slow"></div>}
                         <SparklesIcon className={`h-16 w-16 mb-4 animate-pulse ${isRuggedMode ? 'text-orange-600' : 'text-red-600'}`} />
                         <span className={`text-6xl font-black italic tracking-tighter ${isRuggedMode ? 'text-black' : 'text-white'}`}>98.4</span>
                         <span className={`text-xs font-black uppercase tracking-widest ${isRuggedMode ? 'text-black font-bold' : 'text-slate-500'}`}>Torque Factor</span>
                     </div>
                     
                     <div className="flex-grow text-left">
                         <h3 className={`text-4xl font-black italic uppercase tracking-tighter mb-8 underline decoration-[12px] underline-offset-8 ${isRuggedMode ? 'text-black decoration-orange-600' : 'text-white decoration-red-600'}`}>Strategic Performance</h3>
                         <p className={`text-3xl leading-relaxed italic font-serif ${isRuggedMode ? 'text-black font-bold' : 'text-blue-500'}`}>
                            "National grid analysis: PV Inverter scarcity detected. Divert surplus inventory from Node Midrand to Sector Umhlanga for 24% arbitrage offset."
                         </p>
                         <div className="mt-16 flex gap-6">
                             <button className={`px-12 py-4 rounded-2xl border-4 font-black uppercase text-xs tracking-widest transition-all ${isRuggedMode ? 'bg-white border-black text-black' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}>Re-Map Grid</button>
                             <button className={`px-12 py-4 rounded-2xl border-4 font-black uppercase text-xs tracking-widest transition-all shadow-2xl ${isRuggedMode ? 'bg-orange-600 border-black text-white' : 'bg-blue-600 border-blue-500 text-white hover:bg-blue-500'}`}>Apply Directive</button>
                         </div>
                     </div>
                 </div>
            </div>

            <div id="briefing-card" className={`bg-slate-900 rounded-[4rem] p-16 text-white relative overflow-hidden group shadow-2xl border ${isRuggedMode ? 'border-black border-[4px]' : 'border-white/10'} text-left`}>
                {!isRuggedMode && <div className="absolute inset-0 bg-carbon opacity-10"></div>}
                <div className="absolute top-0 right-0 p-12 opacity-5 transform group-hover:scale-110 transition-transform duration-2000 pointer-events-none">
                    <Cpu size={500} className={isRuggedMode ? 'text-black' : 'text-white'} />
                </div>
                
                <div className="relative z-10">
                    <div className={`flex items-center justify-between mb-20 border-b-2 pb-12 ${isRuggedMode ? 'border-black' : 'border-white/10'}`}>
                        <div className="flex items-center gap-8">
                            <SparklesIcon className={`h-16 w-16 animate-pulse ${isRuggedMode ? 'text-orange-600' : 'text-blue-500 shadow-[0_0_40px_#2563eb]'}`} />
                            <div className="text-left">
                                <span className={`text-xl font-black uppercase tracking-[0.8em] block leading-none ${isRuggedMode ? 'text-black' : 'text-blue-500'}`}>NEURAL CORE Intel</span>
                                <span className={`text-[12px] font-black uppercase tracking-widest mt-4 font-mono block leading-none ${isRuggedMode ? 'text-black' : 'text-slate-500'}`}>BROADCASTING_SATELLITE_UPLINK</span>
                            </div>
                        </div>
                        <button onClick={() => generateDailyBriefing(true)} className={`p-8 rounded-[2.5rem] border-4 transition-all shadow-2xl group/btn ${isRuggedMode ? 'bg-white border-black text-black' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                            <ArrowPathIcon className={`h-12 w-12 ${isAILoading.briefing ? 'animate-spin' : ''} ${isRuggedMode ? 'text-black' : 'text-slate-400'}`} />
                        </button>
                    </div>

                    {dailyBriefing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-32">
                            <div className={`pr-16 text-left border-r-4 ${isRuggedMode ? 'border-black' : 'border-white/5'}`}>
                                <h4 className={`text-[11px] font-black uppercase tracking-[0.4em] mb-12 border-b-2 pb-3 w-fit ${isRuggedMode ? 'text-black border-black' : 'text-slate-500 border-white/10'}`}>Mission Brief</h4>
                                <p className={`text-5xl font-black leading-[1.1] italic uppercase tracking-tighter ${isRuggedMode ? 'text-black font-bold' : 'text-white'}`}>"{dailyBriefing.summary}"</p>
                                <div className={`mt-16 p-10 rounded-[3rem] border-4 ${isRuggedMode ? 'bg-orange-500/5 border-black' : 'bg-red-600/5 border-red-600/20'}`}>
                                    <p className={`text-xs font-black uppercase tracking-widest mb-4 ${isRuggedMode ? 'text-black font-bold' : 'text-red-500'}`}>Safety Shield Lock</p>
                                    <p className={`text-xl italic font-bold leading-relaxed ${isRuggedMode ? 'text-black font-bold' : 'text-slate-300'}`}>"{dailyBriefing.safetyTip || 'Operational alertness required.'}"</p>
                                </div>
                            </div>
                            <div className="space-y-12 text-left">
                                <h4 className={`text-[12px] font-black uppercase tracking-[0.6em] mb-10 border-b-2 pb-3 w-fit ${isRuggedMode ? 'text-black border-black' : 'text-slate-500 border-white/10'}`}>Grid Synchronisation</h4>
                                {dailyBriefing.keyUpdates.map((update: string, i: number) => (
                                    <div key={i} className={`flex items-start gap-10 p-10 rounded-[3.5rem] border-4 transition-all shadow-xl group/node ${isRuggedMode ? 'bg-white border-black text-black' : 'bg-white/5 border-white/5 hover:bg-white/10 text-white'}`}>
                                        <div className={`w-3 h-16 rounded-full group-hover/node:scale-y-125 transition-transform shrink-0 mt-1 ${isRuggedMode ? 'bg-black' : 'bg-red-600 shadow-[0_0_15px_red]'}`}></div>
                                        <p className={`text-xl font-black uppercase tracking-tight italic leading-relaxed ${isRuggedMode ? 'font-bold' : ''}`}>{update}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="py-40 text-center text-slate-800 uppercase font-black tracking-[1.5em] text-sm animate-pulse italic">Engaging Tactical Handshake...</div>
                    )}
                </div>
            </div>
        </div>

        <div className="lg:col-span-4 space-y-12 text-left">
            <div className="px-8 flex items-center justify-between">
                <h3 className={`text-sm font-black uppercase tracking-[0.8em] flex items-center gap-6 ${isRuggedMode ? 'text-black font-bold' : 'text-slate-700'}`}>
                    <ShieldAlert size={28} className={isRuggedMode ? 'text-black' : 'text-red-600'} /> Grid Friction
                </h3>
                {activeInterventions.length > 0 && <div className={`w-5 h-5 rounded-full animate-ping ${isRuggedMode ? 'bg-orange-600 shadow-[0_0_20px_orange]' : 'bg-red-600 shadow-[0_0_20px_red]'}`}></div>}
            </div>
            
            <div className="space-y-10">
                {activeInterventions.map(ticket => (
                    <ProjectInterventionAlert key={ticket.id} ticket={ticket} onResolve={resolveIntervention} />
                ))}
                {activeInterventions.length === 0 && (
                    <div className={`bg-slate-900/50 border-[6px] border-dashed rounded-[5rem] p-32 text-center flex flex-col items-center shadow-inner group transition-all ${isRuggedMode ? 'bg-white border-black' : 'hover:bg-slate-900/80 border-white/5'}`}>
                        <CheckCircleIcon className={`h-32 w-32 mb-10 transition-colors duration-1000 ${isRuggedMode ? 'text-black' : 'text-slate-800 group-hover:text-emerald-500/40'}`} />
                        <p className={`text-xs font-black uppercase tracking-[1em] ${isRuggedMode ? 'text-black font-bold' : 'text-slate-700'}`}>GRID_NOMINAL</p>
                    </div>
                )}
            </div>

            <div className={`rounded-[5rem] p-16 shadow-[0_0_60px_rgba(0,0,0,0.5)] relative overflow-hidden group border-4 border-slate-950 text-left ${isRuggedMode ? 'bg-white border-black' : 'bg-blue-600 shadow-blue-900/40'}`}>
                 {!isRuggedMode && <div className="absolute inset-0 bg-carbon opacity-10"></div>}
                 <div className="absolute top-0 right-0 p-10 opacity-20 transform -rotate-12 group-hover:scale-110 transition-transform duration-2000">
                    <Wind size={300} className={isRuggedMode ? 'text-black' : 'text-white'}/>
                 </div>
                 <p className={`text-[12px] font-black uppercase tracking-[0.8em] mb-8 opacity-60 ${isRuggedMode ? 'text-black font-bold' : 'text-white'}`}>Supply Node Expansion</p>
                 <h4 className={`text-6xl font-black italic leading-[0.85] uppercase tracking-tighter mb-12 ${isRuggedMode ? 'text-black font-bold' : 'text-white'}`}>Recruit <br/> verified <br/> nodes.</h4>
                 <button onClick={() => onNavigate('referrals')} className={`w-full py-6 rounded-[2.5rem] font-black uppercase text-sm tracking-widest shadow-2xl transform active:scale-95 transition-all border-4 ${isRuggedMode ? 'bg-black text-white border-black' : 'bg-white text-blue-600 border-slate-950'}`}>Provision Handshake</button>
            </div>
        </div>
      </div>
      
      <div className="ferrari-watermark"></div>
    </div>
  );
};

export default ContractorDashboard;