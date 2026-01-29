import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { XMarkIcon, UserPlusIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

interface ReferralModalProps {
    onClose: () => void;
}

const ReferralModal: React.FC<ReferralModalProps> = ({ onClose }) => {
    const { t } = useLocalization();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        // Simulate an API call
        setTimeout(() => {
            setStatus('success');
        }, 1500);
    };

    const handleReset = () => {
        setName('');
        setEmail('');
        setStatus('idle');
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="h-6 w-6"/>
                </button>
                
                {status === 'success' ? (
                    <div className="text-center p-8">
                        <CheckCircleIcon className="h-16 w-16 text-secondary mx-auto mb-4"/>
                        <h2 className="text-2xl font-bold text-primary">{t('referralSuccessTitle')}</h2>
                        <p className="text-gray-600 mt-2">{t('referralSuccessDescription')}</p>
                        <div className="mt-6 flex gap-4">
                            <button onClick={onClose} className="w-full bg-base-200 text-gray-800 font-bold py-2 px-4 rounded-lg">Close</button>
                            <button onClick={handleReset} className="w-full bg-primary text-white font-bold py-2 px-4 rounded-lg">{t('referralSendAnother')}</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-3 mb-2">
                            <UserPlusIcon className="h-8 w-8 text-primary"/>
                            <h2 className="text-2xl font-bold text-primary">{t('referralModalTitle')}</h2>
                        </div>
                        <p className="text-gray-600 mb-6">{t('referralModalDescription')}</p>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">{t('referralFormName')}</label>
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="mt-1 p-2 w-full border rounded-md" 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">{t('referralFormEmail')}</label>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="mt-1 p-2 w-full border rounded-md" 
                                    required 
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={status === 'sending'}
                                className="w-full bg-secondary hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {status === 'sending' ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">...</svg>
                                        {t('referralSending')}
                                    </>
                                ) : (
                                    t('referralSendInvite')
                                )}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReferralModal;
