
import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { 
    Sparkles, Camera, FileText, 
    X, ShieldCheck, Beaker, 
    RefreshCcw, TriangleAlert,
    Layers, Scan, CheckCircle,
    Activity
} from 'lucide-react';
import { Project } from '../types';
import { useToast } from '../hooks/useToast';

const fileToBase64 = (file: File): Promise<{ mimeType: string; data: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const [header, data] = result.split(',');
            const mimeType = header.match(/:(.*?);/)?.[1];
            if (mimeType && data) resolve({ mimeType, data });
            else reject(new Error("Dossier intake failed."));
        };
        reader.onerror = error => reject(error);
    });
};

const DigitalTwinSync: React.FC<{ project: Project }> = ({ project }) => {
    const { showToast } = useToast();
    const [blueprint, setBlueprint] = useState<File | null>(null);
    const [sitePhoto, setSitePhoto] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [auditReport, setAuditReport] = useState<any | null>(null);
    
    const blueRef = useRef<HTMLInputElement>(null);
    const siteRef = useRef<HTMLInputElement>(null);

    const executeNeuralSync = async () => {
        if (!blueprint || !sitePhoto || !process.env.API_KEY) return;
        setIsAnalyzing(true);
        setAuditReport(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const blueData = await fileToBase64(blueprint);
            const siteData = await fileToBase64(sitePhoto);

            const prompt = `
                Perform a high-precision Digital Twin structural comparison for project: "${project.projectName}".
                Visual Input 1: Master Schematic (Blueprint).
                Visual Input 2: Current State (Site Photo).
                
                Tasks:
                1. Detect structural deviations from the plan.
                2. Calculate Completion Percentage (0-100%).
                3. Identify installed vs pending materials.
                4. Write a brief technical verdict in professional contractor-grade language.
                
                Return JSON.
            `;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    deviations: { type: Type.ARRAY, items: { type: Type.STRING } },
                    completionPercentage: { type: Type.NUMBER },
                    technicalVerdict: { type: Type.STRING },
                    auditStatus: { type: Type.STRING, enum: ['LOCKED', 'DEVIATION_DETECTED', 'CRITICAL_FAIL'] }
                },
                required: ['deviations', 'completionPercentage', 'technicalVerdict', 'auditStatus']
            };

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: {
                    parts: [
                        { inlineData: { mimeType: blueData.mimeType, data: blueData.data } },
                        { inlineData: { mimeType: siteData.mimeType, data: siteData.data } },
                        { text: prompt }
                    ]
                },
                config: { responseMimeType: 'application/json', responseSchema }
            });

            setAuditReport(JSON.parse(response.text || '{}'));
            showToast("Neural Handshake Confirmed", "success");
        } catch (e) {
            console.error(e);
            showToast("Neural Bridge Failure", "error");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="space-y-10 animate-fade-in-up">
            <div className="bg-slate-900 rounded-[3.5rem] p-12 shadow-2xl border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-carbon opacity-10 pointer-events-none"></div>
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12">
                    <div className="text-left max-w-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <Sparkles className="h-6 w-6 text-red-600 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-500">Structural Telemetry Core v80.5</span>
                        </div>
                        <h2 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none mb-6">Digital <span className="text-red-600">Twin</span> Sync</h2>
                        <p className="text-slate-400 text-lg leading-relaxed font-medium italic">"Real-time structural grounding. Compare high-fidelity schematics against physical site telemetry to identify structural drift and material accuracy."</p>
                    </div>

                    <button 
                        onClick={executeNeuralSync}
                        disabled={isAnalyzing || !blueprint || !sitePhoto}
                        className="bg-red-600 hover:bg-red-700 text-white font-black py-8 px-16 rounded-[2.5rem] shadow-2xl shadow-red-900/40 transition-all transform active:scale-95 disabled:opacity-30 border-4 border-slate-950 uppercase tracking-widest text-xs flex items-center gap-4"
                    >
                        {isAnalyzing ? <RefreshCcw className="h-6 w-6 animate-spin"/> : <Beaker className="h-6 w-6" />}
                        Execute Synchronisation
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Schematic Upload */}
                <div 
                    onClick={() => blueRef.current?.click()}
                    className={`relative h-96 rounded-[3rem] border-4 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center group overflow-hidden ${blueprint ? 'border-blue-600 bg-blue-600/5' : 'border-white/5 bg-slate-900 hover:bg-slate-800'}`}
                >
                    {blueprint ? (
                        <div className="text-center p-10 animate-fade-in">
                            <FileText className="h-20 w-20 text-blue-500 mx-auto mb-6" />
                            <p className="font-black text-white uppercase italic tracking-tighter text-xl truncate max-w-xs">{blueprint.name}</p>
                            <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mt-2">Master Schematic Loaded</p>
                        </div>
                    ) : (
                        <>
                            <div className="p-6 bg-slate-800 rounded-full mb-6 group-hover:scale-110 transition-transform shadow-xl"><Layers className="h-12 w-12 text-slate-500"/></div>
                            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Uplink Blueprint (PDF/JPG)</p>
                        </>
                    )}
                    <input ref={blueRef} type="file" className="hidden" onChange={e => setBlueprint(e.target.files?.[0] || null)} />
                </div>

                {/* Site Photo Upload */}
                <div 
                    onClick={() => siteRef.current?.click()}
                    className={`relative h-96 rounded-[3rem] border-4 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center group overflow-hidden ${sitePhoto ? 'border-red-600 bg-red-600/5' : 'border-white/5 bg-slate-900 hover:bg-slate-800'}`}
                >
                    {sitePhoto ? (
                        <div className="text-center p-10 animate-fade-in">
                             <Camera className="h-20 w-20 text-red-500 mx-auto mb-6" />
                             <p className="font-black text-white uppercase italic tracking-tighter text-xl truncate max-w-xs">{sitePhoto.name}</p>
                             <p className="text-red-400 text-[10px] font-black uppercase tracking-widest mt-2">Site Telemetry Locked</p>
                        </div>
                    ) : (
                        <>
                            <div className="p-6 bg-slate-800 rounded-full mb-6 group-hover:scale-110 transition-transform shadow-xl"><Camera className="h-12 w-12 text-slate-500"/></div>
                            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Uplink Site Photo</p>
                        </>
                    )}
                    <input ref={siteRef} type="file" className="hidden" onChange={e => setSitePhoto(e.target.files?.[0] || null)} />
                </div>
            </div>

            {auditReport && (
                <div className="bg-white p-16 rounded-[4rem] shadow-2xl animate-fade-in-up text-left relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-slate-900"><ShieldCheck size={256} /></div>
                    <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16 border-b border-slate-100 pb-12">
                        <div>
                             <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none underline decoration-red-600 decoration-8 underline-offset-8">Audit Verdict</h3>
                             <p className="text-slate-400 font-mono text-[10px] font-black uppercase tracking-[0.4em] mt-6">Report ID: SL-TWIN-{Date.now().toString().slice(-6)}</p>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <div className={`px-8 py-3 rounded-2xl border-4 font-black text-2xl uppercase tracking-tighter italic ${auditReport.auditStatus === 'LOCKED' ? 'bg-emerald-50 text-emerald-600 border-emerald-500' : 'bg-red-50 text-red-600 border-red-600'}`}>
                                {auditReport.auditStatus}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                        <div className="lg:col-span-1 space-y-12">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Structural Progress</p>
                                <div className="relative inline-block">
                                    <svg className="w-48 h-48 transform -rotate-90">
                                        <circle cx="96" cy="96" r="88" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                                        <circle cx="96" cy="96" r="88" stroke="#DC0000" strokeWidth="12" fill="transparent" strokeDasharray={552} strokeDashoffset={552 - (552 * auditReport.completionPercentage) / 100} className="transition-all duration-2000 ease-out" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <p className="text-5xl font-black italic tracking-tighter text-slate-900">{auditReport.completionPercentage}%</p>
                                        <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-1">Completion</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-10 text-left">
                            <div>
                                <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-6 flex items-center gap-3">
                                    <TriangleAlert className="h-4 w-4 text-red-600"/> Detected Deviations
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {auditReport.deviations.map((dev: string, i: number) => (
                                        <div key={i} className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-red-600/30 transition-all">
                                            <div className="w-1.5 h-10 bg-red-600 rounded-full group-hover:scale-y-110 transition-transform shadow-lg"></div>
                                            <p className="text-sm font-bold text-slate-800 italic leading-relaxed">"{dev}"</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-950 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                                 <div className="absolute inset-0 bg-carbon opacity-10 pointer-events-none"></div>
                                 <h4 className="text-[10px] font-black uppercase text-blue-500 mb-6 tracking-[0.4em]">Neural Technical Analysis</h4>
                                 <p className="text-xl font-medium italic leading-loose font-serif">"{auditReport.technicalVerdict}"</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 flex gap-4 pt-12 border-t border-slate-100">
                        <button className="flex-1 bg-slate-100 text-slate-950 font-black py-5 rounded-3xl uppercase tracking-widest text-[10px] hover:bg-white transition-all transform active:scale-95 shadow-xl border-4 border-slate-900">Archive to Project Log</button>
                        <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-3xl uppercase tracking-widest text-[10px] shadow-2xl shadow-blue-900/40 transition-all transform active:scale-95 border border-white/10">Transmit to Stakeholders</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DigitalTwinSync;
