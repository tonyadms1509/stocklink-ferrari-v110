
import React, { useState } from 'react';
import { useData } from '../../hooks/useDataContext.tsx';
import { useLocalization } from '../../hooks/useLocalization.tsx';
import { useCurrency } from '../../hooks/useCurrency.tsx';
import { 
    MagnifyingGlassIcon, GlobeAltIcon, SparklesIcon, 
    TagIcon, ArrowTrendingUpIcon, RadioIcon,
    ArrowPathIcon, ChartBarIcon, FireIcon,
    NewspaperIcon
} from '@heroicons/react/24/solid';
import { GoogleGenAI, Type } from '@google/genai';
import { useToast } from '../../hooks/useToast.tsx';
import EmptyState from '../../components/EmptyState.tsx';

interface PricePoint {
    retailer: string;
    price: number;
    province: string;
}

const MarketPulsePage: React.FC = () => {
    const { formatCurrency } = useCurrency();
    const { showToast } = useToast();
    // Fix: Remove marketPulseResponse which doesn't exist on DataContextState
    const { generateMarketPulse, isMarketPulseLoading, marketPulseError } = useData();

    const [productQuery, setProductQuery] = useState('');
    const [priceData, setPriceData] = useState<PricePoint[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [arbitrageInsight, setArbitrageInsight] = useState<string | null>(null);
    const [groundingLinks, setGroundingLinks] = useState<{title: string, uri: string}[]>([]);

    const handleMarketScan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productQuery.trim() || !process.env.API_KEY) {
            showToast("Neural Handshake Failed: API Key Missing", "error");
            return;
        }

        setIsScanning(true);
        setPriceData([]);
        setArbitrageInsight(null);
        setGroundingLinks([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Perform a live national material price audit for "${productQuery}" in South Africa for February 2025.
                Identify actual current prices from major retailers like Builders, Cashbuild, and Chamberlains.
                Compare Gauteng vs Western Cape.
                
                Return a JSON object with:
                1. "benchmarks": Array of { "retailer": string, "price": number, "province": string }
                2. "arbitrage": A technical insight on current supply chain pressure for this item.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: prompt,
                config: { 
                    tools: [{ googleSearch: {} }],
                    responseMimeType: 'application/json'
                }
            });

            const result = JSON.parse(response.text || '{}');
            setPriceData(result.benchmarks || []);
            setArbitrageInsight(result.arbitrage);
            
            // Extract grounding sources
            const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
            if (chunks) {
                const links = chunks
                    .map((c: any) => c.web)
                    .filter(Boolean)
                    .map((w: any) => ({ title: w.title, uri: w.uri }));
                setGroundingLinks(links);
            }

            showToast("Market Intelligence Synchronized", "success");
        } catch (err) {
            console.error(err);
            showToast("Neural Bridge Error", "error");
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div className="space-y-12 font-sans pb-20 selection:bg-blue-500/30 text-left">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 pb-12">
                <div className="text-left">
                    <div className="flex items-center gap-3 mb-4 text-blue-600">
                         <GlobeAltIcon className="h-8 w-8 animate-pulse" />
                         <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-50">Grid Pulse Core v80.5</span>
                    </div>
                    <h1 className="text-7xl font-black tracking-tighter italic uppercase text-gray-900 leading-none">MARKET <span className="text-blue-600">SCAN</span></h1>
                    <p className="text-slate-500 mt-4 font-medium text-lg italic max-w-2xl leading-relaxed">"High-fidelity material price grounding across the national merchant network."</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
                <div className="lg:col-span-4">
                    <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl text-white relative overflow-hidden border border-white/5">
                        <div className="absolute inset-0 bg-carbon opacity-10"></div>
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-10 flex items-center gap-4 text-blue-400">
                            <MagnifyingGlassIcon className="h-7 w-7 text-blue-400" />
                            Benchmarking
                        </h3>
                        <form onSubmit={handleMarketScan} className="space-y-8 relative z-10 text-left">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-3">Technical Identifier</label>
                                <input 
                                    type="text" 
                                    value={productQuery}
                                    onChange={e => setProductQuery(e.target.value)}
                                    placeholder="e.g. PPC Cement 50kg 42.5N"
                                    className="w-full p-5 bg-white/5 border-2 border-white/10 rounded-2xl text-white font-black italic text-lg placeholder-slate-600 focus:border-blue-500 outline-none transition-all shadow-inner"
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={isScanning || !productQuery.trim()}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-3xl shadow-2xl shadow-blue-900/40 transition-all flex items-center justify-center gap-4 uppercase tracking-[0.3em] text-xs transform active:scale-95 border border-white/10"
                            >
                                {isScanning ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : <RadioIcon className="h-5 w-5 text-blue-200" />}
                                Initialize Scan
                            </button>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-8 space-y-8">
                    {isScanning ? (
                        <div className="bg-white p-24 rounded-[4rem] border-2 border-dashed border-slate-200 shadow-inner text-center">
                             <div className="relative w-32 h-32 mx-auto mb-10">
                                <div className="absolute inset-0 border-8 border-blue-100 rounded-full"></div>
                                <div className="absolute inset-0 border-8 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                                <SparklesIcon className="absolute inset-0 m-auto h-12 w-12 text-blue-500 animate-pulse"/>
                             </div>
                             <h3 className="text-3xl font-black uppercase tracking-tighter italic text-gray-800">Neural Grounding...</h3>
                             <p className="text-slate-400 mt-4 font-mono text-xs tracking-widest uppercase text-center">Querying Retail Databases & Capturing Regional Spreads</p>
                        </div>
                    ) : priceData.length > 0 ? (
                        <div className="animate-fade-in-up space-y-8">
                             {arbitrageInsight && (
                                 <div className="bg-blue-600/10 border-l-8 border-blue-600 p-8 rounded-r-[3rem] shadow-2xl relative overflow-hidden group">
                                     <div className="absolute top-0 right-0 p-6 opacity-5 transform group-hover:rotate-12 transition-transform duration-700"><FireIcon className="h-32 w-32"/></div>
                                     <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-2">Strategic Insight</p>
                                     <p className="text-2xl font-black italic text-slate-900 leading-tight text-left">"{arbitrageInsight}"</p>
                                 </div>
                             )}

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 {priceData.map((point, i) => (
                                     <div key={i} className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 group hover:shadow-2xl transition-all duration-500 hover:border-blue-500/30">
                                         <div className="flex justify-between items-start mb-8 text-left">
                                             <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-blue-600 transition-colors shadow-inner">
                                                 <TagIcon className="h-8 w-8 text-gray-400 group-hover:text-white" />
                                             </div>
                                             <span className="text-[10px] font-black bg-slate-900 text-white px-4 py-1.5 rounded-full uppercase tracking-widest italic">{point.province} Feed</span>
                                         </div>
                                         <h4 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic leading-none text-left">{point.retailer}</h4>
                                         <div className="mt-6 flex items-baseline gap-2">
                                             <p className="text-5xl font-black text-blue-600 tracking-tighter italic text-left">{formatCurrency(point.price)}</p>
                                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Benchmark</span>
                                         </div>
                                     </div>
                                 ))}
                             </div>

                             {groundingLinks.length > 0 && (
                                 <div className="bg-slate-900 p-8 rounded-[3rem] border border-white/10 text-left">
                                     <h4 className="text-xs font-black text-blue-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-3 text-left">
                                         <NewspaperIcon className="h-5 w-5" /> Verification Sources
                                     </h4>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                         {groundingLinks.map((link, i) => (
                                             <a key={i} href={link.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group/link text-left">
                                                 <GlobeAltIcon className="h-6 w-6 text-slate-600 group-hover/link:text-blue-500" />
                                                 <span className="text-xs font-bold text-slate-300 truncate text-left">{link.title}</span>
                                             </a>
                                         ))}
                                     </div>
                                 </div>
                             )}
                        </div>
                    ) : (
                        <EmptyState icon={RadioIcon} title="GRID READY" message="Transmit a material identifier to begin high-fidelity national price benchmarking." />
                    )}
                </div>
            </div>
            
            <div className="ferrari-watermark"></div>
        </div>
    );
};

export default MarketPulsePage;
