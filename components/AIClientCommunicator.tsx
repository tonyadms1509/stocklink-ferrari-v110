
import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import { GoogleGenAI } from '@google/genai';
import { SparklesIcon, ClipboardDocumentIcon } from '@heroicons/react/24/solid';
import { useToast } from '../hooks/useToast';

const AIClientCommunicator: React.FC = () => {
    const { t } = useLocalization();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [scenario, setScenario] = useState('Payment Reminder');
    const [context, setContext] = useState('');
    const [tone, setTone] = useState('Friendly');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState('');
    const [error, setError] = useState('');
    
    const scenarios = ['Payment Reminder', 'Project Update', 'Explaining a Delay', 'Requesting Information', 'Thank You Note'];
    const tones = ['Friendly', 'Formal', 'Urgent', 'Concise'];

    const handleGenerate = async () => {
        if (!process.env.API_KEY || !context) {
            setError("API Key and context are required.");
            return;
        }
        setIsLoading(true);
        setResult('');
        setError('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                You are a professional communication assistant for a South African building contractor named ${user?.name}.
                Your task is to draft a client message.

                **Scenario:** ${scenario}
                **Desired Tone:** ${tone}
                **Key Context provided by contractor:**
                ${context}

                Draft a professional, clear, and concise message suitable for sending to a client via email or text.
                Address the client politely. Incorporate all the key context provided.
                Respond with only the message text, without any introductory or concluding remarks from you as the AI.
            `;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt
            });

            setResult(response.text);
        } catch (err) {
            console.error(err);
            setError("Failed to generate message. The AI may be busy. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopy = () => {
        navigator.clipboard.writeText(result);
        showToast("Message copied to clipboard!", 'info');
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-2">{t('copilotClientCommunicator')}</h3>
            <p className="text-sm text-gray-600 mb-4">{t('copilotClientDescription')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">{t('copilotClientScenario')}</label>
                    <select value={scenario} onChange={e => setScenario(e.target.value)} className="w-full p-2 border rounded-md mt-1 bg-white">{scenarios.map(s => <option key={s}>{s}</option>)}</select>
                </div>
                 <div>
                    <label className="block text-sm font-medium">{t('copilotClientTone')}</label>
                    <select value={tone} onChange={e => setTone(e.target.value)} className="w-full p-2 border rounded-md mt-1 bg-white">{tones.map(t => <option key={t}>{t}</option>)}</select>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium">{t('copilotClientContext')}</label>
                    <textarea value={context} onChange={e => setContext(e.target.value)} rows={3} className="w-full p-2 border rounded-md mt-1" placeholder={t('copilotClientContextPlaceholder')} />
                </div>
            </div>
            <button onClick={handleGenerate} disabled={isLoading || !context} className="mt-4 w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-800 disabled:opacity-50">
                {isLoading ? t('copilotClientGenerating') : <><SparklesIcon className="h-5 w-5" />{t('copilotClientGenerate')}</>}
            </button>
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            {result && (
                <div className="mt-4 p-4 bg-base-100 rounded-lg border relative">
                    <button onClick={handleCopy} className="absolute top-2 right-2 p-1 bg-gray-200 rounded-full hover:bg-gray-300"><ClipboardDocumentIcon className="h-4 w-4 text-gray-600" /></button>
                    <h4 className="font-bold text-lg mb-2">{t('copilotGeneratedContent')}</h4>
                    <pre className="whitespace-pre-wrap font-sans text-sm">{result}</pre>
                </div>
            )}
        </div>
    );
};

export default AIClientCommunicator;
