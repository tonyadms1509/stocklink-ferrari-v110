import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useDataContext';
import { useCurrency } from '../../hooks/useCurrency';
import { useLocalization } from '../../hooks/useLocalization';
import { 
    ShieldCheckIcon, WalletIcon, SparklesIcon,
    CheckCircleIcon, XMarkIcon, 
    ArrowRightIcon, LockOpenIcon, ChartBarIcon, CameraIcon, LockClosedIcon, BanknotesIcon
} from '@heroicons/react/24/solid';
import { Activity } from 'lucide-react';
import AnimatedNumber from '../../components/AnimatedNumber';
import MilestoneVerificationModal from '../../components/MilestoneVerificationModal';

const MilestoneStrip: React.FC<{ milestone: any; onVerify: () => void; onRelease: () => void }> = ({ milestone, onVerify, onRelease }) => {
    const { formatCurrency } = useCurrency();
    const statusMap = {
        'Locked': { bg: 'bg-slate-800 text-slate-500', icon: LockClosedIcon, label: 'Locked' },
        'Awaiting Proof': { bg: 'bg-amber-500/20 text-amber-500', icon: CameraIcon, label: 'Proof Required' },
        'In Verification': { bg: 'bg-blue-600 text-white animate-pulse', icon: SparklesIcon, label: 'Neural Review' },
        'Released': { bg: 'bg-emerald-500 text-white', icon: CheckCircleIcon, label: 'Settled' }
    };
    const config = statusMap[milestone.status as keyof typeof statusMap] || statusMap.Locked;
    const Icon = config.icon;

    return (
        <div className="bg-slate-900/50 border border-white/5 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 group hover:bg-slate-900 transition-all duration-300 text-left">
            <div className="flex items-center gap-8 w-full md:w-auto">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${config.bg} shadow-2xl transition-transform group-hover:scale-110`}>
                    <Icon className="h-7 w-7"/>
                </div>
                <div className="text-left">
                    <h4 className="font-black text-white text-xl tracking-tight italic uppercase">{milestone.title}</h4>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.4em] mt-1">{milestone.verificationType} Handshake Protocol</p>
                </div>
            </div>
            
            <div className="flex items-center gap-12 w-full md:w-auto justify-between md:justify-end">
                <div className="text-right">
                    <p className="text-3xl font-black text-white italic tracking-tighter text-left">{formatCurrency(milestone.amount)}</p>
                    <p className={`text-[10px] font-black uppercase tracking-widest mt-1 text-left ${milestone.status === 'Released' ? 'text-emerald-400' : 'text-slate-500'}`}>{config.label}</p>
                </div>
                
                {milestone.status === 'Awaiting Proof' && (
                    <button 
                        onClick={onVerify}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-black py-4 px-10 rounded-2xl text-xs uppercase tracking-widest shadow-2xl shadow-blue-900/40 transition-all transform active:scale-95 border border-white/10"
                    >
                        Initialize Neural Proof
                    </button>
                )}

                {milestone.status === 'In Verification' && (
                    <button 
                        onClick={onRelease}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 px-10 rounded-2xl text-xs uppercase tracking-widest shadow-2xl shadow-blue-900/40 transition-all transform active:scale-95 border border-white/10"
                    >
                        Execute Settlement
                    </button>
                )}
            </div>
        </div>
    );
};

const VaultPage: React.FC = () => {
    const { vaultTransactions = [], projectMilestones = [], releaseMilestoneEscrow } = useData();
    const { formatCurrency } = useCurrency();
    const [verifyingMilestone, setVerifyingMilestone] = useState<any | null>(null);

    const metrics = useMemo(() => {
        const inEscrow = projectMilestones.filter(m => m.status !== 'Released').reduce((sum, m) => sum + m.amount, 0);
        const available = projectMilestones.filter(m => m.status === 'Released').reduce((sum, m) => sum + m.amount, 0);
        return { inEscrow, available };
    }, [projectMilestones]);

    return (
        <div className="bg-slate-950 min-h-screen -m-8 p-8 text-slate-200 font-sans selection:bg-red-600/30 overflow-x-hidden text-left">
            <div className="max-w-7xl mx-auto space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-end gap-10 border-b border-white/5 pb-12">
                    <div className="text-left">
                        <div className="flex items-center gap-3 mb-4">
                            <ShieldCheckIcon className="h-8 w-8 text-red-600" />
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-500">Fiscal Assurance Core v80.5 REDLINE</span>
                        </div>
                        <h1 className="text-8xl font-black tracking-tighter italic uppercase text-white leading-none">THE <span className="text-red-600">VAULT</span></h1>
                        <p className="text-slate-500 mt-4 font-mono text-sm tracking-widest uppercase text-left">Multi-Party Escrow & Neural Audit Engine</p>
                    </div>
                    <div className="flex gap-6">
                        <div className="bg-slate-900 border border-white/10 p-10 rounded-[3rem] shadow-2xl min-w-[300px] text-left">
                             <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Escrow Hold</p>
                             <p className="text-5xl font-black text-white italic tracking-tighter text-left">
                                 <AnimatedNumber value={metrics.inEscrow} format={formatCurrency} />
                             </p>
                        </div>
                        <div className="bg-slate-900 border border-emerald-500/20 p-10 rounded-[3rem] shadow-2xl min-w-[300px] text-left">
                             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-2">Liquid Balance</p>
                             <p className="text-5xl font-black text-white italic tracking-tighter text-left">
                                 <AnimatedNumber value={metrics.available} format={formatCurrency} />
                             </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8 space-y-10">
                        <div className="flex items-center justify-between px-6">
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">Active <span className="text-red-600">Settlements</span></h3>
                            <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase bg-white/5 px-4 py-2 rounded-full border border-white/5 shadow-xl">
                                <SparklesIcon className="h-4 w-4 text-red-600 animate-pulse" />
                                Neural Proof Verification Protocol Required
                            </div>
                        </div>

                        <div className="space-y-6">
                            {projectMilestones.map(m => (
                                <MilestoneStrip 
                                    key={m.id} 
                                    milestone={m} 
                                    onVerify={() => setVerifyingMilestone(m)} 
                                    onRelease={() => releaseMilestoneEscrow(m.id)}
                                />
                            ))}
                            {projectMilestones.length === 0 && (
                                <div className="bg-slate-900/50 border-4 border-dashed border-white/5 rounded-[4rem] p-32 text-center flex flex-col items-center justify-center opacity-20">
                                     <BanknotesIcon className="h-20 w-20 text-slate-700 mb-8" />
                                     <p className="font-black uppercase tracking-[0.6em] text-xs text-slate-500">Awaiting financial mandate synchronization.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-10 text-left">
                         <div className="bg-slate-900 rounded-[3.5rem] border border-white/10 p-10 shadow-2xl relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-10 opacity-5"><ChartBarIcon className="h-48 w-48 text-white" /></div>
                            <h3 className="text-xl font-black italic uppercase tracking-tighter uppercase mb-10 flex items-center gap-4 text-white text-left">
                                <Activity size={24} className="text-slate-500" />
                                Recent <span className="text-slate-500">Audit Events</span>
                            </h3>
                            <div className="space-y-6">
                                {vaultTransactions.slice(0, 3).map(tx => (
                                    <div key={tx.id} className={`p-6 bg-white/5 border border-white/5 rounded-[2rem] hover:bg-white/10 transition-all cursor-pointer group text-left`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <p className="text-sm font-black text-white group-hover:text-red-500 transition-colors uppercase tracking-tight italic">{tx.reference}</p>
                                            <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full ${tx.status === 'Released' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                                {tx.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-end border-t border-white/5 pt-4 mt-4">
                                            <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">REF-{tx.id.slice(-4).toUpperCase()}</p>
                                            <p className="font-black text-white text-xl tracking-tighter">{formatCurrency(tx.amount)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-10 py-5 text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 hover:text-white transition-colors border-t border-white/5">Export Settlement Dossier</button>
                        </div>

                        <div className="bg-red-600 rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden group border border-white/10">
                             <div className="absolute top-0 right-0 p-10 opacity-20 transform -rotate-12 group-hover:scale-110 transition-transform duration-1000">
                                 <WalletIcon className="h-64 w-64" />
                             </div>
                             <p className="text-[10px] font-black uppercase tracking-[0.5em] mb-4 opacity-70">Verified Liquidity</p>
                             <h4 className="text-3xl font-black italic leading-tight text-left">StockLink Neural Audit ensures 100% payout security.</h4>
                             <div className="mt-12 flex items-center gap-3">
                                 <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_emerald]"></div>
                                 <span className="text-[10px] font-black uppercase tracking-widest font-mono text-white">GRID SYNC: PROTECTED</span>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
            {verifyingMilestone && <MilestoneVerificationModal milestone={verifyingMilestone} onClose={() => setVerifyingMilestone(null)} />}
        </div>
    );
};

export default VaultPage;