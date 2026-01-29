

import React, { useState, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { TimesheetEntry, Project, ProjectMember } from '../types';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface TimesheetFormModalProps {
    entry?: TimesheetEntry | null;
    projects: Project[];
    members: ProjectMember[];
    onClose: () => void;
    onSave: (entry: Omit<TimesheetEntry, 'id' | 'contractorId'>) => void;
}

const TimesheetFormModal: React.FC<TimesheetFormModalProps> = ({ entry, projects, members, onClose, onSave }) => {
    const { t } = useLocalization();
    
    // Consolidate unique worker names for autocomplete/dropdown if desired, or use project members
    // For simplicity, we'll just use project members list plus a free text input fallback if needed, 
    // but let's stick to member dropdown + "Other" or just text for flexibility.
    
    const [formData, setFormData] = useState({
        workerName: entry?.workerName || '',
        projectId: entry?.projectId || '',
        date: entry ? entry.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        hours: entry?.hours.toString() || '',
        description: entry?.description || '',
        hourlyRate: entry?.hourlyRate?.toString() || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const project = projects.find(p => p.id === formData.projectId);
        
        onSave({
            workerName: formData.workerName,
            projectId: formData.projectId || undefined,
            projectName: project?.projectName || undefined,
            date: new Date(formData.date),
            hours: parseFloat(formData.hours) || 0,
            description: formData.description,
            hourlyRate: parseFloat(formData.hourlyRate) || 0,
            status: 'Pending'
        });
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><XMarkIcon className="h-6 w-6" /></button>
                <h2 className="text-xl font-bold text-primary mb-4">{entry ? 'Edit Timesheet Entry' : t('timesheetsAddEntry')}</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">{t('timesheetsDate')}</label>
                        <input type="date" name="date" value={formData.date} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" required />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium">{t('timesheetsWorker')}</label>
                        <input 
                            type="text" 
                            name="workerName" 
                            value={formData.workerName} 
                            onChange={handleChange} 
                            className="mt-1 p-2 w-full border rounded-md" 
                            list="workers" 
                            required 
                            placeholder="Name"
                        />
                        <datalist id="workers">
                            {members.map(m => <option key={m.id} value={m.name} />)}
                        </datalist>
                    </div>

                    <div>
                        <label className="block text-sm font-medium">{t('timesheetsProject')}</label>
                        <select name="projectId" value={formData.projectId} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md bg-white">
                            <option value="">-- Select Project (Optional) --</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">{t('timesheetsHours')}</label>
                            <input type="number" name="hours" value={formData.hours} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" required step="0.5" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Hourly Rate</label>
                            <input type="number" name="hourlyRate" value={formData.hourlyRate} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" placeholder="Optional" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium">{t('timesheetsDescriptionField')}</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" rows={2} />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">{t('payoutCancel')}</button>
                        <button type="submit" className="bg-secondary hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg">{t('timesheetsSave')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TimesheetFormModal;