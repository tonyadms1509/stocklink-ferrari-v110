
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Project } from '../types';
import { useData } from '../hooks/useDataContext';
import { useLocalization } from '../hooks/useLocalization';
import { useCurrency } from '../hooks/useCurrency';
import { GoogleGenAI } from '@google/genai';
import { PaperAirplaneIcon, SparklesIcon, UserCircleIcon, CpuChipIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../hooks/useAuth';

interface Message {
    role: 'user' | 'model';
    text: string;
}

interface AIProjectAssistantProps {
    project: Project;
}

const AIProjectAssistant: React.FC<AIProjectAssistantProps> = ({ project }) => {
    const { t } = useLocalization();
    const { formatCurrency } = useCurrency();
    const { user } = useAuth();
    const { projectMaterials, orders, projectExpenses, projectBudgets, suppliers } = useData();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        setMessages([{
            role: 'model',
            text: `Hi ${user?.name}! I'm Leo, your AI assistant for the "${project.projectName}" project. Ask me anything about its status, budget, or materials.`
        }]);
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort("Unmounted");
            }
        };
    }, [project, user]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const dataContext = useMemo(() => {
        const materials = projectMaterials.filter(m => m.projectId === project.id);
        const relevantOrders = orders.filter(o => o.projectId === project.id);
        const expenses = projectExpenses.filter(e => e.projectId === project.id);
        const budget = projectBudgets.find(b => b.projectId === project.id);
        const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

        return `
            ## Project Context: ${project.projectName}
            - **Client:** ${project.clientName}
            - **Status:** ${project.status}
            - **Address:** ${project.address}
            - **Budget:** ${budget ? `Total: ${formatCurrency(budget.totalBudget)}, Spent: ${formatCurrency(totalSpent)}, Remaining: ${formatCurrency(budget.totalBudget - totalSpent)}` : "Not set"}
            
            ### Materials (${materials.length} items):
            ${materials.map(m => `- ${m.quantity} x ${m.productName} (Status: ${m.status}, Cost: ${formatCurrency(m.pricePerUnit * m.quantity)})`).join('\n')}

            ### Orders (${relevantOrders.length}):
            ${relevantOrders.map(o => `- Order #${o.orderNumber} (Status: ${o.status}, Total: ${formatCurrency(o.total)}, Supplier: ${suppliers.find(s => s.id === o.supplierId)?.name || 'Unknown'})`).join('\n')}

            ### Expenses (${expenses.length}):
            ${expenses.map(e => `- ${e.description} (${e.category}): ${formatCurrency(e.amount)}`).join('\n')}
        `;
    }, [project, projectMaterials, orders, projectExpenses, projectBudgets, formatCurrency, suppliers]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort("New message started");
        }
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage, { role: 'model', text: '' }]);
        setInput('');
        setIsLoading(true);
        setError(null);

        if (!process.env.API_KEY) {
            const errorMsg = "API Key not configured.";
            setError(errorMsg);
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { role: 'model', text: `Error: ${errorMsg}` };
                return newMessages;
            });
            setIsLoading(false);
            return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const systemInstruction = `You are Leo, a helpful AI Project Management assistant for a contractor. 
            Answer questions based *only* on the provided project context. 
            Keep answers concise and professional. Use markdown for formatting.`;
            
            const contents = [
                { role: 'user', parts: [{ text: `${systemInstruction}\n\n${dataContext}\n\n**User Question:**\n${userMessage.text}` }] }
            ];
            
            const response = await ai.models.generateContentStream({
                model: 'gemini-3-flash-preview',
                contents: contents,
                requestOptions: { signal }
            });

            let fullText = '';
            for await (const chunk of response) {
                if (signal.aborted) break;
                fullText += chunk.text || '';
                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    lastMsg.text = fullText;
                    return newMessages;
                });
            }
        } catch (err: any) {
            if (signal.aborted || err.name === 'AbortError' || err.message?.toLowerCase().includes('aborted')) {
                console.debug("Transmission sequence aborted.");
                return;
            }
            
            console.error("AI Project Assistant Error:", err);
            const errorMessage = "Neural link interference. Please retry transmission.";
            setError(errorMessage);
             setMessages(prev => {
                const newMessages = [...prev];
                const lastMsg = newMessages[newMessages.length - 1];
                lastMsg.text = errorMessage;
                return newMessages;
            });
        } finally {
            if (!signal.aborted) {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="flex flex-col h-[500px] bg-slate-900 border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-carbon opacity-5"></div>
            <div className="p-5 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl flex items-center justify-between relative z-10 text-left">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-3 text-slate-400">
                    <CpuChipIcon className="h-5 w-5 text-red-600 animate-pulse"/>
                    Project Analyst
                </h3>
                <span className="text-[8px] font-black bg-red-600/20 text-red-500 px-2 py-0.5 rounded-full border border-red-500/20 uppercase tracking-widest">Core v80.5</span>
            </div>
            
            <div className="flex-grow p-6 overflow-y-auto custom-scrollbar space-y-6 relative z-10">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 border ${msg.role === 'user' ? 'bg-red-600/10 border-red-600/20 text-red-500' : 'bg-blue-600/10 border-blue-600/20 text-blue-500'}`}>
                                {msg.role === 'user' ? <UserCircleIcon className="h-6 w-6"/> : <SparklesIcon className="h-5 w-5"/>}
                            </div>
                            <div className={`px-6 py-4 rounded-3xl text-sm leading-loose shadow-xl relative overflow-hidden text-left ${msg.role === 'user' ? 'bg-slate-800 text-white border border-white/5 rounded-tr-none' : 'bg-slate-950/50 text-slate-100 border border-white/10 rounded-tl-none italic font-medium'}`}>
                               <p className="whitespace-pre-wrap">{msg.text}</p>
                               {isLoading && index === messages.length - 1 && <span className="inline-block w-1.5 h-4 bg-red-600 animate-pulse ml-1 align-middle shadow-[0_0_8px_red]"></span>}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={chatEndRef}></div>
            </div>

             <div className="p-4 bg-slate-950 border-t border-white/5 relative z-20">
                {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-3 text-center">{error}</p>}
                <form onSubmit={handleSendMessage} className="flex items-center gap-3 relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Inquire regarding site dossier..."
                        className="w-full pl-6 pr-14 py-4 bg-white/5 border-2 border-white/5 rounded-2xl focus:border-red-600 outline-none text-white text-sm font-bold transition-all placeholder:text-slate-700 italic"
                        disabled={isLoading}
                    />
                    <button 
                        type="submit" 
                        className="absolute right-2 p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-30 disabled:grayscale transition-all shadow-xl active:scale-90" 
                        disabled={isLoading || !input.trim()}
                    >
                        <PaperAirplaneIcon className="h-5 w-5 -rotate-90 translate-x-0.5"/>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AIProjectAssistant;
