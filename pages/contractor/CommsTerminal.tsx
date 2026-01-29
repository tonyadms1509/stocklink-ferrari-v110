import React, { useState } from 'react';
import { useData } from '../../hooks/useDataContext.tsx';
import { useAuth } from '../../hooks/useAuth.tsx';
import { GoogleGenAI } from '@google/genai';
import { 
    Mail, Send, Sparkles, Plus, 
    FileText, User, Calendar, 
    ChevronRight, ArrowLeft, 
    CheckCircle, MessageSquare, 
    Paperclip, Trash2, 
    RefreshCcw, Terminal, Activity
} from 'lucide-react';
import { useToast } from '../../hooks/useToast.tsx';

const CommsTerminal: React.FC = () => {
    const { user } = useAuth();
    const { projects = [] } = useData();
    const { showToast } = useToast();
    const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeProtocol, setActiveProtocol] = useState('Progress Update');

    const protocols = [
        'Progress Update',
        'Delay Notification',
        'Settlement Request',
        'Technical Query',
        'Final Handover'
    ];

    const generateNeuralDraft = async () => {
        if (!process.env.API_KEY || !selectedProjectId) {
            showToast("Protocol Parameters Missing", "error");
            return;
        }
        setIsLoading(true);

        const project = projects.find(p => p.id === selectedProjectId);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Draft a high-fidelity, professional construction email.
                Protocol: ${activeProtocol}.
                Project: ${project?.projectName}.
                Recipient Node (Client): ${project?.clientName}.
                Contractor Unit: ${user?.name}.
                
                Requirements:
                - Tone: Professional, Authoritative, Reassuring.
                - Location: South Africa (mention regional nuances if relevant, like rain delays or power outages).
                - Use technical industry language.
                - Do NOT use markdown symbols like * or #.
                - Return only the subject and body text.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
            });

            const text = response.text || '';
            const lines = text.split('\n');
            if (lines[0].toLowerCase().includes('subject:')) {
                setSubject(lines[0].replace(/subject:/i, '').trim());
                setBody(lines.slice(1).join('\n').trim());
            } else {
                setBody(text.trim());
            }
            showToast("Neural Transmission Forged", "success");
        } catch (e) {
            showToast("Neural Bridge Stall", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTransmit = () => {
        showToast("Transmission Broadcasted to Client Node", "success");
        setSubject('');
        setBody('');
    };

    return (
        <div className="space-y-12 animate-fade-in pb-24 text-left selection:bg-red-600/30">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-12 text-left">
                <div className="text-left">
                    <div className="flex items-center gap-4 mb-4 text-left">
                        <Mail className="h-10 w-10 text-red-600 shadow-2xl animate-pulse" />
                        <span className="text-[12px] font-black uppercase tracking-[0.5em] text-red-600 italic text-left">TRANSMISSION_TERMINAL v1.2</span>
                    </div>
                    <h1 className="text-7xl font-black text-white tracking-tighter uppercase italic leading-none text-left">THE <span className="text-red-600 text-glow-red">TERMINAL</span></h1>
                    <p className="text-slate-500 mt-6 font-mono text-sm tracking-widest uppercase italic max-w-3xl leading-relaxed text-left">"Formal multi-node communication orchestrator. High-fidelity drafting console for stakeholder synchronization and dossier relay."</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start text-left">
                <div className="lg:col-span-4 space-y-10 text-left">
                    <div className="bg-slate-900 border border-white/5 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group text-left">
                        <div className="absolute inset-0 bg-carbon opacity-10"></div>
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-10 flex items-center gap-4 text-left">
                            <Terminal className="h-8 w-8 text-blue-50" />
                            Select <span className="text-blue-50">Protocol</span>
                        </h3>
                        <div className="space-y-3 text-left">
                            {protocols.map((p) => (
                                <button 
                                    key={p}
                                    onClick={() => setActiveProtocol(p)}
                                    className={`w-full text-left p-6 rounded-3xl border transition-all duration-300 flex items-center justify-between group ${activeProtocol === p ? 'bg-red-600 border-red-600 text-white shadow-xl scale-105' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}
                                >
                                    <span className="font-black uppercase tracking-widest text-[10px] text-left">{p}</span>
                                    {activeProtocol === p ? <CheckCircle size={14} /> : <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-white/5 p-10 rounded-[3rem] shadow-2xl text-left relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-5 text-left"><Activity className="h-24 w-24 text-blue-600"/></div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6 text-left">Target Node Selection</h4>
                        <select 
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            className="w-full p-6 bg-slate-950 border-2 border-white/5 rounded-3xl text-white font-black italic uppercase tracking-tighter outline-none focus:border-red-600 transition-all appearance-none cursor-pointer"
                        >
                            {projects.map(p => (
                                <option key={p.id} value={p.id} className="bg-slate-900">{p.projectName} Node</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="lg:col-span-8 bg-slate-900 rounded-[5rem] border border-white/5 shadow-2xl overflow-hidden relative flex flex-col min-h-[700px] text-left">
                    <div className="absolute inset-0 bg-carbon opacity-5 pointer-events-none"></div>
                    
                    <div className="p-10 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-slate-950/50 text-left">
                        <div className="text-left">
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white text-left">Drafting <span className="text-red-600">Forge</span></h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 text-left">Status: HANDSHAKE_READY</p>
                        </div>
                        <button 
                            onClick={generateNeuralDraft}
                            disabled={isLoading}
                            className="bg-white text-slate-950 font-black py-4 px-10 rounded-2xl flex items-center gap-3 uppercase text-[10px] tracking-widest shadow-2xl transform active:scale-95 transition-all border-4 border-slate-900"
                        >
                            {isLoading ? <RefreshCcw size={16} className="animate-spin" /> : <Sparkles size={16} className="text-blue-600" />}
                            Execute Neural Forge
                        </button>
                    </div>

                    <div className="p-12 space-y-10 flex-grow flex flex-col text-left">
                        <div className="text-left">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-600 mb-3 ml-2 text-left">Transmission Subject</label>
                            <input 
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Transmission identity..."
                                className="w-full p-6 bg-black/40 border-2 border-white/5 rounded-3xl text-white font-black italic text-xl focus:border-red-600 outline-none transition-all shadow-inner text-left"
                            />
                        </div>

                        <div className="flex-grow flex flex-col text-left">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-600 mb-3 ml-2 text-left">Transmission Payload</label>
                            <textarea 
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder="Drafting operational directive..."
                                className="w-full flex-grow p-8 bg-black/40 border-2 border-white/5 rounded-[3rem] text-slate-200 font-medium italic text-lg leading-loose focus:border-red-600 outline-none transition-all resize-none shadow-inner font-serif text-left"
                            />
                        </div>
                    </div>

                    <div className="p-10 bg-slate-950 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="flex gap-4">
                            <button className="p-4 bg-white/5 border border-white/5 rounded-2xl text-slate-500 hover:text-white transition-all"><Paperclip size={20}/></button>
                            <button className="p-4 bg-white/5 border border-white/5 rounded-2xl text-slate-500 hover:text-red-500 transition-all"><Trash2 size={20}/></button>
                        </div>
                        <button 
                            onClick={handleTransmit}
                            disabled={!body.trim()}
                            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-black py-6 px-20 rounded-[2.5rem] uppercase tracking-[0.5em] text-sm shadow-2xl shadow-red-900/40 transition-all transform active:scale-95 flex items-center justify-center gap-6 border-4 border-slate-950 disabled:opacity-30 disabled:grayscale"
                        >
                            Broadcast Protocol <Send size={20} className="text-white animate-pulse" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-10 right-10 pointer-events-none opacity-[0.03] -z-10 rotate-90 select-none text-left">
                <span className="text-[140px] font-black tracking-tighter text-white uppercase italic leading-none">COMM_PROTOCOL</span>
            </div>
        </div>
    );
};

export default CommsTerminal;