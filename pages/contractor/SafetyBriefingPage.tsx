
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { SafetyBriefing, Project, ProjectLog } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import { ArrowLeftIcon, ShieldCheckIcon, ClipboardDocumentIcon, ExclamationTriangleIcon, DocumentTextIcon, PlusIcon, CheckCircleIcon, PaperAirplaneIcon, ClipboardDocumentListIcon, PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useToast } from '../../hooks/useToast';
import { useData } from '../../hooks/useDataContext';
import IncidentReportModal from '../../components/IncidentReportModal';
import PermitToWorkModal from '../../components/PermitToWorkModal';

interface SafetyHubPageProps {
    onBack?: () => void;
}

interface RiskAssessmentItem {
    activity: string;
    hazard: string;
    consequence: string;
    inherentRisk: 'Low' | 'Medium' | 'High';
    controlMeasures: string;
    residualRisk: 'Low' | 'Medium' | 'High';
}

const SafetyHubPage: React.FC<SafetyHubPageProps> = ({ onBack }) => {
    const { t } = useLocalization();
    const { showToast } = useToast();
    const { projects, createProjectLog, projectLogs, safetyPermits } = useData();
    const [activeTab, setActiveTab] = useState<'briefings' | 'risk' | 'permits' | 'incidents'>('briefings');
    
    // Briefing State
    const [safetyBriefing, setSafetyBriefing] = useState<SafetyBriefing | null>(null);
    const [isLoadingBriefing, setIsLoadingBriefing] = useState(false);
    const [briefingError, setBriefingError] = useState<string | null>(null);
    const [safetyTopic, setSafetyTopic] = useState(t('safetyTopicHeights'));
    const [dailyFocus, setDailyFocus] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [isBriefingLogged, setIsBriefingLogged] = useState(false);
    
    // Attendance & Signature
    const [showSignaturePad, setShowSignaturePad] = useState(false);
    const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [attendees, setAttendees] = useState<{name: string, present: boolean}[]>([
        { name: "John Smith (Foreman)", present: true },
        { name: "David Nkosi", present: true },
        { name: "Sarah Jones", present: true },
        { name: "Mike Williams", present: true },
    ]);

    // Risk Assessment State
    const [riskActivity, setRiskActivity] = useState('');
    const [riskAssessment, setRiskAssessment] = useState<RiskAssessmentItem[] | null>(null);
    const [isLoadingRisk, setIsLoadingRisk] = useState(false);
    const [isRiskLogged, setIsRiskLogged] = useState(false);

    // Incident/Permit State
    const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
    const [isPermitModalOpen, setIsPermitModalOpen] = useState(false);

    useEffect(() => {
        if (projects.length > 0 && !selectedProjectId) {
            setSelectedProjectId(projects[0].id);
        }
    }, [projects, selectedProjectId]);
    
    const activeProject = projects.find(p => p.id === selectedProjectId);

    // --- Signature Logic ---
    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = signatureCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        setIsDrawing(true);
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        
        ctx.beginPath();
        ctx.moveTo(clientX - rect.left, clientY - rect.top);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = signatureCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        
        ctx.lineTo(clientX - rect.left, clientY - rect.top);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };
    
    const clearSignature = () => {
        const canvas = signatureCanvasRef.current;
        const ctx = canvas?.getContext('2d');
        ctx?.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
    }


    // --- Briefing Logic ---
    const handleGenerateBriefing = async () => {
        if (!process.env.API_KEY) {
            setBriefingError("API key not configured.");
            return;
        }
        setIsLoadingBriefing(true);
        setBriefingError(null);
        setSafetyBriefing(null);
        setIsBriefingLogged(false);
        setShowSignaturePad(false);
        
        try {
             const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
             const systemInstruction = `You are an expert construction Safety Officer in South Africa. Your task is to generate a daily "Toolbox Talk" script for a contractor to read to their team. The script should be clear, concise, and easy to understand.
             - Address the selected topic directly.
             - Incorporate the "Daily Focus" into the context.
             - List 3-5 key risks in a bulleted list.
             - List 3-5 essential safety procedures in a bulleted list.
             - End with a strong closing statement to reinforce the safety message.
             - Your response MUST be in the specified JSON format.`;
            
            const contents = `Safety Topic: ${safetyTopic}\nDaily Focus: ${dailyFocus || 'General safety for this topic.'}`;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    topic: { type: Type.STRING },
                    risks: { type: Type.ARRAY, items: { type: Type.STRING } },
                    procedures: { type: Type.ARRAY, items: { type: Type.STRING } },
                    closingStatement: { type: Type.STRING }
                },
                required: ["topic", "risks", "procedures", "closingStatement"]
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents,
                config: { systemInstruction, responseMimeType: "application/json", responseSchema }
            });

            setSafetyBriefing(JSON.parse(response.text));

        } catch (err) {
             console.error("Safety Briefing Error:", err);
            setBriefingError(t('safetyAIError'));
        } finally {
            setIsLoadingBriefing(false);
        }
    };

    const handleLogBriefing = async () => {
        if (!safetyBriefing || !selectedProjectId) return;
        
        const presentAttendees = attendees.filter(a => a.present).map(a => a.name).join(', ');
        const canvas = signatureCanvasRef.current;
        const signatureData = canvas ? canvas.toDataURL() : ''; // Get base64 signature

        const content = `**${safetyBriefing.topic}**\n\n**Risks:**\n- ${safetyBriefing.risks.join('\n- ')}\n\n**Procedures:**\n- ${safetyBriefing.procedures.join('\n- ')}\n\n**Closing Statement:**\n"${safetyBriefing.closingStatement}"\n\n**Attendance:** ${presentAttendees}\n\n**Signed Off By:** Foreman/Safety Officer`;
        
        // In a real app, we'd upload the signature image to storage and link it.
        // For now, we simulate saving it with the log.
        await createProjectLog({ 
            projectId: selectedProjectId, 
            type: 'Safety Briefing', 
            content: content,
            images: signatureData ? [signatureData] : []
        });
        
        setIsBriefingLogged(true);
        setShowSignaturePad(false);
        showToast('Briefing logged with attendance record.', 'success');
    };

    const handleCopyToClipboard = () => {
        if (!safetyBriefing) return;
        const textToCopy = `${t('safetyAIReportTopic')}: ${safetyBriefing.topic}\n\n${t('safetyAIReportRisks')}:\n- ${safetyBriefing.risks.join('\n- ')}\n\n${t('safetyAIReportProcedures')}:\n- ${safetyBriefing.procedures.join('\n- ')}\n\n${t('safetyAIReportClosing')}:\n"${safetyBriefing.closingStatement}"`;
        navigator.clipboard.writeText(textToCopy);
        showToast('Briefing copied to clipboard!', 'info');
    };

    // --- Risk Assessment Logic ---
    const handleGenerateRiskAssessment = async () => {
        if (!process.env.API_KEY || !riskActivity) return;
        setIsLoadingRisk(true);
        setRiskAssessment(null);
        setIsRiskLogged(false);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const systemInstruction = `You are a construction Safety Officer creating a HIRA (Hazard Identification and Risk Assessment) table.
            Based on the activity description provided, identify potential hazards, assess risks (High/Medium/Low), suggest control measures, and estimate residual risk.
            Return a JSON array of objects.`;
            
            const responseSchema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        activity: { type: Type.STRING },
                        hazard: { type: Type.STRING },
                        consequence: { type: Type.STRING },
                        inherentRisk: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
                        controlMeasures: { type: Type.STRING },
                        residualRisk: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] }
                    },
                    required: ['activity', 'hazard', 'consequence', 'inherentRisk', 'controlMeasures', 'residualRisk']
                }
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Activity: ${riskActivity}`,
                config: { systemInstruction, responseMimeType: "application/json", responseSchema }
            });

            setRiskAssessment(JSON.parse(response.text));
        } catch (err) {
            console.error("Risk Assessment Error:", err);
            showToast("Failed to generate risk assessment.", 'error');
        } finally {
            setIsLoadingRisk(false);
        }
    };

    const handleLogRiskAssessment = async () => {
        if (!riskAssessment || !selectedProjectId) return;
        
        // Format as markdown table for log
        let content = `**Risk Assessment: ${riskActivity}**\n\n| Hazard | Risk | Control | Residual |\n|---|---|---|---|\n`;
        riskAssessment.forEach(item => {
            content += `| ${item.hazard} | ${item.inherentRisk} | ${item.controlMeasures} | ${item.residualRisk} |\n`;
        });

        await createProjectLog({ projectId: selectedProjectId, type: 'Risk Assessment', content });
        setIsRiskLogged(true);
        showToast('Risk Assessment logged.', 'success');
    };

    // --- Incident Logic ---
    const incidents = projectLogs.filter(l => l.type === 'Incident' && (selectedProjectId ? l.projectId === selectedProjectId : true));
    const projectPermits = safetyPermits.filter(p => p.projectId === selectedProjectId);

    const safetyTopics = [
        t('safetyTopicHeights'),
        t('safetyTopicElectrical'),
        t('safetyTopicHousekeeping'),
        t('safetyTopicTools'),
        t('safetyTopicPPE'),
    ];

    return (
        <div className="pb-20">
            {onBack && (
                <button onClick={onBack} className="flex items-center text-sm text-primary hover:underline mb-4">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    {t('backToDashboard')}
                </button>
            )}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold">{t('safetyHubTitle')}</h2>
                    <p className="text-gray-600 mt-1">{t('safetyHubDescription')}</p>
                </div>
                <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                     <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} className="p-2 bg-transparent font-semibold text-sm outline-none cursor-pointer">
                        <option value="" disabled>Select Project</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
                    </select>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b mb-6 overflow-x-auto">
                <button onClick={() => setActiveTab('briefings')} className={`py-3 px-6 text-sm font-bold border-b-2 whitespace-nowrap ${activeTab === 'briefings' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{t('safetyHubTabBriefings')}</button>
                <button onClick={() => setActiveTab('permits')} className={`py-3 px-6 text-sm font-bold border-b-2 whitespace-nowrap ${activeTab === 'permits' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Permits to Work</button>
                <button onClick={() => setActiveTab('risk')} className={`py-3 px-6 text-sm font-bold border-b-2 whitespace-nowrap ${activeTab === 'risk' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{t('safetyHubTabRisk')}</button>
                <button onClick={() => setActiveTab('incidents')} className={`py-3 px-6 text-sm font-bold border-b-2 whitespace-nowrap ${activeTab === 'incidents' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{t('safetyHubTabIncidents')}</button>
            </div>

            {/* Briefings Tab (Clipboard Style) */}
            {activeTab === 'briefings' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-6">
                         <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium">{t('safetyAITopic')}</label>
                                    <select value={safetyTopic} onChange={e => setSafetyTopic(e.target.value)} className="mt-1 p-2 w-full border rounded-md bg-white">
                                        {safetyTopics.map(topic => <option key={topic} value={topic}>{topic}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">{t('safetyAIDailyFocus')}</label>
                                    <textarea value={dailyFocus} onChange={e => setDailyFocus(e.target.value)} rows={3} placeholder={t('safetyAIPlaceholder')} className="mt-1 p-2 w-full border rounded-md" />
                                </div>
                                <button onClick={handleGenerateBriefing} disabled={isLoadingBriefing} className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-800 disabled:opacity-50">
                                    {isLoadingBriefing ? t('safetyAIGenerating') : t('safetyAIGenerate')}
                                </button>
                            </div>
                        </div>
                        
                        {/* Attendance Register */}
                        {safetyBriefing && (
                            <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in-up">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <ClipboardDocumentListIcon className="h-5 w-5 text-secondary"/> Attendance & Sign-off
                                </h3>
                                <div className="space-y-2 mb-6">
                                    {attendees.map((attendee, index) => (
                                        <label key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer border border-transparent hover:border-gray-200">
                                            <span className="text-sm font-medium text-gray-700">{attendee.name}</span>
                                            <input 
                                                type="checkbox" 
                                                checked={attendee.present} 
                                                onChange={() => {
                                                    const newAttendees = [...attendees];
                                                    newAttendees[index].present = !newAttendees[index].present;
                                                    setAttendees(newAttendees);
                                                }}
                                                className="w-5 h-5 text-secondary rounded focus:ring-secondary"
                                            />
                                        </label>
                                    ))}
                                </div>

                                {!showSignaturePad && !isBriefingLogged && (
                                     <button 
                                        onClick={() => setShowSignaturePad(true)} 
                                        className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 font-bold hover:bg-gray-50 hover:border-gray-400 flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <PencilSquareIcon className="h-5 w-5"/> Sign to Validate
                                    </button>
                                )}

                                {showSignaturePad && (
                                    <div className="border-2 border-gray-300 rounded-lg p-1 bg-gray-50">
                                        <p className="text-xs text-center text-gray-500 mb-1">Safety Officer Signature</p>
                                        <canvas
                                            ref={signatureCanvasRef}
                                            width={300}
                                            height={150}
                                            className="w-full h-32 bg-white rounded cursor-crosshair touch-none"
                                            onMouseDown={startDrawing}
                                            onMouseMove={draw}
                                            onMouseUp={stopDrawing}
                                            onMouseLeave={stopDrawing}
                                            onTouchStart={startDrawing}
                                            onTouchMove={draw}
                                            onTouchEnd={stopDrawing}
                                        />
                                        <div className="flex justify-between mt-2 px-1">
                                            <button onClick={clearSignature} className="text-xs text-red-500 font-bold hover:underline">Clear</button>
                                            <button onClick={() => setShowSignaturePad(false)} className="text-xs text-gray-500 hover:underline">Cancel</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* Clipboard UI */}
                    <div className="relative bg-yellow-700 rounded-xl p-2 shadow-xl">
                        {/* Clipboard Clip */}
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-24 h-8 bg-gray-300 rounded-t-lg border-4 border-gray-400 z-10 shadow-md"></div>
                        
                        {/* Paper */}
                        <div className="bg-lined-paper p-8 rounded-lg min-h-[600px] shadow-inner relative text-gray-800 font-medium font-serif">
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-gray-300 rounded-b-md opacity-50"></div>
                            
                            <h3 className="text-xl font-bold text-center uppercase border-b-2 border-black pb-2 mb-4 tracking-wider">{t('safetyAIReportTitle')}</h3>
                            <p className="text-right text-xs font-mono mb-6">{new Date().toLocaleDateString()}</p>
                            
                            {isLoadingBriefing && <p className="text-center text-gray-500 animate-pulse mt-10">{t('safetyAIGenerating')}</p>}
                            {briefingError && <p className="text-red-600 text-center mt-10">{briefingError}</p>}
                            
                            {safetyBriefing ? (
                                <div className="space-y-6 relative">
                                    <button onClick={handleCopyToClipboard} className="absolute top-0 right-0 text-gray-400 hover:text-gray-600" title="Copy">
                                        <ClipboardDocumentIcon className="h-5 w-5" />
                                    </button>
                                    <div><h4 className="font-bold uppercase underline decoration-2 underline-offset-2">{safetyBriefing.topic}</h4></div>
                                    <div>
                                        <h4 className="font-bold uppercase text-sm">{t('safetyAIReportRisks')}</h4>
                                        <ul className="list-disc list-inside pl-2 space-y-1">{safetyBriefing.risks.map((risk, i) => <li key={i}>{risk}</li>)}</ul>
                                    </div>
                                    <div>
                                        <h4 className="font-bold uppercase text-sm">{t('safetyAIReportProcedures')}</h4>
                                        <ul className="list-disc list-inside pl-2 space-y-1">{safetyBriefing.procedures.map((proc, i) => <li key={i}>{proc}</li>)}</ul>
                                    </div>
                                    <div className="border-t border-gray-400 pt-4 mt-4">
                                        <p className="italic text-center font-semibold">"{safetyBriefing.closingStatement}"</p>
                                    </div>
                                </div>
                            ) : !isLoadingBriefing && (
                                <div className="text-center text-gray-400 py-20 opacity-60">
                                    <ClipboardDocumentListIcon className="h-16 w-16 mx-auto mb-2"/>
                                    <p>Generated briefing will appear here.</p>
                                </div>
                            )}
                        </div>
                        
                        {safetyBriefing && selectedProjectId && (
                             <button onClick={handleLogBriefing} disabled={isBriefingLogged} className={`absolute bottom-6 right-6 font-bold py-3 px-6 rounded-full shadow-lg disabled:opacity-50 flex items-center gap-2 transition-transform hover:-translate-y-1 ${isBriefingLogged ? 'bg-green-600 text-white cursor-default' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                                {isBriefingLogged ? <CheckCircleIcon className="h-5 w-5"/> : <PaperAirplaneIcon className="h-5 w-5"/>}
                                {isBriefingLogged ? 'Logged' : 'Submit Log'}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Permits Tab */}
            {activeTab === 'permits' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold flex items-center gap-2 text-red-700"><DocumentTextIcon className="h-6 w-6"/> Active Permits</h3>
                        <button 
                            onClick={() => setIsPermitModalOpen(true)} 
                            disabled={!selectedProjectId} 
                            className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
                        >
                            <PlusIcon className="h-5 w-5"/> Issue New Permit
                        </button>
                    </div>
                    
                    {!selectedProjectId ? (
                         <p className="text-gray-500 text-center py-8">Please select a project to view permits.</p>
                    ) : projectPermits.length === 0 ? (
                        <div className="text-center p-12 bg-white rounded-lg shadow-sm border border-gray-200">
                             <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4"/>
                             <p className="text-gray-600 font-medium">No active high-risk work requiring permits.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {projectPermits.map(permit => (
                                <div key={permit.id} className={`p-4 rounded-lg border-l-4 shadow-sm bg-white ${permit.status === 'Active' ? 'border-green-500' : 'border-gray-300'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-lg">{permit.type}</h4>
                                        <span className={`text-xs px-2 py-1 rounded font-bold ${permit.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{permit.status}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{permit.description}</p>
                                    <p className="text-xs text-gray-500">Valid: {new Date(permit.validFrom).toLocaleString()} - {new Date(permit.validTo).toLocaleString()}</p>
                                    <p className="text-xs text-gray-500 mt-1">Auth: {permit.authorizedBy}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Risk Assessment Tab */}
            {activeTab === 'risk' && (
                <div>
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary"><ExclamationTriangleIcon className="h-6 w-6"/> {t('safetyRiskTitle')}</h3>
                        <div className="flex gap-4">
                            <div className="flex-grow">
                                <label className="block text-sm font-medium mb-1">{t('safetyRiskActivity')}</label>
                                <input type="text" value={riskActivity} onChange={e => setRiskActivity(e.target.value)} placeholder={t('safetyRiskActivityPlaceholder')} className="w-full p-2 border rounded-md" />
                            </div>
                            <div className="flex flex-col justify-end">
                                <button onClick={handleGenerateRiskAssessment} disabled={isLoadingRisk || !riskActivity} className="bg-secondary text-white font-bold py-2 px-6 rounded-lg hover:bg-emerald-600 disabled:opacity-50">
                                    {isLoadingRisk ? t('safetyRiskGenerating') : t('safetyRiskGenerate')}
                                </button>
                            </div>
                        </div>
                    </div>

                    {riskAssessment && (
                        <div className="bg-white rounded-lg shadow-md overflow-hidden animate-fade-in-scale">
                            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                                <h4 className="font-bold text-gray-800">HIRA Table</h4>
                                {selectedProjectId && (
                                    <button onClick={handleLogRiskAssessment} disabled={isRiskLogged} className="bg-blue-600 text-white text-sm font-bold py-1 px-3 rounded disabled:opacity-50">
                                        {isRiskLogged ? 'Logged' : t('safetyRiskLog')}
                                    </button>
                                )}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-100 text-gray-700">
                                        <tr>
                                            <th className="p-3">{t('safetyRiskTableActivity')}</th>
                                            <th className="p-3">{t('safetyRiskTableHazard')}</th>
                                            <th className="p-3">{t('safetyRiskTableRisk')}</th>
                                            <th className="p-3">{t('safetyRiskTableControl')}</th>
                                            <th className="p-3">{t('safetyRiskTableResidual')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {riskAssessment.map((item, idx) => (
                                            <tr key={idx} className="border-b last:border-0">
                                                <td className="p-3 font-medium">{item.activity}</td>
                                                <td className="p-3">{item.hazard}</td>
                                                <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-bold ${item.inherentRisk === 'High' ? 'bg-red-100 text-red-800' : item.inherentRisk === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{item.inherentRisk}</span></td>
                                                <td className="p-3">{item.controlMeasures}</td>
                                                <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-bold ${item.residualRisk === 'High' ? 'bg-red-100 text-red-800' : item.residualRisk === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{item.residualRisk}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Incidents Tab */}
            {activeTab === 'incidents' && (
                 <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-red-700 flex items-center gap-2"><ExclamationTriangleIcon className="h-6 w-6"/> {t('safetyIncidentTitle')}</h3>
                        <button onClick={() => setIsIncidentModalOpen(true)} disabled={!selectedProjectId} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50">
                            <PlusIcon className="h-5 w-5"/> {t('safetyIncidentReport')}
                        </button>
                    </div>

                    {incidents.length === 0 ? (
                        <div className="text-center p-12 bg-white rounded-lg shadow-sm border border-gray-200">
                             <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4"/>
                             <p className="text-gray-600 font-medium">{t('safetyIncidentNoIncidents')}</p>
                             <p className="text-sm text-gray-500">Keep up the good work!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {incidents.map(incident => (
                                <div key={incident.id} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
                                    <div className="flex justify-between items-start">
                                        <p className="text-xs text-gray-500">{new Date(incident.date).toLocaleDateString()}</p>
                                        <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">Reported</span>
                                    </div>
                                    <p className="text-gray-800 mt-2 whitespace-pre-wrap">{incident.content}</p>
                                </div>
                            ))}
                        </div>
                    )}
                 </div>
            )}
            
            {isIncidentModalOpen && activeProject && (
                <IncidentReportModal 
                    projectId={selectedProjectId} 
                    onClose={() => setIsIncidentModalOpen(false)}
                />
            )}
            {isPermitModalOpen && activeProject && (
                <PermitToWorkModal 
                    project={activeProject}
                    onClose={() => setIsPermitModalOpen(false)}
                />
            )}
        </div>
    );
};

export default SafetyHubPage;
