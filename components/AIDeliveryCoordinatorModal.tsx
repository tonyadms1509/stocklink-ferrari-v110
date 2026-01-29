import React, { useState, useEffect, useRef } from 'react';
import { Order } from '../types';
import { useData } from '../hooks/useDataContext';
import { useLocalization } from '../hooks/useLocalization';
import { XMarkIcon, PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/solid';

interface AIDeliveryCoordinatorModalProps {
    order: Order;
    onClose: () => void;
}

interface Message {
    role: 'user' | 'model';
    text: string;
}

const AIDeliveryCoordinatorModal: React.FC<AIDeliveryCoordinatorModalProps> = ({ order, onClose }) => {
    const { t } = useLocalization();
    const { getDeliveryUpdate } = useData();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMessages([{
            role: 'model',
            text: t('aiCoordinatorWelcome', { orderNumber: order.orderNumber })
        }]);
    }, [order, t]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage, { role: 'model', text: t('aiCoordinatorThinking') }]);
        setInput('');
        setIsLoading(true);

        const responseText = await getDeliveryUpdate(order.id, userMessage.text);
        
        setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { role: 'model', text: responseText };
            return newMessages;
        });
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full flex flex-col h-[70vh]">
                <div className="p-4 bg-gray-100 flex justify-between items-center rounded-t-lg">
                    <h2 className="text-xl font-bold text-primary">{t('myOrdersAICoordinator')}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XMarkIcon className="h-6 w-6"/></button>
                </div>

                <div className="flex-grow p-4 overflow-y-auto">
                    <div className="space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-md px-4 py-2 rounded-2xl flex items-start gap-2 ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-base-200 text-gray-800'}`}>
                                    {msg.role === 'model' && <SparklesIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />}
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div ref={chatEndRef}></div>
                </div>
                
                <form onSubmit={handleSendMessage} className="p-4 border-t bg-base-100">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t('aiCoordinatorPlaceholder')}
                            className="w-full p-3 border-2 border-base-300 rounded-full focus:ring-primary focus:border-primary"
                            disabled={isLoading}
                        />
                        <button type="submit" className="bg-secondary p-3 rounded-full text-white hover:bg-emerald-600 disabled:opacity-50" disabled={isLoading || !input.trim()}>
                            <PaperAirplaneIcon className="h-6 w-6"/>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AIDeliveryCoordinatorModal;