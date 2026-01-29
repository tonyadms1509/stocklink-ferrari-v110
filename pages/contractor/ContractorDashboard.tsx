import React, { useMemo, useEffect } from 'react';
import { 
  Zap, Target, Globe, Cpu, Activity, TrendingUp, ShieldCheck, Sun, Bolt, Wind, ShieldAlert
} from 'lucide-react';
import { SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { useCurrency } from '../../hooks/useCurrency.tsx';
import { useData } from '../../hooks/useDataContext.tsx';
import AnimatedNumber from '../../components/AnimatedNumber.tsx';
import ProjectInterventionAlert from '../../components/ProjectInterventionAlert.tsx';
import GridVolatilityChart from '../../components/GridVolatilityChart.tsx';
import CapitalVelocity from '../../components/CapitalVelocity.tsx';

const CylinderPulse = () => (
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

const HUDCard = ({ title, value, sub, color, icon: Icon, isCurrency = false, torque }: any) => {
    const { formatCurrency } = useCurrency();
    const { isRuggedMode } = useData();
    return (
      <div className={`p-10 rounded-[3rem] shadow-2xl flex flex-col justify-between group transition-all duration-500 relative overflow-hidden text-left min-h-[280px] ${isRuggedMode ? 'bg-white border-black border-[4px]' : 'bg-slate-900 border-white/5 hover:border-red-600/30'}`}>
        {!isRuggedMode && <div className="absolute inset-0 bg-carbon opacity-5 group-hover:opacity-10 transition-opacity"></div>}
        <div className="flex justify-between items-start mb-10 relative z-10 text-left">
            <div className={`p-5 rounded-3xl ${color} bg-opacity-10 transition-all border ${isRuggedMode ? 'border-black' : 'border-white/5'}`}>
                <Icon size={32} className={`${isRuggedMode ? 'text-black' : color.replace('bg-', 'text-')}`} />
            </div>
            <div className="flex flex-col items-end gap-2">
                <CylinderPulse />
                <span className={`text-[8px] font-black tracking-[0.4em] uppercase ${isRuggedMode ? 'text-black font-bold' : 'text-slate-600'}`}>V12_CORE_READY</span>
            </div>
        </div>
        <div className="relative z-10 text-left">
            <h3 className={`text-6xl font-black tracking-tighter italic uppercase leading-none mb-6 ${isRuggedMode ? 'text-black' : 'text-white'}`}>
                {typeof value === 'number' ? (
                    <AnimatedNumber value={value} format={isCurrency ? formatCurrency : undefined} />
                ) : value}
            </h3>
            <div className={`flex items-center gap-4 border-l-8 ${isRuggedMode ? 'border-black' : 'border-red-600'} pl-6 text-left`}>
                <div className="text-left">
                    <p className={`text-[12px] font-black uppercase tracking-widest ${isRuggedMode ? 'text-black' : 'text-slate-400'} text-left`}>{title}</p>
                    <p className={`text-[10px] mt-1 font-bold uppercase ${isRuggedMode ? 'text-black' : 'text-slate-500'} text-left`}>{sub}</p>
                </div>
            </div>
        </div>
      </div>
    );
};

const ContractorDashboard: React.FC<{ onNavigate: (tab: string) => void; onEnterOnSiteMode: () => void }> = ({ onNavigate, onEnterOnSiteMode }) => {
  const { 
      dailyBriefing, 
      generateDailyBriefing, 
      isAILoading, 
      isRuggedMode, 
      projects = [],
      interventionTickets = [],
      resolveIntervention
  } = useData();

  useEffect(() => {
      if (!dailyBriefing && !isAILoading.briefing) generateDailyBriefing();
  }, [dailyBriefing, isAILoading.briefing, generateDailyBriefing]);

  const activeInterventions = interventionTickets.filter(t => t.status === 'Pending');

  return (
    <div className="space-y-12 animate-fade-in pb-24 text-left selection:bg-red-600/20">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 text-left">
        <div className="flex-grow text-left">
           <div className="flex items-center gap-5 mb-8 text-left">
                <div className={`flex items-center gap-4 px-6 py-3 rounded-2xl backdrop-blur-md border-2 ${isRuggedMode ? 'bg-black text-white border-black' : 'bg-red-600/10 border-red-500/30 text-red-600'}`}>
                    <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse shadow-[0_0_20px_#DC0000]"></div>
                    <span className="text-[12px] font-black uppercase tracking-widest italic text-left">MISSION STATE: NOMINAL</span>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-[0.8em] font-mono ${isRuggedMode ? 'text-black' : 'text-slate-600'}`}>OS_REDLINE_v110</span>
            </div>
          <h1 className={`text-8xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.7] ${isRuggedMode ? 'text-black' : 'text-white'} text-left`}>MISSION <span className={isRuggedMode ? 'text-orange-600' : 'text-red-600 text-glow-red'}>HUD</span></h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto text-left">
             <button 
                onClick={onEnterOnSiteMode}
                className={`flex-1 lg:flex-none ${isRuggedMode ? 'bg-orange-600 text-white border-black' : 'bg-red-600 border-slate-950 text-white'} hover:brightness-110 font-black py-8 px-16 rounded-[3rem] shadow-2xl transition-all flex items-center justify-center gap-6 transform active:scale-95 uppercase text-lg tracking-[0.5em] border-4 group relative overflow-hidden`}
            >
                <Bolt size={32} className="text-white fill-current relative z-10 animate-pulse" />
                <span className="relative z-10 italic">Ignition</span>
            </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left">
        <HUDCard title="Active Liquidity" value={450000} sub="Capitalization Pulse" color="bg-emerald-400" icon={Target} isCurrency />
        <HUDCard title="Operational Nodes" value={projects.length} sub="Assigned Sectors" color="bg-blue-500" icon={Globe} />
        <HUDCard title="Grid Status" value="OPTIMAL" sub="Sync v110.0" color="text-red-600" icon={ShieldCheck} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
        <div className="lg:col-span-8 space-y-12 text-left">
            
            <CapitalVelocity />

            <div className={`bg-slate-900 border ${isRuggedMode ? 'border-black border-[4px]' : 'border-white/10'} rounded-[4rem] p-12 shadow-2xl relative overflow-hidden group text-left`}>
                 {!isRuggedMode && <div className="absolute inset-0 bg-carbon opacity-10"></div>}
                 <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all text-left"><TrendingUp size={450} className={isRuggedMode ? 'text-black' : 'text-white'} /></div>
                 
                 <div className="relative z-10 flex flex-col md:flex-row items-center gap-12 text-left">
                     <div className={`w-64 h-64 rounded-full border-[12px] ${isRuggedMode ? 'border-black bg-white' : 'border-red-600 bg-slate-950'} flex flex-col items-center justify-center relative shadow-2xl shrink-0`}>
                         {!isRuggedMode && <div className="absolute inset-0 rounded-full border-8 border-white/5 animate-spin-slow"></div>}
                         <SparklesIcon className={`h-16 w-16 mb-4 animate-pulse ${isRuggedMode ? 'text-orange-600' : 'text-red-600'}`} />
                         <span className={`text-6xl font-black italic tracking-tighter ${isRuggedMode ? 'text-black' : 'text-white'}`}>98.4</span>
                         <span className={`text-xs font-black uppercase tracking-widest ${isRuggedMode ? 'text-black font-bold' : 'text-slate-500'}`}>Torque Factor</span>
                     </div>
                     
                     <div className="flex-grow text-left">
                         <h3 className={`text-4xl font-black italic uppercase tracking-tighter mb-8 underline decoration-[12px] underline-offset-8 ${isRuggedMode ? 'text-black decoration-orange-600' : 'text-white decoration-red-600'} text-left`}>Strategic Performance</h3>
                         <p className={`text-3xl leading-relaxed italic font-serif ${isRuggedMode ? 'text-black font-bold' : 'text-blue-500'} text-left`}>
                            "National grid analysis: Sub-structure delays in Sector Alpha identified. Divert material logistics from Node Midrand to Sector Umhlanga for 24% arbitrage offset."
                         </p>
                     </div>
                 </div>
            </div>

            <GridVolatilityChart />

            <div className={`rounded-[4rem] p-16 relative overflow-hidden group shadow-2xl border transition-all ${isRuggedMode ? 'bg-white border-black border-[4px]' : 'bg-slate-900 border-white/10'} text-left`}>
                {!isRuggedMode && <div className="absolute inset-0 bg-carbon opacity-10"></div>}
                
                <div className="relative z-10 text-left">
                    <div className="flex items-center justify-between mb-16 border-b-2 border-white/5 pb-12 text-left">
                        <div className="flex items-center gap-8 text-left">
                            <SparklesIcon className={`h-16 w-16 animate-pulse ${isRuggedMode ? 'text-orange-600' : 'text-blue-500 shadow-[0_0_40px_#2563eb]'}`} />
                            <div className="text-left">
                                <span className={`text-xl font-black uppercase tracking-[0.8em] block leading-none ${isRuggedMode ? 'text-black' : 'text-blue-500'} text-left`}>NEURAL CORE</span>
                                <span className={`text-[12px] font-black uppercase tracking-widest mt-4 font-mono block leading-none ${isRuggedMode ? 'text-black' : 'text-slate-500'} text-left`}>BROADCASTING_UPLINK</span>
                            </div>
                        </div>
                    </div>

                    {dailyBriefing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 text-left">
                            <div className="text-left">
                                <p className={`text-5xl font-black leading-[1.1] italic uppercase tracking-tighter ${isRuggedMode ? 'text-black' : 'text-white'} text-left`}>"{dailyBriefing.summary}"</p>
                                <div className={`mt-12 p-8 rounded-[2.5rem] border-4 ${isRuggedMode ? 'bg-orange-500/10 border-black' : 'bg-red-600/5 border-red-600/20'} text-left`}>
                                    <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${isRuggedMode ? 'text-black' : 'text-red-500'} text-left`}>Safety Protocol Lock</p>
                                    <p className={`text-xl italic font-bold ${isRuggedMode ? 'text-black' : 'text-slate-300'} text-left`}>"{dailyBriefing.safetyTip}"</p>
                                </div>
                            </div>
                            <div className="space-y-10 text-left">
                                {dailyBriefing.keyUpdates.map((update: string, i: number) => (
                                    <div key={i} className={`flex items-start gap-8 p-10 rounded-[3.5rem] border-4 transition-all shadow-xl group/node ${isRuggedMode ? 'bg-white border-black text-black' : 'bg-white/5 border-white/5 hover:bg-white/10 text-white'} text-left`}>
                                        <div className={`w-3 h-16 rounded-full shrink-0 mt-1 ${isRuggedMode ? 'bg-black' : 'bg-red-600 shadow-[0_0_15px_red]'}`}></div>
                                        <p className="text-xl font-black uppercase tracking-tight italic leading-relaxed text-left">{update}</p>
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
             <div className="px-8 flex items-center justify-between text-left">
                <h3 className={`text-sm font-black uppercase tracking-[0.8em] flex items-center gap-6 ${isRuggedMode ? 'text-black font-bold' : 'text-slate-700'} text-left`}>
                    <ShieldAlert size={28} className={isRuggedMode ? 'text-black' : 'text-red-600'} /> Grid Friction
                </h3>
                {activeInterventions.length > 0 && <div className={`w-5 h-5 rounded-full animate-ping ${isRuggedMode ? 'bg-orange-600 shadow-[0_0_20px_orange]' : 'bg-red-600 shadow-[0_0_20px_red]'}`}></div>}
            </div>
            
            <div className="space-y-10 text-left">
                {activeInterventions.map(ticket => (
                    <ProjectInterventionAlert key={ticket.id} ticket={ticket} onResolve={resolveIntervention} />
                ))}
            </div>

            <div className={`rounded-[5rem] p-16 shadow-[0_0_60px_rgba(0,0,0,0.5)] relative overflow-hidden group border-4 border-slate-950 text-left ${isRuggedMode ? 'bg-white border-black' : 'bg-blue-600 shadow-blue-900/40'}`}>
                 {!isRuggedMode && <div className="absolute inset-0 bg-carbon opacity-10"></div>}
                 <p className={`text-[12px] font-black uppercase tracking-[0.8em] mb-8 opacity-60 ${isRuggedMode ? 'text-black font-bold' : 'text-white'} text-left`}>Supply Node Expansion</p>
                 <h4 className={`text-6xl font-black italic leading-[0.85] uppercase tracking-tighter mb-12 ${isRuggedMode ? 'text-black font-bold' : 'text-white'} text-left`}>Recruit <br/> verified <br/> nodes.</h4>
                 <button onClick={() => onNavigate('referrals')} className={`w-full py-6 rounded-[2.5rem] font-black uppercase text-sm tracking-widest shadow-2xl transform active:scale-95 transition-all border-4 ${isRuggedMode ? 'bg-black text-white border-black' : 'bg-white text-blue-600 border-slate-950'}`}>Provision Handshake</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ContractorDashboard;