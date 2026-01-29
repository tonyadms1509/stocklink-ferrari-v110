
import React, { useState, useEffect } from 'react';
import { User, PortfolioProject } from '../../types';
import { getUserProfile, getPortfolioForUser, sendClientInquiry } from '../../services/mockApi';
import { 
    ShieldCheckIcon, 
    BuildingOffice2Icon, 
    WrenchScrewdriverIcon, 
    MapPinIcon, 
    EnvelopeIcon, 
    XMarkIcon, 
    CheckCircleIcon,
    PhoneIcon,
    GlobeAltIcon,
    RadioIcon,
    SparklesIcon
} from '@heroicons/react/24/solid';
import PublicPortfolioCard from '../../components/PublicPortfolioCard';
import { useLocalization } from '../../hooks/useLocalization';
import { useToast } from '../../hooks/useToast';
import Footer from '../../components/Footer';
import Logo from '../../components/Logo';

const ContactForm: React.FC<{ contractorId: string, contractorName: string }> = ({ contractorId, contractorName }) => {
    const { t } = useLocalization();
    const { showToast } = useToast();
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        try {
          await sendClientInquiry({
            contractorId,
            clientName: formData.name,
            clientEmail: formData.email,
            message: formData.message
          });
          setStatus('success');
          showToast("Transmission Transmitted to Node", "success");
        } catch (e) {
          showToast("Uplink Interference", "error");
          setStatus('idle');
        }
    };

    if (status === 'success') {
        return (
            <div className="p-12 text-center bg-emerald-500/10 border border-emerald-500/20 rounded-[3rem] animate-fade-in shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-carbon opacity-5"></div>
                <CheckCircleIcon className="h-16 w-16 text-emerald-500 mx-auto shadow-2xl rounded-full" />
                <h4 className="font-black text-2xl text-white italic uppercase tracking-tighter mt-6">Transmission Sealed</h4>
                <p className="text-sm text-slate-400 mt-2 font-medium">Your directive has been cached on the national grid.</p>
                <button onClick={() => setStatus('idle')} className="mt-10 text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] underline decoration-2 underline-offset-8">Re-Initialize Relay</button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 relative z-10 text-left">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white flex items-center gap-4 mb-10 leading-none">
              <div className="w-1.5 h-10 bg-blue-600 rounded-full shadow-[0_0_15px_#2563eb]"></div>
              Engage <span className="text-blue-500">Uplink</span>
            </h3>
            <div className="text-left">
                <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block tracking-widest ml-2">Identity Descriptor</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your Name / Organization" className="w-full p-5 bg-white/5 border-2 border-white/5 rounded-3xl focus:border-blue-600 outline-none transition-all font-bold text-white shadow-inner" required />
            </div>
            <div className="text-left">
                <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block tracking-widest ml-2">Relay Coordinate (Email)</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@address.com" className="w-full p-5 bg-white/5 border-2 border-white/5 rounded-3xl focus:border-blue-600 outline-none transition-all font-bold text-white shadow-inner" required />
            </div>
            <div className="text-left">
                <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block tracking-widest ml-2">Mission Parameters</label>
                <textarea name="message" value={formData.message} onChange={handleChange} rows={5} placeholder="Describe project scope or inquiry..." className="w-full p-5 bg-white/5 border-2 border-white/5 rounded-[2.5rem] focus:border-blue-600 outline-none transition-all font-medium text-white shadow-inner resize-none italic leading-loose" required />
            </div>
            <button type="submit" disabled={status === 'sending'} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-[2rem] disabled:opacity-50 transition-all transform active:scale-95 shadow-2xl shadow-blue-900/40 uppercase tracking-[0.4em] text-xs border border-white/10 flex items-center justify-center gap-4">
                {status === 'sending' ? (
                     <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <><RadioIcon className="h-6 w-6 text-blue-200 animate-pulse"/> Broadcast Terminal</>
                )}
            </button>
        </form>
    );
};

