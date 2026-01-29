
import React, { useMemo, useState } from 'react';
import { StarIcon, ChatBubbleBottomCenterTextIcon, SparklesIcon, HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/solid';
import { useData } from '../../hooks/useDataContext';
import { useAuth } from '../../hooks/useAuth';
import { useLocalization } from '../../hooks/useLocalization';
import { GoogleGenAI, Type } from '@google/genai';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div className="bg-primary/10 p-3 rounded-full">
            <Icon className="h-8 w-8 text-primary"/>
        </div>
        <div className="text-left">
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);

const StarRatingDisplay: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <StarIcon key={i} className={`h-5 w-5 ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}/>
        ))}
    </div>
);

interface ReviewAnalysis {
    sentimentScore: number; // 0-100
    strengths: string[];
    weaknesses: string[];
    summary: string;
}

const SupplierReviewsPage: React.FC = () => {
    const { suppliers, reviews } = useData();
    const { user } = useAuth();
    const { t } = useLocalization();
    const [analysis, setAnalysis] = useState<ReviewAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const mySupplierProfile = useMemo(() => {
        if (!user) return null;
        return suppliers.find(s => s.id === user.id);
    }, [suppliers, user]);

    const myReviews = useMemo(() => {
        if (!user) return [];
        return reviews
            .filter(r => r.supplierId === user.id)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }, [reviews, user]);

    const handleAnalyze = async () => {
        if (!process.env.API_KEY || myReviews.length === 0) return;
        setIsAnalyzing(true);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const reviewTexts = myReviews.map(r => r.comment).filter(Boolean).join("\n---\n");
            
            const prompt = `
                Analyze the following customer reviews for a building supplier.
                1. Calculate an overall sentiment score from 0 (negative) to 100 (positive).
                2. Identify top 3 specific strengths (e.g. "Fast Delivery").
                3. Identify top 3 specific weaknesses or areas for improvement.
                4. Write a 1-sentence summary of the reputation.
                
                Reviews:
                ${reviewTexts}
                
                Return JSON.
            `;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    sentimentScore: { type: Type.NUMBER },
                    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                    summary: { type: Type.STRING }
                },
                required: ["sentimentScore", "strengths", "weaknesses", "summary"]
            };

            // Fix: Updated model name to gemini-3-flash-preview
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: { responseMimeType: 'application/json', responseSchema }
            });

            // Fix: Ensure correct property access for text
            setAnalysis(JSON.parse(response.text || '{}'));

        } catch (error) {
            console.error("Review Analysis Error:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    if (!mySupplierProfile) {
        return <p>Loading reviews...</p>;
    }
    
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center text-left">
                <div>
                    <h2 className="text-3xl font-bold">{t('navReviews')}</h2>
                    <p className="text-gray-600 mt-1">{t('reviewsDescription')}</p>
                </div>
                 <button 
                    onClick={handleAnalyze} 
                    disabled={isAnalyzing || myReviews.length === 0}
                    className="bg-accent text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-yellow-500 disabled:opacity-50"
                >
                    <SparklesIcon className={`h-5 w-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    {isAnalyzing ? t('reviewAnalysisAnalyzing') : t('reviewAnalysisAnalyze')}
                </button>
            </div>

            {/* Analysis Dashboard */}
            {analysis && (
                <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in-scale text-left">
                    <h3 className="text-lg font-bold mb-4 text-primary">{t('reviewAnalysisTitle')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center border-r border-gray-100">
                            <p className="text-sm text-gray-500">{t('reviewAnalysisSentimentScore')}</p>
                            <div className="relative inline-flex items-center justify-center mt-2">
                                <svg className="w-24 h-24 transform -rotate-90">
                                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200" />
                                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * analysis.sentimentScore) / 100} className={`${analysis.sentimentScore > 70 ? 'text-green-500' : analysis.sentimentScore > 40 ? 'text-yellow-500' : 'text-red-500'}`} />
                                </svg>
                                <span className="absolute text-2xl font-bold">{analysis.sentimentScore}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-2 italic">"{analysis.summary}"</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-green-700 flex items-center gap-2 mb-2"><HandThumbUpIcon className="h-5 w-5"/> {t('reviewAnalysisStrengths')}</h4>
                            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                {analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-red-700 flex items-center gap-2 mb-2"><HandThumbDownIcon className="h-5 w-5"/> {t('reviewAnalysisWeaknesses')}</h4>
                            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                {analysis.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard title={t('reviewsAverageRating')} value={mySupplierProfile.rating || 'N/A'} icon={StarIcon}/>
                <StatCard title={t('reviewsTotalReviews')} value={mySupplierProfile.reviews_count || 0} icon={ChatBubbleBottomCenterTextIcon}/>
            </div>
            
            <div className="space-y-4">
                {myReviews.length > 0 ? myReviews.map(review => (
                    <div key={review.id} className="bg-white p-4 rounded-lg shadow-md text-left">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-primary">Review from {review.contractorName}</p>
                                <p className="text-xs text-gray-500">{review.createdAt.toLocaleDateString()}</p>
                            </div>
                            <StarRatingDisplay rating={review.rating} />
                        </div>
                        {review.comment && (
                            <p className="mt-2 text-gray-700 italic">"{review.comment}"</p>
                        )}
                    </div>
                )) : (
                     <p className="text-center text-gray-500 py-8">{t('reviewAnalysisNoReviews')}</p>
                )}
            </div>
        </div>
    );
};

export default SupplierReviewsPage;
