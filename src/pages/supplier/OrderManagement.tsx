
import React, { useState, Fragment, useMemo } from 'react';
import { useData } from '../../hooks/useDataContext';
import { Order, OrderStatus } from '../../types';
import { ClipboardDocumentListIcon, TruckIcon, ChevronDownIcon, ViewColumnsIcon, TableCellsIcon, CheckCircleIcon, CubeIcon, SparklesIcon } from '@heroicons/react/24/solid';
import AssignDriverModal from '../../components/AssignDriverModal';
import PackOrderModal from '../../components/PackOrderModal';
import { useLocalization } from '../../hooks/useLocalization';
import { useCurrency } from '../../hooks/useCurrency';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../hooks/useAuth';
import PayloadMasterModal from '../../components/PayloadMasterModal';

const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case OrderStatus.New:
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case OrderStatus.Processing:
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case OrderStatus.ReadyForPickup:
            return 'bg-indigo-100 text-indigo-800 border-indigo-200';
        case OrderStatus.OutForDelivery:
            return 'bg-purple-100 text-purple-800 border-purple-200';
        case OrderStatus.Completed:
            return 'bg-green-100 text-green-800 border-green-200';
        case OrderStatus.Cancelled:
            return 'bg-red-100 text-red-800 border-red-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
}