export const PublicProfilePage: React.FC<{ contractorId: string }> = ({ contractorId }) => {
    const { t } = useLocalization();
    const [user, setUser] = useState<User | null>(null);
    const [portfolio, setPortfolio] = useState<PortfolioProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const userProfile = await getUserProfile(contractorId);
                if (userProfile) {
                    setUser(userProfile);
                    const portfolioProjects = await getPortfolioForUser(contractorId);
                    setPortfolio(portfolioProjects);
                } else {
                    setError('Contractor node not identified.');
                }
            } catch (err) {
                setError('Neural link error.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [contractorId]);

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center"><div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
    if (error) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 font-black uppercase tracking-widest italic">{error}</div>;
    if (!user) return null;

    return (
        <div className="bg-slate-950 min-h-screen font-sans text-slate-100 flex flex-col selection:bg-blue-600/30">
            <div className="absolute inset-0 bg-carbon opacity-10 pointer-events-none"></div>
            <div className="scanline"></div>

            <header className="bg-slate-900/80 backdrop-blur-3xl border-b border-white/5 sticky top-0 z-50">
                <div className="container mx-auto px-10 py-6 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                         <div className="p-2 bg-blue-600 rounded-xl shadow-2xl">
                             <Logo className="h-8 w-auto text-white" />
                         </div>
                         <div className="text-left">
                             <h1 className="font-black text-2xl text-white italic tracking-tighter uppercase leading-none">NODE <span className="text-blue-500">DOSSIER</span></h1>
                             <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-2">Verified Operator Profile</p>
                         </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow container mx-auto px-4 md:px-10 py-16 max-w-7xl relative z-10">
                <div className="bg-slate-900 rounded-[5rem] p-10 md:p-20 shadow-2xl border border-white/5 relative overflow-hidden group mb-20 text-left">
                    <div className="absolute inset-0 bg-carbon opacity-10"></div>
                    <div className="absolute top-0 right-0 p-12 opacity-5 transform group-hover:rotate-12 transition-transform duration-2000"><SparklesIcon size={500} className="text-blue-600"/></div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-16 relative z-10 text-left">
                        <div className="relative shrink-0">
                            <div className="rounded-[4rem] p-3 bg-slate-900 border-4 border-slate-950 shadow-[0_0_100px_rgba(37,99,235,0.2)] overflow-hidden">
                                <img src={user.companyLogoUrl || `https://ui-avatars.com/api/?name=${user.name}&background=1E40AF&color=fff&size=256`} alt="Identity" className="w-64 h-64 rounded-[3rem] object-cover bg-slate-800" />
                            </div>
                            <div className="absolute -bottom-4 -right-4 bg-emerald-500 p-4 rounded-3xl shadow-2xl text-white border-8 border-slate-900 animate-bounce">
                                <ShieldCheckIcon className="h-10 w-10"/>
                            </div>
                        </div>
                        
                        <div className="text-center md:text-left flex-grow">
                            <div className="flex flex-col md:flex-row items-center gap-6 mb-8 text-left">
                                <h3 className="text-6xl font-black italic uppercase tracking-tighter text-white drop-shadow-2xl">{user.name}</h3>
                                {user.verificationStatus === 'verified' && (
                                    <div className="px-6 py-2 bg-emerald-600/10 text-emerald-400 border border-emerald-500/30 rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-2xl italic">
                                        REDLINE VERIFIED
                                    </div>
                                )}
                            </div>
                            <p className="text-3xl text-slate-400 font-medium italic max-w-3xl leading-relaxed font-serif text-left">"{user.bio || "No mission bio provided. Node currently established in Sector One."}"</p>
                        </div>
                    </div>

                    <div className="border-t border-white/5 my-20"></div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-left">
                        <div className="md:col-span-2 space-y-20">
                            <section>
                                <h4 className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-500 mb-10 flex items-center gap-4 text-left">
                                  <WrenchScrewdriverIcon className="h-6 w-6 text-blue-500" /> Specialist Core
                                </h4>
                                <div className="flex flex-wrap gap-4">
                                    {(user.specialties || ['General Unit']).map(s => (
                                        <span key={s} className="bg-white/5 text-white font-black py-4 px-8 rounded-3xl border border-white/10 hover:border-blue-500/50 transition-all uppercase tracking-widest text-xs italic shadow-xl">{s}</span>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h4 className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-500 mb-10 flex items-center gap-4 text-left">
                                  <MapPinIcon className="h-6 w-6 text-blue-500" /> Operational Sector
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-left">
                                    {user.serviceAreas?.map((area, index) => (
                                        <div key={index} className="bg-white/5 p-10 rounded-[3rem] border border-white/5 shadow-inner group hover:bg-white/10 transition-all">
                                            <p className="font-black text-white uppercase tracking-tighter italic text-2xl mb-4 leading-none">{area.stateOrProvince}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {area.cities.map(city => <span key={city} className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-1">{city}</span>)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <div className="space-y-12 text-left">
                             <div className="bg-slate-950 p-10 rounded-[4rem] border border-white/5 shadow-2xl relative group overflow-hidden text-left">
                                 <div className="absolute inset-0 bg-carbon opacity-5"></div>
                                 <h4 className="text-xl font-black italic uppercase tracking-tighter mb-10 flex items-center gap-4 text-blue-500 relative z-10 leading-none">
                                    <PhoneIcon className="h-6 w-6"/> Uplink
                                 </h4>
                                 <div className="space-y-6 relative z-10 text-left">
                                     <div className="bg-white/5 p-6 rounded-3xl border border-white/5 group hover:bg-white/10 transition-all text-left">
                                         <p className="text-[9px] font-black text-slate-600 uppercase mb-2">Voice Coordinate</p>
                                         <p className="font-black text-white italic text-lg uppercase tracking-widest">{user.contact?.phone || 'LINK_ISOLATED'}</p>
                                     </div>
                                     <div className="bg-white/5 p-6 rounded-3xl border border-white/5 group hover:bg-white/10 transition-all text-left">
                                         <p className="text-[9px] font-black text-slate-600 uppercase mb-2">Relay Packet</p>
                                         <p className="font-black text-blue-400 italic text-sm truncate">{user.email}</p>
                                     </div>
                                 </div>
                             </div>
                             <div className="bg-slate-900 p-12 rounded-[4rem] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] relative overflow-hidden">
                                 <div className="absolute inset-0 bg-blue-600 opacity-[0.03] animate-pulse"></div>
                                 <ContactForm contractorId={user.id} contractorName={user.name} />
                             </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-16">
                    <div className="flex items-center gap-8 px-10">
                        <h3 className="text-6xl font-black italic uppercase tracking-tighter text-white leading-none">Registry <span className="text-blue-500">Portfolio</span></h3>
                        <div className="h-1 flex-grow bg-white/5 rounded-full shadow-inner"></div>
                    </div>
                    {portfolio.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                            {portfolio.map(p => <PublicPortfolioCard key={p.id} project={p} onClick={() => setSelectedProject(p)} />)}
                        </div>
                    ) : (
                        <div className="text-center bg-slate-900 p-32 rounded-[5rem] border-4 border-dashed border-white/5 group hover:bg-white/5 transition-all shadow-inner">
                            <BuildingOffice2Icon className="h-24 w-24 text-slate-800 mx-auto mb-10 group-hover:scale-110 transition-transform duration-1000 opacity-20" />
                            <p className="text-2xl font-black text-slate-700 italic uppercase tracking-[0.5em]">Dossier Under Audit</p>
                        </div>
                    )}
                </div>
            </main>
            
            <div className="fixed bottom-10 left-10 pointer-events-none opacity-[0.02] -z-10 rotate-90 select-none">
                <span className="text-[180px] font-black tracking-tighter text-white uppercase italic leading-none">THE_REGISTRY</span>
            </div>

            <Footer />
            {selectedProject && (
                <div className="fixed inset-0 bg-slate-950/98 z-[200] flex items-center justify-center p-8 backdrop-blur-3xl animate-fade-in" onClick={() => setSelectedProject(null)}>
                    <div className="bg-slate-900 border border-white/10 rounded-[5rem] shadow-[0_0_100px_rgba(0,0,0,1)] p-12 max-w-6xl w-full relative overflow-hidden flex flex-col h-[85vh]" onClick={e => e.stopPropagation()}>
                        <div className="absolute inset-0 bg-carbon opacity-10"></div>
                        <button onClick={() => setSelectedProject(null)} className="absolute top-10 right-10 p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all border border-white/5 z-50"><XMarkIcon className="h-8 w-8" /></button>
                        
                        <div className="relative z-10 flex-grow flex flex-col md:flex-row gap-16 overflow-hidden">
                            <div className="md:w-1/2 space-y-6 overflow-y-auto custom-scrollbar pr-4">
                                {selectedProject.imageUrls.map((url, index) => (
                                    <img key={index} src={url} alt={`Evidence ${index + 1}`} className="w-full object-cover rounded-[3rem] border border-white/10 shadow-2xl" />
                                ))}
                            </div>
                            <div className="md:w-1/2 flex flex-col h-full text-left">
                                 <div className="flex items-center gap-3 mb-4">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                    <span className="text-[10px] font-black uppercase text-blue-400 tracking-[0.5em]">Mission Success Report</span>
                                </div>
                                <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none mb-10">{selectedProject.title}</h2>
                                <div className="flex-grow bg-black/40 rounded-[3rem] p-10 border border-white/5 shadow-inner overflow-y-auto custom-scrollbar text-left">
                                     <p className="text-[9px] font-black text-slate-600 uppercase mb-6 tracking-widest border-b border-white/5 pb-4">Dossier Narrative</p>
                                     <p className="text-xl text-slate-300 font-medium italic leading-loose font-serif">"{selectedProject.description}"</p>
                                </div>
                                <div className="mt-10 pt-10 border-t border-white/5 flex justify-between items-center text-left">
                                     <div className="text-left">
                                         <p className="text-[10px] font-black text-slate-600 uppercase mb-1">Operational Closeout</p>
                                         <p className="font-black text-white italic text-xl tracking-tighter uppercase">{new Date(selectedProject.completionDate).toLocaleDateString([], { month: 'long', year: 'numeric' })}</p>
                                     </div>
                                     <div className="p-4 bg-blue-600/10 rounded-2xl border border-blue-500/20"><RadioIcon className="h-8 w-8 text-blue-400 animate-pulse"/></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
