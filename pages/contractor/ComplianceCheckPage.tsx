
import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { ComplianceReport } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import { ShieldCheckIcon, SparklesIcon, ExclamationTriangleIcon, GlobeAltIcon, ArrowLeftIcon, ScaleIcon, NewspaperIcon, DocumentMagnifyingGlassIcon } from '@heroicons/react/24/solid';

interface ComplianceCheckPageProps {
    onBack?: () => void;
}

const RegulationNewsWidget: React.FC = () => {
    const news = [
        { title: "SANS 10400-XA Update: Energy Efficiency", date: "2 days ago", summary: "New requirements for fenestration calculations in residential builds." },
        { title: "Construction Sector Charter Code", date: "1 week ago", summary: "Updated BEE compliance thresholds for QSEs." },
        { title: "NHBRC Enrollment Fees", date: "2 weeks ago", summary: "Annual fee adjustments effective from next month." },
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-slate-800 p-4 text-white">
                <h3 className="font-bold flex items-center gap-2">
                    <NewspaperIcon className="h-5 w-5 text-yellow-400" />
                    Regulatory News Feed
                </h3>
            </div>
            <div className="divide-y divide-gray-100">
                {news.map((item, i) => (
                    <div key={i} className="p-4 hover:bg-gray-50 transition-colors">
                        <p className="font-bold text-slate-800 text-sm">{item.title}</p>
                        <p className="text-xs text-slate-500 mt-1 mb-2">{item.date}</p>
                        <p className="text-xs text-gray-600 leading-relaxed">{item.summary}</p>
                    </div>
                ))}
            </div>
            <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
                <button className="text-xs font-bold text-blue-600 hover:underline">View All Updates</button>
            </div>
        </div>
    );
};

