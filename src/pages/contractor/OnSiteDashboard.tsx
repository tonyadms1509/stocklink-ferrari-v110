import React, { useEffect, useState } from 'react';
import { 
  ArrowLeftOnRectangleIcon, 
  CalculatorIcon, 
  CameraIcon, 
  MicrophoneIcon, 
  BriefcaseIcon,
  SparklesIcon, 
  ClockIcon, 
  SpeakerWaveIcon,
  WrenchScrewdriverIcon,
  PowerIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ArrowPathIcon,
  Sun
} from '@heroicons/react/24/solid';
import { ContractorTab } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import { useData } from '../../hooks/useDataContext';
import WeatherWidget from '../../components/WeatherWidget';
import { GoogleGenAI, Modality } from '@google/genai';

const RuggedButton: React.FC<{ title: string; icon: React.ElementType; onClick: () => void; colorClass: string; isRugged: boolean }> = ({ title, icon: Icon, onClick, colorClass, isRugged }) => (
    <button
        onClick={onClick}
        className={`${isRugged ? 'bg-white border-black border-[4px]' : colorClass} relative overflow-hidden p-8 rounded-[3rem] shadow-2xl transform transition-all duration-300 active:scale-90 active:shadow-inner border-b-[12px] border-black flex flex-col items-center justify-center text-center h-64 group hover:brightness-110`}
    >
        {!isRugged && <div className="absolute inset-0 bg-carbon opacity-5"></div>}
        <div className={`p-6 rounded-[2rem] mb-6 group-hover:scale-110 transition-transform ${isRugged ? 'bg-black text-white' : 'bg-black/20 text-white'}`}>
            <Icon className="h-16 w-16 drop-shadow-2xl" />
        </div>
        <span className={`font-black text-2xl uppercase tracking-tighter italic ${isRugged ? 'text-black' : 'text-white'}`}>{title}</span>
    </button>
);

