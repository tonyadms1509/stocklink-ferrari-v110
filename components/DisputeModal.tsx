import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { Order, DisputeStatus } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { useData } from '../hooks/useDataContext';
import { useAuth } from '../hooks/useAuth';

interface DisputeModalProps {
    order: Order;
    onClose: () => void;
}

const DisputeModal: React.FC<DisputeModalProps> = ({ order, onClose }) => {
    const { t } = useLocalization();
    const { user } = useAuth();
    const { createDispute } = useData();
    const [reason, setReason] = useState(t('disputeReason_Damaged'));
    const [message, setMessage] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !message.trim()) {
            alert("Please describe the issue.");
            return;
        }

        createDispute({
            orderId: order.id,
            orderNumber: order.orderNumber,
            contractorId: user.id,
            supplierId: order.supplierId,
            reason,
            initialMessage: message,
            status: DisputeStatus.New,
        });
        
        onClose();
    };

    const reasons = [
        t('disputeReason_Damaged'),
        t('disputeReason_Incorrect'),
        t('disputeReason_Missing'),
        t('disputeReason_Late'),
        t('disputeReason_Other'),
    ];

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full relative animate-fade-in-scale">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="h-6 w-6"/>
                </button>
                <h2 className="text-2xl font-bold text-primary mb-2">{t('disputeModalTitle', {orderNumber: order.orderNumber})}</h2>
                <p className="text-gray-500 mb-6">Let the supplier know what went wrong.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">{t('disputeModalReason')}</label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="mt-1 p-2 w-full border rounded-md bg-white"
                        >
                            {reasons.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">{t('disputeModalDescribe')}</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="mt-1 p-2 w-full border rounded-md"
                            rows={5}
                            required
                        />
                    </div>
                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full bg-primary hover:bg-blue-800 text-white font-bold py-3 rounded-lg"
                        >
                            {t('disputeModalSubmit')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DisputeModal;