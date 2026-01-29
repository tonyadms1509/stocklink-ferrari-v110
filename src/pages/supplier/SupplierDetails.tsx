
import React from 'react';
import { Supplier } from '../../types';
import { ArrowLeftIcon, PhoneIcon, EnvelopeIcon, ClockIcon, StarIcon, ChatBubbleLeftRightIcon, GlobeAltIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import { useLocalization } from '../../hooks/useLocalization';

interface SupplierDetailsProps {
  supplier: Supplier;
  onBack: () => void;
  onStartChat: (supplierId: string, context?: { productId: string }) => void;
}

const SupplierDetails: React.FC<SupplierDetailsProps> = ({ supplier, onBack, onStartChat }) => {
  const { t } = useLocalization();

  const handleWhatsAppClick = () => {
      if (!supplier.contact?.whatsapp) return;
      // Clean number: remove spaces, plus, brackets for South African format
      const cleanNumber = supplier.contact.whatsapp.replace(/\D/g, '');
      // Ensure country code 27 is present
      const formattedNumber = cleanNumber.startsWith('27') ? cleanNumber : `27${cleanNumber.startsWith('0') ? cleanNumber.slice(1) : cleanNumber}`;
      const url = `https://wa.me/${formattedNumber}?text=Hi%20${encodeURIComponent(supplier.name)},%20I'm%20contacting%20you%20from%20StockLink.`;
      window.open(url, '_blank');
  };

  return (
    <div className="animate-fade-in-up bg-slate-950 p-8 rounded-[3rem] min-h-[80vh] border border-white/5 text-slate-200">
        <button onClick={onBack} className="flex items-center text-sm text-blue-500 hover:text-white mb-8 font-black uppercase tracking-widest transition-colors">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            {t('backToHome')}
        </button>

        <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-1/3 text-center">
                <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-blue-600 rounded-full blur-2xl opacity-20"></div>
                    <img src={supplier.logoUrl} alt={supplier.name} className="w-48 h-48 object-cover rounded-full mx-auto relative z-10 border-8 border-slate-900 shadow-2xl"/>
                </div>
                <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">{supplier.name}</h1>
                <p className="text-slate-500 font-bold uppercase tracking-widest mt-2">{supplier.location}</p>
                
                {supplier.compliance?.beeLevel && (
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600/10 text-blue-400 text-[10px] font-black rounded-full border border-blue-500/20 mt-6 uppercase tracking-widest italic">
                        <ShieldCheckIcon className="h-4 w-4"/>
                        BEE Level {supplier.compliance.beeLevel}
                    </div>
                )}

                <div className="flex justify-center items-center mt-6 mb-10">
                    <StarIcon className="h-5 w-5 text-yellow-400" />
                    <span className="ml-1 font-black text-white text-lg">{supplier.rating}</span>
                    <span className="ml-2 text-slate-500 font-bold">({supplier.reviews} reviews)</span>
                </div>

                <div className="space-y-4 max-w-xs mx-auto">
                    <button 
                        onClick={() => onStartChat(supplier.id)} 
                        className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-blue-500 flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-2xl shadow-blue-900/50 uppercase tracking-widest text-xs"
                    >
                        <ChatBubbleLeftRightIcon className="h-5 w-5"/>
                        Uplink Comms
                    </button>
                    
                    {supplier.contact?.whatsapp && (
                        <button 
                            onClick={handleWhatsAppClick}
                            className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl hover:bg-emerald-500 flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-2xl shadow-blue-900/50 uppercase tracking-widest text-xs"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.31 3.4 16.78L2.03 21.96L7.33 20.61C8.75 21.36 10.35 21.81 12.04 21.81C17.5 21.81 21.95 17.36 21.95 11.9C21.95 6.45 17.5 2 12.04 2ZM17.94 15.11C17.75 15.62 16.59 16.21 16.03 16.26C15.48 16.31 14.88 16.34 14.53 16.16C14.18 15.98 13.3 15.51 12.28 14.58C11.02 13.42 10.26 12.11 10.08 11.76C9.9 11.41 10.16 11.19 10.33 11.01C10.48 10.86 10.65 10.64 10.83 10.44C11.01 10.23 11.08 10.09 11.23 9.81C11.38 9.53 11.31 9.3 11.22 9.12C11.13 8.94 10.56 7.53 10.33 6.96C10.1 6.39 9.87 6.48 9.7 6.47C9.54 6.46 9.34 6.46 9.15 6.46C8.96 6.46 8.68 6.53 8.44 6.75C8.2 6.97 7.55 7.55 7.55 8.71C7.55 9.87 8.45 10.99 8.59 11.17C8.73 11.35 10.03 13.52 12.19 14.41C14.34 15.29 14.88 15.06 15.26 15.01C15.64 14.96 16.75 14.36 16.97 13.8C17.19 13.23 17.19 12.78 17.1 12.65C17.01 12.51 16.82 12.42 16.57 12.33C16.32 12.24 15.14 11.67 14.91 11.59C14.68 11.51 14.53 11.47 14.38 11.72C14.23 11.96 13.84 12.43 13.7 12.58C13.56 12.72 13.41 12.76 13.17 12.67C12.92 12.58 12.01 12.26 10.9 11.28C10.01 10.51 9.42 9.61 9.27 9.36C9.12 9.12 9.26 8.96 9.4 8.83C9.53 8.71 9.68 8.52 9.82 8.35C9.97 8.18 10.04 8.06 10.13 7.9C10.22 7.74 10.18 7.6 10.11 7.51C10.04 7.42 9.49 6.07 9.29 5.58C9.09 5.09 8.89 5.16 8.73 5.15H8.73Z"></path></svg>
                            Direct WhatsApp
                        </button>
                    )}
                </div>
            </div>
            
            <div className="lg:w-2/3 space-y-12">
                <div>
                    <h2 className="text-xl font-black italic uppercase tracking-widest border-b border-white/10 pb-4 mb-8 text-blue-400">Node Vitals</h2>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <li className="flex items-center gap-4 bg-white/5 p-5 rounded-3xl border border-white/5 group hover:bg-white/10 transition-colors">
                            <div className="p-3 bg-slate-800 rounded-2xl"><PhoneIcon className="h-5 w-5 text-slate-400 group-hover:text-blue-400"/></div>
                            <span className="font-mono text-sm">{supplier.contact?.phone || 'N/A'}</span>
                        </li>
                        <li className="flex items-center gap-4 bg-white/5 p-5 rounded-3xl border border-white/5 group hover:bg-white/10 transition-colors">
                            <div className="p-3 bg-slate-800 rounded-2xl"><EnvelopeIcon className="h-5 w-5 text-slate-400 group-hover:text-blue-400"/></div>
                            <span className="font-mono text-sm">{supplier.contact?.email || 'N/A'}</span>
                        </li>
                        {supplier.contact?.website && (
                            <li className="flex items-center gap-4 bg-white/5 p-5 rounded-3xl border border-white/5 group hover:bg-white/10 transition-colors sm:col-span-2">
                                <div className="p-3 bg-slate-800 rounded-2xl"><GlobeAltIcon className="h-5 w-5 text-slate-400 group-hover:text-blue-400"/></div>
                                <a href={`//${supplier.contact.website.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-400 font-black uppercase tracking-widest text-sm">
                                    {supplier.contact.website}
                                </a>
                            </li>
                        )}
                    </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-xl font-black italic uppercase tracking-widest border-b border-white/10 pb-4 mb-6 text-blue-400">Dispatch Grid</h2>
                        <ul className="space-y-4">
                            <li className="flex justify-between items-center text-sm"><span className="text-slate-500 font-bold uppercase">Weekdays:</span> <span className="font-mono text-white">{supplier.businessHours?.weekdays || '08:00 - 17:00'}</span></li>
                            <li className="flex justify-between items-center text-sm"><span className="text-slate-500 font-bold uppercase">Saturday:</span> <span className="font-mono text-white">{supplier.businessHours?.saturday || 'Closed'}</span></li>
                            <li className="flex justify-between items-center text-sm"><span className="text-slate-500 font-bold uppercase">Sunday:</span> <span className="font-mono text-white">{supplier.businessHours?.sunday || 'Closed'}</span></li>
                        </ul>
                    </div>
                    
                    <div>
                        <h2 className="text-xl font-black italic uppercase tracking-widest border-b border-white/10 pb-4 mb-6 text-blue-400">Verified Zones</h2>
                        <div className="flex flex-wrap gap-3">
                            {supplier.deliveryZones?.map(zone => (
                                <span key={zone} className="bg-white/5 text-slate-300 text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-white/5 group-hover:border-blue-500/50 transition-all">{zone}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default SupplierDetails;
