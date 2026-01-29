
import React, { useState, useMemo } from 'react';
import { 
  Truck, Search, MapPin, ShieldCheck, 
  Phone, MessageSquare, Globe, ArrowRight,
  Star, Activity
} from 'lucide-react';
import { useData } from '../../hooks/useDataContext';
import { useLocalization } from '../../hooks/useLocalization';
import EmptyState from '../../components/EmptyState';

const FleetUnitCard: React.FC<{ company: any }> = ({ company }) => {
    const handleWhatsApp = () => {
        const num = company.contact?.whatsapp || company.contact?.phone || '27115550123';
        window.open(`https://wa.me/${num.replace(/\D/g, '')}`, '_blank');
    };

    return (
        <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-8 hover:border-cyan-500/30 transition-all duration-500 group relative overflow-hidden shadow-xl text-left">
            <div className="absolute inset-0 bg-carbon opacity-5 group-hover:opacity-10"></div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/5 bg-slate-800">
                            <img 
                                src={company.logoUrl || `https://ui-avatars.com/api/?name=${company.name}&background=06B6D4&color=fff&size=128`} 
                                alt={company.name} 
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                            />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-cyan-600 text-white p-1.5 rounded-lg shadow-xl">
                            <ShieldCheck size={14}/>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full border border-white/10 text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2">
                             <Star size={10} className="fill-current" /> {company.rating || '5.0'}
                        </div>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Fleet ID: {company.id.slice(0,6).toUpperCase()}</span>
                    </div>
                </div>

                <div className="space-y-1 mb-8">
                    <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none group-hover:text-cyan-400 transition-colors">{company.name}</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2 mt-2">
                        <MapPin size={12} className="text-cyan-600"/> {company.location || 'Regional Sector'}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Fleet</p>
                        <p className="text-sm font-bold text-slate-300">Verified Carrier</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Insurance</p>
                        <p className="text-sm font-bold text-emerald-400 italic font-mono uppercase">GIT_SECURE</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={handleWhatsApp}
                        className="flex-1 bg-white text-slate-950 font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl transform active:scale-95 transition-all flex items-center justify-center gap-2 border-4 border-slate-900"
                    >
                        <MessageSquare size={14} className="text-cyan-600"/>
                        Comm Uplink
                    </button>
                    <a 
                        href={`tel:${company.contact?.phone}`}
                        className="p-4 bg-slate-800 text-slate-400 hover:text-white rounded-2xl border border-white/5 transition-all"
                    >
                        <Phone size={18}/>
                    </a>
                </div>
            </div>
        </div>
    );
};

const LogisticsDirectory: React.FC = () => {
    const { companies } = useData();
    const [searchTerm, setSearchTerm] = useState('');

    const logisticsCompanies = useMemo(() => {
        return (companies || []).filter(c => 
            c.type === 'logistics' && 
            (c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             c.location?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [companies, searchTerm]);

    return (
        <div className="space-y-12 animate-fade-in font-sans">
            <div className="flex flex-col md:flex-row justify-between items-end gap-10 border-b border-white/5 pb-12">
                <div className="text-left">
                    <div className="flex items-center gap-3 mb-4">
                        <Globe className="h-6 w-6 text-cyan-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-400">National Fleet Registry v80.5</span>
                    </div>
                    <h1 className="text-7xl font-black tracking-tighter italic uppercase text-white leading-none">FLEET <span className="text-cyan-500">HUB</span></h1>
                    <p className="text-slate-500 mt-4 font-mono text-sm tracking-widest uppercase">Direct Dispatch Uplink to Verified South African Transport Nodes</p>
                </div>
                
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search Sector or Unit Name..."
                        className="w-full p-5 pl-14 bg-slate-900 border border-white/5 rounded-[2rem] text-sm font-bold text-white outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-700 shadow-2xl"
                    />
                </div>
            </div>

            {logisticsCompanies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                    {logisticsCompanies.map(company => (
                        <FleetUnitCard key={company.id} company={company} />
                    ))}
                </div>
            ) : (
                <div className="col-span-full">
                    <EmptyState 
                        icon={Truck} 
                        title="GRID SEARCH EMPTY" 
                        message="Neural Core could not locate verified transport nodes matching your search parameters." 
                    />
                </div>
            )}
        </div>
    );
};

export default LogisticsDirectory;
