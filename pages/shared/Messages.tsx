
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../hooks/useDataContext';
import { UserRole, SupplierTab } from '../../types';
import { ChatBubbleLeftRightIcon, ArrowLeftIcon, MagnifyingGlassIcon, SparklesIcon } from '@heroicons/react/24/outline';
import ChatWindow from '../../components/ChatWindow';
import { useAuth } from '../../hooks/useAuth';
import { useLocalization } from '../../hooks/useLocalization';

interface MessagesProps {
  initialSelectedId?: string | null;
  onClearInitialId?: () => void;
  onBack?: () => void;
  onNavigate?: (tab: any) => void;
}

const Messages: React.FC<MessagesProps> = ({ initialSelectedId, onClearInitialId, onBack, onNavigate }) => {
    const { conversations, sendMessage, markAsRead } = useData();
    const { user, currentCompany } = useAuth();
    const { t } = useLocalization();
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if(initialSelectedId) {
            setSelectedConversationId(initialSelectedId);
            if(onClearInitialId) onClearInitialId();
        }
    }, [initialSelectedId, onClearInitialId]);

    const myConversations = useMemo(() => {
        return [...conversations]
            .filter(c => {
                 const name = currentCompany?.type === UserRole.Contractor ? c.participants.supplierName : c.participants.contractorName;
                 return name?.toLowerCase().includes(searchTerm.toLowerCase());
            })
            .sort((a, b) => (b.lastMessage?.timestamp.getTime() || 0) - (a.lastMessage?.timestamp.getTime() || 0));
    }, [conversations, searchTerm, currentCompany]);

    const selectedConversation = useMemo(() => {
        return myConversations.find(c => c.id === selectedConversationId);
    }, [myConversations, selectedConversationId]);

    if(!user || !currentCompany) return null;

    return (
        <div className="h-full flex flex-col animate-fade-in">
            {onBack && (
                <button onClick={onBack} className="flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6 font-black uppercase tracking-widest">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back
                </button>
            )}
             
             <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-200 h-[calc(100vh-180px)] min-h-[600px] flex overflow-hidden">
                {/* Conversation List */}
                <aside className={`${selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 lg:w-1/4 border-r border-gray-100 flex-col bg-gray-50/30`}>
                    <div className="p-6 border-b border-gray-100 bg-white">
                        <h3 className="font-black text-2xl text-gray-900 tracking-tighter uppercase italic mb-6">Messages</h3>
                        <div className="relative">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            <input 
                                type="text" 
                                placeholder="Search grid..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-100 border-transparent rounded-2xl text-sm font-medium outline-none"
                            />
                        </div>
                    </div>
                    <ul className="overflow-y-auto flex-1 divide-y divide-gray-100/50">
                        {myConversations.map(convo => {
                            const otherName = currentCompany.type === UserRole.Contractor ? convo.participants.supplierName : convo.participants.contractorName;
                            const isSelected = selectedConversationId === convo.id;
                            return (
                                <li key={convo.id}>
                                    <button 
                                        onClick={() => setSelectedConversationId(convo.id)}
                                        className={`w-full text-left p-5 flex items-center gap-4 transition-all ${isSelected ? 'bg-white shadow-lg' : 'hover:bg-gray-100/50'}`}
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center text-gray-500 font-black">{otherName?.charAt(0)}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black truncate text-sm uppercase tracking-tight">{otherName}</p>
                                            <p className="text-xs truncate text-gray-500">{convo.lastMessage?.text || 'No messages'}</p>
                                        </div>
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                </aside>

                {/* Chat Window */}
                <main className="flex-1 bg-white">
                    {selectedConversation ? (
                        <ChatWindow 
                            conversation={selectedConversation}
                            currentUserId={user.id}
                            onSendMessage={(txt) => sendMessage(selectedConversation.id, txt)}
                            recipientName={currentCompany.type === UserRole.Contractor ? selectedConversation.participants.supplierName : selectedConversation.participants.contractorName}
                        />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gray-50/50">
                            <ChatBubbleLeftRightIcon className="h-20 w-20 text-slate-200 mb-4"/>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">Secure Uplink</h2>
                            <p className="mt-2 text-gray-500 max-w-xs font-medium text-sm">Select a contact to begin high-fidelity transmission.</p>
                        </div>
                    )}
                </main>
             </div>
        </div>
    );
};

export default Messages;
