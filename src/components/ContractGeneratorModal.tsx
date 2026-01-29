
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { XMarkIcon, SparklesIcon, DocumentTextIcon, ClipboardDocumentIcon } from '@heroicons/react/24/solid';
import { useLocalization } from '../hooks/useLocalization';
import { Project } from '../types';
import { useCurrency } from '../hooks/useCurrency';
import { useToast } from '../hooks/useToast';

interface ContractGeneratorModalProps {
    project: Project;
    onClose: () => void;
    onSave: (contractName: string, content: string) => void;
}

const ContractGeneratorModal: React.FC<ContractGeneratorModalProps> = ({ project, onClose, onSave }) => {
    const { t } = useLocalization();
    const { formatCurrency } = useCurrency();
    const { showToast } = useToast();

    const [contractType, setContractType] = useState('Client Agreement (JBCC Minor Works style)');
    const [secondParty, setSecondParty] = useState(project.clientName);
    const [value, setValue] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [duration, setDuration] = useState('4 weeks');
    const [paymentTerms, setPaymentTerms] = useState('50% Deposit, 40% Progress, 10% Completion');
    const [generatedContract, setGeneratedContract] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!process.env.API_KEY) {
            alert("API Key required.");
            return;
        }
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Draft a professional construction contract for a project in South Africa.
                
                **Type:** ${contractType}
                **Project:** ${project.projectName} at ${project.address}
                **Contractor:** (Me/User Company)
                **Client/Second Party:** ${secondParty}
                **Contract Value:** ${value}
                **Start Date:** ${startDate}
                **Duration:** ${duration}
                **Payment Terms:** ${paymentTerms}
                
                **Requirements:**
                - Use clear, plain legal language compliant with the Consumer Protection Act (CPA).
                - Include standard clauses for: Scope of Work (Reference project details), Access to Site, Delay/Extension of Time, Dispute Resolution (Mediation/Arbitration), and Force Majeure.
                - Format with Markdown headings.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt
            });

            setGeneratedContract(response.text);
        } catch (e) {
            console.error(e);
            alert("Failed to generate contract.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedContract);
        showToast('Contract copied to clipboard', 'success');
    };

    const handleSaveDoc = () => {
        onSave(`${contractType} - ${secondParty}.md`, generatedContract);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[80] p-4 animate-fade-in-scale backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col">
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center rounded-t-xl">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <DocumentTextIcon className="h-6 w-6 text-primary"/> AI Contract Drafter
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="h-6 w-6"/></button>
                </div>

                <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
                    {/* Sidebar Inputs */}
                    <div className="w-full md:w-1/3 p-6 border-r bg-gray-50 overflow-y-auto">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Contract Type</label>
                                <select value={contractType} onChange={e => setContractType(e.target.value)} className="w-full p-2 border rounded bg-white text-sm">
                                    <option>Client Agreement (JBCC Minor Works style)</option>
                                    <option>Sub-Contractor Agreement</option>
                                    <option>Labor Only Contract</option>
                                    <option>Renovation Service Level Agreement</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Second Party Name</label>
                                <input type="text" value={secondParty} onChange={e => setSecondParty(e.target.value)} className="w-full p-2 border rounded text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Contract Value</label>
                                <input type="text" value={value} onChange={e => setValue(e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="e.g. R150,000.00" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Start Date</label>
                                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border rounded text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Duration</label>
                                    <input type="text" value={duration} onChange={e => setDuration(e.target.value)} className="w-full p-2 border rounded text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Payment Terms</label>
                                <textarea value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} className="w-full p-2 border rounded text-sm" rows={3} />
                            </div>

                            <button 
                                onClick={handleGenerate} 
                                disabled={isLoading}
                                className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-md"
                            >
                                {isLoading ? (
                                    <><div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div> Drafting...</>
                                ) : (
                                    <><SparklesIcon className="h-5 w-5"/> Generate Contract</>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div className="w-full md:w-2/3 p-8 overflow-y-auto bg-white relative">
                        {generatedContract ? (
                            <div className="prose prose-sm max-w-none text-gray-800 font-serif">
                                <div className="whitespace-pre-wrap">{generatedContract}</div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <DocumentTextIcon className="h-20 w-20 mb-4 opacity-20"/>
                                <p>Fill in the details and click Generate to draft your contract.</p>
                            </div>
                        )}
                        
                        {/* Floating Actions */}
                        {generatedContract && (
                            <div className="sticky bottom-0 left-0 right-0 flex justify-end gap-2 pt-4 bg-white/90 backdrop-blur-sm border-t mt-4">
                                <button onClick={handleCopy} className="p-2 text-gray-600 hover:text-primary bg-gray-100 rounded-lg" title="Copy Text">
                                    <ClipboardDocumentIcon className="h-5 w-5"/>
                                </button>
                                <button onClick={handleSaveDoc} className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-sm flex items-center gap-2">
                                    Save to Project Documents
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContractGeneratorModal;
