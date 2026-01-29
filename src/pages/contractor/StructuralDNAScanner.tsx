import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type, Part } from '@google/genai';
import { 
    X, Camera, Sparkles, ShieldCheck, 
    RefreshCcw, Layers, Scan, 
    CheckCircle, TriangleAlert, Beaker,
    Activity, Box
} from 'lucide-react';
import { Project, ProjectMaterialStatus } from '../../types';
import { useToast } from '../../hooks/useToast';

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

const StructuralDNAScanner: React.FC<{ project: Project; onClose?: () => void }> = ({ project, onClose }) => {
    const { showToast } = useToast();
    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [dnaReport, setDnaReport] = useState<any | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setDnaReport(null);
        }
    };

    const executeNeuralDNAAudit = async () => {
        if (!image || !process.env.API_KEY) return;
        setIsAnalyzing(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const { mimeType, data } = await fileToBase64(image);
            const imagePart: Part = { inlineData: { mimeType, data } };

            const prompt = `
                Perform a high-precision Structural DNA extraction for construction project: "${project.projectName}".
                Identify:
                1. Rebar Count & Density (if visible).
                2. Foundation Depth Estimation based on surroundings.
                3. Concrete Slump/Workability visual assessment.
                4. Compliance score against SANS 10400 Part J/K.
                5. High-fidelity remediations.
                
                Return JSON.
            `;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    rebarDensity: { type: Type.STRING },
                    complianceScore: { type: Type.NUMBER },
                    anomalies: { type: Type.ARRAY, items: { type: Type.STRING } },
                    verdict: { type: Type.STRING },
                    dnaStatus: { type: Type.STRING, enum: ['SECURE', 'STRUCTURAL_DRIFT', 'CRITICAL_HALT'] }
                },
                required: ['rebarDensity', 'complianceScore', 'anomalies', 'verdict', 'dnaStatus']
            };

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: { parts: [imagePart, { text: prompt }] },
                config: { responseMimeType: 'application/json', responseSchema }
            });

            const result = JSON.parse(response.text || '{}');
            setDnaReport(result);
            showToast("Structural DNA Extracted", "success");
        } catch (e) {
            console.error("DNA Extraction failed", e);
            showToast("Vision Link Distortion", "error");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12 text-left">
            <div className="bg-slate-900 rounded-[3.5rem] p-12 shadow-2xl border border-white/10 relative overflow-hidden text-left">
                <div className="absolute inset-0 bg-carbon opacity-10"></div>
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12">
                    <div className="text-left">
                        <div className="flex items-center gap-4 mb-4">
                            <Scan className="h-8 w-8 text-cyan-500 animate-pulse shadow-[0_0_20px_#06b6d4]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-cyan-400">Structural DNA Intercept v100</span>
                        </div>
                        <h2 className="text-6xl font-black text-white tracking-tighter uppercase italic leading-none mb-6">Structural <span className="text-cyan-500">DNA</span> Scanner</h2>
                        <p className="text-slate-400 text-lg italic leading-relaxed max-w-2xl font-medium">"Deep-vision structural grounding. Point sensory array at structural nodes to analyze rebar density, material workability, and SANS-compliant geometry."</p>
                    </div>

                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-black py-8 px-16 rounded-[2.5rem] shadow-2xl transition-all transform active:scale-95 border-4 border-slate-950 uppercase tracking-[0.4em] text-xs flex items-center gap-4"
                    >
                        <Camera className="h-6 w-6"/>
                        Initialize Sensor
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 bg-black rounded-[3rem] border-4 border-slate-900 h-[600px] relative overflow-hidden shadow-2xl group flex items-center justify-center">
                    <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none"></div>
                    {previewUrl ? (
                        <>
                            <img src={previewUrl} className={`w-full h-full object-cover transition-all duration-1000 ${isAnalyzing ? 'opacity-40 grayscale blur-[4px]' : 'opacity-80 group-hover:opacity-100'}`} alt="Sensor Feed" />
                            {isAnalyzing && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                                    <div className="w-full h-1 bg-cyan-500 absolute top-0 shadow-[0_0_30px_#06b6d4] animate-scan"></div>
                                    <Activity className="h-20 w-20 text-cyan-400 animate-pulse mb-8" />
                                    <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.8em]">Decrypting Geometry...</p>
                                </div>
                            )}
                            {dnaReport && (
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                    <div className="w-80 h-80 border-2 border-cyan-500/30 rounded-full animate-spin-slow"></div>
                                    <div className="absolute inset-0 border-[20px] border-black/20"></div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center space-y-6 opacity-30 group-hover:opacity-50 transition-opacity">
                            <Box className="h-24 w-24 mx-auto text-slate-500" />
                            <p className="font-black uppercase tracking-[0.5em] text-xs">Awaiting Visual Link</p>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-5 space-y-8 flex flex-col h-[600px]">
                    <div className="bg-slate-900 border border-white/5 p-10 rounded-[3rem] shadow-2xl flex flex-col h-full relative overflow-hidden group">
                        <div className="absolute inset-0 bg-carbon opacity-5"></div>
                        <div className="relative z-10 flex flex-col h-full text-left">
                            <div className="flex justify-between items-center mb-10 text-left">
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Extraction <span className="text-cyan-500">Log</span></h3>
                                {previewUrl && !dnaReport && (
                                    <button 
                                        onClick={executeNeuralDNAAudit}
                                        disabled={isAnalyzing}
                                        className="bg-blue-600 hover:bg-blue-500 text-white font-black px-6 py-2 rounded-xl text-[10px] uppercase tracking-widest shadow-xl transition-all"
                                    >
                                        Execute Extract
                                    </button>
                                )}
                            </div>

                            <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 text-left">
                                {dnaReport ? (
                                    <div className="space-y-8 animate-fade-in-up text-left">
                                        <div className="grid grid-cols-2 gap-4 text-left">
                                            <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-left shadow-inner">
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Density Index</p>
                                                <p className="text-2xl font-black text-white italic tracking-tighter">{dnaReport.rebarDensity}</p>
                                            </div>
                                            <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-left shadow-inner">
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Grid Compliance</p>
                                                <p className="text-4xl font-black text-emerald-400 italic tracking-tighter">{dnaReport.complianceScore}%</p>
                                            </div>
                                        </div>

                                        <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden text-left">
                                             <div className="absolute top-0 right-0 p-4 opacity-5"><ShieldCheck className="h-16 w-16" /></div>
                                             <h4 className="text-[9px] font-black text-cyan-500 uppercase tracking-[0.4em] mb-4">Tactical Verdict</h4>
                                             <p className="text-lg italic text-slate-300 font-serif leading-loose">"{dnaReport.verdict}"</p>
                                        </div>

                                        <div className="space-y-3 text-left">
                                             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-4">Detected Anomalies</p>
                                             {dnaReport.anomalies.map((a: string, i: number) => (
                                                 <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-red-600/10 transition-colors">
                                                     <TriangleAlert className="h-4 w-4 text-red-500 shrink-0" />
                                                     <p className="text-sm font-bold text-slate-200">{a}</p>
                                                 </div>
                                             ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center opacity-20 py-20 text-center">
                                        <Layers className="h-16 w-16 mb-4 text-slate-500" />
                                        <p className="text-xs font-black uppercase tracking-widest">Provision node with visual data packet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes scan { 0% { top: 0%; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
            `}</style>
        </div>
    );
};

export default StructuralDNAScanner;