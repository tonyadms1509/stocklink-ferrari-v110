import React, { useState, useRef, useEffect } from 'react';
import { Conversation, Message, UserRole } from '../types';
import { 
    PaperAirplaneIcon, SparklesIcon, XMarkIcon, 
    ClipboardDocumentListIcon, AcademicCapIcon, 
    LanguageIcon, PhotoIcon, GlobeAmericasIcon,
    ArrowPathIcon, BoltIcon
} from '@heroicons/react/24/outline';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useDataContext';
import { GoogleGenAI } from '@google/genai';
import { useToast } from '../hooks/useToast';

interface ChatWindowProps {
    conversation: Conversation;
    currentUserId: string;
    onSendMessage: (text: string) => void;
    recipientName: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, currentUserId, onSendMessage, recipientName }) => {
    const { t } = useLocalization();
    const { user } = useAuth();
    const { showToast } = useToast();
    const { isRuggedMode } = useData();
    const [newMessage, setNewMessage] = useState('');
    const [isPolyglotActive, setIsPolyglotActive] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [conversation.messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        onSendMessage(newMessage.trim());
        setNewMessage('');
    };

    const toggleNeuralTranslation = async () => {
        if (!process.env.API_KEY) return;
        setIsPolyglotActive(!isPolyglotActive);
        showToast(isPolyglotActive ? "Polyglot Bridge Offline" : "Neural Translation Engaged", "info");
    };

    return (
        <div className={`flex flex-col h-full relative transition-colors ${isRuggedMode ? 'bg-white' : 'bg-slate-950'}`}>
            {/* HUD Header */}
            <div className={`px-8 py-6 border-b flex justify-between items-center shadow-2xl z-10 ${isRuggedMode ? 'bg-white border-black border-b-[3px]' : 'bg-slate-900/50 border-white/5 backdrop-blur-3xl'}`}>
                <div className="flex items-center gap-4 text-left">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-inner border ${isRuggedMode ? 'bg-white border-black text-black' : 'bg-white/5 border-white/10 text-blue-500'}`}>
                        {recipientName.charAt(0)}
                    </div>
                    <div>
                        <h3 className={`font-black italic uppercase tracking-tighter text-xl ${isRuggedMode ? 'text-black' : 'text-white'}`}>{recipientName}</h3>
                        <div className="flex items-center gap-2">
                             <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_#10b981] ${isRuggedMode ? 'bg-black' : 'bg-emerald-500 animate-pulse'}`}></div>
                             <span className={`text-[9px] uppercase font-black tracking-widest ${isRuggedMode ? 'text-black' : 'text-slate-500'}`}>Encrypted Link</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={toggleNeuralTranslation}
                        className={`p-3 rounded-2xl transition-all border flex items-center gap-2 ${isPolyglotActive ? (isRuggedMode ? 'bg-black text-white' : 'bg-blue-600 text-white border-blue-400') : 'bg-white/5 text-slate-400 border-white/10'}`}
                    >
                        <LanguageIcon className={`h-5 w-5 ${isPolyglotActive && !isRuggedMode ? 'animate-pulse' : ''}`}/>
                        <span className="text-[10px] font-black uppercase tracking-widest">Polyglot</span>
                    </button>
                    <button className={`p-3 rounded-2xl border transition-all ${isRuggedMode ? 'bg-slate-100 border-black' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}>
                        <GlobeAmericasIcon className="h-5 w-5"/>
                    </button>
                </div>
            </div>

            {/* Comms Feed */}
            <div className="flex-1 p-8 overflow-y-auto space-y-6 custom-scrollbar relative">
                {!isRuggedMode && <div className="absolute inset-0 bg-carbon opacity-5 pointer-events-none"></div>}

                {conversation.messages.map((msg, i) => {
                    const isMe = msg.senderId === currentUserId;
                    return (
                        <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                            <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden border ${isMe ? (isRuggedMode ? 'bg-white border-black border-[3px] rounded-tr-none' : 'bg-blue-600 text-white border-blue-500 rounded-tr-none') : (isRuggedMode ? 'bg-white border-black border-[3px] rounded-tl-none' : 'bg-slate-900 border border-white/10 text-slate-100 rounded-tl-none')}`}>
                                    {isPolyglotActive && msg.translatedText && !isMe && (
                                        <div className={`mb-4 pb-4 border-b ${isRuggedMode ? 'border-black' : 'border-white/10'}`}>
                                            <p className={`text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2 ${isRuggedMode ? 'text-black' : 'text-blue-400'}`}>
                                                <SparklesIcon className="h-3 w-3" /> Neural Translation ({msg.originalLanguage})
                                            </p>
                                            <p className={`text-base font-bold italic leading-relaxed ${isRuggedMode ? 'text-black' : 'text-white'}`}>{msg.translatedText}</p>
                                        </div>
                                    )}
                                    <p className={`text-sm leading-relaxed ${isRuggedMode ? 'text-black font-bold' : (isPolyglotActive && msg.translatedText && !isMe ? 'opacity-40 text-xs' : 'font-medium')}`}>
                                        {msg.text}
                                    </p>
                                    <p className={`text-[9px] font-black uppercase mt-4 font-mono ${isRuggedMode ? 'text-black' : 'text-slate-500 opacity-50'}`}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Control Console */}
            <div className={`p-8 border-t ${isRuggedMode ? 'bg-white border-black border-t-[3px]' : 'bg-slate-900/50 border-white/5 backdrop-blur-3xl'}`}>
                <form onSubmit={handleSend} className="flex items-end gap-4">
                    <div className="relative flex-grow">
                        <textarea 
                            value={newMessage} 
                            onChange={(e) => setNewMessage(e.target.value)} 
                            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); }}}
                            placeholder="Transmit operational directive..." 
                            rows={1} 
                            className={`w-full p-5 pr-20 border-2 rounded-3xl outline-none transition-all resize-none font-medium italic shadow-inner ${isRuggedMode ? 'bg-white border-black text-black font-black' : 'bg-white/5 border-white/5 text-white focus:border-blue-600'}`} 
                        />
                        <div className="absolute right-4 bottom-4 flex gap-2">
                            <button type="button" className={`p-2 transition-colors ${isRuggedMode ? 'text-black' : 'text-slate-500 hover:text-white'}`}>
                                <PhotoIcon className="h-6 w-6"/>
                            </button>
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={!newMessage.trim()} 
                        className={`p-5 rounded-3xl shadow-2xl transition-all transform active:scale-90 border disabled:opacity-30 group ${isRuggedMode ? 'bg-black text-white border-black' : 'bg-blue-600 hover:bg-blue-500 text-white border-white/10'}`}
                    >
                        <PaperAirplaneIcon className="h-7 w-7 -rotate-90 group-hover:scale-110 transition-transform"/>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;