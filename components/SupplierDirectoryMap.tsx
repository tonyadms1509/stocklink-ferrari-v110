
import React, { useState } from 'react';
import { Supplier } from '../types';
import { BuildingStorefrontIcon, StarIcon, MagnifyingGlassIcon, MapPinIcon, FunnelIcon, PaperAirplaneIcon, ListBulletIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { useLocalization } from '../hooks/useLocalization';

interface SupplierDirectoryMapProps {
  suppliers: Supplier[];
  activeMarker: Supplier | null;
  onMarkerHover: (supplier: Supplier | null) => void;
  onViewSupplier: (supplier: Supplier) => void;
}

const MAP_BOUNDS = {
  latMin: -35.0, latMax: -25.0,
  lonMin: 18.0, lonMax: 33.0,
};

const convertCoordsToPercent = (lat: number, lon: number) => {
  const latRange = MAP_BOUNDS.latMax - MAP_BOUNDS.latMin;
  const lonRange = MAP_BOUNDS.lonMax - MAP_BOUNDS.lonMin;

  const top = ((MAP_BOUNDS.latMax - lat) / latRange) * 100;
  const left = ((lon - MAP_BOUNDS.lonMin) / lonRange) * 100;

  return { top: `${top}%`, left: `${left}%` };
};

const FilterChip: React.FC<{ label: string; active?: boolean; onClick?: () => void }> = ({ label, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all whitespace-nowrap ${active ? 'bg-primary text-white border border-primary' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}
    >
        {label}
    </button>
)

const SupplierDirectoryMap: React.FC<SupplierDirectoryMapProps> = ({ suppliers, activeMarker, onMarkerHover, onViewSupplier }) => {
    const { t } = useLocalization();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    const filteredSuppliers = suppliers.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'Verified' ? s.verificationStatus === 'verified' : activeFilter === 'Top Rated' ? (s.rating || 0) > 4.5 : true;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="relative w-full h-full bg-cover bg-center rounded-xl overflow-hidden shadow-inner border border-gray-300" style={{backgroundImage: 'url(https://i.imgur.com/v2T3mJ5.png)', minHeight: '600px'}}>
            
            {/* Top Bar Overlay */}
            <div className="absolute top-4 left-4 right-4 z-30 flex flex-col gap-3 pointer-events-none">
                <div className="flex gap-2 pointer-events-auto">
                    <div className="bg-white rounded-lg shadow-lg flex items-center p-2 flex-grow max-w-md border border-gray-200">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 ml-2" />
                        <input 
                            type="text" 
                            placeholder="Search area..." 
                            className="flex-grow p-2 text-sm outline-none text-gray-700 placeholder-gray-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="h-6 w-px bg-gray-200 mx-2"></div>
                        <button className="p-2 hover:bg-gray-100 rounded-full text-primary transition-colors">
                            <MagnifyingGlassIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pointer-events-auto pb-2">
                    <FilterChip label="Open Now" active={activeFilter === 'Open Now'} onClick={() => setActiveFilter(activeFilter === 'Open Now' ? null : 'Open Now')} />
                    <FilterChip label="Top Rated" active={activeFilter === 'Top Rated'} onClick={() => setActiveFilter(activeFilter === 'Top Rated' ? null : 'Top Rated')} />
                    <FilterChip label="Verified" active={activeFilter === 'Verified'} onClick={() => setActiveFilter(activeFilter === 'Verified' ? null : 'Verified')} />
                    <FilterChip label="Delivery" />
                </div>
            </div>

            {/* Map Markers */}
            {filteredSuppliers.map(supplier => {
                const { top, left } = convertCoordsToPercent(supplier.coordinates.lat, supplier.coordinates.lon);
                const isActive = activeMarker?.id === supplier.id;
                return (
                    <div key={supplier.id} style={{ top, left, position: 'absolute' }} className="transform -translate-x-1/2 -translate-y-1/2 z-20">
                        <button 
                            onMouseEnter={() => onMarkerHover(supplier)} 
                            onMouseLeave={() => onMarkerHover(null)} 
                            onClick={() => onViewSupplier(supplier)} 
                            className={`focus:outline-none relative group transition-transform duration-300 ${isActive ? 'scale-125 z-30' : 'hover:scale-110 z-20'}`}
                        >
                            <div className={`p-2 rounded-full shadow-md border-2 ${isActive ? 'bg-primary border-white' : 'bg-white border-primary'}`}>
                                <BuildingStorefrontIcon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-primary'}`} />
                            </div>
                            {/* Pin Stick */}
                            <div className="w-0.5 h-3 bg-gray-600 mx-auto opacity-50"></div>
                            <div className="w-2 h-1 bg-black/20 rounded-full mx-auto blur-[1px]"></div>
                        </button>

                        {isActive && (
                            <div className="absolute bottom-full mb-3 w-64 bg-white p-0 rounded-xl shadow-xl text-left z-40 transform -translate-x-1/2 left-1/2 overflow-hidden border border-gray-100 animate-fade-in-up">
                                <div className="h-16 bg-gradient-to-r from-blue-500 to-primary relative">
                                    {supplier.logoUrl && <img src={supplier.logoUrl} className="absolute -bottom-6 left-4 w-12 h-12 rounded-lg border-2 border-white shadow-sm bg-white object-cover" alt="" />}
                                </div>
                                <div className="pt-8 px-4 pb-4">
                                    <h4 className="font-bold text-gray-900 leading-tight">{supplier.name}</h4>
                                    <p className="text-xs text-gray-500 mb-2 truncate">{supplier.location}</p>
                                    
                                    <div className="flex items-center gap-1 text-xs font-bold text-gray-700 mb-3">
                                        <span className="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                            {supplier.rating} <StarIcon className="h-3 w-3" />
                                        </span>
                                        <span className="text-gray-400 font-normal">({supplier.reviews})</span>
                                    </div>

                                    <button 
                                        onClick={() => onViewSupplier(supplier)} 
                                        className="w-full bg-primary hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        Visit Store <ArrowRightIcon className="h-3 w-3"/>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}
            
            {/* Bottom Controls */}
            <div className="absolute bottom-6 right-6 z-30 flex flex-col gap-3">
                 <button className="bg-white p-3 rounded-full shadow-lg border border-gray-200 text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors">
                     <MapPinIcon className="h-6 w-6" />
                 </button>
                 <button className="bg-white p-3 rounded-full shadow-lg border border-gray-200 text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors">
                     <PaperAirplaneIcon className="h-6 w-6" />
                 </button>
            </div>

            <div className="absolute bottom-6 left-6 z-30">
                 <button className="bg-white px-4 py-2 rounded-full shadow-lg border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-50 flex items-center gap-2">
                     <ListBulletIcon className="h-5 w-5 text-gray-500" /> List View
                 </button>
            </div>
         </div>
    );
};

export default SupplierDirectoryMap;
