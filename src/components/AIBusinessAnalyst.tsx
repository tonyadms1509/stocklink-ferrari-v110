import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useData } from '../hooks/useDataContext';
import { useAuth } from '../hooks/useAuth';
import { useLocalization } from '../hooks/useLocalization';
import { useCurrency } from '../hooks/useCurrency';
import { GoogleGenAI } from '@google/genai';
import { PaperAirplaneIcon, SparklesIcon, LightBulbIcon, UserCircleIcon } from '@heroicons/react/24/solid';

interface Message {
    role: 'user' | 'model';
    text: string;
}

const SUGGESTED_PROMPTS = [
    "Who are my top customers?",
    "Which products are low on stock?",
    "Analyze my sales for this month",
    "Identify slow-moving inventory"
];

const AIBusinessAnalyst: React.FC = () => {
    const { t } = useLocalization();
    const { formatCurrency } = useCurrency();
    const { user } = useAuth();
    const { orders, products, users } = useData();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMessages([{ role: 'model', text: t('biChatWelcome') }]);
    }, [t]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const dataContext = useMemo(() => {
        if (!user) return "No user data available.";
        
        const myOrders = orders.filter(o => o.supplierId === user.id);
        const myProducts = products.filter(p => p.supplierId === user.id);
        const customerIds = [...new Set(myOrders.map(o => o.contractorId))];
        const myCustomers = users.filter(u => customerIds.includes(u.id));

        // Summarize data to keep the prompt manageable
        const orderSummary = myOrders.slice(0, 50).map(o => ({
            orderNumber: o.orderNumber,
            total: o.total,
            status: o.status,
            date: o.createdAt.toISOString().split('T')[0],
            customer: o.contractorName,
        }));

        const productSummary = myProducts.map(p => ({
            name: p.name,
            price: p.price,
            stock: p.stock,
            category: p.category,
        }));
        
        const customerSummary = myCustomers.map(c => c.name);

        return `
            ## Business Data Context for Supplier: ${user.name}
            - **Today's Date:** ${new Date().toISOString().split('T')[0]}
            - **Total Products:** ${productSummary.length}
            - **Total Orders:** ${orderSummary.length}
            - **Total Unique Customers:** ${customerSummary.length}

            ### Recent Orders (sample):
            ${JSON.stringify(orderSummary)}

            ### Product Catalog (summary):
            ${JSON.stringify(productSummary)}
            
            ### Customer List:
            ${customerSummary.join(', ')}
        `;
    }, [user, orders, products, users]);

    const handleSendMessage = async (textOverride?: string) => {
        const textToSend = textOverride || input;
        if (!textToSend.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', text: textToSend };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        // Add placeholder for streaming response
        setMessages(prev => [...prev, { role: 'model', text: '' }]);

        if (!process.env.API_KEY) {
            setError("API Key not configured.");
            setIsLoading(false);
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { role: 'model', text: "Error: API Key not configured." };
                return newMessages;
            });
            return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const systemInstruction = `You are a helpful AI Business Analyst for a building materials supplier in South Africa. Your name is Leo. You must answer questions based *only* on the provided business data context. If the answer cannot be found in the context, clearly state that you do not have that information. Keep your answers concise, data-driven, and professional. Format your answers for readability (use newlines and bullet points where appropriate).`;

            // Combine previous messages for conversation history (last 10 to save tokens)
            const history = messages.slice(-10).map(m => `${m.role}: ${m.text}`).join('\n');
            
            const contents = `${systemInstruction}\n\n${dataContext}\n\n**Conversation History:**\n${history}\n\n**New User Question:**\n${userMessage.text}`;
            
            const response = await ai.models.generateContentStream({
                model: 'gemini-2.5-flash',
                contents: contents
            });
            
            let fullText = '';
            for await (const chunk of response) {
                // Fix: ensure chunk.text is defined before building the fullText string to prevent adding the literal "undefined"
                fullText += chunk.text || '';
                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    lastMsg.text = fullText;
                    return newMessages;
                });
            }

        } catch (err) {
            console.error("AI Business Analyst Error:", err);
            const errorMessage = "Sorry, I encountered an error while analyzing your data. Please try again.";
            setError(errorMessage);
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMsg = newMessages[newMessages.length - 1];
                lastMsg.text = errorMessage;
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage();
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 p-2 rounded-lg">
                    <SparklesIcon className="h-6 w-6 text-purple-600"/>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800">{t('biChatTitle')}</h3>
                    <p className="text-xs text-gray-500">{t('biChatDescription')}</p>
                </div>
            </div>

            <div className="flex flex-col h-[500px] border rounded-xl overflow-hidden bg-gray-50/50">
                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                    {msg.role === 'user' ? <UserCircleIcon className="h-6 w-6"/> : <SparklesIcon className="h-5 w-5"/>}
                                </div>
                                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}`}>
                                   <p className="whitespace-pre-wrap">{msg.text}</p>
                                   {isLoading && index === messages.length - 1 && <span className="inline-block w-1.5 h-4 bg-purple-400 animate-pulse ml-1 align-middle"></span>}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef}></div>
                </div>
                
                {messages.length === 1 && (
                     <div className="px-4 py-3 bg-white border-t border-gray-50 flex gap-2 overflow-x-auto no-scrollbar">
                        {SUGGESTED_PROMPTS.map((prompt, i) => (
                            <button 
                                key={i} 
                                onClick={() => handleSendMessage(prompt)}
                                className="flex-shrink-0 px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-bold rounded-full border border-purple-100 hover:bg-purple-100 transition-colors flex items-center gap-1"
                            >
                                <LightBulbIcon className="h-3 w-3"/>
                                {prompt}
                            </button>
                        ))}
                     </div>
                )}

                <div className="p-3 bg-white border-t border-gray-100">
                    {error && <p className="text-red-500 text-xs mb-2 text-center bg-red-50 p-1 rounded">{error}</p>}
                    <form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t('biChatPlaceholder')}
                            className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-all"
                            disabled={isLoading}
                        />
                        <button 
                            type="submit" 
                            className="absolute right-2 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:bg-gray-400 transition-colors shadow-sm"
                            disabled={isLoading || !input.trim()}
                        >
                            <PaperAirplaneIcon className="h-4 w-4"/>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AIBusinessAnalyst;