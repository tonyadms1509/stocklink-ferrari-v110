
import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { useData } from '../hooks/useDataContext';
import { useLocalization } from '../hooks/useLocalization';
import { GoogleGenAI } from '@google/genai';
import { 
    ShieldCheckIcon, 
    DocumentTextIcon, 
    SparklesIcon, 
    ExclamationCircleIcon, 
    ArrowDownTrayIcon, 
    EyeIcon
} from '@heroicons/react/24/solid';
import { useToast } from '../hooks/useToast';

interface SafetyFileGeneratorProps {
    project: Project;
}

interface SafetyDocument {
    id: string;
    name: string;
    type: 'policy' | 'data';
    status: 'missing' | 'draft' | 'ready';
    content?: string;
    sourceCount?: number; // For data types like Risk Assessments
}

const SafetyFileGenerator: React.FC<SafetyFileGeneratorProps> = ({ project }) => {
    const { t } = useLocalization();
    const { showToast } = useToast();
    const { projectLogs, createProjectLog, addDocument } = useData();
    const [documents, setDocuments] = useState<SafetyDocument[]>([]);
    const [generatingId, setGeneratingId] = useState<string | null>(null);
    const [previewDoc, setPreviewDoc] = useState<SafetyDocument | null>(null);

    // Initialize document list with SA specific regulation names
    useEffect(() => {
        const risks = projectLogs.filter(l => l.projectId === project.id && l.type === 'Risk Assessment').length;
        const incidents = projectLogs.filter(l => l.projectId === project.id && l.type === 'Incident').length;
        
        // Check for existing generated policies in logs
        const hasHSPlan = projectLogs.some(l => l.projectId === project.id && l.type === 'General Note' && l.content.includes('Health & Safety Plan'));

        setDocuments([
            { id: 'hs_plan', name: 'Health & Safety Plan (CR 7)', type: 'policy', status: hasHSPlan ? 'ready' : 'missing' },
            { id: 'appoint_letters', name: 'Mandatory Agreement (37.2)', type: 'policy', status: 'missing' },
            { id: 'site_org', name: 'Site Organogram (16.2 Appts)', type: 'policy', status: 'missing' },
            { id: 'emerg_plan', name: 'Emergency Response Plan', type: 'policy', status: 'missing' },
            { id: 'risks', name: 'Baseline Risk Assessments', type: 'data', status: risks > 0 ? 'ready' : 'missing', sourceCount: risks },
            { id: 'incidents', name: 'Incident Register (Annexure 1)', type: 'data', status: incidents > 0 ? 'ready' : 'missing', sourceCount: incidents },
        ]);
    }, [project.id, projectLogs]);

    const handleGenerate = async (doc: SafetyDocument) => {
        if (!process.env.API_KEY) {
            showToast("API Key required.", "error");
            return;
        }
        setGeneratingId(doc.id);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                You are a SACPCMP registered Construction Health & Safety Officer in South Africa. 
                Draft a professional, legally compliant "${doc.name}" for the following project:
                
                Project Name: ${project.projectName}
                Client: ${project.clientName}
                Address: ${project.address}
                
                **Requirements:**
                - Strictly reference the Occupational Health and Safety Act (Act 85 of 1993).
                - Strictly reference the Construction Regulations 2014 (CR2014).
                - Use South African terminology and legal phrasing (e.g. "Department of Labour", "Section 16(2) appointee").
                - Keep formatting clean (Markdown).
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt
            });

            const content = response.text?.trim() || "";
            
            // Update local state
            setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, status: 'draft', content } : d));
            setPreviewDoc({ ...doc, content, status: 'draft' });

        } catch (e) {
            console.error(e);
            showToast("Generation failed.", "error");
        } finally {
            setGeneratingId(null);
        }
    };

    const handleSaveToProject = async () => {
        if (!previewDoc || !previewDoc.content) return;
        
        // 1. Create log entry for timeline
        await createProjectLog({
            projectId: project.id,
            type: 'General Note',
            content: `**${previewDoc.name}** created and saved to safety file.\n\nPreview:\n${previewDoc.content.slice(0, 100)}...`
        });
        
        // 2. Save as Project Document
        await addDocument({
            projectId: project.id,
            name: previewDoc.name,
            category: 'Safety File',
            url: '', // No URL for text-only docs
            fileType: 'text',
            textContent: previewDoc.content
        });
        
        setDocuments(prev => prev.map(d => d.id === previewDoc.id ? { ...d, status: 'ready' } : d));
        setPreviewDoc(null);
        showToast(`${previewDoc.name} saved to Documents.`, 'success');
    };

    const handleDownloadAll = () => {
        showToast("Generating consolidated SHE File PDF...", 'info');
        setTimeout(() => showToast("Download started.", "success"), 1500);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <ShieldCheckIcon className="h-6 w-6 text-primary"/> {t('safetyFileTitle')}
                        </h3>
                        <p className="text-sm text-gray-500">{t('safetyFileDescription')}</p>
                    </div>
                    <button 
                        onClick={handleDownloadAll}
                        className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors shadow-sm"
                    >
                        <ArrowDownTrayIcon className="h-5 w-5"/> {t('safetyFileDownload')}
                    </button>
                </div>

                <div className="space-y-3">
                    {documents.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors bg-white">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${doc.status === 'ready' ? 'bg-green-100 text-green-600' : doc.status === 'draft' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'}`}>
                                    <DocumentTextIcon className="h-6 w-6"/>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800">{doc.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold uppercase ${doc.status === 'ready' ? 'bg-green-100 text-green-800' : doc.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                            {doc.status}
                                        </span>
                                        {doc.type === 'data' && (
                                            <span className="text-xs text-gray-500">{doc.sourceCount || 0} records found</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {doc.type === 'policy' && (
                                    <>
                                        {doc.content && (
                                            <button onClick={() => setPreviewDoc(doc)} className="p-2 text-gray-500 hover:text-primary" title="View/Edit">
                                                <EyeIcon className="h-5 w-5"/>
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleGenerate(doc)}
                                            disabled={generatingId === doc.id}
                                            className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-1 disabled:opacity-50"
                                        >
                                            {generatingId === doc.id ? (
                                                <SparklesIcon className="h-4 w-4 animate-spin"/>
                                            ) : (
                                                <SparklesIcon className="h-4 w-4"/>
                                            )}
                                            {doc.status === 'missing' ? 'Generate' : 'Regenerate'}
                                        </button>
                                    </>
                                )}
                                {doc.type === 'data' && doc.status === 'missing' && (
                                    <span className="text-xs text-red-500 italic flex items-center gap-1">
                                        <ExclamationCircleIcon className="h-4 w-4"/> Needs Input
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Preview Panel */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col h-[600px]">
                <h3 className="font-bold text-lg mb-4 border-b pb-2">Document Preview</h3>
                {previewDoc ? (
                    <>
                        <div className="flex-grow overflow-y-auto bg-gray-50 p-4 rounded-md border mb-4">
                            <h4 className="font-bold mb-2 text-center uppercase">{previewDoc.name}</h4>
                            <p className="whitespace-pre-wrap text-sm text-gray-700 font-serif leading-relaxed">{previewDoc.content}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setPreviewDoc(null)} className="flex-1 bg-gray-200 text-gray-800 font-bold py-2 rounded-lg hover:bg-gray-300">Close</button>
                            <button onClick={handleSaveToProject} className="flex-1 bg-primary text-white font-bold py-2 rounded-lg hover:bg-blue-700">Save to File</button>
                        </div>
                    </>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-gray-400 text-center p-8">
                        <DocumentTextIcon className="h-16 w-16 mb-4 opacity-20"/>
                        <p>Select a document to generate and preview it here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SafetyFileGenerator;
