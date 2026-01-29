import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { GoogleGenAI, Type } from '@google/genai';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { BusinessNameSuggestion } from '../types';

const AIBusinessNameGenerator: React.FC = () => {
    const { t } = useLocalization();
    const [specialty, setSpecialty] = useState('');
    const [keywords, setKeywords] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<BusinessNameSuggestion[]>([]);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!process.env.API_KEY || !specialty) {
            setError("API Key and specialty are required.");
            return;
        }
        setIsLoading(true);
        setResults([]);
        setError('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Brainstorm 5 creative, professional, and memorable business names for a contractor in South Africa.
                
                **Contractor's Specialty:** ${specialty}
                **Optional Keywords to include:** ${keywords}

                For each name, also provide a short, catchy tagline.
                The names should be suitable for the South African market.
            `;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                tagline: { type: Type.STRING },
                            },
                            required: ['name', 'tagline'],
                        },
                    },
                }
            });

            setResults(JSON.parse(response.text));
        } catch (err) {
            console.error(err);
            setError("Failed to generate names. The AI may be busy. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-2">{t('copilotNameGenerator')}</h3>
            <p className="text-sm text-gray-600 mb-4">{t('copilotNameDescription')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">{t('copilotNameSpecialty')}</label>
                    <input type="text" value={specialty} onChange={e => setSpecialty(e.target.value)} className="w-full p-2 border rounded-md mt-1" placeholder={t('copilotNameSpecialtyPlaceholder')} />
                </div>
                 <div>
                    <label className="block text-sm font-medium">{t('copilotNameKeywords')}</label>
                    <input type="text" value={keywords} onChange={e => setKeywords(e.target.value)} className="w-full p-2 border rounded-md mt-1" placeholder={t('copilotNameKeywordsPlaceholder')} />
                </div>
            </div>
            <button onClick={handleGenerate} disabled={isLoading || !specialty} className="mt-4 w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-800 disabled:opacity-50">
                {isLoading ? t('copilotNameGenerating') : <><SparklesIcon className="h-5 w-5" />{t('copilotNameGenerate')}</>}
            </button>
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            {results.length > 0 && (
                <div className="mt-4 p-4 bg-base-100 rounded-lg border">
                     <h4 className="font-bold text-lg mb-2">{t('copilotGeneratedContent')}</h4>
                     <div className="space-y-3">
                        {results.map((item, index) => (
                            <div key={index} className="border-b pb-2 last:border-0 last:pb-0">
                                <p className="font-bold text-primary">{item.name}</p>
                                <p className="text-sm italic text-gray-600">"{item.tagline}"</p>
                            </div>
                        ))}
                     </div>
                </div>
            )}
        </div>
    );
};

export default AIBusinessNameGenerator;
