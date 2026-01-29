
import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useData } from '../hooks/useDataContext';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface IncidentReportModalProps {
    projectId: string;
    onClose: () => void;
}

const IncidentReportModal: React.FC<IncidentReportModalProps> = ({ projectId, onClose }) => {
    const { t } = useLocalization();
    const { createProjectLog } = useData();
    
    const [type, setType] = useState('Injury');
    const [severity, setSeverity] = useState('Low');
    const [description, setDescription] = useState('');
    const [actionTaken, setActionTaken] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const content = `**Type:** ${type}\n**Severity:** ${severity}\n**Description:** ${description}\n**Immediate Action:** ${actionTaken}`;
        
        await createProjectLog({
            projectId,
            type: 'Incident',
            content,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[80] p-4 animate-fade-in-scale">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="h-6 w-6"/>
                </button>
                <h2 className="text-xl font-bold text-red-700 mb-4">{t('incidentModalTitle')}</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">{t('incidentType')}</label>
                        <select value={type} onChange={e => setType(e.target.value)} className="mt-1 p-2 w-full border rounded-md bg-white">
                            <option value="Injury">{t('incidentType_Injury')}</option>
                            <option value="Near Miss">{t('incidentType_NearMiss')}</option>
                            <option value="Property Damage">{t('incidentType_PropertyDamage')}</option>
                            <option value="Environmental">{t('incidentType_Environmental')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">{t('incidentSeverity')}</label>
                        <select value={severity} onChange={e => setSeverity(e.target.value)} className="mt-1 p-2 w-full border rounded-md bg-white">
                            <option value="Low">{t('incidentSeverity_Low')}</option>
                            <option value="Medium">{t('incidentSeverity_Medium')}</option>
                            <option value="High">{t('incidentSeverity_High')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">{t('incidentDescription')}</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 p-2 w-full border rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">{t('incidentAction')}</label>
                        <textarea value={actionTaken} onChange={e => setActionTaken(e.target.value)} rows={2} className="mt-1 p-2 w-full border rounded-md" />
                    </div>
                    
                    <button type="submit" className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 mt-2">
                        {t('incidentSubmit')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default IncidentReportModal;
