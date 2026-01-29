import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SafetyBriefing } from '../../types';
import { 
    ShieldCheckIcon, ClipboardDocumentIcon, 
    ExclamationTriangleIcon, DocumentTextIcon, 
    CheckCircleIcon, SparklesIcon,
    ArrowPathIcon
} from '@heroicons/react/24/solid';
import { useToast } from '../../hooks/useToast';
import { useData } from '../../hooks/useDataContext';

interface SafetyHubPageProps {
    onBack?: () => void;
}

const SafetyHubPage: React.FC<SafetyHubPageProps> = ({ onBack }) => {
    const { showToast } = useToast();
    const { projects } = useData();
    const [activeTab, setActiveTab] = useState<'briefings' | 'risk' | 'permits'>('briefings');
    
    const [safetyBriefing, setSafetyBriefing] = useState<SafetyBriefing | null>(null);
    const [isLoadingBriefing, setIsLoadingBriefing] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [safetyTopic, setSafetyTopic] = useState('Working at Heights');
    
    useEffect(() => {
        if (projects.length > 0 && !selectedProjectId) {
            setSelectedProjectId(projects[0].id);
        }
    }, [projects, selectedProjectId]);

    const handleGenerateBriefing = async () => {
        if (!process.env.API_KEY) return;
        setIsLoadingBriefing(true);
        try {
             const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
             const prompt = `Generate a 1-minute safety "Toolbox Talk" script for a South African construction site. Topic: ${safetyTopic}. Reference SANS safety standards. Return JSON with: {topic, risks: string[], procedures: string[], closingStatement}.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: { responseMimeType: "application/json" }
            });

            setSafetyBriefing(JSON.parse(response.text || '{}'));
            showToast("Safety Briefing Synchronized", "success");
        } catch (err) {
            showToast("Neural Link Failure", "error");
        } finally {
            setIsLoadingBriefing(false);
        }
    };

    return (
        <div className="pb-20 space-y-12 animate-fade-in font-sans selection:bg-red-600/30">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-12">
                <div className="text-left">
                    <div className="flex items-center gap-3 mb-4 text-red-600">
                        <ShieldCheckIcon className="h-8 w-8 animate-pulse shadow-[0_0_20px_#dc2626]" />
                        <span className="text-[12px] font-black uppercase tracking-[0.6em] italic text-red-600">SAFETY SHIELD CORE v80.5</span>
                    </div>
                    <h1 className="text-7xl md:text-8xl font-black text-white tracking-tighter uppercase italic leading-[0.75]">SAFETY <span className="text-red-600 text-glow-red">MATRIX</span></h1>
                </div>
                {onBack && (
                    <button onClick={onBack} className="bg-white/5 hover:bg-white/10 text-slate-400 font-black py-4 px-10 rounded-2xl border border-white/10 uppercase tracking-widest text-[10px] transition-all transform active:scale-95">
                        Return to Command
                    </button>
                )}
            </header>

            <div className="flex bg-slate-900 p-1.5 rounded-[2.5rem] border border-white/5 shadow-2xl w-fit">
                {['briefings', 'risk', 'permits'].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-10 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${activeTab === tab ? 'bg-red-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 border border-white/5 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-carbon opacity-10"></div>
                        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-10 flex items-center gap-4 relative z-10 leading-none">
                            <div className="w-1.5 h-10 bg-red-600 rounded-full shadow-[0_0_20px_red]"></div>
                            Protocol <span className="text-red-600">Generator</span>
                        </h3>
                        
                        <div className="space-y-6 relative z-10 text-left">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3">Target Project</label>
                                <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} className="w-full p-5 bg-white/5 border-2 border-white/5 rounded-3xl text-white font-bold focus:border-red-600 outline-none transition-all appearance-none cursor-pointer">
                                    <option value="" disabled>Select site node...</option>
                                    {projects.map(p => <option key={p.id} value={p.id} className="bg-slate-900">{p.projectName}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3">Technical Topic</label>
                                <select value={safetyTopic} onChange={e => setSafetyTopic(e.target.value)} className="w-full p-5 bg-white/5 border-2 border-white/5 rounded-3xl text-white font-bold focus:border-red-600 outline-none transition-all appearance-none cursor-pointer">
                                    <option>Working at Heights</option>
                                    <option>Electrical Grounding</option>
                                    <option>Excavation Safety</option>
                                    <option>Crane Orchestration</option>
                                    <option>PPE Compliance</option>
                                </select>
                            </div>

                            <button 
                                onClick={handleGenerateBriefing}
                                disabled={isLoadingBriefing}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-6 rounded-[2.5rem] text-[10px] uppercase tracking-[0.4em] shadow-[0_0_50px_rgba(220,0,0,0.3)] transition-all flex items-center justify-center gap-4 transform active:scale-95 disabled:opacity-30 border border-white/10"
                            >
                                {isLoadingBriefing ? <ArrowPathIcon className="h-6 w-6 animate-spin" /> : <SparklesIcon className="h-6 w-6 text-yellow-300 animate-pulse" />}
                                Execute Pulse Brief
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8">
                     {isLoadingBriefing ? (
                         <div className="bg-slate-900 rounded-[5rem] border border-white/5 h-[600px] flex items-center justify-center shadow-inner relative overflow-hidden">
                             <div className="absolute inset-0 bg-carbon opacity-20"></div>
                             <div className="text-center">
                                 <div className="relative w-32 h-32 mx-auto mb-12">
                                     <div className="absolute inset-0 border-8 border-red-900/20 rounded-full"></div>
                                     <div className="absolute inset-0 border-8 border-red-600 rounded-full border-t-transparent animate-spin"></div>
                                     <SparklesIcon className="absolute inset-0 m-auto h-12 w-12 text-red-500 animate-pulse"/>
                                 </div>
                                 <p className="font-black text-slate-500 uppercase tracking-[0.8em] text-xs">Calibrating Compliance Vectors...</p>
                             </div>
                         </div>
                     ) : safetyBriefing ? (
                         <div className="bg-white p-16 rounded-[5rem] shadow-2xl text-left font-serif text-slate-800 leading-loose animate-fade-in relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-8 opacity-5"><ClipboardDocumentIcon className="h-48 w-48 text-slate-900"/></div>
                             <h3 className="font-black font-sans text-4xl italic uppercase tracking-tighter mb-10 text-slate-950 underline decoration-red-600 decoration-8 underline-offset-8">Neural Safety Briefing</h3>
                             <div className="space-y-10">
                                 <div>
                                     <h4 className="font-black font-sans text-xs uppercase tracking-widest text-slate-400 mb-4">Critical Risks</h4>
                                     <ul className="space-y-4">
                                         {safetyBriefing.risks.map((risk, i) => (
                                             <li key={i} className="flex items-start gap-4">
                                                 <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2.5 shrink-0"></div>
                                                 <span className="text-xl font-medium">{risk}</span>
                                             </li>
                                         ))}
                                     </ul>
                                 </div>
                                 <div>
                                     <h4 className="font-black font-sans text-xs uppercase tracking-widest text-slate-400 mb-4">Mandatory Protocols</h4>
                                     <ul className="space-y-4">
                                         {safetyBriefing.procedures.map((proc, i) => (
                                             <li key={i} className="flex items-start gap-4">
                                                 <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2.5 shrink-0"></div>
                                                 <span className="text-xl font-medium">{proc}</span>
                                             </li>
                                         ))}
                                     </ul>
                                 </div>
                                 <div className="pt-10 border-t border-slate-100">
                                     <p className="text-2xl italic font-semibold text-slate-900 leading-tight">"{safetyBriefing.closingStatement}"</p>
                                 </div>
                             </div>
                             <div className="mt-16 flex gap-4">
                                <button onClick={() => { showToast("Dossier Archived", "success"); setSafetyBriefing(null); }} className="bg-slate-950 text-white font-black py-5 px-14 rounded-3xl uppercase text-[10px] tracking-widest hover:bg-black shadow-xl transition-all border-4 border-slate-800">Archive to Site File</button>
                                <button onClick={() => window.print()} className="bg-white text-slate-950 font-black py-5 px-10 rounded-3xl uppercase text-[10px] tracking-widest border-4 border-slate-100 transition-all hover:bg-slate-50">Transmit to Team</button>
                             </div>
                         </div>
                     ) : (
                         <div className="bg-slate-900/50 border-4 border-dashed border-white/5 rounded-[5rem] h-[600px] flex flex-col items-center justify-center text-center opacity-30 group hover:opacity-50 transition-opacity duration-1000">
                             <div className="relative mb-12">
                                <ShieldCheckIcon className="h-32 w-32 text-slate-700 group-hover:scale-110 transition-transform duration-1000" />
                                <div className="absolute -inset-4 border border-white/5 rounded-full animate-spin-slow"></div>
                             </div>
                             <p className="font-black uppercase tracking-[0.5em] text-sm text-slate-500 max-w-sm leading-loose italic">"Awaiting operational parameters. Provision a safety node to begin neural compliance generation."</p>
                         </div>
                     )}
                </div>
            </div>
            
            <div className="fixed bottom-10 right-10 pointer-events-none opacity-[0.03] -z-10 rotate-90 select-none">
                <span className="text-[180px] font-black tracking-tighter text-white uppercase italic leading-none">ZEROHARM_GRID</span>
            </div>
        </div>
    );
};

export default SafetyHubPage;