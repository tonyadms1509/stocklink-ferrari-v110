import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useDataContext';
import { useLocalization } from '../../hooks/useLocalization';
import { UserCircleIcon, PencilIcon, BuildingOffice2Icon, WrenchScrewdriverIcon, MapPinIcon, LinkIcon, PhoneIcon, PlusIcon, PhotoIcon, QrCodeIcon, GlobeAltIcon, ArrowLeftIcon, ShieldCheckIcon, EnvelopeIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { PortfolioProject } from '../../types';
import { useToast } from '../../hooks/useToast';
import BusinessVerification from '../../components/BusinessVerification';
import Logo from '../../components/Logo';
import WebsitePreviewModal from '../../components/WebsitePreviewModal';

const Tag: React.FC<{ text: string }> = ({ text }) => {
    const { isRuggedMode } = useData();
    return (
        <span className={`border text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${isRuggedMode ? 'bg-white border-black text-black' : 'bg-red-600/10 text-red-500 border-red-500/20'}`}>{text}</span>
    );
};

const BEEScorecard: React.FC = () => {
    const { isRuggedMode } = useData();
    return (
        <div className={`border p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group text-left ${isRuggedMode ? 'bg-white border-black border-[4px]' : 'bg-slate-900 border-white/5'}`}>
            {!isRuggedMode && <div className="absolute inset-0 bg-carbon opacity-10"></div>}
            <div className="relative z-10">
                <h3 className={`text-xs font-black uppercase tracking-[0.4em] mb-6 flex items-center gap-2 ${isRuggedMode ? 'text-black font-black' : 'text-slate-50'}`}>
                    <ShieldCheckIcon className={`h-4 w-4 ${isRuggedMode ? 'text-black' : 'text-emerald-500'}`}/> Trust Matrix
                </h3>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className={`text-5xl font-black italic tracking-tighter ${isRuggedMode ? 'text-black' : 'text-white'}`}>LEVEL 1</p>
                        <p className={`text-[10px] font-black uppercase mt-1 ${isRuggedMode ? 'text-black font-black' : 'text-emerald-500'}`}>B-BBEE Verified Status</p>
                    </div>
                    <div className={`p-4 rounded-2xl border ${isRuggedMode ? 'bg-white border-black border-2' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                        <ShieldCheckIcon className={`h-10 w-10 ${isRuggedMode ? 'text-black' : 'text-emerald-500 shadow-[0_0_15px_#10b981]'}`}/>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-end mb-2">
                        <span className={`text-[9px] font-black uppercase tracking-widest ${isRuggedMode ? 'text-black font-black' : 'text-slate-500'}`}>Procurement Recognition</span>
                        <span className={`text-xs font-black italic ${isRuggedMode ? 'text-black' : 'text-white'}`}>135%</span>
                    </div>
                    <div className={`h-1 w-full rounded-full overflow-hidden border ${isRuggedMode ? 'bg-white border-black border-2' : 'bg-white/5 border-white/5'}`}>
                        <div className={`h-full ${isRuggedMode ? 'bg-black' : 'bg-emerald-500'}`} style={{ width: '100%' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DigitalBusinessCard: React.FC<{ user: any, qrCodeUrl: string }> = ({ user, qrCodeUrl }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const { isRuggedMode } = useData();

    return (
        <div 
            className="w-full h-72 perspective-1000 group cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
            onMouseEnter={() => setIsFlipped(true)}
            onMouseLeave={() => setIsFlipped(false)}
        >
            <div className={`relative w-full h-full transition-transform duration-1000 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                <div className={`absolute w-full h-full rounded-[2.5rem] p-10 shadow-2xl backface-hidden flex flex-col justify-between border overflow-hidden text-left ${isRuggedMode ? 'bg-white border-black border-[4px]' : 'bg-slate-950 border-white/5'}`}>
                    {!isRuggedMode && (
                        <>
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none"></div>
                            <div className="absolute top-0 right-0 p-10 opacity-5">
                                <Logo className="h-48 w-48 text-white transform rotate-12" />
                            </div>
                        </>
                    )}

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isRuggedMode ? 'bg-black' : 'bg-red-600'}`}></div>
                            <p className={`text-[10px] font-black tracking-[0.4em] uppercase ${isRuggedMode ? 'text-black font-black' : 'text-red-600'}`}>Operator Node</p>
                        </div>
                        <h3 className={`text-4xl font-black italic uppercase leading-none ${isRuggedMode ? 'text-black' : 'text-white'}`}>{user.name}</h3>
                    </div>

                    <div className={`relative z-10 border-t pt-6 ${isRuggedMode ? 'border-black' : 'border-white/5'}`}>
                        <p className={`text-xs font-mono tracking-widest ${isRuggedMode ? 'text-black font-black' : 'text-slate-400'}`}>{user.email}</p>
                        <p className={`text-[10px] font-black uppercase mt-2 tracking-[0.3em] ${isRuggedMode ? 'text-black font-black' : 'text-slate-500'}`}>{user.contact?.phone}</p>
                    </div>
                </div>

                <div className="absolute w-full h-full bg-white rounded-[2.5rem] p-10 shadow-2xl backface-hidden rotate-y-180 flex flex-col items-center justify-center text-center border-[4px] border-black">
                     <p className="text-[10px] font-black text-black mb-6 uppercase tracking-[0.4em]">Grid Identity Pulse</p>
                     <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32 mb-6 grayscale group-hover:grayscale-0 transition-all"/>
                     <span className="font-black text-black italic tracking-tighter uppercase text-xl">StockLink <span className="text-red-600">Ferrari</span></span>
                </div>
            </div>
        </div>
    );
};

const ContractorProfilePage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const { user, updateCurrentUser } = useAuth();
    const { t } = useLocalization();
    const { showToast } = useToast();
    const { portfolioProjects, isRuggedMode } = useData();
    const [isEditMode, setIsEditMode] = useState(false);
    const [isWebsiteModalOpen, setIsWebsiteModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        bio: user?.bio || '',
        phone: user?.contact?.phone || '',
        website: user?.contact?.website || '',
        address: user?.address || '',
        location: user?.company || 'Regional Node',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                bio: user.bio || '',
                phone: user.contact?.phone || '',
                website: user.contact?.website || '',
                address: user.address || '',
                location: user.company || '',
            });
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSave = () => {
        if (!user) return;
        updateCurrentUser({
            name: formData.name,
            bio: formData.bio,
            address: formData.address,
            company: formData.location,
            contact: {
                ...user.contact,
                phone: formData.phone,
                website: formData.website,
            },
        });
        setIsEditMode(false);
        showToast('Grid Identity Synchronized', 'success');
    };

    if (!user) return <p className="p-20 text-center font-black animate-pulse text-red-600 uppercase">Initializing Profile Cache...</p>;
    
    const myPortfolio = portfolioProjects.filter(p => p.contractorId === user.id);
    const publicProfileUrl = `${window.location.origin}/#/profile/${user.id}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicProfileUrl)}`;

    return (
        <div className={`animate-fade-in pb-12 font-sans selection:bg-red-600/30 ${isRuggedMode ? 'rugged-view' : ''}`}>
            <div className={`rounded-[3.5rem] shadow-2xl overflow-hidden border mb-10 transition-all duration-700 ${isRuggedMode ? 'bg-white border-black border-[4px]' : 'bg-slate-900 border-white/5'}`}>
                {!isRuggedMode && (
                    <div className="h-64 w-full bg-slate-950 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-1 bg-red-600/20 blur-2xl"></div>
                    </div>
                )}

                <div className={`px-12 pb-12 ${isRuggedMode ? 'pt-12' : ''}`}>
                    <div className="flex flex-col lg:flex-row items-start lg:items-end -mt-24 lg:mt-0 mb-10 gap-10">
                        <div className="relative group/avatar">
                            <div className={`rounded-[2.5rem] p-2 border shadow-2xl transform transition-all duration-500 ${isRuggedMode ? 'bg-white border-black border-2' : 'bg-slate-900 border-slate-950'}`}>
                                <img 
                                    src={user.companyLogoUrl || `https://ui-avatars.com/api/?name=${user.name}&background=${isRuggedMode ? '000000' : 'DC0000'}&color=fff&size=256`} 
                                    alt="Identity" 
                                    className={`w-44 h-44 rounded-[2rem] object-cover border ${isRuggedMode ? 'border-black' : 'bg-slate-800 border-white/5'}`} 
                                />
                            </div>
                        </div>
                        
                        <div className="flex-grow pb-2 text-left">
                             <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-4">
                                {isEditMode ? (
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={`text-4xl font-black border rounded-2xl px-6 py-2 outline-none transition-all italic tracking-tighter uppercase w-full max-w-md ${isRuggedMode ? 'bg-white border-black text-black' : 'bg-white/5 border-white/10 text-white focus:border-red-600'}`} />
                                ) : (
                                    <h1 className={`text-6xl font-black tracking-tighter uppercase italic leading-none ${isRuggedMode ? 'text-black' : 'text-white'}`}>{user.name}</h1>
                                )}
                                <span className={`text-[10px] px-4 py-1.5 rounded-full font-black border flex items-center gap-2 uppercase tracking-widest italic ${isRuggedMode ? 'bg-white border-black text-black border-2' : 'bg-red-600/10 text-red-500 border-red-500/20 animate-pulse'}`}>
                                    <ShieldCheckIcon className="h-4 w-4"/> Elite Unit
                                </span>
                            </div>
                            <p className={`font-mono text-sm uppercase tracking-[0.4em] flex items-center gap-3 ${isRuggedMode ? 'text-black font-black' : 'text-slate-500'}`}>
                                <EnvelopeIcon className={`h-4 w-4 ${isRuggedMode ? 'text-black' : 'text-red-600'}`}/> {user.email}
                            </p>
                        </div>

                        <div className="flex gap-4 w-full lg:w-auto">
                             {isEditMode ? (
                                <>
                                    <button onClick={() => setIsEditMode(false)} className={`flex-1 lg:flex-none font-black py-4 px-10 rounded-2xl transition-all uppercase tracking-widest text-[10px] border ${isRuggedMode ? 'bg-white border-black text-black' : 'bg-white/5 border-white/10 text-slate-400'}`}>Discard Node Changes</button>
                                    <button onClick={handleSave} className={`flex-1 lg:flex-none font-black py-4 px-10 rounded-2xl shadow-2xl transition-all transform active:scale-95 uppercase tracking-widest text-[10px] border ${isRuggedMode ? 'bg-black text-white border-black' : 'bg-red-600 hover:bg-red-700 text-white border-white/10'}`}>Synchronize</button>
                                </>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => setIsWebsiteModalOpen(true)} 
                                        className={`flex-1 lg:flex-none flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest border px-8 py-4 rounded-2xl transition-all ${isRuggedMode ? 'bg-white border-black text-black border-2' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                                    >
                                        <GlobeAltIcon className={`h-5 w-5 ${isRuggedMode ? 'text-black' : 'text-blue-500'}`} />
                                        Launch Portal
                                    </button>
                                    <button 
                                        onClick={() => setIsEditMode(true)}
                                        className={`flex-1 lg:flex-none flex items-center justify-center gap-3 font-black py-4 px-10 rounded-2xl shadow-2xl transition-all transform active:scale-95 uppercase tracking-widest text-[10px] border ${isRuggedMode ? 'bg-black text-white border-black' : 'bg-white text-slate-950 border-slate-900'}`}
                                    >
                                        <PencilIcon className="h-5 w-5" />
                                        Edit Node
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
                        <div className="lg:col-span-8 space-y-12">
                            <section>
                                <h3 className={`text-xs font-black uppercase tracking-[0.4em] mb-6 flex items-center gap-3 ${isRuggedMode ? 'text-black font-black' : 'text-slate-500'}`}>
                                    <BuildingOffice2Icon className={`h-5 w-5 ${isRuggedMode ? 'text-black' : 'text-red-600'}`}/> Tactical Brief
                                </h3>
                                {isEditMode ? (
                                    <textarea name="bio" value={formData.bio} onChange={handleInputChange} className={`w-full p-8 border-2 rounded-[2.5rem] font-black outline-none leading-loose h-48 resize-none ${isRuggedMode ? 'bg-white border-black text-black' : 'bg-white/5 border-white/10 text-white focus:border-red-600'}`} placeholder="Enter operational biography..."></textarea>
                                ) : (
                                    <p className={`leading-loose text-lg italic font-serif ${isRuggedMode ? 'text-black font-black' : 'text-slate-300'}`}>"{user.bio || "Awaiting intelligence packet intake. No node dossier currently available on the national grid."}"</p>
                                )}
                            </section>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <section>
                                    <h3 className={`text-xs font-black uppercase tracking-[0.4em] mb-6 flex items-center gap-3 ${isRuggedMode ? 'text-black font-black' : 'text-slate-500'}`}>
                                        <PhoneIcon className={`h-4 w-4 ${isRuggedMode ? 'text-black' : 'text-red-600'}`}/> Phone
                                    </h3>
                                    {isEditMode ? (
                                        <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className={`w-full p-4 border-2 rounded-2xl font-black outline-none italic ${isRuggedMode ? 'bg-white border-black text-black' : 'bg-white/5 border-white/10 text-white focus:border-red-600'}`} placeholder="Primary phone node..." />
                                    ) : (
                                        <p className={`text-xl font-black italic tracking-tighter ${isRuggedMode ? 'text-black' : 'text-white'}`}>{user.contact?.phone || "LINK_OFFLINE"}</p>
                                    )}
                                </section>

                                <section>
                                    <h3 className={`text-xs font-black uppercase tracking-[0.4em] mb-6 flex items-center gap-3 ${isRuggedMode ? 'text-black font-black' : 'text-slate-500'}`}>
                                        <MapPinIcon className={`h-4 w-4 ${isRuggedMode ? 'text-black' : 'text-red-600'}`}/> Operational Address
                                    </h3>
                                    {isEditMode ? (
                                        <input type="text" name="address" value={formData.address} onChange={handleInputChange} className={`w-full p-4 border-2 rounded-2xl font-black outline-none italic ${isRuggedMode ? 'bg-white border-black text-black' : 'bg-white/5 border-white/10 text-white focus:border-red-600'}`} placeholder="Enter client-facing address..." />
                                    ) : (
                                        <p className={`text-xl font-black italic tracking-tighter ${isRuggedMode ? 'text-black' : 'text-white'}`}>{user.address || "NO_PHYSICAL_NODE_SYNCED"}</p>
                                    )}
                                </section>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <section>
                                    <h3 className={`text-xs font-black uppercase tracking-[0.4em] mb-6 flex items-center gap-3 ${isRuggedMode ? 'text-black font-black' : 'text-slate-500'}`}>
                                        <WrenchScrewdriverIcon className={`h-4 w-4 ${isRuggedMode ? 'text-black' : 'text-red-600'}`}/> Unit Class
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {(user.specialties || ['General Unit']).map(s => <Tag key={s} text={s} />)}
                                    </div>
                                </section>

                                <section>
                                    <h3 className={`text-xs font-black uppercase tracking-[0.4em] mb-6 flex items-center gap-3 ${isRuggedMode ? 'text-black font-black' : 'text-slate-500'}`}>
                                        <GlobeAltIcon className={`h-4 w-4 ${isRuggedMode ? 'text-black' : 'text-red-600'}`}/> Web Gateway
                                    </h3>
                                    {isEditMode ? (
                                        <input type="text" name="website" value={formData.website} onChange={handleInputChange} className={`w-full p-4 border-2 rounded-2xl font-black outline-none focus:border-red-600 transition-all ${isRuggedMode ? 'bg-white border-black text-black' : 'bg-white/5 border-white/10 text-white'}`} placeholder="Website URL..." />
                                    ) : (
                                        <div className={`p-4 rounded-2xl border text-sm font-black uppercase italic tracking-tighter truncate ${isRuggedMode ? 'bg-white border-black text-black border-2' : 'bg-white/5 border-white/5 text-slate-300'}`}>
                                            {user.contact?.website || "GATEWAY_ISOLATED"}
                                        </div>
                                    )}
                                </section>
                            </div>
                            
                            <div className={`border-t pt-10 ${isRuggedMode ? 'border-black border-2' : 'border-white/5'}`}>
                                <BusinessVerification />
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-8">
                            <BEEScorecard />
                            <DigitalBusinessCard user={user} qrCodeUrl={qrCodeUrl} />
                        </div>
                    </div>
                </div>
            </div>
            
            {isWebsiteModalOpen && (
                <WebsitePreviewModal
                    user={user}
                    portfolio={myPortfolio}
                    onClose={() => setIsWebsiteModalOpen(false)}
                />
            )}
            <div className="ferrari-watermark"></div>
        </div>
    );
};

export default ContractorProfilePage;