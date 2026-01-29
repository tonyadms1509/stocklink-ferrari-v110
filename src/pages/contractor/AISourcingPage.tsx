
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useData } from '../../hooks/useDataContext';
import { useLocalization } from '../../hooks/useLocalization';
import { useCurrency } from '../../hooks/useCurrency';
import { ProjectMaterialStatus, ContractorTab, Product } from '../../types';
import { 
    ArrowLeftIcon, SparklesIcon, PlusIcon, TrashIcon, 
    ShoppingCartIcon, CheckBadgeIcon, TruckIcon,
    ArrowTrendingUpIcon, ShieldCheckIcon, BeakerIcon, GlobeAmericasIcon, ClockIcon, ArrowPathIcon
} from '@heroicons/react/24/solid';
import { GoogleGenAI, Type } from '@google/genai';
import { useToast } from '../../hooks/useToast';
import EmptyState from '../../components/EmptyState';

const RadarScanner = ({ scanStage }: { scanStage: string }) => (
    <div className="flex flex-col items-center justify-center py-24 animate-fade-in-scale">
        <div className="relative w-80 h-80 mb-12">
            <div className="absolute inset-0 rounded-full border-4 border-red-500/10 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-red-500/5 to-transparent"></div>
            <div className="absolute inset-10 rounded-full border-2 border-red-500/20"></div>
            <div className="absolute inset-20 rounded-full border border-red-500/30"></div>
            <div className="absolute inset-0 rounded-full overflow-hidden">
                <div className="w-1/2 h-1/2 bg-gradient-to-br from-transparent via-red-500/30 to-red-500/80 absolute top-0 right-0 origin-bottom-left animate-[spin_3s_linear_infinite] rounded-tr-full filter blur-xl"></div>
            </div>
            <div className="absolute inset-0 m-auto w-4 h-4 bg-white rounded-full shadow-[0_0_30px_#ef4444] z-10 animate-pulse"></div>
            {/* Supply Blips */}
            <div className="absolute top-20 left-20 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
            <div className="absolute bottom-24 right-32 w-2 h-2 bg-emerald-500 rounded-full animate-ping delay-500"></div>
            <div className="absolute top-1/2 right-12 w-2 h-2 bg-red-500 rounded-full animate-ping delay-1000"></div>
        </div>
        <div className="text-center space-y-4">
            <h3 className="text-3xl font-black text-gray-100 uppercase tracking-tighter italic leading-none">GRID <span className="text-red-600">INTERCEPT</span></h3>
            <p className="text-xs font-black text-red-500 uppercase tracking-[0.5em] animate-pulse">{scanStage}</p>
        </div>
    </div>
);

