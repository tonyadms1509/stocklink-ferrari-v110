
import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import { GoogleGenAI, Type } from '@google/genai';
import { 
    Sparkles, X, FileText, 
    ShieldCheck, Clipboard, 
    RefreshCcw, Scale, FileDown
} from 'lucide-react';
import { Tender } from '../types';
import { useToast } from '../hooks/useToast';

interface TenderProposalForgeProps {
    tender: Tender;
    onClose: () => void;
}

const TenderProposalForge: React.FC<TenderProposalForgeProps> = ({ tender, onClose }) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [proposal, setProposal] = useState<string | null>(null);

    const handleForge = async () => {
        if (!process.env.API_KEY) return;
        setIsLoading(true);
        setProposal(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                You are an elite Tender Consultant in South Africa. Forged a professional response for this tender:
                
                Tender Ref: ${tender.tenderNumber}
                Project: ${tender.projectName}
                Requested Payload: ${JSON.stringify(tender.materials)}
                
                My Node Info:
                - Name: ${user?.name}
                - Role: Supplier Node
                
                Forge a structured, high-conversion proposal. 
                Include:
                1. Executive Summary: Strategic fit and grid reliability.
                2. Compliance Section: Mention B-BBEE status and SANS item verification.
                3. Logistics Protocol: Estimated transit friction and delivery security.
                4. Technical Specification: How our materials meet the build requirements.
                
                Tone: Formal, Elite, Industrial. Max 500 words. No markdown formatting.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt
            });

            setProposal(response.text || '');
            showToast("Proposal Forged Successfully", "success");
        } catch (e) {
            showToast("Forge Initialisation Failed", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/95 flex items-center justify-center z-[130] p-4 animate-fade-in backdrop-blur-md">
            <div className="bg-white rounded-[3.5rem] shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden border border-white/20">
                <div className="bg-slate-900 p-8 border-b border-white/5 flex justify-between items-center text-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-900/40">
                             <FileText className="h-6 w-6 text-white"/>
                        </div>
                        <div className="text-left">
                             <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em]">Submission Engine v1.2</p>
                             <h2 className="text-xl font-black italic uppercase tracking-tighter">Proposal <span className="text-blue-500">Forge</span></h2>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white p-2"><X size={24}/></button>
                </div>

                <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
                    {/* Parameters Panel */}
                    <div className="w-full md:w-80 p-8 bg-slate-50 border-r overflow-y-auto shrink-0 text-left">
                         <div className="space-y-8">
                            <div>
                                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">Mission Context</h4>
                                <div className="space-y-4">
                                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Tender ID</p>
                                        <p className="text-xs font-black text-slate-900 font-mono">{tender.tenderNumber}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Project Node</p>
                                        <p className="text-xs font-black text-slate-900 uppercase italic truncate">{tender.projectName}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-600/10 p-6 rounded-[2rem] border border-blue-500/20">
                                <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3">AI Intelligence</p>
                                <p className="text-xs text-blue-800 font-medium italic leading-relaxed">"Drafting high-conversion legal and technical documents based on national grid standards."</p>
                            </div>

                            <button 
                                onClick={handleForge} 
                                disabled={isLoading}
                                className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] shadow-2xl hover:bg-black transition-all transform active:scale-95 disabled:opacity-30"
                            >
                                {isLoading ? <RefreshCcw className="h-4 w-4 animate-spin"/> : <Sparkles className="h-4 w-4 text-blue-400 animate-pulse"/>}
                                Initialize Forge
                            </button>
                         </div>
                    </div>

                    {/* Output Canvas */}
                    <div className="flex-grow p-12 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/lined-paper-2.png')] relative">
                        {proposal ? (
                            <div className="prose prose-slate max-w-none animate-fade-in-up">
                                <div className="whitespace-pre-wrap font-serif text-lg leading-loose text-slate-800 text-left">{proposal}</div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-20">
                                <Scale className="h-32 w-32 mb-6"/>
                                <p className="font-black uppercase tracking-[0.5em] text-sm">Awaiting Strategic Parameters</p>
                            </div>
                        )}
                        
                        {proposal && (
                            <div className="sticky bottom-0 left-0 right-0 flex justify-end gap-4 pt-12 bg-gradient-to-t from-white via-white to-transparent">
                                <button onClick={() => { navigator.clipboard.writeText(proposal); showToast("Proposal Copied", "success"); }} className="p-4 bg-white border-2 border-slate-100 rounded-2xl shadow-xl text-gray-600 hover:text-blue-600 transition-colors">
                                    <Clipboard className="h-6 w-6"/>
                                </button>
                                <button className="bg-blue-600 text-white font-black px-12 py-4 rounded-[2rem] shadow-2xl shadow-blue-900/40 uppercase tracking-widest text-[10px] flex items-center gap-3 transform active:scale-95">
                                    <FileDown className="h-4 w-4" /> Download Dossier
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TenderProposalForge;
