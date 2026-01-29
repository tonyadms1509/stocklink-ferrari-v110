import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useCurrency } from '../hooks/useCurrency';
import { AITenderAnalysisReport, Tender } from '../types';
import { XMarkIcon, SparklesIcon, LockClosedIcon, PaperClipIcon } from '@heroicons/react/24/solid';

interface TenderAnalysisModalProps {
    analysis: AITenderAnalysisReport;
    tender: Tender;
    onClose: () => void;
}

const TenderAnalysisModal: React.FC<TenderAnalysisModalProps> = ({ analysis, tender, onClose }) => {
    const { formatCurrency } = useCurrency();

    return (
        <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-[100] p-4 animate-fade-in backdrop-blur-md">
            {/* Manila Folder Container */}
            <div className="relative bg-[#f0e6d2] rounded-lg shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col transform rotate-1 border-t border-white/50 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                
                {/* Folder Tab */}
                <div className="absolute -top-6 left-0 w-48 h-10 bg-[#e0d6c2] rounded-t-lg border-t border-l border-r border-white/40"></div>

                {/* Paperclip Decoration */}
                <div className="absolute top-0 right-8 w-12 z-20 text-gray-400 drop-shadow-md transform -translate-y-1/2">
                     <PaperClipIcon className="h-12 w-12" />
                </div>

                {/* CONFIDENTIAL Stamp */}
                <div className="absolute top-24 right-12 border-8 border-red-700 text-red-700 text-opacity-20 border-opacity-20 font-black text-6xl p-4 transform -rotate-12 select-none pointer-events-none z-0 tracking-widest">
                    CLASSIFIED
                </div>

                {/* Header Area */}
                <div className="p-10 border-b border-[#d0c6b2] relative z-10 bg-[#e8deca]">
                     <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 text-gray-600 mb-2">
                                <LockClosedIcon className="h-5 w-5"/>
                                <span className="text-xs font-mono font-black uppercase tracking-[0.4em]">Procurement Dossier: {tender.tenderNumber}</span>
                            </div>
                            <h2 className="text-4xl font-black text-gray-900 font-mono tracking-tighter uppercase italic">Neural Bid Audit</h2>
                            <p className="text-sm text-gray-600 font-mono mt-2 font-bold">Subject: {tender.projectName}</p>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-900 transition-colors p-2 bg-white/50 rounded-full"><XMarkIcon className="h-6 w-6"/></button>
                    </div>
                </div>

                {/* Content Area (Paper look) */}
                <div className="flex-grow bg-[#fdfbf7] m-4 mt-0 shadow-inner border border-[#d0c6b2] overflow-y-auto p-12 font-mono text-sm text-gray-700 leading-relaxed relative">
                     {/* Background Lines */}
                     <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px)', backgroundSize: '100% 2.5rem', marginTop: '2.5rem' }}></div>
                     
                     <div className="relative z-10 space-y-12">
                        <section>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] border-b-2 border-gray-800 pb-1 mb-6 text-gray-900">01. Neural Summary</h3>
                            <p className="text-lg font-bold text-slate-800 italic leading-loose">"{analysis.summary}"</p>
                        </section>

                        <section>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] border-b-2 border-gray-800 pb-1 mb-6 text-gray-900">02. Market Node Analysis</h3>
                            <div className="space-y-4">
                                {analysis.bestPricePerItem.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center p-3 border-b border-gray-200 hover:bg-yellow-50/50 transition-colors">
                                        <div>
                                            <span className="font-black uppercase text-gray-900">{item.materialName}</span>
                                            <span className="block text-[10px] text-gray-500 font-bold uppercase mt-1">Source: {item.supplierName}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="block font-black text-emerald-700 text-lg">{formatCurrency(item.bestPrice)}</span>
                                            <span className="text-[9px] text-gray-400 font-black uppercase">GRID BENCHMARK OK</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                         <section className="bg-gray-900 text-white p-8 rounded-sm transform rotate-[-0.5deg] shadow-2xl">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] border-b-2 border-white/20 pb-3 mb-6 text-blue-400">03. Strategic Mandate</h3>
                            <div className="flex flex-col md:flex-row gap-10 items-center">
                                 <div className="bg-emerald-500 text-slate-900 p-6 text-center transform rotate-1 shadow-xl min-w-[200px]">
                                     <p className="text-[10px] uppercase font-black mb-1">Target Savings</p>
                                     <p className="text-3xl font-black italic tracking-tighter">{formatCurrency(analysis.bestCaseTotal)}</p>
                                 </div>
                                 <p className="text-slate-300 italic text-sm leading-loose">
                                     "{analysis.recommendation}"
                                 </p>
                            </div>
                        </section>
                        
                        <div className="pt-20 text-center text-[10px] text-gray-400 font-black uppercase tracking-[0.5em]">
                            *** END OF TRANSMISSION ***
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default TenderAnalysisModal;
