
import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useDataContext';
import { Supplier } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import { ArrowLeftIcon, StarIcon, BuildingStorefrontIcon, MapPinIcon, CheckBadgeIcon, PhoneIcon } from '@heroicons/react/24/solid';
import SupplierDirectoryMap from '../../components/SupplierDirectoryMap';
import EmptyState from '../../components/EmptyState';

interface SupplierDirectoryProps {
    onViewSupplier: (supplier: Supplier) => void;
    onBack: () => void;
}

const SupplierCard: React.FC<{ supplier: Supplier; onClick: () => void }> = ({ supplier, onClick }) => (
    <button 
        onClick={onClick} 
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left flex flex-col h-full group"
    >
        {/* Mock Cover Photo based on name hash or generic pattern */}
        <div className={`h-24 w-full bg-gradient-to-r ${supplier.id.charCodeAt(0) % 2 === 0 ? 'from-blue-600 to-indigo-600' : 'from-emerald-600 to-teal-600'} relative`}>
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>
        
        <div className="px-5 pb-5 flex-grow flex flex-col">
            <div className="-mt-10 mb-3 flex justify-between items-end">
                <img 
                    src={supplier.logoUrl} 
                    alt={supplier.name} 
                    className="w-20 h-20 rounded-xl border-4 border-white shadow-md object-cover bg-white" 
                />
                {supplier.verificationStatus === 'verified' && (
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-full border border-blue-100 flex items-center gap-1 mb-1">
                        <CheckBadgeIcon className="h-3 w-3" /> Verified
                    </span>
                )}
            </div>
            
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors line-clamp-1">{supplier.name}</h3>
            
            <div className="mt-2 space-y-2 flex-grow">
                <p className="text-sm text-gray-500 flex items-center gap-1.5">
                    <MapPinIcon className="h-4 w-4 text-gray-400 flex-shrink-0"/> 
                    <span className="truncate">{supplier.location}</span>
                </p>
                <div className="flex items-center gap-1 text-sm">
                    <StarIcon className="h-4 w-4 text-yellow-400 flex-shrink-0"/>
                    <span className="font-bold text-gray-900">{supplier.rating}</span>
                    <span className="text-gray-400">({supplier.reviews} reviews)</span>
                </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-50 w-full">
                <div className="flex flex-wrap gap-2">
                    {supplier.deliveryZones.slice(0, 2).map(zone => (
                        <span key={zone} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md truncate max-w-[100px]">
                            {zone}
                        </span>
                    ))}
                    {supplier.deliveryZones.length > 2 && (
                        <span className="text-[10px] bg-gray-50 text-gray-400 px-2 py-1 rounded-md">
                            +{supplier.deliveryZones.length - 2}
                        </span>
                    )}
                </div>
            </div>
        </div>
    </button>
);

const SupplierDirectory: React.FC<SupplierDirectoryProps> = ({ onViewSupplier, onBack }) => {
    const { suppliers, isLoading } = useData();
    const { t } = useLocalization();

    const [selectedCountry, setSelectedCountry] = useState<string>('All');
    const [activeMarker, setActiveMarker] = useState<Supplier | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

    const countries = useMemo(() => {
        const countrySet = new Set(suppliers.map(s => s.location.split(',').pop()?.trim()).filter(Boolean));
        return [t('allCountries'), ...Array.from(countrySet).sort()];
    }, [suppliers, t]);

    const filteredSuppliers = useMemo(() => {
        if (selectedCountry === t('allCountries') || selectedCountry === 'All') {
            return suppliers;
        }
        return suppliers.filter(s => s.location.endsWith(selectedCountry));
    }, [suppliers, selectedCountry, t]);

    return (
        <div className="h-full flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 flex-shrink-0">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
                        </button>
                    )}
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">{t('directoryTitle')}</h2>
                        <p className="text-gray-500 text-sm mt-1">{t('directoryDescription')}</p>
                    </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <select
                        id="country-filter"
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className="p-2.5 border-gray-300 border rounded-lg text-sm font-medium focus:ring-primary focus:border-primary bg-white shadow-sm"
                    >
                        {countries.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    
                    <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                         <button 
                            onClick={() => setViewMode('grid')}
                            className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Grid
                        </button>
                        <button 
                            onClick={() => setViewMode('map')}
                            className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${viewMode === 'map' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Map
                        </button>
                    </div>
                </div>
            </div>

            {filteredSuppliers.length === 0 ? (
                <EmptyState
                    icon={BuildingStorefrontIcon}
                    title="No Suppliers Found"
                    message="Try adjusting your location filter."
                />
            ) : (
                <div className="flex-grow overflow-hidden relative">
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto h-full pb-20 p-1">
                            {filteredSuppliers.map(supplier => (
                                <SupplierCard key={supplier.id} supplier={supplier} onClick={() => onViewSupplier(supplier)} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full min-h-[500px] overflow-hidden">
                             <SupplierDirectoryMap 
                                suppliers={filteredSuppliers}
                                activeMarker={activeMarker}
                                onMarkerHover={setActiveMarker}
                                onViewSupplier={onViewSupplier}
                             />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SupplierDirectory;
