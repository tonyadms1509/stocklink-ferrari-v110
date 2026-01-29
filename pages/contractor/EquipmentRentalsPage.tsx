import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useDataContext.tsx';
import { useLocalization } from '../../hooks/useLocalization.tsx';
import { useCurrency } from '../../hooks/useCurrency.tsx';
import { ArrowLeftIcon, KeyIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { RentalEquipment } from '../../types.ts';
import { useToast } from '../../hooks/useToast.tsx';

// Booking Modal
const BookingModal: React.FC<{ equipment: RentalEquipment; onClose: () => void }> = ({ equipment, onClose }) => {
    const { t } = useLocalization();
    const { createRentalBooking } = useData();
    const { formatCurrency } = useCurrency();
    const { showToast } = useToast();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const totalDays = useMemo(() => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end <= start) return 0;
        const diffTime = Math.abs(end.getTime() - start.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }, [startDate, endDate]);

    const totalCost = totalDays * equipment.rates.perDay; // Simplified cost calculation

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (totalDays > 0) {
            await createRentalBooking({
                equipmentId: equipment.id,
                ownerId: equipment.ownerId,
                startDate: new Date(startDate).toISOString(),
                endDate: new Date(endDate).toISOString(),
                totalCost,
            });
            showToast(t('rentalsBookingSuccess'), 'success');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full relative">
                 <h2 className="text-2xl font-bold text-primary mb-4 text-left">{t('rentalsBookingModalTitle')}</h2>
                 <p className="font-semibold text-left">{equipment.name}</p>
                 <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-left">
                        <label className="block text-sm font-medium text-left">{t('rentalsFrom')}</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 p-2 w-full border rounded-md" required min={new Date().toISOString().split('T')[0]} />
                    </div>
                     <div className="text-left">
                        <label className="block text-sm font-medium text-left">{t('rentalsTo')}</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 p-2 w-full border rounded-md" required min={startDate || new Date().toISOString().split('T')[0]}/>
                    </div>
                 </div>
                 {totalDays > 0 && (
                     <div className="mt-4 text-center bg-blue-50 p-3 rounded-lg">
                        <p className="font-semibold">{t('rentalsTotalCost')} ({totalDays} {totalDays === 1 ? 'day' : 'days'})</p>
                        <p className="text-2xl font-bold text-secondary">{formatCurrency(totalCost)}</p>
                    </div>
                 )}
                 <div className="flex justify-end gap-4 mt-6">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">{t('payoutCancel')}</button>
                    <button type="submit" disabled={totalDays <= 0} className="bg-secondary text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">{t('rentalsConfirmBooking')}</button>
                 </div>
            </form>
        </div>
    )
}

// Main Page Component
const EquipmentRentalsPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const { t } = useLocalization();
    const { rentalEquipment } = useData();
    const { formatCurrency } = useCurrency();
    const [searchTerm, setSearchTerm] = useState('');
    const [bookingItem, setBookingItem] = useState<RentalEquipment | null>(null);

    const filteredEquipment = useMemo(() =>
        rentalEquipment.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
        ), [rentalEquipment, searchTerm]);

    return (
        <>
            <div className="text-left">
                {onBack && <button onClick={onBack} className="flex items-center text-sm text-primary hover:underline mb-4"><ArrowLeftIcon className="h-4 w-4 mr-2" />{t('backToDashboard')}</button>}
                <h2 className="text-3xl font-bold text-left">{t('rentalsTitle')}</h2>
                <p className="text-gray-600 mb-6 text-left">{t('rentalsDescription')}</p>
                <div className="relative mb-6 text-left">
                    <input
                        type="text"
                        placeholder={t('rentalsSearchPlaceholder')}
                        className="w-full p-3 pl-10 border-2 border-base-300 rounded-lg focus:ring-primary focus:border-primary text-left"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                {filteredEquipment.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEquipment.map(item => (
                            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col text-left">
                                <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover"/>
                                <div className="p-4 flex flex-col flex-grow text-left">
                                    <h3 className="text-lg font-bold text-left">{item.name}</h3>
                                    <p className="text-sm text-gray-500 mb-2 text-left">Listed by: {item.ownerName}</p>
                                    <p className="text-sm text-gray-600 flex-grow text-left">{item.description}</p>
                                    <div className="mt-4 flex justify-between items-center text-center border-t pt-3 text-left">
                                        <div className="text-lg font-bold text-primary text-left">{formatCurrency(item.rates.perDay)}<span className="text-sm font-normal text-gray-500 text-left">{t('rentalsRatePerDay')}</span></div>
                                        <button onClick={() => setBookingItem(item)} className="bg-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-600 text-left">{t('rentalsBookNow')}</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center bg-white p-12 rounded-lg shadow-md">
                        <KeyIcon className="h-24 w-24 mx-auto text-base-300" />
                        <h2 className="mt-4 text-2xl font-bold text-gray-800">{t('rentalsNoItems')}</h2>
                        <p className="mt-2 text-gray-500">{t('rentalsNoItemsDesc')}</p>
                    </div>
                )}
            </div>
            {bookingItem && <BookingModal equipment={bookingItem} onClose={() => setBookingItem(null)} />}
        </>
    );
};

export default EquipmentRentalsPage;
