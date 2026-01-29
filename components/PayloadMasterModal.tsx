
import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Order } from '../types';
import { 
    X, Sparkles, Truck, AlertTriangle, 
    CheckCircle, Cube, ArrowPath, ShieldCheck
} from 'lucide-react';

interface PayloadMasterModalProps {
    order: Order;
    onClose: () => void;
}

interface PackingStrategy {
    arrangement: string;
    safetyWarnings: string[];
    efficiencyScore: number;
    weightDistribution: string;
}

const PayloadMasterModal: React.FC<PayloadMasterModalProps> = ({ order, onClose }) => {
    const [vehicleType, setVehicleType] = useState('1 Ton Bakkie');
    const [isLoading, setIsLoading] = useState(false);
    const [strategy, setStrategy] = useState<PackingStrategy | null>(null);

    const handleOptimize = async () => {
        if (!process.env.API_KEY) return;
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const itemsContext = order.items.map(i => ({
                name: i.name,
                qty: i.quantity,
                weight: i.weightKg || 'Approx. 5kg',
                category: i.category
            }));

            const prompt = `
                You are a logistics and payload specialist for a building supply merchant. 
                Optimize the packing arrangement for this construction delivery order.
                Vehicle Chassis: ${vehicleType}
                Items to Pack: ${JSON.stringify(itemsContext)}

                Provide a technical response in JSON:
                1. "arrangement": A step-by-step description of the safest and most space-efficient packing protocol.
                2. "safetyWarnings": Array of 3 specific technical risks (e.g., center of gravity shift, load securing, chemical segregation).
                3. "efficiencyScore": A number from 0-100 reflecting volumetric utilization.
                4. "weightDistribution": Identifying the primary mass sector (Front, Center, Rear, Level).
            `;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    arrangement: { type: Type.STRING },
                    safetyWarnings: { type: Type.ARRAY, items: { type: Type.STRING } },
                    efficiencyScore: { type: Type.NUMBER },
                    weightDistribution: { type: Type.STRING }
                },
                required: ['arrangement', 'safetyWarnings', 'efficiencyScore', 'weightDistribution']
            };

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: { responseMimeType: 'application/json', responseSchema }
            });

            setStrategy(JSON.parse(response.text || '{}'));
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/95 flex items-center justify-center z-[150] p-4 animate-fade-in backdrop-blur-md">
            <div className="bg-white rounded-[3rem] shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden border border-slate-200">
                <div className="p-8 border-b flex justify-between items-center bg-slate-900 text-white shrink-0">
                    <div className="flex flex-col items-start">
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-4 leading-none">
                            <Sparkles className="h-8 w-8 text-blue-500 animate-pulse"/> PAYLOAD <span className="text-blue-500">MASTER</span>
                        </h2>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Logistics Optimization v1.2</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl hover:bg-red-600 transition-all"><X className="h-6 w-6"/></button>
                </div>

                <div className="p-10 overflow-y-auto custom-scrollbar flex-grow text-left">
                    {!strategy && !isLoading && (
                        <div className="space-y-10 animate-fade-in-up">
                            <div className="text-left">
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 ml-2">Operational Chassis Node</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {['1 Ton Bakkie', '3 Ton Truck', '8 Ton Truck', 'Flatbed Trailer'].map(v => (
                                        <button 
                                            key={v}
                                            onClick={() => setVehicleType(v)}
                                            className={`p-6 rounded-[2rem] border-2 font-black text-xs uppercase tracking-widest transition-all ${vehicleType === v ? 'bg-blue-600 border-blue-600 text-white shadow-2xl shadow-blue-900/40 scale-105' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-blue-400'}`}
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleOptimize}
                                className="w-full bg-slate-950 text-white font-black py-8 rounded-[2.5rem] shadow-2xl transform active:scale-95 transition-all flex items-center justify-center gap-6 uppercase tracking-[0.4em] text-xs border-4 border-slate-800"
                            >
                                <Truck className="h-6 w-6 text-blue-400 animate-pulse"/>
                                Initialize Neural Packing
                            </button>
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="relative mb-12">
                                <div className="w-32 h-32 border-8 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                                <Sparkles className="h-10 w-10 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"/>
                            </div>
                            <p className="font-black text-slate-900 uppercase tracking-tighter text-3xl italic">Calculating Mass Centers...</p>
                            <p className="text-slate-400 font-mono text-[10px] font-black uppercase tracking-[0.4em] mt-4">Simulating Inertial Displacement_v8.5</p>
                        </div>
                    )}

                    {strategy && (
                        <div className="space-y-12 animate-fade-in-up text-left">
                            <div className="grid grid-cols-2 gap-8 text-left">
                                <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden group text-left">
                                     <div className="absolute inset-0 bg-carbon opacity-10 pointer-events-none"></div>
                                     <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-2">Efficiency Rating</p>
                                     <p className="text-7xl font-black text-emerald-400 italic tracking-tighter drop-shadow-lg">{strategy.efficiencyScore}%</p>
                                </div>
                                <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-200 shadow-inner text-left">
                                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-2">Primary Mass Vector</p>
                                    <p className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">{strategy.weightDistribution}</p>
                                    <div className="mt-6 flex gap-1">
                                         {[1,2,3,4,5].map(i => <div key={i} className={`h-1.5 flex-grow rounded-full ${i <= 3 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>)}
                                    </div>
                                </div>
                            </div>

                            <div className="border-l-8 border-blue-600 pl-10 text-left">
                                <h4 className="font-black text-slate-900 uppercase text-xs tracking-[0.3em] mb-6 underline decoration-blue-600 decoration-4 underline-offset-8">Neural Packing Protocol</h4>
                                <p className="text-xl text-slate-700 italic leading-loose font-serif">"{strategy.arrangement}"</p>
                            </div>

                            <div className="bg-red-50 p-10 rounded-[4rem] border border-red-100 shadow-sm relative overflow-hidden text-left">
                                <div className="absolute top-0 right-0 p-8 opacity-5 text-red-600"><AlertTriangle size={128} /></div>
                                <h4 className="font-black text-red-900 uppercase text-[10px] tracking-widest mb-8 flex items-center gap-3">
                                    <ShieldCheck className="h-5 w-5 text-red-600"/> Stability Warnings
                                </h4>
                                <ul className="space-y-6 text-left">
                                    {strategy.safetyWarnings.map((w, i) => (
                                        <li key={i} className="text-sm text-red-800 font-bold flex items-start gap-5">
                                            <div className="w-2 h-2 rounded-full bg-red-600 mt-1.5 shrink-0 shadow-[0_0_8px_red]"></div>
                                            "{w}"
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex gap-4 pt-10 border-t border-slate-100">
                                <button onClick={() => setStrategy(null)} className="flex-1 py-5 bg-slate-100 hover:bg-white text-slate-500 font-black uppercase text-[10px] tracking-widest rounded-3xl transition-all">Abandon Schematic</button>
                                <button onClick={onClose} className="flex-2 bg-slate-950 text-white font-black py-5 px-12 rounded-3xl uppercase tracking-widest text-[10px] shadow-2xl hover:bg-black transition-all border-4 border-slate-800">Seal Payload Dossier</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PayloadMasterModal;
