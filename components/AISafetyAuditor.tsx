
import React, { useState, useRef } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { GoogleGenAI, Type, Part } from '@google/genai';
import { ShieldCheckIcon, SparklesIcon, DocumentArrowUpIcon, XCircleIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { SafetyAuditReport, SafetyAuditIssue } from '../types';

const fileToBase64 = (file: File): Promise<{ mimeType: string; data: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const [header, data] = result.split(',');
            const mimeType = header.match(/:(.*?);/)?.[1];
            if (mimeType && data) {
                resolve({ mimeType, data });
            } else {
                reject(new Error("Could not parse file data."));
            }
        };
        reader.onerror = error => reject(error);
    });
};

const SafetyIssueCard: React.FC<{ issue: SafetyAuditIssue }> = ({ issue }) => {
    const { t } = useLocalization();
    const severityStyles = {
        High: { border: 'border-red-500', bg: 'bg-red-50', text: 'text-red-700', name: t('safetySeverityHigh') },
        Medium: { border: 'border-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700', name: t('safetySeverityMedium') },
        Low: { border: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', name: t('safetySeverityLow') },
    };
    const styles = severityStyles[issue.severity] || severityStyles.Low;

    return (
        <div className={`p-4 rounded-lg border-l-4 ${styles.border} ${styles.bg}`}>
            <p className="font-bold text-gray-800">{issue.hazard}</p>
            <p className="text-sm text-gray-600 mt-1"><span className="font-semibold">{t('safetyRecommendation')}:</span> {issue.recommendation}</p>
            <p className="text-xs font-semibold mt-2">{t('safetySeverity')}: <span className={`font-bold ${styles.text}`}>{styles.name}</span></p>
        </div>
    );
};

const AISafetyAuditor: React.FC = () => {
    const { t } = useLocalization();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [report, setReport] = useState<SafetyAuditReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setReport(null);
            setError('');
        }
    };

    const removeImage = () => {
        setImageFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setReport(null);
        setError('');
    };

    const handleAudit = async () => {
        if (!process.env.API_KEY || !imageFile) {
            setError("API Key and an image are required.");
            return;
        }

        setIsLoading(true);
        setError('');
        setReport(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const { mimeType, data } = await fileToBase64(imageFile);
            const imagePart: Part = { inlineData: { mimeType, data } };
            
            const systemInstruction = `You are an expert construction Safety Officer. Your task is to analyze an image from a worksite and identify potential safety hazards based on general best practices (like OSHA or SANS standards).
            - For each distinct hazard you identify, provide a description of the hazard, its potential severity ('Low', 'Medium', or 'High'), and a recommended corrective action.
            - Focus on common issues: trip hazards, lack of PPE, unsecured materials, electrical hazards, improper ladder use, etc.
            - If no significant hazards are found, return an empty array.
            - Your response MUST be in the specified JSON format, which is an array of objects.`;

            const responseSchema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        hazard: { type: Type.STRING },
                        severity: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
                        recommendation: { type: Type.STRING }
                    },
                    required: ['hazard', 'severity', 'recommendation']
                }
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, {text: "Audit this worksite image for safety hazards."}] },
                config: { systemInstruction, responseMimeType: 'application/json', responseSchema }
            });

            setReport(JSON.parse(response.text));

        } catch (err) {
            console.error("AI Safety Audit Error:", err);
            setError(t('siteReporterError'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-2">{t('copilotSafetyAuditTitle')}</h3>
            <p className="text-sm text-gray-600 mb-4">{t('copilotSafetyAuditDescription')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upload & Preview */}
                <div className="flex flex-col items-center justify-center">
                    {previewUrl ? (
                        <div className="relative w-full">
                            <img src={previewUrl} alt="Site preview" className="rounded-lg w-full h-64 object-cover" />
                            <button onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><XCircleIcon className="h-6 w-6"/></button>
                        </div>
                    ) : (
                        <div onClick={() => fileInputRef.current?.click()} className="w-full h-64 flex flex-col justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-primary">
                            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-600">{t('siteReporterUpload')}</p>
                        </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    <button onClick={handleAudit} disabled={isLoading || !imageFile} className="mt-4 w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-800 disabled:opacity-50">
                        {isLoading ? t('copilotSafetyAuditAuditing') : <><SparklesIcon className="h-5 w-5" />{t('copilotSafetyAuditButton')}</>}
                    </button>
                </div>
                {/* Results */}
                <div className="max-h-[20rem] overflow-y-auto pr-2">
                    {isLoading && <p className="text-center">{t('copilotSafetyAuditAuditing')}</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    {report && (
                        report.length > 0 ? (
                            <div className="space-y-3">
                                {report.map((issue, i) => <SafetyIssueCard key={i} issue={issue} />)}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-green-50 rounded-lg border border-green-200">
                                <CheckCircleIcon className="h-12 w-12 text-green-500"/>
                                <p className="mt-2 font-semibold text-green-800">{t('copilotSafetyAuditNoIssues')}</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default AISafetyAuditor;
