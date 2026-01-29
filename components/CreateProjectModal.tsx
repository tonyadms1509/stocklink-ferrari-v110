
import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { XMarkIcon, BriefcaseIcon } from '@heroicons/react/24/solid';
import { useData } from '../hooks/useDataContext';

interface CreateProjectModalProps {
    onClose: () => void;
    onProjectCreated?: (project: Project) => void;
    initialData?: Partial<Omit<Project, 'id' | 'contractorId' | 'status' | 'createdAt'>>;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose, onProjectCreated, initialData }) => {
    const { t } = useLocalization();
    const { createProject } = useData();
    const [formData, setFormData] = useState({
        projectName: initialData?.projectName || '',
        clientName: initialData?.clientName || '',
        address: initialData?.address || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.projectName) {
            alert('Project Name is required.');
            return;
        }
        const newProject = await createProject(formData);
        if (newProject) {
            if (onProjectCreated) {
                onProjectCreated(newProject);
            }
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in-scale">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full relative overflow-hidden">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                            <BriefcaseIcon className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-xl font-bold">{t('createProjectModalTitle')}</h2>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                        <XMarkIcon className="h-6 w-6"/>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">{t('formProjectName')}</label>
                        <input 
                            type="text" 
                            name="projectName" 
                            value={formData.projectName} 
                            onChange={handleChange} 
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all" 
                            placeholder="e.g. Green Valley Renovation"
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">{t('formClientName')}</label>
                        <input 
                            type="text" 
                            name="clientName" 
                            value={formData.clientName} 
                            onChange={handleChange} 
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all" 
                            placeholder="e.g. Mr. John Smith" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">{t('formAddress')}</label>
                        <input 
                            type="text" 
                            name="address" 
                            value={formData.address} 
                            onChange={handleChange} 
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all" 
                            placeholder="e.g. 123 Main Rd, Sandton" 
                        />
                    </div>
                    
                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-4">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-colors"
                        >
                           {t('payoutCancel')}
                        </button>
                        <button 
                            type="submit" 
                            className="px-6 py-2.5 bg-primary hover:bg-blue-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transform transition-all active:scale-95"
                        >
                            {t('createProjectBtn')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProjectModal;
