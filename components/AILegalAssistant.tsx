import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { GoogleGenAI, Type } from '@google/genai';
import { SparklesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { AILegalReport } from '../types';
import { useData } from '../hooks/useDataContext';

export const AILegalAssistant: React.FC = () => {
    const { t } = useLocalization();
    const { aiLegalReport, isAILoading, legalError, generateLegalAnalysis, clearLegalAnalysis } = useData();
    const [contractText, setContractText] = useState('');
    
    const handleGenerate = () => {
        if (contractText) {
            generateLegalAnalysis(contractText);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-2">{t('copilotLegalAssistant')}</h3>
            <p className="text-sm text-gray-600 mb-4">{t('copilotLegalDescription')}</p>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">{t('copilotLegalContractText')}</label>
                    <textarea value={contractText} onChange={e => setContractText(e.target.value)} rows={8} className="w-full p-2 border rounded-md mt-1" placeholder={t('copilotLegalPlaceholder')} />
                </div>
                <button onClick={handleGenerate} disabled={isAILoading.legal || !contractText} className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-800 disabled:opacity-50">
                    {isAILoading.legal ? t('copilotLegalGenerating') : <><SparklesIcon className="h-5 w-5" />{t('copilotLegalGenerate')}</>}
                </button>
                {legalError && <p className="text-sm text-red-500">{legalError}</p>}
                {aiLegalReport && (
                    <div className="mt-4 p-4 bg-base-100 rounded-lg border space-y-4">
                         <h4 className="font-bold text-lg">{t('copilotLegalSummary')}</h4>
                         <p className="text-sm">{aiLegalReport.summary}</p>

                         <h4 className="font-bold text-lg">{t('copilotLegalRisks')}</h4>
                         <ul className="space-y-2">
                            {aiLegalReport.risks.map((item, index) => (
                                <li key={index} className="p-2 bg-yellow-50 border-l-4 border-yellow-400">
                                    <p className="font-semibold text-yellow-800">{item.risk}</p>
                                    <p className="text-sm text-yellow-700 mt-1">Recommendation: {item.recommendation}</p>
                                </li>
                            ))}
                         </ul>

                        <h4 className="font-bold text-lg">{t('copilotLegalSuggestions')}</h4>
                        <ul className="list-disc list-inside text-sm">
                            {aiLegalReport.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                        
                        <div className="p-4 bg-red-50 border-l-4 border-red-500">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{aiLegalReport.disclaimer}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AILegalAssistant;