const AISourcingPage: React.FC<{ onNavigateToCart: () => void; onBack?: () => void; }> = ({ onNavigateToCart, onBack }) => {
    const { projects = [], projectMaterials = [], products = [], getSupplierById, addToCart } = useData();
    const { formatCurrency } = useCurrency();
    const { showToast } = useToast();

    const [materialList, setMaterialList] = useState<any[]>([]);
    const [strategy, setStrategy] = useState('cheapest');
    const [isGlobal, setIsGlobal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [scanStage, setScanStage] = useState('Initializing Handshake...');
    const [results, setResults] = useState<any[] | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const handleFindDeals = async () => {
        if (materialList.length === 0) {
            showToast("Mission objective list is empty", "warning");
            return;
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;
        const signal = controller.signal;

        setIsLoading(true);
        setResults(null);
        
        const stages = [
            'Mapping Regional Nodes...',
            isGlobal ? 'Intercepting Transcontinental Cargo Streams...' : 'Calculating BEE Advantage...',
            'Intercepting Bulk Tier Data...',
            'Finalizing Global Redline Dossier...'
        ];

        let stageIdx = 0;
        const interval = setInterval(() => {
            setScanStage(stages[stageIdx % stages.length]);
            stageIdx++;
        }, 1200);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Analyze procurement for: ${JSON.stringify(materialList)}. Strategy: ${strategy}. Global Context: ${isGlobal}. South Africa vs International Nodes. Return JSON array of sources with items, subtotals, and estimated transit friction. Ensure South African provinces and suppliers are prioritised.`;
            
            // Fix: correctly wrap AbortSignal in requestOptions to follow @google/genai patterns
            const response = await ai.models.generateContent({ 
                model: 'gemini-3-flash-preview', 
                contents: prompt, 
                config: { responseMimeType: 'application/json' },
                requestOptions: { signal } 
            });
            
            if (signal.aborted) return;
            
            clearInterval(interval);
            setResults(JSON.parse(response.text || '[]'));
            showToast("National Grid Decoded", "success");
        } catch (e: any) {
            if (signal.aborted || e.name === 'AbortError' || e.message?.toLowerCase().includes('aborted')) {
                console.debug("Scan sequence aborted.");
                return;
            }
            showToast("Uplink Failure", "error");
        } finally {
            if (!signal.aborted) {
                setIsLoading(false);
                clearInterval(interval);
            }
        }
    };

    return (
        <div className="pb-12 h-full flex flex-col font-sans selection:bg-red-600/30 text-left">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-12 mb-12 text-left">
                <div className="text-left">
                    <div className="flex items-center gap-3 mb-4 text-left">
                        <SparklesIcon className="h-6 w-6 text-red-600 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-500">Procurement Hub v80.5</span>
                    </div>
                    <h2 className="text-7xl font-black text-white tracking-tighter uppercase italic leading-none text-left">{isGlobal ? 'GLOBAL' : 'NEURAL'} <span className="text-blue-600 text-glow-blue">SOURCING</span></h2>
                    <p className="text-slate-500 mt-4 font-mono text-sm tracking-widest uppercase text-left">Cross-Border Arbitrage & Neural Node Intercept Engine</p>
                </div>
                {onBack && <button onClick={onBack} className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl text-slate-500 hover:text-white transition-all transform active:scale-95 border border-white/10 text-left"><ArrowLeftIcon className="h-6 w-6"/></button>}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 flex-grow overflow-hidden min-h-[600px] text-left">
                <div className="lg:col-span-4 space-y-8 h-full flex flex-col text-left">
                    <div className="bg-slate-950 p-10 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col h-full text-left">
                         <div className="absolute inset-0 bg-carbon opacity-10"></div>
                         
                         <div className="flex justify-between items-center mb-10 relative z-10 text-left">
                            <h3 className="text-xs font-black text-slate-600 uppercase tracking-[0.5em] flex items-center gap-4 text-left">
                                <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                                Objective Matrix
                            </h3>
                            <button 
                                onClick={() => setIsGlobal(!isGlobal)}
                                className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border-2 ${isGlobal ? 'bg-blue-600 border-blue-400 text-white animate-pulse' : 'bg-white/5 border-white/10 text-slate-500'}`}
                            >
                                Transcontinental Bridge: {isGlobal ? 'ON' : 'OFF'}
                            </button>
                         </div>
                         
                         <div className="space-y-8 relative z-10 flex-grow overflow-y-auto custom-scrollbar pr-4 text-left">
                            <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 shadow-inner text-left">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block text-left">Sync Site Dossier</label>
                                <select 
                                    onChange={e => {
                                        const mats = projectMaterials.filter(m => m.projectId === e.target.value);
                                        setMaterialList(mats.map(m => ({ name: m.productName, qty: m.quantity, originalId: m.id })));
                                    }} 
                                    className="w-full bg-transparent border-none focus:ring-0 text-white font-black italic text-xl uppercase appearance-none cursor-pointer hover:text-blue-400 transition-colors text-left"
                                >
                                    <option value="">-- Manual Matrix --</option>
                                    {projects.map(p => <option key={p.id} value={p.id} className="bg-slate-900">{p.projectName}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 gap-3 text-left">
                                {['Value (Cheapest)', 'Tempo (Fastest)', 'Assurance (Verified Only)'].map(s => (
                                    <button 
                                        key={s}
                                        onClick={() => setStrategy(s.toLowerCase())}
                                        className={`p-5 rounded-2xl border-2 font-black uppercase text-[10px] tracking-widest transition-all text-left flex justify-between items-center ${strategy.includes(s.split(' ')[0].toLowerCase()) ? 'bg-red-600 border-red-600 text-white shadow-xl' : 'bg-slate-900 border-white/5 text-slate-500 hover:border-white/20'}`}
                                    >
                                        {s}
                                        {strategy.includes(s.split(' ')[0].toLowerCase()) && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
                                    </button>
                                ))}
                            </div>
                         </div>

                         <button 
                            onClick={handleFindDeals} 
                            disabled={isLoading || materialList.length === 0}
                            className="mt-10 w-full bg-red-600 text-white font-black py-8 rounded-[2.5rem] shadow-2xl shadow-red-900/40 hover:bg-red-700 transition-all transform active:scale-95 disabled:opacity-30 text-left"
                        >
                            <SparklesIcon className="h-6 w-6 text-yellow-200 animate-pulse inline-block mr-2" />
                            Initiate Intelligence Sweep
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-8 flex flex-col h-full text-left">
                    {isLoading ? (
                        <div className="bg-slate-900 rounded-[4rem] border border-white/5 flex-grow flex items-center justify-center relative overflow-hidden shadow-inner text-left">
                             <div className="absolute inset-0 bg-carbon opacity-10"></div>
                             <RadarScanner scanStage={scanStage} />
                        </div>
                    ) : !results ? (
                        <div className="bg-slate-900/50 border-4 border-dashed border-white/5 rounded-[4rem] flex-grow flex flex-col items-center justify-center text-center opacity-20 group hover:opacity-40 transition-opacity text-left">
                             <GlobeAmericasIcon className="h-24 w-24 text-slate-700 mb-10 group-hover:scale-110 transition-transform duration-1000" />
                             <p className="font-black uppercase tracking-[0.5em] text-xs text-slate-500 max-w-sm leading-loose text-left">Awaiting transcontinental mission parameters. Provision a material dossier to begin planetary arbitrage scan.</p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-fade-in-up flex-grow overflow-y-auto custom-scrollbar pr-2 pb-12 text-left">
                            {results.map((res, i) => (
                                <div key={i} className="bg-slate-900 border border-white/5 rounded-[4rem] p-12 flex flex-col md:flex-row justify-between items-center gap-12 hover:border-blue-600/40 transition-all group relative overflow-hidden shadow-2xl text-left">
                                     <div className="absolute inset-0 bg-carbon opacity-5"></div>
                                     <div className="flex items-center gap-10 text-left relative z-10 text-left text-left">
                                        <div className="w-24 h-24 rounded-[2.5rem] bg-slate-800 border-2 border-white/5 flex items-center justify-center font-black text-slate-600 text-3xl italic group-hover:border-blue-600 group-hover:text-blue-400 transition-all shadow-inner text-left">
                                            {res.origin || 'Node'}
                                        </div>
                                        <div className="text-left">
                                            <div className="flex items-center gap-3 mb-3 text-left">
                                                 <span className="px-4 py-1 bg-blue-600/10 text-blue-500 border border-blue-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest">Region: {res.region || 'Global'}</span>
                                                 <span className="px-4 py-1 bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest">Verified Merchant</span>
                                            </div>
                                            <h4 className="text-4xl font-black text-white italic uppercase tracking-tighter group-hover:text-blue-400 transition-colors leading-none text-left">{res.supplierName || 'Merchant Node'}</h4>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-3 flex items-center gap-2 text-left">
                                                <ClockIcon className="h-4 w-4 text-blue-500"/> Lead: {res.estimatedDeliveryDays || '2'} Cycles
                                            </p>
                                        </div>
                                     </div>
                                     <div className="text-right flex flex-col md:items-end gap-10 w-full md:w-auto relative z-10 text-left">
                                        <div className="text-right text-left text-left">
                                             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 text-left">Grid Settlement (Est.)</p>
                                             <p className="text-5xl font-black text-white italic tracking-tighter drop-shadow-lg text-left">{formatCurrency(res.subtotal || 0)}</p>
                                             <p className={`text-[9px] font-black uppercase mt-2 italic text-left ${res.totalSavings > 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                                                 {res.totalSavings > 0 ? `Saved ${formatCurrency(res.totalSavings)} vs Regional Index` : 'Premium Global Spec'}
                                             </p>
                                        </div>
                                        <button onClick={() => { showToast("Global Handshake Transmitted", "success"); onNavigateToCart(); }} className="bg-white text-slate-950 font-black py-5 px-12 rounded-[2rem] text-xs uppercase tracking-widest shadow-2xl hover:bg-blue-600 hover:text-white transition-all transform active:scale-95 border-4 border-slate-900 text-left">Execute Authorization</button>
                                     </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="ferrari-watermark">PLANETARY_GRID</div>
        </div>
    );
};

export default AISourcingPage;
