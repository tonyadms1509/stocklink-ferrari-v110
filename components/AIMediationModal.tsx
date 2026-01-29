
import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { AIMediationSuggestion } from '../types';
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface AIMediationModalProps {
  isLoading: boolean;
  error: string | null;
  suggestion: AIMediationSuggestion | null;
  onClose: () => void;
  onPropose: (suggestionText: string) => void;
}

const AIMediationModal: React.FC<AIMediationModalProps> = ({ isLoading, error, suggestion, onClose, onPropose }) => {
    const { t } = useLocalization();

    const handlePropose = () => {
        if (suggestion) {
            onPropose(suggestion.suggestion);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full transform transition-all relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="h-6 w-6"/>
                </button>
                <div className="flex items-center gap-3 mb-4">
                    <SparklesIcon className="h-8 w-8 text-accent"/>
                    <h2 className="text-2xl font-bold text-primary">{t('mediationModalTitle')}</h2>
                </div>
                
                <div className="min-h-[150px] flex items-center justify-center">
                    {isLoading ? (
                         <div className="text-center">
                            <svg className="animate-spin h-8 w-8 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="mt-2 font-semibold">{t('mediationAnalyzing')}</p>
                        </div>
                    ) : error ? (
                        <p className="text-red-600">{error}</p>
                    ) : suggestion ? (
                        <div className="space-y-3 text-left">
                            <div>
                                <h4 className="font-bold">Summary of Situation</h4>
                                <p className="text-sm text-gray-700">{suggestion.summary}</p>
                            </div>
                            <div>
                                <h4 className="font-bold">{t('mediationSuggestionTitle')}</h4>
                                <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-md border border-blue-200">{suggestion.suggestion}</p>
                            </div>
                        </div>
                    ) : null}
                </div>

                {suggestion && !isLoading && (
                    <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                        <button onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">{t('mediationDismiss')}</button>
                        <button onClick={handlePropose} className="bg-secondary text-white font-bold py-2 px-4 rounded-lg">{t('mediationPropose')}</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIMediationModal;
