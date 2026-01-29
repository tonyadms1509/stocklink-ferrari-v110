
import React, { useState } from 'react';
import { useData } from '../../hooks/useDataContext';
import { useAuth } from '../../hooks/useAuth';
import { useLocalization } from '../../hooks/useLocalization';
import { Project, ProjectTemplate } from '../../types';
import { ArrowLeftIcon, SparklesIcon, DocumentDuplicateIcon, PlusIcon, GlobeAltIcon, UserCircleIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { GoogleGenAI, Type } from '@google/genai';
import CreateProjectWithTemplateModal from '../../components/CreateProjectWithTemplateModal';
import { useToast } from '../../hooks/useToast';
import EmptyState from '../../components/EmptyState';

// Mock Community Templates (In real app, fetch from DB)
const COMMUNITY_TEMPLATES: ProjectTemplate[] = [
    { id: 'ct-1', contractorId: 'system', name: 'Standard Single Garage', description: 'Brick and mortar single garage with flat roof.', materials: [{ itemName: 'Cement Stock Bricks', quantity: 4500 }, { itemName: 'Cement 50kg', quantity: 35 }, { itemName: 'River Sand (m3)', quantity: 6 }, { itemName: 'Garage Door (Single)', quantity: 1 }] },
    { id: 'ct-2', contractorId: 'system', name: 'Bathroom Renovation (Full)', description: 'Complete strip and redo of standard 2x2m bathroom.', materials: [{ itemName: 'Ceramic Floor Tiles (m2)', quantity: 5 }, { itemName: 'Wall Tiles (m2)', quantity: 22 }, { itemName: 'Tile Adhesive (20kg)', quantity: 6 }, { itemName: 'Toilet Suite', quantity: 1 }, { itemName: 'Basin & Pedestal', quantity: 1 }, { itemName: 'Shower Door', quantity: 1 }] },
    { id: 'ct-3', contractorId: 'system', name: 'Nutec House (3x6m)', description: 'Timber frame wendy house structure with Nutec cladding.', materials: [{ itemName: 'Nutec Boards 6mm', quantity: 18 }, { itemName: 'Timber 38x38mm (3m)', quantity: 45 }, { itemName: 'Corrugated Roof Sheets (3.6m)', quantity: 8 }] },
];

interface ProjectTemplatesPageProps {
    onViewProject: (project: Project) => void;
    onBack?: () => void;
}

const ProjectTemplatesPage: React.FC<ProjectTemplatesPageProps> = ({ onViewProject, onBack }) => {
    const { t } = useLocalization();
    const { user } = useAuth();
    const { projectTemplates, saveProjectTemplate, createProjectFromTemplate } = useData();
    const { showToast } = useToast();

    const [activeTab, setActiveTab] = useState<'my' | 'community'>('my');
    const [description, setDescription] = useState('');
    const [generatedTemplate, setGeneratedTemplate] = useState<Omit<ProjectTemplate, 'id' | 'contractorId'> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [modalTemplate, setModalTemplate] = useState<ProjectTemplate | null>(null);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim() || !process.env.API_KEY) return;
        
        setIsLoading(true);
        setError(null);
        setGeneratedTemplate(null);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const systemInstruction = `You are an expert quantity surveyor for building projects in South Africa. Your task is to analyze a contractor's project description and generate a typical bill of materials.
            - The name of the template should be a title-cased version of the user's description.
            - The description should be a concise, one-sentence summary.
            - The materials list should contain objects with "itemName" (string) and "quantity" (number).
            - Base your material names on common South African building material terms (e.g., 'Cement Stock Brick', 'Corrugated Iron Sheeting').
            - Your response MUST be in the specified JSON format.`;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    materials: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                itemName: { type: Type.STRING },
                                quantity: { type: Type.NUMBER },
                            }
                        }
                    }
                },
                required: ["name", "description", "materials"]
            };

            // Fix: Updated model name to gemini-3-flash-preview
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: description,
                config: { systemInstruction, responseMimeType: 'application/json', responseSchema }
            });

            // Fix: Ensure correct property access for text
            setGeneratedTemplate(JSON.parse(response.text || '{}'));

        } catch (err) {
            console.error("Template Generation Error:", err);
            setError("Failed to generate template. Please try rephrasing your request.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = () => {
        if (generatedTemplate) {
            saveProjectTemplate(generatedTemplate);
            setGeneratedTemplate(null);
            setDescription('');
            showToast(t('templatesSaveSuccess'), 'success');
        }
    };

    const handleClone = (template: ProjectTemplate) => {
        saveProjectTemplate({
            name: template.name,
            description: template.description,
            materials: template.materials
        });
        showToast("Template saved to your library.", 'success');
        setActiveTab('my');
    };
    
    const handleCreateProject = async (templateId: string, projectDetails: Omit<Project, 'id'|'contractorId'|'status'|'createdAt'>) => {
        const newProject = await createProjectFromTemplate(templateId, projectDetails);
        if (newProject) {
            onViewProject(newProject);
        }
        return newProject;
    }

    return (
        <>
            <div className="pb-12">
                {onBack && (
                    <button onClick={onBack} className="flex items-center text-sm text-primary hover:underline mb-4">
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        {t('backToDashboard')}
                    </button>
                )}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                     <h2 className="text-3xl font-bold">{t('templatesTitle')}</h2>
                     <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button onClick={() => setActiveTab('my')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'my' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                            <UserCircleIcon className="h-4 w-4 inline mr-2"/> My Templates
                        </button>
                        <button onClick={() => setActiveTab('community')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'community' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                            <GlobeAltIcon className="h-4 w-4 inline mr-2"/> Community Library
                        </button>
                    </div>
                </div>
                
                {activeTab === 'my' && (
                    <>
                        {/* Generate Section */}
                        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-100">
                            <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
                                <SparklesIcon className="h-6 w-6 text-accent"/>
                                {t('templatesGenerateTitle')}
                            </h3>
                            <p className="text-gray-600 mb-4">{t('templatesGenerateDescription')}</p>
                            
                            <form onSubmit={handleGenerate}>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={description} 
                                        onChange={e => setDescription(e.target.value)} 
                                        placeholder={t('templatesGeneratePlaceholder')} 
                                        className="flex-grow p-3 border rounded-lg focus:ring-primary focus:border-primary"
                                        disabled={isLoading}
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={isLoading || !description.trim()}
                                        className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-800 disabled:opacity-50 min-w-[120px] flex justify-center items-center"
                                    >
                                        {isLoading ? (
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : t('templatesGenerateButton')}
                                    </button>
                                </div>
                            </form>
                            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}

                            {generatedTemplate && (
                                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 animate-fade-in-scale">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-bold text-lg text-blue-900">{generatedTemplate.name}</h4>
                                            <p className="text-sm text-blue-700">{generatedTemplate.description}</p>
                                        </div>
                                        <button onClick={handleSave} className="bg-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-600 text-sm flex items-center gap-2">
                                            <PlusIcon className="h-4 w-4"/> {t('templatesSaveButton')}
                                        </button>
                                    </div>
                                    <h5 className="font-semibold text-sm text-blue-800 mb-2">Materials List:</h5>
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {generatedTemplate.materials.map((m, i) => (
                                            <li key={i} className="bg-white p-2 rounded border border-blue-100 text-sm flex justify-between text-blue-900">
                                                <span>{m.itemName}</span>
                                                <span className="font-bold">{m.quantity}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Saved Templates List */}
                        <h3 className="text-2xl font-bold mb-4">{t('templatesSavedTitle')}</h3>
                        {projectTemplates.length === 0 ? (
                            <EmptyState 
                                icon={DocumentDuplicateIcon} 
                                title={t('templatesNoTemplates')} 
                                message="" 
                            />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {projectTemplates.map(template => (
                                    <div key={template.id} className="bg-white p-6 rounded-lg shadow-md flex flex-col border border-gray-100">
                                        <h4 className="font-bold text-lg text-gray-900">{template.name}</h4>
                                        <p className="text-sm text-gray-600 mt-1 mb-4 flex-grow">{template.description}</p>
                                        <div className="text-xs text-gray-500 mb-4 bg-gray-50 p-2 rounded w-fit">{template.materials.length} items</div>
                                        <button 
                                            onClick={() => setModalTemplate(template)} 
                                            className="w-full bg-gray-100 hover:bg-gray-200 text-primary font-bold py-2 px-4 rounded-lg text-sm transition-colors"
                                        >
                                            {t('templatesUseButton')}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'community' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                        {COMMUNITY_TEMPLATES.map(template => (
                            <div key={template.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2 opacity-5">
                                    <GlobeAltIcon className="h-24 w-24 transform rotate-12"/>
                                </div>
                                <h4 className="font-bold text-lg text-gray-900 relative z-10">{template.name}</h4>
                                <p className="text-sm text-gray-600 mt-1 mb-4 h-12 overflow-hidden relative z-10">{template.description}</p>
                                <div className="flex flex-wrap gap-2 mb-4 relative z-10">
                                    {template.materials.slice(0, 3).map((m, i) => (
                                        <span key={i} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">{m.itemName}</span>
                                    ))}
                                    {template.materials.length > 3 && <span className="text-[10px] text-gray-400">+{template.materials.length - 3} more</span>}
                                </div>
                                <div className="flex gap-2 relative z-10">
                                    <button 
                                        onClick={() => setModalTemplate(template)} 
                                        className="flex-1 bg-primary text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                                    >
                                        Use
                                    </button>
                                    <button 
                                        onClick={() => handleClone(template)} 
                                        className="p-2 text-gray-500 hover:text-primary bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                        title="Save to My Templates"
                                    >
                                        <ArrowDownTrayIcon className="h-5 w-5"/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {modalTemplate && (
                <CreateProjectWithTemplateModal
                    template={modalTemplate}
                    onClose={() => setModalTemplate(null)}
                    onCreateProject={handleCreateProject}
                />
            )}
        </>
    );
};

export default ProjectTemplatesPage;
