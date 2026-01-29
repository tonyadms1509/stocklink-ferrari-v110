
import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type, Part } from '@google/genai';
import { 
    X, Camera, Sparkles, CheckCircle, 
    AlertTriangle, ShieldCheck, RefreshCcw, 
    Maximize2, Info, Activity, Zap
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
            else reject(new Error("Sensor intake failure."));
        };
        reader.onerror = error => reject(error);
    });
};

const ProgressAuditorModal: React.FC<{ project: Project; onClose: () => void }> = ({ project, onClose }) => {
    const { showToast } = useToast();
    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [audit, setAudit] = useState<any | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setAudit(null);
        }
    };

    const executeNeuralAudit = async () => {
        if (!image || !process.env.API_KEY) return;
        setIsAnalyzing(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const { mimeType, data } = await fileToBase64(image);
            const imagePart: Part = { inlineData: { mimeType, data } };

            const prompt = `
                Perform a high-fidelity structural progress audit for "${project.projectName}".
                Analyze this construction site photo. 
                1. Identify the current work phase (e.g., Brickwork, Electrical First-Fix).
                2. Audit against SANS 10400 standards. Detect visible defects.
                3. Calculate a "Quality Index" (0-100%).
                4. Provide 3 mandatory "Remediation Protocols" if needed.
                
                Return JSON.
            `;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    phase: { type: Type.STRING },
                    qualityIndex: { type: Type.NUMBER },
                    findings: { type: Type.ARRAY, items: { type: Type.STRING } },
                    protocols: { type: Type.ARRAY, items: { type: Type.STRING } },
                    auditStatus: { type: Type.STRING, enum: ['NOMINAL', 'DEVIATION_DETECTED', 'CRITICAL_INTERVENTION'] }
                },
                required: ['phase', 'qualityIndex', 'findings', 'protocols', 'auditStatus']
            };

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: { parts: [imagePart, { text: prompt }] },
                config: { responseMimeType: 'application/json', responseSchema }
            });

            setAudit(JSON.parse(response.text || '{}'));
            showToast("Neural Audit Synchronized", "success");
        } catch (e) {
            showToast("Vision Link Failure", "error");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/98 z-[210] flex items-center justify-center p-4 backdrop-blur-3xl animate-fade-in">
            <div className="bg-slate-900 border border-white/10 rounded-[4rem] shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col relative">
                <div className="absolute inset-0 bg-carbon opacity-10"></div>
                <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white z-50 transition-colors bg-white/5 p-3 rounded-full"><X size={24}/></button>
                
                <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
                    {/* Viewport */}
                    <div className="flex-grow bg-black relative flex items-center justify-center overflow-hidden">
                         {!previewUrl ? (
                             <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="flex flex-col items-center justify-center text-center p-20 cursor-pointer group"
                             >
                                 <div className="p-8 bg-slate-800 rounded-[2.5rem] mb-6 group-hover:bg-red-600 transition-all shadow-xl group-hover:scale-110">
                                     <Camera size={48} className="text-slate-400 group-hover:text-white" />
                                 </div>
                                 <p className="text-2xl font-black text-white italic uppercase tracking-tighter">Initialize Visual Feed</p>
                                 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">Uplink Project Telemetry (JPG/PNG)</p>
                             </div>
                         ) : (
                             <div className="relative w-full h-full flex items-center justify-center p-8">
                                 <img src={previewUrl} className={`max-w-full max-h-full object-contain rounded-3xl shadow-2xl transition-all duration-1000 ${isAnalyzing ? 'blur-md grayscale opacity-40' : ''}`} alt="Site" />
                                 {isAnalyzing && (
                                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                                         <div className="w-full h-1 bg-red-600 absolute top-0 shadow-[0_0_30px_red] animate-scan"></div>
                                         <Sparkles size={64} className="text-red-600 animate-pulse mb-6" />
                                         <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.6em]">Scanning Scene Geometry...</p>
                                     </div>
                                 )}
                             </div>
                         )}
                         <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>

                    {/* Report Panel */}
                    <div className="w-full lg:w-[450px] bg-slate-900 border-l border-white/5 flex flex-col relative z-10">
                        <div className="p-10 border-b border-white/5">
                            <div className="flex items-center gap-3 mb-4">
                                <Activity size={16} className="text-blue-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Neural Auditor v8.5</span>
                            </div>
                            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Progress <span className="text-red-600">Audit</span></h2>
                        </div>

                        <div className="flex-grow overflow-y-auto custom-scrollbar p-10 space-y-8 text-left">
                            {!audit && !isAnalyzing && (
                                <div className="space-y-6 opacity-30">
                                    <div className="h-4 bg-white/5 rounded-full w-3/4"></div>
                                    <div className="h-4 bg-white/5 rounded-full w-full"></div>
                                    <div className="h-4 bg-white/5 rounded-full w-2/3"></div>
                                    <div className="pt-20 text-center">
                                         <Info size={40} className="mx-auto mb-4" />
                                         <p className="text-[10px] font-black uppercase tracking-widest leading-loose">Await sensory uplink to begin <br/> structural compliance mapping.</p>
                                    </div>
                                </div>
                            )}

                            {audit && (
                                <div className="space-y-10 animate-fade-in-up">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Identified Phase</p>
                                            <p className="text-2xl font-black text-white italic uppercase tracking-tighter">{audit.phase}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Quality Index</p>
                                            <p className="text-4xl font-black text-emerald-400 italic tracking-tighter">{audit.qualityIndex}%</p>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 shadow-inner">
                                        <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Technical Findings</h4>
                                        <ul className="space-y-3">
                                            {audit.findings.map((f: string, i: number) => (
                                                <li key={i} className="text-sm font-medium text-slate-200 flex gap-3 italic">
                                                    <div className="w-1 h-4 bg-blue-600 rounded-full mt-1 shrink-0"></div>
                                                    "{f}"
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="space-y-4">
                                         <h4 className="text-[9px] font-black text-red-500 uppercase tracking-[0.4em]">Remediation Protocols</h4>
                                         {audit.protocols.map((p: string, i: number) => (
                                             <div key={i} className="bg-red-600/10 p-5 rounded-2xl border border-red-500/20 flex items-start gap-4">
                                                 <Zap size={14} className="text-red-500 shrink-0 mt-1" />
                                                 <p className="text-xs font-bold text-red-100 italic leading-relaxed">{p}</p>
                                             </div>
                                         ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-10 bg-slate-950/50 border-t border-white/5">
                             {previewUrl && !audit && (
                                 <button 
                                    onClick={executeNeuralAudit}
                                    disabled={isAnalyzing}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-[2.5rem] shadow-2xl transition-all transform active:scale-95 uppercase tracking-[0.4em] text-xs flex items-center justify-center gap-4 border border-white/10"
                                 >
                                     <Sparkles size={18} className="text-yellow-200 animate-pulse" />
                                     Execute Vision Audit
                                 </button>
                             )}
                             {audit && (
                                 <button 
                                    onClick={() => { showToast("Dossier Sealed", "success"); onClose(); }}
                                    className="w-full bg-white text-slate-950 font-black py-6 rounded-[2.5rem] shadow-2xl transition-all transform active:scale-95 uppercase tracking-[0.4em] text-xs border-4 border-slate-900"
                                 >
                                     Commit Audit to Ledger
                                 </button>
                             )}
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes scan { 0% { top: 0%; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
                .animate-scan { animation: scan 4s linear infinite; }
            `}</style>
        </div>
    );
};

export default ProgressAuditorModal;
