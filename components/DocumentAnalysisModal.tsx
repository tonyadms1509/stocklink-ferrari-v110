
import React, { useState, useRef, useEffect } from 'react';
import { ProjectDocument } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { GoogleGenAI, Part } from '@google/genai';
import { XMarkIcon, PaperAirplaneIcon, SparklesIcon, DocumentTextIcon } from '@heroicons/react/24/solid';

interface DocumentAnalysisModalProps {
    document: ProjectDocument;
    onClose: () => void;
}

const DocumentAnalysisModal: React.FC<DocumentAnalysisModalProps> = ({ document, onClose }) => {
    const { t } = useLocalization();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
        { role: 'model', text: `I've loaded "${document.name}". What would you like to know about it?` }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !process.env.API_KEY) return;

        const userMessage = input;
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const systemInstruction = `You are a helpful assistant analyzing a construction document. Answer questions based ONLY on the provided document content. If the answer is not in the document, say so.`;
            
            // Prepare content
            let contents: any = { parts: [] };
            
            // Inject document context
            if (document.fileType === 'text' && document.textContent) {
                 contents.parts.push({ text: `Document Content:\n${document.textContent}\n\n` });
            } else if (document.fileType === 'image' && document.base64Data) {
                 // If we had the base64 stored (e.g. for newly uploaded images in this session)
                 // For the mock 'url', we can't easily fetch it here without CORS/setup, so we'll assume mock text for the demo if base64 is missing.
                 contents.parts.push({ text: `[Image Analysis Context would go here in a real app. For this demo, assume the image contains standard architectural details for a floor plan.]` });
            } else if (document.fileType === 'image' && document.url.startsWith('data:image')) {
                  // If URL is data URI
                  const base64 = document.url.split(',')[1];
                  const mimeType = document.url.split(':')[1].split(';')[0];
                  contents.parts.push({ inlineData: { mimeType, data: base64 } });
            } else {
                // Fallback for mock data urls that aren't real
                 contents.parts.push({ text: `(Simulated Content for ${document.name})` });
            }

            // Append conversation history
            // Note: For simplicity in this stateless modal, we send history in the prompt text or structure it as a multi-turn chat.
            // We'll just append the latest question for this single-turn demo effect or construct a history array if using chat mode.
            
            // Let's use chat mode for better context
            const chatHistory = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));
            
            // We need to initialize the chat with the doc content in the history or system instruction
            // Simpler: Just use generateContent with history context in the prompt for now to avoid complex Chat session management logic here
            
            const prompt = `${systemInstruction}\n\nUser Question: ${userMessage}`;
            // Add doc context again for single-turn robustness if not using stateful chat object
            // A real implementation would maintain a `ChatSession`.
            
            // Re-building full prompt context each time for simplicity
            const fullPromptParts = [
                ...contents.parts,
                { text: `\n\nChat History:\n${messages.map(m => `${m.role}: ${m.text}`).join('\n')}\nUser: ${userMessage}` }
            ];

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: fullPromptParts }
            });

            setMessages(prev => [...prev, { role: 'model', text: response.text }]);

        } catch (err) {
            console.error("Doc Analysis Error:", err);
            setError("Failed to analyze document.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[80] p-4 animate-fade-in-scale">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full flex flex-col h-[600px]">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                        <SparklesIcon className="h-6 w-6 text-accent"/>
                        {t('documentAnalysisTitle')}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XMarkIcon className="h-6 w-6"/></button>
                </div>
                
                <div className="p-2 bg-blue-50 border-b border-blue-100 text-xs text-blue-800 text-center">
                    Analyzing: <strong>{document.name}</strong>
                </div>

                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'}`}>
                                <p>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 p-3 rounded-lg text-sm text-gray-500 italic">
                                {t('documentAnalysisThinking')}
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-4 border-t bg-white rounded-b-xl">
                    {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
                    <div className="flex items-center gap-2">
                        <input 
                            type="text" 
                            value={input} 
                            onChange={e => setInput(e.target.value)} 
                            placeholder={t('documentAnalysisPlaceholder')} 
                            className="flex-grow p-2 border rounded-full focus:ring-2 focus:ring-primary focus:border-transparent"
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading || !input.trim()} className="p-2 bg-primary text-white rounded-full hover:bg-blue-700 disabled:opacity-50">
                            <PaperAirplaneIcon className="h-5 w-5"/>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DocumentAnalysisModal;
