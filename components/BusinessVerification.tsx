import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useDataContext';
import { useLocalization } from '../hooks/useLocalization';
import { BusinessDetails } from '../types';
import { ShieldCheckIcon, ClockIcon, DocumentArrowUpIcon } from '@heroicons/react/24/solid';

const BusinessVerification: React.FC = () => {
    const { user } = useAuth();
    const { requestBusinessVerification } = useData();
    const { t } = useLocalization();
    const [details, setDetails] = useState<BusinessDetails>({
        registrationNumber: user?.businessDetails?.registrationNumber || '',
        vatNumber: user?.businessDetails?.vatNumber || '',
    });
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
            <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg flex items-center gap-3">
                <ShieldCheckIcon className="h-8 w-8 text-green-500"/>
                <div>
                    <h5 className="font-bold text-green-800">{t('profileVerificationVerified')}</h5>
                    <p className="text-sm text-green-700">{t('profileVerificationVerifiedMessage')}</p>
                </div>
            </div>
        )
    }

    if (user.verificationStatus === 'pending') {
         return (
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg flex items-center gap-3">
                <ClockIcon className="h-8 w-8 text-yellow-500"/>
                <div>
                    <h5 className="font-bold text-yellow-800">{t('profileVerificationPending')}</h5>
                    <p className="text-sm text-yellow-700">{t('profileVerificationPendingMessage')}</p>
                </div>
            </div>
        )
    }

    return (
        <div>
             <h4 className="font-bold text-lg flex items-center gap-2 mb-2"><ShieldCheckIcon className="h-5 w-5 text-primary" /> {t('profileBusinessVerification')}</h4>
             <p className="text-sm text-gray-700 mb-4">{t('profileVerificationDescription')}</p>
             <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium">{t('profileVerificationRegNum')}</label>
                        <input type="text" value={details.registrationNumber} onChange={e => setDetails(d => ({...d, registrationNumber: e.target.value}))} className="mt-1 p-2 w-full border rounded-md" required />
                     </div>
                     <div>
                        <label className="block text-sm font-medium">{t('profileVerificationVatNum')}</label>
                        <input type="text" value={details.vatNumber} onChange={e => setDetails(d => ({...d, vatNumber: e.target.value}))} className="mt-1 p-2 w-full border rounded-md" />
                     </div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium">{t('profileVerificationUpload')}</label>
                    <label htmlFor="file-upload" className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-primary">
                        <div className="space-y-1 text-center">
                            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400"/>
                            <div className="flex text-sm text-gray-600">
                                <p className="pl-1">{fileName ? fileName : 'Upload a file (e.g., your CIPC document)'}</p>
                            </div>
                        </div>
                    </label>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                 </div>
                 <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-800">{t('profileVerificationSubmit')}</button>
             </form>
        </div>
    )
}

export default BusinessVerification;
