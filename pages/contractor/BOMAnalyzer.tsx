import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type, Part } from '@google/genai';
import { 
    FileText, Sparkles, Upload, X, 
    CheckCircle, BarChart, ShoppingCart, 
    ArrowRight, Search, Activity, RefreshCcw,
    Plus, Package, Archive, Database
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { useCurrency } from '../../hooks/useCurrency';
import { useData } from '../../hooks/useDataContext';
import { ProjectMaterialStatus } from '../../types';

const fileToBase64 = (file: File): Promise<{ mimeType: string; data: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const [header, data] = result.split(',');
            const mimeType = header.match(/:(.*?);/)?.[1];
            if (mimeType && data) resolve({ mimeType, data });
            else reject(new Error("Document intake failed."));
        };
        reader.onerror = error => reject(error);
    });
};

const BOMAnalyzer: React.FC = () => {
    const { showToast } = useToast();
    const { formatCurrency } = useCurrency();
    const { addProjectMaterialsInDb, projects } = useData();
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<any[] | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort("Unmounted");
            }
        };
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setResults(null);
        }
    };

    const executeIntercept = async () => {
        if (!file || !process.env.API_KEY) {
            showToast("System Authorization Required", "error");
            return;
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort("New intercept started");
        }
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        setIsAnalyzing(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const { mimeType, data } = await fileToBase64(file);
            const docPart: Part = { inlineData: { mimeType, data } };

            const prompt = `
                Perform a high-fidelity Bill of Materials (BOM) intercept.
                Analyze this construction document (quote, blueprint, or list).
                Extract every material item, its quantity, and unit.
                For each item, suggest a "Grid-Tier" price in ZAR based on the 2025 South African market.
                Return a JSON array of objects with: name, quantity, unit, suggestedPrice.
            `;

            const responseSchema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        quantity: { type: Type.NUMBER },
                        unit: { type: Type.STRING },
                        suggestedPrice: { type: Type.NUMBER }
                    },
                    required: ['name', 'quantity', 'unit', 'suggestedPrice']
                }
            };

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: { parts: [docPart, { text: prompt }] },
                config: { responseMimeType: 'application/json', responseSchema },
                requestOptions: { signal }
            });

            if (signal.aborted) return;

            setResults(JSON.parse(response.text || '[]'));
            showToast("BOM Dossier Extracted", "success");
        } catch (e: any) {
            if (signal.aborted || e.name === 'AbortError' || e.message?.toLowerCase().includes('aborted') || e.message?.toLowerCase().includes('signal is aborted')) {
                console.debug("BOM analysis aborted.");
                return;
            }
            showToast("Neural Intercept Failure", "error");
        } finally {
            if (!signal.aborted) {
                setIsAnalyzing(false);
            }
        }
    };

    const handleBulkCommit = async () => {
        if (!results || !selectedProjectId) {
            showToast("Project Node Selection Required", "warning");
            return;
        }
        
        try {
            const materials = results.map(item => ({
                projectId: selectedProjectId,
                productName: item.name,
                quantity: item.quantity,
                pricePerUnit: item.suggestedPrice,
                status: ProjectMaterialStatus.ToOrder,
                currency: 'ZAR'
            }));

            await addProjectMaterialsInDb(materials);
            setResults(null);
            setFile(null);
            setPreviewUrl(null);
            showToast("Grid Identity Committed to Project Dossier", "success");
        } catch (e) {
            showToast("Ledger Handshake Failed", "error");
        }
    }

    return (
        <div className="space-y-12 animate-fade-in pb-24 text-left selection:bg-red-600/30">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-12 text-left">
                <div className="text-left">
                    <div className="flex items-center gap-4 mb-4 text-left">
                        <Sparkles size={24} className="text-red-600 animate-pulse" />
                        <span className="text-[11px] font-black uppercase tracking-[0.5em] text-red-500">Dossier Extraction v80.5</span>
                    </div>
                    <h2 className="text-8xl md:text-9xl font-black text-white tracking-tighter uppercase italic leading-[0.75]">B.O.M <br/> <span className="text-blue-600 text-glow-blue">INTERCEPT</span></h2>
                    <p className="text-slate-500 mt-6 font-mono text-sm tracking-widest uppercase italic max-w-2xl leading-relaxed text-left">"Automated Bill of Materials intake. Upload any project mandate to digitize materials and benchmark against the national supply grid."</p>
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white text-slate-950 font-black py-8 px-16 rounded-[2.5rem] shadow-2xl transform transition-all active:scale-95 uppercase tracking-widest text-xs flex items-center gap-6 border-4 border-slate-900"
                    >
                        <Upload size={24} className="text-red-600" />
                        Provision Dossier
                    </button>
                    <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
                <div className="lg:col-span-5 h-[700px]">
                    <div className="bg-slate-900 border border-white/5 rounded-[4rem] h-full relative overflow-hidden flex flex-col shadow-inner p-4">
                         <div className="absolute inset-0 bg-carbon opacity-10"></div>
                         {!file ? (
                             <div className="flex-grow flex flex-col items-center justify-center text-center p-12 opacity-20">
                                 <FileText size={120} className="text-slate-700 mb-10" />
                                 <p className="font-black uppercase tracking-[0.8em] text-[10px]">Awaiting Payload Transmission</p>
                             </div>
                         ) : (
                             <div className="flex-grow relative p-6 flex flex-col h-full">
                                 <div className="flex-grow bg-black/60 rounded-[3.5rem] overflow-hidden border-4 border-slate-950 relative shadow-2xl">
                                    <img src={previewUrl!} className={`w-full h-full object-cover transition-all duration-1000 ${isAnalyzing ? 'blur-md grayscale opacity-40' : 'opacity-80'}`} alt="Source" />
                                    {isAnalyzing && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                                            <div className="w-full h-1 bg-red-600 absolute top-0 shadow-[0_0_40px_#dc2626] animate-scan"></div>
                                            <Activity size={60} className="text-red-600 animate-pulse mb-8" />
                                            <p className="text-[12px] font-black text-red-500 uppercase tracking-[0.6em] animate-pulse">Decrypting Schematic Data...</p>
                                        </div>
                                    )}
                                 </div>
                                 <div className="mt-8 flex gap-4">
                                     <button onClick={() => { setFile(null); setResults(null); }} className="p-6 bg-white/5 border border-white/10 rounded-3xl text-slate-500 hover:text-white transition-all"><X size={24}/></button>
                                     <button 
                                        onClick={executeIntercept}
                                        disabled={isAnalyzing}
                                        className="flex-grow bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-[2rem] uppercase tracking-widest text-[10px] shadow-[0_0_50px_rgba(37,99,235,0.4)] transform active:scale-95 disabled:opacity-30 border border-white/10 flex items-center justify-center gap-4"
                                     >
                                         <Search size={20} />
                                         Initialize Neural Audit
                                     </button>
                                 </div>
                             </div>
                         )}
                    </div>
                </div>

                <div className="lg:col-span-7 h-[700px]">
                    <div className="bg-slate-900 border border-white/5 rounded-[4rem] h-full p-12 flex flex-col relative overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 bg-carbon opacity-5"></div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 shrink-0 relative z-10 text-left gap-8">
                             <div className="text-left">
                                 <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white flex items-center gap-6 leading-none">
                                     <div className="w-2 h-12 bg-red-600 rounded-full shadow-[0_0_15px_red]"></div>
                                     Intercepted <span className="text-red-600 text-glow-red">Registry</span>
                                 </h3>
                                 <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-2">Buffer Memory: SECURE</p>
                             </div>
                             {results && (
                                <div className="flex gap-4 w-full md:w-auto">
                                    <select 
                                        value={selectedProjectId}
                                        onChange={e => setSelectedProjectId(e.target.value)}
                                        className="flex-grow bg-slate-950 border-4 border-slate-800 rounded-2xl text-white text-[10px] font-black uppercase px-6 outline-none focus:border-red-600 appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Target Node</option>
                                        {projects.map(p => <option key={p.id} value={p.id} className="bg-slate-900">{p.projectName}</option>)}
                                    </select>
                                    <button onClick={handleBulkCommit} className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-10 py-5 rounded-2xl text-[10px] uppercase tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all transform active:scale-95 border border-white/10 shrink-0">
                                        Execute Batch Commit
                                    </button>
                                </div>
                             )}
                        </div>
                        
                        <div className="flex-grow overflow-y-auto custom-scrollbar space-y-4 pr-6 relative z-10 text-left">
                            {results ? (
                                results.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-8 rounded-[3rem] bg-white/5 border border-white/5 group hover:bg-white/10 transition-all duration-300 shadow-inner">
                                        <div className="flex items-center gap-8">
                                            <div className="w-16 h-16 rounded-3xl bg-slate-800 flex items-center justify-center font-black text-slate-500 text-sm group-hover:border-red-600/50 border border-transparent transition-all shadow-inner">0{idx+1}</div>
                                            <div className="text-left">
                                                <p className="font-black text-white uppercase italic tracking-tight text-2xl leading-none">{item.name}</p>
                                                <div className="flex items-center gap-4 mt-3">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-black/40 px-3 py-1 rounded-lg border border-white/5">{item.quantity} {item.unit}</span>
                                                    <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                                                    <span className="text-[9px] font-black text-blue-50 uppercase tracking-widest">SANS Verified Payload</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-10">
                                             <div className="text-right">
                                                 <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Index Rate</p>
                                                 <p className="text-3xl font-black text-emerald-400 italic tracking-tighter drop-shadow-lg">{formatCurrency(item.suggestedPrice)}</p>
                                             </div>
                                             <button className="p-5 bg-white text-slate-950 rounded-2xl hover:bg-red-600 hover:text-white transition-all transform active:scale-90 shadow-2xl border border-white/10">
                                                <Plus size={24} />
                                             </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-10 py-20 group">
                                    <Database size={100} className="text-slate-500 mb-10 group-hover:scale-110 transition-transform duration-1000" />
                                    <p className="text-sm font-black uppercase tracking-[1em] text-slate-500 max-w-sm leading-loose">Initialize visual sweep to generate material telemetry</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="fixed bottom-10 right-10 pointer-events-none opacity-[0.02] -z-10 rotate-90 select-none text-left">
                <span className="text-[220px] font-black tracking-tighter text-white uppercase italic leading-none">REGISTRY_EXTRACT</span>
            </div>
            
            <style>{`
                @keyframes scan { 0% { top: 0%; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
                .animate-scan { animation: scan 4s linear infinite; }
            `}</style>
        </div>
    );
};

export default BOMAnalyzer;