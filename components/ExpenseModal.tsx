
import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useData } from '../hooks/useDataContext';
import { Project, ExpenseCategory } from '../types';
import { XMarkIcon, BanknotesIcon, CameraIcon } from '@heroicons/react/24/solid';
import ExpenseScannerModal from './ExpenseScannerModal';

interface ExpenseModalProps {
    onClose: () => void;
    initialProjectId?: string;
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({ onClose, initialProjectId }) => {
    const { t } = useLocalization();
    const { projects, addExpense } = useData();
    const [projectId, setProjectId] = useState(initialProjectId || (projects[0]?.id || ''));
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.Materials);
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (projectId && description && amount) {
            await addExpense({
                projectId,
                description,
                category,
                amount: parseFloat(amount),
                date: new Date(date).toISOString(),
            });
            onClose();
        }
    };

    if (isScannerOpen && projectId) {
        return <ExpenseScannerModal projectId={projectId} onClose={() => { setIsScannerOpen(false); onClose(); }} onScanComplete={() => onClose()} />;
    }

    return (
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in-scale">
            <div className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-8 max-w-md w-full relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="h-6 w-6" />
                </button>
                
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                        <BanknotesIcon className="h-6 w-6"/>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">{t('logExpenseTitle')}</h2>
                </div>

                {/* Scan Button */}
                <div className="mb-6">
                    <button 
                        onClick={() => setIsScannerOpen(true)}
                        className="w-full py-3 border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                        disabled={!projectId}
                        title={!projectId ? "Select a project first" : ""}
                    >
                        <CameraIcon className="h-5 w-5"/>
                        {t('expenseScannerButton')}
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-2">or enter manually below</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('tenderSelectProject')}</label>
                        <select value={projectId} onChange={e => setProjectId(e.target.value)} className="w-full p-3 border rounded-lg bg-white/50 focus:ring-2 focus:ring-primary focus:border-transparent" required>
                            <option value="" disabled>{t('tenderSelectProject')}</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('formExpenseDescription')}</label>
                        <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 border rounded-lg bg-white/50 focus:ring-2 focus:ring-primary focus:border-transparent" required placeholder="e.g. Paint Supplies" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('rfsCategory')}</label>
                            <select value={category} onChange={e => setCategory(e.target.value as ExpenseCategory)} className="w-full p-3 border rounded-lg bg-white/50 focus:ring-2 focus:ring-primary focus:border-transparent">
                                {Object.values(ExpenseCategory).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('formExpenseAmount')}</label>
                            <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-3 border rounded-lg bg-white/50 font-bold focus:ring-2 focus:ring-primary focus:border-transparent" required placeholder="0.00" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('quoteDate')}</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-3 border rounded-lg bg-white/50 focus:ring-2 focus:ring-primary focus:border-transparent" required />
                    </div>
                    <div className="pt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="bg-gray-100 text-gray-700 font-bold py-2.5 px-5 rounded-lg hover:bg-gray-200 transition-colors">{t('payoutCancel')}</button>
                        <button type="submit" className="bg-blue-600 text-white font-bold py-2.5 px-5 rounded-lg hover:bg-blue-700 shadow-md transition-transform active:scale-95">{t('projectAddExpense')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExpenseModal;
