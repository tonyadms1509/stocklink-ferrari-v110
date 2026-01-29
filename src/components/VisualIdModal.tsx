import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse, Part } from '@google/genai';
import { XMarkIcon, SparklesIcon, MagnifyingGlassIcon, DocumentArrowUpIcon, ChatBubbleLeftRightIcon, CameraIcon } from '@heroicons/react/24/solid';

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
            // Ensure API Key is available
            if (!process.env.API_KEY) {
                if (window.aistudio) {
                    const hasKey = await window.aistudio.hasSelectedApiKey();
                    if (!hasKey) {
                        await window.aistudio.openSelectKey();
                    }
                } else {
                    setError("API key not configured.");
                    setStatus('error');
                    return;
                }
            }

            setStatus('analyzing');
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const { mimeType, data } = await fileToBase64(imageFile);
                const imagePart: Part = { inlineData: { mimeType, data } };
                
                const idPrompt = "Identify this building material or tool. Respond with ONLY the specific product name. No extra text.";
                const idResult: GenerateContentResponse = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: { parts: [imagePart, { text: idPrompt }] }
                });
                
                const identifiedName = (idResult.text || '').trim();
                if (!identifiedName) throw new Error("No item identified.");
                
                setIdentification(identifiedName);
                setStatus('success');

                const initialModelMessage = `I've identified this as a "${identifiedName}". I can help with technical specs or finding it in stock. How can I help?`;
                setChatHistory([{ role: 'model', text: initialModelMessage }]);

                const newChat = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    history: [
                        { role: 'user', parts: [imagePart, { text: `The item in this image is a "${identifiedName}".` }] },
                        { role: 'model', parts: [{ text: initialModelMessage }] }
                    ]
                });
                setChat(newChat);

            } catch (err: any) {
                console.error("Visual ID error:", err);
                if (err.message?.includes('Requested entity was not found')) {
                    if (window.aistudio) await window.aistudio.openSelectKey();
                }
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
            const text = result.text ? result.text.trim() : "I couldn't process that.";
            setChatHistory(prev => [...prev, { role: 'model', text }]);
        } catch (err) {
            setChatHistory(prev => [...prev, { role: 'model', text: "Error in communication." }]);
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

    const suggestedQuestions = ["What is this for?", "Installation tips?", "Search StockLink"];

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-4xl w-full h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2"><CameraIcon className="h-7 w-7 text-primary"/> Visual ID</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-1"><XMarkIcon className="h-6 w-6" /></button>
                </div>
                
                {status === 'idle' ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-grow flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary hover:bg-blue-50 transition-colors group"
                    >
                        <div className="bg-gray-100 p-4 rounded-full mb-4 group-hover:bg-white group-hover:shadow-md transition-all">
                            <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 group-hover:text-primary" />
                        </div>
                        <p className="mt-4 text-xl font-bold text-gray-700">Click to Upload Image</p>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0 flex-grow">
                        <div className="flex flex-col bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="relative flex-grow flex items-center justify-center bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
                                <img src={previewUrl || ''} alt="Preview" className="max-w-full max-h-full object-contain" />
                                {status === 'analyzing' && (
                                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center flex-col">
                                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                                        <p className="font-bold text-gray-700 animate-pulse">Analyzing...</p>
                                    </div>
                                )}
                            </div>
                            
                            {status === 'error' && <p className="text-center text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
                            
                            {status === 'success' && (
                                <div className="text-center">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Detected</p>
                                    <h3 className="text-2xl font-black text-gray-900 mb-4">{identification}</h3>
                                    <button 
                                        onClick={() => { onSearch(identification); handleClose(); }} 
                                        className="w-full bg-primary text-white font-black py-3 px-4 rounded-xl hover:bg-blue-700 shadow-md transition-all active:scale-95 uppercase tracking-widest text-xs"
                                    >
                                        Search Catalog
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-3 bg-gray-50 border-b flex items-center gap-2">
                                <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-500"/>
                                <span className="font-bold text-sm text-gray-700">AI Assistant</span>
                            </div>
                            
                            <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-white">
                                {chatHistory.map((msg, index) => (
                                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                                            <p>{msg.text}</p>
                                        </div>
                                    </div>
                                ))}
                                {isChatLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-tl-none border border-gray-200">
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef}></div>
                            </div>
                            
                            {status === 'success' && (
                                <div className="p-3 border-t bg-gray-50">
                                    <div className="flex flex-wrap gap-2 justify-center mb-3">
                                        {suggestedQuestions.map((q, i) => (
                                            <button 
                                                key={i} 
                                                onClick={() => submitChatMessage(q)} 
                                                disabled={isChatLoading} 
                                                className="text-[10px] font-black uppercase tracking-widest bg-white border border-gray-200 hover:border-primary text-gray-600 hover:text-primary px-3 py-1.5 rounded-full shadow-sm transition-colors"
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                    <form onSubmit={handleChatSubmit} className="relative">
                                        <input 
                                            type="text" 
                                            value={chatInput} 
                                            onChange={e => setChatInput(e.target.value)} 
                                            placeholder="Ask a technical question..." 
                                            className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-inner" 
                                            disabled={isChatLoading}
                                        />
                                        <button 
                                            type="submit" 
                                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white p-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors" 
                                            disabled={isChatLoading}
                                        >
                                            <SparklesIcon className="w-4 h-4"/>
                                        </button>
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