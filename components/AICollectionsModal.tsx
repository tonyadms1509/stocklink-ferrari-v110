
import React, { useState } from 'react';
import { ClientInvoice } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { useCurrency } from '../hooks/useCurrency';
import { GoogleGenAI } from '@google/genai';
import { XMarkIcon, SparklesIcon, ClipboardDocumentIcon, ChatBubbleLeftEllipsisIcon, EnvelopeIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
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
                You are a professional accounts receivable assistant for a construction business in South Africa.
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
                
                Draft the message ready to send. Do not include placeholders like "[Your Name]", sign off as "The Operational Finance Team".
                Tone should be professional and construction-industry appropriate.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt
            });

            setGeneratedMessage(response.text || '');
        } catch (error) {
            console.error("AI Generation Error", error);
            setGeneratedMessage("Failed to generate message. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedMessage);
        showToast('Transmission Packet Copied', 'success');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-950/95 flex items-center justify-center z-[200] p-4 animate-fade-in backdrop-blur-md">
            <div className="bg-slate-900 border border-white/10 rounded-[4rem] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col relative group">
                <div className="absolute inset-0 bg-carbon opacity-5 pointer-events-none"></div>
                <div className="bg-slate-800 p-8 flex justify-between items-center text-white border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-900/40">
                            <SparklesIcon className="h-6 w-6 text-yellow-300 animate-pulse" />
                        </div>
                        <div className="text-left">
                             <h2 className="text-xl font-black italic uppercase tracking-tighter leading-none">Collections <span className="text-blue-500">Agent</span></h2>
                             <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">Dossier Chasing Node v1.0</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-2 bg-white/5 rounded-xl border border-white/5"><XMarkIcon className="h-6 w-6"/></button>
                </div>

                <div className="p-10 space-y-8 flex-grow overflow-y-auto custom-scrollbar">
                    <p className="text-sm text-slate-400 font-medium italic leading-relaxed text-left">
                        Drafting settlement request for <strong>{invoice.clientName}</strong> regarding payload <strong>{invoice.invoiceNumber}</strong> ({formatCurrency(invoice.total)}).
                    </p>

                    <div className="grid grid-cols-2 gap-8 text-left">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 ml-2">Aggression Level</label>
                            <div className="space-y-2">
                                <button onClick={() => setTone('polite')} className={`w-full p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${tone === 'polite' ? 'bg-emerald-600 border-emerald-500 text-white shadow-xl' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}>Polite Nudge</button>
                                <button onClick={() => setTone('standard')} className={`w-full p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${tone === 'standard' ? 'bg-blue-600 border-blue-500 text-white shadow-xl' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}>Standard</button>
                                <button onClick={() => setTone('firm')} className={`w-full p-4 rounded-2xl text-[10px) font-black uppercase tracking-widest border-2 transition-all ${tone === 'firm' ? 'bg-red-600 border-red-500 text-white shadow-xl' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}>Firm Notice</button>
                            </div>
                        </div>
                        <div>
                             <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 ml-2">Transmission Medium</label>
                             <div className="space-y-2">
                                <button onClick={() => setMedium('email')} className={`w-full p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 flex items-center justify-center gap-3 transition-all ${medium === 'email' ? 'bg-slate-100 border-slate-900 text-slate-950 shadow-xl' : 'bg-white/5 border-white/5 text-slate-500'}`}>
                                    <EnvelopeIcon className="h-4 w-4"/> Packet Relay
                                </button>
                                <button onClick={() => setMedium('whatsapp')} className={`w-full p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 flex items-center justify-center gap-3 transition-all ${medium === 'whatsapp' ? 'bg-emerald-600 border-emerald-500 text-white shadow-xl' : 'bg-white/5 border-white/5 text-slate-500'}`}>
                                    <ChatBubbleLeftEllipsisIcon className="h-4 w-4"/> WhatsApp
                                </button>
                             </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleGenerate} 
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-[2rem] flex items-center justify-center gap-4 transition-all transform active:scale-95 shadow-2xl border border-white/10 disabled:opacity-30"
                    >
                        {isLoading ? (
                            <><ArrowPathIcon className="h-6 w-6 animate-spin" /> Calibrating...</>
                        ) : (
                            <><SparklesIcon className="h-6 w-6 text-yellow-300"/> Generate Transmission</>
                        )}
                    </button>

                    {generatedMessage && (
                        <div className="animate-fade-in-up space-y-4">
                            <div className="bg-black/60 p-8 rounded-[2.5rem] border-2 border-white/5 text-sm text-blue-100 italic leading-loose font-serif h-48 overflow-y-auto custom-scrollbar shadow-inner text-left">
                                {generatedMessage}
                            </div>
                            <button onClick={handleCopy} className="w-full bg-white text-slate-950 font-black py-5 rounded-3xl uppercase tracking-widest text-[10px] shadow-2xl transform active:scale-95 transition-all border-4 border-slate-950 flex items-center justify-center gap-4">
                                <ClipboardDocumentIcon className="h-4 w-4 text-blue-600"/> Commit to Outbox
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AICollectionsModal;
