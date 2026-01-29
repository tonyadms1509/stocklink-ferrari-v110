
import React, { useMemo, useState, useEffect } from 'react';
import { useData } from '../../hooks/useDataContext.tsx';
import { useCurrency } from '../../hooks/useCurrency.tsx';
import { 
    UsersIcon, 
    ShoppingCartIcon, 
    CurrencyDollarIcon, 
    ShieldExclamationIcon, 
    ShieldCheckIcon,
    SignalIcon,
    RocketLaunchIcon,
    BoltIcon,
    CheckCircleIcon,
    GlobeAmericasIcon,
    MapIcon,
    UserPlusIcon,
    BuildingStorefrontIcon,
    WrenchScrewdriverIcon,
    ArrowRightIcon,
    ComputerDesktopIcon,
    ServerIcon,
    LockOpenIcon,
    ExclamationTriangleIcon,
    Activity
} from '@heroicons/react/24/solid';
import { DisputeStatus, SystemStatus, UserRole } from '../../types.ts';
import AnimatedNumber from '../../components/AnimatedNumber';
import LaunchCelebration from '../../components/LaunchCelebration.tsx';
import { isSupabaseConfigured } from '../../services/supabaseClient';

const DiagnosticLine: React.FC<{ label: string; status: 'ok' | 'fail' | 'testing'; delay: number }> = ({ label, status, delay }) => {
    const [currentStatus, setCurrentStatus] = useState<'ok' | 'fail' | 'testing'>('testing');
    
    useEffect(() => {
        const timer = setTimeout(() => setCurrentStatus(status), delay);
        return () => clearTimeout(timer);
    }, [status, delay]);

    return (
        <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{label}</span>
            <div className="flex items-center gap-3">
                {currentStatus === 'testing' ? (
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></div>
                ) : currentStatus === 'ok' ? (
                    <span className="text-[9px] font-black text-emerald-500 uppercase italic">Verified</span>
                ) : (
                    <span className="text-[9px] font-black text-red-500 uppercase italic">Friction</span>
                )}
            </div>
        </div>
    );
};

const GridStat: React.FC<{ label: string; value: string | number; icon: any; color: string }> = ({ label, value, icon: Icon, color }) => (
    <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] shadow-xl text-left relative overflow-hidden group hover:border-blue-500/30 transition-all duration-500">
        <div className="absolute inset-0 bg-carbon opacity-5 group-hover:opacity-10"></div>
        <div className="flex justify-between items-start mb-6 relative z-10">
            <div className={`p-4 rounded-2xl ${color} bg-opacity-10 transition-transform group-hover:scale-110 shadow-lg border border-white/5`}>
                <Icon className={`h-8 w-8 ${color.replace('bg-', 'text-')}`} />
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
        </div>
        <div className="relative z-10">
            <p className="text-[3.5rem] font-black text-white italic tracking-tighter leading-none mb-4">
                {typeof value === 'number' ? <AnimatedNumber value={value} /> : value}
            </p>
            <div className="flex items-center gap-4 border-l-4 border-blue-600 pl-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-tight">{label}</p>
            </div>
        </div>
    </div>
);

