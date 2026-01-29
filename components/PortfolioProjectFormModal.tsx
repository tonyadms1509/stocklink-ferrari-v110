
import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { PortfolioProject } from '../types';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface PortfolioProjectFormModalProps {
    onClose: () => void;
    onSave: (data: Omit<PortfolioProject, 'id' | 'contractorId'>) => void;
}

const PortfolioProjectFormModal: React.FC<PortfolioProjectFormModalProps> = ({ onClose, onSave }) => {
    const { t } = useLocalization();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        completionDate: new Date().toISOString().split('T')[0],
        imageUrls: '', // Using a textarea for comma-separated URLs
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const urls = formData.imageUrls.split(',').map(url => url.trim()).filter(Boolean);
        if (urls.length === 0) {
            alert("Please provide at least one image URL.");
            return;
        }
        onSave({
            title: formData.title,
            description: formData.description,
            completionDate: new Date(formData.completionDate).toISOString(),
            imageUrls: urls,
        });
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-primary">{t('profileAddProject')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="h-6 w-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Project Title</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="mt-1 p-2 w-full border rounded-md" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Completion Date</label>
                        <input type="date" name="completionDate" value={formData.completionDate} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Image URLs</label>
                        <textarea name="imageUrls" value={formData.imageUrls} onChange={handleChange} rows={3} className="mt-1 p-2 w-full border rounded-md" placeholder="Enter comma-separated image URLs" required />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">{t('payoutCancel')}</button>
                        <button type="submit" className="bg-secondary text-white font-bold py-2 px-4 rounded-lg">Save Project</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PortfolioProjectFormModal;
