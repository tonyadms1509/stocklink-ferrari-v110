
import React, { useState, useEffect } from 'react';
import { useData } from '../../hooks/useDataContext';
import { useAuth } from '../../hooks/useAuth';
import { Supplier } from '../../types';
import { 
    ShieldCheckIcon, TruckIcon, MapPinIcon, 
    PhoneIcon, EnvelopeIcon, PencilIcon, 
    GlobeAltIcon, BuildingOffice2Icon,
    XMarkIcon, BoltIcon, UserGroupIcon
} from '@heroicons/react/24/solid';
import { useLocalization } from '../../hooks/useLocalization';
import { useToast } from '../../hooks/useToast';
import BusinessVerification from '../../components/BusinessVerification';

const FleetUnitItem: React.FC<{ label: string; count: number; onIncrement: () => void; onDecrement: () => void; isEditing: boolean }> = ({ label, count, onIncrement, onDecrement, isEditing }) => (
    <div className="flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-3xl group hover:bg-white/10 transition-all text-left">
        <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-3xl font-black text-white italic tracking-tighter">{count} <span className="text-[10px] text-slate-600 not-italic uppercase">Units</span></p>
        </div>
        {isEditing && (
            <div className="flex items-center gap-3">
                <button type="button" onClick={onDecrement} className="w-10 h-10 rounded-xl bg-slate-800 text-white font-black flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg">-</button>
                <button type="button" onClick={onIncrement} className="w-10 h-10 rounded-xl bg-slate-800 text-white font-black flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg">+</button>
            </div>
        )}
    </div>
);

const ProfileInput: React.FC<{label: string, value: string | undefined, isEditing: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, name: string, icon?: React.ElementType}> = 
({label, value, isEditing, onChange, name, icon: Icon}) => {
    return (
        <div className="text-left">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{label}</label>
            <div className="relative">
                {Icon && <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Icon className="h-5 w-5 text-slate-300"/></div>}
                <input 
                    type="text" 
                    value={value || ''} 
                    onChange={onChange}
                    name={name}
                    readOnly={!isEditing} 
                    className={`block w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-4 border-2 rounded-2xl text-sm transition-all ${!isEditing ? 'bg-slate-50 border-slate-100 text-slate-600' : 'bg-white border-blue-100 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-900 font-bold'}`}
                />
            </div>
        </div>
    )
}