const OnSiteDashboard: React.FC<{ onExit: () => void; onNavigate: (tab: ContractorTab) => void; onOpenAssistant: () => void }> = ({ onExit, onNavigate, onOpenAssistant }) => {
    const { dailyBriefing, generateDailyBriefing, isAILoading, isRuggedMode, toggleRuggedMode } = useData();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        if (!dailyBriefing) generateDailyBriefing();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, [dailyBriefing, generateDailyBriefing]);

    return (
        <div className={`min-h-screen -m-4 sm:-m-6 lg:-m-8 p-6 md:p-12 font-sans relative overflow-hidden transition-colors duration-700 ${isRuggedMode ? 'bg-white' : 'bg-slate-950'}`}>
            {!isRuggedMode && <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none"></div>}
            {!isRuggedMode && <div className="scanline"></div>}
            
            {/* Ultra High Contrast Header */}
            <div className={`flex justify-between items-center mb-10 p-10 rounded-[3.5rem] shadow-2xl border relative z-10 ${isRuggedMode ? 'bg-white border-black border-[4px]' : 'bg-slate-900/80 backdrop-blur-2xl border-white/5'}`}>
                <div className="text-left">
                    <h2 className={`text-5xl font-black flex items-center gap-5 uppercase tracking-tighter italic leading-none ${isRuggedMode ? 'text-black' : 'text-red-600'}`}>
                        <WrenchScrewdriverIcon className={`h-16 w-16 ${!isRuggedMode && 'shadow-[0_0_20px_red]'}`} />
                        COCKPIT <span className={isRuggedMode ? 'text-orange-600' : 'text-white'}>HUD</span>
                    </h2>
                    <div className="flex flex-wrap items-center gap-6 mt-5 font-mono">
                        <span className={`flex items-center gap-3 px-5 py-2 rounded-xl border-2 font-black uppercase text-[12px] tracking-widest ${isRuggedMode ? 'bg-slate-100 border-black text-black' : 'bg-black/40 border-white/5 text-slate-300'}`}>
                            <ClockIcon className={`h-5 w-5 ${isRuggedMode ? 'text-black' : 'text-blue-500'}`}/> 
                            {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}
                        </span>
                        <div className={`w-px h-8 ${isRuggedMode ? 'bg-black' : 'bg-white/10'}`}></div>
                        <WeatherWidget condensed={true} />
                    </div>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={toggleRuggedMode}
                        className={`flex items-center gap-4 px-10 py-6 rounded-[2.5rem] transition-all border-4 shadow-2xl uppercase text-[12px] font-black tracking-widest transform active:scale-95 ${isRuggedMode ? 'bg-black border-black text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}
                    >
                        <Sun className="h-8 w-8" />
                        {isRuggedMode ? 'NIGHT_OS' : 'SUNLIGHT_MODE'}
                    </button>
                    <button
                        onClick={onExit}
                        className={`flex items-center gap-4 font-black py-6 px-12 rounded-[2.5rem] transition-all border-4 shadow-2xl uppercase text-[12px] tracking-widest transform active:scale-95 ${isRuggedMode ? 'bg-orange-600 text-white border-black' : 'bg-red-600 hover:bg-red-700 text-white border-slate-950'}`}
                    >
                        <PowerIcon className="h-8 w-8" />
                        Shutdown
                    </button>
                </div>
            </div>
            
             {/* Neural Intel Overlay */}
            <div className={`rounded-[4rem] shadow-2xl mb-12 overflow-hidden relative z-10 border-l-[24px] ${isRuggedMode ? 'bg-white border-black border-[4px] border-l-black' : 'bg-slate-900 border-white/5 border-l-red-600'}`}>
                <div className="p-12 relative z-10 text-left">
                    <div className="flex justify-between items-start mb-12">
                        <div>
                             <h3 className={`text-4xl font-black flex items-center gap-5 uppercase italic tracking-tighter ${isRuggedMode ? 'text-black' : 'text-white'}`}>
                                <SparklesIcon className={`h-12 w-12 animate-pulse ${isRuggedMode ? 'text-orange-600' : 'text-red-600'}`} /> SITE <span className={isRuggedMode ? 'text-orange-600' : 'text-red-600'}>VITALS</span>
                             </h3>
                             <p className={`text-[12px] font-black uppercase tracking-[0.5em] mt-3 font-mono ${isRuggedMode ? 'text-black' : 'text-slate-500'}`}>Neural Sync: ACTIVE_UPLINK</p>
                        </div>
                        <button onClick={() => generateDailyBriefing(true)} disabled={isAILoading.briefing} className={`p-6 rounded-[2rem] transition-all shadow-2xl border-2 ${isRuggedMode ? 'bg-slate-100 border-black' : 'bg-slate-800 border-white/5'}`}>
                            <ArrowPathIcon className={`h-10 w-10 ${isAILoading.briefing ? 'animate-spin' : ''} ${isRuggedMode ? 'text-black' : 'text-slate-400'}`} />
                        </button>
                    </div>
                    
                    {dailyBriefing ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                            <div className={`pr-16 text-left border-r-4 ${isRuggedMode ? 'border-black' : 'border-white/5'}`}>
                                <h4 className={`text-[11px] font-black uppercase tracking-[0.4em] mb-8 ${isRuggedMode ? 'text-black' : 'text-slate-500'}`}>Strategic Objective</h4>
                                <p className={`font-black text-4xl leading-tight italic uppercase tracking-tight ${isRuggedMode ? 'text-black' : 'text-slate-100'}`}>"{dailyBriefing.summary}"</p>
                                <div className={`mt-12 p-8 rounded-[2.5rem] border-4 ${isRuggedMode ? 'bg-orange-500/10 border-black' : 'bg-red-600/5 border-red-600/20'}`}>
                                    <p className={`text-[10px] font-black uppercase tracking-widest mb-3 uppercase ${isRuggedMode ? 'text-black' : 'text-red-500'}`}>Safety Protocol Lock</p>
                                    <p className={`text-xl italic font-black leading-relaxed ${isRuggedMode ? 'text-black' : 'text-slate-300'}`}>"{dailyBriefing.safetyTip || 'Operational alertness required.'}"</p>
                                </div>
                            </div>
                            <div className="space-y-6 text-left">
                                <h4 className={`text-[11px] font-black uppercase tracking-[0.4em] mb-8 ${isRuggedMode ? 'text-black' : 'text-slate-500'}`}>Node Communications</h4>
                                {dailyBriefing.keyUpdates.map((update: string, index: number) => (
                                    <div key={index} className={`p-8 rounded-[2.5rem] border-2 flex items-center gap-8 group transition-colors cursor-default ${isRuggedMode ? 'bg-slate-50 border-black' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                                        <div className={`w-2.5 h-12 rounded-full group-hover:scale-y-125 transition-transform ${isRuggedMode ? 'bg-black' : 'bg-red-600 shadow-[0_0_15px_red]'}`}></div>
                                        <p className={`text-xl font-black uppercase italic tracking-tight leading-tight ${isRuggedMode ? 'text-black' : 'text-slate-200'}`}>{update}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className={`py-32 text-center animate-pulse font-black uppercase text-lg tracking-[1em] ${isRuggedMode ? 'text-black' : 'text-slate-700'}`}>SYNCHRONIZING TACTICAL DATA...</div>
                    )}
                </div>
            </div>

            {/* Grid Operations */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-10 relative z-10">
                <div className="col-span-2">
                    <button
                        onClick={onOpenAssistant}
                        className={`relative overflow-hidden p-12 rounded-[4rem] shadow-2xl transform transition-all duration-300 active:scale-95 active:shadow-inner border-b-[16px] border-black flex flex-row items-center justify-center text-center h-64 w-full group gap-16 ${isRuggedMode ? 'bg-orange-600 border-black' : 'bg-gradient-to-r from-red-600 to-red-800'}`}
                    >
                        {!isRuggedMode && <div className="absolute inset-0 bg-carbon opacity-20"></div>}
                         <div className={`p-8 rounded-[2.5rem] backdrop-blur-md group-hover:scale-110 transition-transform shadow-2xl border-2 ${isRuggedMode ? 'bg-black text-white border-black' : 'bg-white/20 text-white border-white/10'}`}>
                            <MicrophoneIcon className="h-20 w-20" />
                         </div>
                        <div className="text-left relative z-10">
                             <span className="font-black text-7xl text-white uppercase tracking-tighter italic drop-shadow-2xl block leading-none">Voice Link</span>
                             <span className={`${isRuggedMode ? 'text-black' : 'text-red-200'} text-lg font-black uppercase tracking-[0.5em] opacity-80 mt-4 block`}>"Transmit Site Protocol"</span>
                        </div>
                    </button>
                </div>
                
                <RuggedButton title="Vision HUD" icon={CameraIcon} onClick={() => onNavigate('site_reporter')} colorClass="bg-slate-800" isRugged={isRuggedMode} />
                <RuggedButton title="Safety Matrix" icon={ShieldCheckIcon} onClick={() => onNavigate('safety-ai')} colorClass="bg-slate-800" isRugged={isRuggedMode} />
                <RuggedButton title="Unit Registry" icon={UserGroupIcon} onClick={() => onNavigate('labor-matrix')} colorClass="bg-slate-800" isRugged={isRuggedMode} />
                <RuggedButton title="SANS Pulse" icon={SparklesIcon} onClick={() => onNavigate('regulatory-pulse')} colorClass="bg-slate-800" isRugged={isRuggedMode} />
                <RuggedButton title="Dossier" icon={BriefcaseIcon} onClick={() => onNavigate('projects')} colorClass="bg-slate-800" isRugged={isRuggedMode} />
                <RuggedButton title="Estimator" icon={CalculatorIcon} onClick={() => onNavigate('cost-estimator')} colorClass="bg-slate-800" isRugged={isRuggedMode} />
            </div>

            <div className={`fixed bottom-12 left-12 pointer-events-none opacity-[0.05] -z-10 rotate-90 select-none ${isRuggedMode ? 'text-black' : 'text-white'}`}>
                <span className="text-[220px] font-black tracking-tighter uppercase italic">REDLINE OPS</span>
            </div>
        </div>
    );
};

export default OnSiteDashboard;