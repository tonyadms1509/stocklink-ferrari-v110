import React, { useState, useMemo } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useData } from '../hooks/useDataContext';
import { Tender, TenderBidItem } from '../types';
import { XMarkIcon, SparklesIcon, ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { GoogleGenAI, Type } from '@google/genai';
import { useCurrency } from '../hooks/useCurrency';

interface TenderBidAssistantModalProps {
    tender: Tender;
    onClose: () => void;
    onApplyBid: (items: TenderBidItem[], notes: string) => void;
}

const TenderBidAssistantModal: React.FC<TenderBidAssistantModalProps> = ({ tender, onClose, onApplyBid }) => {
    const { t } = useLocalization();
    const { products } = useData();
    const { formatCurrency } = useCurrency();
    const [isLoading, setIsLoading] = useState(false);
    const [suggestion, setSuggestion] = useState<{ items: any[], notes: string } | null>(null);

    const handleGenerateSuggestion = async () => {
        if (!process.env.API_KEY) return;
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const myCatalog = products.map(p => ({
                id: p.id,
                name: p.name,
                price: p.price,
                brand: p.brand
            }));

            const prompt = `
                You are a strategic sales consultant for a building supply merchant. 
                Analyze this tender and suggest competitive pricing based on our catalog.
                
                Tender Items: ${JSON.stringify(tender.materials)}
                Our Catalog: ${JSON.stringify(myCatalog)}

                Task:
                1. Match tender items to our catalog items.
                2. Suggest a "Winning Price" (usually 5-10% below standard list price for bulk tenders).
                3. Draft professional "Closing Notes" highlighting our reliability and BEE status.

                Return JSON:
                {
                    "items": [
                        { "materialId": "string", "productId": "string", "pricePerUnit": number }
                    ],
                    "notes": "string"
                }
            `;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    items: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                materialId: { type: Type.STRING },
                                productId: { type: Type.STRING },
                                pricePerUnit: { type: Type.NUMBER }
                            },
                            required: ['materialId', 'pricePerUnit']
                        }
                    },
                    notes: { type: Type.STRING }
                },
                required: ['items', 'notes']
            };

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: { responseMimeType: 'application/json', responseSchema }
            });

            const result = JSON.parse(response.text || '{}');
            setSuggestion(result);
        } catch (e) {
            console.error("Tender Assistant Error:", e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/90 z-[150] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-[3rem] shadow-2xl max-w-2xl w-full relative overflow-hidden flex flex-col border border-white/20">
                <div className="bg-slate-900 p-8 flex justify-between items-center text-white">
                    <div className="flex items-center gap-4">
                        <SparklesIcon className="h-8 w-8 text-blue-500 animate-pulse" />
                        <h2 className="text-xl font-black italic uppercase tracking-tighter">TenderBot <span className="text-blue-500">AI</span></h2>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white"><XMarkIcon className="h-6 w-6"/></button>
                </div>

                <div className="p-10 text-left overflow-y-auto custom-scrollbar">
                    {!suggestion ? (
                        <div className="space-y-6">
                            <p className="text-slate-600 font-medium italic leading-relaxed">"Initialize TenderBot to analyze the material schematic and generate a strategic, high-conversion bid based on current node inventory and regional price indices."</p>
                            <button 
                                onClick={handleGenerateSuggestion}
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-3xl flex items-center justify-center gap-4 uppercase tracking-widest text-xs shadow-xl transition-all transform active:scale-95 disabled:opacity-50"
                            >
                                {isLoading ? <ArrowPathIcon className="h-5 w-5 animate-spin"/> : <SparklesIcon className="h-5 w-5 text-blue-200" />}
                                Generate Strategic Bid
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-fade-in-up">
                            <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
                                <h4 className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-4">Neural Strategy Notes</h4>
                                <p className="text-sm text-blue-900 italic font-medium leading-loose">"{suggestion.notes}"</p>
                            </div>
                            
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Pricing Adjustments</h4>
                                {suggestion.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <span className="text-xs font-bold text-slate-700">{tender.materials.find(m => m.materialId === item.materialId)?.productName}</span>
                                        <span className="font-black text-blue-600 italic">{formatCurrency(item.pricePerUnit)}</span>
                                    </div>
                                ))}
                            </div>

                            <button 
                                onClick={() => onApplyBid(suggestion.items, suggestion.notes)}
                                className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl uppercase tracking-widest text-xs shadow-2xl hover:bg-black transition-all transform active:scale-95 border-4 border-slate-800"
                            >
                                Apply Suggestion to Proposal
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TenderBidAssistantModal;