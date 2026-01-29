
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
// Fix: Import mockData instead of individual mock arrays as they are not exported directly from mockApi.ts
import { mockData } from '../services/mockApi.ts';
import { useCurrency } from '../hooks/useCurrency.tsx';

const ContractorDash: React.FC = () => {
    const [search, setSearch] = useState('');
    const [aiResult, setAiResult] = useState<string | null>(null);
    const [isThinking, setIsThinking] = useState(false);

    // Fix: Access mock products from mockData object
    const mockProducts = mockData.products;

    const handleAISourcing = async () => {
        if (!search) return;
        setIsThinking(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `You are a material sourcing expert in South Africa. Help me find or evaluate: ${search}. Give a concise recommendation based on South African construction market trends.`
            });
            setAiResult(response.text);
        } catch (e) {
            setAiResult("Neural link interrupted. Please try again.");
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Vitals */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass p-6 rounded-3xl rugged-shadow border-l-4 border-amber-500">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Total Project Hold</p>
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter">R 450,000</h3>
                </div>
                <div className="glass p-6 rounded-3xl rugged-shadow border-l-4 border-blue-500">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Active Orders</p>
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter">12 Modules</h3>
                </div>
                <div className="glass p-6 rounded-3xl rugged-shadow border-l-4 border-emerald-500">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Network Health</p>
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter">Optimal</h3>
                </div>
            </div>

            {/* AI Search Bar */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <span className="text-xl">🔍</span>
                </div>
                <input 
                    type="text" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search materials or ask AI for sourcing advice..."
                    className="block w-full bg-slate-900/50 border-2 border-slate-800 focus:border-amber-500 rounded-[2rem] py-6 pl-16 pr-32 text-lg font-medium transition-all outline-none"
                />
                <button 
                    onClick={handleAISourcing}
                    disabled={isThinking}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-2xl text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50"
                >
                    {isThinking ? 'Syncing...' : 'Ask Grid'}
                </button>
            </div>

            {aiResult && (
                <div className="p-6 rounded-[2rem] bg-amber-500/10 border border-amber-500/20 text-amber-100 italic font-medium leading-relaxed animate-fade-in">
                    <span className="font-black uppercase tracking-widest text-[10px] block mb-2 text-amber-500">Neural Intelligence Output:</span>
                    "{aiResult}"
                </div>
            )}

            {/* Catalog Grid */}
            <div className="space-y-6">
                <h3 className="text-xl font-black uppercase tracking-widest text-slate-400 flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-slate-800 rounded-full"></div>
                    National Material Buffer
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {mockProducts.map(product => (
                        <div key={product.id} className="glass rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                            <div className="h-40 overflow-hidden relative">
                                {/* Fix: Use imageUrl instead of image to match Product interface */}
                                <img src={product.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt={product.name} />
                                <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    {product.category}
                                </div>
                            </div>
                            <div className="p-6 text-left">
                                <h4 className="font-bold text-lg truncate mb-1">{product.name}</h4>
                                {/* Fix: Use brand instead of supplierName to match Product interface */}
                                <p className="text-xs text-slate-500 font-medium mb-4 uppercase tracking-wider">{product.brand}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-black text-amber-500 tracking-tighter">R {product.price.toFixed(2)}</span>
                                    <button className="p-3 bg-white text-slate-950 rounded-xl hover:bg-amber-500 transition-colors">
                                        🛒
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ContractorDash;