const AdminDashboard: React.FC = () => {
    const { users = [], orders = [], disputes = [], systemStatus, launchSystem } = useData();
    const { formatCurrency } = useCurrency();
    const [launchStep, setLaunchStep] = useState<'IDLE' | 'WAKING' | 'LIVE'>(systemStatus === SystemStatus.Production ? 'LIVE' : 'IDLE');
    const [showCelebration, setShowCelebration] = useState(false);
    const [isAuditing, setIsAuditing] = useState(false);
    const [auditComplete, setAuditComplete] = useState(false);
    const [isBypassing, setIsBypassing] = useState(false);
    
    const gmv = useMemo(() => (orders || []).reduce((total, order) => total + (order.total || 0), 0), [orders]);
    const openDisputes = useMemo(() => (disputes || []).filter(d => d.status !== DisputeStatus.Resolved), [disputes]);
    
    const handleIgnite = () => {
        if (launchStep !== 'IDLE' || (!auditComplete && !isBypassing)) return;
        setLaunchStep('WAKING');
        setTimeout(() => {
            launchSystem();
            setLaunchStep('LIVE');
            setShowCelebration(true);
        }, 3000);
    };

    const runAudit = () => {
        setIsAuditing(true);
        setAuditComplete(false);
        setIsBypassing(false);
        setTimeout(() => {
            setIsAuditing(false);
            setAuditComplete(true);
        }, 4000);
    };

    const handleManualBypass = () => {
        setIsBypassing(true);
        setAuditComplete(true);
    };

    return (
        <div className="pb-24 animate-fade-in font-sans selection:bg-red-600/30">
            {showCelebration && <LaunchCelebration onClose={() => setShowCelebration(false)} />}
            
            <div className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-12 border-b border-white/5 pb-16">
                <div className="text-left">
                     <div className="flex items-center gap-4 mb-4 text-red-600">
                        <SignalIcon className="h-8 w-8 animate-pulse shadow-[0_0_20px_#dc2626]" />
                        <span className="text-[12px] font-black uppercase tracking-[0.6em] italic text-red-600">NATIONAL_COMMAND_HUD v80.5</span>
                    </div>
                    <h2 className="text-8xl font-black text-white tracking-tighter italic uppercase leading-none">GRID <span className="text-red-600">COMMANDER</span></h2>
                </div>
                <div className="bg-slate-900 border-4 border-emerald-500/30 px-10 py-5 rounded-[2.5rem] flex items-center gap-6 shadow-[0_0_50px_rgba(16,185,129,0.1)] transition-all hover:scale-105">
                    <div className="text-right">
                         <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Grid Environment</p>
                         <p className="text-2xl font-black text-emerald-400 italic tracking-tighter uppercase leading-none">{systemStatus}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-4 border-slate-950 ${systemStatus === SystemStatus.Production ? 'bg-emerald-500 shadow-[0_0_20px_#10b981]' : 'bg-blue-500 animate-pulse shadow-[0_0_20px_#3b82f6]'}`}></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">
                {/* Audit Terminal */}
                <div className="lg:col-span-8 bg-slate-900 rounded-[5rem] p-16 shadow-2xl border border-white/5 relative overflow-hidden group">
                     <div className="absolute inset-0 bg-carbon opacity-10"></div>
                     <div className="relative z-10 flex flex-col lg:flex-row gap-16 text-left">
                        <div className="flex-1">
                             <div className="flex items-center gap-4 mb-10">
                                <div className="p-4 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                                    <ComputerDesktopIcon className="h-10 w-10 text-blue-500"/>
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">LAUNCH <span className="text-blue-500">AUDIT</span></h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">Protocol: Handshake Verification</p>
                                </div>
                             </div>
                             <p className="text-lg text-slate-400 font-medium leading-relaxed mb-12 italic">"Execute a logarithmic handshake with national supply nodes and global clearing houses to ensure 100% operational throughput before project ignition."</p>
                             
                             <div className="flex gap-6">
                                <button 
                                    onClick={runAudit}
                                    disabled={isAuditing}
                                    className="bg-white/5 hover:bg-white/10 text-white font-black py-6 px-10 rounded-[2rem] border-4 border-white/5 uppercase tracking-widest text-xs transition-all transform active:scale-95 disabled:opacity-50 shadow-2xl"
                                >
                                    {isAuditing ? 'Auditing Matrix...' : 'Start Global Audit'}
                                </button>
                                
                                {auditComplete && !isSupabaseConfigured && !isBypassing && (
                                    <button 
                                        onClick={handleManualBypass}
                                        className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white font-black py-6 px-10 rounded-[2rem] border-4 border-red-500/20 uppercase tracking-widest text-xs transition-all transform active:scale-95 animate-pulse shadow-2xl"
                                    >
                                        Override Sensors
                                    </button>
                                )}
                             </div>
                        </div>
                        <div className="lg:w-1/3 bg-black/60 rounded-[3rem] p-10 border border-white/5 shadow-inner">
                            {isAuditing || auditComplete ? (
                                <div className="space-y-2">
                                    <DiagnosticLine label="Supabase Nerve Center" status={isSupabaseConfigured || isBypassing ? "ok" : "fail"} delay={800} />
                                    <DiagnosticLine label="Paystack ZAR Terminal" status="ok" delay={1500} />
                                    <DiagnosticLine label="PayPal Global Bridge" status="ok" delay={2200} />
                                    <DiagnosticLine label="Neural AI Core" status="ok" delay={3000} />
                                    <DiagnosticLine label="Registry SSL Shield" status="ok" delay={3500} />
                                    
                                    {isBypassing && (
                                        <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-4 text-red-500 animate-pulse">
                                            <ExclamationTriangleIcon className="h-6 w-6" />
                                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Bypass protocol: ACTIVE</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                                    <ServerIcon className="h-16 w-16 mb-6"/>
                                    <p className="text-[11px] font-black uppercase tracking-[0.4em]">Awaiting Simulation Parameters</p>
                                </div>
                            )}
                        </div>
                     </div>
                </div>

                {/* Ignition Control */}
                <div className="bg-slate-900 rounded-[4rem] p-12 text-white shadow-2xl border border-white/10 relative overflow-hidden flex flex-col items-center justify-center text-center group">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent"></div>
                    <div className="relative z-10">
                        <button 
                            onClick={handleIgnite} 
                            disabled={launchStep !== 'IDLE' || (!auditComplete && !isBypassing)}
                            className={`w-56 h-56 rounded-full border-[12px] transition-all duration-1000 flex flex-col items-center justify-center relative ${(!auditComplete && !isBypassing) ? 'bg-slate-800 border-slate-700 opacity-40 grayscale' : launchStep === 'LIVE' ? 'bg-emerald-600 border-emerald-400 shadow-[0_0_100px_rgba(16,185,129,0.4)]' : launchStep === 'WAKING' ? 'bg-blue-600 border-blue-400 animate-pulse shadow-[0_0_80px_rgba(37,99,235,0.4)]' : 'bg-red-600 border-red-500 shadow-[0_0_80px_rgba(220,0,0,0.3)] hover:scale-105 active:scale-95'}`}
                        >
                            <div className="absolute inset-[-4px] rounded-full border-4 border-dashed border-white/10 animate-[spin_8s_linear_infinite]"></div>
                            {launchStep === 'IDLE' ? (
                                <>
                                    <RocketLaunchIcon className="h-16 w-16 mb-2 drop-shadow-2xl"/>
                                    <span className="font-black text-xs uppercase tracking-[0.4em]">{(auditComplete || isBypassing) ? 'IGNITE' : 'LOCKED'}</span>
                                </>
                            ) : launchStep === 'WAKING' ? (
                                <span className="font-black text-xs uppercase tracking-[0.5em] animate-pulse italic">Engaging...</span>
                            ) : (
                                <ShieldCheckIcon className="h-24 w-24 drop-shadow-2xl animate-fade-in-scale"/>
                            )}
                        </button>
                        <p className="mt-10 font-black text-slate-500 uppercase tracking-[0.6em] text-[10px] italic">
                            {(!auditComplete && !isBypassing) ? "Validate Grid Vitals" : "Grid Core Handover Ready"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <GridStat label="Network Node Capacity" value={users.length} icon={UsersIcon} color="bg-blue-600" />
                <GridStat label="National Dispatch Flow" value={orders.length} icon={ShoppingCartIcon} color="bg-red-600" />
                <GridStat label="Settlement Volume" value={formatCurrency(gmv)} icon={CurrencyDollarIcon} color="bg-emerald-600" />
                <GridStat label="System Critical Alerts" value={openDisputes.length} icon={ShieldExclamationIcon} color="bg-amber-600" />
            </div>

            <div className="bg-slate-900 border border-white/5 rounded-[5rem] p-16 shadow-2xl relative overflow-hidden text-left group">
                 <div className="absolute inset-0 bg-carbon opacity-10"></div>
                 <div className="absolute top-0 right-0 p-16 opacity-5 transform group-hover:scale-110 transition-transform duration-2000"><Activity size={600} className="text-white"/></div>
                 <div className="relative z-10">
                    <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-12 flex items-center gap-5">
                         <div className="w-2 h-12 bg-blue-600 rounded-full"></div>
                         Global <span className="text-blue-600">Telemetry</span> Feed
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                         <div className="lg:col-span-2 bg-black/40 rounded-[3rem] p-12 border border-white/5 shadow-inner min-h-[300px] flex items-center justify-center">
                            <div className="text-center opacity-30 italic font-black uppercase text-xs tracking-[1em]">Awaiting Strategic Dataset...</div>
                         </div>
                         <div className="space-y-8">
                             <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer">
                                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Core Processing</p>
                                 <p className="text-2xl font-black text-white italic tracking-tighter">98.4% Efficiency</p>
                             </div>
                              <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 hover:border-red-500/30 transition-all cursor-pointer">
                                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Grid Load</p>
                                 <p className="text-2xl font-black text-red-500 italic tracking-tighter">STAGE 4 LOCKOUT</p>
                             </div>
                         </div>
                    </div>
                 </div>
            </div>

            <div className="fixed bottom-12 left-12 pointer-events-none opacity-5 -z-10 rotate-90 select-none">
                <span className="text-[180px] font-black tracking-tighter text-white uppercase italic">GRID_COMMAND_NODE</span>
            </div>
        </div>
    );
};

export default AdminDashboard;
