
import React, { useState, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useData } from '../hooks/useDataContext';
import { ContractorAsset, Project } from '../types';
import { XMarkIcon, QrCodeIcon, ArrowPathIcon, MapPinIcon, CheckCircleIcon, BriefcaseIcon, BuildingStorefrontIcon } from '@heroicons/react/24/solid';
import { useToast } from '../hooks/useToast';

interface AssetScannerModalProps {
    onClose: () => void;
}

const AssetScannerModal: React.FC<AssetScannerModalProps> = ({ onClose }) => {
    const { t } = useLocalization();
    const { contractorAssets, projects, updateAsset } = useData();
    const { showToast } = useToast();
    
    const [isScanning, setIsScanning] = useState(true);
    const [scannedAsset, setScannedAsset] = useState<ContractorAsset | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Simulate scanning process
    useEffect(() => {
        if (isScanning) {
            const timer = setTimeout(() => {
                // Mock: Find a random asset to "scan"
                if (contractorAssets.length > 0) {
                    const randomAsset = contractorAssets[Math.floor(Math.random() * contractorAssets.length)];
                    setScannedAsset(randomAsset);
                    setIsScanning(false);
                } else {
                    showToast("No assets found in inventory to scan.", "error");
                    onClose();
                }
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isScanning, contractorAssets, onClose, showToast]);

    const handleCheckOut = async () => {
        if (!scannedAsset || !selectedProjectId) return;
        setIsProcessing(true);
        
        const project = projects.find(p => p.id === selectedProjectId);
        if (project) {
            await updateAsset(scannedAsset.id, {
                status: 'In Use',
                locationType: 'Project',
                locationId: project.id,
                locationName: project.projectName
            });
            showToast(`${scannedAsset.name} checked out to ${project.projectName}`, 'success');
            onClose();
        }
        setIsProcessing(false);
    };

    const handleCheckIn = async () => {
        if (!scannedAsset) return;
        setIsProcessing(true);
        
        await updateAsset(scannedAsset.id, {
            status: 'Available',
            locationType: 'Yard',
            locationId: 'yard',
            locationName: 'Main Yard'
        });
        showToast(`${scannedAsset.name} checked in to Yard`, 'success');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center z-[70] p-4 animate-fade-in-scale">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full relative overflow-hidden flex flex-col max-h-[90vh]">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 z-10">
                    <XMarkIcon className="h-6 w-6"/>
                </button>

                {isScanning ? (
                    <div className="p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
                        <div className="relative w-32 h-32 mb-6">
                             <div className="absolute inset-0 border-4 border-primary/30 rounded-lg animate-pulse"></div>
                             <div className="absolute inset-0 border-t-4 border-primary rounded-lg animate-spin"></div>
                             <QrCodeIcon className="absolute inset-0 m-auto h-16 w-16 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{t('assetScannerScanning')}</h3>
                        <p className="text-gray-500 mt-2">{t('assetScannerInstruction')}</p>
                    </div>
                ) : scannedAsset ? (
                    <div className="p-6">
                        <div className="text-center mb-6">
                            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                <img src={scannedAsset.imageUrl || 'https://via.placeholder.com/100'} alt={scannedAsset.name} className="w-full h-full object-cover rounded-full" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">{scannedAsset.name}</h2>
                            <p className="text-sm text-gray-500">{scannedAsset.category}</p>
                            <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${scannedAsset.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                {scannedAsset.status === 'Available' ? (
                                    <><CheckCircleIcon className="h-3 w-3 mr-1"/> {t('statusAvailable')}</>
                                ) : (
                                    <><MapPinIcon className="h-3 w-3 mr-1"/> {t('statusInUse')}</>
                                )}
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg border mb-6">
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Current Location</p>
                            <p className="font-semibold text-gray-800 flex items-center gap-2">
                                {scannedAsset.locationType === 'Yard' ? <BuildingStorefrontIcon className="h-4 w-4"/> : <BriefcaseIcon className="h-4 w-4"/>}
                                {scannedAsset.locationName}
                            </p>
                        </div>

                        {scannedAsset.status === 'Available' ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('assetScannerAssignTo')}</label>
                                    <select 
                                        value={selectedProjectId} 
                                        onChange={e => setSelectedProjectId(e.target.value)}
                                        className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="" disabled>Select Project...</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>{p.projectName}</option>
                                        ))}
                                    </select>
                                </div>
                                <button 
                                    onClick={handleCheckOut}
                                    disabled={!selectedProjectId || isProcessing}
                                    className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? <ArrowPathIcon className="h-5 w-5 animate-spin"/> : <MapPinIcon className="h-5 w-5"/>}
                                    {t('assetScannerCheckOut')}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600 text-center">Item is currently checked out. Do you want to return it to the yard?</p>
                                <button 
                                    onClick={handleCheckIn}
                                    disabled={isProcessing}
                                    className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? <ArrowPathIcon className="h-5 w-5 animate-spin"/> : <BuildingStorefrontIcon className="h-5 w-5"/>}
                                    {t('assetScannerCheckIn')}
                                </button>
                            </div>
                        )}
                        
                        <button onClick={() => setIsScanning(true)} className="w-full mt-3 text-gray-500 font-semibold py-2 hover:text-gray-800">
                            Scan Another Item
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default AssetScannerModal;
