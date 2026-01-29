
import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useData } from '../hooks/useDataContext';
import { JobPosting, JobStatus } from '../types';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface JobPostingFormModalProps {
    job?: JobPosting | null;
    onClose: () => void;
}

const JobPostingFormModal: React.FC<JobPostingFormModalProps> = ({ job, onClose }) => {
    const { t } = useLocalization();
    const { createJobPosting, updateJobPosting } = useData();
    const [formData, setFormData] = useState({
        title: job?.title || '',
        description: job?.description || '',
        location: job?.location || '',
        requiredSkills: job?.requiredSkills.join(', ') || '',
        startDate: job ? new Date(job.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        duration: job?.duration || '',
        payRate: job?.payRate || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
            startDate: new Date(formData.startDate),
            status: job?.status || JobStatus.Open,
        };

        if (job) {
            await updateJobPosting(job.id, dataToSave);
        } else {
            await createJobPosting(dataToSave);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full relative">
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><XMarkIcon className="h-6 w-6" /></button>
                <h2 className="text-2xl font-bold text-primary mb-4">{job ? 'Edit Job Posting' : t('jobBoardPostModalTitle')}</h2>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div>
                        <label className="block text-sm font-medium">{t('jobBoardTitle')}</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">{t('jobBoardDescription')}</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="mt-1 p-2 w-full border rounded-md" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">{t('jobBoardLocation')}</label>
                            <input type="text" name="location" value={formData.location} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">{t('jobBoardSkills')}</label>
                            <input type="text" name="requiredSkills" value={formData.requiredSkills} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">{t('jobBoardStartDate')}</label>
                            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">{t('jobBoardDuration')}</label>
                            <input type="text" name="duration" value={formData.duration} onChange={handleChange} placeholder={t('jobBoardDurationPlaceholder')} className="mt-1 p-2 w-full border rounded-md" required />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium">{t('jobBoardPayRate')}</label>
                        <input type="text" name="payRate" value={formData.payRate} onChange={handleChange} placeholder={t('jobBoardPayRatePlaceholder')} className="mt-1 p-2 w-full border rounded-md" required />
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">{t('payoutCancel')}</button>
                    <button type="submit" className="bg-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-600">{job ? t('profileSaveChanges') : t('jobBoardPostJob')}</button>
                </div>
            </form>
        </div>
    );
};

export default JobPostingFormModal;
