import React, { useState } from 'react';
import { ClientInvoice } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { useCurrency } from '../hooks/useCurrency';
import { GoogleGenAI } from '@google/genai';
import { XMarkIcon, SparklesIcon, ClipboardDocumentIcon, ChatBubbleLeftEllipsisIcon, EnvelopeIcon } from '@heroicons/react/24/solid';
import { useToast } from '../hooks/useToast';

interface AICollectionsModalProps {
    invoice: ClientInvoice;
    onClose: () => void;
}

type Tone = 'polite' | 'standard' | 'firm';
type Medium = 'email' | 'whatsapp';

const AICollectionsModal: React.FC<AICollectionsModalProps> = ({ invoice, onClose }) => {
    const { t } = useLocalization();
    const { formatCurrency } = useCurrency();
    const { showToast } = useToast();
    
    const [tone, setTone] = useState<Tone>('polite');
    const [medium, setMedium] = useState<Medium>('email');
    const [generatedMessage, setGeneratedMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!process.env.API_KEY) {
            setGeneratedMessage("API Key missing. Please configure to use AI features.");
            return;
        }

        setIsLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const daysOverdue = Math.floor((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 3600 * 24));
            
            const prompt = `
                You are a professional accounts receivable assistant for a construction business.
                Write a payment reminder message for a client.
                
                **Invoice Details:**
                - Client Name: ${invoice.clientName}
                - Invoice Number: ${invoice.invoiceNumber}
                - Amount Due: ${formatCurrency(invoice.total)}
                - Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}
                - Days Overdue: ${daysOverdue > 0 ? daysOverdue : 'Not yet overdue'}
                
                **Settings:**
                - Tone: ${tone} (${tone === 'polite' ? 'Friendly nudge' : tone === 'firm' ? 'Serious demand' : 'Professional reminder'})
                - Format: ${medium === 'email' ? 'Email (Subject line + Body)' : 'WhatsApp (Short, direct, no subject line)'}
                
                Draft the message ready to send. Do not include placeholders like "[Your Name]" if possible, sign off as "The Finance Team".
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt
            });

            setGeneratedMessage(response.text.trim());
        } catch (error) {
            console.error("AI Generation Error", error);
            setGeneratedMessage("Failed to generate message. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedMessage);
        showToast('Message copied to clipboard', 'success');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[80] p-4 animate-fade-in-scale">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden text-left">
                <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <SparklesIcon className="h-6 w-6 text-yellow-300" />
                        AI Collections Agent
                    </h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white"><XMarkIcon className="h-6 w-6"/></button>
                </div>

                <div className="p-6">
                    <p className="text-sm text-gray-600 mb-4">
                        Drafting reminder for <strong>{invoice.clientName}</strong> regarding invoice <strong>{invoice.invoiceNumber}</strong> ({formatCurrency(invoice.total)}).
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tone</label>
                            <div className="flex flex-col gap-2">
                                <button onClick={() => setTone('polite')} className={`px-3 py-2 rounded-lg text-sm border text-left ${tone === 'polite' ? 'bg-green-50 border-green-500 text-green-700 font-bold' : 'border-gray-200 hover:bg-gray-50'}`}>😊 Polite Nudge</button>
                                <button onClick={() => setTone('standard')} className={`px-3 py-2 rounded-lg text-sm border text-left ${tone === 'standard' ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'border-gray-200 hover:bg-gray-50'}`}>👔 Standard</button>
                                <button onClick={() => setTone('firm')} className={`px-3 py-2 rounded-lg text-sm border text-left ${tone === 'firm' ? 'bg-red-50 border-red-500 text-red-700 font-bold' : 'border-gray-200 hover:bg-gray-50'}`}>⚠️ Firm Notice</button>
                            </div>
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Medium</label>
                             <div className="flex flex-col gap-2">
                                <button onClick={() => setMedium('email')} className={`px-3 py-2 rounded-lg text-sm border text-left flex items-center gap-2 ${medium === 'email' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <EnvelopeIcon className="h-4 w-4"/> Email
                                </button>
                                <button onClick={() => setMedium('whatsapp')} className={`px-3 py-2 rounded-lg text-sm border text-left flex items-center gap-2 ${medium === 'whatsapp' ? 'bg-green-50 border-green-500 text-green-700 font-bold' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <ChatBubbleLeftEllipsisIcon className="h-4 w-4"/> WhatsApp
                                </button>
                             </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleGenerate} 
                        disabled={isLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Drafting...
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="h-5 w-5"/> Generate Message
                            </>
                        )}
                    </button>

                    {generatedMessage && (
                        <div className="mt-6">
                            <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 max-h-40 overflow-y-auto text-sm whitespace-pre-wrap font-sans text-gray-800">
                                {generatedMessage}
                            </div>
                            <button onClick={handleCopy} className="w-full mt-3 bg-white border border-gray-300 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                                <ClipboardDocumentIcon className="h-5 w-5"/> Copy to Clipboard
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AICollectionsModal;