const ComplianceCheckPage: React.FC<ComplianceCheckPageProps> = ({ onBack }) => {
    const { t } = useLocalization();
    const [query, setQuery] = useState('');
    const [region, setRegion] = useState('South Africa (SANS 10400)');
    const [report, setReport] = useState<ComplianceReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const regionOptions = {
        'South Africa (SANS 10400)': t('complianceRegionSA'),
        'United Kingdom (Building Regulations)': t('complianceRegionUK'),
        'United States (IBC)': t('complianceRegionUS'),
        'Australia (NCC)': t('complianceRegionAU'),
        'European Union (Eurocodes)': t('complianceRegionEU'),
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        if (!process.env.API_KEY) {
            setError("AI features are disabled. API key not configured.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setReport(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Specific instruction for SA
            const isSA = region.includes('South Africa');
            
            const systemInstruction = `You are an expert Building Inspector and Compliance Officer. 
            ${isSA ? 
                `Your specialty is South African National Standards (SANS 10400) and the National Building Regulations.
                When analyzing the user's query, you MUST reference specific SANS document parts where applicable (e.g. SANS 10400-A for General Principles, Part T for Fire, Part XA for Energy Usage, Part V for Space Heating, etc.).` 
                : 
                `Your specialty is building regulations for: ${region}.`
            }

            Analyze the construction activity described:
            1. Provide a brief, high-level summary of your findings.
            2. Identify specific, potential compliance issues. For each issue, provide a practical recommendation.
            3. List relevant document numbers or codes (e.g. "SANS 10400-J").
            4. Include a disclaimer that this is informational advice only and not a substitute for a professional engineer or inspector.

            Your response MUST be in the specified JSON format.`;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.STRING, description: "A high-level summary of the compliance check." },
                    issues: {
                        type: Type.ARRAY,
                        description: "A list of potential compliance issues found.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                issue: { type: Type.STRING, description: "Description of the potential issue." },
                                recommendation: { type: Type.STRING, description: "A practical recommendation to address the issue." },
                            }
                        }
                    },
                    references: {
                        type: Type.ARRAY,
                        description: "A list of document numbers/standards referenced.",
                        items: { type: Type.STRING }
                    },
                    disclaimer: { type: Type.STRING, description: "A standard legal disclaimer." }
                },
                required: ["summary", "issues", "references", "disclaimer"]
            };

            // Fix: Updated model name to gemini-3-flash-preview
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: query,
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema,
                }
            });

            // Fix: Ensure correct property access for text
            const parsedReport = JSON.parse(response.text || '{}');
            setReport(parsedReport);

        } catch (err) {
            console.error("Compliance Check Error:", err);
            setError(t('complianceError'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="pb-12">
            {onBack && (
                <button onClick={onBack} className="flex items-center text-sm text-primary hover:underline mb-6 font-medium">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    {t('backToDashboard')}
                </button>
            )}
            
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-slate-800 p-3 rounded-xl shadow-md text-white">
                    <ScaleIcon className="h-8 w-8"/>
                </div>
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900">{t('complianceTitle')}</h2>
                    <p className="text-gray-500 mt-1">{t('complianceDescription')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Interactive Tool */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <label htmlFor="region-select" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <GlobeAltIcon className="h-4 w-4"/>
                                    {t('complianceRegion')}
                                </label>
                                <select
                                    id="region-select"
                                    value={region}
                                    onChange={(e) => setRegion(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-colors font-medium text-gray-700"
                                    disabled={isLoading}
                                >
                                    {Object.entries(regionOptions).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    Describe Construction Activity
                                </label>
                                <textarea
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder={t('compliancePlaceholder')}
                                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors min-h-[150px] text-gray-800 leading-relaxed"
                                    disabled={isLoading}
                                />
                                <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md border border-blue-100 cursor-pointer hover:bg-blue-100" onClick={() => setQuery("Installing a solar geyser on a flat concrete roof.")}>Solar Install</span>
                                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md border border-blue-100 cursor-pointer hover:bg-blue-100" onClick={() => setQuery("Building a double brick boundary wall 2.1m high.")}>Boundary Wall</span>
                                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md border border-blue-100 cursor-pointer hover:bg-blue-100" onClick={() => setQuery("Adding a timber deck attached to the main house.")}>Timber Deck</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !query.trim()}
                                className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg transform active:scale-95 disabled:opacity-50 disabled:transform-none"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {t('complianceSubmitting')}
                                    </>
                                ) : (
                                    <>
                                        <DocumentMagnifyingGlassIcon className="h-5 w-5 text-yellow-400" />
                                        {t('complianceSubmit')}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg shadow-sm" role="alert">
                            <p className="font-bold">Analysis Failed</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}
                    
                    {report && (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden animate-fade-in-up">
                            <div className="bg-slate-50 p-6 border-b border-gray-200">
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <ShieldCheckIcon className="h-6 w-6 text-green-600"/>
                                    {t('complianceReportTitle')}
                                </h3>
                            </div>
                            
                            <div className="p-8 space-y-8">
                                {/* Summary */}
                                <div>
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">{t('complianceSummary')}</h4>
                                    <p className="text-gray-800 leading-relaxed text-lg">{report.summary}</p>
                                </div>

                                {/* Issues */}
                                {report.issues.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">{t('complianceIssues')}</h4>
                                        <div className="space-y-4">
                                            {report.issues.map((item, index) => (
                                                <div key={index} className="flex gap-4 p-4 rounded-xl bg-yellow-50 border border-yellow-100">
                                                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5"/>
                                                    <div>
                                                        <p className="font-bold text-yellow-900">{item.issue}</p>
                                                        <p className="mt-1 text-sm text-yellow-800"><span className="font-semibold">Recommendation:</span> {item.recommendation}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* References */}
                                {report.references.length > 0 && (
                                     <div>
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">{t('complianceReferences')}</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {report.references.map((ref, index) => (
                                                <span key={index} className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">{ref}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Disclaimer */}
                                <div className="p-4 rounded-lg bg-gray-50 text-xs text-gray-500 border border-gray-100">
                                    <p><strong>Disclaimer:</strong> {report.disclaimer}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: News */}
                <div className="lg:col-span-1 space-y-6">
                    <RegulationNewsWidget />
                    
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg">
                        <h4 className="font-bold text-lg mb-2">Need Official Certification?</h4>
                        <p className="text-sm text-blue-100 mb-4">Connect with registered inspectors and engineers for sign-offs.</p>
                        <button className="w-full bg-white text-blue-700 font-bold py-2 px-4 rounded-lg text-sm hover:bg-blue-50 transition-colors shadow-sm">
                            Find Professionals
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComplianceCheckPage;
