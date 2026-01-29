import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useDataContext';
import { useCurrency } from '../../hooks/useCurrency';
import { useLocalization } from '../../hooks/useLocalization';
import { useToast } from '../../hooks/useToast';
import { SyndicateOpportunity } from '../../types';
import { 
    UserGroupIcon, MapPinIcon, FireIcon, 
    PlusIcon, SparklesIcon, ShoppingCartIcon,
    BoltIcon, ShieldCheckIcon, BanknotesIcon,
    ChartBarIcon, ArrowPathIcon
} from '@heroicons/react/24/solid';
import EmptyState from '../../components/EmptyState';
import AnimatedNumber from '../../components/AnimatedNumber';

const SyndicateCard: React.FC<{ syndicate: SyndicateOpportunity; onJoin: () => void }> = ({ syndicate, onJoin }) => {
    const { formatCurrency } = useCurrency();
    const progress = (syndicate.currentQuantity / syndicate.targetQuantity) * 100;
    const daysLeft = Math.ceil((syndicate.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    return (
        <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white/5 overflow-hidden group hover:border-blue-500/40 transition-all duration-700 flex flex-col h-full text-left">
            <div className="bg-slate-900/80 p-8 text-white relative">
                 <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <UserGroupIcon className="h-32 w-32 transform -rotate-12" />
                </div>
                <div className="relative z-10 flex justify-between items-start gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                             <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse shadow-[0_0_8px_#2563eb]"></div>
                             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Demand Aggregator</span>
                        </div>
                        <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none">{syndicate.productName}</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Node Region: {syndicate.region}</p>
                    </div>
                    <div className="text-right">
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Target Rate</p>
                         <p className="text-4xl font-black text-emerald-400 italic tracking-tighter">{formatCurrency(syndicate.discountPrice)}</p>
                         <p className="text-[10px] text-slate-600 font-black line-through uppercase mt-1">Market: {formatCurrency(syndicate.basePrice)}</p>
                    </div>
                </div>
            </div>

            <div className="p-8 flex flex-col flex-grow">
                <div className="flex items-center gap-4 mb-10">
                    <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <FireIcon className="h-4 w-4 text-orange-500 animate-pulse"/> {daysLeft} Days to Settlement
                    </div>
                    <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-2xl border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                        <SparklesIcon className="h-4 w-4"/> save 22%
                    </div>
                </div>

                <div className="mb-10 flex-grow">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-4">
                        <span>Current Commitments</span>
                        <span>{syndicate.currentQuantity} / {syndicate.targetQuantity} UNITS</span>
                    </div>
                    <div className="h-6 bg-black/40 rounded-2xl overflow-hidden border border-white/5 shadow-inner p-1">
                        <div 
                            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl transition-all duration-2000 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                    </div>
                    <p className="text-center mt-3 text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">Threshold: {Math.round(progress)}% Established</p>
                </div>

                <button 
                    onClick={onJoin}
                    className="w-full bg-slate-900 text-white font-black py-6 rounded-[2rem] uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-4 hover:bg-black transition-all transform active:scale-95 shadow-2xl border border-white/5 group"
                >
                    <PlusIcon className="h-5 w-5 text-blue-500 group-hover:scale-125 transition-transform"/>
                    Commit Material Demand
                </button>
            </div>
        </div>
    );
};

const SyndicateHub: React.FC = () => {
    const { syndicates, joinSyndicate } = useData();
    const { formatCurrency } = useCurrency();
    const { showToast } = useToast();
    const [isScanning, setIsScanning] = useState(false);

    const handleSyndicateOptimization = () => {
        setIsScanning(true);
        setTimeout(() => {
            setIsScanning(false);
            showToast("Neural Demand Clusters Established", "success");
        }, 2000);
    };

    return (
        <div className="pb-20 max-w-7xl mx-auto space-y-12 font-sans text-left">
            <div className="bg-slate-950 rounded-[3rem] p-16 text-white shadow-2xl relative overflow-hidden border border-white/5">
                <div className="absolute inset-0 bg-carbon opacity-20"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="max-w-2xl text-left">
                        <div className="flex items-center gap-3 mb-6">
                            <SparklesIcon className="h-8 w-8 text-blue-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-400">Volume Power Grid Core v62.2</span>
                        </div>
                        <h1 className="text-7xl font-black tracking-tighter italic uppercase mb-8 leading-none">Syndicate <span className="text-blue-600">Hub</span></h1>
                        <p className="text-slate-400 text-xl leading-relaxed font-medium italic text-left">
                            Aggregate your material requirements with the national grid to unlock tier-1 pricing protocols typically reserved for corporate industrial groups.
                        </p>
                        <div className="mt-12 flex gap-4">
                            <button onClick={handleSyndicateOptimization} disabled={isScanning} className="bg-blue-600 hover:bg-blue-500 text-white font-black py-4 px-10 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95 border border-white/10 flex items-center gap-3">
                                {isScanning ? <ArrowPathIcon className="h-4 w-4 animate-spin"/> : <ChartBarIcon className="h-4 w-4"/>}
                                Optimize Clusters
                            </button>
                        </div>
                    </div>
                    <div className="bg-slate-900 p-12 rounded-[3.5rem] border border-blue-500/20 text-center flex-shrink-0 min-w-[320px] shadow-2xl relative group">
                        <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-5 transition-opacity"></div>
                        <p className="text-[10px] font-black uppercase text-blue-500 mb-4 tracking-[0.4em]">Pool Liquidity</p>
                        <p className="text-7xl font-black text-white italic tracking-tighter drop-shadow-xl">R1.2M</p>
                        <div className="mt-6 flex items-center justify-center gap-2">
                             <ShieldCheckIcon className="h-4 w-4 text-emerald-500" />
                             <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest italic">Encrypted Settlement</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 text-left">
                 {syndicates.map((s, idx) => (
                     <div key={s.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                        <SyndicateCard syndicate={s} onJoin={() => { joinSyndicate(s.id, 50); showToast("Demand Committed to Grid", "success"); }} />
                     </div>
                 ))}
                 {syndicates.length === 0 && (
                     <div className="col-span-full">
                         <EmptyState icon={UserGroupIcon} title="GRID SCANNING" message="Neural Core is analyzing provincial demand matrices to generate group-buy opportunities. Status: IDLE" />
                     </div>
                 )}
            </div>
            
            <div className="fixed bottom-10 left-10 pointer-events-none opacity-5 -z-10 rotate-90 select-none text-left">
                <span className="text-[160px] font-black tracking-tighter text-white uppercase italic leading-none">VOLUME GRID</span>
            </div>
        </div>
    );
};

export default SyndicateHub;