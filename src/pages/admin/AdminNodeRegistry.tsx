import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useDataContext.tsx';
import { User, UserRole } from '../../types.ts';
import { 
    UsersIcon, MagnifyingGlassIcon, ShieldCheckIcon, 
    XMarkIcon, MapPinIcon, EnvelopeIcon, PhoneIcon,
    BriefcaseIcon, BuildingStorefrontIcon, TruckIcon,
    ArrowRightIcon, CheckCircleIcon, ExclamationTriangleIcon,
    BoltIcon, CircleStackIcon, WrenchScrewdriverIcon,
    ShieldExclamationIcon
} from '@heroicons/react/24/solid';
import EmptyState from '../../components/EmptyState.tsx';
import AnimatedNumber from '../../components/AnimatedNumber.tsx';

const NodeDossierModal: React.FC<{ node: User; onClose: () => void; onVerify: (id: string, status: any) => void }> = ({ node, onClose, onVerify }) => {
    return (
        <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-[200] p-4 backdrop-blur-md animate-fade-in">
            <div className="bg-slate-900 border border-white/10 rounded-[3rem] shadow-2xl max-w-2xl w-full relative overflow-hidden flex flex-col max-h-[90vh]">
                <div className="absolute inset-0 bg-carbon opacity-10"></div>
                <button onClick={onClose} className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-red-600 transition-all rounded-2xl border border-white/10 text-white z-50">
                    <XMarkIcon className="h-6 w-6"/>
                </button>

                <div className="p-12 relative z-10 overflow-y-auto custom-scrollbar">
                    <div className="flex items-center gap-8 mb-12">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-slate-800 border-4 border-slate-950 shadow-2xl overflow-hidden">
                            <img src={node.companyLogoUrl || `https://ui-avatars.com/api/?name=${node.name}&background=random&color=fff&size=256`} className="w-full h-full object-cover" alt="Node Avatar"/>
                        </div>
                        <div className="text-left">
                            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">{node.name}</h2>
                            <p className="text-blue-500 font-mono text-sm tracking-widest mt-2">ID: {node.id}</p>
                            <div className="flex gap-2 mt-4">
                                <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">{node.role}</span>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${node.verificationStatus === 'verified' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>{node.verificationStatus}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 text-left">
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Contact Schematic</p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-slate-300 text-sm">
                                    <EnvelopeIcon className="h-5 w-5 text-blue-500"/> {node.email}
                                </div>
                                <div className="flex items-center gap-3 text-slate-300 text-sm">
                                    <PhoneIcon className="h-5 w-5 text-blue-500"/> {node.contact?.phone || 'N/A'}
                                </div>
                                <div className="flex items-center gap-3 text-slate-300 text-sm">
                                    <MapPinIcon className="h-5 w-5 text-blue-500"/> {node.serviceAreas?.[0]?.cities?.join(', ') || 'National'}
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Registry Info</p>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 font-bold uppercase">Join Date</span>
                                    <span className="text-white font-mono">{new Date(node.createdAt || Date.now()).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 font-bold uppercase">Wallet Balance</span>
                                    <span className="text-emerald-400 font-black italic">R {node.walletBalance || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 text-left">
                         <h4 className="text-xs font-black uppercase text-slate-500 tracking-[0.4em]">Audit Actions</h4>
                         <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => onVerify(node.id, 'verified')}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/40 border border-white/10"
                            >
                                Authorize (Verify)
                            </button>
                            <button 
                                onClick={() => onVerify(node.id, 'unverified')}
                                className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all border border-red-500/20"
                            >
                                Revoke Clearance
                            </button>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminNodeRegistry: React.FC = () => {
    const { users = [], verifyUserNode } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<'all' | UserRole>('all');
    const [selectedNode, setSelectedNode] = useState<User | null>(null);

    const filteredNodes = useMemo(() => {
        return users.filter(u => {
            const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = filterRole === 'all' || u.role === filterRole;
            return matchesSearch && matchesRole;
        });
    }, [users, searchTerm, filterRole]);

    const getRoleIcon = (role: UserRole) => {
        switch(role) {
            case UserRole.Contractor: return <WrenchScrewdriverIcon className="h-5 w-5"/>;
            case UserRole.Supplier: return <BuildingStorefrontIcon className="h-5 w-5"/>;
            case UserRole.Logistics: return <TruckIcon className="h-5 w-5"/>;
            default: return <BoltIcon className="h-5 w-5"/>;
        }
    }

    return (
        <div className="space-y-12 animate-fade-in pb-20 text-left selection:bg-red-600/20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-12">
                <div className="text-left">
                    <div className="flex items-center gap-3 mb-4">
                        <CircleStackIcon className="h-6 w-6 text-blue-600 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500">Registry Controller v80.5</span>
                    </div>
                    <h1 className="text-7xl font-black text-white tracking-tighter italic uppercase text-white leading-none">NODE <span className="text-blue-600">LEDGER</span></h1>
                    <p className="text-slate-500 mt-4 font-mono text-sm tracking-widest uppercase leading-relaxed">Central Entity Directory & Global Handshake Authority</p>
                </div>
            </header>

            <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="relative flex-grow w-full">
                    <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-500" />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search Grid Signatures (Name, Email, ID)..."
                        className="w-full p-6 pl-16 bg-slate-900 border border-white/5 rounded-[2rem] text-lg font-bold text-white shadow-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-700"
                    />
                </div>
                <div className="flex bg-slate-900 p-1.5 rounded-[2rem] border border-white/5 shadow-inner">
                    {(['all', UserRole.Contractor, UserRole.Supplier, UserRole.Logistics] as const).map(role => (
                        <button 
                            key={role} 
                            onClick={() => setFilterRole(role)}
                            className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${filterRole === role ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {role}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-slate-900 rounded-[4rem] border border-white/5 shadow-2xl overflow-hidden relative">
                 <div className="absolute inset-0 bg-carbon opacity-10"></div>
                 <div className="overflow-x-auto relative z-10">
                    <table className="w-full text-left">
                        <thead className="bg-black/40 border-b border-white/5">
                            <tr>
                                <th className="p-6 font-black text-slate-500 uppercase text-[10px] tracking-widest">Operational Unit</th>
                                <th className="p-6 font-black text-slate-500 uppercase text-[10px] tracking-widest">Protocol Type</th>
                                <th className="p-6 font-black text-slate-500 uppercase text-[10px] tracking-widest">Status</th>
                                <th className="p-6 font-black text-slate-500 uppercase text-[10px] tracking-widest text-right">Dossier</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredNodes.map(node => (
                                <tr key={node.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center font-black text-slate-500 text-sm shadow-inner group-hover:border-blue-500/30 transition-all">
                                                {node.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-white uppercase italic tracking-tight text-lg group-hover:text-blue-400 transition-colors">{node.name}</p>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{node.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2 text-slate-300">
                                            {getRoleIcon(node.role)}
                                            <span className="text-[10px] font-black uppercase tracking-widest">{node.role}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                            node.verificationStatus === 'verified' 
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                                        }`}>
                                            {node.verificationStatus || 'Pending'}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <button 
                                            onClick={() => setSelectedNode(node)}
                                            className="p-3 bg-white/5 hover:bg-blue-600 transition-all rounded-xl border border-white/10 text-slate-500 hover:text-white group-hover:shadow-2xl"
                                        >
                                            <ArrowRightIcon className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredNodes.length === 0 && (
                        <div className="py-32 text-center">
                            <UsersIcon className="h-16 w-16 text-slate-800 mx-auto mb-4 opacity-30" />
                            <p className="text-slate-600 font-black uppercase text-[10px] tracking-widest italic">No matching signatures found in grid registry</p>
                        </div>
                    )}
                 </div>
            </div>

            {selectedNode && (
                <NodeDossierModal 
                    node={selectedNode} 
                    onClose={() => setSelectedNode(null)} 
                    onVerify={(id, status) => { verifyUserNode(id, status); setSelectedNode(null); }}
                />
            )}

            <div className="ferrari-watermark">REGISTRY MASTER</div>
        </div>
    );
};

export default AdminNodeRegistry;