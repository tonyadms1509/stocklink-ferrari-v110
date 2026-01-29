
import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import { XMarkIcon, QrCodeIcon } from '@heroicons/react/24/solid';

interface CounterCheckInModalProps {
    onClose: () => void;
}

const CounterCheckInModal: React.FC<CounterCheckInModalProps> = ({ onClose }) => {
    const { t } = useLocalization();
    const { user } = useAuth();
    
    // Generate QR code pointing to the supplier's public profile or a specific check-in action
    const qrData = JSON.stringify({ type: 'check-in', supplierId: user?.id, supplierName: user?.name });
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[80] p-4 animate-fade-in-scale backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full relative overflow-hidden text-center">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">
                    <XMarkIcon className="h-8 w-8"/>
                </button>
                
                <div className="bg-primary p-8 text-white">
                    <h2 className="text-2xl font-black uppercase tracking-wide">Counter Check-In</h2>
                    <p className="text-blue-100 text-sm mt-1">Scan to connect contractor account</p>
                </div>

                <div className="p-8">
                    <div className="bg-white p-2 rounded-xl shadow-lg border-2 border-dashed border-primary inline-block mb-6">
                        <img src={qrCodeUrl} alt="Check-In QR" className="w-56 h-56 rounded-lg"/>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                        <QrCodeIcon className="h-5 w-5"/>
                        <p>Ask contractor to scan with StockLink app</p>
                    </div>
                </div>
                
                <div className="bg-gray-50 p-4 border-t border-gray-100 text-xs text-gray-400">
                    ID: {user?.id.slice(-6).toUpperCase()}
                </div>
            </div>
        </div>
    );
};

export default CounterCheckInModal;
