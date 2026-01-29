
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
    ArrowLeftIcon, SparklesIcon, DocumentArrowUpIcon, 
    XCircleIcon, ClipboardDocumentIcon, ShieldCheckIcon, 
    PaperAirplaneIcon, ChatBubbleLeftRightIcon,
    ExclamationTriangleIcon, CheckCircleIcon,
    CameraIcon,
    ArrowPathIcon
} from '@heroicons/react/24/solid';
import { useLocalization } from '../../hooks/useLocalization.tsx';
import { useData } from '../../hooks/useDataContext.tsx';
/* Fix: Removed .ts extension and updated member names from import */
import { Project, SafetyAuditIssue, SnagItem } from '../../types';
import { GoogleGenAI, Part, Type } from '@google/genai';
import { useToast } from '../../hooks/useToast.tsx';

const fileToBase64 = (file: File): Promise<{ mimeType: string; data: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const [header, data] = result.split(',');
            const mimeType = header.match(/:(.*?);/)?.[1];
            if (mimeType && data) resolve({ mimeType, data });
            else reject(new Error("File conversion failure."));
        };
        reader.onerror = error => reject(error);
    });
};

const InteractiveHUD: React.FC<{ report: any[], image: File }> = ({ report, image }) => {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
    const imageUrl = useMemo(() => URL.createObjectURL(image), [image]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-fade-in-up">
            <div className="relative group rounded-[3rem] overflow-hidden border-4 border-slate-900 shadow-2xl bg-black">
                <img src={imageUrl} alt="Analysis" className="w-full h-auto object-cover opacity-80" />
                {report.map((item, idx) => {
                    const coords = item.coordinates || { x: 50, y: 50 };
                    return (
                        <div
                            key={idx}
                            onMouseEnter={() => setHoveredIdx(idx)}
                            onMouseLeave={() => setHoveredIdx(null)}
                            className={`absolute w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border-2 border-white shadow-2xl cursor-pointer transition-all ${
                                hoveredIdx === idx ? 'scale-150 z-50 bg-red-600' : 'bg-red-500/80 z-10'
                            }`}
                            style={{ top: `${coords.y}%`, left: `${coords.x}%`, transform: 'translate(-50%, -50%)' }}
                        >
                            {idx + 1}
                        </div>
                    );
                })}
                <div className="absolute top-6 left-6 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                    <span className="text-[10px] font-black uppercase text-red-500 tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
                        Neural Vision HUD
                    </span>
                </div>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-4 text-left">
                <h4 className="text-xs font-black uppercase text-slate-500 tracking-[0.4em] mb-6">Identified Deviations</h4>
                {report.map((item, idx) => (
                    <div 
                        key={idx} 
                        onMouseEnter={() => setHoveredIdx(idx)}
                        onMouseLeave={() => setHoveredIdx(null)}
                        className={`p-6 rounded-[2rem] border transition-all duration-300 ${
                            hoveredIdx === idx ? 'bg-red-600/10 border-red-500 shadow-xl scale-[1.02]' : 'bg-slate-900 border-white/5 hover:border-white/20'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <span className="w-6 h-6 bg-red-600 text-white rounded-lg flex items-center justify-center font-black text-[10px]">{idx + 1}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Critical Index</span>
                        </div>
                        <p className="font-black text-white uppercase italic tracking-tight text-lg mb-2">{item.hazard || item.issue}</p>
                        <p className="text-sm text-slate-400 font-medium italic mb-4">"{item.recommendation}"</p>
                        <div className="flex gap-2">
                            <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500">
                                Severity: {item.severity || 'Medium'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SiteReporterPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { t } = useLocalization();
    const { projects } = useData();
    const { showToast } = useToast();
    const { createProjectLog } = useData();
    
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [reportType, setReportType] = useState<'client' | 'snag' | 'safety'>('client');
    const [report, setReport] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleGenerate = async () => {
        if (!process.env.API_KEY || images.length === 0) return;
        setIsLoading(true);
        setReport(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const imagePart = await fileToBase64(images[0]);
            
            let systemInstruction = "You are an elite construction audit AI for StockLink Ferrari.";
            let responseSchema;
            
            if (reportType === 'safety') {
                systemInstruction += " Identify hazards with percentages for coordinates (x, y) from top-left. Return JSON array of objects.";
                responseSchema = { 
                    type: Type.ARRAY, 
                    items: { 
                        type: Type.OBJECT, 
                        properties: { 
                            hazard: { type: Type.STRING }, 
                            severity: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] }, 
                            recommendation: { type: Type.STRING },
                            coordinates: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } } }
                        }, 
                        required: ['hazard', 'severity', 'recommendation', 'coordinates'] 
                    } 
                };
            } else if (reportType === 'snag') {
                systemInstruction += " Identify incomplete items with percentages for coordinates. Return JSON array of objects.";
                responseSchema = { 
                    type: Type.ARRAY, 
                    items: { 
                        type: Type.OBJECT, 
                        properties: { 
                            issue: { type: Type.STRING }, 
                            recommendation: { type: Type.STRING },
                            coordinates: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } } }
                        }, 
                        required: ['issue', 'recommendation', 'coordinates'] 
                    } 
                };
            }

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: { parts: [{ inlineData: imagePart }, { text: `Generate ${reportType} report.` }] },
                config: { systemInstruction, ...(responseSchema && { responseMimeType: 'application/json', responseSchema }) }
            });

            setReport(responseSchema ? JSON.parse(response.text || '[]') : response.text);
            showToast("Dossier Generated", "success");
        } catch (e) {
            showToast("Vision Link Failure", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-12 animate-fade-in font-sans pb-20">
             <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-10 text-left">
                <div className="text-left">
                    <div className="flex items-center gap-3 mb-4">
                        <CameraIcon className="h-6 w-6 text-red-600 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-500">Site Vision Protocol v80.5</span>
                    </div>
                    <h1 className="text-7xl font-black tracking-tighter italic uppercase text-white leading-none">SITE <span className="text-red-600">CAM</span></h1>
                    <p className="text-slate-500 mt-4 font-mono text-sm tracking-widest uppercase leading-relaxed">Neural Scene Analysis & Automated Snag Registry</p>
                </div>
                <button onClick={onBack} className="text-slate-500 hover:text-white transition-colors uppercase font-black text-xs tracking-widest flex items-center gap-2">
                    <ArrowLeftIcon className="h-4 w-4"/> Back to Bridge
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 border border-white/5 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-carbon opacity-10"></div>
                        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-10 flex items-center gap-4 relative z-10">
                            <div className="w-1.5 h-10 bg-red-600 rounded-full shadow-[0_0_10px_red]"></div>
                            Mission <span className="text-red-600">Parameters</span>
                        </h3>
                        
                        <div className="space-y-6 relative z-10 text-left">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3">Target Sector</label>
                                <select 
                                    value={selectedProjectId} 
                                    onChange={e => setSelectedProjectId(e.target.value)} 
                                    className="w-full p-4 bg-white/5 border-2 border-white/5 rounded-2xl text-white font-bold focus:border-red-600 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Select project node...</option>
                                    {(projects || []).map((p:any) => <option key={p.id} value={p.id}>{p.projectName}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3">Audit Type</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {(['client', 'snag', 'safety'] as const).map(t => (
                                        <button 
                                            key={t}
                                            onClick={() => setReportType(t)}
                                            className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${reportType === t ? 'bg-red-600 text-white border-red-500 shadow-xl' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'}`}
                                        >
                                            {t === 'client' ? 'Dossier Brief' : t === 'snag' ? 'Neural Snag List' : 'Safety Audit'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full bg-white text-slate-950 font-black py-5 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl transform active:scale-95 transition-all border-4 border-slate-950 flex items-center justify-center gap-3"
                            >
                                <DocumentArrowUpIcon className="h-4 w-4 text-red-600"/>
                                Initialize Intake
                            </button>
                            <input ref={fileInputRef} type="file" className="hidden" onChange={e => setImages(Array.from(e.target.files || []))} />

                            {images.length > 0 && (
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 animate-fade-in">
                                    <CheckCircleIcon className="h-5 w-5 text-emerald-500 shadow-[0_0_10px_#10b981]"/>
                                    <span className="text-[10px] font-black text-emerald-100 uppercase tracking-widest">Image Signal: LOCKED</span>
                                </div>
                            )}

                            <button 
                                onClick={handleGenerate}
                                disabled={isLoading || images.length === 0}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-widest shadow-2xl shadow-red-900/40 transition-all flex items-center justify-center gap-3 transform active:scale-95 disabled:opacity-30 border border-white/10"
                            >
                                {isLoading ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : <SparklesIcon className="h-5 w-5 text-yellow-200" />}
                                Execute Neural Audit
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8">
                     {isLoading ? (
                         <div className="bg-slate-900 rounded-[4rem] border border-white/5 h-[600px] flex items-center justify-center shadow-inner relative overflow-hidden">
                             <div className="absolute inset-0 bg-carbon opacity-10"></div>
                             <div className="text-center animate-pulse">
                                 <div className="w-20 h-20 border-8 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-8 shadow-[0_0_40px_red]"></div>
                                 <p className="font-black text-slate-500 uppercase tracking-[0.6em] text-xs">Processing Visual Buffers...</p>
                             </div>
                         </div>
                     ) : report ? (
                         typeof report === 'string' ? (
                             <div className="bg-white p-12 rounded-[4rem] shadow-2xl text-left font-serif text-slate-800 leading-loose animate-fade-in relative overflow-hidden">
                                 <div className="absolute top-0 right-0 p-8 opacity-5"><ClipboardDocumentIcon className="h-48 w-48 text-slate-900"/></div>
                                 <h3 className="font-black font-sans text-3xl italic uppercase tracking-tighter mb-10 text-slate-900 underline decoration-red-600 decoration-8 underline-offset-8">Drafted Dossier Brief</h3>
                                 <p className="text-lg italic leading-relaxed whitespace-pre-wrap">"{report}"</p>
                                 <button className="mt-12 w-full bg-slate-950 text-white font-black py-5 rounded-3xl uppercase text-[10px] tracking-widest hover:bg-black shadow-xl">Archive to Site Log</button>
                             </div>
                         ) : (
                             <InteractiveHUD report={report} image={images[0]} />
                         )
                     ) : (
                         <div className="bg-slate-900/50 border-4 border-dashed border-white/5 rounded-[4rem] h-[600px] flex flex-col items-center justify-center text-center opacity-30 group hover:opacity-50 transition-opacity duration-1000">
                             <CameraIcon className="h-24 w-24 text-slate-700 mb-8 group-hover:scale-110 transition-transform" />
                             <p className="font-black uppercase tracking-[0.5em] text-xs text-slate-500 max-w-sm leading-loose italic">"Awaiting visual sensor payload. Initialize intake to begin neural scene analysis."</p>
                         </div>
                     )}
                </div>
            </div>
            
            <div className="fixed bottom-10 right-10 pointer-events-none opacity-[0.03] -z-10 rotate-90 select-none">
                <span className="text-[140px] font-black tracking-tighter text-white uppercase italic leading-none">VISION CORE READY</span>
            </div>
        </div>
    );
};

export default SiteReporterPage;
