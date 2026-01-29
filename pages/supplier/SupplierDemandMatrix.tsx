import React, { useState, useMemo, useEffect } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { useData } from '../../hooks/useDataContext';
import { useAuth } from '../../hooks/useAuth';
import { 
    GlobeAmericasIcon, SparklesIcon, MapIcon, 
    ArrowPathIcon, ChartBarIcon, BoltIcon,
    CurrencyDollarIcon, RadioIcon, FireIcon,
    ArrowUpIcon, ArrowDownIcon, MagnifyingGlassIcon,
    PresentationChartLineIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/solid';
import { GoogleGenAI } from '@google/genai';
import { useToast } from '../../hooks/useToast';
import AnimatedNumber from '../../components/AnimatedNumber';

const RegionPulse: React.FC<{ city: string; demand: number; status: string; trend: 'up' | 'down' }> = ({ city, demand, status, trend }) => (
    <div className="flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-all group">
        <div className="flex items-center gap-5 text-left">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-white/5 flex items-center justify-center font-black text-slate-400 text-sm group-hover:border-blue-500/30 transition-colors shadow-inner">
                {city.slice(0, 3).toUpperCase()}
            </div>
            <div className="text-left">
                <p className="font-black text-white text-lg tracking-tight italic uppercase">{city}</p>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{status}</p>
            </div>
        </div>
        <div className="text-right">
             <div className="flex items-center justify-end gap-2">
                <p className="font-black text-white text-3xl tracking-tighter italic">{demand}%</p>
                {trend === 'up' ? <ArrowUpIcon className="h-4 w-4 text-emerald-400" /> : <ArrowDownIcon className="h-4 w-4 text-red-500" />}
             </div>
             <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Grid Saturation</p>
        </div>
    </div>
);

const SupplierDemandMatrix: React.FC = () => {
    const { t } = useLocalization();
    const { supplyHeatmap } = useData();
    const { showToast } = useToast();
    const [isScanning, setIsScanning] = useState(false);
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [marketLinks, setMarketLinks] = useState<{title: string, uri: string}[]>([]);

    const handleMarketSync = async () => {
        if (!process.env.API_KEY) return;
        setIsScanning(true);
        setAiInsight(null);
        setMarketLinks([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Analyze current construction market trends in South Africa for 2025. 
                Focus on material shortages, interest rate impacts on residential builds, and major infrastructure tenders in Gauteng and Western Cape.
                Identify "Price Volatility" for Steel and Cement.
                Provide a strategic 3-sentence brief and include source URLs.
            `;
            
            // Fixed: Upgraded model to gemini-3-pro-image-preview to support googleSearch tool
            const response = await ai.models.generateContent({ 
                model: 'gemini-3-pro-image-preview', 
                contents: prompt,
                config: { tools: [{ googleSearch: {} }] }
            });

            setAiInsight(response.text || '');
            
            // Extract grounding links
            const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
            if (chunks) {
                const links = chunks
                    .map((c: any) => c.web)
                    .filter(Boolean)
                    .map((w: any) => ({ title: w.title, uri: w.uri }));
                setMarketLinks(links);
            }

            showToast("Market Intelligence Decrypted", "success");
        } catch (e) {
            console.error("Market Sync Error", e);
            showToast("Neural Handshake Interrupted", "error");
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div className="pb-20 max-w-7xl mx-auto space-y-12 font-sans text-slate-200">
             <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white shadow-2xl border border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-carbon opacity-10"></div>
                <div className="absolute top-0 right-0 p-12 opacity-5">
                    <GlobeAmericasIcon className="h-96 w-96 text-blue-600 transform rotate-12" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="max-w-2xl text-left">
                         <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-600 rounded-2xl animate-pulse shadow-[0_0_20px_#2563eb]">
                                <RadioIcon className="h-8 w-8 text-white" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-400">Demand Forecaster v75.2 REDLINE</span>
                        </div>
                        <h1 className="text-8xl font-black tracking-tighter italic uppercase text-white leading-none">MARKET <span className="text-blue-600">PULSE</span></h1>
                        <p className="text-slate-500 mt-6 font-mono text-sm tracking-widest uppercase leading-loose text-left">Neural Provincial Mapping & Predictive Demand Logic. Synchronized with live national retail datasets.</p>
                    </div>

                    <button 
                        onClick={handleMarketSync}
                        disabled={isScanning}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-black py-6 px-16 rounded-[2.5rem] shadow-2xl shadow-blue-900/40 transition-all flex items-center gap-4 uppercase tracking-[0.3em] text-xs transform active:scale-95 disabled:opacity-50 border border-white/10"
                    >
                        {isScanning ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : <SparklesIcon className="h-6 w-6 text-blue-200" />}
                        Execute Scan
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 relative h-[650px] bg-slate-900 rounded-[4rem] border border-white/10 overflow-hidden shadow-2xl group">
                    <div className="absolute inset-0 bg-[url('https://i.imgur.com/v2T3mJ5.png')] bg-cover bg-center grayscale opacity-30 mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90"></div>
                    
                    {supplyHeatmap.map((point, i) => (
                        <div 
                            key={i} 
                            className="absolute z-20 group"
                            style={{ top: `${(point.lat + 35) * 5}%`, left: `${(point.lon - 18) * 6}%` }}
                        >
                            <div className="relative flex items-center justify-center">
                                <div className={`absolute w-20 h-20 rounded-full blur-2xl opacity-20 animate-pulse bg-red-600`}></div>
                                <div className={`w-3 h-3 rounded-full border-2 border-white shadow-[0_0_20px_rgba(239,68,68,0.8)] bg-red-600`}></div>
                            </div>
                        </div>
                    ))}

                    <div className="absolute bottom-10 left-10 right-10 z-30">
                        <div className="bg-blue-600/10 backdrop-blur-3xl border border-blue-500/30 p-10 rounded-[3rem] shadow-2xl text-left">
                            <h4 className="text-[10px] font-black uppercase text-blue-400 mb-6 tracking-[0.5em] flex items-center gap-3 leading-none">
                                <SparklesIcon className="h-5 w-5 animate-pulse"/> Neural Intelligence Dossier
                            </h4>
                            {isScanning ? (
                                <div className="space-y-4">
                                    <div className="h-2 w-full bg-blue-500/20 rounded-full animate-pulse"></div>
                                    <div className="h-2 w-3/4 bg-blue-500/20 rounded-full animate-pulse delay-75"></div>
                                    <div className="h-2 w-1/2 bg-blue-500/20 rounded-full animate-pulse delay-150"></div>
                                </div>
                            ) : (
                                <>
                                    <p className="text-xl italic text-blue-100/90 leading-relaxed font-serif text-left">
                                        "{aiInsight || 'Initiate national pulse scan to decrypt regional demand patterns, material price volatility, and unassigned procurement leads...'}"
                                    </p>
                                    
                                    {marketLinks.length > 0 && (
                                        <div className="mt-8 pt-6 border-t border-blue-500/20 text-left">
                                            <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-3">Verification Sources</p>
                                            <div className="flex flex-wrap gap-4">
                                                {marketLinks.map((link, i) => (
                                                    <a key={i} href={link.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-bold text-blue-300 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                                                        <GlobeAmericasIcon className="h-3 w-3" />
                                                        {link.title.slice(0, 30)}...
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-10 text-left">
                    <div className="bg-slate-900 rounded-[3.5rem] border border-white/10 p-10 shadow-2xl text-left">
                        <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-10 flex items-center gap-4 text-blue-400 leading-none">
                            <PresentationChartLineIcon className="h-8 w-8 text-blue-600" />
                            Region <span className="text-blue-600">Pulse</span>
                        </h3>
                        <div className="space-y-4">
                            <RegionPulse city="Sandton" demand={94} status="Critical Shortage" trend="up" />
                            <RegionPulse city="Cape Town" demand={88} status="Frictionless Flow" trend="down" />
                            <RegionPulse city="Centurion" demand={72} status="High Incline" trend="up" />
                            <RegionPulse city="Umhlanga" demand={81} status="Fulfillment Gap" trend="up" />
                        </div>
                        <button className="w-full mt-12 py-5 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-white transition-colors border-t border-white/5">Download Growth Matrices</button>
                    </div>

                    <div className="bg-blue-600 rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden group border border-white/10 text-left">
                         <div className="absolute inset-0 bg-carbon opacity-10"></div>
                         <div className="absolute top-0 right-0 p-8 opacity-20 transform -rotate-12 group-hover:scale-110 transition-transform duration-1000">
                             <FireIcon className="h-48 w-48" />
                         </div>
                         <p className="text-[10px] font-black uppercase tracking-[0.5em] mb-4 opacity-70">Grid Strategic Shield</p>
                         <h4 className="text-4xl font-black italic leading-tight uppercase tracking-tighter">Supply Gap Detected.</h4>
                         <p className="text-sm text-blue-100 mt-4 font-medium leading-relaxed italic">"Structural steel deficits identify a 22% procurement arbitrage window in the Pretoria-East corridor."</p>
                         <div className="mt-12 flex items-center gap-3">
                             <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_15px_#10b981]"></div>
                             <span className="text-[10px] font-black uppercase tracking-widest font-mono">NODE STATE: DOMINANT</span>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupplierDemandMatrix;