import React, { useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useDataContext';
import { useLocalization } from '../../hooks/useLocalization';
import { useCurrency } from '../../hooks/useCurrency';
import { TrophyIcon, PlusIcon, StarIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/solid';
import { RewardOffer, Order, User } from '../../types';
import EmptyState from '../../components/EmptyState';

const OfferFormModal: React.FC<{ onSave: (offer: Omit<RewardOffer, 'id' | 'supplierId' | 'supplierName'>) => void, onClose: () => void }> = ({ onSave, onClose }) => {
    const { t } = useLocalization();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [points, setPoints] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const pointsRequired = parseInt(points, 10);
        if (title && description && !isNaN(pointsRequired) && pointsRequired > 0) {
            onSave({ title, description, pointsRequired });
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full">
                <h2 className="text-2xl font-bold text-primary mb-4">{t('rewardsOfferModalTitle')}</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">{t('rewardsOfferTitle')}</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder={t('rewardsOfferTitlePlaceholder')} className="mt-1 p-2 w-full border rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">{t('rewardsOfferDescription')}</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder={t('rewardsOfferDescriptionPlaceholder')} rows={3} className="mt-1 p-2 w-full border rounded-md" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">{t('rewardsPointsRequired')}</label>
                        <input type="number" min="1" value={points} onChange={e => setPoints(e.target.value)} className="mt-1 p-2 w-full border rounded-md" required />
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">{t('payoutCancel')}</button>
                    <button type="submit" className="bg-secondary text-white font-bold py-2 px-4 rounded-lg">{t('rewardsCreateOffer')}</button>
                </div>
            </form>
        </div>
    );
};

const RewardsPage: React.FC = () => {
    const { user } = useAuth();
    const { orders, users, rewardOffers, createRewardOffer, deleteRewardOffer } = useData();
    const { t } = useLocalization();
    const { formatCurrency } = useCurrency();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const myOffers = useMemo(() => {
        if (!user) return [];
        return rewardOffers.filter(o => o.supplierId === user.id);
    }, [rewardOffers, user]);

    const customerLeaderboard = useMemo(() => {
        if (!user) return [];
        const customerSpend = new Map<string, number>();
        orders.forEach(order => {
            if (order.supplierId === user.id) {
                customerSpend.set(order.contractorId, (customerSpend.get(order.contractorId) || 0) + order.total);
            }
        });
        return Array.from(customerSpend.entries())
            .map(([contractorId, totalSpend]) => ({
                id: contractorId,
                name: users.find(u => u.id === contractorId)?.name || 'Unknown Customer',
                totalSpend,
            }))
            .sort((a, b) => b.totalSpend - a.totalSpend)
            .slice(0, 10); // Top 10
    }, [orders, users, user]);

    const handleSaveOffer = (offer: Omit<RewardOffer, 'id'|'supplierId'|'supplierName'>) => {
        createRewardOffer(offer);
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-bold flex items-center gap-3"><TrophyIcon className="h-8 w-8 text-primary"/>{t('rewardsSupplierTitle')}</h2>
                    <p className="text-gray-600 mt-1">{t('rewardsSupplierDescription')}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Offer Management */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold">{t('rewardsYourOffers')}</h3>
                                <button onClick={() => setIsModalOpen(true)} className="bg-secondary text-white font-bold py-2 px-3 rounded-lg flex items-center gap-2 text-sm"><PlusIcon className="h-4"/>{t('rewardsCreateOffer')}</button>
                            </div>
                            {myOffers.length > 0 ? (
                                <div className="space-y-3">
                                    {myOffers.map(offer => (
                                        <div key={offer.id} className="bg-base-100 p-3 rounded-md border flex justify-between items-start">
                                            <div>
                                                <p className="font-bold">{offer.title}</p>
                                                <p className="text-xs text-gray-600">{offer.description}</p>
                                                <p className="text-sm font-semibold text-secondary mt-1">{t('rewardsPoints', { points: offer.pointsRequired.toLocaleString() })}</p>
                                            </div>
                                            <button onClick={() => deleteRewardOffer(offer.id)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon className="h-5 w-5"/></button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-4">{t('rewardsNoOffers')}</p>
                            )}
                        </div>
                    </div>

                    {/* Customer Leaderboard */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold mb-4">{t('rewardsCustomerLeaderboard')}</h3>
                        {customerLeaderboard.length > 0 ? (
                            <ul className="space-y-2">
                                {customerLeaderboard.map((customer, index) => (
                                    <li key={customer.id} className="flex items-center justify-between p-2 bg-base-100 rounded">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-primary w-6 text-center">{index + 1}</span>
                                            <span>{customer.name}</span>
                                        </div>
                                        <span className="font-semibold">{formatCurrency(customer.totalSpend)}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-gray-500 py-4">No customer data yet.</p>
                        )}
                    </div>
                </div>
            </div>
            {isModalOpen && <OfferFormModal onSave={handleSaveOffer} onClose={() => setIsModalOpen(false)} />}
        </>
    );
};

export default RewardsPage;
