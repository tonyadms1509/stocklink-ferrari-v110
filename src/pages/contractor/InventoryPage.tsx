import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useDataContext';
import { useLocalization } from '../../hooks/useLocalization';
import { ContractorAsset, ContractorStock } from '../../types';
import { 
    WrenchScrewdriverIcon, 
    CubeIcon, 
    PlusIcon, 
    MagnifyingGlassIcon, 
    ArrowLeftIcon, 
    MapPinIcon, 
    QrCodeIcon, 
    CameraIcon,
    PencilIcon,
    TrashIcon,
    ArrowRightIcon,
    ShieldCheckIcon,
    BoltIcon,
    ArchiveBoxIcon
} from '@heroicons/react/24/solid';
import AssetFormModal from '../../components/AssetFormModal';
import TransferModal from '../../components/TransferModal';
import EmptyState from '../../components/EmptyState';
import AssetQRModal from '../../components/AssetQRModal';
import AssetScannerModal from '../../components/AssetScannerModal';

const AssetCard: React.FC<{ asset: ContractorAsset; onEdit: () => void; onTransfer: () => void; onShowQR: () => void }> = ({ asset, onEdit, onTransfer, onShowQR }) => {
    const statusColors = {
        'Available': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        'In Use': 'bg-blue-600/10 text-blue-400 border-blue-600/20',
        'Maintenance': 'bg-amber-600/10 text-amber-400 border-amber-600/20',
    };

    return (
        <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-8 hover:border-blue-500/30 transition-all duration-500 group relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-carbon opacity-5 group-hover:opacity-10"></div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/5 bg-black/40">
                            <img src={asset.imageUrl || 'https://picsum.photos/seed/tool/200'} alt={asset.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                        </div>
                        <button 
                            onClick={onShowQR}
                            className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-xl shadow-2xl shadow-blue-900/40 border border-white/10 hover:bg-blue-500 transition-colors"
                        >
                            <QrCodeIcon className="h-4 w-4"/>
                        </button>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-inner ${statusColors[asset.status as keyof typeof statusColors]}`}>
                        {asset.status}
                    </span>
                </div>

                <div className="space-y-1 mb-6">
                    <h3 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">{asset.name}</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{asset.category}</p>
                </div>

                <div className="flex items-center gap-3 p-3 bg-black/40 rounded-2xl border border-white/5 mb-8">
                    <div className="p-2 bg-blue-600/10 rounded-lg">
                        <MapPinIcon className="h-4 w-4 text-blue-500"/>
                    </div>
                    <div className="min-w-0">
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Location</p>
                        <p className="text-xs font-bold text-slate-300 truncate uppercase tracking-tight">{asset.locationName}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex gap-4">
                        <button onClick={onEdit} className="text-slate-500 hover:text-white transition-colors">
                            <PencilIcon className="h-5 w-5"/>
                        </button>
                        <button className="text-slate-500 hover:text-red-500 transition-colors">
                            <TrashIcon className="h-5 w-5"/>
                        </button>
                    </div>
                    <button 
                        onClick={onTransfer}
                        className="bg-white text-slate-950 font-black py-2.5 px-6 rounded-xl text-[10px] uppercase tracking-widest shadow-xl transform active:scale-95 transition-all flex items-center gap-2"
                    >
                        Deploy Unit <ArrowRightIcon className="h-4 w-4 text-blue-600"/>
                    </button>
                </div>
            </div>
        </div>
    );
};

const InventoryPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const { t } = useLocalization();
    const { contractorAssets, contractorStock, addAsset, updateAsset } = useData();
    const [activeTab, setActiveTab] = useState<'assets' | 'stock'>('assets');
    const [searchTerm, setSearchTerm] = useState('');
    
    const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<ContractorAsset | null>(null);
    const [transferItem, setTransferItem] = useState<ContractorAsset | null>(null);
    const [qrAsset, setQrAsset] = useState<ContractorAsset | null>(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    const filteredAssets = useMemo(() => 
        contractorAssets.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.category.toLowerCase().includes(searchTerm.toLowerCase())),
    [contractorAssets, searchTerm]);

    const handleSaveAsset = (assetData: any) => {
        if (editingAsset) {
            updateAsset(editingAsset.id, assetData);
        } else {
            addAsset(assetData);
        }
        setIsAssetModalOpen(false);
        setEditingAsset(null);
    };

    const handleOpenEdit = (asset: ContractorAsset) => {
        setEditingAsset(asset);
        setIsAssetModalOpen(true);
    };

    return (
        <div className="pb-20 max-w-7xl mx-auto space-y-12 font-sans selection:bg-blue-500/30">
            {/* Tactical Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-10 border-b border-slate-200 pb-10">
                <div>
                    <div className="flex items-center gap-3 mb-2 text-blue-600">
                         <ArchiveBoxIcon className="h-6 w-6 animate-pulse" />
                         <span className="text-[10px] font-black uppercase tracking-[0.4em]">Resource Registry Core v42.1</span>
                    </div>
                    <h1 className="text-7xl font-black tracking-tighter italic uppercase text-slate-900 leading-none">THE <span className="text-blue-600">ASSETS</span></h1>
                    <p className="text-slate-500 mt-4 font-mono text-sm tracking-widest uppercase">National Inventory & Equipment Telemetry Grid</p>
                </div>
                
                <div className="flex gap-4 w-full md:w-auto">
                    <button 
                        onClick={() => setIsScannerOpen(true)}
                        className="flex-1 md:flex-none bg-slate-900 hover:bg-black text-white font-black py-5 px-10 rounded-3xl shadow-2xl transition-all flex items-center justify-center gap-4 transform active:scale-95 uppercase text-[10px] tracking-widest border border-white/5"
                    >
                        <CameraIcon className="h-5 w-5 text-blue-400" />
                        Initialize Terminal
                    </button>
                    <button 
                        onClick={() => { setEditingAsset(null); setIsAssetModalOpen(true); }}
                        className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-500 text-white font-black py-5 px-10 rounded-3xl shadow-2xl transition-all flex items-center justify-center gap-4 transform active:scale-95 uppercase text-[10px] tracking-widest border border-white/10"
                    >
                        <PlusIcon className="h-5 w-5" />
                        Provision Asset
                    </button>
                </div>
            </div>

            {/* Tactical Filters */}
            <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="relative flex-grow w-full">
                    <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search Grid Nodes (Tools, Equipment, Surplus)..."
                        className="w-full p-6 pl-16 bg-white border border-slate-200 rounded-[2rem] text-lg font-bold shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                    />
                </div>
                <div className="flex bg-slate-100 p-1.5 rounded-[2rem] border border-slate-200 shadow-inner min-w-[280px]">
                    <button 
                        onClick={() => setActiveTab('assets')}
                        className={`flex-1 py-4 px-8 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'assets' ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Active Assets
                    </button>
                    <button 
                        onClick={() => setActiveTab('stock')}
                        className={`flex-1 py-4 px-8 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'stock' ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Surplus Stock
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {activeTab === 'assets' ? (
                    filteredAssets.length > 0 ? (
                        filteredAssets.map(asset => (
                            <AssetCard 
                                key={asset.id} 
                                asset={asset} 
                                onEdit={() => handleOpenEdit(asset)}
                                onTransfer={() => setTransferItem(asset)}
                                onShowQR={() => setQrAsset(asset)}
                            />
                        ))
                    ) : (
                        <div className="col-span-full">
                            <EmptyState icon={WrenchScrewdriverIcon} title="GRID EMPTY" message="Initialize your tool registry to begin tracking regional unit deployment." />
                        </div>
                    )
                ) : (
                    contractorStock.length > 0 ? (
                        contractorStock.map(stock => (
                            <div key={stock.id} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm group hover:shadow-xl transition-all duration-500">
                                <div className="flex justify-between items-start mb-6">
                                     <div className="p-4 bg-emerald-500/10 rounded-2xl shadow-inner">
                                        <CubeIcon className="h-8 w-8 text-emerald-600"/>
                                    </div>
                                    <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">Surplus</span>
                                </div>
                                <h4 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase">{stock.itemName}</h4>
                                <p className="text-3xl font-black text-blue-600 mt-2 tracking-tighter">{stock.quantity} <span className="text-sm font-bold text-slate-400 uppercase">{stock.unit}</span></p>
                                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg"><MapPinIcon className="h-4 w-4 text-slate-400"/></div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stock.locationName}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full">
                            <EmptyState icon={CubeIcon} title="NO SURPLUS" message="Unused material registries are currently empty. Synchronize with Site Diary to identify excess stock." />
                        </div>
                    )
                )}
            </div>

            {/* Watermark */}
            <div className="fixed bottom-10 left-10 pointer-events-none opacity-5 -z-10 rotate-90 select-none">
                <span className="text-[140px] font-black tracking-tighter text-slate-100 uppercase italic">RESOURCE GRID</span>
            </div>

            {isAssetModalOpen && <AssetFormModal asset={editingAsset} onClose={() => setIsAssetModalOpen(false)} onSave={handleSaveAsset} />}
            {transferItem && <TransferModal asset={transferItem} onClose={() => setTransferItem(null)} onTransfer={updateAsset} />}
            {qrAsset && <AssetQRModal asset={qrAsset} onClose={() => setQrAsset(null)} />}
            {isScannerOpen && <AssetScannerModal onClose={() => setIsScannerOpen(false)} />}
        </div>
    );
};

export default InventoryPage;