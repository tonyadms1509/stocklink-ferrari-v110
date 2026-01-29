
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Dispute, UserRole } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import { PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/solid';

interface DisputeThreadProps {
    dispute: Dispute;
    onSendMessage: (disputeId: string, text: string) => void;
    onGenerateSuggestion: (disputeId: string) => void;
}

const DisputeThread: React.FC<DisputeThreadProps> = ({ dispute, onSendMessage, onGenerateSuggestion }) => {
    const { t } = useLocalization();
    const { user } = useAuth();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [dispute.messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSendMessage(dispute.id, newMessage.trim());
            setNewMessage('');
        }
    };

    const canGenerateSuggestion = useMemo(() => {
        const hasContractorMessage = dispute.messages.some(m => m.authorId === dispute.contractorId);
        const hasSupplierMessage = dispute.messages.some(m => m.authorId === dispute.supplierId);
        return hasContractorMessage && hasSupplierMessage;
    }, [dispute]);

    if (!user) return null;

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                    {dispute.messages.map(msg => {
                        const isSentByCurrentUser = msg.authorId === user.id;
                        const isAdmin = msg.authorId.includes('admin');
                        
                        let bubbleStyle = 'bg-base-200 text-gray-800';
                        if (isSentByCurrentUser) bubbleStyle = 'bg-primary text-white';
                        if (isAdmin) bubbleStyle = 'bg-yellow-100 text-yellow-800 border border-yellow-200';

                        return (
                            <div key={msg.id} className={`flex ${isSentByCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs lg:max-w-md`}>
                                     <p className={`text-xs mb-1 ${isSentByCurrentUser ? 'text-right' : 'text-left'} text-gray-500`}>{msg.authorName}</p>
                                    <div className={`px-4 py-2 rounded-2xl ${bubbleStyle}`}>
                                        <p>{msg.text}</p>
                                    </div>
                                     <p className={`text-xs mt-1 ${isSentByCurrentUser ? 'text-right' : 'text-left'} text-gray-500`}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
                 <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {dispute.status !== 'Resolved' && (
                <div className="p-4 border-t bg-base-100 rounded-br-lg">
                    <form onSubmit={handleSend} className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => onGenerateSuggestion(dispute.id)}
                            disabled={!canGenerateSuggestion}
                            title={canGenerateSuggestion ? "Get AI Mediation Suggestion" : "AI suggestion available after both parties reply"}
                            className="p-3 rounded-full text-primary bg-yellow-100 hover:bg-yellow-200 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <SparklesIcon className="h-6 w-6"/>
                        </button>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={t('messagesTypeMessage')}
                            className="w-full p-3 border-2 border-base-300 rounded-full focus:ring-primary focus:border-primary transition-colors"
                        />
                        <button type="submit" className="bg-secondary p-3 rounded-full text-white hover:bg-emerald-600 transition-colors flex-shrink-0">
                            <PaperAirplaneIcon className="h-6 w-6"/>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default DisputeThread;
