import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Project } from '../types';
import { useData } from '../hooks/useDataContext';
import { useAuth } from '../hooks/useAuth';
import { useCurrency } from '../hooks/useCurrency';
import { GoogleGenAI } from '@google/genai';
import { PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/solid';

interface Message {
    role: 'user' | 'model';
    text: string;
}

interface AIProjectAnalystProps {
    project: Project;
}

const AIProjectAnalyst: React.FC<AIProjectAnalystProps> = ({ project }) => {
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
            text: `Hi ${user?.name}! I'm your AI assistant for the "${project.projectName}" project. Ask me anything about its status, budget, or materials.`
        }]);
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
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
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;
        const signal = controller.signal;

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage, { role: 'model', text: '' }]);
        setInput('');
        setIsLoading(true);
        setError(null);

        if (!process.env.API_KEY) {
            const errorMsg = "API Key not configured for AI features.";
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
            const systemInstruction = `You are Leo, a helpful AI Project Management assistant for a contractor. Answer questions based *only* on the provided project context. If the answer isn't in the context, say you don't have that information. Keep answers concise.`;
            
            const contents = `${systemInstruction}\n\n${dataContext}\n\n**User Question:**\n${userMessage.text}`;
            
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
                console.debug("AI Stream aborted intentionally.");
                return;
            }
            console.error("AI Project Analyst Error:", err);
            const errorMessage = "Sorry, I encountered an error. Please try again.";
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
        <div className="flex flex-col h-[70vh] bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b bg-base-100 rounded-t-lg flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 text-primary"/>
                <h3 className="text-lg font-bold">AI Project Analyst</h3>
            </div>
            <div className="flex-grow p-4 overflow-y-auto text-left">
                <div className="space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-md px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-base-200 text-gray-800'}`}>
                               <p className="whitespace-pre-wrap">{msg.text}</p>
                               {isLoading && index === messages.length - 1 && <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-1 align-middle"></span>}
                            </div>
                        </div>
                    ))}
                </div>
                <div ref={chatEndRef}></div>
            </div>
             <div className="p-4 border-t bg-base-100 rounded-b-lg">
                {error && <p className="text-red-500 text-sm mb-2 text-center">{error}</p>}
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="e.g., 'What's my budget status?'"
                        className="w-full p-2 border-2 border-base-300 rounded-full focus:ring-primary focus:border-primary"
                        disabled={isLoading}
                    />
                    <button type="submit" className="bg-secondary p-2.5 rounded-full text-white hover:bg-emerald-600 disabled:opacity-50" disabled={isLoading || !input.trim()}>
                        <PaperAirplaneIcon className="h-5 w-5"/>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AIProjectAnalyst;