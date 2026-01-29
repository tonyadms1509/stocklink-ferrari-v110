
import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useDataContext';
import { useLocalization } from '../../hooks/useLocalization';
import { useCurrency } from '../../hooks/useCurrency';
/* Fix: access user from useAuth hook */
import { useAuth } from '../../hooks/useAuth';
import { Tender, TenderStatus, TenderBidItem } from '../../types';
import { 
    BuildingLibraryIcon, XMarkIcon, SparklesIcon, 
    ClockIcon, ChartBarIcon, TrophyIcon, 
    ArrowTrendingUpIcon, RocketLaunchIcon,
    ShieldCheckIcon, BoltIcon, DocumentTextIcon
} from '@heroicons/react/24/solid';
import EmptyState from '../../components/EmptyState';
import TenderBidAssistantModal from '../../components/TenderBidAssistantModal';
import TenderProposalForge from '../../components/TenderProposalForge';

const SubmitBidModal: React.FC<{ tender: Tender; onClose: () => void }> = ({ tender, onClose }) => {
    const { t } = useLocalization();
    const { submitTenderBid } = useData();
    const { formatCurrency } = useCurrency();
    const [items, setItems] = useState<TenderBidItem[]>(tender.materials.map(m => ({ materialId: m.materialId, pricePerUnit: undefined })));
    const [notes, setNotes] = useState('');
    const [isAssistantOpen, setIsAssistantOpen] = useState(false);

    const handlePriceChange = (materialId: string, price: string) => {
        const numericPrice = parseFloat(price);
        setItems(prev => prev.map(item => item.materialId === materialId ? { ...item, pricePerUnit: isNaN(numericPrice) ? undefined : numericPrice } : item));
    };

    const handleApplyAIBid = (generatedItems: TenderBidItem[], generatedNotes: string) => {
        setItems(prev => prev.map(item => {
            const match = generatedItems.find(g => g.materialId === item.materialId);
            return match ? { ...item, pricePerUnit: match.pricePerUnit } : item;
        }));
        setNotes(generatedNotes);
    };

    const totalBidAmount = useMemo(() => {
        return items.reduce((total, item) => {
            const material = tender.materials.find(m => m.materialId === item.materialId);
            if (material && item.pricePerUnit !== undefined) {
                return total + (item.pricePerUnit * material.quantity);
            }
            return total;
        }, 0);
    }, [items, tender.materials]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await submitTenderBid({
            tenderId: tender.id,
            items,
            totalBidAmount,
            notes,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-[130] p-4 animate-fade-in backdrop-blur-md">
            <div className="bg-white rounded-[3rem] shadow-2xl p-0 max-w-4xl w-full h-auto max-h-[90vh] flex flex-col overflow-hidden border border-white/20">
                <div className="bg-slate-900 p-10 flex justify-between items-center text-white flex-shrink-0">
                    <div>
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-4">
                            <div className="p-3 bg-blue-600 rounded-2xl shadow-[0_0_20px_#2563eb]">
                                <BuildingLibraryIcon className="h-8 w-8 text-white"/>
                            </div>
                            Tender <span className="text-blue-500">Proposal</span>
                        </h2>
                        <p className="text-slate-500 font-mono text-[10px] font-black uppercase tracking-[0.4em] mt-4">Protocol Ref: {tender.tenderNumber}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-3 bg-white/5 rounded-2xl border border-white/10"><XMarkIcon className="h-8 w-8"/></button>
                </div>
                
                <div className="p-10 bg-blue-600/5 border-b border-blue-500/10 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="text-left">
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] mb-2">Total Bid Settlement</p>
                        <p className="text-6xl font-black text-slate-900 italic tracking-tighter leading-none">{formatCurrency(totalBidAmount)}</p>
                    </div>
                    <button 
                        type="button" 
                        onClick={() => setIsAssistantOpen(true)}
                        className="flex items-center gap-4 bg-slate-900 text-white hover:bg-black px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-2xl transform active:scale-95 border border-white/5"
                    >
                        <SparklesIcon className="h-5 w-5 text-blue-400 animate-pulse"/>
                        Initialize TenderBot AI
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-grow min-h-0 bg-slate-50/50 text-left">
                    <div className="flex-grow overflow-y-auto p-10 space-y-4 custom-scrollbar">
                        {tender.materials.map(material => {
                            const bidItem = items.find(i => i.materialId === material.materialId);
                            return (
                                <div key={material.materialId} className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 p-6 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:border-blue-500/30 transition-colors group">
                                    <div className="md:col-span-2 text-left">
                                        <p className="font-black text-slate-900 text-xl italic uppercase tracking-tight">{material.productName}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-lg uppercase tracking-widest border border-slate-200">Load: {material.quantity} Units</span>
                                            <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-lg uppercase tracking-widest border border-blue-100 opacity-0 group-hover:opacity-100 transition-opacity italic">Grid Verified</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <label className="block text-[10px] font-black mb-3 text-slate-400 uppercase tracking-widest">Settlement Rate / unit</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder="0.00"
                                                value={bidItem?.pricePerUnit ?? ''}
                                                onChange={e => handlePriceChange(material.materialId, e.target.value)}
                                                className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl w-full focus:border-blue-600 outline-none font-black text-xl text-right transition-all text-slate-900"
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div className="mt-10 text-left">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-4">Strategic Submission Notes</label>
                            <textarea 
                                value={notes} 
                                onChange={e => setNotes(e.target.value)} 
                                rows={4} 
                                className="w-full p-8 bg-white border-2 border-slate-100 rounded-[2.5rem] text-sm font-medium focus:border-blue-600 outline-none transition-all h-40 resize-none italic leading-loose font-serif shadow-inner"
                                placeholder="Add delivery telemetry, stock availability protocols, or volume-tier discount notes..."
                            ></textarea>
                        </div>
                    </div>
                    
                    <div className="p-10 border-t bg-white flex justify-end gap-4 flex-shrink-0">
                        <button type="button" onClick={onClose} className="px-8 py-4 bg-slate-50 text-slate-400 font-black uppercase tracking-widest text-[10px] rounded-2xl border border-slate-100 hover:text-slate-800 transition-colors">Abort</button>
                        <button type="submit" className="bg-blue-600 text-white font-black py-4 px-12 rounded-[2rem] text-xs uppercase tracking-[0.4em] shadow-2xl shadow-blue-900/40 transition-all transform active:scale-95 border border-white/10">Execute Submission</button>
                    </div>
                </form>
            </div>
            
            {isAssistantOpen && (
                <TenderBidAssistantModal 
                    tender={tender} 
                    onClose={() => setIsAssistantOpen(false)} 
                    onApplyBid={handleApplyAIBid}
                />
            )}
        </div>
    );
};

const TenderBoardPage: React.FC = () => {
    const { tenders } = useData();
    // Fix: access user from useAuth hook
    const { user } = useAuth();
    const { t } = useLocalization();
    const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
    const [forgingTender, setForgingTender] = useState<Tender | null>(null);

    const openTenders = useMemo(() => {
        return (tenders || [])
            .filter(t => t.status === TenderStatus.Open)
            .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    }, [tenders]);

    const getWinProbability = (tender: Tender) => {
        const score = 85 + (tender.projectName.length % 15);
        if (score > 95) return { score, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', status: 'Dominant' };
        if (score > 90) return { score, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', status: 'High' };
        return { score, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', status: 'Moderate' };
    }
    
    return (
        <div className="pb-20 space-y-12 font-sans text-left">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-gray-100 pb-12">
                <div className="text-left">
                    <div className="flex items-center gap-3 mb-4 text-blue-600">
                         <RocketLaunchIcon className="h-8 w-8 animate-pulse" />
                         <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500">Grid Procurement Core v75.2</span>
                    </div>
                    <h1 className="text-7xl font-black tracking-tighter italic uppercase text-gray-900 leading-none">TENDER <span className="text-blue-600">BOARD</span></h1>
                    <p className="text-slate-500 mt-6 font-medium text-lg italic max-w-3xl leading-relaxed">"Autonomous bid intelligence scanning the national contractor grid for high-value fulfillment mandates."</p>
                </div>
            </div>

            {openTenders.length === 0 ? (
                <EmptyState
                    icon={TrophyIcon}
                    title="GRID CLEAR"
                    message="Neural Core scanning for open project mandates. Standby for operational handshake."
                />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {openTenders.map((tender, idx) => {
                        const win = getWinProbability(tender);
                        const daysLeft = Math.ceil((new Date(tender.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                        return (
                            <div key={tender.id} className="bg-white rounded-[3.5rem] shadow-sm border border-gray-100 hover:shadow-2xl hover:border-blue-500/30 transition-all duration-700 relative overflow-hidden group" style={{ animationDelay: `${idx * 0.1}s` }}>
                                <div className={`absolute top-0 left-0 w-2 h-full bg-blue-600 group-hover:w-3 transition-all`}></div>
                                
                                <div className="p-10 pl-14 text-left">
                                    <div className="flex justify-between items-start mb-8 text-left">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-[10px] font-black font-mono text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">#{tender.tenderNumber}</span>
                                                <div className={`px-4 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${win.color} shadow-sm`}>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>
                                                    {win.status} Win: {win.score}%
                                                </div>
                                            </div>
                                            <h3 className="text-3xl font-black text-gray-900 italic tracking-tighter uppercase leading-tight group-hover:text-blue-600 transition-colors text-left">{tender.projectName}</h3>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Grid Lockout</p>
                                            <div className={`px-4 py-2 rounded-2xl font-black text-lg italic tracking-tighter border ${daysLeft < 3 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-slate-900 text-white border-slate-800'} flex items-center gap-2`}>
                                                <ClockIcon className="h-5 w-5"/> {daysLeft}D
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50/80 rounded-[2.5rem] p-8 mb-10 border border-slate-100 shadow-inner group-hover:bg-blue-50/50 transition-colors">
                                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 text-left">Payload Scope</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {tender.materials.slice(0, 3).map((m, i) => (
                                                <span key={i} className="text-[10px] font-black bg-white border border-slate-200 text-slate-600 px-4 py-1.5 rounded-xl shadow-sm uppercase tracking-widest">
                                                    {m.productName} <span className="text-blue-600 font-black">x{m.quantity}</span>
                                                </span>
                                            ))}
                                            {tender.materials.length > 3 && (
                                                <span className="text-[10px] font-black text-slate-400 px-4 py-1.5 uppercase tracking-widest italic">+ {tender.materials.length - 3} more</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-slate-50 pt-8 mt-2">
                                        <button 
                                            onClick={() => setForgingTender(tender)}
                                            className="flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-700 transition-all uppercase tracking-widest"
                                        >
                                            <SparklesIcon className="h-4 w-4" /> Forge Proposal
                                        </button>
                                        <button 
                                            onClick={() => setSelectedTender(tender)} 
                                            className="bg-blue-600 text-white font-black py-4 px-12 rounded-2xl shadow-xl shadow-blue-900/40 hover:bg-blue-500 transition-all transform active:scale-95 flex items-center gap-4 uppercase tracking-[0.2em] text-[10px] border border-white/10"
                                        >
                                            <BoltIcon className="h-5 w-5 text-yellow-300"/>
                                            Deploy Submission
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {selectedTender && <SubmitBidModal tender={selectedTender} onClose={() => setSelectedTender(null)} />}
            {forgingTender && <TenderProposalForge tender={forgingTender} onClose={() => setForgingTender(null)} />}
            
            <div className="fixed bottom-10 left-10 pointer-events-none opacity-5 -z-10 rotate-90 select-none text-left">
                <span className="text-[140px] font-black tracking-tighter text-slate-300 uppercase italic">TENDER GRID LIVE</span>
            </div>
        </div>
    );
};

export default TenderBoardPage;
