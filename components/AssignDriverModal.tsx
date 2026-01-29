import React, { useState, useMemo } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { Order, Driver, Vehicle } from '../types';
import { useLocalization } from '../hooks/useLocalization';

interface AssignDriverModalProps {
    order: Order;
    drivers: Driver[];
    vehicles: Vehicle[];
    onClose: () => void;
    onSave: (orderId: string, driverId: string, vehicleId: string) => void;
}

const AssignDriverModal: React.FC<AssignDriverModalProps> = ({ order, drivers, vehicles, onClose, onSave }) => {
    const { t } = useLocalization();
    const [selectedDriver, setSelectedDriver] = useState('');
    const [selectedVehicle, setSelectedVehicle] = useState('');

    const availableVehicles = useMemo(() => {
        return vehicles.filter(v => v.status === 'Available');
    }, [vehicles]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedDriver && selectedVehicle) {
            onSave(order.id, selectedDriver, selectedVehicle);
        }
    }

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm" aria-modal="true" role="dialog">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fade-in-scale">
                <div className="p-6 relative">
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="h-6 w-6"/>
                    </button>
                    <h2 className="text-2xl font-extrabold text-primary mb-2">{t('assignDriverTitle')}</h2>
                    <p className="text-gray-500 mb-6">{t('assignDriverForOrder')} <span className="font-bold">#{order.orderNumber}</span></p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="driver" className="block text-sm font-medium text-gray-700">{t('assignDriverName')}</label>
                            <select
                                id="driver"
                                value={selectedDriver}
                                onChange={(e) => setSelectedDriver(e.target.value)}
                                className="mt-1 p-2 w-full border rounded-md bg-white"
                                required
                            >
                                <option value="" disabled>Select a driver...</option>
                                {drivers.map(driver => (
                                    <option key={driver.id} value={driver.id}>{driver.name}</option>
                                ))}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="vehicle" className="block text-sm font-medium text-gray-700">{t('assignDriverVehicleReg')}</label>
                            <select
                                id="vehicle"
                                value={selectedVehicle}
                                onChange={(e) => setSelectedVehicle(e.target.value)}
                                className="mt-1 p-2 w-full border rounded-md bg-white"
                                required
                            >
                                <option value="" disabled>Select an available vehicle...</option>
                                {availableVehicles.map(vehicle => (
                                    <option key={vehicle.id} value={vehicle.id}>
                                        {vehicle.makeModel} ({vehicle.registration})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="pt-4 flex flex-col sm:flex-row sm:justify-end gap-3">
                            <button 
                                type="button" 
                                onClick={onClose}
                                className="w-full sm:w-auto bg-base-200 hover:bg-base-300 text-gray-700 font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                {t('paymentCancel')}
                            </button>
                             <button 
                                type="submit" 
                                className="w-full sm:w-auto bg-secondary hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                               {t('assignDriverConfirm')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AssignDriverModal;