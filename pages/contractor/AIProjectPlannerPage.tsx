
import React, { useState, useEffect } from 'react';
import { Project, ProjectPlan } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import { useData } from '../../hooks/useDataContext';
import { ArrowLeftIcon, SparklesIcon, ClipboardDocumentIcon, CheckIcon, ExclamationTriangleIcon, BriefcaseIcon } from '@heroicons/react/24/solid';
import { useToast } from '../../hooks/useToast';
import CreateProjectModal from '../../components/CreateProjectModal';

interface AIProjectPlannerPageProps {
    onBack?: () => void;
    onViewProject: (project: Project) => void;
}

const AIProjectPlannerPage: React.FC<AIProjectPlannerPageProps> = ({ onBack, onViewProject }) => {
    const { t } = useLocalization();
    const { showToast } = useToast();
    const { projectPlan, isAILoading, plannerError, generateProjectPlan, clearProjectPlan } = useData();

    const [description, setDescription] = useState('');
    const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);

    useEffect(() => {
        // Clear the plan when the component unmounts
        return () => {
            clearProjectPlan();
        };
    }, [clearProjectPlan]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) return;
        generateProjectPlan(description);
    };
    
    const handleProjectCreated = (newProject: Project) => {
        showToast(`Project '${newProject.projectName}' created successfully!`, 'success');
        onViewProject(newProject);
    };

    const handleCopyToClipboard = () => {
        if (!projectPlan) return;
        let textToCopy = `Project Plan for: ${description}\n\n`;
        projectPlan.phases.forEach(phase => {
            textToCopy += `## ${phase.phaseName} (${phase.estimatedDuration})\n`;
            phase.tasks.forEach(task => {
                textToCopy += `- ${task}\n`;
            });
            textToCopy += '\n';
        });
        textToCopy += `## Safety Checklist\n`;
        projectPlan.safetyChecklist.forEach(item => {
            textToCopy += `- ${item}\n`;
        });
        textToCopy += `\nDisclaimer: ${projectPlan.disclaimer}`;
        navigator.clipboard.writeText(textToCopy);
        showToast(t('plannerCopy'), 'info');
    };

    return (
        <>
            <div>
                {onBack && (
                    <button onClick={onBack} className="flex items-center text-sm text-primary hover:underline mb-4">
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        {t('backToDashboard')}
                    </button>
                )}
                <h2 className="text-3xl font-bold">{t('navAIPlanner')}</h2>
                <p className="text-gray-600 mb-6">{t('plannerDescription')}</p>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <form onSubmit={handleSubmit}>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('plannerPlaceholder')}
                            className="w-full p-3 border-2 border-base-300 rounded-lg focus:ring-primary focus:border-primary transition-colors"
                            rows={4}
                            disabled={isAILoading.planner}
                        />
                        <button
                            type="submit"
                            disabled={isAILoading.planner || !description.trim()}
                            className="w-full sm:w-auto mt-4 flex items-center justify-center gap-2 bg-primary hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                        >
                             {isAILoading.planner ? (
                                <>{t('plannerGenerating')}</>
                            ) : (
                                <><SparklesIcon className="h-5 w-5" />{t('plannerGenerateButton')}</>
                            )}
                        </button>
                    </form>
                </div>
                
                {plannerError && <div className="mt-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert"><p>{plannerError}</p></div>}
                
                {projectPlan && !isAILoading.planner && (
                    <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-bold text-primary">{t('plannerReportTitle')}</h3>
                            <div className="flex gap-2">
                                <button onClick={handleCopyToClipboard} className="text-sm bg-gray-200 text-gray-700 font-bold py-2 px-3 rounded-lg flex items-center gap-1.5"><ClipboardDocumentIcon className="h-4 w-4"/>{t('plannerCopy')}</button>
                                <button onClick={() => setShowCreateProjectModal(true)} className="text-sm bg-secondary text-white font-bold py-2 px-3 rounded-lg flex items-center gap-1.5"><BriefcaseIcon className="h-4 w-4"/>{t('plannerSaveProject')}</button>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <h4 className="font-bold text-lg">{t('plannerPhases')}</h4>
                                {projectPlan.phases.map((phase, index) => (
                                    <div key={index} className="p-4 bg-base-100 rounded-lg border">
                                        <h5 className="font-bold">{phase.phaseName}</h5>
                                        <p className="text-xs text-gray-500 mb-2">{t('plannerDuration')}: {phase.estimatedDuration}</p>
                                        <ul className="space-y-1">
                                            {phase.tasks.map((task, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm">
                                                    <CheckIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0"/>
                                                    <span>{task}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                            <div className="lg:col-span-1">
                                <h4 className="font-bold text-lg mb-2">{t('plannerSafetyChecklist')}</h4>
                                <ul className="space-y-2 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                    {projectPlan.safetyChecklist.map((item, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm text-yellow-800">
                                            <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                         <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 text-sm">
                            <p>{projectPlan.disclaimer}</p>
                        </div>
                    </div>
                )}
            </div>
            {showCreateProjectModal && projectPlan && (
                <CreateProjectModal
                    onClose={() => setShowCreateProjectModal(false)}
                    onProjectCreated={handleProjectCreated}
                    initialData={{ projectName: description }}
                />
            )}
        </>
    );
};

export default AIProjectPlannerPage;