const LogisticsProfile: React.FC = () => {
    const { currentCompany } = useAuth();
    const { updateSupplierProfile } = useData();
    const { showToast } = useToast();
    const [isEditMode, setIsEditMode] = useState(false);
    
    const [formData, setFormData] = useState<any>(null);

    useEffect(() => {
        if (currentCompany) {
            setFormData({
                ...currentCompany,
                fleetComposition: (currentCompany as any).fleetComposition || {
                    bakkie1T: 5,
                    truck3T: 2,
                    truck8T: 1,
                    flatbed: 0
                }
            });
        }
    }, [currentCompany]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: string, subfield?: string) => {
        const { value } = e.target;
        setFormData((prev: any) => {
            if (subfield) {
                return { ...prev, [field]: { ...prev[field], [subfield]: value } };
            }
            return { ...prev, [field]: value };
        });
    };

    const handleFleetChange = (type: string, delta: number) => {
        setFormData((prev: any) => ({
            ...prev,
            fleetComposition: {
                ...prev.fleetComposition,
                [type]: Math.max(0, prev.fleetComposition[type] + delta)
            }
        }));
    };

    const handleSave = () => {
        updateSupplierProfile(formData);
        setIsEditMode(false);
        showToast("Fleet Dossier Synchronized", "success");
    };

    if (!formData) return null;

    return (
        <div className="animate-fade-in space-y-12 pb-20 font-sans">
            {/* Dossier Header */}
            <div className="bg-slate-900 rounded-[3.5rem] shadow-2xl overflow-hidden border border-white/5 relative">
                <div className="absolute inset-0 bg-carbon opacity-10"></div>
                <div className="h-48 bg-slate-950 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-transparent"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-px bg-cyan-500/20 blur-xl"></div>
                </div>
                
                <div className="px-12 pb-12 relative z-10">
                    <div className="flex flex-col lg:flex-row items-start lg:items-end -mt-24 mb-8 gap-10">
                        <div className="rounded-[2.5rem] p-2 bg-slate-900 border-4 border-slate-950 shadow-2xl overflow-hidden">
                            <img 
                                src={formData.logoUrl || `https://ui-avatars.com/api/?name=${formData.name}&background=06B6D4&color=fff&size=256`} 
                                alt="Logo" 
                                className="w-44 h-44 rounded-[2rem] object-cover bg-slate-800"
                            />
                        </div>
                        
                        <div className="flex-grow pb-2 text-left">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex items-center gap-2 px-3 py-1 bg-cyan-600/10 border border-cyan-500/20 rounded-lg">
                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
                                    <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Fleet Node Active</span>
                                </div>
                            </div>
                            <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic leading-none">{formData.name}</h1>
                            <p className="text-slate-400 font-bold flex items-center gap-2 uppercase tracking-widest text-xs mt-4">
                                <MapPinIcon className="h-4 w-4 text-cyan-500"/> {formData.location || 'Regional Sector Alpha'}
                            </p>
                        </div>

                        <div className="flex gap-4 w-full lg:w-auto">
                            {!isEditMode ? (
                                <button onClick={() => setIsEditMode(true)} className="flex-1 lg:flex-none bg-white text-slate-950 font-black py-5 px-12 rounded-3xl shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95 uppercase tracking-widest text-[10px] border-4 border-slate-900">
                                    Edit Dispatch Specs
                                </button>
                            ) : (
                                <div className="flex gap-4 w-full">
                                    <button onClick={() => setIsEditMode(false)} className="flex-1 bg-white/5 text-slate-500 font-black py-4 px-10 rounded-3xl uppercase tracking-widest text-[10px]">Abort</button>
                                    <button onClick={handleSave} className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-black py-4 px-14 rounded-3xl shadow-2xl uppercase tracking-widest text-[10px]">Commit Handshake</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                <div className="lg:col-span-8 space-y-12">
                    {/* General Info */}
                    <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-200">
                        <h3 className="text-2xl font-black text-slate-900 mb-10 pb-6 border-b border-slate-100 flex items-center gap-4 italic uppercase tracking-tighter text-left">
                            <BuildingOffice2Icon className="h-8 w-8 text-cyan-600"/>
                            Identity <span className="text-cyan-600">Schematic</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <ProfileInput label="Company Name" value={formData.name} name="name" onChange={(e) => handleChange(e, 'name')} isEditing={isEditMode} icon={BuildingOffice2Icon} />
                            <ProfileInput label="Operational Base" value={formData.location} name="location" onChange={(e) => handleChange(e, 'location')} isEditing={isEditMode} icon={MapPinIcon} />
                            <ProfileInput label="Dispatch Pulse (Phone)" value={formData?.contact?.phone} name="phone" onChange={(e) => handleChange(e, 'contact', 'phone')} isEditing={isEditMode} icon={PhoneIcon} />
                            <ProfileInput label="Control Packet (Email)" value={formData?.contact?.email} name="email" onChange={(e) => handleChange(e, 'contact', 'email')} isEditing={isEditMode} icon={EnvelopeIcon} />
                        </div>
                    </div>

                    {/* Fleet Composition */}
                    <div className="bg-slate-900 rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden border border-white/5">
                        <div className="absolute inset-0 bg-carbon opacity-10"></div>
                        <h3 className="text-2xl font-black text-white mb-10 pb-6 border-b border-white/5 flex items-center gap-4 italic uppercase tracking-tighter relative z-10 text-left">
                            <TruckIcon className="h-8 w-8 text-cyan-500"/>
                            Active <span className="text-cyan-500">Fleet Units</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <FleetUnitItem label="1-Ton Bakkie" count={formData.fleetComposition.bakkie1T} onIncrement={() => handleFleetChange('bakkie1T', 1)} onDecrement={() => handleFleetChange('bakkie1T', -1)} isEditing={isEditMode} />
                            <FleetUnitItem label="3-Ton Truck" count={formData.fleetComposition.truck3T} onIncrement={() => handleFleetChange('truck3T', 1)} onDecrement={() => handleFleetChange('truck3T', -1)} isEditing={isEditMode} />
                            <FleetUnitItem label="8-Ton Truck" count={formData.fleetComposition.truck8T} onIncrement={() => handleFleetChange('truck8T', 1)} onDecrement={() => handleFleetChange('truck8T', -1)} isEditing={isEditMode} />
                            <FleetUnitItem label="Flatbed Trailer" count={formData.fleetComposition.flatbed} onIncrement={() => handleFleetChange('flatbed', 1)} onDecrement={() => handleFleetChange('flatbed', -1)} isEditing={isEditMode} />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-12">
                    {/* Compliance Dashboard */}
                    <div className="bg-slate-900 border border-white/5 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden text-left">
                        <h3 className="text-xl font-black italic uppercase tracking-tighter text-white mb-8 flex items-center gap-3">
                            <ShieldCheckIcon className="h-6 w-6 text-cyan-500" />
                            Assurance <span className="text-cyan-500">Grid</span>
                        </h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">GIT Insurance</p>
                                    <p className="text-sm font-black text-emerald-400 uppercase italic">ACTIVE & VERIFIED</p>
                                </div>
                                <ShieldCheckIcon className="h-8 w-8 text-emerald-500" />
                            </div>
                            <div className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">PDP Synchronization</p>
                                    <p className="text-sm font-black text-cyan-400 uppercase italic">COMPLIANT</p>
                                </div>
                                <UserGroupIcon className="h-8 w-8 text-cyan-500" />
                            </div>
                        </div>
                        <button className="w-full mt-10 py-5 bg-white/5 hover:bg-white/10 text-white font-black rounded-3xl text-[9px] uppercase tracking-[0.3em] transition-all border border-white/10 transform active:scale-95 shadow-xl">Uplink Compliance Certs</button>
                    </div>

                    {/* Regional Service Area */}
                    <div className="bg-cyan-600 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden group border border-white/10 text-left">
                         <div className="absolute top-0 right-0 p-8 opacity-20 transform -rotate-12 group-hover:scale-110 transition-transform duration-1000">
                             <GlobeAltIcon className="h-48 w-48" />
                         </div>
                         <p className="text-[10px] font-black uppercase tracking-[0.5em] mb-4 opacity-70">Grid Coverage</p>
                         <h4 className="text-3xl font-black italic leading-tight uppercase tracking-tighter">Gauteng Core <br/> Sector established.</h4>
                         <p className="text-xs text-blue-100 mt-6 font-medium leading-relaxed italic">"Optimal node reach identified for the Midrand-Centurion corridor. Receive high-fidelity load requests automatically."</p>
                         <div className="mt-12 flex items-center gap-3">
                             <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_15px_emerald]"></div>
                             <span className="text-[10px] font-black uppercase tracking-widest font-mono">NODE SYNC: ACTIVE</span>
                         </div>
                    </div>
                </div>
            </div>
            
            {/* Absolute Watermark */}
            <div className="fixed bottom-10 left-10 pointer-events-none opacity-5 -z-10 rotate-90 select-none">
                <span className="text-[140px] font-black tracking-tighter text-white uppercase italic leading-none">FLEET DOSSIER</span>
            </div>
        </div>
    );
};

export default LogisticsProfile;
