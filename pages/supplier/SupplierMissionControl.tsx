
import React, { useState, useMemo, useEffect } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { useData } from '../../hooks/useDataContext';
import { useAuth } from '../../hooks/useAuth';
import { 
    GlobeAmericasIcon, SparklesIcon, MapPinIcon, 
    TruckIcon, BeakerIcon, BoltIcon, 
    ArrowPathIcon, RadioIcon, FireIcon,
    CurrencyDollarIcon, EyeIcon, ChartBarIcon,
    UserGroupIcon, MapIcon, ShieldCheckIcon,
    ArrowUpIcon, ArrowDownIcon, MagnifyingGlassIcon
} from '@heroicons/react/24/solid';
import { GoogleGenAI } from '@google/genai';
import { useToast } from '../../hooks/useToast';
import { useCurrency } from '../../hooks/useCurrency';
import AnimatedNumber from '../../components/AnimatedNumber';

const MarketBlip: React.FC<{ point: any }> = ({ point }) => {
    const isDemand = point.type === 'Demand';
    return (
        <div 
            className="absolute z-20 group"
            style={{ top: `${(point.lat + 35) * 5}%`, left: `${(point.lon - 18) * 6}%` }}
        >
            <div className="relative flex items-center justify-center">
                <div className={`absolute w-16 h-16 rounded-full blur-2xl opacity-20 animate-pulse ${isDemand ? 'bg-red-600' : 'bg-blue-500'}`}></div>
                <div className={`w-3 h-3 rounded-full border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.8)] ${isDemand ? 'bg-red-600' : 'bg-blue-500'} transform group-hover:scale-150 transition-transform duration-500`}></div>
                
                {/* Tooltip HUD */}
                <div className="absolute bottom-full mb-4 bg-slate-900/90 backdrop-blur-xl border border-white/10 p-5 rounded-[2rem] text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100 whitespace-nowrap pointer-events-none shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                     <div className="flex items-center gap-3 mb-2 border-b border-white/5 pb-2">
                        <div className={`w-2 h-2 rounded-full ${isDemand ? 'bg-red-600' : 'bg-blue-500'}`}></div>
                        <p className="font-black uppercase italic tracking-tighter text-sm leading-none">{point.label}</p>
                     </div>
                     <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mt-1">Intensity Vector: {(point.intensity * 100).toFixed(0)}%</p>
                </div>
            </div>
        </div>
    );
};

