
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
// Fix: Import mockData instead of individual mock arrays as they are not exported directly from mockApi.ts
import { mockData } from '../services/mockApi.ts';
import { useCurrency } from '../hooks/useCurrency.tsx';

const SupplierDash: React.FC = () => {
    const [marketAnalysis, setMarketAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Fix: Access mock arrays from the exported mockData object
    const mockProducts = mockData.products;
    const mockOrders = mockData.orders;

    const runMarketAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: "Based on current South African economic trends and the construction sector in 2025, which building materials are expected to increase in demand? Provide a tactical list for a warehouse manager."
            });
            setMarketAnalysis(response.text);
        } catch (e) {
            setMarketAnalysis("Pulse connection lost.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="space-y-10 animate-fade-in">
            <div className="flex justify-between items-end">
                <div className="text-left">
                    <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none">Warehouse <span className="text-amber-500">Control</span></h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">Node v42.1 Active</p>
                </div>
                <button 
                    onClick={runMarketAnalysis}
                    disabled={isAnalyzing}
                    className="px-6 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3"
                >
                    {isAnalyzing ? (
                        <div className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin"></div>
                    ) : '⚡'}
                    Demand Analytics
                </button>
            </div>

            {marketAnalysis && (
                <div className="p-8 rounded-[2.5rem] bg-indigo-500/10 border border-indigo-500/20 text-indigo-100 font-medium leading-loose animate-fade-in relative overflow-hidden text-left">
                    <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl italic font-black">AI</div>
                    <span className="font-black uppercase tracking-widest text-[10px] block mb-4 text-indigo-400">Tactical Market Briefing:</span>
                    <div className="whitespace-pre-wrap">{marketAnalysis}</div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Inventory List */}
                <div className="lg:col-span-8 space-y-6 text-left">
                    <h3 className="text-lg font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-slate-800 rounded-full"></div>
                        Stock Ledger
                    </h3>
                    <div className="bg-slate-900/50 rounded-[2.5rem] border border-slate-800 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-950/50 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-800">
                                <tr>
                                    <th className="px-8 py-4">Module</th>
                                    <th className="px-8 py-4">Price</th>
                                    <th className="px-8 py-4">Load</th>
                                    <th className="px-8 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {mockProducts.map(p => (
                                    <tr key={p.id} className="group hover:bg-white/5 transition-colors">
                                        <td className="px-8 py-5">
                                            <p className="font-bold text-slate-200">{p.name}</p>
                                            <p className="text-[10px] uppercase font-black text-slate-600 tracking-wider">{p.category}</p>
                                        </td>
                                        <td className="px-8 py-5 font-mono text-sm text-slate-400">R {p.price}</td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="bg-amber-500 h-full w-3/4"></div>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-500">{p.stock}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Adjust</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Pipeline */}
                <div className="lg:col-span-4 space-y-6 text-left">
                    <h3 className="text-lg font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-slate-800 rounded-full"></div>
                        Pipeline
                    </h3>
                    <div className="space-y-4">
                        {mockOrders.map(order => (
                            <div key={order.id} className="glass p-6 rounded-[2rem] rugged-shadow group hover:border-amber-500/50 transition-all border border-slate-800">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="px-2 py-0.5 rounded-md bg-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-400">#{order.id}</div>
                                    <div className={`w-2 h-2 rounded-full ${order.status === 'delivered' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                                </div>
                                {/* Fix: Use orderNumber instead of productName to match the Order interface */}
                                <p className="font-bold text-slate-200">Order #{order.orderNumber}</p>
                                <p className="text-xs text-slate-500 mt-1 uppercase font-black tracking-widest">{order.contractorName}</p>
                                <div className="mt-6 flex justify-between items-center pt-4 border-t border-slate-800">
                                    <span className="font-black text-amber-500 tracking-tighter">R {order.total}</span>
                                    <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Manifest</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupplierDash;
