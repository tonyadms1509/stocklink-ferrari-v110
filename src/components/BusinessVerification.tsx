import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useDataContext';
import { useLocalization } from '../hooks/useLocalization';
import { BusinessDetails } from '../types';
import { ShieldCheckIcon, ClockIcon, DocumentArrowUpIcon, ShieldExclamationIcon } from '@heroicons/react/24/solid';

const BusinessVerification: React.FC = () => {
    const { user } = useAuth();
    const { requestBusinessVerification } = useData();
    const { t } = useLocalization();
    const { isRuggedMode } = useData();
    const [details, setDetails] = useState<BusinessDetails>({
        registrationNumber: user?.businessDetails?.registrationNumber || '',
        vatNumber: user?.businessDetails?.vatNumber || '',
    });
    const [beeLevel, setBeeLevel] = useState('1');
    const [fileName, setFileName] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFileName(e.target.files[0].name);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await requestBusinessVerification(details);
    }

    if (!user) return null;
    
    if (user.verificationStatus === 'verified') {
        return (
            <div className={`p-8 border-l-[12px] rounded-r-[2rem] flex items-center gap-6 shadow-2xl transition-all duration-700 ${isRuggedMode ? 'bg-white border-black' : 'bg-emerald-500/10 border-emerald-500'}`}>
                <ShieldCheckIcon className={`h-12 w-12 ${isRuggedMode ? 'text-black' : 'text-emerald-500 shadow-[0_0_20px_#10b981]'}`}/>
                <div>
                    <h5 className={`font-black uppercase italic tracking-tighter text-xl ${isRuggedMode ? 'text-black' : 'text-emerald-400'}`}>Identity Verified</h5>
                    <p className={`text-xs font-black tracking-tight mt-1 ${isRuggedMode ? 'text-black' : 'text-emerald-100/60'}`}>G7 Authentication Protocol successfully established.</p>
                </div>
            </div>
        )
    }

    return (
        <div className={`border p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group transition-all duration-700 ${isRuggedMode ? 'bg-white border-black border-[4px]' : 'bg-slate-900 border-white/5'}`}>
             {!isRuggedMode && <div className="absolute inset-0 bg-carbon opacity-5"></div>}
             <h4 className={`font-black text-2xl italic uppercase tracking-tighter flex items-center gap-4 mb-6 ${isRuggedMode ? 'text-black' : 'text-white'}`}>
                 <ShieldExclamationIcon className={`h-8 w-8 animate-pulse ${isRuggedMode ? 'text-black' : 'text-red-600'}`} /> 
                 Verification <span className={isRuggedMode ? 'text-black' : 'text-red-600'}>Matrix</span>
             </h4>
             <p className={`text-sm mb-10 leading-relaxed font-black ${isRuggedMode ? 'text-black' : 'text-slate-400'}`}>Transmit your corporate credentials to the national grid to unlock high-value procurement tiers and public tenders.</p>
             
             <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div className="text-left">
                        <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${isRuggedMode ? 'text-black' : 'text-slate-500'}`}>CIPC Registry Number</label>
                        <input type="text" value={details.registrationNumber} onChange={e => setDetails(d => ({...d, registrationNumber: e.target.value}))} className={`w-full p-4 border-2 rounded-2xl font-black outline-none focus:border-red-600 transition-all ${isRuggedMode ? 'bg-white border-black text-black' : 'bg-white/5 border-white/10 text-white'}`} required placeholder="e.g. 2024/123456/07" />
                     </div>
                     <div className="text-left">
                        <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${isRuggedMode ? 'text-black' : 'text-slate-500'}`}>B-BBEE Recognition Level</label>
                        <select value={beeLevel} onChange={e => setBeeLevel(e.target.value)} className={`w-full p-4 border-2 rounded-2xl font-black outline-none focus:border-red-600 transition-all appearance-none ${isRuggedMode ? 'bg-white border-black text-black' : 'bg-white/5 border-white/10 text-white'}`}>
                            {[1,2,3,4,5,6,7,8].map(l => <option key={l} value={l} className="bg-slate-900">Level {l}</option>)}
                        </select>
                     </div>
                 </div>
                 
                 <div className="text-left">
                    <label className={`block text-[10px] font-black uppercase tracking-widest mb-3 ${isRuggedMode ? 'text-black' : 'text-slate-500'}`}>Supporting Documentation (BEE/CIPC)</label>
                    <label htmlFor="file-upload-bee" className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-3xl cursor-pointer transition-all group ${isRuggedMode ? 'border-black bg-slate-50 border-4' : 'border-white/10 bg-black/20 hover:bg-white/5'}`}>
                        <DocumentArrowUpIcon className={`h-10 w-10 mb-3 group-hover:scale-110 transition-all ${isRuggedMode ? 'text-black' : 'text-slate-600 group-hover:text-blue-500'}`}/>
                        <p className={`text-xs font-black uppercase tracking-widest ${isRuggedMode ? 'text-black' : 'text-slate-500'}`}>{fileName ? fileName : 'Initialize Document Intake'}</p>
                        <input id="file-upload-bee" type="file" className="sr-only" onChange={handleFileChange} />
                    </label>
                 </div>

                 <button type="submit" className={`w-full font-black py-5 rounded-2xl uppercase tracking-[0.3em] text-[10px] shadow-2xl transition-all transform active:scale-95 border-4 ${isRuggedMode ? 'bg-black text-white border-black' : 'bg-slate-100 text-slate-950 border-slate-900'}`}>Execute Authentication</button>
             </form>
        </div>
    )
}

export default BusinessVerification;