
import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import { GoogleGenAI } from '@google/genai';
import { SparklesIcon } from '@heroicons/react/24/solid';

const AITenderAssistant: React.FC = () => {
    const { t } = useLocalization();
    const { user } = useAuth();
    const [requirements, setRequirements] = useState('');
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState('');
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!process.env.API_KEY || !requirements) {
            setError("API Key and tender requirements are required.");
            return;
        }
        setIsLoading(true);
        setResult('');
        setError('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                You are a professional proposal writer for a South African building contractor. Your task is to draft a winning tender proposal.

                **Contractor's Profile:**
                - Name: ${user?.name}
                - Specialties: ${user?.specialties?.join(', ') || 'General Construction'}

                **Contractor's Notes/Strengths for this job:**
                ${notes}

                **Client's Tender Requirements:**
                ---
                ${requirements}
                ---

                **Instructions:**
                Based on all the information above, write a structured, professional, and persuasive proposal. 
                Crucially, you MUST include standard South African tender compliance sections:
                1. **Executive Summary:** Brief overview of why we are the best fit.
                2. **Compliance & Certifications:** Explicitly mention specific assumptions for **CIDB Grading** (e.g., assume Grade 4GB/CE if not specified) and **B-BBEE Level** to show readiness.
                3. **Technical Approach:** addressing the key requirements.
                4. **Closing Statement.**
                
                Respond with only the proposal text, formatted with clear headings (Markdown).
            `;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt
            });

            setResult(response.text);
        } catch (err) {
            console.error(err);
            setError("Failed to generate proposal. The AI may be busy. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-2">{t('copilotTenderAssistant')}</h3>
            <p className="text-sm text-gray-600 mb-4">{t('copilotTenderDescription')}</p>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">{t('copilotTenderRequirements')}</label>
                    <textarea value={requirements} onChange={e => setRequirements(e.target.value)} rows={6} className="w-full p-2 border rounded-md mt-1" placeholder={t('copilotTenderPlaceholder')} />
                </div>
                <div>
                    <label className="block text-sm font-medium">{t('copilotTenderNotes')}</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full p-2 border rounded-md mt-1" placeholder={t('copilotTenderNotesPlaceholder')} />
                </div>
                <button onClick={handleGenerate} disabled={isLoading || !requirements} className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-800 disabled:opacity-50">
                    {isLoading ? t('copilotTenderGenerating') : <><SparklesIcon className="h-5 w-5" />{t('copilotTenderGenerate')}</>}
                </button>
                {error && <p className="text-sm text-red-500">{error}</p>}
                {result && (
                    <div className="mt-4 p-4 bg-base-100 rounded-lg border">
                         <h4 className="font-bold text-lg mb-2">{t('copilotGeneratedContent')}</h4>
                         <pre className="whitespace-pre-wrap font-sans text-sm">{result}</pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AITenderAssistant;
