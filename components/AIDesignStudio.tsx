
import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useDataContext';
import { useLocalization } from '../hooks/useLocalization';
import { useCurrency } from '../hooks/useCurrency';
import { GoogleGenAI, Type } from '@google/genai';
import { SparklesIcon, ShoppingCartIcon, BriefcaseIcon, PhotoIcon, SwatchIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { Project, Product } from '../types';
import { useToast } from '../hooks/useToast';

const AIDesignStudio: React.FC<{ project?: Project }> = ({ project }) => {
    const { t } = useLocalization();
    const { formatCurrency } = useCurrency();
    const { products, addToCart, projects } = useData();
    const { showToast } = useToast();

    const [prompt, setPrompt] = useState('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);
    const [materialPalette, setMaterialPalette] = useState<{name: string, hex: string}[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState(project?.id || '');

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
            // Using gemini-3-pro-image-preview for high-quality architectural render
            const imageResponse = await ai.models.generateContent({ model: 'gemini-3-pro-image-preview', contents: { parts: [{ text: prompt }] }, config: { imageConfig: { aspectRatio: "16:9", imageSize: "1K" } } });
            const part = imageResponse.candidates?.[0]?.content?.parts.find(p => p.inlineData);
            if (part?.inlineData) setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);

            // Fix: Updated model name to gemini-3-flash-preview for text analysis task
            const textResponse = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Identify 5 construction material keywords and a 4-color palette for design: "${prompt}". Return JSON {keywords: string[], palette: {name, hex}[]}`,
                config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { keywords: { type: Type.ARRAY, items: { type: Type.STRING } }, palette: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, hex: { type: Type.STRING } } } } } } }
            });
            
            // Fix: Ensure correct property access for text
            const data = JSON.parse(textResponse.text || "{}");
            setSuggestedKeywords(data.keywords || []);
            setMaterialPalette(data.palette || []);
        } finally { setIsLoading(false); }
    };

    return (
        <div className="flex flex-col h-full space-y-6 animate-fade-in-up">
             <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 mb-6 flex items-center gap-3">
                    <SparklesIcon className="h-6 w-6 text-blue-500 animate-pulse" />
                    AI Design <span className="text-blue-500">Studio</span>
                </h2>
                <div className="flex flex-col sm:flex-row gap-4 text-left">
                    <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe your high-end design concept (e.g. 'Industrial kitchen with matte black finish and oak accents')..." className="flex-grow p-4 border-2 border-slate-100 rounded-3xl focus:border-blue-500 outline-none text-sm h-32 resize-none" disabled={isLoading} />
                    <button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} className="sm:w-48 bg-slate-900 text-white font-black py-4 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-black disabled:opacity-50 shadow-xl transition-all transform active:scale-95">
                        {isLoading ? <ArrowPathIcon className="h-6 w-6 animate-spin"/> : <SparklesIcon className="h-6 w-6 text-blue-400"/>}
                        <span className="text-[10px] uppercase tracking-widest">Execute Render</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-900 rounded-[3rem] overflow-hidden min-h-[450px] relative shadow-2xl border border-white/5 flex items-center justify-center">
                    {generatedImage ? <img src={generatedImage} className="w-full h-full object-contain" alt="Render"/> : <div className="text-center text-slate-600 uppercase font-black tracking-widest text-xs opacity-50"><PhotoIcon className="h-16 w-16 mx-auto mb-4"/> Awaiting Simulation</div>}
                    {materialPalette.length > 0 && <div className="absolute bottom-6 left-6 right-6 bg-black/40 backdrop-blur-md p-4 rounded-3xl flex justify-around border border-white/10">{materialPalette.map((c, i) => <div key={i} className="w-8 h-8 rounded-full border-2 border-white shadow-lg" style={{backgroundColor: c.hex}} title={c.name}></div>)}</div>}
                </div>
                <div className="bg-white rounded-[3rem] p-8 border border-slate-200 shadow-sm flex flex-col h-full text-left">
                    <h3 className="font-black italic uppercase text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-50 pb-4"><ShoppingCartIcon className="h-5 w-5 text-blue-500"/> Shop the Look</h3>
                    <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                        {matchedProducts.map(p => (
                            <div key={p.id} className="flex gap-4 p-3 rounded-2xl border border-slate-100 hover:border-blue-500/30 hover:bg-blue-50/30 transition-all group">
                                <img src={p.imageUrl} className="w-16 h-16 object-cover rounded-xl bg-slate-100" alt={p.name}/>
                                <div className="flex-grow min-w-0">
                                    <p className="font-bold text-slate-800 text-sm truncate">{p.name}</p>
                                    <p className="text-xs text-slate-500 mb-1">{p.brand}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="font-black text-blue-600 text-sm">{formatCurrency(p.price)}</span>
                                        <button onClick={() => addToCart(p, 1)} className="p-1.5 bg-slate-900 text-white rounded-lg hover:bg-black shadow-md"><ShoppingCartIcon className="h-4 w-4"/></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {matchedProducts.length === 0 && <div className="text-center py-20 text-slate-400 text-[10px] font-black uppercase tracking-widest opacity-50"><SwatchIcon className="h-10 w-10 mx-auto mb-3"/> Scanning Grid...</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIDesignStudio;
