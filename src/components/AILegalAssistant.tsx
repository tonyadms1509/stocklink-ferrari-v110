import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { SparklesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { useData } from '../hooks/useDataContext';

const AILegalAssistant: React.FC = () => {
    const { t } = useLocalization();
    const { aiLegalReport, isAILoading, legalError, generateLegalAnalysis } = useData();
    const [contractText, setContractText] = useState('');
    
    const handleGenerate = () => {
        if (contractText.trim()) {
            generateLegalAnalysis(contractText);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h3 className="text-xl font-bold mb-2">{t('copilotLegalAssistant')}</h3>
            <p className="text-sm text-gray-600 mb-4">{t('copilotLegalDescription')}</p>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('copilotLegalContractText')}</label>
                    <textarea 
                        value={contractText} 
                        onChange={e => setContractText(e.target.value)} 
                        rows={8} 
                        className="w-full p-3 border rounded-xl mt-1 focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                        placeholder={t('copilotLegalPlaceholder')} 
                    />
                </div>
                <button 
                    onClick={handleGenerate} 
                    disabled={isAILoading.legal || !contractText.trim()} 
                    className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all transform active:scale-95 shadow-lg"
                >
                    {isAILoading.legal ? (
                         <><div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div> {t('copilotLegalGenerating')}</>
                    ) : (
                        <><SparklesIcon className="h-5 w-5" /> {t('copilotLegalGenerate')}</>
                    )}
                </button>
                
                {legalError && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 text-sm">
                        {legalError}
                    </div>
                )}
                
                {aiLegalReport && !isAILoading.legal && (
                    <div className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-6 animate-fade-in-up">
                         <div>
                            <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-2">{t('copilotLegalSummary')}</h4>
                            <p className="text-sm leading-relaxed text-slate-800">{aiLegalReport.summary}</p>
                         </div>

                         <div>
                            <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-4">{t('copilotLegalRisks')}</h4>
                            <ul className="space-y-3">
                                {aiLegalReport.risks.map((item, index) => (
                                    <li key={index} className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg shadow-sm">
                                        <p className="font-bold text-yellow-900">{item.risk}</p>
                                        <p className="text-sm text-yellow-800 mt-1"><span className="font-semibold">Protocol:</span> {item.recommendation}</p>
                                    </li>
                                ))}
                            </ul>
                         </div>

                        <div>
                            <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-3">{t('copilotLegalSuggestions')}</h4>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {aiLegalReport.suggestions.map((s, i) => (
                                    <li key={i} className="flex items-center gap-2 text-xs bg-white p-2 rounded border border-slate-100 font-medium">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg mt-4">
                            <div className="flex gap-3">
                                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-red-700">{aiLegalReport.disclaimer}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AILegalAssistant;