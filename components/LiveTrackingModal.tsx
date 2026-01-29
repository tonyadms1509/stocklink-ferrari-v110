
import React, { useState, useEffect, useMemo } from 'react';
import { XMarkIcon, UserCircleIcon, TruckIcon, MapPinIcon } from '@heroicons/react/24/solid';
import { Order } from '../types';
import { useLocalization } from '../hooks/useLocalization';

interface LiveTrackingModalProps {
    order: Order;
    onClose: () => void;
}

const formatEta = (etaDate: Date, t: Function) => {
    const now = new Date();
    const diffMinutes = Math.round((etaDate.getTime() - now.getTime()) / 60000);

    if (diffMinutes <= 2) {
        return t('trackStatusArriving');
    }
    return `~ ${diffMinutes} min`;
};

// --- Embedded Map Component for simplicity --- //
interface SimpleMapProps {
  startCoords: { lat: number; lon: number };
  endCoords: { lat: number; lon: number };
  onProgress: (progress: number) => void;
}

const MAP_BOUNDS = {
  latMin: -26.5, latMax: -25.5,
  lonMin: 27.8, lonMax: 28.5,
};

const convertCoordsToPercent = (lat: number, lon: number) => {
  const latRange = MAP_BOUNDS.latMax - MAP_BOUNDS.latMin;
  const lonRange = MAP_BOUNDS.lonMax - MAP_BOUNDS.lonMin;

  const top = ((MAP_BOUNDS.latMax - lat) / latRange) * 100;
  const left = ((lon - MAP_BOUNDS.lonMin) / lonRange) * 100;

  return { top: `${top}%`, left: `${left}%` };
};

const SimpleTrackingMap: React.FC<SimpleMapProps> = ({ startCoords, endCoords, onProgress }) => {
    const [vehiclePosition, setVehiclePosition] = useState(startCoords);
    const DURATION_MS = 60000; // 1 minute for the full journey
    const INTERVAL_MS = 1000; // Update every second

    useEffect(() => {
        const startTime = Date.now();
        
        const interval = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            const progress = Math.min(elapsedTime / DURATION_MS, 1);
            onProgress(progress);

            const newLat = startCoords.lat + (endCoords.lat - startCoords.lat) * progress;
            const newLon = startCoords.lon + (endCoords.lon - startCoords.lon) * progress;

            setVehiclePosition({ lat: newLat, lon: newLon });

            if (progress >= 1) {
                clearInterval(interval);
            }
        }, INTERVAL_MS);

        return () => clearInterval(interval);
    }, [startCoords, endCoords, onProgress]);

    const startStyle = useMemo(() => convertCoordsToPercent(startCoords.lat, startCoords.lon), [startCoords]);
    const vehicleStyle = useMemo(() => convertCoordsToPercent(vehiclePosition.lat, vehiclePosition.lon), [vehiclePosition]);
    const destinationStyle = useMemo(() => convertCoordsToPercent(endCoords.lat, endCoords.lon), [endCoords]);
    
    const angle = Math.atan2(endCoords.lat - startCoords.lat, endCoords.lon - startCoords.lon) * 180 / Math.PI;

    return (
        <div className="relative w-full h-full bg-gray-200 bg-cover bg-center" style={{ backgroundImage: 'url(https://i.imgur.com/v2T3mJ5.png)' }}>
            <div style={{ ...startStyle, position: 'absolute' }} className="transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
            </div>
            <div style={{ ...destinationStyle, position: 'absolute' }} className="transform -translate-x-1/2 -translate-y-full">
                <MapPinIcon className="h-10 w-10 text-red-500" />
            </div>
            <div style={{ ...vehicleStyle, position: 'absolute' }} className="transform -translate-x-1/2 -translate-y-1/2">
                 <TruckIcon 
                    className="h-8 w-8 text-white bg-primary p-1 rounded-full shadow-lg" 
                    style={{ transform: `rotate(${angle + 90}deg)` }}
                />
            </div>
             <svg className="absolute top-0 left-0 w-full h-full" style={{ pointerEvents: 'none' }}>
                <line 
                    x1={startStyle.left} y1={startStyle.top} 
                    x2={destinationStyle.left} y2={destinationStyle.top} 
                    stroke="rgba(2, 132, 199, 0.7)" 
                    strokeWidth="2" 
                    strokeDasharray="5, 5" 
                />
            </svg>
        </div>
    );
};
// --- End of Embedded Map Component --- //


const LiveTrackingModal: React.FC<LiveTrackingModalProps> = ({ order, onClose }) => {
    const { t } = useLocalization();
    const [eta, setEta] = useState(new Date(order.deliveryDetails.eta));
    const [progress, setProgress] = useState(0);

    const initialEtaTime = useMemo(() => new Date(order.deliveryDetails.eta).getTime(), [order.deliveryDetails.eta]);

    useEffect(() => {
        const now = new Date().getTime();
        const newEtaTime = now + (initialEtaTime - now) * (1 - progress);
        setEta(new Date(newEtaTime));
    }, [progress, initialEtaTime]);
    
    if (!order.deliveryDetails) return null;
    
    const statuses = [t('trackStatusDispatched'), t('trackStatusEnRoute'), t('trackStatusArriving')];
    const currentStatusIndex = Math.floor(progress * (statuses.length - 0.01));


    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm" aria-modal="true" role="dialog">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full animate-fade-in-scale">
                <div className="p-6 relative">
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="h-6 w-6"/>
                    </button>
                    <h2 className="text-2xl font-extrabold text-primary mb-2">{t('trackOrderTitle')} #{order.orderNumber}</h2>
                     <p className="text-gray-500 mb-4">{statuses[currentStatusIndex]}</p>

                    <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden border">
                       <SimpleTrackingMap 
                            startCoords={order.deliveryDetails.startLocation} 
                            endCoords={order.deliveryDetails.destinationLocation}
                            onProgress={setProgress}
                        />
                    </div>

                    <div className="mt-4">
                        <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between text-xs">
                                {statuses.map((status, index) => (
                                    <div key={status} className={`text-center w-1/3 ${index <= currentStatusIndex ? 'font-bold text-primary' : 'text-gray-400'}`}>
                                        {status}
                                    </div>
                                ))}
                            </div>
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                                <div style={{ width: `${progress * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-1000 ease-linear"></div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-base-100 p-4 rounded-lg">
                            <h3 className="font-bold text-gray-800 mb-2">{t('trackDriverInfo')}</h3>
                            <div className="flex items-center gap-2">
                                <UserCircleIcon className="h-8 w-8 text-primary"/>
                                <div>
                                    <p className="font-semibold">{order.deliveryDetails.driverName}</p>
                                    <p className="text-sm text-gray-500">{t('trackVehicleReg')}: {order.deliveryDetails.vehicleReg}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-base-100 p-4 rounded-lg text-center flex flex-col justify-center">
                             <h3 className="font-bold text-gray-800 mb-1">{t('trackETA')}</h3>
                             <p className="text-2xl font-bold text-secondary">{formatEta(eta, t)}</p>
                        </div>
                    </div>

                    <div className="mt-6">
                         <button 
                            onClick={onClose}
                            className="w-full bg-base-200 hover:bg-base-300 text-gray-700 font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                            {t('trackClose')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveTrackingModal;
