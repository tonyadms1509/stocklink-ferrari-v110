
import React, { useMemo } from 'react';
import { useData } from '../../hooks/useDataContext';
import { useAuth } from '../../hooks/useAuth';
import { useLocalization } from '../../hooks/useLocalization';
import { useCurrency } from '../../hooks/useCurrency';
import { ArrowLeftIcon, KeyIcon } from '@heroicons/react/24/solid';
import EmptyState from '../../components/EmptyState';

const MyRentalsPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const { t } = useLocalization();
    const { user } = useAuth();
    const { rentalBookings, rentalEquipment } = useData();
    const { formatCurrency } = useCurrency();

    const myBookings = useMemo(() =>
        rentalBookings.filter(b => b.renterId === user?.id),
    [rentalBookings, user]);

    return (
        <div>
            {onBack && <button onClick={onBack} className="flex items-center text-sm text-primary hover:underline mb-4"><ArrowLeftIcon className="h-4 w-4 mr-2" />{t('backToDashboard')}</button>}
            <h2 className="text-3xl font-bold">{t('myRentalsTitle')}</h2>
            <p className="text-gray-600 mb-6">{t('myRentalsRentedByMe')}</p>

            {myBookings.length > 0 ? (
                <div className="space-y-4">
                    {myBookings.map(booking => {
                        const equipment = rentalEquipment.find(e => e.id === booking.equipmentId);
                        if (!equipment) return null;
                        return (
                            <div key={booking.id} className="bg-white p-4 rounded-lg shadow-md flex items-center gap-4">
                                <img src={equipment.imageUrl} alt={equipment.name} className="w-24 h-24 object-cover rounded-md"/>
                                <div className="flex-grow">
                                    <h3 className="font-bold">{equipment.name}</h3>
                                    <p className="text-sm text-gray-500">From: {equipment.ownerName}</p>
                                    <p className="text-sm">Dates: {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</p>
                                    <p className="text-sm">Total: {formatCurrency(booking.totalCost)}</p>
                                </div>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800`}>
                                    {t(`rentalStatus_${booking.bookingStatus}` as any)}
                                </span>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <EmptyState
                    icon={KeyIcon}
                    title={t('myRentalsNoRented')}
                    message="Your active and past equipment rentals will appear here."
                />
            )}
        </div>
    );
};

export default MyRentalsPage;
