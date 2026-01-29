
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useDataContext';
import { useLocalization } from '../../hooks/useLocalization';
import { UserGroupIcon, PlusIcon, EnvelopeIcon, TrashIcon, UserCircleIcon, IdentificationIcon } from '@heroicons/react/24/solid';
import { CompanyMember, CompanyUserRole } from '../../types';
import EmptyState from '../../components/EmptyState';

// Invite Modal
const InviteModal: React.FC<{ onInvite: (email: string, role: CompanyUserRole) => void; onClose: () => void; availableRoles: CompanyUserRole[] }> = ({ onInvite, onClose, availableRoles }) => {
    const { t } = useLocalization();
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<CompanyUserRole>(availableRoles[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onInvite(email, role);
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[80] p-4 animate-fade-in-scale">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
                <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                    <UserGroupIcon className="h-6 w-6 text-primary"/> {t('teamInviteNew')}
                </h3>
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">{t('teamEmail')}</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all" required placeholder="colleague@company.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">{t('teamRole')}</label>
                        <select value={role} onChange={e => setRole(e.target.value as CompanyUserRole)} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all">
                            {availableRoles.map(r => <option key={r} value={r}>{t(`role_${r}` as any)}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-8">
                    <button type="button" onClick={onClose} className="bg-gray-100 text-gray-700 font-bold py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors">{t('payoutCancel')}</button>
                    <button type="submit" className="bg-primary text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 shadow-md transition-transform active:scale-95">{t('teamSendInvite')}</button>
                </div>
            </form>
        </div>
    );
};

const MemberCard: React.FC<{ member: CompanyMember, onRemove: () => void, onRoleChange: (role: CompanyUserRole) => void, isOwner: boolean, availableRoles: CompanyUserRole[] }> = ({ member, onRemove, onRoleChange, isOwner, availableRoles }) => {
    const roleColors = {
        [CompanyUserRole.Owner]: 'bg-gray-900 text-white',
        [CompanyUserRole.Admin]: 'bg-purple-600 text-white',
        [CompanyUserRole.Member]: 'bg-blue-500 text-white',
        [CompanyUserRole.Sales]: 'bg-green-600 text-white',
        [CompanyUserRole.Warehouse]: 'bg-orange-500 text-white',
        [CompanyUserRole.Driver]: 'bg-yellow-500 text-white',
    };

    const headerColor = roleColors[member.role] || 'bg-gray-500 text-white';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full group">
            <div className={`${headerColor} px-4 py-3 flex justify-between items-center`}>
                <span className="text-xs font-extrabold uppercase tracking-widest opacity-90">ID: {member.id.slice(-4).toUpperCase()}</span>
                <IdentificationIcon className="h-5 w-5 opacity-50"/>
            </div>
            <div className="p-6 flex flex-col items-center flex-grow text-center">
                <div className="w-20 h-20 rounded-full bg-gray-100 border-4 border-white shadow-md -mt-14 mb-4 flex items-center justify-center overflow-hidden">
                     <img 
                        src={`https://ui-avatars.com/api/?name=${member.name}&background=random&color=fff`} 
                        alt={member.name} 
                        className="w-full h-full object-cover"
                    />
                </div>
                <h4 className="text-lg font-bold text-gray-900">{member.name}</h4>
                <p className="text-sm text-gray-500 font-medium flex items-center gap-1 mt-1 mb-4">
                    <EnvelopeIcon className="h-3 w-3"/> {member.email}
                </p>
                
                <div className="w-full mt-auto pt-4 border-t border-gray-100">
                     {member.role === CompanyUserRole.Owner ? (
                        <div className="py-2 text-sm font-bold text-gray-400 uppercase tracking-wider cursor-default">Owner Access</div>
                    ) : (
                         <div className="flex items-center justify-between gap-2">
                            <select 
                                value={member.role}
                                onChange={(e) => onRoleChange(e.target.value as CompanyUserRole)}
                                className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 font-semibold"
                                disabled={!isOwner}
                            >
                                {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            {isOwner && (
                                <button 
                                    onClick={onRemove} 
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Remove Member"
                                >
                                    <TrashIcon className="h-5 w-5"/>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const TeamPage: React.FC = () => {
    const { t } = useLocalization();
    const { currentCompany } = useAuth();
    const { companyMembers, inviteUser, removeUser, updateUserRole } = useData();
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    const contractorRoles = [CompanyUserRole.Admin, CompanyUserRole.Member];
    const supplierRoles = [CompanyUserRole.Admin, CompanyUserRole.Sales, CompanyUserRole.Warehouse, CompanyUserRole.Driver];
    const availableRoles = currentCompany?.type === 'supplier' ? supplierRoles : contractorRoles;

    const handleInvite = (email: string, role: CompanyUserRole) => {
        inviteUser(email, role);
        setIsInviteModalOpen(false);
    };

    const handleRoleChange = (memberId: string, newRole: CompanyUserRole) => {
        updateUserRole(memberId, newRole);
    };
    
    const handleRemove = (memberId: string) => {
        if (confirm('Are you sure you want to remove this team member?')) {
            removeUser(memberId);
        }
    }

    return (
        <>
            <div className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-8 flex-shrink-0">
                    <div>
                        <h2 className="text-3xl font-extrabold flex items-center gap-3 text-gray-900"><UserGroupIcon className="h-8 w-8 text-primary"/>{t('teamTitle')}</h2>
                        <p className="text-gray-600 mt-1">{t('teamDescription')}</p>
                    </div>
                    <button onClick={() => setIsInviteModalOpen(true)} className="bg-secondary hover:bg-emerald-600 text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 shadow-md transition-transform hover:-translate-y-0.5 active:scale-95">
                        <PlusIcon className="h-5 w-5"/>
                        {t('teamInviteNew')}
                    </button>
                </div>

                {companyMembers.length === 0 ? (
                    <EmptyState
                        icon={UserGroupIcon}
                        title="Build Your Team"
                        message="Invite colleagues to collaborate on projects and share resources."
                        action={
                            <button onClick={() => setIsInviteModalOpen(true)} className="mt-4 bg-primary text-white font-bold py-2 px-4 rounded-lg">
                                Invite Member
                            </button>
                        }
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
                        {companyMembers.map(member => (
                            <MemberCard 
                                key={member.id} 
                                member={member} 
                                onRemove={() => handleRemove(member.id)}
                                onRoleChange={(role) => handleRoleChange(member.id, role)}
                                isOwner={true} // Mock: assume current user has rights
                                availableRoles={availableRoles}
                            />
                        ))}
                    </div>
                )}
            </div>
            {isInviteModalOpen && <InviteModal onInvite={handleInvite} onClose={() => setIsInviteModalOpen(false)} availableRoles={availableRoles} />}
        </>
    );
};

export default TeamPage;