const SupplierMissionControl: React.FC = () => {
    const { t } = useLocalization();
    const { supplyHeatmap, vehicles, drivers, orders, syndicates, projectMaterials } = useData();
    const { formatCurrency } = useCurrency();
    const { showToast } = useToast();
    const [isScanning, setIsScanning] = useState(false);
    const [aiInsight, setAiInsight] = useState<string | null>(null);

    const metrics = useMemo(() => {
        return {
            activeDrivers: drivers.length,
            idleVehicles: vehicles.filter(v => v.status === 'Available').length,
            pendingValue: orders.filter(o => o.status === 'New').reduce((sum, o) => sum + o.total, 0),
            openPools: syndicates.filter(s => s.status === 'Open').length
        };
    }, [drivers, vehicles, orders, syndicates]);

    const unassignedPayloads = useMemo(() => {
        return projectMaterials.filter(m => m.status === 'To Order').slice(0, 4);
    }, [projectMaterials]);

    const runTacticalScan = async () => {
        if (!process.env.API_KEY) return;
        setIsScanning(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Analyze market demand in South Africa based on ${supplyHeatmap.length} nodes. Identify procurement arbitrage. Max 40 words. No markdown.`;
            const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
            setAiInsight(response.text || null);
            showToast("Market Intelligence Decrypted", "success");
        } catch (e) {
            showToast("Neural Bridge Failure", "error");
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div className="pb-24 space-y-12 animate-fade-in-up-scale px-4 md:px-8 text-left">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-12">
                <div className="text-left">
                    <div className="flex items-center gap-3 mb-4">
                         <GlobeAmericasIcon className="h-8 w-8 text-blue-500 animate-pulse" />
                         <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 italic">NATIONAL_MARKET_HUD v110.0</span>
                    </div>
                    <h1 className="text-8xl md:text-9xl font-black tracking-tighter italic uppercase text-white leading-[0.8] drop-shadow-2xl">MISSION <span className="text-blue-600">CONTROL</span></h1>
                    <p className="text-slate-500 mt-8 font-mono text-sm tracking-widest uppercase text-left opacity-70 italic max-w-3xl">"Real-time provincial demand matrices synchronized with verified supply nodes."</p>
                </div>

                <button 
                    onClick={runTacticalScan}
                    disabled={isScanning}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-black py-8 px-20 rounded-[3rem] shadow-2xl shadow-blue-900/40 transition-all flex items-center gap-6 uppercase tracking-[0.3em] text-sm transform active:scale-95 disabled:opacity-50 border border-white/10 group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                    {isScanning ? <ArrowPathIcon className="h-6 w-6 animate-spin" /> : <RadioIcon className="h-6 w-6 text-white animate-pulse" />}
                    Execute Scan
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 text-left">
                {/* Demand Visualizer */}
                <div className="lg:col-span-3 relative h-[750px] bg-slate-900 rounded-[5rem] border-4 border-slate-900 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden group">
                     <div className="absolute inset-0 bg-[url('https://i.imgur.com/v2T3mJ5.png')] bg-cover bg-center grayscale brightness-[0.2] contrast-150 transition-all duration-1000 group-hover:brightness-[0.3]"></div>
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-95"></div>
                     
                     <div className="absolute inset-0 pointer-events-none overflow-hidden">
                         <div className="w-[150%] h-[150%] bg-gradient-to-tr from-blue-500/15 via-transparent to-transparent absolute top-[-25%] right-[-25%] origin-bottom-left animate-[spin_10s_linear_infinite] filter blur-[60px]"></div>
                     </div>

                     {supplyHeatmap.map((point, i) => <MarketBlip key={i} point={point} />)}

                     <div className="absolute bottom-16 left-16 right-16 z-30 flex flex-col md:flex-row items-end gap-10">
                          <div className="bg-blue-600/10 backdrop-blur-3xl border border-blue-500/30 p-12 rounded-[4rem] max-w-md shadow-2xl text-left relative overflow-hidden group/brief">
                              <div className="absolute top-0 right-0 p-10 opacity-5 transform group-hover/brief:scale-125 transition-transform duration-2000"><SparklesIcon className="h-64 w-64 text-blue-500"/></div>
                              <h4 className="text-[12px] font-black uppercase text-blue-500 mb-6 tracking-[0.6em] flex items-center gap-4 leading-none font-mono">
                                  <div className="w-1.5 h-6 bg-blue-600 rounded-full animate-pulse"></div>
                                  Intelligence Dossier
                              </h4>
                              <p className="text-2xl text-blue-100 leading-relaxed italic font-serif text-left">
                                  "{aiInsight || 'Initializing neural market handshake... Execute national pulse scan to decrypt regional demand patterns and material price volatility.'}"
                              </p>
                          </div>
                          
                          <div className="bg-slate-950/80 backdrop-blur-2xl border border-white/5 p-12 rounded-[4rem] shadow-2xl flex-grow text-left">
                               <div className="flex items-center justify-between mb-8">
                                   <div className="flex items-center gap-4">
                                       <div className="p-3 bg-red-600 rounded-2xl shadow-[0_0_20px_red] animate-pulse">
                                           <MagnifyingGlassIcon className="h-6 w-6 text-white"/>
                                       </div>
                                       <span className="text-[11px] font-black uppercase text-slate-400 tracking-[0.4em]">Arbitrage Intercept</span>
                                   </div>
                                   <span className="text-[10px] font-black text-slate-600 font-mono">BUFFER_READY</span>
                               </div>
                               <div className="space-y-4">
                                   {unassignedPayloads.map((payload, i) => (
                                       <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 group/row hover:bg-white/10 transition-all cursor-pointer">
                                           <div>
                                               <p className="font-black text-white uppercase italic tracking-tighter text-lg leading-none">{payload.productName}</p>
                                               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">Required: {payload.quantity} Units</p>
                                           </div>
                                           <div className="flex items-center gap-4">
                                                <div className="h-1 w-12 bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-600 w-3/4"></div>
                                                </div>
                                                <button className="p-3 bg-red-600 text-white rounded-xl transform active:scale-90 transition-all shadow-xl group-hover/row:scale-110">
                                                    <BoltIcon className="h-4 w-4"/>
                                                </button>
                                           </div>
                                       </div>
                                   ))}
                               </div>
                               <p className="text-[8px] text-slate-700 font-black uppercase mt-10 text-center tracking-[0.8em] animate-pulse">SCANNING_GLOBAL_B.O.M_NODES</p>
                          </div>
                     </div>
                </div>

                {/* Tactical Vitals Sidebar */}
                <div className="space-y-12 text-left">
                     <div className="bg-slate-900 border border-white/10 rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden group breathe-red">
                          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform"><TruckIcon className="h-48 w-48 text-white"/></div>
                          <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 mb-12 flex items-center gap-4 border-b border-white/5 pb-4">
                              <TruckIcon className="h-6 w-6 text-blue-500" /> Fleet Matrix
                          </h3>
                          <div className="space-y-10">
                               <div className="text-left">
                                   <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Chassis Availability</p>
                                   <div className="flex items-baseline gap-4">
                                        <p className="text-6xl font-black text-white italic tracking-tighter"><AnimatedNumber value={metrics.idleVehicles} /></p>
                                        <span className="text-xl font-black text-slate-700 uppercase italic">/ {metrics.activeDrivers}</span>
                                   </div>
                               </div>
                               <div className="text-left border-t border-white/5 pt-8">
                                   <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Pipeline Settlement</p>
                                   <p className="text-4xl font-black text-blue-500 italic tracking-tighter leading-none">{formatCurrency(metrics.pendingValue)}</p>
                                   <p className="text-[8px] font-bold text-slate-700 uppercase mt-4 tracking-[0.4em]">Authorization Pending</p>
                               </div>
                          </div>
                     </div>

                     <div className="bg-slate-900 border border-white/10 rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><FireIcon className="h-48 w-48 text-amber-600" /></div>
                          <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 mb-8 flex items-center gap-4 border-b border-white/5 pb-4">
                              <UserGroupIcon className="h-6 w-6 text-amber-500" /> Grid Pools
                          </h3>
                           <div className="text-center py-10">
                               <p className="text-8xl font-black text-white italic tracking-tighter drop-shadow-2xl">{metrics.openPools}</p>
                               <p className="text-[11px] font-black text-amber-500 uppercase mt-4 tracking-[0.5em] leading-none">ACTIVE SYNDICATES</p>
                           </div>
                           <button className="w-full mt-6 bg-white/5 hover:bg-white/10 text-white font-black py-6 rounded-[2rem] text-[10px] uppercase tracking-[0.4em] transition-all border border-white/10 shadow-2xl">Initialize Bulk Offer</button>
                     </div>

                     <div className="bg-blue-600 rounded-[3.5rem] p-12 text-white shadow-[0_0_80px_rgba(37,99,235,0.4)] relative group overflow-hidden border-4 border-slate-950 text-left">
                          <div className="absolute inset-0 bg-carbon opacity-10"></div>
                          <p className="text-[11px] font-black uppercase tracking-[0.6em] opacity-60 mb-4">Node Reputation</p>
                          <h4 className="text-7xl font-black tracking-tighter italic leading-none drop-shadow-2xl">98.4%</h4>
                          <div className="mt-10 flex items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/10 w-fit">
                              <ShieldCheckIcon className="h-6 w-6 text-white animate-pulse"/>
                              <span className="text-[10px] font-black uppercase tracking-widest italic">Elite Merchant Tier</span>
                          </div>
                     </div>
                </div>
            </div>
            
            <div className="ferrari-watermark"></div>
        </div>
    );
};

export default SupplierMissionControl;
