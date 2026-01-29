
import React, { useState, useRef, useMemo } from 'react';
import { 
    Cloud, Plane, Sparkles, Target, 
    ShieldCheck, RefreshCcw, Camera, 
    X, ArrowLeft, ArrowRight, Activity,
    Box, Map, Layers, Radio, Wind, Navigation2, Crosshair
} from 'lucide-react';
import { GoogleGenAI, Type, Part } from '@google/genai';
import { useData } from '../../hooks/useDataContext.tsx';
import { useToast } from '../../hooks/useToast.tsx';
import AnimatedNumber from '../../components/AnimatedNumber.tsx';

const fileToBase64 = (file: File): Promise<{ mimeType: string; data: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const [header, data] = result.split(',');
            const mimeType = header.match(/:(.*?);/)?.[1];
            if (mimeType && data) resolve({ mimeType, data });
            else reject(new Error("Telemetry intake failure."));
        };
        reader.onerror = error => reject(error);
    });
};

const DroneScoutPage: React.FC = () => {
    const { projects = [] } = useData();
    const { showToast } = useToast();
    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [report, setReport] = useState<any | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setReport(null);
            showToast("Aerial Telemetry Cached", "info");
        }
    };

    const executeAerialAudit = async () => {
        if (!image || !process.env.API_KEY) return;
        setIsAnalyzing(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const { mimeType, data } = await fileToBase64(image);
            const imagePart: Part = { inlineData: { mimeType, data } };

            const prompt = `
                Perform an elite Aerial Site Audit. Analyze this drone photograph of a South African construction site.
                1. Topography Analysis: Identify elevation risks, drainage issues, or slope stability.
                2. Material Stockpile Detection: Estimate volume of bricks, sand, or cement visible from the air. Be specific.
                3. Logistics Flow: Are access roads clear of obstruction? 
                4. Perimeter Security: Any breaches, safety fencing issues, or unauthorized presence?
                5. Technical Verdict: Summarize the operational state of the node.
                
                Return JSON.
            `;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    stockpiles: { 
                        type: Type.ARRAY, 
                        items: { 
                            type: Type.OBJECT, 
                            properties: { 
                                item: { type: Type.STRING }, 
                                estimate: { type: Type.STRING },
                                status: { type: Type.STRING } 
                            }, 
                            required: ['item', 'estimate'] 
                        } 
                    },
                    topographyFindings: { type: Type.ARRAY, items: { type: Type.STRING } },
                    risks: { type: Type.ARRAY, items: { type: Type.STRING } },
                    readinessScore: { type: Type.NUMBER },
                    verdict: { type: Type.STRING }
                },
                required: ['stockpiles', 'risks', 'readinessScore', 'verdict']
            };

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: { parts: [imagePart, { text: prompt }] },
                config: { responseMimeType: 'application/json', responseSchema }
            });

            setReport(JSON.parse(response.text || '{}'));
            showToast("Satellite Handshake Synchronized", "success");
        } catch (e) {
            console.error(e);
            showToast("Grid Uplink Interference", "error");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="space-y-12 animate-fade-in pb-24 text-left">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-12">
                <div className="text-left">
                    <div className="flex items-center gap-4 mb-4">
                        <Navigation2 className="h-10 w-10 text-blue-500 shadow-2xl animate-pulse" />
                        <span className="text-[12px] font-black uppercase tracking-[0.5em] text-blue-500 italic">AERIAL_RECON_CORE v1.2</span>
                    </div>
                    <h1 className="text-7xl font-black text-white tracking-tighter uppercase italic leading-none">DRONE <span className="text-blue-500 text-glow-blue">SCOUT</span></h1>
                    <p className="text-slate-500 mt-6 font-mono text-sm tracking-widest uppercase italic max-w-3xl leading-relaxed">"High-altitude site orchestration. Deep-vision analysis of terrain vectors, material logistics, and perimeter integrity."</p>
                </div>

                <div className="flex gap-4">
                     <select 
                        value={selectedProjectId}
                        onChange={e => setSelectedProjectId(e.target.value)}
                        className="bg-slate-900 border-2 border-white/5 rounded-2xl px-6 py-4 text-white font-black italic uppercase text-xs focus:border-blue-600 outline-none transition-all shadow-xl"
                    >
                        {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
                    </select>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white text-slate-950 font-black py-4 px-10 rounded-2xl text-[10px] uppercase tracking-widest shadow-2xl transform active:scale-95 transition-all flex items-center justify-center gap-3 border-4 border-slate-900"
                    >
                        <Camera size={14} className="text-blue-600"/> Uplink Telemetry
                    </button>
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Visual Analysis Viewport */}
                <div className="lg:col-span-8 bg-black rounded-[4rem] border-4 border-slate-900 h-[700px] relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] group flex items-center justify-center">
                    <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none"></div>
                    
                    {previewUrl ? (
                        <>
                            <img src={previewUrl} className={`w-full h-full object-cover transition-all duration-1000 ${isAnalyzing ? 'opacity-40 grayscale blur-[4px]' : 'opacity-80 group-hover:opacity-100'}`} alt="Aerial Feed" />
                            
                            {/* HUD Overlays */}
                            <div className="absolute inset-0 pointer-events-none border-[30px] border-black/20">
                                <div className="absolute top-10 left-10 flex flex-col gap-2">
                                    <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                                        <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_red]"></div>
                                        <span className="text-[9px] font-black text-white uppercase tracking-widest">LIVE_UPLINK</span>
                                    </div>
                                    <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                                        <Navigation2 className="h-3 w-3 text-blue-500" />
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">ALT: 120M</span>
                                    </div>
                                </div>
                                <div className="absolute bottom-10 right-10 flex flex-col gap-2 items-end">
                                    <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">SIGNAL: 98%</span>
                                    </div>
                                    <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">BAT: 84%</span>
                                    </div>
                                </div>
                                {/* Reticle */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-white/20 rounded-full flex items-center justify-center">
                                    <div className="w-8 h-8 border-2 border-blue-500 rounded-full animate-ping"></div>
                                    <Crosshair className="h-6 w-6 text-white/40" />
                                </div>
                            </div>

                            {isAnalyzing && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                                    <div className="w-full h-1 bg-blue-500 absolute top-0 shadow-[0_0_40px_#3b82f6] animate-scan"></div>
                                    <Activity className="h-24 w-24 text-blue-400 animate-pulse mb-8" />
                                    <p className="text-[14px] font-black text-blue-500 uppercase tracking-[0.8em] animate-pulse">Scanning Terrain Matrix...</p>
                                </div>
                            )}
                            
                            {!isAnalyzing && !report && (
                                <button 
                                    onClick={executeAerialAudit}
                                    className="bg-blue-600 hover:bg-blue-500 text-white font-black py-8 px-16 rounded-[3rem] shadow-[0_0_60px_rgba(37,99,235,0.4)] uppercase text-xs tracking-widest border-4 border-white/10 animate-fade-in-scale relative z-30"
                                >
                                    Initialize Neural Recon
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="text-center space-y-10 opacity-20 group-hover:opacity-40 transition-opacity">
                            <div className="relative inline-block">
                                <Plane className="h-40 w-40 mx-auto text-slate-500 transform -rotate-45" />
                                <div className="absolute -inset-10 border border-white/5 rounded-full animate-spin-slow"></div>
                            </div>
                            <p className="font-black uppercase tracking-[1em] text-xs">Awaiting Flight Telemetry Handshake</p>
                        </div>
                    )}
                </div>

                {/* Analysis Report Node */}
                <div className="lg:col-span-4 space-y-8 h-[700px] flex flex-col text-left">
                    <div className="bg-slate-900 border border-white/5 p-12 rounded-[4rem] shadow-2xl flex flex-col h-full relative overflow-hidden group">
                        <div className="absolute inset-0 bg-carbon opacity-5 group-hover:opacity-10 transition-opacity"></div>
                        <div className="relative z-10 flex flex-col h-full text-left">
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-10 flex items-center gap-6 border-b border-white/5 pb-8">
                                <Activity className="h-8 w-8 text-blue-500 animate-pulse"/>
                                Site <span className="text-blue-500">Dossier</span>
                            </h3>

                            <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 space-y-10">
                                {report ? (
                                    <div className="animate-fade-in-up space-y-12 text-left">
                                        <div className="flex justify-between items-end">
                                            <div className="text-left">
                                                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Node Readiness</p>
                                                 <p className={`text-7xl font-black italic tracking-tighter leading-none ${report.readinessScore > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>{report.readinessScore}%</p>
                                            </div>
                                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                                <ShieldCheck className="h-8 w-8 text-blue-500" />
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                             <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest ml-2 border-l-2 border-blue-600 pl-3">Payload Extraction</h4>
                                             {report.stockpiles.map((s: any, i: number) => (
                                                 <div key={i} className="flex justify-between items-center p-6 bg-white/5 rounded-[2rem] border border-white/5 shadow-inner group/item hover:bg-white/10 transition-all">
                                                     <div className="text-left">
                                                         <span className="text-sm font-bold text-slate-300 uppercase tracking-tight">{s.item}</span>
                                                         {s.status && <p className="text-[8px] font-black text-slate-500 uppercase mt-1">{s.status}</p>}
                                                     </div>
                                                     <span className="text-2xl font-black text-white italic tracking-tighter group-hover/item:text-blue-400 transition-colors">{s.estimate}</span>
                                                 </div>
                                             ))}
                                        </div>

                                        <div className="space-y-4">
                                             <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-2 border-l-2 border-red-600 pl-3">Critical Deviations</h4>
                                             {report.risks.map((r: string, i: number) => (
                                                 <div key={i} className="flex items-start gap-5 p-6 bg-red-600/10 rounded-[2rem] border border-red-500/20 shadow-2xl">
                                                     <Target className="h-5 w-5 text-red-600 shrink-0 mt-1" />
                                                     <p className="text-sm font-medium text-red-100 italic leading-relaxed">"{r}"</p>
                                                 </div>
                                             ))}
                                        </div>

                                        <div className="bg-slate-950 p-10 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden text-left">
                                             <div className="absolute inset-0 bg-carbon opacity-10"></div>
                                             <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 relative z-10">Technical Handshake Summary</p>
                                             <p className="text-lg italic text-slate-300 font-serif leading-loose relative z-10">"{report.verdict}"</p>
                                        </div>

                                        <button 
                                            onClick={() => showToast("Audit Dossier Archived", "success")}
                                            className="w-full bg-white text-slate-950 font-black py-5 rounded-[2rem] uppercase tracking-widest text-[10px] shadow-2xl transform active:scale-95 transition-all border-4 border-slate-900"
                                        >
                                            Archive to Site Record
                                        </button>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center opacity-20 py-20 text-center">
                                        <Layers className="h-20 w-20 mb-8 text-slate-500" />
                                        <p className="text-sm font-black uppercase tracking-widest leading-loose max-w-[200px]">Awaiting aerial sensor handshake to generate site matrix</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-12 left-12 pointer-events-none opacity-[0.03] -z-10 rotate-90 select-none text-left">
                <span className="text-[180px] font-black tracking-tighter text-white uppercase italic leading-none">AERIAL COMMAND</span>
            </div>

            <style>{`
                @keyframes scan { 0% { top: 0%; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
                .animate-scan { animation: scan 4s linear infinite; }
            `}</style>
        </div>
    );
};

export default DroneScoutPage;
