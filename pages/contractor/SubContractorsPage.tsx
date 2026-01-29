
import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useDataContext';
import { useLocalization } from '../../hooks/useLocalization';
import { SubContractor } from '../../types';
import { ArrowLeftIcon, UserGroupIcon, MagnifyingGlassIcon, CheckBadgeIcon, StarIcon, PhoneIcon, ChatBubbleOvalLeftEllipsisIcon, SparklesIcon } from '@heroicons/react/24/solid';
import EmptyState from '../../components/EmptyState';
import TradeMatcherModal from '../../components/TradeMatcherModal';
import { useCurrency } from '../../hooks/useCurrency';
import { useToast } from '../../hooks/useToast';

const SubContractorCard: React.FC<{ sub: SubContractor; onContact: () => void }> = ({ sub, onContact }) => {
    const { formatCurrency } = useCurrency();
    
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow flex flex-col h-full">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold text-gray-500">
                        {sub.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 flex items-center gap-1">
                            {sub.name}
                            {sub.verified && <CheckBadgeIcon className="h-4 w-4 text-blue-500" title="Verified"/>}
                        </h3>
                        <p className="text-xs text-gray-500">{sub.trade} • {sub.location}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-100">
                    <StarIcon className="h-3 w-3 text-yellow-500"/>
                    <span className="text-xs font-bold text-yellow-700">{sub.rating}</span>
                </div>
            </div>
            
            <div className="flex flex-wrap gap-1 mb-4 flex-grow content-start">
                {sub.skills.map(skill => (
                    <span key={skill} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded">{skill}</span>
                ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t mt-auto">
                <div>
                    <p className="text-xs text-gray-400">Rate</p>
                    <p className="font-bold text-gray-800">{formatCurrency(sub.hourlyRate)}/hr</p>
                </div>
                <button 
                    onClick={onContact}
                    className="bg-primary hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2"
                >
                    <ChatBubbleOvalLeftEllipsisIcon className="h-4 w-4"/> Contact
                </button>
            </div>
        </div>
    );
};

const SubContractorsPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const { t } = useLocalization();
    const { subContractors } = useData();
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [isMatcherOpen, setIsMatcherOpen] = useState(false);

    const filteredSubs = useMemo(() => {
        return subContractors.filter(s => 
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            s.trade.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [subContractors, searchTerm]);

    const handleContact = (name: string) => {
        showToast(`Message sent to ${name}`, 'success');
    };

    const handleMatchFound = (id: string) => {
        const sub = subContractors.find(s => s.id === id);
        if(sub) setSearchTerm(sub.name);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 flex-shrink-0">
                 <div className="flex items-center gap-4">
                    {onBack && (
                        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200">
                            <ArrowLeftIcon className="h-5 w-5 text-gray-600"/>
                        </button>
                    )}
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <UserGroupIcon className="h-8 w-8 text-primary"/> Sub-Contractors
                        </h2>
                        <p className="text-sm text-gray-500">Find trusted tradespeople for your projects.</p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsMatcherOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 shadow-sm"
                >
                    <SparklesIcon className="h-5 w-5"/> AI Trade Matcher
                </button>
            </div>

            <div className="relative mb-6">
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search by name, trade (e.g. Electrician), or skill..."
                    className="w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:ring-primary focus:border-primary"
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
            </div>

            {filteredSubs.length === 0 ? (
                <EmptyState
                    icon={UserGroupIcon}
                    title="No Sub-Contractors Found"
                    message="Try adjusting your search or use the AI Trade Matcher."
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-4">
                    {filteredSubs.map(sub => (
                        <SubContractorCard 
                            key={sub.id} 
                            sub={sub} 
                            onContact={() => handleContact(sub.name)} 
                        />
                    ))}
                </div>
            )}

            {isMatcherOpen && (
                <TradeMatcherModal 
                    onClose={() => setIsMatcherOpen(false)}
                    onMatchFound={handleMatchFound}
                />
            )}
        </div>
    );
};

export default SubContractorsPage;
