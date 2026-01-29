
import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useDataContext';
import { useAuth } from '../../hooks/useAuth';
import { useLocalization } from '../../hooks/useLocalization';
import { useCurrency } from '../../hooks/useCurrency';
import { Order, User, CustomerInsight, CustomerSegment, QuoteStatus, UserRole } from '../../types';
import { UsersIcon, SparklesIcon, XMarkIcon, TrophyIcon, UserPlusIcon, BellAlertIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/solid';
import EmptyState from '../../components/EmptyState';

interface CustomerSummary {
    id: string; // companyId
    name: string;
    totalSpend: number;
    totalOrders: number;
    lastOrderDate: Date;
    segment: CustomerSegment;
}

const segmentStyles = {
    [CustomerSegment.HighValue]: {
        icon: TrophyIcon,
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        iconColor: 'text-yellow-500',
    },
    [CustomerSegment.New]: {
        icon: UserPlusIcon,
        bg: 'bg-green-100',
        text: 'text-green-800',
        iconColor: 'text-green-500',
    },
    [CustomerSegment.AtRisk]: {
        icon: BellAlertIcon,
        bg: 'bg-red-100',
        text: 'text-red-800',
        iconColor: 'text-red-500',
    },
    [CustomerSegment.Occasional]: {
        icon: ArrowTrendingUpIcon,
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        iconColor: 'text-blue-500',
    },
}

// --- AI Insights Modal --- //
const InsightsModal: React.FC<{
    customer: CustomerSummary;
    onClose: () => void;
    onAction: (actionType: CustomerInsight['action']['type'], context: any) => void;
}> = ({ customer, onClose, onAction }) => {
    const { t } = useLocalization();
    const { customerInsights, generateCustomerInsights, isAILoading } = useData();

    const insight = customerInsights.find(i => i.customerId === customer.id);

    React.useEffect(() => {
        if (!insight) {
            generateCustomerInsights(customer.id, customer.totalSpend, customer.totalOrders, customer.lastOrderDate);
        }
    }, [customer, insight, generateCustomerInsights]);

    const handleAction = () => {
        if (insight) {
            onAction(insight.action.type, { customer });
        }
    }

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-primary">{t('aiInsightsModalTitle', {name: customer.name})}</h2>
                        <p className="text-sm text-gray-500">Powered by AI</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XMarkIcon className="h-6 w-6"/></button>
                </div>
                {isAILoading.customerInsight ? <p className="text-center p-8">{t('aiInsightsGenerating')}</p> : (
                    insight ? (
                        <div>
                             <p className="text-gray-700 bg-blue-50 p-3 rounded-md border border-blue-200 mt-1">{insight.suggestion}</p>
                             <button onClick={handleAction} className="w-full mt-4 bg-secondary text-white font-bold py-2 px-4 rounded-lg">
                                {insight.action.label}
                            </button>
                        </div>
                    ) : (
                        <p className="text-center p-8 text-red-600">Could not generate insights for this customer.</p>
                    )
                )}
            </div>
        </div>
    );
};


