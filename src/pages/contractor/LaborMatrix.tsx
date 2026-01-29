
import React, { useState } from 'react';
import { useData } from '../../hooks/useDataContext';
import { useCurrency } from '../../hooks/useCurrency';
import { SubContractor } from '../../types';
import { 
    UserGroupIcon, SparklesIcon,
    StarIcon, CheckBadgeIcon, ArrowRightIcon,
    BoltIcon, ArrowPathIcon
} from '@heroicons/react/24/solid';
import { GoogleGenAI, Type } from '@google/genai';
import { useToast } from '../../hooks/useToast';

const SubbieCard: React.FC<{ subbie: SubContractor, matchReason?: string }> = ({ subbie, matchReason }) => {
    const { formatCurrency } = useCurrency();
    return (
        <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] shadow-2xl hover:border-red-600/40 transition-all duration-500 group relative overflow-hidden flex flex-col h-full text-left">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <UserGroupIcon className="h-32 w-32 transform rotate-12 text-white" />
            </div>

            <div className="flex justify-between items-start mb-6 relative z-10 text-left">
                <div className="flex items-center gap-4 text-left">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white font-black text-2xl shadow-lg border border-white/10">
                        {subbie.name.charAt(0)}
                    </div>
                    <div className="text-left">
                        <h4 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
                            {subbie.name}
                            {subbie.verified && <CheckBadgeIcon className="h-5 w-5 text-blue-500"/>}
                        </h4>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{subbie.trade} • {subbie.location}</p>
                    </div>
                </div>
                <div className="text-right">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Day Rate</p>
                     <p className="text-xl font-black text-white">{formatCurrency(subbie.hourlyRate * 8)}</p>
                </div>
            </div>

            {matchReason && (
                <div className="bg-red-600/10 p-4 rounded-2xl border border-red-500/20 mb-6 animate-fade-in relative z-10 text-left">
                    <p className="text-[10px] font-black text-red-500 flex items-center gap-2 mb-1 uppercase tracking-widest">
                        <SparklesIcon className="h-3 w-3" /> NEURAL MATCH
                    </p>
                    <p className="text-xs text-red-100/80 font-medium italic leading-relaxed text-left">"{matchReason}"</p>
                </div>
            )}

            <div className="flex flex-wrap gap-2 mb-8 flex-grow relative z-10 text-left">
                {subbie.skills.map(skill => (
                    <span key={skill} className="bg-white/5 text-slate-400 border border-white/5 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg group-hover:border-blue-500/30 transition-colors">{skill}</span>
                ))}
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-6 relative z-10">
                <div className="flex items-center gap-1 text-xs font-black text-amber-500 bg-amber-500/5 px-3 py-1 rounded-full border border-amber-500/20 uppercase tracking-widest">
                    <StarIcon className="h-3 w-3"/> {subbie.rating}
                </div>
                <button className="bg-slate-100 text-slate-950 font-black py-4 px-8 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-white transition-all transform active:scale-95 shadow-xl flex items-center justify-center gap-3 border-4 border-slate-900">
                    Mobilize Unit <ArrowRightIcon className="h-4 w-4 text-blue-600"/>
                </button>
            </div>
        </div>
    )
}

const LaborMatrix: React.FC = () => {
    const { subContractors, projects, projectMaterials } = useData();
    const { showToast } = useToast();
    const [isMatching, setIsMatching] = useState(false);
    const [matches, setMatches] = useState<any[]>([]);

    const handleMatrixScan = async () => {
        if (!process.env.API_KEY) return;
        setIsMatching(true);
        setMatches([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Fix: Fallback project now has an id property to satisfy type checker
            const activeProj = projects[0] || { id: 'default', projectName: 'Standard Construction' };
            const materials = projectMaterials.filter(m => m.projectId === activeProj.id).map(m => m.productName).join(', ') || 'Structural, Finishing';
            
            const prompt = `
                Perform a high-fidelity labor match for project "${activeProj.projectName}".
                Required Scope: ${materials}.
                Available Personnel: ${JSON.stringify(subContractors.map(s => ({ id: s.id, name: s.name, trade: s.trade, skills: s.skills })))}
                
                Identify 2 elite sub-contractors and provide a specific technical reason why they fit this project's material list.
                Return JSON array of { id: string, reason: string }.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                reason: { type: Type.STRING }
                            },
                            required: ['id', 'reason']
                        }
                    }
                }
            });

            const results = JSON.parse(response.text || '[]');
            const enriched = results.map((r: any) => ({
                ...subContractors.find(s => s.id === r.id),
                matchReason: r.reason
            })).filter(Boolean);

            setMatches(enriched);
            showToast("Labor Matrix Synchronized", "success");
        } catch (e) {
            showToast("Neural Handshake Interrupted", "error");
        } finally {
            setIsMatching(false);
        }
    };

    return (
        <div className="pb-20 max-w-7xl mx-auto space-y-12 font-sans selection:bg-red-600/30 text-left">
            <div className="bg-slate-900 rounded-[3.5rem] p-12 shadow-2xl border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-carbon opacity-10"></div>
                <div className="absolute top-0 right-0 p-12 opacity-5">
                    <UserGroupIcon className="h-96 w-96 text-white transform -rotate-12" />
                </div>

                <div className="relative z-10 text-left">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-16 text-left">
                        <div className="text-left">
                            <div className="flex items-center gap-3 mb-4">
                                <SparklesIcon className="h-6 w-6 text-red-600 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">Personnel Engine v80.5</span>
                            </div>
                            <h1 className="text-7xl font-black text-white tracking-tighter italic uppercase text-white leading-none">Labor <span className="text-red-600">Matrix</span></h1>
                            <p className="text-slate-500 mt-4 font-mono text-sm tracking-widest uppercase text-left leading-relaxed">High-Performance Workforce Discovery for South African Sites</p>
                        </div>
                        <button 
                            onClick={handleMatrixScan}
                            disabled={isMatching}
                            className="bg-red-600 hover:bg-red-700 text-white font-black py-5 px-12 rounded-[2rem] shadow-2xl shadow-red-900/40 transition-all flex items-center gap-4 uppercase tracking-[0.2em] text-xs transform active:scale-95 disabled:opacity-50 border border-white/10"
                        >
                            {isMatching ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : <BoltIcon className="h-5 w-5" />}
                            Execute Neural Match
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                        {(matches.length > 0 ? matches : subContractors).map(sub => (
                            <SubbieCard key={sub.id} subbie={sub} matchReason={sub.matchReason} />
                        ))}
                    </div>
                </div>
            </div>
             <div className="fixed bottom-10 left-10 pointer-events-none opacity-[0.03] -z-10 rotate-90 select-none text-left">
                <span className="text-[120px] font-black tracking-tighter text-white uppercase italic leading-none">ORCHESTRATION</span>
            </div>
        </div>
    );
};

export default LaborMatrix;