const KanbanCard: React.FC<{ order: Order, onAssignDriver: () => void, onPackOrder: () => void, onUpdateStatus: (status: OrderStatus) => void, onOptimize: () => void }> = ({ order, onAssignDriver, onPackOrder, onUpdateStatus, onOptimize }) => {
    const { formatCurrency } = useCurrency();
    const { t } = useLocalization();

    return (
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 mb-3 hover:shadow-md transition-shadow text-left">
            <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-primary text-sm">#{order.orderNumber}</span>
                <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-sm font-medium text-gray-800 mb-1">{order.contractorName}</p>
            <p className="text-xs text-gray-500 mb-2">{order.items.length} items • {formatCurrency(order.total)}</p>
            
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                <select 
                    value={order.status} 
                    onChange={(e) => onUpdateStatus(e.target.value as OrderStatus)}
                    className="text-xs p-1 border rounded bg-gray-50"
                    onClick={(e) => e.stopPropagation()}
                >
                    {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                
                <div className="flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); onOptimize(); }} className="text-purple-500 hover:text-purple-700" title="Payload AI">
                        <SparklesIcon className="h-4 w-4"/>
                    </button>
                    {order.status === OrderStatus.Processing && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onPackOrder(); }}
                            className="text-gray-400 hover:text-blue-600"
                            title="Pack Order"
                        >
                            <CubeIcon className="h-4 w-4"/>
                        </button>
                    )}
                    {![OrderStatus.Completed, OrderStatus.Cancelled, OrderStatus.New].includes(order.status) && (
                         <button 
                            onClick={(e) => { e.stopPropagation(); onAssignDriver(); }}
                            className="text-gray-400 hover:text-primary"
                            title={t('orderAssignDriver')}
                        >
                            <TruckIcon className="h-4 w-4"/>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

const KanbanBoard: React.FC<{ orders: Order[], onAssignDriver: (order: Order) => void, onPackOrder: (order: Order) => void, onUpdateStatus: (orderId: string, status: OrderStatus) => void, onOptimize: (order: Order) => void }> = ({ orders, onAssignDriver, onPackOrder, onUpdateStatus, onOptimize }) => {
    const columns = [OrderStatus.New, OrderStatus.Processing, OrderStatus.ReadyForPickup, OrderStatus.OutForDelivery, OrderStatus.Completed];

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 h-full min-h-[600px]">
            {columns.map(status => (
                <div key={status} className="min-w-[280px] w-[280px] bg-gray-100 rounded-lg p-3 flex flex-col">
                    <div className="flex justify-between items-center mb-3 px-1">
                        <h4 className="font-bold text-gray-700 text-sm">{status}</h4>
                        <span className="bg-white text-gray-600 text-xs px-2 py-0.5 rounded-full font-bold">
                            {orders.filter(o => o.status === status).length}
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {orders.filter(o => o.status === status).map(order => (
                            <KanbanCard 
                                key={order.id} 
                                order={order} 
                                onAssignDriver={() => onAssignDriver(order)} 
                                onPackOrder={() => onPackOrder(order)}
                                onUpdateStatus={(newStatus) => onUpdateStatus(order.id, newStatus)}
                                onOptimize={() => onOptimize(order)}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

const OrderManagement: React.FC = () => {
    const { orders, updateOrderStatus, assignDriverToOrder, drivers, vehicles } = useData();
    const { currentCompany } = useAuth();
    const [assigningOrder, setAssigningOrder] = useState<Order | null>(null);
    const [packingOrder, setPackingOrder] = useState<Order | null>(null);
    const [optimizingOrder, setOptimizingOrder] = useState<Order | null>(null);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
    const { t } = useLocalization();
    const { formatCurrency } = useCurrency();

    const supplierOrders = useMemo(() => {
        if (!currentCompany) return [];
        return orders.filter(o => o.supplierId === currentCompany.id);
    }, [orders, currentCompany]);

    const handleAssignDriver = (orderId: string, driverId: string, vehicleId: string) => {
        assignDriverToOrder(orderId, driverId, vehicleId);
        setAssigningOrder(null);
    }

    if (supplierOrders.length === 0) {
        return (
            <EmptyState
                icon={ClipboardDocumentListIcon}
                title="No Orders Received Yet"
                message="New orders from contractors will appear here."
            />
        );
    }
    
    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
                <h2 className="text-3xl font-bold">Order Management</h2>
                <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <TableCellsIcon className="h-4 w-4"/> List
                    </button>
                    <button 
                        onClick={() => setViewMode('board')}
                        className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${viewMode === 'board' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <ViewColumnsIcon className="h-4 w-4"/> Board
                    </button>
                </div>
            </div>

            {viewMode === 'board' ? (
                <div className="flex-grow overflow-hidden">
                        <KanbanBoard 
                        orders={supplierOrders} 
                        onAssignDriver={setAssigningOrder}
                        onPackOrder={setPackingOrder}
                        onUpdateStatus={updateOrderStatus}
                        onOptimize={setOptimizingOrder}
                    />
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md overflow-hidden flex-grow border border-gray-100">
                    <div className="overflow-x-auto text-left">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="p-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest">Order #</th>
                                    <th className="p-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest">Customer</th>
                                    <th className="p-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest">Total</th>
                                    <th className="p-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest">Status</th>
                                    <th className="p-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {supplierOrders.map(order => (
                                    <Fragment key={order.id}>
                                        <tr className="border-b last:border-0 hover:bg-slate-50/50 transition-colors group">
                                            <td className="p-4 font-bold text-primary">#{order.orderNumber}</td>
                                            <td className="p-4 font-medium text-slate-700">{order.contractorName}</td>
                                            <td className="p-4 font-black">{formatCurrency(order.total)}</td>
                                            <td className="p-4">
                                                <select 
                                                    value={order.status} 
                                                    onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                                                    className={`p-2 text-xs font-bold rounded-xl border-2 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${getStatusColor(order.status)}`}
                                                    disabled={!!order.deliveryDetails}
                                                >
                                                    {Object.values(OrderStatus).map(status => (
                                                        <option key={status} value={status}>{status}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-4 flex items-center justify-end gap-2">
                                                <button onClick={() => setOptimizingOrder(order)} className="p-2 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-100" title="Payload Master AI">
                                                    <SparklesIcon className="h-4 w-4"/>
                                                </button>
                                                {order.status === OrderStatus.Processing && (
                                                    <button 
                                                        onClick={() => setPackingOrder(order)}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-xs flex items-center gap-1.5 shadow-sm"
                                                    >
                                                        <CubeIcon className="h-4 w-4"/> Pack
                                                    </button>
                                                )}
                                                {![OrderStatus.Completed, OrderStatus.Cancelled, OrderStatus.New].includes(order.status) && (
                                                    order.deliveryDetails ? (
                                                        <div className="text-right text-xs text-slate-500 pr-2">
                                                            <p className="font-bold text-slate-700">{order.deliveryDetails.driverName}</p>
                                                            <p className="opacity-70">{order.deliveryDetails.vehicleReg}</p>
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={() => setAssigningOrder(order)}
                                                            className="bg-slate-900 hover:bg-black text-white font-bold py-2 px-4 rounded-lg text-xs flex items-center gap-1.5 shadow-sm"
                                                        >
                                                            <TruckIcon className="h-4 w-4"/> Assign
                                                        </button>
                                                    )
                                                )}
                                                    <button onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                                                    <ChevronDownIcon className={`h-5 w-5 transition-transform ${expandedOrderId === order.id ? 'rotate-180' : ''}`}/>
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedOrderId === order.id && (
                                            <tr className="bg-slate-50">
                                                <td colSpan={5} className="p-6">
                                                    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-inner max-w-2xl text-left">
                                                        <h4 className="font-black text-xs text-slate-400 uppercase tracking-widest mb-4">Invoice Items</h4>
                                                        <div className="space-y-2">
                                                            {order.items.map(item => (
                                                                <div key={item.id} className="flex items-center justify-between gap-4 text-sm p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                                    <div className="flex items-center gap-3">
                                                                        <img src={item.imageUrl} alt={item.name} className="w-10 h-10 object-cover rounded-lg border bg-white"/>
                                                                        <div className="text-left">
                                                                            <p className="font-bold text-slate-800">{item.name}</p>
                                                                            <p className="text-xs text-gray-500">{item.quantity} x {formatCurrency(item.price)}</p>
                                                                        </div>
                                                                    </div>
                                                                    <p className="font-black text-slate-900">{formatCurrency(item.quantity * item.price)}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {assigningOrder && (
                <AssignDriverModal 
                    order={assigningOrder}
                    drivers={drivers}
                    vehicles={vehicles}
                    onSave={handleAssignDriver}
                    onClose={() => setAssigningOrder(null)}
                />
            )}
            {packingOrder && (
                <PackOrderModal
                    order={packingOrder}
                    onClose={() => setPackingOrder(null)}
                />
            )}
            {optimizingOrder && (
                <PayloadMasterModal 
                    order={optimizingOrder}
                    onClose={() => setOptimizingOrder(null)}
                />
            )}
        </div>
    );
};

export default OrderManagement;
