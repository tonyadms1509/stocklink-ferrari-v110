
import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useDataContext';
import { useAuth } from '../../hooks/useAuth';
import { useLocalization } from '../../hooks/useLocalization';
import { useCurrency } from '../../hooks/useCurrency';
import { Tender, TenderStatus, TenderBid, TenderBidItem, AITenderAnalysisReport } from '../../types';
import { ArrowLeftIcon, BuildingLibraryIcon, PlusIcon, XMarkIcon, ChevronDownIcon, SparklesIcon, DocumentTextIcon, ClockIcon, ChartBarIcon, PaperClipIcon, LockClosedIcon } from '@heroicons/react/24/solid';
import EmptyState from '../../components/EmptyState';

// --- Reusable Components --- //
const getStatusColor = (status: TenderStatus) => {
    switch (status) {
        case TenderStatus.Open: return 'bg-green-100 text-green-800 border-green-200';
        case TenderStatus.Awarded: return 'bg-blue-100 text-blue-800 border-blue-200';
        case TenderStatus.Closed: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
};

// --- Create Tender Modal (Unchanged) --- //
const CreateTenderModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t } = useLocalization();
    const { projects, projectMaterials, createTender } = useData();
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [deadline, setDeadline] = useState('');

    const materialsForSelectedProject = useMemo(() => {
        if (!selectedProjectId) return [];
        return projectMaterials
            .filter(m => m.projectId === selectedProjectId)
            .map(m => ({ materialId: m.id, productName: m.productName, quantity: m.quantity }));
    }, [selectedProjectId, projectMaterials]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const project = projects.find(p => p.id === selectedProjectId);
        if (!project || !deadline || materialsForSelectedProject.length === 0) {
            alert("Please select a project with materials and set a deadline.");
            return;
        }
        await createTender({
            projectId: project.id,
            projectName: project.projectName,
            materials: materialsForSelectedProject,
            deadline: new Date(deadline),
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in-scale">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><XMarkIcon className="h-6 w-6"/></button>
                <div className="flex items-center gap-3 mb-6">
                     <div className="bg-primary/10 p-3 rounded-full">
                        <BuildingLibraryIcon className="h-8 w-8 text-primary"/>
                     </div>
                     <h2 className="text-2xl font-bold text-gray-900">{t('tenderCreateTitle')}</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">{t('tenderSelectProject')}</label>
                        <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white transition-colors" required>
                            <option value="" disabled>Select a project...</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
                        </select>
                    </div>
                    
                    {materialsForSelectedProject.length > 0 ? (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-2">{t('tenderMaterialsList')}</h3>
                            <ul className="text-sm text-blue-900 max-h-32 overflow-y-auto space-y-1 custom-scrollbar pr-1">
                                {materialsForSelectedProject.map(m => <li key={m.materialId}>• {m.quantity} x {m.productName}</li>)}
                            </ul>
                        </div>
                    ) : selectedProjectId ? (
                        <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">No materials found in this project. Add materials first.</p>
                    ) : null}

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">{t('tenderSetDeadline')}</label>
                        <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full p-3 border rounded-lg" required min={new Date().toISOString().split('T')[0]} />
                    </div>

                    <button type="submit" className="w-full bg-secondary text-white font-bold py-3 px-4 rounded-xl hover:bg-emerald-600 shadow-md transition-transform hover:-translate-y-0.5 mt-2">
                        {t('tenderPublish')}
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- Bid Comparison View (Unchanged) --- //
const BidComparisonView: React.FC<{ tender: Tender; bids: TenderBid[]; onAward: (bid: TenderBid) => Promise<void> }> = ({ tender, bids, onAward }) => {
    const { t } = useLocalization();
    const { formatCurrency } = useCurrency();

    const bidComparisonData = useMemo(() => {
        return tender.materials.map(material => {
            const prices = bids.map(bid => {
                const bidItem = bid.items.find(i => i.materialId === material.materialId);
                return bidItem?.pricePerUnit;
            });
            const lowestPrice = Math.min(...prices.filter((p): p is number => p !== undefined && p > 0));
            return { material, prices, lowestPrice };
        });
    }, [tender, bids]);

    const handleAward = async (bid: TenderBid) => {
        if (window.confirm(`Are you sure you want to award this tender to ${bid.supplierName} for ${formatCurrency(bid.totalBidAmount)}?`)) {
            await onAward(bid);
        }
    };

    return (
        <div className="bg-gray-50 p-6 border-t border-gray-200 animate-fade-in-up">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ChartBarIcon className="h-5 w-5 text-gray-600"/> {t('tenderBidComparison')}
            </h3>
            <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left bg-gray-100 border-b">
                            <th className="p-3 font-bold text-gray-700 w-1/3">{t('tenderItem')}</th>
                            <th className="p-3 font-bold text-center text-gray-700 border-l">{t('tenderLowestBid')}</th>
                            {bids.map(bid => <th key={bid.id} className="p-3 font-bold text-center text-gray-700 border-l">{bid.supplierName}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {bidComparisonData.map(({ material, prices, lowestPrice }, idx) => (
                            <tr key={material.materialId} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                <td className="p-3 font-medium text-gray-800 border-b border-gray-100">{material.productName} <span className="text-gray-500 text-xs">x{material.quantity}</span></td>
                                <td className="p-3 text-center font-bold text-green-600 border-b border-gray-100 border-l">{lowestPrice !== Infinity ? formatCurrency(lowestPrice) : '-'}</td>
                                {prices.map((price, index) => (
                                    <td key={index} className={`p-3 text-center border-b border-gray-100 border-l ${price === lowestPrice && price > 0 ? 'bg-green-50 text-green-700 font-bold' : 'text-gray-600'}`}>
                                        {price !== undefined ? formatCurrency(price) : '-'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        <tr className="bg-gray-800 text-white font-bold">
                            <td className="p-3">{t('tenderTotal')}</td>
                            <td className="p-3 border-l border-gray-600"></td>
                            {bids.map(bid => (
                                <td key={bid.id} className="p-3 text-center border-l border-gray-600">{formatCurrency(bid.totalBidAmount)}</td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
             {tender.status === TenderStatus.Open && bids.length > 0 && (
                 <div className="mt-6 flex justify-end gap-4">
                    {bids.map(bid => (
                        <button key={bid.id} onClick={() => handleAward(bid)} className="bg-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-600 shadow-md transition-transform hover:-translate-y-0.5">
                            {t('tenderAward')} to {bid.supplierName}
                        </button>
                    ))}
                </div>
             )}
        </div>
    );
};

// --- Dossier Style Tender Analysis Modal ---
const TenderAnalysisModal: React.FC<{ analysis: AITenderAnalysisReport; tender: Tender; onClose: () => void }> = ({ analysis, tender, onClose }) => {
    const { t } = useLocalization();
    const { formatCurrency } = useCurrency();

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-[100] p-4 animate-fade-in-scale backdrop-blur-sm">
            {/* Manila Folder Container */}
            <div className="relative bg-[#f0e6d2] rounded-lg shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col transform rotate-1 border-t border-white/50 overflow-hidden">
                
                {/* Folder Tab */}
                <div className="absolute -top-6 left-0 w-48 h-10 bg-[#e0d6c2] rounded-t-lg border-t border-l border-r border-white/40"></div>

                {/* Paperclip Decoration */}
                <div className="absolute top-0 right-8 w-12 z-20 text-gray-400 drop-shadow-md transform -translate-y-1/2">
                     <PaperClipIcon className="h-12 w-12" />
                </div>

                {/* CONFIDENTIAL Stamp */}
                <div className="absolute top-20 right-12 border-4 border-red-700 text-red-700 text-opacity-30 border-opacity-30 font-black text-4xl p-2 transform -rotate-12 select-none pointer-events-none z-0">
                    CONFIDENTIAL
                </div>

                {/* Header Area */}
                <div className="p-8 border-b border-[#d0c6b2] relative z-10">
                     <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 text-gray-600 mb-1">
                                <LockClosedIcon className="h-4 w-4"/>
                                <span className="text-xs font-mono uppercase tracking-widest">Document Ref: {tender.tenderNumber}</span>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800 font-mono tracking-tighter uppercase">Bid Analysis Report</h2>
                            <p className="text-sm text-gray-600 font-mono mt-1">Subject: {tender.projectName}</p>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XMarkIcon className="h-8 w-8"/></button>
                    </div>
                </div>

                {/* Content Area (Paper look) */}
                <div className="flex-grow bg-[#fdfbf7] m-4 mt-0 shadow-inner border border-[#d0c6b2] overflow-y-auto p-8 font-mono text-sm text-gray-700 leading-relaxed relative">
                     {/* Background Lines */}
                     <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '100% 2rem', marginTop: '2.5rem' }}></div>
                     
                     <div className="relative z-10 space-y-8">
                        {/* Summary Section */}
                        <section>
                            <h3 className="text-xs font-bold uppercase tracking-widest border-b-2 border-gray-800 pb-1 mb-4">01. Executive Summary</h3>
                            <p className="text-base">{analysis.summary}</p>
                        </section>

                        {/* Best Price Table */}
                        <section>
                            <h3 className="text-xs font-bold uppercase tracking-widest border-b-2 border-gray-800 pb-1 mb-4">02. Line Item Analysis</h3>
                            <div className="border border-gray-300 bg-white">
                                {analysis.bestPricePerItem.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center p-2 border-b border-gray-100 last:border-0 hover:bg-yellow-50">
                                        <span className="font-bold">{item.materialName}</span>
                                        <div className="text-right">
                                            <span className="block font-bold">{formatCurrency(item.bestPrice)}</span>
                                            <span className="text-xs text-gray-500 uppercase">Via {item.supplierName}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Strategic Recommendation */}
                         <section>
                            <h3 className="text-xs font-bold uppercase tracking-widest border-b-2 border-gray-800 pb-1 mb-4">03. Strategic Recommendation</h3>
                            <div className="flex gap-6 items-start">
                                 <div className="bg-green-100 border-2 border-green-700 p-4 w-1/3 text-center transform -rotate-1 shadow-sm">
                                     <p className="text-xs uppercase font-bold text-green-800 mb-1">Potential Savings</p>
                                     <p className="text-2xl font-black text-green-900">{formatCurrency(analysis.bestCaseTotal)}</p>
                                 </div>
                                 <p className="w-2/3 bg-yellow-50 p-4 border border-yellow-200 text-gray-800">
                                     {analysis.recommendation}
                                 </p>
                            </div>
                        </section>
                        
                        <div className="pt-8 text-center text-xs text-gray-400 uppercase tracking-widest">
                            *** End of Report ***
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

interface TendersPageProps {
    onBack?: () => void;
}

// --- Main Page Component --- //
const TendersPage: React.FC<TendersPageProps> = ({ onBack }) => {
    const { tenders, tenderBids, acceptTenderBid, generateTenderAnalysis, clearTenderAnalysis, tenderAnalysis, isAILoading } = useData();
    const { user } = useAuth();
    const { t } = useLocalization();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [expandedTenderId, setExpandedTenderId] = useState<string | null>(null);
    const [analyzingTenderId, setAnalyzingTenderId] = useState<string | null>(null);

    const myTenders = useMemo(() => {
        if (!user) return [];
        return tenders
            .filter(t => t.contractorId === user.id)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }, [tenders, user]);

    const handleAnalyze = async (tenderId: string) => {
        setAnalyzingTenderId(tenderId);
        await generateTenderAnalysis(tenderId);
    };

    const handleCloseAnalysis = () => {
        clearTenderAnalysis();
        setAnalyzingTenderId(null);
    };

    return (
        <>
            <div className="h-full flex flex-col">
                 {onBack && (
                    <button onClick={onBack} className="flex items-center text-sm text-primary hover:underline mb-4 font-medium">
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        {t('backToDashboard')}
                    </button>
                )}
                <div className="flex justify-between items-center mb-8 flex-shrink-0">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <BuildingLibraryIcon className="h-8 w-8 text-primary"/> {t('tendersTitle')}
                        </h2>
                        <p className="text-gray-500 mt-1">{t('tendersDescription')}</p>
                    </div>
                    <button onClick={() => setIsCreateModalOpen(true)} className="bg-secondary hover:bg-emerald-600 text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 shadow-md transition-transform hover:-translate-y-0.5">
                        <PlusIcon className="h-5 w-5"/>
                        {t('tendersCreate')}
                    </button>
                </div>

                {myTenders.length === 0 ? (
                     <EmptyState
                        icon={DocumentTextIcon}
                        title={t('tendersNoTenders')}
                        message={t('tendersNoTendersDesc')}
                    />
                ) : (
                    <div className="space-y-6 flex-grow overflow-y-auto pb-10">
                        {myTenders.map(tender => {
                            const bidsForTender = tenderBids.filter(b => b.tenderId === tender.id);
                            const isExpanded = expandedTenderId === tender.id;
                            const canAnalyze = bidsForTender.length > 1;
                            
                            return (
                                <div key={tender.id} className={`bg-white rounded-xl shadow-sm border transition-all duration-300 ${isExpanded ? 'border-primary ring-1 ring-primary shadow-lg' : 'border-gray-200 hover:shadow-md'}`}>
                                    {/* Card Header / Summary */}
                                    <div className="p-6 cursor-pointer" onClick={() => setExpandedTenderId(isExpanded ? null : tender.id)}>
                                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className="bg-gray-100 p-3 rounded-lg hidden sm:block">
                                                    <DocumentTextIcon className="h-6 w-6 text-gray-500"/>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h3 className="text-lg font-bold text-gray-900">{tender.projectName}</h3>
                                                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${getStatusColor(tender.status)}`}>
                                                            {t(`tenderStatus_${tender.status}` as any)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 font-mono">{tender.tenderNumber} • {tender.materials.length} items requested</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-6 text-sm text-gray-600 w-full lg:w-auto justify-between lg:justify-end">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs text-gray-400 uppercase font-bold">Deadline</span>
                                                    <span className="font-semibold flex items-center gap-1">
                                                        <ClockIcon className="h-4 w-4 text-gray-400"/>
                                                        {new Date(tender.deadline).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs text-gray-400 uppercase font-bold">Bids</span>
                                                    <span className="font-bold text-lg text-primary">{tender.bidsCount}</span>
                                                </div>
                                                <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                            </div>
                                        </div>
                                        
                                        {/* AI Action Button visible in summary if expanded or applicable */}
                                        {canAnalyze && !isExpanded && (
                                             <div className="mt-4 pt-4 border-t flex justify-end">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleAnalyze(tender.id); }}
                                                    disabled={isAILoading.tenderAnalysis}
                                                    className="text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                                                >
                                                    <SparklesIcon className="h-3 w-3"/> {t('tenderAnalyzeBids')}
                                                </button>
                                             </div>
                                        )}
                                    </div>

                                    {/* Expanded Content */}
                                    {isExpanded && (
                                        <>
                                            {canAnalyze && (
                                                <div className="px-6 pb-4 flex justify-end">
                                                     <button 
                                                        onClick={() => handleAnalyze(tender.id)}
                                                        disabled={isAILoading.tenderAnalysis}
                                                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center gap-2 shadow-sm disabled:opacity-50"
                                                    >
                                                        {isAILoading.tenderAnalysis ? <SparklesIcon className="h-4 w-4 animate-spin"/> : <SparklesIcon className="h-4 w-4"/>}
                                                        {t('tenderAnalyzeBids')} with AI
                                                    </button>
                                                </div>
                                            )}
                                            {bidsForTender.length > 0 ? (
                                                <BidComparisonView tender={tender} bids={bidsForTender} onAward={acceptTenderBid} />
                                            ) : (
                                                <div className="bg-gray-50 p-8 text-center border-t border-gray-200">
                                                    <p className="text-gray-500 italic">No bids received yet. Check back later.</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {isCreateModalOpen && <CreateTenderModal onClose={() => setIsCreateModalOpen(false)} />}
            
            {tenderAnalysis && analyzingTenderId && (
                 <TenderAnalysisModal 
                    analysis={tenderAnalysis}
                    tender={tenders.find(t => t.id === analyzingTenderId)!}
                    onClose={handleCloseAnalysis}
                />
            )}
        </>
    );
};

export default TendersPage;
