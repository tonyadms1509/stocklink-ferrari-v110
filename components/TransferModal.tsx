
import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { ContractorAsset, Project } from '../types';
import { XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { useData } from '../hooks/useDataContext';

interface TransferModalProps {
    asset: ContractorAsset;
    onClose: () => void;
    onTransfer: (assetId: string, targetType: 'Yard' | 'Project', targetId: string, targetName: string) => void;
}

const TransferModal: React.FC<TransferModalProps> = ({ asset, onClose, onTransfer }) => {
    const { t } = useLocalization();
    const { projects } = useData();
    const [destinationType, setDestinationType] = useState<'Yard' | 'Project'>('Yard');
    const [selectedProjectId, setSelectedProjectId] = useState('');

    const handleTransfer = () => {
        if (destinationType === 'Yard') {
            onTransfer(asset.id, 'Yard', 'yard', 'Main Yard');
        } else {
            const project = projects.find(p => p.id === selectedProjectId);
            if (project) {
                onTransfer(asset.id, 'Project', project.id, project.projectName);
            }
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{t('inventoryTransferTitle')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="h-6 w-6"/></button>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg mb-6 flex items-center justify-between">
                    <div>
                        <p className="font-semibold text-gray-800">{asset.name}</p>
                        <p className="text-xs text-gray-500">{asset.locationName}</p>
                    </div>
                    <ArrowRightIcon className="h-5 w-5 text-gray-400"/>
                    <div className="text-right">
                        <p className="font-bold text-primary">Destination</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('inventoryTransferTo')}</label>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setDestinationType('Yard')}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold border ${destinationType === 'Yard' ? 'bg-blue-50 border-primary text-primary' : 'bg-white border-gray-300 text-gray-600'}`}
                            >
                                {t('inventoryTransferYard')}
                            </button>
                            <button 
                                onClick={() => setDestinationType('Project')}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold border ${destinationType === 'Project' ? 'bg-blue-50 border-primary text-primary' : 'bg-white border-gray-300 text-gray-600'}`}
                            >
                                {t('inventoryTransferProject')}
                            </button>
                        </div>
                    </div>

                    {destinationType === 'Project' && (
                        <div>
                            <label className="block text-sm font-medium mb-2">Select Project</label>
                            <select 
                                value={selectedProjectId} 
                                onChange={e => setSelectedProjectId(e.target.value)}
                                className="w-full p-2 border rounded-md bg-white"
                            >
                                <option value="" disabled>Choose project...</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.projectName}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button 
                        onClick={handleTransfer}
                        disabled={destinationType === 'Project' && !selectedProjectId}
                        className="w-full mt-4 bg-primary text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50"
                    >
                        {t('inventoryTransferConfirm')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransferModal;
