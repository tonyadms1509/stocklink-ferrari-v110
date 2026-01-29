import React, { useState, useMemo, useEffect } from 'react';
import { useLocalization } from '../../hooks/useLocalization.tsx';
import { useData } from '../../hooks/useDataContext.tsx';
import { useAuth } from '../../hooks/useAuth.tsx';
import { 
    Globe, Sparkles, MapPin, 
    Zap, Cloud,
    ShieldCheck, BarChart, Beaker,
    RefreshCcw, Rocket, Radio, Flame,
    Truck, DollarSign, Map,
    Scale, ArrowUp, ArrowDown, Cpu, Server,
    Newspaper, Link, Radar, Activity
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { useToast } from '../../hooks/useToast.tsx';
import AnimatedNumber from '../../components/AnimatedNumber';

const IntelligenceNode: React.FC<{ label: string; value: string | number; icon: React.ElementType; color: string }> = ({ label, value, icon: Icon, color }) => (
    <div className="bg-slate-900 border border-white/5 p-10 rounded-[3rem] group hover:border-blue-500/50 transition-all duration-700 shadow-2xl relative overflow-hidden text-left h-full">
        <div className="absolute inset-0 bg-carbon opacity-5"></div>
        <div className="flex flex-col h-full justify-between relative z-10 text-left">
            <div className="flex justify-between items-start mb-8">
                <div className={`p-4 rounded-2xl ${color} bg-opacity-20 transition-transform group-hover:scale-110 shadow-lg border border-white/5`}>
                    <Icon className={`h-8 w-8 ${color.replace('bg-', 'text-')}`} />
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_emerald]"></div>
            </div>
            <div>
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">TELEMETRY_UNIT_v4.2</p>
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">{label}</h4>
                <p className="text-4xl font-black text-white tracking-tighter italic text-left leading-none uppercase">
                    {typeof value === 'number' ? <AnimatedNumber value={value} /> : value}
                </p>
            </div>
        </div>
    </div>
);