const CustomersPage: React.FC = () => {
    const { orders, users, startOrGetConversation, sendQuoteToContractor } = useData();
    const { currentCompany } = useAuth();
    const { t } = useLocalization();
    const { formatCurrency } = useCurrency();
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);

    const customerSummaries = useMemo<CustomerSummary[]>(() => {
        if (!currentCompany) return [];
        const customerMap = new Map<string, { name: string; orders: Order[] }>();

        orders.forEach(order => {
            if (order.supplierId === currentCompany.id) {
                if (!customerMap.has(order.companyId)) {
                    // In a real app with full data, we'd look up the company name.
                    // Here we default to the contractor user's name from the order.
                    customerMap.set(order.companyId, { name: order.contractorName, orders: [] });
                }
                customerMap.get(order.companyId)!.orders.push(order);
            }
        });

        const summaries: CustomerSummary[] = [];
        customerMap.forEach((data, companyId) => {
            const sortedOrders = data.orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            const totalSpend = data.orders.reduce((sum, o) => sum + o.total, 0);
            const lastOrderDate = sortedOrders[0].createdAt;
            const daysSinceLastOrder = (new Date().getTime() - lastOrderDate.getTime()) / (1000 * 3600 * 24);

            let segment = CustomerSegment.Occasional;
            if (totalSpend > 5000 && data.orders.length >= 3) segment = CustomerSegment.HighValue;
            if (daysSinceLastOrder > 60) segment = CustomerSegment.AtRisk;
            if (data.orders.length === 1 && daysSinceLastOrder < 30) segment = CustomerSegment.New;
            
            summaries.push({
                id: companyId,
                name: data.name,
                totalOrders: data.orders.length,
                totalSpend,
                lastOrderDate,
                segment,
            });
        });

        return summaries.sort((a, b) => b.totalSpend - a.totalSpend);
    }, [orders, currentCompany]);

    const handleAction = async (actionType: CustomerInsight['action']['type'], context: any) => {
        if (!currentCompany) return;
        const contractorCompanyId = context.customer.id;
        
        if (actionType === 'draft_message') {
            const convo = await startOrGetConversation(contractorCompanyId);
            // In a real app, you would navigate to the messages tab and pre-fill the input
            // For now, we just open the modal.
            setSelectedCustomer(context.customer);
        } else if (actionType === 'draft_quote') {
             const contractorCompany = users.find(u => u.activeCompanyId === contractorCompanyId);
             if (contractorCompany) {
                 await sendQuoteToContractor({
                    contractorId: contractorCompanyId,
                    contractorName: context.customer.name,
                    participantIds: [currentCompany.id, contractorCompanyId],
                    supplierId: currentCompany.id,
                    items: [], // Let supplier add items in the editor
                    notes: "Here's a special offer for you!",
                    total: 0,
                    status: QuoteStatus.Pending,
                    initiatedBy: UserRole.Supplier,
                });
             }
        }
        setSelectedCustomer(null);
    };

    return (
        <>
            <div>
                <h2 className="text-3xl font-bold">{t('customersTitle')}</h2>
                <p className="text-gray-600 mb-6">{t('customersDescription')}</p>

                {customerSummaries.length === 0 ? (
                    <EmptyState
                        icon={UsersIcon}
                        title={t('customersNoCustomers')}
                        message={t('customersNoCustomersDesc')}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {customerSummaries.map(customer => {
                            const segmentStyle = segmentStyles[customer.segment];
                            const SegmentIcon = segmentStyle.icon;
                            return (
                                <div key={customer.id} className="bg-white p-4 rounded-lg shadow-md flex flex-col justify-between">
                                    <div>
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 ${segmentStyle.bg} ${segmentStyle.text}`}>
                                            <SegmentIcon className={`h-4 w-4 ${segmentStyle.iconColor}`} />
                                            {customer.segment}
                                        </div>
                                        <h3 className="font-bold text-lg">{customer.name}</h3>
                                        <div className="text-sm text-gray-600 mt-2 space-y-1">
                                            <p><strong>{t('customerTotalSpend')}:</strong> {formatCurrency(customer.totalSpend)}</p>
                                            <p><strong>{t('customerTotalOrders')}:</strong> {customer.totalOrders}</p>
                                            <p><strong>{t('customerLastOrder')}:</strong> {customer.lastOrderDate.toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedCustomer(customer)}
                                        className="mt-4 w-full bg-primary hover:bg-blue-800 text-white font-bold py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-1.5"
                                    >
                                        <SparklesIcon className="h-4 w-4"/>
                                        {t('customerAIInsights')}
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
            {selectedCustomer && (
                <InsightsModal 
                    customer={selectedCustomer}
                    onClose={() => setSelectedCustomer(null)}
                    onAction={handleAction}
                />
            )}
        </>
    );
};

export default CustomersPage;
