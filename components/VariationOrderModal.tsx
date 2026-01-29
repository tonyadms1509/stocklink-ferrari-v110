import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { VariationOrder, Project } from '../types';
import { XMarkIcon, SparklesIcon, ScaleIcon, ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { GoogleGenAI } from '@google/genai';

interface VariationOrderModalProps {
    project: Project;
    onClose: () => void;
    onSave: (vo: Omit<VariationOrder, 'id' | 'createdAt' | 'status'>) => void;
}

const VariationOrderModal: React.FC<VariationOrderModalProps> = ({ project, onClose, onSave }) => {
    const { t } = useLocalization();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [costImpact, setCostImpact] = useState('');
    const [timeImpact, setTimeImpact] = useState('');
    const [justification, setJustification] = useState('');
    const [isDrafting, setIsDrafting] = useState(false);

    const handleDraftJustification = async () => {
        if (!process.env.API_KEY || !description) return;
        setIsDrafting(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                You are an elite Contract Manager for a South African construction firm. 
                Draft a formal, technical justification for a Variation Order.
                
                Project: ${project.projectName}
                Scope Change: ${description}
                Fiscal Impact: ${costImpact || 'To be calculated'}
                Pace Impact: ${timeImpact || '0'} days
                
                The justification should be professional, citing unforeseen site conditions or structural optimization.
                Tone: Technical, Legally Sound, Reassuring. Max 3 sentences. No markdown.
            `;
            
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt
            });
            
            setJustification(response.text || '');
        } catch (e) {
            console.error(e);
        } finally {
            setIsDrafting(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            projectId: project.id,
            number: `VO-SENSE-${Date.now().toString().slice(-4)}`,
            title,
            description,
            justification,
            costImpact: parseFloat(costImpact) || 0,
            timeImpactDays: parseInt(timeImpact) || 0,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-[120] p-4 animate-fade-in backdrop-blur-md">
            <div className="bg-white rounded-[3.5rem] shadow-2xl max-w-lg w-full relative overflow-hidden flex flex-col border border-white/20">
                <div className="bg-slate-900 p-8 text-white flex justify-between items-center border-b border-white/5">
                    <div className="flex items-center gap-4">
                         <div className="p-3 bg-blue-600 rounded-2xl shadow-xl">
                            <ScaleIcon className="h-6 w-6"/>
                         </div>
                         <div>
                             <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em]">Protocol Expansion</p>
                             <h2 className="text-xl font-black italic uppercase tracking-tighter">Variation <span className="text-blue-500">Order</span></h2>
                         </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white p-2"><XMarkIcon className="h-6 w-6"/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-10 space-y-6 overflow-y-auto custom-scrollbar">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Subject of Amendment</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-blue-500 outline-none transition-all" placeholder="e.g. Structural Sub-Floor Alteration" required />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Fiscal Delta (ZAR)</label>
                                <input type="number" value={costImpact} onChange={e => setCostImpact(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-blue-600 focus:border-blue-500 outline-none transition-all" placeholder="0.00" required />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Tempo Shift (Days)</label>
                                <input type="number" value={timeImpact} onChange={e => setTimeImpact(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black focus:border-blue-500 outline-none transition-all" placeholder="0" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Technical Description</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:border-blue-500 outline-none transition-all h-32 resize-none" required placeholder="Specify exactly what is changing in the grid..." />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                 <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">Formal Justification</label>
                                 <button 
                                    type="button" 
                                    onClick={handleDraftJustification} 
                                    disabled={isDrafting || !description}
                                    className="text-[10px] flex items-center gap-2 text-blue-600 font-black uppercase hover:text-blue-800 disabled:opacity-30 transition-all"
                                >
                                    {isDrafting ? <ArrowPathIcon className="h-3 w-3 animate-spin"/> : <SparklesIcon className="h-3 w-3" />}
                                    Neural Draft
                                </button>
                            </div>
                            <div className="relative">
                                <textarea value={justification} onChange={e => setJustification(e.target.value)} rows={3} className="w-full p-6 bg-slate-900 border-none rounded-3xl text-sm text-slate-300 italic font-serif leading-loose" placeholder="The legal reasoning for this amendment..." />
                                {isDrafting && <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm rounded-3xl flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div></div>}
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl shadow-2xl transition-all transform active:scale-95 uppercase tracking-[0.3em] text-[10px] hover:bg-black"
                    >
                        Deploy Variation Protocol
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VariationOrderModal;