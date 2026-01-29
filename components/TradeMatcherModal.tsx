
import React, { useState } from 'react';
import { useData } from '../hooks/useDataContext';
import { GoogleGenAI, Type } from '@google/genai';
import { SparklesIcon, XMarkIcon, UserGroupIcon } from '@heroicons/react/24/solid';
import { SubContractor } from '../types';

interface TradeMatcherModalProps {
    onClose: () => void;
    onMatchFound: (subContractorId: string) => void;
}

const TradeMatcherModal: React.FC<TradeMatcherModalProps> = ({ onClose, onMatchFound }) => {
    const { subContractors } = useData();
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [matches, setMatches] = useState<{ subContractor: SubContractor, score: number, reason: string }[]>([]);

    const handleMatch = async () => {
        if (!query.trim() || !process.env.API_KEY) return;

        setIsLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const context = subContractors.map(s => ({
                id: s.id,
                name: s.name,
                trade: s.trade,
                skills: s.skills,
                location: s.location,
                rate: s.hourlyRate
            }));

            const prompt = `
                You are a recruitment expert for construction projects. 
                Match the following job requirement to the best available sub-contractors.

                Job Requirement: "${query}"

                Available Sub-Contractors:
                ${JSON.stringify(context)}

                Return a JSON array of objects with:
                - id: SubContractor ID
                - score: Relevance score (0-100)
                - reason: Brief explanation why they fit.
                
                Return only the top 3 matches.
            `;

            const responseSchema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        score: { type: Type.NUMBER },
                        reason: { type: Type.STRING }
                    },
                    required: ['id', 'score', 'reason']
                }
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { responseMimeType: 'application/json', responseSchema }
            });

            const results = JSON.parse(response.text);
            
            const matchedSubs = results.map((res: any) => {
                const sub = subContractors.find(s => s.id === res.id);
                return sub ? { subContractor: sub, score: res.score, reason: res.reason } : null;
            }).filter(Boolean);

            setMatches(matchedSubs);

        } catch (e) {
            console.error(e);
            alert("Matching failed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[80] p-4 animate-fade-in-scale">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
                <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <SparklesIcon className="h-6 w-6 text-purple-600"/> AI Trade Matcher
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XMarkIcon className="h-6 w-6"/></button>
                </div>

                <div className="p-6">
                    {!matches.length ? (
                        <>
                            <p className="text-gray-600 mb-4">Describe the job, and I'll find the best tradesperson for you.</p>
                            <textarea
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="e.g., I need a plumber to install a new geyser in Centurion."
                                rows={4}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 mb-4"
                            />
                            <button 
                                onClick={handleMatch}
                                disabled={isLoading || !query}
                                className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading ? 'Analyzing...' : 'Find Matches'}
                            </button>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-700">Top Recommendations</h3>
                            {matches.map(match => (
                                <div key={match.subContractor.id} className="p-4 border rounded-lg bg-gray-50 hover:border-purple-300 cursor-pointer" onClick={() => { onMatchFound(match.subContractor.id); onClose(); }}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-gray-900">{match.subContractor.name}</h4>
                                            <p className="text-xs text-gray-500">{match.subContractor.trade} • {match.subContractor.location}</p>
                                        </div>
                                        <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">{match.score}% Match</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2 italic">"{match.reason}"</p>
                                </div>
                            ))}
                            <button onClick={() => setMatches([])} className="w-full text-gray-500 text-sm underline mt-2">Search Again</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TradeMatcherModal;
