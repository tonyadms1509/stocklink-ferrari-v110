
import React, { useState } from 'react';
import { QuoteRequest, Project, Jurisdiction, BuildingStandard, ProjectStatus } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { BriefcaseIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface CreateProjectFromQuoteModalProps {
    quote: QuoteRequest;
    onClose: () => void;
    onCreateProject: (quoteId: string, projectDetails: Omit<Project, 'id' | 'contractorId' | 'status' | 'createdAt'>) => void;
    onSkip: (quoteId: string) => void;
}

const CreateProjectFromQuoteModal: React.FC<CreateProjectFromQuoteModalProps> = ({ quote, onClose, onCreateProject, onSkip }) => {
    const { t } = useLocalization();
    const [formData, setFormData] = useState({
        projectName: `Project from Quote #${quote.quoteNumber}`,
        clientName: '',
        address: '',
        // Fix: Add missing required jurisdiction and standard fields
        jurisdiction: Jurisdiction.SouthAfrica,
        standard: BuildingStandard.SANS10400
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    const handleCreateProject = () => {
        if (!formData.projectName) {
            alert('Project Name is required.');
            return;
        }
        onCreateProject(quote.id, formData);
    };

    const handleSkip = () => {
        onSkip(quote.id);
    }
    
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm" aria-modal="true" role="dialog">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all duration-300">
                <div className="p-8">
                    <div className="text-center mb-6">
                        <BriefcaseIcon className="h-12 w-12 text-primary mx-auto mb-2"/>
                        <h2 className="text-2xl font-extrabold text-primary">{t('createProjectFromQuoteTitle')}</h2>
                        <p className="text-gray-600 mt-2">{t('createProjectFromQuoteDesc')}</p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="text-left">
                            <label className="block text-sm font-medium">{t('formProjectName')}</label>
                            <input type="text" name="projectName" value={formData.projectName} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" required />
                        </div>
                        <div className="text-left">
                            <label className="block text-sm font-medium">{t('formClientName')}</label>
                            <input type="text" name="clientName" value={formData.clientName} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" placeholder="e.g. Mr. John Smith" />
                        </div>
                        <div className="text-left">
                            <label className="block text-sm font-medium">{t('formAddress')}</label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" placeholder="e.g. 123 Main Rd, Sandton" />
                        </div>
                        <div className="text-left">
                            <label className="block text-sm font-medium">Jurisdiction</label>
                            <select name="jurisdiction" value={formData.jurisdiction} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md bg-white">
                                {Object.entries(Jurisdiction).map(([k, v]) => <option key={v} value={v}>{k}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="mt-8 space-y-3">
                        <button onClick={handleCreateProject} className="w-full bg-secondary hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg text-lg transition duration-300">
                            {t('createProjectFromQuoteBtn')}
                        </button>
                        <button onClick={handleSkip} className="w-full bg-base-200 hover:bg-base-300 text-gray-700 font-bold py-2 px-4 rounded-lg transition-colors">
                            {t('createOrderOnlyBtn')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateProjectFromQuoteModal;