const NationalBlip: React.FC<{ point: any }> = ({ point }) => {
    const isDemand = point.type === 'Demand';
    return (
        <div 
            className="absolute z-30 group/blip cursor-pointer"
            style={{ top: `${(point.lat + 35) * 5.5}%`, left: `${(point.lon - 18) * 6.5}%` }}
        >
            <div className="relative flex items-center justify-center">
                <div className={`absolute w-32 h-32 rounded-full blur-[40px] opacity-10 animate-pulse ${isDemand ? 'bg-red-600' : 'bg-cyan-500'}`}></div>
                <div className={`w-4 h-4 rounded-full border-2 border-white shadow-[0_0_20px_rgba(255,255,255,0.8)] ${isDemand ? 'bg-red-600' : 'bg-cyan-500'} transform group-hover/blip:scale-150 transition-transform duration-500`}></div>
                
                {/* Tooltip HUD */}
                <div className="absolute top-full mt-6 bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-6 rounded-[2rem] whitespace-nowrap opacity-0 group-hover/blip:opacity-100 transition-all duration-500 transform translate-y-4 group-hover/blip:translate-y-0 pointer-events-none shadow-[0_0_50px_rgba(0,0,0,0.5)] z-50">
                    <div className="flex items-center gap-3 mb-3 border-b border-white/5 pb-3 text-left">
                         <div className={`w-2 h-2 rounded-full animate-pulse ${isDemand ? 'bg-red-600' : 'bg-cyan-500'}`}></div>
                         <span className="text-[10px] font-black text-white uppercase tracking-widest">{point.label}</span>
                    </div>
                    <div className="space-y-2 text-left">
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Regional Signal: NOMINAL</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Vector Efficiency: 98.4%</p>
                        <p className="text-xs font-black text-blue-400 italic mt-2 uppercase tracking-tighter">Handshake Protocol Active</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CommandBridge: React.FC = () => {
    const { t } = useLocalization();
    const { projects, orders, suppliers, supplyHeatmap, metroPerformance, systemHealth } = useData();
    const { showToast } = useToast();
    
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [regionReport, setRegionReport] = useState<string | null>(null);
    const [groundingLinks, setGroundingLinks] = useState<{title: string, uri: string}[]>([]);

    const metrics = useMemo(() => {
        return {
            activeSites: projects.length,
            enRoute: orders.filter(o => o.status === 'Out for Delivery').length,
            networkNodes: suppliers.length,
            gridLoad: "Stage 4" 
        };
    }, [projects, orders, suppliers]);

    const runTacticalScan = async () => {
        if (!process.env.API_KEY) return;
        setIsAnalyzing(true);
        setRegionReport(null);
        setGroundingLinks([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Perform a high-fidelity national infrastructure audit for South Africa construction.
                Focus on: Gauteng vs Western Cape procurement deltas, Load Shedding Stage 4 impact on structural timelines, and PV inverter scarcity.
                Tone: High-fidelity, Strategic, Elite. Max 4 sentences. Include source verification.
            `;
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: prompt,
                config: { tools: [{ googleSearch: {} }] }
            });
            
            setRegionReport(response.text);
            
            const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
            if (chunks) {
                const links = chunks
                    .map((c: any) => c.web)
                    .filter(Boolean)
                    .map((w: any) => ({ title: w.title, uri: w.uri }));
                setGroundingLinks(links);
            }

            showToast("National Grid Decoded", "success");
        } catch (e) {
            showToast("Neural Handshake Failure", "error");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 -m-8 p-12 font-sans text-slate-200 selection:bg-red-600/30 overflow-x-hidden">
            <div className="max-w-7xl mx-auto space-y-12">
                
                {/* Tactical Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-12 text-left">
                    <div className="text-left">
                        <div className="flex items-center gap-3 mb-4 text-blue-500">
                            <Radar className="h-10 w-10 animate-pulse shadow-[0_0_30px_#2563eb]" />
                            <span className="text-[14px] font-black uppercase tracking-[0.6em] text-blue-500 italic">SECTOR ZETA: NATIONAL BRIDGE</span>
                        </div>
                        <h1 className="text-8xl md:text-[10rem] font-black tracking-tighter italic uppercase text-white leading-[0.8] drop-shadow-2xl">COMMAND <span className="text-blue-500">BRIDGE</span></h1>
                        <p className="text-slate-500 mt-8 font-mono text-sm tracking-widest uppercase text-left opacity-60">National Operational Nerve Center established • Synchronized 2025</p>
                    </div>

                    <button 
                        onClick={runTacticalScan}
                        disabled={isAnalyzing}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-black py-8 px-20 rounded-[3rem] shadow-2xl shadow-blue-900/40 transition-all flex items-center gap-6 uppercase tracking-[0.4em] text-sm transform active:scale-95 disabled:opacity-50 border border-white/20 group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                        {isAnalyzing ? <RefreshCcw className="h-6 w-6 animate-spin" /> : <Radio className="h-6 w-6 text-white animate-pulse" />}
                        Execute National Scan
                    </button>
                </div>

                {/* Intelligence Layer */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <IntelligenceNode label="Active Deployments" value={metrics.activeSites} icon={MapPin} color="bg-blue-600" />
                    <IntelligenceNode label="National Dispatch" value={metrics.enRoute} icon={Truck} color="bg-red-600" />
                    <IntelligenceNode label="Supply Nodes" value={metrics.networkNodes} icon={Beaker} color="bg-purple-600" />
                    <IntelligenceNode label="Grid State" value={metrics.gridLoad} icon={Zap} color="bg-amber-600" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8 space-y-12">
                        {/* Immersive National Bridge Map */}
                        <div className="relative h-[750px] bg-slate-900 rounded-[5rem] border-4 border-slate-900 shadow-[0_0_100px_rgba(0,0,0,0.8)] group overflow-hidden text-left">
                            <div className="absolute inset-0 bg-[url('https://i.imgur.com/v2T3mJ5.png')] bg-cover bg-center grayscale brightness-[0.2] contrast-150 transition-all duration-1000 group-hover:brightness-[0.3]"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90"></div>
                            
                            {/* Scanning Ray - Masterpiece Animation */}
                            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                <div className="w-[200%] h-[200%] bg-gradient-to-tr from-blue-500/20 via-transparent to-transparent absolute top-[-50%] right-[-50%] origin-bottom-left animate-[spin_10s_linear_infinite] filter blur-[60px]"></div>
                            </div>
                            
                            {/* Digital Overlay Textures */}
                            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

                            {/* National Pulse Blips */}
                            {supplyHeatmap.map((point, i) => <NationalBlip key={i} point={point} />)}

                            <div className="absolute bottom-16 left-16 right-16 z-30">
                                <div className="bg-blue-600/10 backdrop-blur-3xl border border-blue-500/30 p-16 rounded-[4rem] shadow-2xl text-left relative overflow-hidden group/brief">
                                     <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover/brief:opacity-5 transition-opacity"></div>
                                     <div className="absolute top-0 right-0 p-12 opacity-5 transform group-hover/brief:scale-125 transition-transform duration-2000"><Sparkles size={400} className="text-blue-500"/></div>
                                    
                                    <div className="flex items-center gap-6 mb-10">
                                        <div className="w-2 h-14 bg-blue-500 rounded-full animate-pulse shadow-[0_0_20px_#2563eb]"></div>
                                        <div className="text-left">
                                             <p className="text-[14px] font-black uppercase text-blue-500 tracking-[0.6em] font-mono leading-none">NEURAL INTELLIGENCE Pulse_Dossier</p>
                                             <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2">Grid Encryption: AES-256 SECURE</p>
                                        </div>
                                    </div>
                                    
                                    <p className="text-3xl text-blue-100 leading-relaxed italic font-serif max-w-5xl text-left">
                                        "{regionReport || 'Awaiting operational handshake. Execute national scan to decrypt regional procurement bottlenecks, live material spreads, and strategic infrastructure orchestration across the grid...'}"
                                    </p>
                                    
                                    {groundingLinks.length > 0 && (
                                        <div className="mt-16 pt-12 border-t border-white/10 animate-fade-in-up text-left">
                                            <h4 className="text-[11px] font-black uppercase text-blue-500 tracking-[0.5em] mb-8 text-left">Verification Credentials</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                                                {groundingLinks.map((link, idx) => (
                                                    <a key={idx} href={link.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-5 bg-white/5 p-6 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all group/link shadow-2xl">
                                                        <div className="p-3 bg-blue-600/20 rounded-xl group-hover/link:bg-blue-600 transition-colors">
                                                            <Link className="h-4 w-4 text-blue-400 group-hover/link:text-white" />
                                                        </div>
                                                        <span className="text-[11px] font-black text-slate-300 truncate uppercase tracking-widest group-hover:link:text-white text-left">{link.title}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vitals Sidebar */}
                    <div className="lg:col-span-4 space-y-12 text-left">
                        <div className="bg-slate-900 border border-red-600/30 p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group breathe-red text-left">
                            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-1000"><Cpu className="h-64 w-64 text-red-600" /></div>
                            <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-16 flex items-center gap-4 text-red-600 underline decoration-red-600 decoration-8 underline-offset-[16px]">
                                GRID <span className="text-white">VITALS</span>
                            </h3>
                            
                            <div className="space-y-12">
                                <div className="flex justify-between items-end">
                                    <div className="text-left">
                                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">Neural Core Sync</p>
                                        <p className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">{systemHealth.aiCore}</p>
                                    </div>
                                    <div className="w-48 h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-inner">
                                        <div className="h-full bg-emerald-500 w-full animate-pulse shadow-[0_0_15px_#10b981]"></div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-end border-t border-white/5 pt-12">
                                    <div className="text-left">
                                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">Global Signal Pulse</p>
                                        <p className="text-5xl font-black text-blue-500 italic tracking-tighter leading-none">{systemHealth.latency}ms</p>
                                    </div>
                                    <div className="w-48 h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
                                        <div className="h-full bg-blue-500 w-1/3 shadow-[0_0_20px_#2563eb]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-[4rem] border border-white/5 p-12 shadow-2xl text-left relative overflow-hidden group">
                             <div className="absolute inset-0 bg-carbon opacity-10"></div>
                             <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-12 flex items-center gap-5 text-blue-600">
                                <Activity size={32} className="text-blue-600" />
                                NODE <span className="text-white">TRANSMISSIONS</span>
                            </h3>
                            <div className="bg-black/80 rounded-3xl p-8 font-mono text-[11px] text-emerald-500/80 border border-emerald-500/20 shadow-inner h-48 flex flex-col justify-end space-y-2 text-left">
                                <div className="opacity-40 text-left">[SYS] INITIALIZING REDLINE UPLINK...</div>
                                <div className="opacity-60 text-left">[GRID] GP_SECTOR_ALPHA: LOAD 94.2%</div>
                                <div className="opacity-80 text-left">[AI] ANALYSING NATIONAL CEMENT SPREAD...</div>
                                <div className="animate-pulse text-emerald-400 text-left">[GRID] KZN_LOGISTICS_HUB: ACTIVE</div>
                                <div className="text-emerald-500 font-black text-left">[SYS] NEURAL HANDSHAKE: SECURE_LOCKED</div>
                            </div>
                        </div>
                        
                        <div className="bg-slate-900 border border-white/5 p-12 rounded-[4rem] shadow-2xl text-left relative group">
                            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-1000"><Map className="h-48 w-48 text-white" /></div>
                            <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-12 flex items-center gap-5 text-blue-500">
                                <Scale size={32} className="text-blue-500" />
                                REGULATORY <span className="text-white">PACE</span>
                            </h3>
                            
                            <div className="space-y-8">
                                {metroPerformance.map((metro, i) => (
                                    <div key={i} className="flex items-center justify-between p-8 bg-white/5 border border-white/10 rounded-[3rem] hover:bg-white/10 transition-all group shadow-inner">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-white/5 flex items-center justify-center font-black text-slate-400 text-sm tracking-widest group-hover:border-blue-500/50 transition-colors text-left">
                                                {metro.city.slice(0, 3).toUpperCase()}
                                            </div>
                                            <div className="text-left">
                                                <p className="font-black text-white text-xl tracking-tight italic uppercase">{metro.city}</p>
                                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Operational Cluster</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pace Index</p>
                                            <p className="font-black text-white text-2xl flex items-center justify-end gap-3 tracking-tighter italic">
                                                {metro.avgApprovalDays}D
                                                {metro.trend === 'Improving' ? <ArrowDown className="h-4 w-4 text-emerald-400" /> : <ArrowUp className="h-4 w-4 text-red-600" />}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Global Watermark */}
            <div className="fixed bottom-10 left-10 pointer-events-none opacity-5 -z-10 rotate-90 select-none text-left">
                <span className="text-[180px] font-black tracking-tighter text-white uppercase italic leading-none">NATIONAL BRIDGE</span>
            </div>
        </div>
    );
};

export default CommandBridge;