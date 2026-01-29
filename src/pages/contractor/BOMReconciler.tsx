import React, { useState, useRef } from 'react';
import { 
    ArrowLeftIcon, SparklesIcon, DocumentArrowUpIcon, 
    XCircleIcon, ClipboardDocumentIcon, ShieldCheckIcon, 
    PaperAirplaneIcon, ChatBubbleLeftRightIcon,
    ExclamationTriangleIcon, CheckCircleIcon,
    CameraIcon, ArrowPathIcon, CubeIcon
} from '@heroicons/react/24/solid';
import { useLocalization } from '../../hooks/useLocalization.tsx';
import { useData } from '../../hooks/useDataContext.tsx';
import { Project, ProjectMaterial } from '../../types.ts';
import { GoogleGenAI, Type } from '@google/genai';
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

const BOMReconciler: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const { projects, projectMaterials, reconcileMaterials } = useData();
    const { showToast } = useToast();
    
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [matches, setMatches] = useState<any[] | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setMatches(null);
        }
    };

    const executeReconciliation = async () => {
        if (!file || !selectedProjectId || !process.env.API_KEY) return;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;
        const signal = controller.signal;

        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const docPart = await fileToBase64(file);
            const mats = projectMaterials.filter(m => m.projectId === selectedProjectId);

            const prompt = `
                Analyze this delivery note. Match items to the Project BOM provided.
                Project BOM: ${JSON.stringify(mats.map(m => m.productName))}
                
                Identify:
                1. Delivered item name.
                2. Quantity received.
                3. Accuracy compared to BOM (Match/Partial/Missing).
                
                Return JSON array of { name: string, quantity: number, status: string }.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: { parts: [{ inlineData: docPart }, { text: prompt }] },
                config: { responseMimeType: 'application/json' },
                requestOptions: { signal }
            });

            if (signal.aborted) return;

            const result = JSON.parse(response.text || '[]');
            setMatches(result);
            showToast("Audit Complete: Structural Alignment Verified", "success");
        } catch (e: any) {
            const isAbort = signal.aborted || 
                            e.name === 'AbortError' || 
                            e.name === 'CanceledError' ||
                            e.message?.toLowerCase().includes('aborted') || 
                            e.message?.toLowerCase().includes('cancel') ||
                            e.message?.toLowerCase().includes('signal is aborted');

            if (isAbort) {
                console.debug("Reconciliation aborted.");
                return;
            }
            showToast("Neural Bridge Failed", "error");
        } finally {
            if (!signal.aborted) {
                setIsLoading(false);
            }
        }
    };

    const handleConfirm = async () => {
        if (!matches) return;
        await reconcileMaterials(selectedProjectId, matches);
        setMatches(null);
        setFile(null);
        setPreviewUrl(null);
    };

    return (
        <div className="space-y-12 animate-fade-in font-sans pb-24 text-left selection:bg-red-600/30">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-12">
                <div className="text-left">
                    <div className="flex items-center gap-3 mb-4">
                        <ShieldCheckIcon className="h-8 w-8 text-blue-50 animate-pulse shadow-[0_0_20px_#3b82f6]" />
                        <span className="text-[12px] font-black uppercase tracking-[0.6em] italic text-blue-500">B.O.M RECONCILIATION CORE v8.5</span>
                    </div>
                    <h1 className="text-7xl font-black text-white tracking-tighter uppercase italic leading-none">NEURAL <span className="text-blue-600">INTERCEPT</span></h1>
                    <p className="text-slate-500 mt-6 font-mono text-sm tracking-widest uppercase italic max-w-2xl leading-loose text-left">"Autonomous delivery verification. Sync visual sensor feeds from delivery notes to project structural dossiers."</p>
                </div>
                {onBack && (
                    <button onClick={onBack} className="bg-white/5 hover:bg-white/10 text-slate-400 font-black py-4 px-10 rounded-2xl border border-white/10 uppercase tracking-widest text-[10px] transition-all transform active:scale-95">
                        Abort Mission
                    </button>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 border border-white/5 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-carbon opacity-10"></div>
                        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-10 flex items-center gap-4 relative z-10 leading-none">
                            <div className="w-1.5 h-10 bg-blue-600 rounded-full shadow-[0_0_20px_red]"></div>
                            Mission <span className="text-blue-600">Sync</span>
                        </h3>
                        
                        <div className="space-y-8 relative z-10 text-left">
                            <div className="text-left">
                                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3">Target Project Node</label>
                                <select 
                                    value={selectedProjectId} 
                                    onChange={e => setSelectedProjectId(e.target.value)} 
                                    className="w-full p-5 bg-white/5 border-2 border-white/5 rounded-3xl text-white font-bold focus:border-red-600 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Select sector...</option>
                                    {projects.map(p => <option key={p.id} value={p.id} className="bg-slate-900">{p.projectName}</option>)}
                                </select>
                            </div>

                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className={`w-full p-10 border-4 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center transition-all ${file ? 'border-blue-600 bg-blue-600/5' : 'border-white/5 bg-black/20 hover:bg-white/5'}`}
                            >
                                <DocumentArrowUpIcon className={`h-12 w-12 mb-4 ${file ? 'text-blue-400' : 'text-slate-600'}`} />
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{file ? file.name : 'Provision Delivery Note'}</p>
                                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
                            </button>

                            <button 
                                onClick={executeReconciliation}
                                disabled={isLoading || !file || !selectedProjectId}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-7 rounded-[2.5rem] text-[10px] uppercase tracking-[0.4em] shadow-[0_0_50px_rgba(37,99,235,0.3)] transition-all flex items-center justify-center gap-4 transform active:scale-95 disabled:opacity-30 border border-white/10"
                            >
                                {isLoading ? <ArrowPathIcon className="h-6 w-6 animate-spin" /> : <SparklesIcon className="h-6 w-6 text-yellow-300 animate-pulse" />}
                                Initiate Verification
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8">
                     {isLoading ? (
                         <div className="bg-slate-900 rounded-[5rem] border border-white/5 h-[650px] flex items-center justify-center shadow-inner relative overflow-hidden">
                             <div className="absolute inset-0 bg-carbon opacity-20"></div>
                             <div className="text-center animate-pulse">
                                 <div className="w-32 h-32 border-8 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-12 shadow-[0_0_40px_#3b82f6]"></div>
                                 <p className="font-black text-slate-500 uppercase tracking-[1em] text-xs">Scanning Visual Buffers...</p>
                             </div>
                         </div>
                     ) : matches ? (
                         <div className="bg-slate-900 p-12 rounded-[5rem] shadow-2xl border border-white/5 animate-fade-in-up relative overflow-hidden h-[650px] flex flex-col text-left">
                             <div className="absolute inset-0 bg-carbon opacity-5"></div>
                             <div className="relative z-10 flex justify-between items-center mb-12 text-left">
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">Extraction <span className="text-blue-500">Registry</span></h3>
                                <button onClick={handleConfirm} className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 px-12 rounded-3xl shadow-xl transition-all transform active:scale-95 uppercase text-[10px] tracking-widest border border-white/10">Commit to Project</button>
                             </div>
                             
                             <div className="flex-grow overflow-y-auto space-y-4 custom-scrollbar pr-4 relative z-10 text-left">
                                 {matches.map((item: any, i: number) => (
                                     <div key={i} className="flex items-center justify-between p-8 bg-white/5 border border-white/5 rounded-[2.5rem] group hover:bg-white/10 transition-all shadow-inner text-left">
                                         <div className="flex items-center gap-8">
                                             <div className="p-4 bg-blue-600/10 rounded-2xl border border-blue-500/20 group-hover:bg-blue-600 transition-colors">
                                                 <CubeIcon className="h-8 w-8 text-blue-400 group-hover:text-white" />
                                             </div>
                                             <div className="text-left">
                                                 <p className="font-black text-white text-xl uppercase italic tracking-tight">{item.name}</p>
                                                 <p className="text-[10px] text-slate-500 font-black uppercase mt-1 tracking-widest">{item.status}</p>
                                             </div>
                                         </div>
                                         <div className="text-right">
                                              <p className="text-4xl font-black text-blue-500 italic tracking-tighter">x{item.quantity}</p>
                                              <p className="text-[9px] font-black uppercase text-slate-600 mt-1">Units Received</p>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         </div>
                     ) : (
                         <div className="bg-slate-900/50 border-4 border-dashed border-white/5 rounded-[5rem] h-[650px] flex flex-col items-center justify-center text-center opacity-30 group hover:opacity-50 transition-opacity duration-1000">
                             <div className="relative mb-12">
                                <CameraIcon className="h-32 w-32 text-slate-700 group-hover:scale-110 transition-transform duration-1000 shadow-2xl" />
                                <div className="absolute -inset-4 border border-white/5 rounded-full animate-spin-slow"></div>
                             </div>
                             <p className="font-black uppercase tracking-[0.5em] text-sm text-slate-500 max-w-sm leading-loose italic text-left">"Awaiting visual telemetry. Provision a delivery dossier to initiate autonomous node reconciliation."</p>
                         </div>
                     )}
                </div>
            </div>
            
            <div className="fixed bottom-10 right-10 pointer-events-none opacity-[0.03] -z-10 rotate-90 select-none text-left">
                <span className="text-[140px] font-black tracking-tighter text-white uppercase italic leading-none">RECONCILER</span>
            </div>
        </div>
    );
};

export default BOMReconciler;