import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { useData } from '../hooks/useDataContext';
import { useLocalization } from '../hooks/useLocalization';
import { ProjectTask, TaskStatus } from '../types';
import { XMarkIcon, SparklesIcon, ArrowRightIcon, CheckCircleIcon, BoltIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

interface AIScheduleOptimizerModalProps {
    onClose: () => void;
    onApplyChanges: (updatedTasks: ProjectTask[]) => void;
}

interface TaskChange {
    taskId: string;
    originalDate?: string;
    newDate: string;
    originalStatus?: TaskStatus;
    newStatus?: TaskStatus;
    reason: string;
}

const AIScheduleOptimizerModal: React.FC<AIScheduleOptimizerModalProps> = ({ onClose, onApplyChanges }) => {
    const { t } = useLocalization();
    const { projectTasks, projects } = useData();
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [proposedChanges, setProposedChanges] = useState<TaskChange[] | null>(null);
    const [updatedTasksPayload, setUpdatedTasksPayload] = useState<ProjectTask[] | null>(null);

    const handleOptimize = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || !process.env.API_KEY) return;

        setIsLoading(true);
        setProposedChanges(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const taskContext = projectTasks.map(t => ({
                id: t.id,
                description: t.description,
                projectId: t.projectId,
                dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : null,
                status: t.status
            }));

            const systemInstruction = `You are a high-performance Construction Scheduler in SA. 
            Tasks: ${JSON.stringify(taskContext)}
            Context: Account for Stages of Load Shedding. Power-intensive work (welding, cutting) must be moved to daylight or non-outage hours.
            Return JSON object with "changes" array.`;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    changes: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                taskId: { type: Type.STRING },
                                newDate: { type: Type.STRING },
                                newStatus: { type: Type.STRING, enum: ['Pending', 'In Progress', 'Completed'] },
                                reason: { type: Type.STRING }
                            },
                            required: ['taskId', 'newDate', 'reason']
                        }
                    }
                },
                required: ['changes']
            };

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt, 
                config: { systemInstruction, responseMimeType: 'application/json', responseSchema }
            });

            const result = JSON.parse(response.text || '{}');
            if (result.changes) {
                const changes = result.changes.map((change: any) => {
                    const originalTask = projectTasks.find(t => t.id === change.taskId);
                    return {
                        ...change,
                        originalDate: originalTask?.dueDate ? new Date(originalTask.dueDate).toISOString().split('T')[0] : undefined,
                    };
                });
                setProposedChanges(changes);
                setUpdatedTasksPayload(result.changes.map((change: any) => {
                    const originalTask = projectTasks.find(t => t.id === change.taskId);
                    return originalTask ? { ...originalTask, dueDate: new Date(change.newDate), status: (change.newStatus as TaskStatus) || originalTask.status } : null;
                }).filter(Boolean));
            }
        } finally { setIsLoading(false); }
    };
    
    return (
        <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-[130] p-4 backdrop-blur-md">
            <div className="bg-white rounded-[3rem] shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col border border-white/20">
                <div className="p-8 border-b bg-slate-900 flex justify-between items-center text-white">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2 italic uppercase tracking-tighter">
                            <SparklesIcon className="h-6 w-6 text-amber-500"/> Neural Scheduler
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><XMarkIcon className="h-6 w-6"/></button>
                </div>

                <div className="p-10 flex-grow overflow-y-auto">
                    {!proposedChanges ? (
                        <form onSubmit={handleOptimize} className="space-y-6">
                            <textarea
                                value={prompt}
                                onChange={e => setPrompt(e.target.value)}
                                placeholder="e.g. 'Push back all external painting by 2 days due to rain forecast...'"
                                className="w-full p-6 border-2 border-slate-100 rounded-[2rem] bg-slate-50 focus:border-blue-500 outline-none font-medium h-48"
                                disabled={isLoading}
                            />
                            <button type="submit" disabled={isLoading || !prompt.trim()} className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl flex items-center justify-center gap-3 uppercase tracking-widest text-xs transform active:scale-95 disabled:opacity-50 shadow-xl">
                                {isLoading ? <ArrowPathIcon className="h-5 w-5 animate-spin"/> : <BoltIcon className="h-5 w-5 text-amber-400"/>}
                                Optimize Sequence
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            {proposedChanges.map((change, idx) => (
                                <div key={idx} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center group">
                                    <div>
                                        <p className="font-bold text-slate-900">{projectTasks.find(t => t.id === change.taskId)?.description}</p>
                                        <p className="text-[10px] text-slate-500 italic mt-1">"{change.reason}"</p>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs font-black">
                                        <span className="text-red-500 line-through">{change.originalDate}</span>
                                        <ArrowRightIcon className="h-4 w-4 text-slate-300"/>
                                        <span className="text-emerald-600">{change.newDate}</span>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => onApplyChanges(updatedTasksPayload!)} className="w-full bg-blue-600 text-white font-black py-5 rounded-3xl mt-6 uppercase tracking-widest text-xs">Execute Refinement</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIScheduleOptimizerModal;