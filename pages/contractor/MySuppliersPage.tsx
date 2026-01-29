import React, { useMemo } from 'react';
import { useData } from '../../hooks/useDataContext';
import { useAuth } from '../../hooks/useAuth';
import { useLocalization } from '../../hooks/useLocalization';
import { useCurrency } from '../../hooks/useCurrency';
import { BuildingStorefrontIcon, ArrowLeftIcon, TrophyIcon } from '@heroicons/react/24/solid';
import { OrderStatus, Supplier } from '../../types';
import EmptyState from '../../components/EmptyState';

const MySuppliersPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const { t } = useLocalization();
    const { user } = useAuth();
    const { orders, suppliers } = useData();
    const { formatCurrency } = useCurrency();

    const supplierAnalytics = useMemo(() => {
        if (!user) return [];

        const spendMap = new Map<string, { totalSpend: number; orderCount: number }>();

        orders
            .filter(o => o.contractorId === user.id && o.status === OrderStatus.Completed)
            .forEach(order => {
                const current = spendMap.get(order.supplierId) || { totalSpend: 0, orderCount: 0 };
                spendMap.set(order.supplierId, {
                    totalSpend: current.totalSpend + order.total,
                    orderCount: current.orderCount + 1,
                });
            });
        
        return Array.from(spendMap.entries())
            .map(([supplierId, data]) => {
                const supplier = suppliers.find(s => s.id === supplierId);
                if (!supplier) return null;
                return {
                    supplier,
                    ...data,
                    avgOrderValue: data.totalSpend / data.orderCount,
                };
            })
            .filter((item): item is { supplier: Supplier; totalSpend: number; orderCount: number; avgOrderValue: number } => !!item)
            .sort((a, b) => b.totalSpend - a.totalSpend);

    }, [orders, suppliers, user]);

    // Mock loyalty for now
    const getLoyaltyInfo = (supplierId: string) => {
        const hash = supplierId.charCodeAt(0) + supplierId.charCodeAt(1);
        if (hash % 3 === 0) return { tier: 'Gold', points: 12500 };
        if (hash % 3 === 1) return { tier: 'Silver', points: 6200 };
        return { tier: 'Bronze', points: 1500 };
    };

    return (
        <div>
            {onBack && (
                <button onClick={onBack} className="flex items-center text-sm text-primary hover:underline mb-4">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    {t('backToDashboard')}
                </button>
            )}
            <h2 className="text-3xl font-bold flex items-center gap-3">
                <BuildingStorefrontIcon className="h-8 w-8" />
                {t('mySuppliersTitle')}
            </h2>
            <p className="text-gray-600 mt-1 mb-6">{t('mySuppliersDescription')}</p>

            {supplierAnalytics.length === 0 ? (
                <EmptyState
                    icon={BuildingStorefrontIcon}
                    title={t('mySuppliersNoData')}
                    message={t('mySuppliersNoDataDesc')}
                />
            ) : (
                <div className="space-y-4">
                    {supplierAnalytics.map(analytic => (
                        <div key={analytic.supplier.id} className="bg-white p-4 rounded-lg shadow-md">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                <div className="flex items-center gap-4">
                                    <img src={analytic.supplier.logoUrl} alt={analytic.supplier.name} className="w-12 h-12 rounded-full object-cover" />
                                    <p className="font-bold text-primary">{analytic.supplier.name}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-500">{t('mySuppliersTotalSpend')}</p>
                                    <p className="font-semibold">{formatCurrency(analytic.totalSpend)}</p>
                                </div>
                                 <div className="text-center">
                                    <p className="text-sm text-gray-500">{t('mySuppliersTotalOrders')}</p>
                                    <p className="font-semibold">{analytic.orderCount}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-500">{t('mySuppliersLoyaltyStatus')}</p>
                                    <div className="flex items-center justify-center gap-1 font-semibold text-secondary">
                                        <TrophyIcon className="h-4 w-4" />
                                        <span>{getLoyaltyInfo(analytic.supplier.id).tier} ({getLoyaltyInfo(analytic.supplier.id).points.toLocaleString()} pts)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MySuppliersPage;