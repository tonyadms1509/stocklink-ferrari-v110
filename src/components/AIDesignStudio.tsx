import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useDataContext';
import { useLocalization } from '../hooks/useLocalization';
import { useCurrency } from '../hooks/useCurrency';
import { GoogleGenAI, Type } from '@google/genai';
import { SparklesIcon, ShoppingCartIcon, BriefcaseIcon, PhotoIcon, SwatchIcon, ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { Project, Product } from '../types';
import { useToast } from '../hooks/useToast';

const AIDesignStudio: React.FC<{ project?: Project; onClose?: () => void }> = ({ project, onClose }) => {
    const { t } = useLocalization();
    const { formatCurrency } = useCurrency();
    const { products, addToCart, projects } = useData();
    const { showToast } = useToast();

    const [prompt, setPrompt] = useState('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);
    const [materialPalette, setMaterialPalette] = useState<{name: string, hex: string}[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const matchedProducts = useMemo(() => {
        if (suggestedKeywords.length === 0) return [];
        const patterns = suggestedKeywords.map(k => new RegExp(k.replace(/s$/, ''), 'i'));
        return products.map(p => {
            let score = 0;
            const text = `${p.name} ${p.category} ${p.description} ${p.brand}`.toLowerCase();
            patterns.forEach(pattern => { if (pattern.test(text)) score += 2; });
            return { product: p, score };
        }).filter(p => p.score > 0).sort((a, b) => b.score - a.score).map(p => p.product).slice(0, 6);
    }, [products, suggestedKeywords]);

    const handleGenerate = async () => {
        if (!process.env.API_KEY || !prompt.trim()) return;
        setIsLoading(true);
        setGeneratedImage(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const imageResponse = await ai.models.generateContent({ 
                model: 'gemini-3-pro-image-preview', 
                contents: { parts: [{ text: `High-end architectural concept: ${prompt}` }] }, 
                config: { imageConfig: { aspectRatio: "16:9", imageSize: "1K" } } 
            });
            
            const part = imageResponse.candidates?.[0]?.content?.parts.find(p => p.inlineData);
            if (part?.inlineData) setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);

            const textResponse = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Identify 5 construction material keywords and a 4-color palette for design: "${prompt}". Return JSON {keywords: string[], palette: {name, hex}[]}`,
                config: { 
                    responseMimeType: "application/json", 
                    responseSchema: { 
                        type: Type.OBJECT, 
                        properties: { 
                            keywords: { type: Type.ARRAY, items: { type: Type.STRING } }, 
                            palette: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, hex: { type: Type.STRING } }, required: ['name', 'hex'] } } 
                        },
                        required: ['keywords', 'palette']
                    } 
                }
            });
            const data = JSON.parse(textResponse.text || "{}");
            setSuggestedKeywords(data.keywords || []);
            setMaterialPalette(data.palette || []);
        } finally { setIsLoading(false); }
    };

    return (
        <div className="flex flex-col space-y-12 animate-fade-in-up font-sans text-left">
             <div className="bg-slate-900 p-12 rounded-[4rem] shadow-2xl border border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-carbon opacity-10"></div>
                <div className="flex justify-between items-start mb-8 relative z-10">
                    <div>
                        <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white flex items-center gap-4 leading-none">
                            <SparklesIcon className="h-10 w-10 text-blue-500 animate-pulse" />
                            NEURAL <span className="text-blue-500">STUDIO</span>
                        </h2>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.6em] mt-3">High-Fidelity Project Visualization Module</p>
                    </div>
                    {onClose && <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-500 transition-colors"><XMarkIcon className="h-6 w-6"/></button>}
                </div>

                <div className="flex flex-col lg:flex-row gap-8 relative z-10">
                    <textarea 
                        value={prompt} 
                        onChange={e => setPrompt(e.target.value)} 
                        placeholder="Describe architectural vision (e.g. 'Modern industrial lobby with glass, steel, and exposed brick')..." 
                        className="flex-grow p-8 bg-black/40 border-2 border-white/5 rounded-[2.5rem] focus:border-blue-600 outline-none text-white text-lg font-medium h-48 resize-none shadow-inner" 
                        disabled={isLoading} 
                    />
                    <button 
                        onClick={handleGenerate} 
                        disabled={isLoading || !prompt.trim()} 
                        className="lg:w-64 bg-blue-600 text-white font-black py-10 rounded-[3rem] flex flex-col items-center justify-center gap-4 hover:bg-blue-700 disabled:opacity-50 shadow-[0_0_50px_rgba(37,99,235,0.3)] transition-all transform active:scale-95 border border-white/10"
                    >
                        {isLoading ? <ArrowPathIcon className="h-10 w-10 animate-spin"/> : <SparklesIcon className="h-10 w-10 text-blue-200"/>}
                        <span className="text-xs uppercase tracking-[0.4em]">Initialize Simulation</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 bg-slate-900 rounded-[5rem] overflow-hidden min-h-[550px] relative shadow-[0_0_80px_rgba(0,0,0,0.5)] border-4 border-slate-950 flex items-center justify-center group">
                    {generatedImage ? (
                        <img src={generatedImage} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-2000" alt="Render"/>
                    ) : (
                        <div className="text-center text-slate-800 uppercase font-black tracking-[1em] text-xs opacity-50 flex flex-col items-center gap-6">
                            <div className="w-32 h-32 border-8 border-slate-800 border-t-slate-700 rounded-full animate-spin-slow"></div>
                            Awaiting Simulation Data
                        </div>
                    )}
                    
                    {materialPalette.length > 0 && (
                        <div className="absolute bottom-10 left-10 right-10 bg-black/40 backdrop-blur-3xl p-8 rounded-[3rem] flex justify-between items-center border border-white/10 shadow-2xl animate-fade-in-up">
                            {materialPalette.map((c, i) => (
                                <div key={i} className="flex flex-col items-center gap-3 group/color cursor-pointer">
                                    <div className="w-12 h-12 rounded-2xl border-4 border-white/20 shadow-2xl transition-transform group-hover/color:scale-125" style={{backgroundColor: c.hex}}></div>
                                    <span className="text-[8px] font-black text-white uppercase tracking-widest opacity-0 group-hover/color:opacity-100 transition-opacity">{c.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-950 rounded-[4rem] p-10 border border-white/5 shadow-2xl flex flex-col h-full relative overflow-hidden">
                         <div className="absolute inset-0 bg-carbon opacity-5"></div>
                         <h3 className="font-black italic uppercase text-white text-xl mb-10 flex items-center gap-4 border-b border-white/5 pb-6">
                            <ShoppingCartIcon className="h-6 w-6 text-blue-500"/> 
                            Grid <span className="text-blue-500">Inventory Sync</span>
                         </h3>
                         
                         <div className="space-y-4 flex-grow overflow-y-auto custom-scrollbar pr-2">
                            {matchedProducts.map(p => (
                                <div key={p.id} className="flex gap-6 p-5 rounded-[2rem] bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all group cursor-pointer relative overflow-hidden">
                                    <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <img src={p.imageUrl} className="w-20 h-20 object-cover rounded-2xl bg-slate-800 border border-white/5 relative z-10" alt=""/>
                                    <div className="flex-grow min-w-0 flex flex-col justify-between relative z-10 text-left">
                                        <div>
                                            <p className="font-black text-white text-sm uppercase tracking-tight truncate italic">{p.name}</p>
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{p.brand}</p>
                                        </div>
                                        <div className="flex justify-between items-center mt-4">
                                            <span className="font-black text-blue-500 text-lg tracking-tighter">{formatCurrency(p.price)}</span>
                                            <button 
                                                onClick={() => { addToCart(p, 1); showToast("Handshake Committed", "success"); }} 
                                                className="p-3 bg-white text-slate-950 rounded-xl hover:bg-blue-600 hover:text-white transition-all transform active:scale-90"
                                            >
                                                <ShoppingCartIcon className="h-5 w-5"/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {matchedProducts.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20">
                                    <SwatchIcon className="h-20 w-20 text-slate-500 mb-6"/>
                                    <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-500">Scanning National Grid for Match Nodes...</p>
                                </div>
                            )}
                         </div>
                    </div>
                </div>
            </div>
            
            <div className="fixed bottom-10 left-10 pointer-events-none opacity-[0.02] -z-10 rotate-90 select-none">
                <span className="text-[160px] font-black tracking-tighter text-white uppercase italic">ARCH_NEURAL</span>
            </div>
        </div>
    );
};

export default AIDesignStudio;
