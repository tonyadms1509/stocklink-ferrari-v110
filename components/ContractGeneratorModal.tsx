import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { XMarkIcon, SparklesIcon, DocumentTextIcon, ClipboardDocumentIcon, ScaleIcon, ShieldCheckIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
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
    const { formatCurrency } = useCurrency();
    const { showToast } = useToast();

    const [contractType, setContractType] = useState('Service Level Agreement (SANS-10400 Compatible)');
    const [secondParty, setSecondParty] = useState(project.clientName);
    const [value, setValue] = useState('');
    const [duration, setDuration] = useState('12 Weeks');
    const [generatedContract, setGeneratedContract] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!process.env.API_KEY) return;
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Draft a high-end construction contract for South Africa. Type: ${contractType}. Project: ${project.projectName}. Client: ${secondParty}. Value: ${value}. Duration: ${duration}. Requirements: Must mention SANS 10400 safety standards, NHBRC compliance, and Force Majeure. Tone: Legal, Elite, Clear.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt
            });

            setGeneratedContract(response.text || '');
        } catch (e) {
            showToast("Legal engine offline", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-[110] p-4 animate-fade-in backdrop-blur-md">
            <div className="bg-white rounded-[3rem] shadow-2xl max-w-5xl w-full h-[90vh] flex flex-col overflow-hidden border border-white/20">
                <div className="p-8 border-b bg-slate-900 flex justify-between items-center text-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-2xl">
                             <ScaleIcon className="h-6 w-6 text-white"/>
                        </div>
                        <div className="text-left">
                             <h2 className="text-xl font-black italic uppercase tracking-tighter leading-none">AI Legal <span className="text-blue-500">Counsel</span></h2>
                             <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-3">SANS Protocol Integration Active</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white p-2"><XMarkIcon className="h-6 w-6"/></button>
                </div>

                <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
                    <div className="w-full md:w-1/3 p-10 bg-slate-50 border-r overflow-y-auto">
                        <div className="space-y-8 text-left">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Protocol Type</label>
                                <select value={contractType} onChange={e => setContractType(e.target.value)} className="w-full p-4 border-2 border-slate-100 rounded-2xl text-sm font-bold bg-white focus:border-blue-500 transition-all outline-none">
                                    <option>Minor Works Agreement</option>
                                    <option>Sub-Contractor Mandate</option>
                                    <option>Labor-Only Protocol</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Settlement Value</label>
                                <input type="text" value={value} onChange={e => setValue(e.target.value)} className="w-full p-4 border-2 border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-blue-500" placeholder="e.g. R450,000.00" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Mission Duration</label>
                                <input type="text" value={duration} onChange={e => setDuration(e.target.value)} className="w-full p-4 border-2 border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-blue-500" />
                            </div>

                            <button 
                                onClick={handleGenerate} 
                                disabled={isLoading}
                                className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] shadow-xl hover:bg-black transition-all transform active:scale-95 disabled:opacity-50 border-4 border-slate-800"
                            >
                                {isLoading ? <ArrowPathIcon className="h-4 w-4 animate-spin"/> : <SparklesIcon className="h-4 w-4 text-blue-400"/>}
                                Draft Legal Schematic
                            </button>
                        </div>
                    </div>

                    <div className="w-full md:w-2/3 p-12 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/lined-paper-2.png')] relative">
                        {generatedContract ? (
                            <div className="prose prose-slate max-w-none animate-fade-in-up text-left">
                                <div className="whitespace-pre-wrap font-serif text-lg leading-loose text-slate-800">{generatedContract}</div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-30">
                                <ScaleIcon className="h-24 w-24 mb-6"/>
                                <p className="font-black uppercase tracking-[0.5em] text-sm italic">Awaiting Strategic Parameters</p>
                            </div>
                        )}
                        
                        {generatedContract && (
                            <div className="sticky bottom-0 left-0 right-0 flex justify-end gap-4 pt-12 bg-gradient-to-t from-[#fdfbf7] via-[#fdfbf7] to-transparent">
                                <button onClick={() => { navigator.clipboard.writeText(generatedContract); showToast("Contract Copied", "success"); }} className="p-4 bg-white border-2 border-slate-100 rounded-2xl shadow-xl text-gray-600 hover:text-blue-600 transition-colors">
                                    <ClipboardDocumentIcon className="h-6 w-6"/>
                                </button>
                                <button onClick={() => { onSave(`${contractType}.md`, generatedContract); onClose(); }} className="bg-blue-600 text-white font-black px-12 py-4 rounded-[2.5rem] shadow-2xl shadow-blue-900/40 uppercase tracking-widest text-xs transform active:scale-95 border border-white/10">
                                    Archive to Project Log
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