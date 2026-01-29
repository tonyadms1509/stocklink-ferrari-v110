import React, { useMemo } from 'react';
import { Project, ProjectLog, ProjectExpense, Order } from '../types';
import { useData } from '../hooks/useDataContext';
import { useLocalization } from '../hooks/useLocalization';
import { useCurrency } from '../hooks/useCurrency';
import { 
    BanknotesIcon, 
    ShoppingCartIcon, 
    SparklesIcon, 
    CheckCircleIcon,
    CameraIcon,
    ArchiveBoxIcon,
    ShieldCheckIcon,
    BoltIcon,
    CloudIcon,
    ArrowRightIcon
} from '@heroicons/react/24/solid';

interface TimelineEvent {
    id: string;
    date: Date;
    type: 'log' | 'expense' | 'order' | 'milestone' | 'weather' | 'power';
    title: string;
    description: string;
    amount?: number;
    images?: string[];
    status?: string;
    impact?: 'High' | 'Medium' | 'Low';
}

const ProjectTimeline: React.FC<{ project: Project }> = ({ project }) => {
    const { formatCurrency } = useCurrency();
    const { projectLogs, projectExpenses, orders, projectMilestones } = useData();

    const timelineEvents = useMemo<TimelineEvent[]>(() => {
        const logs: TimelineEvent[] = projectLogs
            .filter(l => l.projectId === project.id)
            .map(l => ({
                id: l.id,
                date: l.date,
                type: 'log',
                title: l.type,
                description: l.content,
                images: l.images
            }));

        const expenses: TimelineEvent[] = projectExpenses
            .filter(e => e.projectId === project.id)
            .map(e => ({
                id: e.id,
                date: new Date(e.date),
                type: 'expense',
                title: 'Financial Debit',
                description: `${e.description} (${e.category})`,
                amount: e.amount
            }));

        const projectOrders: TimelineEvent[] = orders
            .filter(o => o.projectId === project.id)
            .map(o => ({
                id: o.id,
                date: o.createdAt,
                type: 'order',
                title: 'Procurement Cycle',
                description: `Order #${o.orderNumber} - Source: StockLink Grid`,
                amount: o.total,
                status: o.status
            }));

        const milestones: TimelineEvent[] = projectMilestones
            .filter(m => m.projectId === project.id && m.status === 'Released')
            .map(m => ({
                id: m.id,
                date: new Date(),
                type: 'milestone',
                title: 'Milestone Settlement',
                description: m.title,
                amount: m.amount,
                status: 'Verified'
            }));

        return [...logs, ...expenses, ...projectOrders, ...milestones].sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [projectLogs, projectExpenses, orders, projectMilestones, project.id]);

    const getIcon = (type: TimelineEvent['type']) => {
        switch (type) {
            case 'log': return CameraIcon;
            case 'expense': return BanknotesIcon;
            case 'order': return ShoppingCartIcon;
            case 'milestone': return ShieldCheckIcon;
            case 'power': return BoltIcon;
            case 'weather': return CloudIcon;
            default: return ArchiveBoxIcon;
        }
    };

    const getColor = (type: TimelineEvent['type']) => {
        switch (type) {
            case 'log': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            case 'expense': return 'text-red-400 bg-red-500/10 border-red-500/20';
            case 'order': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            case 'milestone': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'power': return 'text-amber-500 bg-amber-500/20 border-amber-500/30';
            default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
        }
    };

    return (
        <div className="bg-slate-900 border border-white/10 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-carbon opacity-10"></div>
            
            <div className="flex justify-between items-center mb-12 relative z-10">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-4 text-white">
                    <ArchiveBoxIcon className="h-7 w-7 text-blue-500"/>
                    Tactical <span className="text-blue-500">Dossier</span>
                </h3>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Log Seq: v62.1</span>
            </div>

            <div className="relative space-y-12 z-10">
                <div className="absolute left-[27px] top-4 bottom-8 w-px bg-slate-800"></div>
                {timelineEvents.map((event, index) => {
                    const Icon = getIcon(event.type);
                    const colorClasses = getColor(event.type);
                    return (
                        <div key={event.id} className="relative pl-20 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                            <div className={`absolute left-0 top-0 w-14 h-14 rounded-2xl border flex items-center justify-center z-10 transition-all hover:scale-110 shadow-lg ${colorClasses}`}>
                                <Icon className="h-6 w-6" />
                            </div>
                            
                            <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 hover:bg-white/10 hover:border-blue-500/30 transition-all duration-300 group">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-black text-white text-lg uppercase tracking-tight italic">{event.title}</h4>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{event.type.toUpperCase()} TRANSMISSION</p>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-400 font-black uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full border border-white/5">{event.date.toLocaleDateString()}</span>
                                </div>
                                
                                <p className="text-sm text-slate-300 leading-relaxed italic mb-6 font-medium">"{event.description}"</p>
                                
                                <div className="flex flex-wrap items-center gap-4">
                                    {event.amount && <div className="bg-slate-950 text-white px-4 py-2 rounded-xl text-sm font-black italic tracking-tighter border border-white/10">{formatCurrency(event.amount)}</div>}
                                    {event.status && (
                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${event.type === 'milestone' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-black/20 text-slate-400 border-white/5'}`}>
                                            {event.status}
                                        </span>
                                    )}
                                </div>
                                
                                {event.images && event.images.length > 0 && (
                                    <div className="flex gap-3 mt-6 overflow-x-auto pb-4 custom-scrollbar">
                                        {event.images.map((img, i) => (
                                            <div key={i} className="flex-shrink-0 group/img relative rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                                                <img src={img} alt="Evidence" className="h-32 w-32 object-cover grayscale group-hover/img:grayscale-0 transition-all duration-500" />
                                                <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover/img:opacity-100 transition-opacity"></div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                {timelineEvents.length === 0 && (
                    <div className="text-center py-24 bg-black/20 rounded-[3rem] border-2 border-dashed border-white/5">
                        <ArchiveBoxIcon className="h-16 w-16 text-slate-800 mx-auto mb-4 opacity-40"/>
                        <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-xs">Awaiting Tactical Feed</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectTimeline;