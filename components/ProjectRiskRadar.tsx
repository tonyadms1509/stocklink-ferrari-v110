import React, { useMemo, useState, useEffect } from 'react';
import { Project } from '../types';
import { useData } from '../hooks/useDataContext';
import { GoogleGenAI, Type } from '@google/genai';
import { 
    ExclamationTriangleIcon, ArrowPathIcon, ShieldCheckIcon, 
    CurrencyDollarIcon, ClockIcon, CubeIcon, SparklesIcon, XMarkIcon,
    ShieldExclamationIcon
} from '@heroicons/react/24/solid';

interface ProjectRiskRadarProps {
    project: Project;
}

interface RiskAnalysis {
    budgetRisk: 'Low' | 'Medium' | 'High';
    scheduleRisk: 'Low' | 'Medium' | 'High';
    safetyRisk: 'Low' | 'Medium' | 'High';
    supplyChainRisk: 'Low' | 'Medium' | 'High';
    summary: string;
}

const RiskIndicator: React.FC<{ label: string; risk: 'Low' | 'Medium' | 'High'; icon: React.ElementType; onClick: () => void }> = ({ label, risk, icon: Icon, onClick }) => {
    const colors = {
        Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        High: 'bg-red-500/10 text-red-400 border-red-500/20'
    };
    
    return (
        <button 
            onClick={onClick}
            className={`flex items-center justify-between p-4 rounded-2xl border w-full transition-all duration-300 bg-slate-900 group ${colors[risk]} hover:border-blue-500/50 hover:bg-slate-800`}
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-current bg-opacity-10`}>
                    <Icon className="h-5 w-5"/>
                </div>
                <span className="font-black text-[10px] uppercase tracking-[0.2em]">{label}</span>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-xs font-black uppercase tracking-tighter italic">{risk}</span>
                {risk !== 'Low' && <SparklesIcon className="h-3 w-3 animate-pulse text-blue-400"/>}
            </div>
        </button>
    );
};

const ProjectRiskRadar: React.FC<ProjectRiskRadarProps> = ({ project }) => {
    const { projectBudgets, projectExpenses, projectLogs, projectTasks } = useData();
    const [analysis, setAnalysis] = useState<RiskAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const [selectedRiskCategory, setSelectedRiskCategory] = useState<string | null>(null);
    const [mitigationPlan, setMitigationPlan] = useState<string | null>(null);
    const [isMitigationLoading, setIsMitigationLoading] = useState(false);

    const projectData = useMemo(() => {
        const budget = projectBudgets.find(b => b.projectId === project.id)?.totalBudget || 0;
        const spent = projectExpenses.filter(e => e.projectId === project.id).reduce((sum, e) => sum + e.amount, 0);
        const logs = projectLogs.filter(l => l.projectId === project.id);
        const incidents = logs.filter(l => l.type === 'Incident').length;
        const overdueTasks = projectTasks.filter(t => t.projectId === project.id && t.status !== 'Completed' && t.dueDate && new Date(t.dueDate) < new Date()).length;
        const materialIssues = logs.filter(l => l.content.toLowerCase().includes('delay') || l.content.toLowerCase().includes('stock')).length;

        return { budget, spent, incidents, overdueTasks, materialIssues };
    }, [project, projectBudgets, projectExpenses, projectLogs, projectTasks]);

    const analyzeRisk = async () => {
        if (!process.env.API_KEY) return;
        setIsLoading(true);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Analyze construction risk for "${project.projectName}".
                Telemetry: Budget Spent ${projectData.spent}/${projectData.budget}, Incidents: ${projectData.incidents}, Overdue: ${projectData.overdueTasks}.
                Supply Issues: ${projectData.materialIssues}.
                Determine Risk (Low, Medium, High) for Budget, Schedule, Safety, Supply. 
                Provide a 1-sentence tactical health summary.
                Return JSON.
            `;
            
            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    budgetRisk: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
                    scheduleRisk: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
                    safetyRisk: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
                    supplyChainRisk: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
                    summary: { type: Type.STRING }
                },
                required: ['budgetRisk', 'scheduleRisk', 'safetyRisk', 'supplyChainRisk', 'summary']
            };

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: { responseMimeType: 'application/json', responseSchema }
            });
            
            setAnalysis(JSON.parse(response.text || '{}'));

        } catch (e) {
            console.error("Risk Analysis Error", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRiskClick = async (riskCategory: string, riskLevel: string) => {
        if (!process.env.API_KEY) return;
        
        setSelectedRiskCategory(riskCategory);
        setIsMitigationLoading(true);
        setMitigationPlan(null);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                The construction project "${project.projectName}" has a ${riskLevel} risk in ${riskCategory}.
                Provide 3 elite, high-performance mitigation protocols to neutralize this risk. 
                Focus on South African context (Load shedding, labor stability, material lead times).
                Max 50 words.
            `;
            
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt
            });
            
            setMitigationPlan(response.text);

        } catch (e) {
            setMitigationPlan("Neural link failed. Re-initiating.");
        } finally {
            setIsMitigationLoading(false);
        }
    };

    useEffect(() => {
        analyzeRisk();
    }, [project.id]);

    return (
        <div className="bg-slate-950 p-8 rounded-[3rem] shadow-2xl border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5"><ShieldExclamationIcon className="h-48 w-48 text-red-500" /></div>
            
            <div className="flex justify-between items-center mb-10 relative z-10 text-left">
                <div className="text-left">
                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-white flex items-center gap-3 text-left">
                        <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
                        Neural <span className="text-blue-500">Risk</span> Radar
                    </h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1 font-mono">Real-time Telemetry Scan</p>
                </div>
                <button 
                    onClick={analyzeRisk} 
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-slate-400 transition-all transform active:scale-95"
                    disabled={isLoading}
                >
                    <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`}/>
                </button>
            </div>

            {isLoading && !analysis ? (
                <div className="py-20 text-center">
                    <div className="w-16 h-1 bg-blue-500 mx-auto rounded-full animate-pulse shadow-[0_0_15px_#3b82f6] mb-6"></div>
                    <p className="font-black text-slate-400 uppercase tracking-widest text-xs animate-pulse">Calibrating Threat Assessment...</p>
                </div>
            ) : analysis ? (
                <div className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <RiskIndicator label="Fiscal" risk={analysis.budgetRisk} icon={CurrencyDollarIcon} onClick={() => handleRiskClick('Budget', analysis.budgetRisk)} />
                        <RiskIndicator label="Tempo" risk={analysis.scheduleRisk} icon={ClockIcon} onClick={() => handleRiskClick('Schedule', analysis.scheduleRisk)} />
                        <RiskIndicator label="Safety" risk={analysis.safetyRisk} icon={ShieldCheckIcon} onClick={() => handleRiskClick('Safety', analysis.safetyRisk)} />
                        <RiskIndicator label="Supply" risk={analysis.supplyChainRisk} icon={CubeIcon} onClick={() => handleRiskClick('Supply Chain', analysis.supplyChainRisk)} />
                    </div>
                    
                    <div className="mt-8 bg-blue-600/10 border border-blue-500/20 p-6 rounded-[2rem] text-sm text-blue-100 font-medium italic leading-relaxed shadow-inner text-left">
                         "{analysis.summary}"
                    </div>

                    {selectedRiskCategory && (
                        <div className="mt-6 p-6 bg-slate-900 border border-white/10 rounded-[2.5rem] animate-fade-in shadow-2xl relative">
                            <div className="flex justify-between items-start mb-6 text-left">
                                <h4 className="font-black italic text-blue-400 uppercase tracking-tighter text-lg flex items-center gap-3">
                                    <SparklesIcon className="h-5 w-5 text-amber-500 animate-pulse"/>
                                    Mitigation Protocol: {selectedRiskCategory}
                                </h4>
                                <button onClick={() => setSelectedRiskCategory(null)} className="text-slate-500 hover:text-white">
                                    <XMarkIcon className="h-5 w-5"/>
                                </button>
                            </div>
                            
                            {isMitigationLoading ? (
                                <div className="flex gap-1 py-4 justify-center">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                </div>
                            ) : (
                                <div className="text-sm text-slate-300 whitespace-pre-wrap leading-loose font-serif text-left">
                                    {mitigationPlan}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="py-20 text-center bg-white/5 rounded-[2.5rem] border-2 border-dashed border-white/5">
                    <ShieldExclamationIcon className="h-16 w-16 text-slate-800 mx-auto mb-4"/>
                    <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Awaiting Manual Sensor Initialization</p>
                </div>
            )}
        </div>
    );
};

export default ProjectRiskRadar;