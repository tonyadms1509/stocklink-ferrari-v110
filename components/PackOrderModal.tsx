
import React, { useState, useMemo } from 'react';
import { Order, OrderStatus } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { useData } from '../hooks/useDataContext';
import { XMarkIcon, CheckCircleIcon, PrinterIcon, CubeIcon } from '@heroicons/react/24/solid';
import { useToast } from '../hooks/useToast';

interface PackOrderModalProps {
    order: Order;
    onClose: () => void;
}

const PackOrderModal: React.FC<PackOrderModalProps> = ({ order, onClose }) => {
    const { t } = useLocalization();
    const { updateOrderStatus } = useData();
    const { showToast } = useToast();
    
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

    const progress = useMemo(() => {
        return Math.round((checkedItems.size / order.items.length) * 100);
    }, [checkedItems, order.items]);

    const toggleItem = (itemId: string) => {
        const newSet = new Set(checkedItems);
        if (newSet.has(itemId)) {
            newSet.delete(itemId);
        } else {
            newSet.add(itemId);
        }
        setCheckedItems(newSet);
    };

    const handleComplete = async () => {
        if (checkedItems.size !== order.items.length) return;
        
        await updateOrderStatus(order.id, OrderStatus.ReadyForPickup);
        showToast(`Order #${order.orderNumber} marked as Ready for Pickup`, 'success');
        onClose();
    };

    const handlePrint = () => {
        showToast("Printing Packing Slip...", "info");
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[80] p-4 animate-fade-in-scale">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <CubeIcon className="h-6 w-6 text-primary"/>
                            Pack Order #{order.orderNumber}
                        </h2>
                        <p className="text-sm text-gray-500">{order.contractorName}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="h-6 w-6"/></button>
                </div>

                <div className="p-6 flex-grow overflow-y-auto">
                    <div className="mb-6">
                        <div className="flex justify-between text-sm font-semibold mb-2">
                            <span>Packing Progress</span>
                            <span className={progress === 100 ? 'text-green-600' : 'text-primary'}>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                                className={`h-2.5 rounded-full transition-all duration-300 ${progress === 100 ? 'bg-green-500' : 'bg-primary'}`} 
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {order.items.map(item => {
                            const isChecked = checkedItems.has(item.id);
                            return (
                                <div 
                                    key={item.id} 
                                    onClick={() => toggleItem(item.id)}
                                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${isChecked ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:border-primary'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isChecked ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                                            {isChecked && <CheckCircleIcon className="h-5 w-5 text-white"/>}
                                        </div>
                                        <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded bg-gray-100"/>
                                        <div>
                                            <p className={`font-medium ${isChecked ? 'text-green-800' : 'text-gray-900'}`}>{item.name}</p>
                                            <p className="text-xs text-gray-500">{item.brand} • {item.category}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-bold">x{item.quantity}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-4 border-t bg-gray-50 rounded-b-xl flex gap-3">
                    <button 
                        onClick={handlePrint}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100 flex items-center gap-2"
                    >
                        <PrinterIcon className="h-5 w-5"/> Packing Slip
                    </button>
                    <button 
                        onClick={handleComplete}
                        disabled={progress < 100}
                        className="flex-grow bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
                    >
                        <CheckCircleIcon className="h-5 w-5"/>
                        Mark Ready for Pickup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PackOrderModal;
