
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
                <div className={`absolute w-12 h-12 rounded-full blur-xl opacity-20 animate-pulse ${isDemand ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                <div className={`w-2 h-2 rounded-full border border-white shadow-[0_0_10px_rgba(255,255,255,0.8)] ${isDemand ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full mb-3 bg-slate-900 border border-white/10 p-3 rounded-2xl text-[10px] text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100 whitespace-nowrap pointer-events-none shadow-2xl">
                     <p className="font-black uppercase italic tracking-tighter text-xs leading-none">{point.label}</p>
                     <p className="text-slate-400 font-bold uppercase mt-1">Intensity Vector: {(point.intensity * 100).toFixed(0)}%</p>
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

    // surfacing unassigned material needs
    const unassignedPayloads = useMemo(() => {
        return projectMaterials.filter(m => m.status === 'To Order').slice(0, 4);
    }, [projectMaterials]);

    const runTacticalScan = async () => {
        if (!process.env.API_KEY) return;
        setIsScanning(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Analyze market demand in South Africa based on ${supplyHeatmap.length} blips. Summarize the biggest opportunity for a building material supplier in 2 sentences. Use tactical military-grade language. Max 50 words. No markdown.`;
            const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
            setAiInsight(response.text || null);
            showToast("Market Intelligence Decrypted", "success");
        } catch (e) {
            showToast("Uplink Failure", "error");
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 -m-8 p-8 font-sans text-slate-200 selection:bg-blue-500/30 text-left">
            <div className="max-w-7xl mx-auto space-y-10">
                
                {/* Tactical Header */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-10">
                    <div className="text-left">
                        <div className="flex items-center gap-3 mb-2 text-blue-400">
                             <GlobeAmericasIcon className="h-6 w-6 animate-pulse" />
                             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">Grid Overseer v62.2</span>
                        </div>
                        <h1 className="text-6xl font-black tracking-tighter italic uppercase text-white leading-none">MISSION <span className="text-blue-500">CONTROL</span></h1>
                        <p className="text-slate-500 mt-4 font-mono text-sm tracking-widest uppercase text-left">National Operational Handshake Layer</p>
                    </div>

                    <button 
                        onClick={runTacticalScan}
                        disabled={isScanning}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-black py-4 px-10 rounded-2xl shadow-2xl shadow-blue-900/40 transition-all flex items-center gap-3 uppercase tracking-widest text-xs transform active:scale-95 disabled:opacity-50 border border-white/10"
                    >
                        {isScanning ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : <RadioIcon className="h-5 w-5" />}
                        Execute Scan
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 text-left">
                    {/* Visual Demand Map */}
                    <div className="lg:col-span-3 relative h-[650px] bg-slate-900 rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl group">
                         <div className="absolute inset-0 bg-[url('https://i.imgur.com/v2T3mJ5.png')] bg-cover bg-center grayscale opacity-20 mix-blend-overlay"></div>
                         <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90"></div>
                         
                         {/* Radar sweep effect */}
                         <div className="absolute inset-0 pointer-events-none overflow-hidden">
                             <div className="w-full h-full bg-gradient-to-tr from-blue-500/10 to-transparent absolute top-0 right-0 origin-bottom-left animate-[spin_6s_linear_infinite] filter blur-xl"></div>
                         </div>

                         {/* Demand Blips */}
                         {supplyHeatmap.map((point, i) => <MarketBlip key={i} point={point} />)}

                         <div className="absolute bottom-10 left-10 z-30 flex flex-col md:flex-row items-end gap-6 w-full pr-20">
                              <div className="bg-blue-600/10 backdrop-blur-xl border border-blue-500/20 p-8 rounded-[2.5rem] max-w-sm shadow-2xl text-left">
                                  <h4 className="text-[10px] font-black uppercase text-blue-400 mb-4 tracking-[0.2em] flex items-center gap-2 leading-none">
                                      <SparklesIcon className="h-4 w-4"/> Intelligence Brief
                                  </h4>
                                  <p className="text-base text-blue-100/90 italic leading-loose font-serif text-left">
                                      "{aiInsight || 'Awaiting tactical data decryption. Initialize pulse scan to locate unassigned regional procurement leads...'}"
                                  </p>
                              </div>
                              
                              {/* Arbitrage Intercept Widget */}
                              <div className="bg-slate-950 border border-white/5 p-8 rounded-[3rem] shadow-2xl flex-grow animate-fade-in text-left">
                                   <div className="flex items-center gap-3 mb-6">
                                       <MagnifyingGlassIcon className="h-5 w-5 text-red-600 animate-pulse"/>
                                       <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em]">Arbitrage Intercept</span>
                                   </div>
                                   <div className="space-y-3">
                                       {unassignedPayloads.map((payload, i) => (
                                           <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5 group/row hover:bg-white/10 transition-all cursor-pointer">
                                               <div>
                                                   <p className="text-xs font-black text-white uppercase italic tracking-tighter leading-none">{payload.productName}</p>
                                                   <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-2">Pending: {payload.quantity} Units</p>
                                               </div>
                                               <button className="p-2 bg-red-600 text-white rounded-lg opacity-0 group-hover/row:opacity-100 transition-opacity">
                                                   <BoltIcon className="h-3 w-3"/>
                                               </button>
                                           </div>
                                       ))}
                                   </div>
                                   <p className="text-[8px] text-slate-700 font-black uppercase mt-6 text-center tracking-[0.5em]">Scanning Grid for unquoted B.O.M nodes...</p>
                              </div>
                         </div>
                    </div>

                    {/* Sidebar: Vitals */}
                    <div className="space-y-8 text-left">
                         <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                              <div className="absolute top-0 right-0 p-4 opacity-5"><TruckIcon className="h-24 w-24"/></div>
                              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-8 flex items-center gap-2">
                                  <TruckIcon className="h-4 w-4 text-blue-500" /> Fleet Vitals
                              </h3>
                              <div className="space-y-8">
                                   <div className="flex justify-between items-center border-b border-white/5 pb-6">
                                       <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Active Units</span>
                                       <span className="text-3xl font-black text-white italic tracking-tighter">{metrics.activeDrivers}</span>
                                   </div>
                                   <div className="flex justify-between items-center border-b border-white/5 pb-6">
                                       <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Grid Load</span>
                                       <span className="text-3xl font-black text-emerald-400 italic tracking-tighter">{metrics.idleVehicles} / {metrics.activeDrivers}</span>
                                   </div>
                                   <div className="flex justify-between items-center">
                                       <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Net Pipeline</span>
                                       <span className="text-2xl font-black text-blue-400 italic tracking-tighter">{formatCurrency(metrics.pendingValue)}</span>
                                   </div>
                              </div>
                         </div>

                         <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                              <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12"><FireIcon className="h-32 w-32 text-amber-600" /></div>
                              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-6 flex items-center gap-2">
                                  <UserGroupIcon className="h-4 w-4 text-amber-500" /> Collective Demand
                              </h3>
                               <div className="text-center py-6">
                                   <p className="text-6xl font-black text-white italic tracking-tighter">{metrics.openPools}</p>
                                   <p className="text-[10px] font-black text-amber-500 uppercase mt-2 tracking-widest">Active Syndicate Pools</p>
                               </div>
                               <button className="w-full mt-4 bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all border border-white/5">Optimize Supply Offer</button>
                         </div>

                         <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white shadow-2xl relative group overflow-hidden border border-white/10 text-left">
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.15)_0%,_transparent_100%)]"></div>
                              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 mb-2">Merchant Reputation</p>
                              <h4 className="text-5xl font-black tracking-tighter italic">98.4%</h4>
                              <p className="text-xs font-bold mt-6 opacity-90 flex items-center gap-2 uppercase tracking-widest text-left">
                                  <ShieldCheckIcon className="h-4 w-4 text-white"/> Elite Seller Tier
                              </p>
                         </div>
                    </div>
                </div>
            </div>
            {/* Background Detail */}
            <div className="fixed bottom-10 left-10 pointer-events-none opacity-[0.02] -z-10 rotate-90 text-left">
                <span className="text-[140px] font-black tracking-tighter text-white uppercase italic leading-none">SUPPLIER_CORE</span>
            </div>
        </div>
    );
};

export default SupplierMissionControl;
