import React, { useState, useRef, useEffect } from 'react';
import { 
    ScaleIcon, ShieldCheckIcon, PaperAirplaneIcon, ArrowPathIcon,
    GlobeAmericasIcon, SparklesIcon, IdentificationIcon
} from '@heroicons/react/24/solid';
import { GoogleGenAI } from '@google/genai';
import { useToast } from '../../hooks/useToast';
import { BuildingStandard, Jurisdiction } from '../../types';
import { useData } from '../../hooks/useDataContext';

const MessageBubble: React.FC<{ role: 'user' | 'model', text: string }> = ({ role, text }) => (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
        <div className={`max-w-[85%] p-8 rounded-[3rem] shadow-2xl ${role === 'user' ? 'bg-red-600 text-white rounded-tr-none' : 'bg-slate-900 border border-white/10 text-slate-100 rounded-tl-none'}`}>
             {role === 'model' && (
                 <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
                    <div className="w-1.5 h-6 bg-blue-600 rounded-full shadow-[0_0_10px_#2563eb]"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Neural Logic Pulse: SANS Protocol</span>
                 </div>
             )}
             <p className="text-base leading-loose whitespace-pre-wrap font-medium text-left italic">"{text}"</p>
        </div>
    </div>
);

const RegulatoryPulse: React.FC = () => {
    const { showToast } = useToast();
    const { isRuggedMode } = useData();
    const [input, setInput] = useState('');
    const [jurisdiction, setJurisdiction] = useState<Jurisdiction>(Jurisdiction.SouthAfrica);
    const [standard, setStandard] = useState<BuildingStandard>(BuildingStandard.SANS10400);
    const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMessages([{ role: 'model', text: "Transcontinental Bridge active. I am an expert in international building standards and regulatory code. Current jurisdiction set to South Africa (SANS 10400). Specify your technical query for structural, fire, or energy efficiency compliance." }]);
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleQuery = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !process.env.API_KEY) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                You are the Transcontinental Regulatory AI for StockLink. 
                Expert in Jurisdiction: ${jurisdiction} and Standard: ${standard}.
                Answer this construction inquiry with high technical precision. 
                Reference specific code sections (e.g. ASTM C150, SANS 10400-XA, Eurocode 2).
                User: "${userMsg}"
                Tone: Official, technical, reassuring. Max 5 sentences. No markdown formatting.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt
            });

            setMessages(prev => [...prev, { role: 'model', text: response.text || "Neural handshake failed." }]);
        } catch (e) {
            showToast("Global Pulse Offline", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="pb-12 max-w-6xl mx-auto flex flex-col font-sans selection:bg-red-600/30 min-h-[700px] flex-grow">
             <div className="flex flex-col md:flex-row justify-between items-end gap-10 border-b border-white/5 pb-12 mb-12 text-left">
                <div className="text-left">
                    <div className="flex items-center gap-3 mb-4 text-blue-500">
                         <GlobeAmericasIcon className="h-8 w-8 animate-pulse shadow-[0_0_20px_#2563eb]" />
                         <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500">Universal Compliance Hub v80.5</span>
                    </div>
                    <h1 className={`text-7xl font-black tracking-tighter italic uppercase leading-none ${isRuggedMode ? 'text-black' : 'text-white'}`}>REGULATORY <span className="text-blue-600">PULSE</span></h1>
                </div>
                
                <div className={`flex items-center gap-6 p-2 rounded-[2rem] border backdrop-blur-xl shadow-2xl transition-all ${isRuggedMode ? 'bg-slate-50 border-black border-2' : 'bg-white/5 border-white/5'}`}>
                    <div className="flex flex-col gap-1 px-4 text-left">
                        <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Region</label>
                        <select 
                            value={jurisdiction}
                            onChange={(e) => setJurisdiction(e.target.value as Jurisdiction)}
                            className="bg-transparent border-none focus:ring-0 text-white font-black text-xs uppercase italic tracking-tighter appearance-none cursor-pointer hover:text-blue-400 transition-colors"
                        >
                            {Object.entries(Jurisdiction).map(([k, v]) => <option key={v} value={v} className="bg-slate-900">{k}</option>)}
                        </select>
                    </div>
                    <div className={`w-px h-10 ${isRuggedMode ? 'bg-black' : 'bg-white/10'}`}></div>
                    <div className="flex flex-col gap-1 px-4 text-left">
                        <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Logic</label>
                        <select 
                            value={standard}
                            onChange={(e) => setStandard(e.target.value as BuildingStandard)}
                            className="bg-transparent border-none focus:ring-0 text-white font-black text-xs uppercase italic tracking-tighter appearance-none cursor-pointer hover:text-blue-400 transition-colors"
                        >
                            {Object.entries(BuildingStandard).map(([k, v]) => <option key={v} value={v} className="bg-slate-900">{k}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className={`flex-grow rounded-[4rem] border shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden relative backdrop-blur-md transition-all ${isRuggedMode ? 'bg-white border-black border-2' : 'bg-slate-900/50 border-white/5'}`}>
                <div className="absolute inset-0 bg-carbon opacity-5 pointer-events-none"></div>
                <div className="flex-grow overflow-y-auto p-12 space-y-10 custom-scrollbar relative z-10">
                    {messages.map((m, i) => <MessageBubble key={i} role={m.role} text={m.text} />)}
                    {isLoading && (
                        <div className="flex justify-start animate-pulse">
                            <div className="bg-slate-900 p-8 rounded-[3rem] rounded-tl-none border border-white/5 flex items-center gap-6 shadow-2xl">
                                 <ArrowPathIcon className="h-8 w-8 text-blue-500 animate-spin shadow-[0_0_15px_#2563eb]"/>
                                 <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">Neural Logic Interfacing...</span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef}></div>
                </div>

                <div className={`p-10 border-t backdrop-blur-2xl z-20 ${isRuggedMode ? 'bg-slate-50 border-black' : 'bg-black/40 border-white/5'}`}>
                     <form onSubmit={handleQuery} className="relative">
                         <input 
                            type="text" 
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder={`Inquire regarding ${standard} compliance metrics...`}
                            className={`w-full p-8 pr-24 border-2 rounded-[3rem] font-black italic text-xl placeholder-slate-700 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all shadow-inner tracking-tighter ${isRuggedMode ? 'bg-white border-black text-black' : 'bg-white/5 border-white/5 text-white'}`}
                         />
                         <button 
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-6 bg-red-600 text-white rounded-[2rem] shadow-2xl hover:bg-red-500 transition-all disabled:opacity-30 border border-white/10 group active:scale-90"
                         >
                            <PaperAirplaneIcon className="h-8 w-8 -rotate-90 translate-x-1 group-hover:scale-110 transition-transform"/>
                         </button>
                     </form>
                </div>
            </div>
            
            <div className={`fixed bottom-10 left-10 pointer-events-none opacity-[0.03] -z-10 rotate-90 select-none text-left ${isRuggedMode ? 'text-black' : 'text-white'}`}>
                <span className="text-[160px] font-black tracking-tighter uppercase italic leading-none">REGULATORY_HUB</span>
            </div>
        </div>
    );
};

export default RegulatoryPulse;