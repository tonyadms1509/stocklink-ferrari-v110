
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse, Part } from '@google/genai';
import { XMarkIcon, SparklesIcon, MagnifyingGlassIcon, DocumentArrowUpIcon } from '@heroicons/react/24/solid';

const fileToBase64 = (file: File): Promise<{ mimeType: string; data: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const [header, data] = result.split(',');
            const mimeType = header.match(/:(.*?);/)?.[1];
            if (mimeType && data) {
                resolve({ mimeType, data });
            } else {
                reject(new Error("Could not parse file data."));
            }
        };
        reader.onerror = error => reject(error);
    });
};

interface VisualIdModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (searchTerm: string) => void;
}

const VisualIdModal: React.FC<VisualIdModalProps> = ({ isOpen, onClose, onSearch }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'analyzing' | 'success' | 'error'>('idle');
    const [identification, setIdentification] = useState('');
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [chat, setChat] = useState<Chat | null>(null);
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', text: string }[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const resetState = () => {
        setImageFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setStatus('idle');
        setIdentification('');
        setError('');
        setChat(null);
        setChatHistory([]);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    useEffect(() => {
        if (!isOpen) {
            resetState();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!imageFile) return;

        const analyzeImage = async () => {
            setStatus('analyzing');
            if (!process.env.API_KEY) {
                setError("API key not configured.");
                setStatus('error');
                return;
            }
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const { mimeType, data } = await fileToBase64(imageFile);
                const imagePart: Part = { inlineData: { mimeType, data } };
                
                const idPrompt = "Analyze this image of a building material or tool. Identify the most specific, searchable name for the item. Respond with ONLY the item name, no extra text.";
                // Fix: Updated model name to gemini-3-flash-preview
                const idResult: GenerateContentResponse = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: { parts: [imagePart, { text: idPrompt }] }
                });
                
                // Fix: Ensure correct property access for text
                const identifiedName = (idResult.text || '').trim();
                if (!identifiedName) throw new Error("No item identified.");
                
                setIdentification(identifiedName);
                setStatus('success');

                const initialModelMessage = `I've identified this as a "${identifiedName}". I can now answer questions about it. How can I help?`;
                setChatHistory([{ role: 'model', text: initialModelMessage }]);

                // Fix: Updated model name to gemini-3-flash-preview
                const newChat = ai.chats.create({
                    model: 'gemini-3-flash-preview',
                    history: [
                        { role: 'user', parts: [imagePart, { text: `The item in this image has been identified as a "${identifiedName}".` }] },
                        { role: 'model', parts: [{ text: initialModelMessage }] }
                    ]
                });
                setChat(newChat);

            } catch (err) {
                console.error("Visual ID error:", err);
                setError("Sorry, I couldn't identify that item. Please try a clearer photo.");
                setStatus('error');
            }
        };

        analyzeImage();
    }, [imageFile]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory, isChatLoading]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const submitChatMessage = async (message: string) => {
        if (!message.trim() || !chat || isChatLoading) return;

        setChatHistory(prev => [...prev, { role: 'user', text: message }]);
        setIsChatLoading(true);

        try {
            const result = await chat.sendMessage({ message: message });
            // Fix: Ensure correct property access for text
            const text = result.text ? result.text.trim() : "I'm sorry, I couldn't generate a response.";
            setChatHistory(prev => [...prev, { role: 'model', text }]);
        } catch (err) {
            console.error("Chat error:", err);
            setChatHistory(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsChatLoading(false);
        }
    }

    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        submitChatMessage(chatInput);
        setChatInput('');
    };
    
    if (!isOpen) return null;

    const suggestedQuestions = ["What is this used for?", "Are there alternatives?", "Installation tips?"];

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full h-auto max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-primary flex items-center gap-2"><SparklesIcon className="h-6 w-6"/> Visual ID & Assist</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="h-6 w-6" /></button>
                </div>
                
                {status === 'idle' ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-grow flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors"
                    >
                        <DocumentArrowUpIcon className="h-16 w-16 text-gray-400" />
                        <p className="mt-4 text-lg font-semibold text-gray-700">Click to Upload an Image</p>
                        <p className="text-sm text-gray-500">or drag and drop</p>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0 flex-grow">
                        <div className="flex flex-col">
                            <img src={previewUrl} alt="Uploaded item" className="rounded-lg border object-contain h-64 w-full bg-gray-100" />
                            {status === 'analyzing' && <p className="text-center mt-4 font-semibold">Analyzing image...</p>}
                            {status === 'error' && <p className="text-center mt-4 text-red-600">{error}</p>}
                            {status === 'success' && (
                                <div className="text-center mt-4">
                                    <p className="text-sm text-gray-500">AI Identified Item:</p>
                                    <h3 className="text-xl font-bold">{identification}</h3>
                                    <button onClick={() => { onSearch(identification); handleClose(); }} className="mt-2 w-full flex items-center justify-center gap-2 bg-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-600">
                                        <MagnifyingGlassIcon className="h-5 w-5" />
                                        Search for this item
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col bg-gray-50 rounded-lg border h-[26rem] md:h-auto">
                            <div className="p-2 border-b text-sm font-semibold text-center">Need Help?</div>
                            <div className="flex-grow p-3 overflow-y-auto space-y-3">
                                {chatHistory.map((msg, index) => (
                                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-xs px-3 py-1.5 rounded-xl ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                                            <p className="text-sm">{msg.text}</p>
                                        </div>
                                    </div>
                                ))}
                                {isChatLoading && (
                                    <div className="flex justify-start">
                                        <div className="max-w-xs px-3 py-1.5 rounded-xl bg-gray-200">
                                            <div className="flex items-center gap-2 text-sm">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef}></div>
                            </div>
                            {status === 'success' && (
                                <div className="p-2 border-t">
                                    <div className="flex flex-wrap gap-1 justify-center mb-2">
                                        {suggestedQuestions.map((q, i) => (
                                            <button key={i} onClick={() => submitChatMessage(q)} disabled={isChatLoading} className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded-full disabled:opacity-50">
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                    <form onSubmit={handleChatSubmit}>
                                        <div className="relative">
                                            <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Ask about this item..." className="w-full p-2 pr-10 border rounded-full text-sm" disabled={isChatLoading}/>
                                            <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 bg-primary text-white p-1.5 rounded-full" disabled={isChatLoading}>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.949a.75.75 0 00.95.826L11.25 9.25v1.5l-7.145 1.19a.75.75 0 00-.95.826l1.414 4.949a.75.75 0 00.95.826l13.25-2.209a.75.75 0 000-1.418L3.105 2.29z" /></svg>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VisualIdModal;
