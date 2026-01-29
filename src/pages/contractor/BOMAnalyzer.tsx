
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type, Part } from '@google/genai';
import { 
    FileText, Sparkles, Upload, X, 
    CheckCircle, BarChart, ShoppingCart, 
    ArrowRight, Search, Activity
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
            if (abortControllerRef.current) abortControllerRef.current.abort();
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
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;
        const signal = controller.signal;

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
                signal 
            });

            if (signal.aborted) return;

            setResults(JSON.parse(response.text || '[]'));
            showToast("BOM Dossier Extracted", "success");
        } catch (e: any) {
            const isAbort = signal.aborted || 
                            e.name === 'AbortError' || 
                            e.name === 'CanceledError' ||
                            e.message?.toLowerCase().includes('aborted') || 
                            e.message?.toLowerCase().includes('cancel') ||
                            e.message?.toLowerCase().includes('signal is aborted');

            if (isAbort) {
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
        
        const materials = results.map(item => ({
            projectId: selectedProjectId,
            productName: item.name,
            quantity: item.quantity,
            pricePerUnit: item.suggestedPrice,
            status: ProjectMaterialStatus.ToOrder
        }));

        await addProjectMaterialsInDb(materials);
        setResults(null);
        setFile(null);
        showToast("Grid Identity Committed to Project", "success");
    }

    return (
        <div className="space-y-10 animate-fade-in pb-20 text-left">
            <div className="bg-slate-900 rounded-[3.5rem] p-12 shadow-2xl border border-white/10 relative overflow-hidden text-left">
                <div className="absolute inset-0 bg-carbon opacity-10"></div>
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12">
                    <div className="text-left">
                        <div className="flex items-center gap-3 mb-4">
                            <Sparkles size={24} className="text-blue-50 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-50">Dossier Extraction v80.5</span>
                        </div>
                        <h2 className="text-6xl font-black text-white tracking-tighter uppercase italic leading-none mb-6">B.O.M <span className="text-blue-600 text-glow-blue">INTERCEPT</span></h2>
                        <p className="text-slate-400 text-lg leading-relaxed font-medium italic max-w-2xl text-left">"Automated Bill of Materials intake. Upload any project mandate to digitize materials and benchmark against the national supply node."</p>
                    </div>

                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white text-slate-950 font-black py-8 px-16 rounded-[2.5rem] shadow-2xl transform transition-all active:scale-95 uppercase tracking-widest text-xs flex items-center gap-4 border-4 border-slate-900"
                    >
                        <Upload size={20} className="text-blue-600" />
                        Provision Document
                    </button>
                    <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
                <div className="lg:col-span-5 h-[600px]">
                    <div className="bg-slate-900 border border-white/5 rounded-[4rem] h-full relative overflow-hidden flex flex-col shadow-inner">
                         <div className="absolute inset-0 bg-carbon opacity-10"></div>
                         {!file ? (
                             <div className="flex-grow flex flex-col items-center justify-center text-center p-12 opacity-30">
                                 <FileText size={80} className="text-slate-500 mb-6" />
                                 <p className="font-black uppercase tracking-[0.4em] text-xs">Waiting for Payload</p>
                             </div>
                         ) : (
                             <div className="flex-grow relative p-4 flex flex-col">
                                 <div className="flex-grow bg-black/40 rounded-[3rem] overflow-hidden border border-white/10 relative">
                                    <img src={previewUrl!} className={`w-full h-full object-cover transition-all duration-1000 ${isAnalyzing ? 'blur-md grayscale opacity-40' : ''}`} alt="Source" />
                                    {isAnalyzing && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                                            <div className="w-full h-1 bg-blue-600 absolute top-0 shadow-[0_0_20px_#2563eb] animate-scan"></div>
                                            <Activity size={40} className="text-blue-50 animate-pulse mb-4" />
                                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.6em]">Scanning Geometry...</p>
                                        </div>
                                    )}
                                 </div>
                                 <button 
                                    onClick={executeIntercept}
                                    disabled={isAnalyzing}
                                    className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-[2rem] uppercase tracking-widest text-[10px] shadow-xl shadow-blue-900/40 transform active:scale-95 disabled:opacity-30 border border-white/10"
                                 >
                                     <Search size={18} />
                                     Execute Neural Audit
                                 </button>
                             </div>
                         )}
                    </div>
                </div>

                <div className="lg:col-span-7 h-[600px]">
                    <div className="bg-slate-900 border border-white/5 rounded-[4rem] h-full p-10 flex flex-col relative overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 bg-carbon opacity-5"></div>
                        <div className="flex justify-between items-center mb-10 shrink-0 relative z-10 text-left">
                             <h3 className="text-xl font-black italic uppercase tracking-tighter text-white flex items-center gap-4">
                                 <div className="w-1.5 h-8 bg-blue-600 rounded-full shadow-[0_0_10px_#2563eb]"></div>
                                 Extracted <span className="text-blue-500">Registry</span>
                             </h3>
                             {results && (
                                <div className="flex gap-4">
                                    <select 
                                        value={selectedProjectId}
                                        onChange={e => setSelectedProjectId(e.target.value)}
                                        className="bg-slate-800 border border-white/10 rounded-xl text-white text-[10px] font-black uppercase px-4 focus:ring-0"
                                    >
                                        <option value="">Select Project Node</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
                                    </select>
                                    <button onClick={handleBulkCommit} className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-2 rounded-xl text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95">
                                        Commit All
                                    </button>
                                </div>
                             )}
                        </div>
                        
                        <div className="flex-grow overflow-y-auto custom-scrollbar space-y-4 pr-2 relative z-10 text-left">
                            {results ? (
                                results.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-6 rounded-[2.5rem] bg-white/5 border border-white/5 group hover:bg-white/10 transition-all duration-300">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center font-black text-slate-500 text-[10px] group-hover:border-blue-500/50 border border-transparent transition-all">0{idx+1}</div>
                                            <div className="text-left">
                                                <p className="font-black text-white uppercase italic tracking-tight text-lg leading-none">{item.name}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">{item.quantity} {item.unit}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Target Rate</p>
                                             <p className="text-2xl font-black text-emerald-400 italic tracking-tighter">{formatCurrency(item.suggestedPrice)}</p>
                                        </div>
                                        <button className="ml-6 p-4 bg-white/5 hover:bg-blue-600 text-slate-500 hover:text-white rounded-2xl transition-all transform active:scale-90 border border-white/5">
                                            <ShoppingCart size={18} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20">
                                    <BarChart size={64} className="text-slate-500 mb-6" />
                                    <p className="text-sm font-black uppercase tracking-widest text-slate-500 max-w-xs leading-loose text-center">Initialize document scan to generate digital material telemetry</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="fixed bottom-10 right-10 pointer-events-none opacity-5 -z-10 rotate-90 select-none text-left">
                <span className="text-[180px] font-black tracking-tighter text-white uppercase italic leading-none">BOM_INTERCEPT</span>
            </div>
        </div>
    );
};

export default BOMAnalyzer;
