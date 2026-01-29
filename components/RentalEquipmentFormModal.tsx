
import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useData } from '../hooks/useDataContext';
import { RentalEquipment } from '../types';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface RentalEquipmentFormModalProps {
    equipment?: RentalEquipment | null;
    onClose: () => void;
    onSave?: (data: any) => void;
}

const RentalEquipmentFormModal: React.FC<RentalEquipmentFormModalProps> = ({ equipment, onClose, onSave }) => {
    const { t } = useLocalization();
    const { addRentalEquipment, updateRentalEquipment } = useData();
    
    const [formData, setFormData] = useState({
        name: equipment?.name || '',
        category: equipment?.category || 'Machinery',
        description: equipment?.description || '',
        imageUrl: equipment?.imageUrl || `https://picsum.photos/seed/rent${Date.now()}/400/300`,
        specifications: equipment?.specifications || { Power: '', Weight: '' },
        rates: equipment?.rates || { perDay: 0, perWeek: 0, perMonth: 0 },
        location: equipment?.location || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            rates: { ...prev.rates, [name]: parseFloat(value) || 0 }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            // Simple spec handling for this demo
            specifications: {
                ...formData.specifications,
            }
        };

        if (onSave) {
             onSave(dataToSave);
        } else {
             if (equipment) {
                await updateRentalEquipment(equipment.id, dataToSave);
            } else {
                await addRentalEquipment(dataToSave);
            }
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[60] p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full relative">
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><XMarkIcon className="h-6 w-6" /></button>
                <h2 className="text-2xl font-bold text-primary mb-4">{equipment ? 'Edit Equipment' : 'List New Equipment'}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium">Equipment Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" required />
                    </div>
                    <div>
                         <label className="block text-sm font-medium">Category</label>
                        <select name="category" value={formData.category} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md bg-white">
                            <option>Machinery</option>
                            <option>Access Equipment</option>
                            <option>Power Tools</option>
                            <option>Scaffolding</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Location</label>
                        <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="City, Province" className="mt-1 p-2 w-full border rounded-md" required />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 p-2 w-full border rounded-md" required />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium">Rates</label>
                        <div className="grid grid-cols-3 gap-2 mt-1">
                            <input type="number" name="perDay" value={formData.rates.perDay} onChange={handleRateChange} placeholder="Per Day" className="p-2 border rounded-md" required />
                            <input type="number" name="perWeek" value={formData.rates.perWeek} onChange={handleRateChange} placeholder="Per Week" className="p-2 border rounded-md" required />
                            <input type="number" name="perMonth" value={formData.rates.perMonth} onChange={handleRateChange} placeholder="Per Month" className="p-2 border rounded-md" required />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-4">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">{t('payoutCancel')}</button>
                    <button type="submit" className="bg-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-600">{equipment ? t('profileSaveChanges') : t('manageRentalsListNew')}</button>
                </div>
            </form>
        </div>
    );
};

export default RentalEquipmentFormModal;
