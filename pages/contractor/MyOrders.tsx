import React, { useState } from 'react';
import { useData } from '../../hooks/useDataContext';
import { OrderStatus, Order, Supplier } from '../../types';
import { ArrowLeftIcon, ClipboardDocumentListIcon, ArrowPathIcon, TruckIcon, CheckCircleIcon, ExclamationTriangleIcon, SparklesIcon, ChevronDownIcon, DocumentCheckIcon, XMarkIcon, CubeIcon } from '@heroicons/react/24/solid';
import { useLocalization } from '../../hooks/useLocalization';
import LiveTrackingModal from '../../components/LiveTrackingModal';
import ReviewModal from '../../components/ReviewModal';
import { useCurrency } from '../../hooks/useCurrency';
import DisputeModal from '../../components/DisputeModal';
import { useToast } from '../../hooks/useToast';
import AIDeliveryCoordinatorModal from '../../components/AIDeliveryCoordinatorModal';
import EmptyState from '../../components/EmptyState';

const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case OrderStatus.New: return 'bg-blue-100 text-blue-800 border-blue-200';
        case OrderStatus.Processing: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case OrderStatus.ReadyForPickup: return 'bg-indigo-100 text-indigo-800 border-indigo-200';
        case OrderStatus.OutForDelivery: return 'bg-purple-100 text-purple-800 border-purple-200';
        case OrderStatus.Completed: return 'bg-green-100 text-green-800 border-green-200';
        case OrderStatus.Cancelled: return 'bg-red-100 text-red-800 border-red-200';
        case OrderStatus.Disputed: return 'bg-orange-100 text-orange-800 border-orange-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
}

