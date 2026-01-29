

import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { Client } from '../types';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface ClientFormModalProps {
    client?: Client | null;
    onClose: () => void;
    onSave: (client: Omit<Client, 'id' | 'contractorId' | 'createdAt'>) => void;
}

const ClientFormModal: React.FC<ClientFormModalProps> = ({ client, onClose, onSave }) => {
    const { t } = useLocalization();
    const [formData, setFormData] = useState({
        name: client?.name || '',
        email: client?.email || '',
        phone: client?.phone || '',
        address: client?.address || '',
        notes: client?.notes || '',
        tags: client?.tags?.join(', ') || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[60] p-4 animate-fade-in-scale">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><XMarkIcon className="h-6 w-6" /></button>
                <h2 className="text-xl font-bold text-primary mb-4">{client ? t('clientFormTitleEdit') : t('clientFormTitleNew')}</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('clientName')}</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('clientEmail')}</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('clientPhone')}</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('clientAddress')}</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('clientTags')}</label>
                        <input type="text" name="tags" value={formData.tags} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" placeholder="e.g. VIP, Residential" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('clientNotes')}</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="mt-1 p-2 w-full border rounded-md" />
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">{t('payoutCancel')}</button>
                        <button type="submit" className="bg-secondary hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg">{t('clientSave')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClientFormModal;
