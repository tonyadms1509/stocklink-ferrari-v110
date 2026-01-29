
import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useDataContext';
import { useAuth } from '../../hooks/useAuth';
import { useLocalization } from '../../hooks/useLocalization';
import { useCurrency } from '../../hooks/useCurrency';
import { RentalEquipment, RentalBooking } from '../../types';
import { PlusIcon, WrenchScrewdriverIcon, InboxIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import RentalEquipmentFormModal from '../../components/RentalEquipmentFormModal';
import EmptyState from '../../components/EmptyState';

const ManageRentalsPage: React.FC = () => {
    const { t } = useLocalization();
    const { user } = useAuth();
    const { rentalEquipment, rentalBookings, updateBookingStatus, deleteRentalEquipment } = useData();
    const { formatCurrency } = useCurrency();
    const [activeTab, setActiveTab] = useState<'requests' | 'equipment'>('requests');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState<RentalEquipment | null>(null);

    const myEquipment = useMemo(() =>
        rentalEquipment.filter(e => e.ownerId === user?.id),
    [rentalEquipment, user]);

    const myBookingRequests = useMemo(() =>
        rentalBookings.filter(b => b.ownerId === user?.id && b.bookingStatus === 'Pending'),
    [rentalBookings, user]);

    const handleApprove = async (bookingId: string) => {
        await updateBookingStatus(bookingId, 'Confirmed');
    };

    const handleDecline = async (bookingId: string) => {
        await updateBookingStatus(bookingId, 'Cancelled');
    };

    const handleOpenFormModal = (equipment: RentalEquipment | null = null) => {
        setEditingEquipment(equipment);
        setIsFormModalOpen(true);
    };

    const handleDelete = async (equipmentId: string) => {
        if (window.confirm('Are you sure you want to delete this equipment listing?')) {
            await deleteRentalEquipment(equipmentId);
        }
    }

    return (
        <>
            <div>
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold">{t('manageRentalsTitle')}</h2>
                    <button onClick={() => handleOpenFormModal()} className="bg-secondary text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                        <PlusIcon className="h-5 w-5"/> {t('manageRentalsListNew')}
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b mb-6">
                    <button onClick={() => setActiveTab('requests')} className={`py-2 px-4 text-sm font-medium ${activeTab === 'requests' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>{t('manageRentalsBookingRequests')} ({myBookingRequests.length})</button>
                    <button onClick={() => setActiveTab('equipment')} className={`py-2 px-4 text-sm font-medium ${activeTab === 'equipment' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>{t('manageRentalsMyEquipment')}</button>
                </div>

                {activeTab === 'requests' && (
                     myBookingRequests.length > 0 ? (
                        <div className="space-y-4">
                            {myBookingRequests.map(booking => {
                                const equipment = myEquipment.find(e => e.id === booking.equipmentId);
                                return (
                                    <div key={booking.id} className="bg-white p-4 rounded-lg shadow-md">
                                        <p>Request from <span className="font-bold">{booking.renterName}</span> for <span className="font-bold">{equipment?.name}</span></p>
                                        <p className="text-sm">Dates: {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <p className="font-semibold">{formatCurrency(booking.totalCost)}</p>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleApprove(booking.id)} className="bg-green-500 text-white font-bold py-1 px-3 rounded-full text-sm">{t('manageRentalsApprove')}</button>
                                                <button onClick={() => handleDecline(booking.id)} className="bg-red-500 text-white font-bold py-1 px-3 rounded-full text-sm">{t('manageRentalsDecline')}</button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                     ) : (
                        <EmptyState
                            icon={InboxIcon}
                            title={t('manageRentalsNoRequests')}
                            message="New booking requests from contractors will appear here."
                        />
                     )
                )}
                
                {activeTab === 'equipment' && (
                     myEquipment.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {myEquipment.map(item => (
                               <div key={item.id} className="bg-white p-4 rounded-lg shadow-md">
                                   <div className="flex justify-between items-start">
                                       <h3 className="font-bold">{item.name}</h3>
                                       <div className="flex gap-2">
                                           <button onClick={() => handleOpenFormModal(item)} className="p-1 text-gray-500 hover:text-primary"><PencilIcon className="h-4 w-4"/></button>
                                           <button onClick={() => handleDelete(item.id)} className="p-1 text-gray-500 hover:text-red-500"><TrashIcon className="h-4 w-4"/></button>
                                       </div>
                                   </div>
                                   <p>Rate: {formatCurrency(item.rates.perDay)}/day</p>
                               </div>
                           ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={WrenchScrewdriverIcon}
                            title={t('manageRentalsNoEquipment')}
                            message='Click "List New Equipment" to add items to your rental inventory.'
                        />
                    )
                )}
            </div>
            {isFormModalOpen && (
                <RentalEquipmentFormModal
                    equipment={editingEquipment}
                    onClose={() => setIsFormModalOpen(false)}
                />
            )}
        </>
    );
};
export default ManageRentalsPage;
