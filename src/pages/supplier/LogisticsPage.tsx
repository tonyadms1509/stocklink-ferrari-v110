import React, { useState, useMemo } from 'react';
import { 
    TruckIcon, PlusIcon, PencilIcon, TrashIcon, 
    UserGroupIcon, SignalIcon, RocketLaunchIcon,
    IdentificationIcon, BoltIcon, ChartBarIcon,
    ShieldCheckIcon, BeakerIcon, ArrowPathIcon
} from '@heroicons/react/24/solid';
import { useData } from '../../hooks/useDataContext.tsx';
import { Vehicle, Driver } from '../../types.ts';
import { useAuth } from '../../hooks/useAuth.tsx';
import { useToast } from '../../hooks/useToast.tsx';
import AnimatedNumber from '../../components/AnimatedNumber.tsx';

const UnitCard: React.FC<{ vehicle: Vehicle; onRemove: () => void; isNuclear: boolean }> = ({ vehicle, onRemove, isNuclear }) => {
    const statusColors = {
        'Available': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]',
        'On Delivery': 'bg-blue-600/10 text-blue-400 border-blue-600/20',
        'Maintenance': 'bg-red-600/10 text-red-400 border-red-500/20',
        'In Use': 'bg-purple-600/10 text-purple-400 border-purple-500/20'
    };

    return (
        <div className={`bg-slate-900 border p-6 rounded-[2rem] group hover:border-red-600/40 transition-all duration-500 relative overflow-hidden shadow-2xl text-left ${isNuclear ? 'border-blue-500/40' : 'border-white/5'}`}>
             <div className={`absolute inset-0 bg-carbon opacity-5 group-hover:opacity-10 transition-opacity`}></div>
             <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className={`p-4 rounded-2xl border border-white/5 group-hover:bg-red-600/10 transition-colors shadow-inner ${isNuclear ? 'bg-blue-600/10' : 'bg-white/5'}`}>
                        <TruckIcon className={`h-8 w-8 ${isNuclear ? 'text-blue-400' : 'text-slate-400'} group-hover:text-red-600`}/>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-inner flex items-center gap-2 ${statusColors[vehicle.status as keyof typeof statusColors] || 'bg-slate-800 text-slate-500'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${vehicle.status === 'Available' ? 'bg-emerald-500 animate-pulse' : 'bg-current'}`}></div>
                        {vehicle.status}
                    </span>
                </div>
                <h4 className="text-xl font-black text-white italic uppercase tracking-tighter mb-1">{vehicle.makeModel}</h4>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6 font-mono">CHASSIS: {vehicle.registration}</p>
                
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex gap-4">
                        <button className="text-slate-600 hover:text-blue-500 transition-colors"><PencilIcon className="h-5 w-5"/></button>
                        <button onClick={onRemove} className="text-slate-600 hover:text-red-500 transition-colors"><TrashIcon className="h-5 w-5"/></button>
                    </div>
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Signal: Nominal</span>
                </div>
             </div>
        </div>
    );
};

const PilotCard: React.FC<{ driver: Driver; onRemove: () => void }> = ({ driver, onRemove }) => (
    <div className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem] flex items-center justify-between group hover:border-blue-500/30 transition-all duration-300 shadow-xl text-left relative overflow-hidden">
        <div className="absolute inset-0 bg-carbon opacity-5"></div>
        <div className="flex items-center gap-6 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center font-black text-slate-400 text-xl border border-white/5 group-hover:border-red-600/30 transition-all">
                {driver.name.charAt(0)}
            </div>
            <div>
                <h4 className="font-black text-white italic uppercase tracking-tighter text-lg leading-none">{driver.name}</h4>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">{driver.contactNumber}</p>
            </div>
        </div>
        <button onClick={onRemove} className="text-slate-600 hover:text-red-500 transition-colors relative z-10">
            <TrashIcon className="h-5 w-5"/>
        </button>
    </div>
);

const LogisticsPage: React.FC = () => {
    const { 
        vehicles = [], drivers = [], 
        removeVehicle, removeDriver, 
        executeNewclairActivation,
        isLoading, isNuclearActive
    } = useData();
    const { currentCompany } = useAuth();
    const { showToast } = useToast();
    
    const [activeTab, setActiveTab] = useState<'overview' | 'fleet'>('fleet');
    const [isSeeding, setIsSeeding] = useState(false);
    
    const myVehicles = useMemo(() => vehicles.filter(v => v.supplierId === currentCompany?.id), [vehicles, currentCompany]);
    const myDrivers = useMemo(() => drivers.filter(d => d.supplierId === currentCompany?.id), [drivers, currentCompany]);

    const handleNuclearIgnition = async () => {
        setIsSeeding(true);
        try {
            await executeNewclairActivation();
            showToast("NUCLAIR OPTION ENGAGED: FERRARI GRID LIVE", "success");
        } catch (e) {
            showToast("Ignition Protocol Failure", "error");
        } finally {
            setIsSeeding(false);
        }
    };

    if (myVehicles.length === 0 && myDrivers.length === 0 && !isLoading) {
        return (
            <div className="h-full flex items-center justify-center p-8 animate-fade-in">
                <div className="bg-slate-900 border border-white/10 rounded-[4rem] p-12 max-w-4xl w-full text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-carbon opacity-20"></div>
                    <div className="relative z-10">
                        <div className="mb-10 flex flex-col items-center justify-center">
                            <div className="relative w-48 h-48 mb-8">
                                <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-spin-slow"></div>
                                <div className="absolute inset-8 rounded-full border-8 border-blue-600 animate-pulse shadow-[0_0_50px_#2563eb] flex items-center justify-center">
                                    <BoltIcon className="h-16 w-16 text-white" />
                                </div>
                            </div>
                            <h2 className="text-6xl font-black text-white italic tracking-tighter uppercase mb-2 leading-none">NUCLAIR <span className="text-blue-500">INITIATION</span></h2>
                            <p className="text-blue-400 text-xs font-black uppercase tracking-[0.5em] mb-12 italic">Grid Power Level: Sub-Critical</p>
                        </div>
                        <p className="text-slate-400 text-lg mb-12 max-w-2xl mx-auto font-medium italic leading-relaxed">"Fleet registry isolated. Access elite chassis nodes and pilots by executing the Nuclair Protocol. This path optimizes for national grid dominance."</p>
                        <button 
                            onClick={handleNuclearIgnition}
                            disabled={isSeeding}
                            className="px-16 py-6 bg-blue-600 text-white font-black rounded-[2rem] text-sm uppercase tracking-[0.4em] transition-all transform active:scale-95 shadow-[0_0_50px_rgba(37,99,235,0.4)] hover:bg-blue-500 disabled:opacity-50 border-4 border-slate-950 flex items-center justify-center gap-4"
                        >
                            {isSeeding ? <ArrowPathIcon className="h-6 w-6 animate-spin"/> : <BeakerIcon className="h-6 w-6"/>}
                            Execute Initiation
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`h-full flex flex-col space-y-12 font-sans animate-fade-in text-left ${isNuclearActive ? 'nuclear-theme' : ''}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-10">
                <div>
                    <div className="flex items-center gap-3 mb-4 text-blue-500 font-black text-[10px] uppercase tracking-[0.4em]">
                         <BoltIcon className={`h-6 w-6 ${isNuclearActive ? 'animate-pulse text-blue-400' : 'text-slate-500'}`} />
                         National Dispatch v80.5 REDLINE
                    </div>
                    <h2 className="text-7xl font-black text-white tracking-tighter uppercase italic leading-none">UNIT <span className="text-blue-500">REGISTRY</span></h2>
                </div>
                <div className="flex bg-slate-900 p-1.5 rounded-[2rem] border border-white/5 shadow-2xl backdrop-blur-xl">
                    <button onClick={() => setActiveTab('fleet')} className={`px-10 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'fleet' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>Unit Roster</button>
                    <button onClick={() => setActiveTab('overview')} className={`px-10 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>Operational Vitals</button>
                </div>
            </div>

            {activeTab === 'fleet' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-fade-in-up">
                     <div className="bg-slate-950 p-10 rounded-[4rem] shadow-2xl relative overflow-hidden group border border-white/5">
                         <div className="absolute inset-0 bg-carbon opacity-5"></div>
                         <div className="flex justify-between items-center mb-10 relative z-10 text-left">
                             <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter flex items-center gap-5">
                                 <TruckIcon className="h-10 w-10 text-blue-500"/> Chassis Nodes
                             </h3>
                             <button className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all border border-white/10 shadow-lg transform active:scale-95"><PlusIcon className="h-8 w-8"/></button>
                         </div>
                         <div className="space-y-6 relative z-10">
                             {myVehicles.map(v => <UnitCard key={v.id} vehicle={v} onRemove={() => removeVehicle(v.id)} isNuclear={isNuclearActive} />)}
                         </div>
                     </div>

                     <div className="bg-slate-950 p-10 rounded-[4rem] shadow-2xl relative overflow-hidden group border border-white/5">
                         <div className="absolute inset-0 bg-carbon opacity-5"></div>
                         <div className="flex justify-between items-center mb-10 relative z-10 text-left">
                             <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter flex items-center gap-5">
                                 <UserGroupIcon className="h-10 w-10 text-blue-500"/> Pilot Signatures
                             </h3>
                             <button className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all border border-white/10 shadow-lg transform active:scale-95"><PlusIcon className="h-8 w-8"/></button>
                         </div>
                          <div className="space-y-4 relative z-10">
                             {myDrivers.map(d => <PilotCard key={d.id} driver={d} onRemove={() => removeDriver(d.id)} />)}
                         </div>
                     </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in-up text-left">
                    <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl border border-white/5">
                         <ChartBarIcon className="h-12 w-12 text-blue-500 mb-6" />
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Fleet Saturation</p>
                         <p className="text-5xl font-black text-white italic tracking-tighter">94.2%</p>
                    </div>
                    <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl border border-white/5">
                         <SignalIcon className="h-12 w-12 text-emerald-500 mb-6" />
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Fulfillment Buffer</p>
                         <p className="text-5xl font-black text-white italic tracking-tighter">4.2T</p>
                    </div>
                    <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl border border-white/5">
                         <ShieldCheckIcon className="h-12 w-12 text-purple-500 mb-6" />
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Grid Integrity</p>
                         <p className="text-5xl font-black text-white italic tracking-tighter">100%</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LogisticsPage;