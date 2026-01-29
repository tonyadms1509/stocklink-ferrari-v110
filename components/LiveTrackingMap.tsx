import React from 'react';
import { Supplier } from '../types';
import { BuildingStorefrontIcon, StarIcon } from '@heroicons/react/24/solid';
import { useLocalization } from '../hooks/useLocalization';

interface LiveTrackingMapProps {
  suppliers: Supplier[];
  activeMarker: Supplier | null;
  onMarkerHover: (supplier: Supplier | null) => void;
  onViewSupplier: (supplier: Supplier) => void;
}

const MAP_BOUNDS = {
  latMin: -60.0,
  latMax: 85.0,
  lonMin: -180.0,
  lonMax: 180.0,
};

const convertCoordsToPercent = (lat: number, lon: number) => {
  const latRange = MAP_BOUNDS.latMax - MAP_BOUNDS.latMin;
  const lonRange = MAP_BOUNDS.lonMax - MAP_BOUNDS.lonMin;

  const top = ((MAP_BOUNDS.latMax - lat) / latRange) * 100;
  const left = ((lon - MAP_BOUNDS.lonMin) / lonRange) * 100;

  return { top: `${top}%`, left: `${left}%` };
};

const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({ suppliers, activeMarker, onMarkerHover, onViewSupplier }) => {
    const { t } = useLocalization();

    return (
        <div className="relative w-full h-full bg-cover bg-center rounded-md" style={{backgroundImage: 'url(https://i.imgur.com/v2T3mJ5.png)', minHeight: '600px'}}>
            {suppliers.map(supplier => {
                const { top, left } = convertCoordsToPercent(supplier.coordinates.lat, supplier.coordinates.lon);
                const isActive = activeMarker?.id === supplier.id;
                return (
                    <div key={supplier.id} style={{ top, left, position: 'absolute' }} className="transform -translate-x-1/2 -translate-y-1/2 z-10">
                        <button onMouseEnter={() => onMarkerHover(supplier)} onMouseLeave={() => onMarkerHover(null)} className="focus:outline-none">
                            <BuildingStorefrontIcon className={`h-8 w-8 text-primary transition-transform duration-200 ${isActive ? 'scale-150 text-accent' : 'hover:scale-125'}`} />
                        </button>
                        {isActive && (
                            <div className="absolute bottom-full mb-2 w-48 bg-white p-2 rounded-lg shadow-lg text-center z-20" onMouseEnter={() => onMarkerHover(supplier)} onMouseLeave={() => onMarkerHover(null)}>
                                <p className="font-bold text-sm">{supplier.name}</p>
                                <div className="flex items-center justify-center text-xs my-1">
                                    <StarIcon className="h-3 w-3 text-yellow-400 mr-1"/>
                                    <span>{supplier.rating} ({supplier.reviews})</span>
                                </div>
                                <button onClick={() => onViewSupplier(supplier)} className="text-xs bg-primary text-white px-2 py-1 rounded-full hover:bg-blue-800">{t('viewProfile')}</button>
                            </div>
                        )}
                    </div>
                )
            })}
         </div>
    );
};

export default LiveTrackingMap;