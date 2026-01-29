import React, { useState, useRef, useEffect } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { useData } from '../../hooks/useDataContext';
import { Product, QuoteRequest, UserRole, QuoteStatus } from '../../types';
import { 
    XMarkIcon, CameraIcon, SparklesIcon, 
    CheckCircleIcon, ExclamationTriangleIcon, 
    ArrowRightIcon, PlusIcon, DocumentArrowUpIcon,
    ArrowPathIcon,
    ShoppingCartIcon,
    DocumentTextIcon
} from '@heroicons/react/24/solid';
import { GoogleGenAI, Type, Part } from '@google/genai';
import { useToast } from '../../hooks/useToast';
import { useCurrency } from '../../hooks/useCurrency';
import EmptyState from '../../components/EmptyState';

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

const BOMAssistant: React.FC<{ onNavigate: (tab: any) => void }> = ({ onNavigate }) => {
    const { t } = useLocalization();
    const { products, suppliers } = useData();
    const { formatCurrency } = useCurrency();
    const { showToast } = useToast();
    
    const [step, setStep] = useState<'upload' | 'processing' | 'review'>('upload');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [extractedItems, setExtractedItems] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError(null);
        }
    };

    const processMandate = async () => {
        if (!imageFile || !process.env.API_KEY) {
            setError("Mission Failed: API credentials not found.");
            return;
        }

        setStep('processing');
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const { mimeType, data } = await fileToBase64(imageFile);
            const imagePart: Part = { inlineData: { mimeType, data } };
            
            // Context of own products for matching
            const myProducts = products.map(p => `${p.id}: ${p.name} (R${p.price})`).join('\n');

            const prompt = `
                You are a high-performance procurement auditor for a building supplier. 
                Analyze this HANDWRITTEN or TYPED contractor material mandate.
                
                1. Extract material names, quantities, and units.
                2. Try to match items with our catalog provided below.
                3. If an item is not in our catalog, still list it but note as "UNMATCHED".
                
                Catalog:
                ${myProducts}

                Return a JSON array of objects:
                [
                    { "name": "string", "quantity": number, "unit": "string", "matchedProductId": "id or null", "estimatedPrice": number }
                ]
            `;

            const responseSchema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        quantity: { type: Type.NUMBER },
                        unit: { type: Type.STRING },
                        matchedProductId: { type: Type.STRING, nullable: true },
                        estimatedPrice: { type: Type.NUMBER }
                    },
                    required: ['name', 'quantity', 'unit']
                }
            };

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: { parts: [imagePart, { text: prompt }] },
                config: { responseMimeType: 'application/json', responseSchema }
            });

            setExtractedItems(JSON.parse(response.text || '[]'));
            setStep('review');
            showToast("Mandate Decrypted", "success");
        } catch (err: any) {
            console.error("BOM process error", err);
            setError("Neural link interrupted. Re-provision sensor data.");
            setStep('upload');
        }
    };

    const handleCommitToQuote = async () => {
        showToast("Directing to Quote Desk...", "info");
        onNavigate('quotes');
    };

    return (
        <div className="space-y-10 font-sans pb-20 text-left">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-12">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <SparklesIcon className="h-6 w-6 text-purple-600 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-purple-500">Neural Digitizing Core v100</span>
                    </div>
                    <h2 className="text-7xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">B.O.M <span className="text-purple-600">ASSISTANT</span></h2>
                    <p className="text-slate-500 mt-4 font-mono text-sm tracking-widest uppercase italic">"Autonomous intake of handwritten or typed contractor mandates."</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 flex-grow overflow-hidden min-h-[600px]">
                <div className="lg:col-span-5 h-full">
                    <div className="bg-slate-900 border border-white/5 rounded-[4rem] h-full relative overflow-hidden flex flex-col shadow-2xl p-4">
                         <div className="absolute inset-0 bg-carbon opacity-10"></div>
                         {step === 'upload' ? (
                             <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-grow border-4 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-purple-600/30 transition-all group z-10"
                             >
                                 <div className="bg-slate-800 p-8 rounded-full mb-6 group-hover:bg-purple-600 transition-all shadow-xl"><DocumentArrowUpIcon className="h-12 w-12 text-slate-500 group-hover:text-white"/></div>
                                 <p className="text-xl font-black text-white uppercase italic tracking-tighter">Initialize Dossier Intake</p>
                                 <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest uppercase">Select Mandate Image or PDF</p>
                                 <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />
                             </div>
                         ) : (
                             <div className="relative flex-grow bg-black rounded-[3rem] overflow-hidden flex items-center justify-center border border-white/10 shadow-inner z-10">
                                 <img src={previewUrl!} className={`max-w-full max-h-full object-contain ${step === 'processing' ? 'opacity-40 grayscale blur-sm' : 'opacity-80'}`} alt="Mandate" />
                                 {step === 'processing' && (
                                     <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                                         <div className="w-full h-1 bg-purple-600 absolute top-0 shadow-[0_0_20px_#7c3aed] animate-scan"></div>
                                         <div className="w-20 h-20 border-8 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                                         <p className="mt-8 font-black uppercase text-purple-500 tracking-[0.4em] text-xs">Decrypting Mandate...</p>
                                     </div>
                                 )}
                             </div>
                         )}
                         
                         {imageFile && step === 'upload' && (
                             <button 
                                onClick={processMandate}
                                className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-6 rounded-[2.5rem] uppercase tracking-widest text-[10px] shadow-2xl shadow-purple-900/40 transition-all transform active:scale-95 border border-white/10 z-10"
                             >
                                Execute Neural Intercept
                             </button>
                         )}
                    </div>
                </div>

                <div className="lg:col-span-7 h-full flex flex-col">
                    {step === 'review' ? (
                        <div className="bg-white border border-slate-200 rounded-[4rem] h-full p-10 flex flex-col shadow-2xl relative overflow-hidden animate-fade-in-up">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-600/5 to-transparent opacity-50"></div>
                            <div className="flex justify-between items-center mb-10 shrink-0 relative z-10">
                                 <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-4 leading-none">
                                     <div className="w-1.5 h-10 bg-purple-600 rounded-full shadow-[0_0_10px_#7c3aed]"></div>
                                     Registry <span className="text-purple-600">Buffer</span>
                                 </h3>
                                 <button onClick={handleCommitToQuote} className="bg-slate-950 hover:bg-black text-white font-black px-8 py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl transition-all transform active:scale-95 border-4 border-slate-800">
                                     Commit to Quote Desk
                                 </button>
                            </div>
                            
                            <div className="flex-grow overflow-y-auto custom-scrollbar space-y-4 pr-2 relative z-10">
                                {extractedItems.map((item, idx) => (
                                    <div key={idx} className={`p-6 rounded-[2.5rem] border flex items-center justify-between group transition-all duration-300 ${item.matchedProductId ? 'bg-emerald-50/50 border-emerald-500/20' : 'bg-amber-50/50 border-amber-500/20'}`}>
                                        <div className="flex items-center gap-6">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs border ${item.matchedProductId ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>{idx + 1}</div>
                                            <div>
                                                <p className="font-black text-slate-900 text-lg uppercase italic tracking-tight">{item.name}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.quantity} {item.unit}</span>
                                                     {item.matchedProductId ? (
                                                         <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1"><CheckCircleIcon className="h-3 w-3"/> Matched to ID: {item.matchedProductId}</span>
                                                     ) : (
                                                         <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1"><ExclamationTriangleIcon className="h-3 w-3"/> Custom Sourcing Req</span>
                                                     )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Catalog Point</p>
                                            <p className="text-2xl font-black text-slate-900 tracking-tighter">{item.estimatedPrice ? formatCurrency(item.estimatedPrice) : '-'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-10 pt-8 border-t border-slate-100 flex justify-between items-center relative z-10">
                                 <button onClick={() => setStep('upload')} className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 hover:text-red-600 transition-colors">Discard Batch</button>
                                 <p className="text-[10px] font-bold text-slate-400 italic">Total Items Extracted: {extractedItems.length}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-900/40 border-8 border-dashed border-white/5 rounded-[4rem] h-full flex flex-col items-center justify-center text-center opacity-30 group hover:opacity-50 transition-opacity duration-1000">
                             <div className="relative mb-12">
                                <DocumentTextIcon className="h-24 w-24 text-slate-600 group-hover:scale-110 transition-transform duration-1000" />
                                <div className="absolute -inset-4 border border-white/5 rounded-full animate-spin-slow"></div>
                             </div>
                             <p className="font-black uppercase tracking-[0.5em] text-xs text-slate-500 max-w-sm leading-loose">"Neural Core Awaiting Mandate Dossier. Synchronize sensor feed to begin autonomous digitization protocol."</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="fixed bottom-10 right-10 pointer-events-none opacity-5 -z-10 rotate-90 select-none">
                <span className="text-[140px] font-black tracking-tighter text-white uppercase italic leading-none">NEURAL DIGITIZING</span>
            </div>
            <style>{`
                @keyframes scan { 0% { top: 0%; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
            `}</style>
        </div>
    );
};

export default BOMAssistant;