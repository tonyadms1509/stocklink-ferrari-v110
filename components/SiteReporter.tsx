import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Project, SafetyAuditReport, SafetyAuditIssue, SnagListReport, SnagItem } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { useData } from '../hooks/useDataContext';
import { GoogleGenAI, Part, Type } from '@google/genai';
import { SparklesIcon, DocumentArrowUpIcon, PhotoIcon, XCircleIcon, ClipboardDocumentIcon, ShieldCheckIcon, PaperAirplaneIcon, ChatBubbleLeftRightIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import { useToast } from '../hooks/useToast';

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

const SafetyIssueCard: React.FC<{ issue: SafetyAuditIssue, isHovered: boolean, onHover: () => void, onLeave: () => void }> = ({ issue, isHovered, onHover, onLeave }) => {
    const { t } = useLocalization();
    const severityStyles: Record<SafetyAuditIssue['severity'], { border: string; bg: string; text: string; name: string; }> = {
        High: { border: 'border-red-500', bg: 'bg-red-50', text: 'text-red-800', name: t('safetySeverityHigh') },
        Medium: { border: 'border-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-800', name: t('safetySeverityMedium') },
        Low: { border: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-800', name: t('safetySeverityLow') },
    };

    const styles = severityStyles[issue.severity] || severityStyles.Low;

    return (
        <div onMouseEnter={onHover} onMouseLeave={onLeave} className={`p-3 rounded-lg border-l-4 ${styles.border} ${isHovered ? 'bg-white shadow-lg' : styles.bg} transition-all`}>
            <p className="font-bold text-gray-800">{issue.hazard}</p>
            <p className="text-sm text-gray-600 mt-1"><span className="font-semibold">{t('safetyRecommendation')}:</span> {issue.recommendation}</p>
            <p className="text-xs font-semibold mt-2">{t('safetySeverity')}: <span className={`font-bold ${styles.text}`}>{styles.name}</span></p>
        </div>
    )
}

const SnagItemCard: React.FC<{ item: SnagItem, isHovered: boolean, onHover: () => void, onLeave: () => void }> = ({ item, isHovered, onHover, onLeave }) => {
    return (
        <div onMouseEnter={onHover} onMouseLeave={onLeave} className={`p-3 rounded-lg border-l-4 border-primary ${isHovered ? 'bg-white shadow-lg' : 'bg-blue-50'} transition-all`}>
            <p className="font-bold text-gray-800">{item.issue}</p>
            <p className="text-sm text-gray-600 mt-1">{item.recommendation}</p>
        </div>
    )
}

const InteractiveReportView: React.FC<{ report: SafetyAuditReport | SnagListReport, image: File, reportType: 'safety' | 'snag' }> = ({ report, image, reportType }) => {
    const { t } = useLocalization();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const imageUrl = useMemo(() => URL.createObjectURL(image), [image]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="relative">
                <img src={imageUrl} alt="Site analysis" className="rounded-lg w-full h-auto object-contain" />
                {report.map((item, index) => {
                    const coords = 'coordinates' in item ? item.coordinates : null;
                    if (!coords) return null;
                    return (
                        <div
                            key={index}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            className={`absolute w-8 h-8 rounded-full bg-red-500/80 text-white flex items-center justify-center font-bold text-sm border-2 border-white shadow-lg cursor-pointer transition-transform ${hoveredIndex === index ? 'scale-125' : ''}`}
                            style={{ top: `${coords.y}%`, left: `${coords.x}%`, transform: 'translate(-50%, -50%)' }}
                        >
                            {index + 1}
                        </div>
                    )
                })}
            </div>
            <div className="max-h-[60vh] overflow-y-auto pr-2">
                <h4 className="font-bold text-lg mb-2">{t('siteReporterIdentifiedIssues')}</h4>
                <p className="text-xs text-gray-500 mb-3">{t('siteReporterHoverTip')}</p>
                <div className="space-y-3">
                    {report.length > 0 ? (
                        report.map((item, index) => (
                            reportType === 'safety' ?
                            <SafetyIssueCard key={index} issue={item as SafetyAuditIssue} isHovered={hoveredIndex === index} onHover={() => setHoveredIndex(index)} onLeave={() => setHoveredIndex(null)} />
                            :
                            <SnagItemCard key={index} item={item as SnagItem} isHovered={hoveredIndex === index} onHover={() => setHoveredIndex(index)} onLeave={() => setHoveredIndex(null)} />
                        ))
                    ) : (
                         <p className="text-gray-500 text-center py-4">{t('siteReporterNoIssues')}</p>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- Site Reporter Implementation --- //
const SiteReporterView: React.FC<{ project: Project }> = ({ project }) => {
    const { t } = useLocalization();
    const { showToast } = useToast();
    const [images, setImages] = useState<File[]>([]);
    const [reportType, setReportType] = useState<'client' | 'snag' | 'safety'>('client');
    const [notes, setNotes] = useState('');
    const [report, setReport] = useState<string | SafetyAuditReport | SnagListReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Chat State
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', text: string }[]>([]);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setImages(Array.from(event.target.files));
            setReport(null);
            setChatHistory([]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setReport(null);
    };

    const handleGenerateReport = async () => {
        if (!process.env.API_KEY || images.length === 0) {
            setError("Please upload at least one image and ensure your API key is configured.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setReport(null);
        setChatHistory([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const imageParts: Part[] = await Promise.all(
                images.map(async (file) => {
                    const { mimeType, data } = await fileToBase64(file);
                    return { inlineData: { mimeType, data } };
                })
            );

            let systemInstruction = '';
            let responseSchema;
            let userPrompt = `
                Project: ${project.projectName}
                Report Type: ${reportType}
                Contractor's Notes: ${notes || "No additional notes provided."}

                Please generate the report based on the attached images.
            `;
            
            if (reportType === 'safety') {
                systemInstruction = `You are an expert construction Safety Officer. Your task is to analyze images from a worksite and identify potential safety hazards based on general best practices (like OSHA standards).
                   - For each distinct hazard you identify, provide a description of the hazard, its potential severity ('Low', 'Medium', or 'High'), and a recommended corrective action.
                   - If no hazards are found, return an empty array.
                   - Your response MUST be in the specified JSON format, which is an array of objects.`;
                responseSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { hazard: { type: Type.STRING }, severity: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] }, recommendation: { type: Type.STRING }, coordinates: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } } } }, required: ['hazard', 'severity', 'recommendation', 'coordinates'] } };
            } else if (reportType === 'snag') {
                systemInstruction = `You are a meticulous quality control inspector for a construction site. Your task is to identify potential snags, defects, or incomplete work.
                   - For each issue, you MUST provide coordinates (x, y) as percentages from the top-left corner where the issue is located.
                   - For each issue, provide a description and a recommended action.
                   - If no issues are found, return an empty array.
                   - Your response MUST be in the specified JSON format.`;
                responseSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { issue: { type: Type.STRING }, recommendation: { type: Type.STRING }, coordinates: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } } } }, required: ['issue', 'recommendation', 'coordinates'] } };
            } else { // client
                 systemInstruction = `You are a professional and positive project manager writing a progress update for a homeowner.
                   - Analyze the provided images and the contractor's notes.
                   - Write a brief summary of the overall progress shown.
                   - Create a bulleted list of key completed tasks.
                   - Do not mention any problems or issues unless specified in the notes.
                   - Keep the language non-technical.
                   - Use markdown for simple formatting (headings and bullet points).`;
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [...imageParts, { text: userPrompt }] },
                config: { 
                    systemInstruction,
                    ...(responseSchema && { responseMimeType: 'application/json', responseSchema }),
                }
            });

            setReport(responseSchema ? JSON.parse(response.text) : response.text);

        } catch (err) {
            console.error("Site Reporter Error:", err);
            setError(t('siteReporterError'));
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || !process.env.API_KEY || images.length === 0) return;
        
        const userMessage = chatInput;
        setChatInput('');
        setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
        setIsChatLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const imageParts: Part[] = await Promise.all(
                images.map(async (file) => {
                    const { mimeType, data } = await fileToBase64(file);
                    return { inlineData: { mimeType, data } };
                })
            );

            // Construct history for context
            // Note: Sending image every time for single-turn stateless simplicity, 
            // but effectively simulating a chat by appending history text
            const historyText = chatHistory.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');
            
            const prompt = `
                You are a construction expert analyzing the provided image(s).
                Previous context: A ${reportType} report was generated.
                Conversation History:
                ${historyText}
                
                User Question: ${userMessage}
                
                Answer the question based specifically on what you see in the images. Be concise and technical if appropriate.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [...imageParts, { text: prompt }] }
            });

            setChatHistory(prev => [...prev, { role: 'model', text: response.text }]);

        } catch (e) {
            console.error(e);
            setChatHistory(prev => [...prev, { role: 'model', text: "I couldn't process that request. Please try again." }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleCopy = () => {
        if(typeof report === 'string') {
            navigator.clipboard.writeText(report);
            showToast('Report copied!', 'info');
        } else if (Array.isArray(report)) {
            const textToCopy = report.map(item => {
                if ('hazard' in item) { // SafetyAuditIssue
                    return `Hazard: ${item.hazard}\nSeverity: ${item.severity}\nRecommendation: ${item.recommendation}`;
                } else { // SnagItem
                    return `Issue: ${item.issue}\nRecommendation: ${item.recommendation}`;
                }
            }).join('\n\n');
            navigator.clipboard.writeText(textToCopy);
            showToast('Issues copied!', 'info');
        }
    }

    const renderReport = () => {
        if (isLoading) return <p className="text-center">{t('siteReporterGenerating')}</p>;
        if (error) return <p className="text-red-500">{error}</p>;
        if (!report) return <p className="text-gray-400">Generated report will appear here.</p>;

        if (Array.isArray(report) && (reportType === 'safety' || reportType === 'snag')) {
            return <InteractiveReportView report={report as any} image={images[0]} reportType={reportType} />;
        }
        
        if (typeof report === 'string') {
            return <pre className="whitespace-pre-wrap font-sans text-sm">{report}</pre>;
        }
        
        return null;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Form */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">{t('siteReporterTitle')}</h3>
                <p className="text-sm text-gray-600 mb-4">{t('siteReporterDescription')}</p>
                <div className="space-y-4">
                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium">{t('siteReporterUpload')}</label>
                        <div onClick={() => fileInputRef.current?.click()} className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-primary">
                            <div className="space-y-1 text-center">
                                <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                    <p className="pl-1">{t('siteReporterOrDrag')}</p>
                                </div>
                            </div>
                        </div>
                        <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                        {images.length > 0 && (
                            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {images.map((img, i) => (
                                    <div key={i} className="relative">
                                        <img src={URL.createObjectURL(img)} alt={`upload-${i}`} className="h-24 w-full object-cover rounded" />
                                        <button onClick={() => removeImage(i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><XCircleIcon className="h-5 w-5"/></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Report Type */}
                    <div>
                        <label className="block text-sm font-medium">{t('siteReporterReportType')}</label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <button onClick={() => setReportType('client')} className={`px-4 py-2 border rounded-l-md w-1/3 ${reportType === 'client' ? 'bg-primary text-white border-primary' : ''}`}>{t('siteReporterTypeClient')}</button>
                            <button onClick={() => setReportType('snag')} className={`px-4 py-2 border w-1/3 ${reportType === 'snag' ? 'bg-primary text-white border-primary' : ''}`}>{t('siteReporterTypeSnag')}</button>
                            <button onClick={() => setReportType('safety')} className={`px-4 py-2 border rounded-r-md w-1/3 ${reportType === 'safety' ? 'bg-primary text-white border-primary' : ''}`}>{t('siteReporterTypeSafety')}</button>
                        </div>
                    </div>
                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium">{t('siteReporterNotes')}</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder={t('siteReporterNotesPlaceholder')} className="w-full p-2 border rounded-md mt-1" />
                    </div>
                    {/* Generate Button */}
                    <button onClick={handleGenerateReport} disabled={isLoading || images.length === 0} className="w-full flex items-center justify-center gap-2 bg-secondary text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50">
                        {isLoading ? t('siteReporterGenerating') : <><SparklesIcon className="h-5 w-5"/> {t('siteReporterGenerate')}</>}
                    </button>
                </div>
            </div>
            {/* Report Display & Chat */}
            <div className="flex flex-col gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold mb-4">{t('siteReporterReport')}</h3>
                    {error && <p className="text-red-500">{error}</p>}
                    <div className="relative">
                        <div className="h-[24rem] p-4 border bg-gray-50 rounded-md overflow-y-auto">
                            {renderReport()}
                        </div>
                        {report && (
                            <button onClick={handleCopy} className="absolute top-2 right-2 bg-gray-200 p-1.5 rounded-full hover:bg-gray-300" title={t('siteReporterCopy')}>
                                <ClipboardDocumentIcon className="h-5 w-5 text-gray-600" />
                            </button>
                        )}
                    </div>
                </div>
                
                {report && (
                    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col h-[20rem]">
                         <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                             <ChatBubbleLeftRightIcon className="h-5 w-5 text-primary"/> Chat with Site Image
                         </h3>
                         <div className="flex-grow overflow-y-auto bg-gray-50 rounded-lg p-3 space-y-3 mb-3 border">
                            {chatHistory.length === 0 && <p className="text-xs text-gray-400 text-center mt-4">Ask about the photo (e.g. "Is the brickwork level?", "Estimate the wall area")</p>}
                            {chatHistory.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] text-sm px-3 py-2 rounded-lg ${m.role === 'user' ? 'bg-primary text-white' : 'bg-white border text-gray-800'}`}>
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                            {isChatLoading && <p className="text-xs text-gray-400 ml-2">Analyzing image...</p>}
                            <div ref={chatEndRef} />
                         </div>
                         <form onSubmit={handleChatSubmit} className="flex gap-2">
                             <input 
                                type="text" 
                                value={chatInput} 
                                onChange={e => setChatInput(e.target.value)} 
                                className="flex-grow border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                                placeholder="Ask a follow-up question..."
                                disabled={isChatLoading}
                             />
                             <button type="submit" disabled={isChatLoading || !chatInput.trim()} className="bg-primary text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                 <PaperAirplaneIcon className="h-5 w-5"/>
                             </button>
                         </form>
                    </div>
                )}
            </div>
        </div>
    );
};


// --- Main Page Component --- //

interface SiteReporterPageProps {
    onBack: () => void;
}

const SiteReporterPage: React.FC<SiteReporterPageProps> = ({ onBack }) => {
    const { t } = useLocalization();
    const { projects } = useData();
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    if (!selectedProject) {
        return (
             <div>
                {onBack && (
                    <button onClick={onBack} className="flex items-center text-sm text-primary hover:underline mb-4">
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        {t('backToDashboard')}
                    </button>
                )}
                <h2 className="text-3xl font-bold mb-6">Select a Project for Your Report</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map(project => (
                        <button key={project.id} onClick={() => setSelectedProject(project)} className="p-4 bg-white rounded-lg shadow-md text-left hover:bg-gray-50 transition-colors">
                            <h3 className="font-bold text-primary">{project.projectName}</h3>
                            <p className="text-sm text-gray-500">{project.clientName}</p>
                        </button>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div>
            <button onClick={() => setSelectedProject(null)} className="flex items-center text-sm text-primary hover:underline mb-4">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Project Selection
            </button>
            <SiteReporterView project={selectedProject} />
        </div>
    )
};

export default SiteReporterPage;