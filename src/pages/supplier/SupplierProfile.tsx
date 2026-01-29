
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../hooks/useDataContext';
import { useAuth } from '../../hooks/useAuth';
import { Supplier, PayoutDetails, SystemStatus } from '../../types';
import { 
    ExclamationTriangleIcon, BanknotesIcon, XMarkIcon, PencilIcon, 
    GlobeAltIcon, QrCodeIcon, ArrowPathIcon, BuildingStorefrontIcon, 
    ClockIcon, MapPinIcon, EnvelopeIcon, PhoneIcon, 
    ArrowPathRoundedSquareIcon, ShieldCheckIcon, RocketLaunchIcon,
    ServerIcon, CheckCircleIcon
} from '@heroicons/react/24/solid';
import { useLocalization } from '../../hooks/useLocalization';
import { useToast } from '../../hooks/useToast';
import BusinessVerification from '../../components/BusinessVerification';

const PayoutSettingsModal: React.FC<{ supplier: Supplier, onSave: (payoutDetails: PayoutDetails) => void, onClose: () => void }> = ({ supplier, onSave, onClose }) => {
    const { t } = useLocalization();
    const [details, setDetails] = useState<PayoutDetails>(supplier.payoutDetails || {
        bankName: '',
        accountHolderName: '',
        accountNumber: '',
        branchCode: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDetails(prev => ({ ...prev, [name]: value }));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(details);
    }
    
    return (
        <div className="fixed inset-0 bg-slate-950 bg-opacity-90 flex items-center justify-center z-[100] p-4 backdrop-blur-md">
            <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-lg w-full animate-fade-in-scale border border-white/20">
                <div className="flex justify-between items-center mb-8 text-left">
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">Settlement <span className="text-blue-600">Terminal</span></h2>
                     <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XMarkIcon className="h-6 w-6"/>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="text-left">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Clearing Bank</label>
                        <input type="text" name="bankName" value={details.bankName} onChange={handleChange} className="w-full p-4 border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none font-bold" required />
                    </div>
                     <div className="text-left">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Account Holder</label>
                        <input type="text" name="accountHolderName" value={details.accountHolderName} onChange={handleChange} className="w-full p-4 border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none font-bold" required />
                    </div>
                     <div className="grid grid-cols-2 gap-4 text-left">
                         <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Account Number</label>
                            <input type="text" name="accountNumber" value={details.accountNumber} onChange={handleChange} className="w-full p-4 border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none font-mono font-bold" required />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Branch Code</label>
                            <input type="text" name="branchCode" value={details.branchCode} onChange={handleChange} className="w-full p-4 border-2 border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none font-mono font-bold" required />
                        </div>
                     </div>
                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                        <button type="button" onClick={onClose} className="bg-slate-50 hover:bg-slate-100 text-slate-500 font-black py-4 px-8 rounded-2xl transition-all uppercase tracking-widest text-[10px]">Cancel</button>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-10 rounded-2xl shadow-xl transition-all transform hover:-translate-y-0.5 uppercase tracking-widest text-[10px]">Commit Settings</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

const ProfileInput: React.FC<{label: string, value: string | undefined, isEditing: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, name: string, type?: string, icon?: React.ElementType}> = 
({label, value, isEditing, onChange, name, type = 'text', icon: Icon}) => {
    return (
        <div className="text-left">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{label}</label>
            <div className="relative">
                {Icon && <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Icon className="h-5 w-5 text-slate-300"/></div>}
                <input 
                    type={type} 
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

const SupplierProfile: React.FC = () => {
  const { suppliers, updateSupplierProfile, systemStatus, launchSystem, isLoading: isDataLoading } = useData();
  const { currentCompany } = useAuth();
  const { t } = useLocalization();
  const { showToast } = useToast();
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const currentSupplier = useMemo(() => {
      const found = (suppliers || []).find(s => s.id === currentCompany?.id);
      if (!found && currentCompany) {
          return currentCompany as Supplier;
      }
      return found;
  }, [suppliers, currentCompany]);

  const [formData, setFormData] = useState<Supplier | null>(null);
  
  const publicUrl = `${window.location.origin}/#/supplier/${currentCompany?.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicUrl)}`;

  useEffect(() => {
    if (currentSupplier) {
      const sanitized: Supplier = {
          ...currentSupplier,
          contact: currentSupplier.contact || { phone: '', email: '', website: '', whatsapp: '' },
          businessHours: currentSupplier.businessHours || { weekdays: '08:00 - 17:00', saturday: 'Closed', sunday: 'Closed' }
      };
      setFormData(sanitized);
    }
  }, [currentSupplier]);
  
  const handleResetHub = () => {
      if (confirm("Execute Terminal Reset? This will recalibrate your grid session.")) {
          sessionStorage.clear();
          window.location.reload();
      }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Supplier, subfield?: string) => {
    const { value } = e.target;
    setFormData(prev => {
        if (!prev) return null;
        if (subfield && (field === 'contact' || field === 'businessHours')) {
            const fieldData = (prev[field] as any) || {};
            return {
                ...prev,
                [field]: { ...fieldData, [subfield]: value }
            };
        } else {
            return { ...prev, [field]: value };
        }
    });
  }

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(formData){
        updateSupplierProfile(formData);
        showToast('Grid Identity Committed', 'success');
        setIsEditMode(false);
    }
  }

  if (isDataLoading) {
    return (
        <div className="p-24 text-center text-slate-500 flex flex-col items-center gap-6">
            <ArrowPathIcon className="h-12 w-12 animate-spin text-blue-500"/> 
            <div>
                <p className="text-xl font-black italic uppercase tracking-tighter text-slate-400">Calibrating Profile Node...</p>
                <p className="text-xs font-bold text-slate-500 mt-2">Neural handshake in progress. Standby for operational lock.</p>
            </div>
        </div>
    );
  }

  if (!formData || !currentSupplier) {
    return (
        <div className="p-24 text-center text-slate-500 flex flex-col items-center gap-6">
            <ExclamationTriangleIcon className="h-16 w-16 text-red-600 animate-pulse" />
            <div>
                <p className="text-xl font-black italic uppercase tracking-tighter text-slate-400">Node Profile Isolation Error</p>
                <p className="text-xs font-bold text-slate-500 mt-2">Neural Core could not satisfy the identity request for this node.</p>
            </div>
            <button 
                onClick={handleResetHub}
                className="mt-4 bg-white/5 hover:bg-white/10 text-slate-400 font-black px-8 py-3 rounded-2xl border border-white/10 text-[10px] uppercase tracking-widest flex items-center gap-2"
            >
                <ArrowPathRoundedSquareIcon className="h-4 w-4" /> Reset Grid Node
            </button>
        </div>
    );
  }

  return (
    <div className="pb-20 animate-fade-in font-sans">
      
      {/* Ferrari Node Header */}
      <div className="bg-slate-900 rounded-[3.5rem] shadow-2xl overflow-hidden border border-white/5 mb-10 relative">
          <div className="absolute inset-0 bg-carbon opacity-10"></div>
          <div className="h-48 bg-slate-950 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent"></div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-px bg-blue-500/20 blur-xl"></div>
          </div>
          
          <div className="px-12 pb-12 relative z-10 text-left">
               <div className="flex flex-col lg:flex-row items-start lg:items-end -mt-24 mb-8 gap-10">
                   <div className="relative group/logo">
                       <div className="rounded-[2.5rem] p-2 bg-slate-900 border-4 border-slate-950 shadow-2xl overflow-hidden">
                           <img 
                                src={formData.logoUrl || `https://ui-avatars.com/api/?name=${formData.name}&background=1E40AF&color=fff&size=256`} 
                                alt="Node Logo" 
                                className="w-44 h-44 rounded-[2rem] object-cover bg-slate-800"
                           />
                       </div>
                   </div>
                   
                   <div className="flex-grow pb-2">
                       <div className="flex items-center gap-4 mb-3">
                            <div className="flex items-center gap-2 px-3 py-1 bg-blue-600/10 border border-blue-500/20 rounded-lg">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Grid Node Active</span>
                            </div>
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] font-mono">ID: {formData.id.slice(-8).toUpperCase()}</span>
                       </div>
                       <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic leading-none">{formData.name}</h1>
                       <p className="text-slate-400 font-bold flex items-center gap-2 uppercase tracking-widest text-xs mt-4">
                           <MapPinIcon className="h-4 w-4 text-blue-500"/> {formData.location || 'Regional Sector Alpha'}
                       </p>
                   </div>

                   <div className="flex gap-4 w-full lg:w-auto">
                        {!isEditMode ? (
                            <>
                                <button onClick={() => window.open(publicUrl, '_blank')} className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-slate-400 font-black py-5 px-8 rounded-3xl hover:bg-white/10 transition-all uppercase tracking-widest text-[10px]">
                                    <GlobeAltIcon className="h-5 w-5 text-blue-500" />
                                    Public Storefront
                                </button>
                                <button onClick={() => setIsEditMode(true)} className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-white text-slate-900 font-black py-5 px-10 rounded-3xl shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95 uppercase tracking-widest text-[10px] border-4 border-slate-900">
                                    <PencilIcon className="h-5 w-5" />
                                    Edit Node
                                </button>
                            </>
                        ) : (
                            <div className="flex gap-4 w-full">
                                <button type="button" onClick={() => setIsEditMode(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-slate-500 font-black py-5 px-10 rounded-3xl uppercase tracking-widest text-[10px]">Abort</button>
                                <button onClick={handleProfileSubmit} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black py-5 px-14 rounded-3xl shadow-2xl shadow-blue-900/40 border border-white/10 uppercase tracking-widest text-[10px]">Commit Handshake</button>
                            </div>
                        )}
                   </div>
               </div>
          </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        <div className="lg:col-span-8 space-y-10">
            <form onSubmit={handleProfileSubmit} className="space-y-10">
                <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-200">
                    <h3 className="text-2xl font-black text-slate-900 mb-10 pb-6 border-b border-slate-100 flex items-center gap-4 italic uppercase tracking-tighter text-left">
                        <BuildingStorefrontIcon className="h-8 w-8 text-blue-600"/>
                        Node <span className="text-blue-600">Dossier</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <ProfileInput label="Merchant Identity" value={formData.name} name="name" onChange={(e) => handleChange(e, 'name')} isEditing={isEditMode} icon={BuildingStorefrontIcon} />
                        <ProfileInput label="SANS Sector Location" value={formData.location} name="location" onChange={(e) => handleChange(e, 'location')} isEditing={isEditMode} icon={MapPinIcon} />
                        <ProfileInput label="Comm Uplink (Phone)" value={formData?.contact?.phone} name="phone" onChange={(e) => handleChange(e, 'contact', 'phone')} isEditing={isEditMode} icon={PhoneIcon} />
                        <ProfileInput label="Packet Relay (Email)" value={formData?.contact?.email} name="email" type="email" onChange={(e) => handleChange(e, 'contact', 'email')} isEditing={isEditMode} icon={EnvelopeIcon} />
                        <div className="md:col-span-2">
                            <ProfileInput label="Web Gateway" value={formData?.contact?.website} name="website" onChange={(e) => handleChange(e, 'contact', 'website')} isEditing={isEditMode} icon={GlobeAltIcon} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-200">
                    <h3 className="text-2xl font-black text-slate-900 mb-10 pb-6 border-b border-slate-100 flex items-center gap-4 italic uppercase tracking-tighter text-left">
                        <ClockIcon className="h-8 w-8 text-blue-600"/>
                        Operational <span className="text-blue-600">Windows</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <ProfileInput label="Weekdays Pulse" value={formData?.businessHours?.weekdays} name="weekdays" onChange={(e) => handleChange(e, 'businessHours', 'weekdays')} isEditing={isEditMode} />
                        <ProfileInput label="Saturday Shift" value={formData?.businessHours?.saturday} name="saturday" onChange={(e) => handleChange(e, 'businessHours', 'saturday')} isEditing={isEditMode} />
                        <ProfileInput label="Sunday Standby" value={formData?.businessHours?.sunday} name="sunday" onChange={(e) => handleChange(e, 'businessHours', 'sunday')} isEditing={isEditMode} />
                    </div>
                </div>
            </form>

             <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-200 overflow-hidden">
                <BusinessVerification />
            </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
            <div className={`rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group transition-all duration-1000 ${systemStatus === SystemStatus.Production ? 'bg-emerald-600 shadow-emerald-900/40' : 'bg-slate-900 border border-white/5'}`}>
                 <div className="absolute inset-0 bg-carbon opacity-10"></div>
                 <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:rotate-45 duration-1000">
                    <RocketLaunchIcon className="h-64 w-64 text-white"/>
                 </div>
                 
                 <div className="relative z-10 text-left">
                    <div className="flex items-center gap-3 mb-8">
                        <ServerIcon className={`h-6 w-6 ${systemStatus === SystemStatus.Production ? 'text-white' : 'text-blue-500'}`}/>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-80">Grid State Control</span>
                    </div>

                    <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-4 leading-none">
                        {systemStatus === SystemStatus.Production ? 'Live Sync' : 'Initialize Node'}
                    </h3>
                    <p className={`text-sm font-medium leading-relaxed mb-10 ${systemStatus === SystemStatus.Production ? 'text-emerald-50' : 'text-slate-400'}`}>
                        {systemStatus === SystemStatus.Production 
                            ? 'National grid is synchronized. Merchant node is in High-Fidelity production mode.' 
                            : 'Synchronize your node with the national production grid. This enables real-time market grounding.'}
                    </p>

                    {systemStatus !== SystemStatus.Production ? (
                        <button 
                            onClick={launchSystem}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-3xl text-[10px] uppercase tracking-[0.3em] shadow-xl transition-all transform active:scale-95 border border-white/10"
                        >
                            Execute Ignition
                        </button>
                    ) : (
                        <div className="flex items-center gap-4 bg-white/10 p-5 rounded-3xl border border-white/10 shadow-inner">
                            <CheckCircleIcon className="h-8 w-8 text-white animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest italic">Production Handshake: SECURE</span>
                        </div>
                    )}
                 </div>
            </div>

            <div className="bg-slate-950 p-10 rounded-[3rem] shadow-2xl text-white relative overflow-hidden group border border-white/5 text-left">
                 <div className="absolute top-0 right-0 p-4 opacity-10"><BanknotesIcon className="h-32 w-32"/></div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-4 relative z-10">
                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_10px_emerald]"></div>
                    Settlement <span className="text-emerald-500">Grid</span>
                </h3>
                
                <div className="relative z-10">
                    {formData.payoutDetails ? (
                        <div className="space-y-6">
                            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 group hover:bg-white/10 transition-all">
                                <p className="text-[9px] text-slate-500 uppercase font-black mb-1 tracking-widest">Clearing Terminal</p>
                                <p className="font-black italic text-emerald-400 text-xl tracking-tight uppercase">{formData.payoutDetails.bankName}</p>
                            </div>
                            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 group hover:bg-white/10 transition-all">
                                <p className="text-[9px] text-slate-500 uppercase font-black mb-1 tracking-widest">Active Ledger</p>
                                <p className="font-mono font-bold text-lg">**** {formData.payoutDetails.accountNumber.slice(-4)}</p>
                            </div>
                            <button onClick={() => setIsPayoutModalOpen(true)} className="w-full mt-4 bg-white text-slate-950 font-black py-5 rounded-3xl text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:bg-slate-100 transition-all transform active:scale-95">
                                Update Payout Node
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500 mx-auto mb-6 animate-pulse" />
                            <p className="text-sm text-yellow-100/70 mb-10 leading-loose font-medium italic">"Settlement node isolated. Attach clearing credentials to enable grid payments."</p>
                            <button onClick={() => setIsPayoutModalOpen(true)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-3xl text-[10px] uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all transform active:scale-95 border border-white/10">
                                Provision Ledger
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-200 text-center relative overflow-hidden group hover:border-blue-500/30 transition-all">
                <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <h4 className="font-black text-xl italic uppercase tracking-tighter flex items-center justify-center gap-4 mb-3 text-slate-900"><QrCodeIcon className="h-8 w-8 text-blue-600" /> Node <span className="text-blue-600">Identity</span></h4>
                <p className="text-[9px] text-slate-500 mb-10 uppercase font-black tracking-widest italic">Broadcast public storefront telemetry</p>
                <div className="inline-block bg-white p-2 rounded-[2.5rem] shadow-2xl border-8 border-slate-900 mb-10">
                    <img src={qrCodeUrl} alt="Store QR" className="w-44 h-44 grayscale group-hover:grayscale-0 transition-all duration-1000"/>
                </div>
                <button onClick={() => showToast('Dossier Export Initialized', 'info')} className="w-full bg-slate-950 hover:bg-black text-white font-black py-5 rounded-3xl text-[9px] uppercase tracking-[0.4em] transition-all shadow-xl transform active:scale-95 border-4 border-slate-800">
                    Download Identity Token
                </button>
            </div>
        </div>
      </div>

      {isPayoutModalOpen && formData && (
          <PayoutSettingsModal
            supplier={formData}
            onSave={(payoutDetails) => { 
                const updated = { ...formData, payoutDetails };
                setFormData(updated);
                updateSupplierProfile(updated); 
                setIsPayoutModalOpen(false); 
            }}
            onClose={() => setIsPayoutModalOpen(false)}
          />
      )}

      <div className="ferrari-watermark"></div>
    </div>
  );
};

export default SupplierProfile;
