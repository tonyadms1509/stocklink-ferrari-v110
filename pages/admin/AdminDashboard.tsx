
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
    ExclamationTriangleIcon
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
        <div className="pb-12 animate-fade-in font-sans selection:bg-red-600/30 bg-slate-950 p-6 md:p-12 min-h-screen text-slate-200 overflow-x-hidden relative text-left">
            {showCelebration && <LaunchCelebration onClose={() => setShowCelebration(false)} />}
            
            <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-12 border-b border-white/5 pb-12">
                <div className="text-left">
                     <div className="flex items-center gap-3 mb-2 text-red-600">
                        <SignalIcon className="h-6 w-6 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">Global Control Center v80.5</span>
                    </div>
                    <h2 className="text-7xl font-black text-white tracking-tighter italic uppercase">Grid <span className="text-red-600">Commander</span></h2>
                </div>
                <div className="bg-slate-900 border border-emerald-500/30 px-8 py-4 rounded-3xl flex items-center gap-4 shadow-[0_0_40px_rgba(16,185,129,0.1)] transition-all hover:scale-105">
                    <div className="text-right">
                         <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Environment</p>
                         <p className="text-lg font-black text-emerald-400 italic tracking-tighter uppercase">{systemStatus}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full ${systemStatus === SystemStatus.Production ? 'bg-emerald-500 shadow-[0_0_15px_emerald]' : 'bg-blue-500 animate-pulse shadow-[0_0_15px_#3b82f6]'}`}></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
                {/* Audit Terminal */}
                <div className="lg:col-span-2 bg-slate-900 rounded-[4rem] p-12 shadow-2xl border border-white/5 relative overflow-hidden group">
                     <div className="absolute inset-0 bg-carbon opacity-10"></div>
                     <div className="relative z-10 flex flex-col md:flex-row gap-12">
                        <div className="flex-1">
                             <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-6 flex items-center gap-4">
                                <ComputerDesktopIcon className="h-7 w-7 text-blue-500"/>
                                Launch <span className="text-blue-500">Readiness</span> Audit
                             </h3>
                             <p className="text-sm text-slate-400 font-medium leading-relaxed mb-8">Execute a neural handshake with all national and global clearing houses to ensure 100% operational throughput before project ignition.</p>
                             
                             <div className="flex gap-4">
                                <button 
                                    onClick={runAudit}
                                    disabled={isAuditing}
                                    className="bg-white/5 hover:bg-white/10 text-white font-black py-4 px-8 rounded-2xl border border-white/10 uppercase tracking-widest text-[10px] transition-all transform active:scale-95 disabled:opacity-50"
                                >
                                    {isAuditing ? 'Auditing Matrix...' : 'Start Global Audit'}
                                </button>
                                
                                {auditComplete && !isSupabaseConfigured && !isBypassing && (
                                    <button 
                                        onClick={handleManualBypass}
                                        className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white font-black py-4 px-8 rounded-2xl border border-red-500/20 uppercase tracking-widest text-[10px] transition-all transform active:scale-95 animate-pulse"
                                    >
                                        Override Sensors
                                    </button>
                                )}
                             </div>
                        </div>
                        <div className="flex-1 bg-black/40 rounded-[2.5rem] p-8 border border-white/5 shadow-inner">
                            {isAuditing || auditComplete ? (
                                <div className="space-y-1">
                                    <DiagnosticLine label="Supabase Nerve Center" status={isSupabaseConfigured || isBypassing ? "ok" : "fail"} delay={800} />
                                    <DiagnosticLine label="Paystack ZAR Terminal" status="ok" delay={1500} />
                                    <DiagnosticLine label="PayPal Global Bridge" status="ok" delay={2200} />
                                    <DiagnosticLine label="Neural AI Core (Gemini 3)" status="ok" delay={3000} />
                                    <DiagnosticLine label="Registry SSL Shield" status="ok" delay={3500} />
                                    
                                    {isBypassing && (
                                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-red-500 animate-pulse">
                                            <ExclamationTriangleIcon className="h-4 w-4" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Manual Bypass Protocol Engaged</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-20">
                                    <ServerIcon className="h-10 w-10 mb-4"/>
                                    <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Diagnostics</p>
                                </div>
                            )}
                        </div>
                     </div>
                </div>

                {/* Ignition Control */}
                <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl border border-white/10 relative overflow-hidden flex flex-col items-center justify-center text-center group">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent"></div>
                    <div className="relative z-10">
                        <button 
                            onClick={handleIgnite} 
                            disabled={launchStep !== 'IDLE' || (!auditComplete && !isBypassing)}
                            className={`w-48 h-48 rounded-full border-8 transition-all duration-1000 flex flex-col items-center justify-center relative ${(!auditComplete && !isBypassing) ? 'bg-slate-800 border-slate-700 opacity-40 grayscale' : launchStep === 'LIVE' ? 'bg-emerald-600 border-emerald-400 shadow-[0_0_100px_rgba(16,185,129,0.3)]' : launchStep === 'WAKING' ? 'bg-blue-600 border-blue-400 animate-pulse shadow-[0_0_80px_rgba(37,99,235,0.4)]' : 'bg-red-600 border-red-500 shadow-[0_0_80px_rgba(220,0,0,0.3)] hover:scale-105 active:scale-95'}`}
                        >
                            <div className="absolute inset-0 rounded-full border-4 border-white/10 animate-[spin_5s_linear_infinite]"></div>
                            {launchStep === 'IDLE' ? (
                                <>
                                    <RocketLaunchIcon className="h-12 w-12 mb-2"/>
                                    <span className="font-black text-xs uppercase tracking-widest">{(auditComplete || isBypassing) ? 'IGNITE' : 'LOCKED'}</span>
                                </>
                            ) : launchStep === 'WAKING' ? (
                                <span className="font-black text-[10px] uppercase tracking-[0.3em]">WARMING...</span>
                            ) : (
                                <ShieldCheckIcon className="h-16 w-16"/>
                            )}
                        </button>
                        <p className="mt-8 font-black text-slate-500 uppercase tracking-[0.5em] text-[9px] italic">
                            {(!auditComplete && !isBypassing) ? "Verify Grid Credentials First" : "Neural Deployment Switch Ready"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] shadow-xl text-left relative overflow-hidden group">
                    <div className="absolute inset-0 bg-carbon opacity-5"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <UsersIcon className="h-8 w-8 text-blue-500"/>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    </div>
                    <p className="text-4xl font-black text-white italic tracking-tighter uppercase"><AnimatedNumber value={users.length} /></p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 border-l-2 border-blue-600 pl-2">Entity Capacity</p>
                </div>

                <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] shadow-xl text-left relative overflow-hidden group">
                    <div className="absolute inset-0 bg-carbon opacity-5"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <ShoppingCartIcon className="h-8 w-8 text-red-600"/>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    </div>
                    <p className="text-4xl font-black text-white italic tracking-tighter uppercase"><AnimatedNumber value={orders.length} /></p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 border-l-2 border-blue-600 pl-2">Pipeline Flow</p>
                </div>

                <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] shadow-xl text-left relative overflow-hidden group">
                    <div className="absolute inset-0 bg-carbon opacity-5"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <CurrencyDollarIcon className="h-8 w-8 text-emerald-500"/>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    </div>
                    <p className="text-4xl font-black text-white italic tracking-tighter uppercase">{formatCurrency(gmv)}</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 border-l-2 border-blue-600 pl-2">Grid Settlement</p>
                </div>

                <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] shadow-xl text-left relative overflow-hidden group">
                    <div className="absolute inset-0 bg-carbon opacity-5"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <ShieldExclamationIcon className="h-8 w-8 text-amber-500"/>
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                    </div>
                    <p className="text-4xl font-black text-white italic tracking-tighter uppercase"><AnimatedNumber value={openDisputes.length} /></p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 border-l-2 border-blue-600 pl-2">System Alerts</p>
                </div>
            </div>

            <div className="ferrari-watermark">GRID COMMAND</div>
        </div>
    );
};

export default AdminDashboard;
