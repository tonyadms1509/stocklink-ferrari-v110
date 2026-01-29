import React, { useState, useMemo } from 'react';
import { useLocalization } from '../../hooks/useLocalization.tsx';
import { useData } from '../../hooks/useDataContext.tsx';
import { 
    BoltIcon, SparklesIcon, CalendarDaysIcon, 
    ArrowPathIcon, ClockIcon, ExclamationTriangleIcon,
    ShieldCheckIcon, SunIcon, CloudIcon, BeakerIcon,
    ArrowRightIcon, CheckCircleIcon
} from '@heroicons/react/24/solid';
import { GoogleGenAI } from '@google/genai';
import { useToast } from '../../hooks/useToast.tsx';
import AnimatedNumber from '../../components/AnimatedNumber.tsx';
import { GridWindow, TaskStatus } from '../../types.ts';

const GridWindowCard: React.FC<{ window: GridWindow }> = ({ window }) => {
    const statusColors = {
        Active: 'bg-red-600 shadow-[0_0_40px_rgba(220,0,0,0.4)] border-red-400',
        Upcoming: 'bg-amber-600 shadow-[0_0_30px_rgba(245,158,11,0.2)] border-amber-400',
        Clearing: 'bg-emerald-600 shadow-[0_0_30px_rgba(16,185,129,0.2)] border-emerald-400'
    };

    return (
        <div className="bg-slate-900 border border-white/5 p-8 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8 group hover:bg-slate-800 transition-all duration-700 breathe-red">
            <div className="flex items-center gap-8">
                <div className={`w-20 h-20 rounded-[2rem] border-2 flex items-center justify-center ${statusColors[window.status as keyof typeof statusColors]} transition-all group-hover:scale-110 shadow-2xl`}>
                    <BoltIcon className="h-10 w-10 text-white drop-shadow-lg"/>
                </div>
                <div className="text-left">
                    <h4 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Stage {window.stage} Grid Lockout</h4>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.4em] mt-3 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${window.status === 'Active' ? 'bg-red-500 animate-ping' : 'bg-slate-700'}`}></div>
                        Operational Status: {window.status} Handover
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-12 w-full md:w-auto justify-between md:justify-end">
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Time Slot</p>
                    <p className="font-mono text-xl text-white font-black italic">
                        {window.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {window.endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                </div>
                <div className="h-16 w-px bg-white/5 hidden md:block"></div>
                <div className="text-right min-w-[120px]">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Threat Profile</p>
                    <p className={`font-black text-2xl uppercase italic tracking-tighter ${window.impactLevel === 'High' ? 'text-red-500 text-glow-red' : 'text-amber-500'}`}>{window.impactLevel}</p>
                </div>
            </div>
        </div>
    );
};

const GridStrategyConsole: React.FC = () => {
    const { t } = useLocalization();
    const { gridWindows, projectTasks } = useData();
    const { showToast } = useToast();
    const [isThinking, setIsThinking] = useState(false);
    const [strategy, setStrategy] = useState<string | null>(null);

    const powerIntensiveTasks = useMemo(() => {
        return projectTasks.filter(t => t.status !== TaskStatus.Completed && (
            t.description.toLowerCase().includes('weld') ||
            t.description.toLowerCase().includes('concrete') ||
            t.description.toLowerCase().includes('cut') ||
            t.description.toLowerCase().includes('drill')
        ));
    }, [projectTasks]);

    const handleOptimize = async () => {
        if (!process.env.API_KEY) return;
        setIsThinking(true);
        setStrategy(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Generate a tactical construction power strategy for today in South Africa.
                Current Eskom Stage: ${gridWindows[0]?.stage || 4}.
                Power-intensive tasks: ${powerIntensiveTasks.map(t => t.description).join(', ')}.
                Windows of outage: ${gridWindows.map(w => `${w.startTime.toLocaleTimeString()} to ${w.endTime.toLocaleTimeString()}`).join(', ')}.
                Provide a mission-critical 4-sentence roadmap. Use professional technical terms.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt
            });

            setStrategy(response.text);
            showToast("Grid Strategy Decrypted", "success");
        } catch (e) {
            showToast("Uplink Failure", "error");
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="pb-20 max-w-7xl mx-auto space-y-12 font-sans text-slate-200">
             <div className="bg-slate-900 rounded-[4rem] p-16 text-white shadow-2xl border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-carbon opacity-20"></div>
                <div className="absolute top-0 right-0 p-12 opacity-5">
                    <BoltIcon className="h-[600px] w-[600px] text-red-600 transform rotate-12 opacity-10" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12">
                    <div className="text-left">
                         <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-red-600 rounded-2xl animate-pulse shadow-[0_0_30px_#DC0000]">
                                <BoltIcon className="h-8 w-8 text-white" />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-[0.5em] text-red-500">Infrastructure Shield v80.5</span>
                        </div>
                        <h1 className="text-8xl font-black tracking-tighter italic uppercase text-white leading-none">THE <span className="text-red-600">GRID</span></h1>
                        <p className="text-slate-500 mt-6 font-mono text-sm tracking-widest uppercase max-w-2xl leading-loose">Automated Eskom Outage Mitigation & Weather-Adaptive Personnel Orchestration.</p>
                    </div>

                    <button 
                        onClick={handleOptimize}
                        disabled={isThinking}
                        className="bg-red-600 hover:bg-red-700 text-white font-black py-6 px-16 rounded-[2.5rem] shadow-2xl shadow-red-900/40 transition-all flex items-center gap-6 uppercase tracking-[0.3em] text-xs transform active:scale-95 disabled:opacity-50 border-4 border-slate-950"
                    >
                        {isThinking ? <ArrowPathIcon className="h-6 w-6 animate-spin" /> : <SparklesIcon className="h-6 w-6 text-yellow-200" />}
                        Execute Strategic Audit
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 space-y-10">
                     <div className="flex items-center justify-between px-6">
                        <h3 className="text-xl font-black italic uppercase tracking-tighter text-white flex items-center gap-4">
                            <div className="w-1.5 h-10 bg-red-600 rounded-full shadow-[0_0_15px_red]"></div>
                            Grid <span className="text-red-600">Schematic</span>
                        </h3>
                        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Stage 4 Forecast Active</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {gridWindows.map(w => <GridWindowCard key={w.id} window={w} />)}
                    </div>

                    <div className="bg-slate-900 rounded-[3.5rem] p-12 border border-white/10 shadow-2xl relative group overflow-hidden breathe-red">
                         <div className="absolute inset-0 bg-carbon opacity-5"></div>
                         <div className="absolute top-0 right-0 p-12 opacity-5"><SparklesIcon className="h-64 w-64 text-blue-500" /></div>
                         <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-10 flex items-center gap-4 text-white">
                             <BeakerIcon className="h-8 w-8 text-blue-400 shadow-[0_0_15px_#60a5fa]" />
                             Neural <span className="text-blue-500">Directives</span>
                         </h3>
                         <div className="bg-black/40 border border-white/5 p-12 rounded-[3rem] min-h-[250px] flex items-center justify-center relative shadow-inner">
                            {isThinking ? (
                                <div className="text-center">
                                    <div className="w-16 h-16 border-8 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-[0_0_30px_#2563eb]"></div>
                                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.6em] animate-pulse">Processing Load Demand Matrix...</p>
                                </div>
                            ) : strategy ? (
                                <p className="text-blue-100 text-2xl italic leading-loose font-serif text-center max-w-3xl animate-fade-in-up">"{strategy}"</p>
                            ) : (
                                <div className="text-center space-y-4">
                                     <ArrowPathIcon className="h-16 w-16 mx-auto text-slate-700 opacity-20" />
                                     <p className="text-slate-500 text-sm font-medium italic text-center max-w-md">Execute strategic audit to generate structural work directives based on Eskom stage telemetry and regional node patterns.</p>
                                </div>
                            )}
                         </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-10 text-left">
                    <div className="bg-slate-900 rounded-[3.5rem] p-10 border border-white/10 shadow-2xl relative overflow-hidden">
                         <h3 className="text-lg font-black italic uppercase tracking-tighter text-white mb-10 flex items-center gap-3">
                             <BoltIcon className="h-6 w-6 text-red-600" /> Infrastructure <span className="text-red-600">Vitals</span>
                         </h3>
                         <div className="space-y-8">
                             <div className="flex justify-between items-center p-6 bg-white/5 rounded-3xl border border-white/5 group hover:bg-white/10 transition-all">
                                 <div>
                                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Grid Dependent Tasks</p>
                                     <p className="text-4xl font-black text-white italic">{powerIntensiveTasks.length}</p>
                                 </div>
                                 <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500 shadow-inner group-hover:scale-110 transition-transform">
                                     <BeakerIcon className="h-8 w-8" />
                                 </div>
                             </div>
                             <div className="flex justify-between items-center p-6 bg-white/5 rounded-3xl border border-white/5 group hover:bg-white/10 transition-all">
                                 <div>
                                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Daylight Window</p>
                                     <p className="text-4xl font-black text-emerald-400 italic">4.5 Hrs</p>
                                 </div>
                                 <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 shadow-inner group-hover:scale-110 transition-transform">
                                     <CheckCircleIcon className="h-8 w-8" />
                                 </div>
                             </div>
                         </div>
                    </div>

                    <div className="bg-blue-600 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden group border border-white/10">
                         <div className="absolute inset-0 bg-carbon opacity-10"></div>
                         <div className="absolute top-0 right-0 p-8 opacity-20 transform -rotate-12 group-hover:scale-110 transition-transform duration-1000">
                             <ShieldCheckIcon className="h-48 w-48" />
                         </div>
                         <p className="text-[10px] font-black uppercase tracking-[0.5em] mb-4 opacity-70">Uptime Handshake</p>
                         <h4 className="text-4xl font-black italic leading-none uppercase tracking-tighter">Grid Shield <br/> Active.</h4>
                         <p className="text-xs text-blue-100 mt-6 font-medium leading-relaxed italic">"Uplink verified with National Control Centre. Visual telemetry adapting for reduced visibility windows."</p>
                         <div className="mt-12 flex items-center gap-3">
                             <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_15px_emerald]"></div>
                             <span className="text-[10px] font-black uppercase tracking-widest font-mono">STABILIZATION LOCKED</span>
                         </div>
                    </div>
                </div>
            </div>
            
            <div className="fixed bottom-10 left-10 pointer-events-none opacity-5 -z-10 rotate-90 select-none">
                <span className="text-[120px] font-black tracking-tighter text-slate-400 uppercase italic">STRATEGY v80.5</span>
            </div>
        </div>
    );
};

export default GridStrategyConsole;