const ViewPODModal: React.FC<{ order: Order; onClose: () => void }> = ({ order, onClose }) => {
    const { t } = useLocalization();
    if (!order.proofOfDelivery) return null;
    
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fade-in-scale">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><XMarkIcon className="h-6 w-6"/></button>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900"><DocumentCheckIcon className="h-6 w-6 text-green-500"/> Proof of Delivery</h2>
                <p className="text-sm text-gray-500 mb-4">Delivered on: {new Date(order.proofOfDelivery.timestamp).toLocaleString()}</p>
                
                <div className="space-y-4">
                    <div>
                        <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Photo Evidence</p>
                        <div className="rounded-lg overflow-hidden border border-gray-200">
                            <img src={order.proofOfDelivery.imageUrl} className="w-full h-48 object-cover" alt="Delivery" />
                        </div>
                    </div>
                     <div>
                        <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Recipient Signature</p>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-2">
                            <img src={order.proofOfDelivery.signatureUrl} className="w-full h-24 object-contain" alt="Signature" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const StatusStepper: React.FC<{ status: OrderStatus }> = ({ status }) => {
    const steps = [
        { label: 'Placed', match: [OrderStatus.New] },
        { label: 'Processing', match: [OrderStatus.Processing, OrderStatus.ReadyForPickup] },
        { label: 'On Way', match: [OrderStatus.OutForDelivery] },
        { label: 'Done', match: [OrderStatus.Completed] }
    ];

    let activeIndex = -1;
    if (status === OrderStatus.Cancelled || status === OrderStatus.Disputed) return null;

    if (steps[0].match.includes(status)) activeIndex = 0;
    else if (status === OrderStatus.Processing || status === OrderStatus.ReadyForPickup) activeIndex = 1;
    else if (status === OrderStatus.OutForDelivery) activeIndex = 2;
    else if (status === OrderStatus.Completed) activeIndex = 3;

    return (
        <div className="w-full mt-6 mb-2 px-2">
            <div className="relative flex items-center justify-between">
                <div className="absolute left-0 top-3 w-full h-1 bg-gray-100 rounded-full -z-10"></div>
                <div className="absolute left-0 top-3 h-1 bg-green-500 rounded-full -z-10 transition-all duration-700 ease-out" style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}></div>
                {steps.map((step, index) => (
                    <div key={step.label} className="flex flex-col items-center group relative">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 text-[10px] font-bold transition-all duration-500 z-10 ${index <= activeIndex ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-200 text-gray-300'} ${index === activeIndex ? 'ring-4 ring-green-100' : ''}`}>
                            {index <= activeIndex ? <CheckCircleIcon className="h-4 w-4"/> : index + 1}
                        </div>
                        <span className={`text-[10px] mt-2 font-bold uppercase tracking-wider transition-colors duration-300 ${index <= activeIndex ? 'text-green-600' : 'text-gray-300'}`}>
                            {step.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const OrderCard: React.FC<{ order: Order; supplier: Supplier | undefined; hasBeenReviewed: boolean; onReorder: () => void; onTrack: () => void; onReview: () => void; onDispute: () => void; onAICoordinator: () => void; onViewPOD: () => void; }> = ({ order, supplier, hasBeenReviewed, onReorder, onTrack, onReview, onDispute, onAICoordinator, onViewPOD }) => {
    const { t } = useLocalization();
    const { formatCurrency } = useCurrency();
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group">
            <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2 text-left">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-50 text-blue-600 p-2 rounded-lg"><CubeIcon className="h-6 w-6" /></div>
                        <div className="text-left">
                            <h3 className="font-bold text-lg text-gray-900">Order #{order.orderNumber}</h3>
                            <p className="text-sm text-gray-500">{supplier?.name || order.supplierId}</p>
                        </div>
                    </div>
                    <div className="text-right">
                         <p className="font-extrabold text-xl text-gray-900">{formatCurrency(order.total)}</p>
                         <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>

                {order.status !== OrderStatus.Cancelled && order.status !== OrderStatus.Disputed ? <StatusStepper status={order.status} /> : <div className="mt-4"><span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full border ${getStatusColor(order.status)}`}>{order.status}</span></div>}

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                        <button onClick={onReorder} className="text-xs font-bold text-gray-600 hover:text-primary flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
                            <ArrowPathIcon className="h-4 w-4" /> {t('myOrdersReorder')}
                        </button>
                    </div>
                    <div className="flex gap-2">
                         {order.status === OrderStatus.OutForDelivery && order.deliveryDetails && (
                            <>
                                <button onClick={onAICoordinator} className="p-2 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-full transition-colors border border-purple-200" title="AI Assistant"><SparklesIcon className="h-4 w-4" /></button>
                                <button onClick={onTrack} className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-full hover:bg-blue-700 flex items-center gap-2 shadow-sm shadow-blue-200">
                                    <TruckIcon className="h-4 w-4" /> {t('myOrdersTrack')}
                                </button>
                            </>
                        )}
                        {order.status === OrderStatus.Completed && (
                            <>
                                {order.proofOfDelivery && <button onClick={onViewPOD} className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-full transition-colors border border-green-200" title="View POD"><DocumentCheckIcon className="h-4 w-4" /></button>}
                                {!hasBeenReviewed && supplier && <button onClick={onReview} className="px-4 py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs font-bold rounded-full hover:bg-yellow-100 transition-colors">{t('myOrdersLeaveReview')}</button>}
                            </>
                        )}
                        <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                            <ChevronDownIcon className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>
            {isExpanded && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 animate-fade-in-up">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 text-left">Order Items</h4>
                    <div className="space-y-2">
                        {order.items.map(item => (
                            <div key={item.id} className="flex items-center justify-between gap-4 bg-white p-3 rounded-lg border border-gray-200 shadow-sm text-left">
                                <img src={item.imageUrl} alt={item.name} className="w-10 h-10 object-cover rounded-md bg-gray-100"/>
                                <div className="flex-grow min-w-0 text-left"><p className="font-bold text-gray-800 text-sm truncate">{item.name}</p><p className="text-xs text-gray-500">{item.quantity} x {formatCurrency(item.price)}</p></div>
                                <p className="font-bold text-gray-900 text-sm whitespace-nowrap">{formatCurrency(item.quantity * item.price)}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between text-sm text-gray-600"><span>Delivery Fee</span><span>{formatCurrency(0)}</span></div>
                    <div className="mt-1 flex justify-between text-sm font-bold text-gray-800"><span>Total Paid</span><span>{formatCurrency(order.total)}</span></div>
                </div>
            )}
        </div>
    );
}

const MyOrders: React.FC<{ onNavigateToCart: () => void; onBack?: () => void; }> = ({ onNavigateToCart, onBack }) => {
    const { orders, reorderItems, reviews, getSupplierById } = useData();
    const { t } = useLocalization();
    const { showToast } = useToast();
    const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
    const [reviewingOrder, setReviewingOrder] = useState<Order | null>(null);
    const [disputingOrder, setDisputingOrder] = useState<Order | null>(null);
    const [coordinatorOrder, setCoordinatorOrder] = useState<Order | null>(null);
    const [podOrder, setPodOrder] = useState<Order | null>(null);

    const handleReorder = (orderId: string, orderNumber: string) => {
        const { success, unavailableCount } = reorderItems(orderId);
        if (success) {
            showToast(t('myOrdersReorderSuccess', { orderNumber }), 'success');
            if (unavailableCount > 0) showToast(t('myOrdersReorderPartial', { count: unavailableCount }), 'warning');
            onNavigateToCart();
        }
    };

    if (orders.length === 0) return <EmptyState icon={ClipboardDocumentListIcon} title="No Orders Yet" message="Once you place an order, you can track it here." />;

    return (
        <>
            <div className="max-w-4xl mx-auto pb-48 lg:pb-12 text-left">
                 {onBack && <button onClick={onBack} className="flex items-center text-sm text-primary hover:underline mb-6 font-medium transition-colors hover:translate-x-1"><ArrowLeftIcon className="h-4 w-4 mr-2" />{t('backToDashboard')}</button>}
                <div className="mb-8 text-left"><h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t('navMyOrders')}</h2><p className="text-gray-500 mt-2">Track and manage your supply deliveries.</p></div>
                <div className="space-y-6">
                    {orders.map((order, index) => {
                        const supplier = getSupplierById(order.supplierId);
                        const hasBeenReviewed = reviews.some(r => r.orderId === order.id);
                        return (
                            <div key={order.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
                                <OrderCard order={order} supplier={supplier} hasBeenReviewed={hasBeenReviewed} onReorder={() => handleReorder(order.id, order.orderNumber)} onTrack={() => setTrackingOrder(order)} onReview={() => setReviewingOrder(order)} onDispute={() => setDisputingOrder(order)} onAICoordinator={() => setCoordinatorOrder(order)} onViewPOD={() => setPodOrder(order)} />
                            </div>
                        );
                    })}
                </div>
            </div>
            {trackingOrder && <LiveTrackingModal order={trackingOrder} onClose={() => setTrackingOrder(null)} />}
            {reviewingOrder && getSupplierById(reviewingOrder.supplierId) && <ReviewModal order={reviewingOrder} supplier={getSupplierById(reviewingOrder.supplierId)!} onClose={() => setReviewingOrder(null)} />}
            {disputingOrder && <DisputeModal order={disputingOrder} onClose={() => setDisputingOrder(null)} />}
            {coordinatorOrder && <AIDeliveryCoordinatorModal order={coordinatorOrder} onClose={() => setCoordinatorOrder(null)} />}
            {podOrder && <ViewPODModal order={podOrder} onClose={() => setPodOrder(null)} />}
        </>
    );
};

export default MyOrders;
