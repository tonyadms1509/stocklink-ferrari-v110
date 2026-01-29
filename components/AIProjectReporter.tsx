import React, { useState, useMemo } from 'react';
import { Project } from '../types';
import { useData } from '../hooks/useDataContext';
import { useLocalization } from '../hooks/useLocalization';
import { 
    SparklesIcon, ClipboardDocumentIcon, BookOpenIcon, PaperAirplaneIcon, DocumentTextIcon,
    ArrowPathIcon
} from '@heroicons/react/24/solid';
import { GoogleGenAI } from '@google/genai';

interface AIProjectReporterProps {
    project: Project;
}

const AIProjectReporter: React.FC<AIProjectReporterProps> = ({ project }) => {
    const { t } = useLocalization();
    const { projectMaterials, orders, projectExpenses, createProjectLog } = useData();

    const [reportType, setReportType] = useState<'Client Update' | 'Snag List' | 'Safety Audit' | 'Client Guide'>('Client Update');
    const [notes, setNotes] = useState('');
    const [generatedReport, setGeneratedReport] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const projectData = useMemo(() => {
        const materials = projectMaterials.filter(m => m.projectId === project.id);
        const relevantOrders = orders.filter(o => o.projectId === project.id);
        const expenses = projectExpenses.filter(e => e.projectId === project.id);
        return { materials, orders: relevantOrders, expenses };
    }, [project, projectMaterials, orders, projectExpenses]);

    const handleGenerateReport = async () => {
        if (!process.env.API_KEY) {
            setError("API key not configured for AI features.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedReport('');

        const promptData = `
            Project Name: ${project.projectName}
            Client Name: ${project.clientName}
            Project Status: ${project.status}

            Materials: ${projectData.materials.map(m => `${m.quantity}x ${m.productName}`).join(', ')}
            
            Contractor's Notes:
            ${notes || "No additional notes."}
        `;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const systemInstruction = `You are a professional project manager using StockLink Ferrari. 
            Report type: "${reportType}".
            
            - If "Client Update": Summarize progress for the homeowner in a clear, positive way.
            - If "Snag List": Technical list of remaining small tasks with recommended fixes.
            - If "Safety Audit": Comprehensive Health and Safety status for the site.
            - If "Client Guide": Write a formal onboarding letter for the homeowner. Explain how they can use StockLink to track this specific project. Explain what "Variation Orders" and "Status Updates" are in simple terms. Mention the reliability of using a StockLink Verified Contractor.
            
            Use clean markdown for formatting.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: promptData,
                config: { systemInstruction }
            });

            setGeneratedReport(response.text.trim());

        } catch (err) {
            console.error("AI Report Generation Error:", err);
            setError("Failed to generate report.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleLogToProject = () => {
        if (generatedReport) {
            createProjectLog({
                projectId: project.id,
                type: reportType === 'Client Guide' ? 'General Note' : reportType,
                content: generatedReport,
                date: new Date()
            });
            alert("Report logged to project history.");
        }
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedReport);
        alert('Report copied to clipboard!');
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-inner">
                <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight italic">Report Studio</h3>
                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Select Protocol</label>
                        <div className="grid grid-cols-2 gap-2">
                             {(['Client Update', 'Snag List', 'Safety Audit', 'Client Guide'] as const).map(type => (
                                 <button 
                                    key={type}
                                    onClick={() => setReportType(type)}
                                    className={`p-3 rounded-xl text-xs font-bold transition-all border ${reportType === type ? 'bg-blue-600 text-white border-blue-500 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'}`}
                                 >
                                     {type}
                                 </button>
                             ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Contextual Brief</label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Add specific details for this report..."
                            className="w-full p-4 border rounded-2xl bg-white focus:ring-4 focus:ring-blue-500/10 transition-all text-sm h-32 resize-none"
                        />
                    </div>
                    <button
                        onClick={handleGenerateReport}
                        disabled={isLoading}
                        className="w-full bg-slate-900 text-white font-black py-4 px-6 rounded-2xl shadow-xl hover:bg-black transition-all transform active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                    >
                        {isLoading ? (
                            <><ArrowPathIcon className="h-5 w-5 animate-spin" /> Drafting...</>
                        ) : (
                            <><SparklesIcon className="h-5 w-5 text-blue-400" /> Execute Intelligence</>
                        )}
                    </button>
                </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl flex flex-col min-h-[400px]">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight italic">Draft Output</h3>
                    <div className="flex gap-2">
                         {generatedReport && (
                            <>
                                <button onClick={handleLogToProject} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors" title="Log to Project">
                                    <DocumentTextIcon className="h-5 w-5"/>
                                </button>
                                <button onClick={handleCopy} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="Copy to Clipboard">
                                    <ClipboardDocumentIcon className="h-5 w-5" />
                                </button>
                            </>
                        )}
                    </div>
                 </div>
                 
                 {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                 
                 <div className="flex-grow bg-slate-50 rounded-2xl p-6 border border-slate-100 overflow-y-auto">
                    {generatedReport ? (
                        <div className="prose prose-sm prose-blue whitespace-pre-wrap font-sans text-slate-800 leading-relaxed">
                            {generatedReport}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-50">
                            <BookOpenIcon className="h-16 w-16 mb-2"/>
                            <p className="text-xs font-bold uppercase tracking-widest">Waiting for Command</p>
                        </div>
                    )}
                 </div>
                 
                 {generatedReport && (
                     <div className="mt-6">
                         <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest text-xs transition-all transform active:scale-95">
                             <PaperAirplaneIcon className="h-4 w-4" /> Share with Client
                         </button>
                     </div>
                 )}
            </div>
        </div>
    );
};

export default AIProjectReporter;