
import React, { useEffect, useState, useMemo } from 'react';
import { 
  WrenchScrewdriverIcon, 
  PowerIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ArrowPathIcon,
  BoltIcon,
  SignalIcon,
  CpuChipIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  MapIcon,
  CameraIcon,
  MicrophoneIcon,
  SparklesIcon,
  LockClosedIcon,
  LockOpenIcon,
  FingerPrintIcon,
  ClockIcon
} from '@heroicons/react/24/solid';
import { Plane, Navigation2, Sun } from 'lucide-react';
import { ContractorTab, ProjectStatus } from '../../types';
import { useData } from '../../hooks/useDataContext';
import { useCurrency } from '../../hooks/useCurrency';
import AnimatedNumber from '../../components/AnimatedNumber';
import WeatherWidget from '../../components/WeatherWidget';

const TelemetryValue = ({ label, value, unit, color = "text-white" }: any) => (
    <div className="flex flex-col text-left">
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">{label}</span>
        <p className={`text-2xl font-black italic tracking-tighter uppercase ${color}`}>
            {value}<span className="text-[10px] ml-1 not-italic opacity-40">{unit}</span>
        </p>
    </div>
);

const NodeBlip = ({ project, active, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`relative p-4 rounded-2xl border-2 transition-all duration-500 flex flex-col gap-2 group ${active ? 'bg-red-600 border-red-400 shadow-[0_0_30px_rgba(220,0,0,0.3)] scale-105' : 'bg-slate-900 border-white/5 hover:border-red-600/30'}`}
    >
        <div className="flex justify-between items-center">
            <span className={`text-[9px] font-black uppercase tracking-widest ${active ? 'text-white' : 'text-slate-50'}`}>Node: {project.id.slice(-4)}</span>
            <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-white animate-pulse' : 'bg-red-600'}`}></div>
        </div>
        <p className={`font-black uppercase italic tracking-tighter truncate w-full text-left ${active ? 'text-white' : 'text-slate-300'}`}>{project.projectName}</p>
    </button>
);

const RuggedButton: React.FC<{ title: string; icon: React.ElementType; onClick: () => void; colorClass: string }> = ({ title, icon: Icon, onClick, colorClass }) => (
    <button
        onClick={onClick}
        className={`${colorClass} relative overflow-hidden p-8 rounded-[3rem] shadow-2xl transform transition-all duration-300 active:scale-95 active:shadow-inner border-b-[12px] border-black flex flex-col items-center justify-center text-center h-64 group hover:brightness-110`}
    >
        <div className="absolute inset-0 bg-carbon opacity-5"></div>
        <div className={`p-6 rounded-[2rem] mb-6 group-hover:scale-110 transition-transform bg-black/20 text-white`}>
            <Icon className="h-16 w-16 drop-shadow-2xl" />
        </div>
        <span className={`font-black text-2xl uppercase tracking-tighter italic text-white`}>{title}</span>
    </button>
);

const OnSiteDashboard: React.FC<{ onExit: () => void; onNavigate: (tab: ContractorTab) => void; onOpenAssistant: () => void }> = ({ onExit, onNavigate, onOpenAssistant }) => {
    const { projects, dailyBriefing, generateDailyBriefing, isAILoading, isRuggedMode, toggleRuggedMode } = useData();
    const { formatCurrency } = useCurrency();
    const [activeNodeId, setActiveNodeId] = useState<string>(projects[0]?.id || '');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isLocked, setIsLocked] = useState(false);
    const [unlockProgress, setUnlockProgress] = useState(0);

    const activeProject = useMemo(() => projects.find(p => p.id === activeNodeId) || projects[0], [projects, activeNodeId]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleUnlockStart = () => {
        let p = 0;
        const interval = setInterval(() => {
            p += 5;
            setUnlockProgress(p);
            if (p >= 100) {
                clearInterval(interval);
                setIsLocked(false);
                setUnlockProgress(0);
            }
        }, 50);
        (window as any)._unlockInterval = interval;
    };

    const handleUnlockEnd = () => {
        clearInterval((window as any)._unlockInterval);
        setUnlockProgress(0);
    };

    return (
        <div className={`fixed inset-0 z-[9000] flex flex-col font-sans overflow-hidden transition-colors duration-700 ${isRuggedMode ? 'bg-white' : 'bg-slate-950 text-white'}`}>
            {!isRuggedMode && <div className="absolute inset-0 bg-carbon opacity-10 pointer-events-none"></div>}
            {!isRuggedMode && <div className="scanline"></div>}

            {/* Locked Overlay */}
            {isLocked && (
                <div className="fixed inset-0 z-[10000] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center animate-fade-in">
                    <div className="relative flex flex-col items-center gap-12">
                        <div className="relative">
                            <div className="w-48 h-48 rounded-full border-8 border-white/5 flex items-center justify-center">
                                <LockClosedIcon className="h-24 w-24 text-red-600 animate-pulse" />
                            </div>
                            <svg className="absolute inset-[-10px] w-[calc(100%+20px)] h-[calc(100%+20px)] transform -rotate-90">
                                <circle cx="106" cy="106" r="100" fill="transparent" stroke="rgba(220,0,0,0.1)" strokeWidth="8" />
                                <circle cx="106" cy="106" r="100" fill="transparent" stroke="#DC0000" strokeWidth="8" strokeDasharray="628" strokeDashoffset={628 - (628 * unlockProgress) / 100} />
                            </svg>
                        </div>
                        <div className="text-center">
                            <h2 className="text-6xl font-black italic tracking-tighter uppercase leading-none mb-4">SYSTEM <span className="text-red-600">LOCKED</span></h2>
                            <p className="text-slate-500 font-black uppercase tracking-[0.6em] text-xs">Tactical Lockdown protocol active</p>
                        </div>
                        <button 
                            onMouseDown={handleUnlockStart}
                            onMouseUp={handleUnlockEnd}
                            onTouchStart={handleUnlockStart}
                            onTouchEnd={handleUnlockEnd}
                            className="bg-white text-slate-950 p-10 rounded-full shadow-2xl active:scale-90 transition-all"
                        >
                            <FingerPrintIcon className="h-12 w-12" />
                        </button>
                    </div>
                </div>
            )}

            {/* Main Header HUD */}
            <div className={`h-24 border-b flex items-center justify-between px-10 relative z-10 shadow-2xl transition-all ${isRuggedMode ? 'bg-white border-black border-b-[4px]' : 'bg-slate-900/80 backdrop-blur-3xl border-white/10'}`}>
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4 text-left">
                        <div className={`p-3 rounded-2xl shadow-2xl ${isRuggedMode ? 'bg-black text-white' : 'bg-red-600 text-white'}`}>
                            <CpuChipIcon className="h-8 w-8" />
                        </div>
                        <div className="text-left">
                            <h2 className={`text-3xl font-black italic uppercase tracking-tighter leading-none ${isRuggedMode ? 'text-black' : 'text-white'}`}>COCKPIT <span className="text-red-600">HUD</span></h2>
                            <p className={`text-[10px] font-black uppercase tracking-[0.6em] mt-2 ${isRuggedMode ? 'text-black font-black' : 'text-slate-500'}`}>Grid OS v110.0</p>
                        </div>
                    </div>
                    <div className="flex gap-10">
                        <TelemetryValue label="National Load" value="94.2" unit="%" color={isRuggedMode ? "text-black" : "text-red-500"} />
                        <TelemetryValue label="Node Latency" value="22" unit="MS" color={isRuggedMode ? "text-black" : "text-blue-400"} />
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right font-mono hidden md:block text-left">
                        <p className={`text-xl font-black italic tracking-tighter ${isRuggedMode ? 'text-black' : 'text-white'}`}>{currentTime.toLocaleTimeString()}</p>
                        <p className={`text-[8px] font-black uppercase tracking-widest mt-1 ${isRuggedMode ? 'text-black font-black' : 'text-slate-500'}`}>OP_TIME</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={toggleRuggedMode} className={`p-4 rounded-2xl border transition-all ${isRuggedMode ? 'bg-black text-white border-black' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                             <Sun className="h-5 w-5" />
                        </button>
                        <button onClick={() => setIsLocked(true)} className={`p-4 rounded-2xl border transition-all ${isRuggedMode ? 'bg-white border-black text-black' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                            <LockOpenIcon className="h-5 w-5" />
                        </button>
                        <button onClick={onExit} className={`font-black py-4 px-10 rounded-[1.5rem] border-4 shadow-2xl uppercase text-[10px] tracking-[0.4em] transition-all transform active:scale-90 ${isRuggedMode ? 'bg-orange-600 text-white border-black' : 'bg-red-600 hover:bg-red-700 text-white border-slate-950'}`}>
                            Eject
                        </button>
                    </div>
                </div>
            </div>

            {/* Interactive Grid Area */}
            <div className="flex-1 flex overflow-hidden p-8 gap-8">
                <div className="flex-1 flex flex-col gap-8 overflow-hidden relative z-10">
                    <div className={`h-96 rounded-[4rem] border-4 shadow-2xl relative overflow-hidden group ${isRuggedMode ? 'bg-white border-black' : 'bg-slate-900 border-slate-900'}`}>
                        <div className={`absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center transition-all duration-2000 ${isRuggedMode ? 'opacity-10 grayscale' : 'opacity-40 grayscale group-hover:grayscale-0'}`}></div>
                        
                        <div className="absolute top-10 left-10 text-left">
                            <div className="flex items-center gap-3 mb-2 text-left">
                                <div className={`w-3 h-3 rounded-full animate-pulse ${isRuggedMode ? 'bg-black' : 'bg-red-600 shadow-[0_0_15px_red]'}`}></div>
                                <span className={`text-[10px] font-black uppercase tracking-[0.6em] ${isRuggedMode ? 'text-black' : 'text-white'}`}>LIVE_NODE_TELEMETRY</span>
                            </div>
                            <h2 className={`text-6xl font-black italic uppercase tracking-tighter leading-none ${isRuggedMode ? 'text-black' : 'text-white'}`}>{activeProject?.projectName}</h2>
                        </div>

                        <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                            <div className="flex gap-8">
                                <TelemetryValue label="Struct Accuracy" value="98.2" unit="%" color={isRuggedMode ? "text-black" : "text-blue-400"} />
                                <TelemetryValue label="Material Pulse" value="Sourced" unit="" color={isRuggedMode ? "text-black" : "text-emerald-400"} />
                            </div>
                            <button onClick={() => onNavigate('site_reporter')} className={`font-black py-5 px-10 rounded-[2rem] shadow-2xl uppercase text-[10px] tracking-widest transform active:scale-95 border flex items-center justify-center gap-3 ${isRuggedMode ? 'bg-black text-white border-black' : 'bg-red-600 hover:bg-red-700 border-white/20'}`}>
                                <CameraIcon className="h-6 w-6"/> Vision
                            </button>
                        </div>
                    </div>

                    <div className={`flex-1 border rounded-[4rem] p-12 shadow-2xl relative overflow-hidden group ${isRuggedMode ? 'bg-white border-black border-[4px]' : 'bg-slate-900 border-white/10'}`}>
                        {!isRuggedMode && <div className="absolute inset-0 bg-carbon opacity-10"></div>}
                        <div className="relative z-10 h-full flex flex-col">
                            <div className={`flex justify-between items-start mb-8 border-b-2 pb-4 ${isRuggedMode ? 'border-black' : 'border-white/5'}`}>
                                <h3 className={`text-2xl font-black italic uppercase tracking-tighter flex items-center gap-4 leading-none ${isRuggedMode ? 'text-black' : 'text-white'}`}>
                                    <div className={`w-1.5 h-10 rounded-full ${isRuggedMode ? 'bg-black' : 'bg-red-600'}`}></div>
                                    Mission <span className="text-red-600">Directives</span>
                                </h3>
                                <button onClick={() => generateDailyBriefing(true)} className={`p-4 rounded-2xl transition-all shadow-xl ${isRuggedMode ? 'bg-slate-100 border-black border-2 text-black' : 'bg-white/5 border-white/5'}`}>
                                    <ArrowPathIcon className={`h-8 w-8 ${isAILoading.briefing ? 'animate-spin' : ''}`} />
                                </button>
                            </div>

                            <div className="flex-grow flex flex-col md:flex-row gap-16 text-left">
                                <div className={`flex-1 pr-16 text-left border-r-4 ${isRuggedMode ? 'border-black' : 'border-white/5'}`}>
                                    <p className={`text-4xl font-black italic leading-[1.1] uppercase tracking-tighter ${isRuggedMode ? 'text-black' : 'text-slate-100'}`}>
                                        "{dailyBriefing?.summary || 'Initializing neural handshake...'}"
                                    </p>
                                </div>
                                <div className="flex-1 flex flex-col justify-center space-y-4">
                                    {dailyBriefing?.keyUpdates.map((u: string, i: number) => (
                                        <div key={i} className={`flex items-center gap-5 p-4 rounded-2xl border transition-all ${isRuggedMode ? 'bg-slate-50 border-black' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                                            <div className={`w-1 h-8 rounded-full ${isRuggedMode ? 'bg-black' : 'bg-blue-600 shadow-[0_0_10px_#2563eb]'}`}></div>
                                            <span className={`text-sm font-bold uppercase tracking-tight truncate ${isRuggedMode ? 'text-black' : 'text-slate-300'}`}>{u}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Control Strip */}
                <div className="w-80 flex flex-col gap-6 shrink-0 relative z-10">
                    <button onClick={onOpenAssistant} className={`rounded-[3rem] p-8 flex flex-col items-center justify-center text-center shadow-2xl border-b-[12px] transition-all transform active:scale-95 group h-64 ${isRuggedMode ? 'bg-orange-600 border-black' : 'bg-red-600 hover:bg-red-700 border-black/30 shadow-red-900/40'}`}>
                         <div className={`p-6 rounded-[2.5rem] backdrop-blur-xl mb-6 group-hover:scale-110 transition-transform shadow-2xl border-2 ${isRuggedMode ? 'bg-black text-white border-black' : 'bg-white/20 text-white border-white/10'}`}>
                            <MicrophoneIcon className="h-16 w-16 text-white" />
                         </div>
                         <span className="font-black text-3xl italic tracking-tighter uppercase leading-none">Voice Link</span>
                         <span className={`text-[9px] font-black uppercase mt-4 tracking-[0.4em] ${isRuggedMode ? 'text-black' : 'text-red-200 opacity-80'}`}>Transmit Directive</span>
                    </button>

                    <div className={`border rounded-[2.5rem] p-6 flex flex-col shadow-inner transition-all ${isRuggedMode ? 'bg-slate-50 border-black border-[4px]' : 'bg-slate-900/50 border-white/5'}`}>
                        <h3 className={`text-xs font-black uppercase tracking-[0.4em] mb-6 border-b pb-3 flex items-center justify-between ${isRuggedMode ? 'text-black border-black' : 'text-slate-500 border-white/5'}`}>
                            Grid Nodes
                            <span className="text-red-600 text-xs font-mono">{projects.length}</span>
                        </h3>
                        <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar max-h-[300px] pr-2 text-left">
                            {projects.map(p => (
                                <NodeBlip key={p.id} project={p} active={activeNodeId === p.id} onClick={() => setActiveNodeId(p.id)} />
                            ))}
                        </div>
                    </div>

                    <div className={`border rounded-[3rem] p-8 shadow-2xl text-left relative overflow-hidden transition-all ${isRuggedMode ? 'bg-white border-black border-[4px]' : 'bg-slate-900 border-white/5'}`}>
                        {!isRuggedMode && <div className="absolute inset-0 bg-carbon opacity-5"></div>}
                        <h4 className={`text-[10px] font-black uppercase tracking-widest mb-6 ${isRuggedMode ? 'text-black' : 'text-slate-500'}`}>Protocol Sync</h4>
                        <div className="space-y-4 relative z-10 text-left">
                            {[{ label: 'SANS Audit', icon: ShieldCheckIcon, tab: 'regulatory-pulse' }, { label: 'Roster Sync', icon: UserGroupIcon, tab: 'labor-matrix' }].map(item => (
                                <button key={item.label} onClick={() => onNavigate(item.tab as ContractorTab)} className={`w-full p-5 border rounded-2xl transition-all flex items-center justify-between group ${isRuggedMode ? 'bg-white border-black' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isRuggedMode ? 'text-black' : 'text-slate-300'}`}>{item.label}</span>
                                    <item.icon className={`h-5 w-5 ${isRuggedMode ? 'text-black' : 'text-slate-500 group-hover:text-blue-500'}`} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className={`fixed bottom-10 left-10 pointer-events-none opacity-[0.03] -z-10 rotate-90 select-none ${isRuggedMode ? 'text-black font-black' : 'text-white'}`}>
                <span className="text-[260px] font-black tracking-tighter uppercase">GRID COMMAND</span>
            </div>
        </div>
    );
};

export default OnSiteDashboard;
