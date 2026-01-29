
import React, { useState, useRef, useEffect } from 'react';
import { Conversation, Message, UserRole } from '../types';
import { 
    PaperAirplaneIcon, SparklesIcon, XMarkIcon, 
    ClipboardDocumentListIcon, AcademicCapIcon, 
    LanguageIcon, PhotoIcon, GlobeAmericasIcon,
    ArrowPathIcon, BoltIcon
} from '@heroicons/react/24/outline';
import { BrainCircuit, Target, Activity } from 'lucide-react';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useDataContext';
import { GoogleGenAI } from '@google/genai';
import { useToast } from '../hooks/useToast';
import SupplierNegotiationCoachModal from './SupplierNegotiationCoachModal';

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
    const [isCoachOpen, setIsCoachOpen] = useState(false);
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
        setIsPolyglotActive(!isPolyglotActive);
        showToast(isPolyglotActive ? "Polyglot Bridge Offline" : "Neural Translation Engaged", "info");
    };

    return (
        <div className={`flex flex-col h-full relative transition-all duration-700 ${isRuggedMode ? 'bg-white' : 'bg-slate-950'}`}>
            {/* HUD Header */}
            <div className={`px-10 py-8 border-b flex justify-between items-center shadow-2xl z-10 transition-all duration-700 ${isRuggedMode ? 'bg-white border-black border-b-[4px]' : 'bg-slate-900/60 border-white/5 backdrop-blur-3xl'}`}>
                <div className="flex items-center gap-6 text-left">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black shadow-2xl border transition-all duration-500 ${isRuggedMode ? 'bg-white border-black text-black border-4' : 'bg-slate-800 border-white/10 text-blue-500'}`}>
                        {recipientName.charAt(0)}
                    </div>
                    <div className="text-left">
                        <h3 className={`font-black italic uppercase tracking-tighter text-2xl ${isRuggedMode ? 'text-black' : 'text-white'}`}>{recipientName}</h3>
                        <div className="flex items-center gap-3 mt-1">
                             <div className={`w-2 h-2 rounded-full animate-pulse shadow-lg ${isRuggedMode ? 'bg-black' : 'bg-emerald-500 shadow-emerald-500/40'}`}></div>
                             <span className={`text-[10px] uppercase font-black tracking-widest ${isRuggedMode ? 'text-black' : 'text-slate-500'}`}>Secure Uplink v1.2</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={() => setIsCoachOpen(true)}
                        className={`p-4 rounded-2xl transition-all border flex items-center gap-3 shadow-xl transform active:scale-95 ${isRuggedMode ? 'bg-white border-black text-black border-4' : 'bg-slate-950 border-white/10 text-red-600 hover:border-red-600/30'}`}
                    >
                        <BrainCircuit size={20} className={!isRuggedMode ? 'animate-pulse' : ''}/>
                        <span className="text-[10px] font-black uppercase tracking-widest">Neural Coach</span>
                    </button>
                    <button 
                        onClick={toggleNeuralTranslation}
                        className={`p-4 rounded-2xl transition-all border flex items-center gap-3 shadow-xl transform active:scale-95 ${isPolyglotActive ? (isRuggedMode ? 'bg-black text-white border-black border-4' : 'bg-blue-600 text-white border-blue-400') : (isRuggedMode ? 'bg-white border-black border-4 text-black' : 'bg-slate-950 text-slate-400 border-white/10')}`}
                    >
                        <LanguageIcon className={`h-5 w-5 ${isPolyglotActive && !isRuggedMode ? 'animate-pulse' : ''}`}/>
                        <span className="text-[10px] font-black uppercase tracking-widest">Polyglot</span>
                    </button>
                </div>
            </div>

            {/* Comms Feed */}
            <div className="flex-1 p-10 overflow-y-auto space-y-8 custom-scrollbar relative">
                {!isRuggedMode && <div className="absolute inset-0 bg-carbon opacity-5 pointer-events-none"></div>}

                {conversation.messages.map((msg, i) => {
                    const isMe = msg.senderId === currentUserId;
                    return (
                        <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                            <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`p-8 rounded-[3rem] shadow-2xl relative overflow-hidden border transition-all duration-500 ${isMe ? (isRuggedMode ? 'bg-white border-black border-[4px] rounded-tr-none' : 'bg-blue-600 text-white border-blue-500 rounded-tr-none shadow-blue-900/40') : (isRuggedMode ? 'bg-white border-black border-[4px] rounded-tl-none' : 'bg-slate-900 border border-white/10 text-slate-100 rounded-tl-none')}`}>
                                    {isPolyglotActive && msg.translatedText && !isMe && (
                                        <div className={`mb-6 pb-6 border-b transition-all ${isRuggedMode ? 'border-black' : 'border-white/10'}`}>
                                            <p className={`text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-3 ${isRuggedMode ? 'text-black' : 'text-blue-400'}`}>
                                                <SparklesIcon className="h-4 w-4 animate-pulse" /> Neural Interpretation ({msg.originalLanguage})
                                            </p>
                                            <p className={`text-xl font-bold italic leading-relaxed ${isRuggedMode ? 'text-black font-black' : 'text-white'}`}>{msg.translatedText}</p>
                                        </div>
                                    )}
                                    <p className={`text-base leading-loose font-medium ${isRuggedMode ? 'text-black font-black' : (isPolyglotActive && msg.translatedText && !isMe ? 'opacity-40 text-xs italic' : 'text-slate-100')}`}>
                                        {msg.text}
                                    </p>
                                    <p className={`text-[9px] font-black uppercase mt-6 font-mono ${isRuggedMode ? 'text-black' : 'text-slate-500 opacity-50'}`}>
                                        Transmission Time: {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Control Console */}
            <div className={`p-10 border-t transition-all duration-700 ${isRuggedMode ? 'bg-white border-black border-t-[4px]' : 'bg-slate-900/40 border-white/5 backdrop-blur-3xl'}`}>
                <form onSubmit={handleSend} className="flex items-end gap-6">
                    <div className="relative flex-grow">
                        <textarea 
                            value={newMessage} 
                            onChange={(e) => setNewMessage(e.target.value)} 
                            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); }}}
                            placeholder="Transmit operational directive..." 
                            rows={1} 
                            className={`w-full p-6 pr-20 border-4 rounded-[2.5rem] outline-none transition-all resize-none font-medium italic shadow-inner ${isRuggedMode ? 'bg-white border-black text-black font-black' : 'bg-black/40 border-white/5 text-white focus:border-red-600'}`} 
                        />
                        <div className="absolute right-6 bottom-6 flex gap-3">
                            <button type="button" className={`p-2 transition-all transform hover:scale-110 active:scale-90 ${isRuggedMode ? 'text-black' : 'text-slate-600 hover:text-white'}`}>
                                <PhotoIcon className="h-7 w-7"/>
                            </button>
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={!newMessage.trim()} 
                        className={`p-6 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all transform active:scale-90 border-4 disabled:opacity-30 group ${isRuggedMode ? 'bg-black text-white border-black' : 'bg-red-600 hover:bg-red-700 text-white border-slate-950 shadow-red-900/40'}`}
                    >
                        <PaperAirplaneIcon className="h-8 w-8 -rotate-90 group-hover:scale-110 transition-transform"/>
                    </button>
                </form>
            </div>
            {isCoachOpen && (
                <SupplierNegotiationCoachModal 
                    conversation={conversation} 
                    currentUserId={currentUserId} 
                    onClose={() => setIsCoachOpen(false)}
                    onUseDraft={(txt) => setNewMessage(txt)}
                />
            )}
        </div>
    );
};

export default ChatWindow;
