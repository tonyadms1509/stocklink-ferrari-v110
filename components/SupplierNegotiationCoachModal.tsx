
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { 
    BrainCircuit, X, Zap, 
    Target, ShieldCheck, 
    MessageSquareQuote, AlertTriangle,
    TrendingUp
} from 'lucide-react';
import { Conversation } from '../types';

interface SupplierNegotiationCoachModalProps {
    conversation: Conversation;
    currentUserId: string;
    onClose: () => void;
    onUseDraft: (text: string) => void;
}

interface CoachResponse {
    sentiment: string;
    sentimentScore: number; 
    suggestion: string;
    tacticName: string;
    tacticDesc: string;
    draftResponse: string;
}

const SupplierNegotiationCoachModal: React.FC<SupplierNegotiationCoachModalProps> = ({ conversation, currentUserId, onClose, onUseDraft }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [analysis, setAnalysis] = useState<CoachResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const analyzeChat = async () => {
            if (!process.env.API_KEY) {
                setError("Neural Link Offline: API Key Missing");
                setIsLoading(false);
                return;
            }

            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const history = conversation.messages.slice(-15).map(m => 
                    `${m.senderId === currentUserId ? 'Self' : 'Other Node'}: ${m.text}`
                ).join('\n');
                
                const prompt = `
                    You are an elite Sales & Procurement Negotiation Coach for the South African construction grid.
                    Analyze this technical chat history between a supplier and a contractor.
                    
                    Chat History Payload:
                    ${history}
                    
                    Your Task:
                    1. Extract the current "Conversion Probability" (1-100).
                    2. Categorize the tone (e.g. Skeptical, Ready, Price-Checking).
                    3. Select a "Tactical Maneuver" appropriate for this handshake.
                    4. Draft a high-fidelity technical response in a professional South African industrial tone. Avoid markdown.
                    
                    Return valid JSON.
                `;

                const responseSchema = {
                    type: Type.OBJECT,
                    properties: {
                        sentiment: { type: Type.STRING },
                        sentimentScore: { type: Type.NUMBER },
                        suggestion: { type: Type.STRING },
                        tacticName: { type: Type.STRING },
                        tacticDesc: { type: Type.STRING },
                        draftResponse: { type: Type.STRING }
                    },
                    required: ['sentiment', 'sentimentScore', 'suggestion', 'tacticName', 'tacticDesc', 'draftResponse']
                };

                const response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: prompt,
                    config: { responseMimeType: 'application/json', responseSchema }
                });

                setAnalysis(JSON.parse(response.text || '{}'));

            } catch (err) {
                console.error(err);
                setError("Protocol Interference: Could not calibrate logic.");
            } finally {
                setIsLoading(false);
            }
        };

        analyzeChat();
    }, [conversation, currentUserId]);

    return (
        <div className="fixed inset-0 bg-slate-950/95 flex items-center justify-center z-[200] p-4 backdrop-blur-xl animate-fade-in">
            <div className="bg-slate-900 border border-white/10 rounded-[3.5rem] shadow-2xl max-w-lg w-full relative overflow-hidden flex flex-col h-[85vh]">
                <div className="absolute inset-0 bg-carbon opacity-10 pointer-events-none"></div>
                
                <div className="bg-slate-800 p-8 flex justify-between items-center border-b border-white/5 relative z-10">
                    <div className="flex items-center gap-4 text-left">
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-900/40 animate-pulse">
                            <BrainCircuit size={24} className="text-white"/>
                        </div>
                        <div className="text-left">
                             <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] leading-none mb-2">Tactical Engine v6.2</p>
                             <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none">Negotiation <span className="text-blue-500">Coach</span></h2>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/5 hover:bg-red-600 transition-all rounded-xl text-slate-500 hover:text-white"><X size={20}/></button>
                </div>
                
                <div className="p-10 space-y-10 flex-grow overflow-y-auto custom-scrollbar relative z-10 text-left">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                             <div className="w-16 h-16 border-8 border-blue-600 border-t-transparent rounded-full animate-spin mb-10 shadow-[0_0_30px_#2563eb]"></div>
                             <p className="font-black text-slate-500 uppercase tracking-[0.5em] text-xs animate-pulse text-center">Decoding Sentiment Matrix...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-600/10 border-2 border-dashed border-red-500/30 p-8 rounded-[2rem] text-red-400 text-center">
                            <AlertTriangle size={32} className="mx-auto mb-4" />
                            <p className="font-black uppercase tracking-widest text-xs">{error}</p>
                        </div>
                    ) : analysis ? (
                        <div className="space-y-12 animate-fade-in-up">
                            {/* Sentiment Gauge */}
                            <div className="bg-black/40 p-8 rounded-[2.5rem] border border-white/5 shadow-inner flex items-center justify-between">
                                <div className="text-left">
                                    <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-2">Closure Probability</p>
                                    <p className={`text-6xl font-black italic tracking-tighter leading-none ${analysis.sentimentScore > 70 ? 'text-emerald-400' : 'text-blue-500'}`}>{analysis.sentimentScore}%</p>
                                    <p className="text-xs font-bold text-slate-400 uppercase mt-4 italic">{analysis.sentiment}</p>
                                </div>
                                <div className="relative">
                                     <div className={`w-24 h-24 rounded-full border-8 border-white/5 flex items-center justify-center shadow-2xl`}>
                                         <Target size={32} className={analysis.sentimentScore > 70 ? 'text-emerald-500' : 'text-blue-500'} />
                                     </div>
                                     <div className={`absolute inset-0 rounded-full border-8 border-blue-600 border-t-transparent animate-[spin_3s_linear_infinite]`} style={{ clipPath: `polygon(0 0, 100% 0, 100% ${analysis.sentimentScore}%, 0 ${analysis.sentimentScore}%)` }}></div>
                                </div>
                            </div>

                            {/* Tactic Section */}
                            <div className="space-y-6 text-left">
                                <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-3">
                                    <Zap size={14} className="text-red-600"/> Tactical Maneuver
                                </h3>
                                <div className="bg-red-600 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                                     <div className="absolute inset-0 bg-carbon opacity-10"></div>
                                     <div className="absolute top-0 right-0 p-6 opacity-20 transform group-hover:scale-110 transition-transform"><ShieldCheck size={100}/></div>
                                     <h4 className="text-2xl font-black uppercase italic tracking-tighter mb-2 leading-none">{analysis.tacticName}</h4>
                                     <p className="text-sm font-medium text-red-100 leading-relaxed italic">"{analysis.tacticDesc}"</p>
                                </div>
                            </div>

                            {/* Response Section */}
                            <div className="space-y-6 text-left">
                                <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-3">
                                    <MessageSquareQuote size={14} className="text-blue-500"/> Transmission Forge
                                </h3>
                                <div className="bg-slate-950 p-10 rounded-[2.5rem] border border-white/10 text-slate-300 italic font-serif text-lg leading-loose shadow-inner relative">
                                    "{analysis.draftResponse}"
                                </div>
                            </div>

                            <button 
                                onClick={() => { onUseDraft(analysis.draftResponse); onClose(); }}
                                className="w-full bg-white text-slate-950 font-black py-8 rounded-[2rem] shadow-2xl transition-all transform active:scale-95 uppercase tracking-[0.4em] text-xs border-4 border-slate-900"
                            >
                                Commit to Outbox
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default SupplierNegotiationCoachModal;
