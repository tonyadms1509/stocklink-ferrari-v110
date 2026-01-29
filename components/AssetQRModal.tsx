
import React from 'react';
import { ContractorAsset } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { XMarkIcon, PrinterIcon } from '@heroicons/react/24/solid';
import { useToast } from '../hooks/useToast';

interface AssetQRModalProps {
    asset: ContractorAsset;
    onClose: () => void;
}

const AssetQRModal: React.FC<AssetQRModalProps> = ({ asset, onClose }) => {
    const { t } = useLocalization();
    const { showToast } = useToast();
    
    // Generate QR code URL pointing to the asset ID (in a real app this would be a deep link)
    const qrData = JSON.stringify({ id: asset.id, type: 'asset' });
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;

    const handlePrint = () => {
        showToast(t('assetQRPrintSuccess'), 'success');
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[70] p-4 animate-fade-in-scale">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full relative overflow-hidden">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="h-6 w-6"/>
                </button>
                
                <div className="p-8 text-center">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{asset.name}</h2>
                    <p className="text-sm text-gray-500 mb-6">{asset.category} • {asset.id.slice(-6).toUpperCase()}</p>
                    
                    <div className="bg-white p-4 border-2 border-gray-900 rounded-lg inline-block mb-6">
                        <img src={qrCodeUrl} alt="Asset QR Code" className="w-48 h-48" />
                    </div>
                    
                    <p className="text-xs text-gray-400 mb-6">{t('assetQRScanInstruction')}</p>
                    
                    <button 
                        onClick={handlePrint} 
                        className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <PrinterIcon className="h-5 w-5" />
                        {t('assetQRPrintLabel')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssetQRModal;
