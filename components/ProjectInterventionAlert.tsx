
import React, { useState } from 'react';
import { InterventionTicket } from '../types';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { ShieldAlert, Zap, CircleCheck } from 'lucide-react';

interface ProjectInterventionAlertProps {
    ticket: InterventionTicket;
    onResolve: (id: string) => void;
}

const ProjectInterventionAlert: React.FC<ProjectInterventionAlertProps> = ({ ticket, onResolve }) => {
    const [showDraft, setShowDraft] = useState(false);

    if (ticket.status === 'Resolved') return null;

    return (
        <div className="relative bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl animate-fade-in-up group hover:border-red-600/30 transition-all duration-500 overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Zap size={100} /></div>
            
            <div className="flex justify-between items-start mb-6 text-left">
                <div className="flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-red-600 bg-opacity-10 shadow-inner">
                        <ShieldAlert size={24} className="text-red-600" />
                    </div>
                    <div>
                         <p className="text-[10px] font-black uppercase tracking-[0.5em] text-red-500 mb-1">Grid Intervention</p>
                         <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">{ticket.title}</h3>
                    </div>
                </div>
            </div>

            <p className="text-sm leading-relaxed text-slate-400 mb-8 font-medium italic text-left">
                "{ticket.insight}"
            </p>

            {showDraft ? (
                <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] mb-8 animate-fade-in shadow-inner text-left">
                    <h4 className="text-[9px] font-black uppercase text-slate-500 tracking-[0.4em] mb-4 flex items-center gap-2">
                        <SparklesIcon className="h-4 w-4 text-blue-500"/> Neural Logic Result
                    </h4>
                    <p className="text-base text-blue-100 italic leading-relaxed">"{ticket.draftContent}"</p>
                    <div className="mt-8 flex gap-4">
                         <button 
                            onClick={() => onResolve(ticket.id)}
                            className="flex-1 bg-white text-slate-900 font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-2xl transition-all transform active:scale-95 border-4 border-slate-900"
                         >
                             Authorize & Execute
                         </button>
                         <button onClick={() => setShowDraft(false)} className="px-6 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Revert</button>
                    </div>
                </div>
            ) : (
                <div className="flex gap-4">
                    <button 
                        onClick={() => setShowDraft(true)}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-900/40 transition-all flex items-center justify-center gap-3 transform active:scale-95 border border-white/10"
                    >
                        <SparklesIcon className="h-4 w-4 text-blue-200"/>
                        {ticket.actionLabel}
                    </button>
                    <button 
                        onClick={() => onResolve(ticket.id)}
                        className="px-6 text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-white transition-colors"
                    >
                        Mute Protocol
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProjectInterventionAlert;
