import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useDataContext.tsx';
import { useLocalization } from '../../hooks/useLocalization.tsx';
import { ProjectLog } from '../../types.ts';
import { 
    ArrowLeftIcon, SunIcon, CloudIcon, 
    PlusIcon, UserGroupIcon, ExclamationTriangleIcon, 
    TruckIcon, CameraIcon, CalendarDaysIcon, 
    ShieldCheckIcon, ClockIcon, SparklesIcon,
    MicIcon, MapPinIcon, BoltIcon
} from '@heroicons/react/24/solid';
import { useAuth } from '../../hooks/useAuth.tsx';
import { useToast } from '../../hooks/useToast.tsx';
import EmptyState from '../../components/EmptyState.tsx';
import VoiceMemoModal from '../../components/VoiceMemoModal.tsx';
import IncidentReportModal from '../../components/IncidentReportModal.tsx';

const SiteDiaryPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const { t } = useLocalization();
    const { projects, projectLogs, createProjectLog } = useData();
    const { user } = useAuth();
    const { showToast } = useToast();

    const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
    const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);

    const project = projects.find(p => p.id === selectedProjectId);

    const dailyLogs = useMemo(() => {
        return projectLogs
            .filter(l => l.projectId === selectedProjectId && new Date(l.date).toISOString().split('T')[0] === selectedDate)
            .sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [projectLogs, selectedProjectId, selectedDate]);

    const handleQuickLog = async (type: string, message: string) => {
        if (!selectedProjectId) return;
        await createProjectLog({
            projectId: selectedProjectId,
            type: type as any,
            content: message
        });
        showToast('Entry logged to grid', 'success');
    };

    const getLogIcon = (type: string) => {
        switch (type) {
            case 'Incident': return ExclamationTriangleIcon;
            case 'Issue': return ExclamationTriangleIcon;
            case 'Safety Audit': return ShieldCheckIcon;
            case 'Delivery': return TruckIcon;
            case 'Attendance': return UserGroupIcon;
            default: return CalendarDaysIcon;
        }
    };

    return (
        <div className="h-full flex flex-col font-sans selection:bg-red-600/30 text-left">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-12 mb-12">
                <div className="text-left">
                    <div className="flex items-center gap-3 mb-4 text-red-600">
                        <ClockIcon className="h-8 w-8 animate-pulse shadow-[0_0_20px_red]" />
                        <span className="text-[12px] font-black uppercase tracking-[0.6em] italic text-red-600">SITE DIARY v80.5 REDLINE</span>
                    </div>
                    <h1 className="text-7xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">DAILY <span className="text-red-600">DOSSIER</span></h1>
                </div>
                <div className="flex gap-4 bg-slate-900 p-2 rounded-[2rem] border border-white/5 shadow-2xl backdrop-blur-xl">
                    <div className="flex flex-col gap-1 px-6 text-left border-r border-white/5">
                        <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Active Node</label>
                        <select 
                            value={selectedProjectId} 
                            onChange={e => setSelectedProjectId(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 text-white font-black text-xs uppercase italic tracking-tighter appearance-none cursor-pointer hover:text-red-500 transition-colors"
                        >
                            {projects.map(p => <option key={p.id} value={p.id} className="bg-slate-900">{p.projectName}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1 px-6 text-left">
                        <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Temporal Reference</label>
                        <input 
                            type="date" 
                            value={selectedDate} 
                            onChange={e => setSelectedDate(e.target.value)} 
                            className="bg-transparent border-none focus:ring-0 text-white font-black text-xs uppercase italic tracking-tighter appearance-none cursor-pointer hover:text-red-500 transition-colors"
                        />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 border border-white/10 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                         <div className="absolute inset-0 bg-carbon opacity-10"></div>
                         <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-10 flex items-center gap-4 relative z-10">
                            <div className="w-1.5 h-10 bg-red-600 rounded-full shadow-[0_0_10px_red]"></div>
                            Quick <span className="text-red-600">Intervention</span>
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4 relative z-10 text-left">
                            <button onClick={() => handleQuickLog('Attendance', 'Site personnel synchronized: Full Team.')} className="p-6 bg-white/5 border border-white/5 hover:border-blue-500/50 rounded-[2rem] text-left transition-all group hover:scale-105">
                                <UserGroupIcon className="h-8 w-8 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-400">Personnel Pulse</span>
                            </button>
                            <button onClick={() => handleQuickLog('Weather Delay', 'Atmospheric friction detected: Work pause sequence initiated.')} className="p-6 bg-white/5 border border-white/5 hover:border-amber-500/50 rounded-[2rem] text-left transition-all group hover:scale-105">
                                <CloudIcon className="h-8 w-8 text-amber-500 mb-4 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-amber-500">Weather Shift</span>
                            </button>
                            <button onClick={() => setIsIncidentModalOpen(true)} className="p-6 bg-white/5 border border-white/5 hover:border-red-600/50 rounded-[2rem] text-left transition-all group hover:scale-105">
                                <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mb-4 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-red-600">Critical Anomaly</span>
                            </button>
                            <button onClick={() => setIsVoiceModalOpen(true)} className="p-6 bg-white/5 border border-white/5 hover:border-purple-600/50 rounded-[2rem] text-left transition-all group hover:scale-105">
                                <CameraIcon className="h-8 w-8 text-purple-600 mb-4 group-hover:scale-110 transition-transform animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-purple-600">Neural Intake</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-950 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group border border-white/10 text-left">
                         <div className="absolute top-0 right-0 p-4 opacity-10"><BoltIcon className="h-48 w-48"/></div>
                        <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-4 relative z-10 text-blue-400">
                            <div className="w-1.5 h-6 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]"></div>
                            Grid <span className="text-white">Telemetry</span>
                        </h3>
                        <div className="space-y-6 relative z-10 text-left">
                            <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">MTD Load Count</span>
                                <span className="text-xl font-black text-white italic">{projectLogs.filter(l => l.projectId === selectedProjectId).length} ENTRIES</span>
                            </div>
                            <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Safety Integrity</span>
                                <span className="text-xl font-black text-emerald-400 italic">SECURE</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-8">
                        <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">Activity <span className="text-red-600">Feed</span></h3>
                        <div className="flex items-center gap-2 bg-slate-100 text-slate-500 text-[10px] font-black px-4 py-2 rounded-full border border-slate-200 uppercase tracking-widest">
                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                            Uplink Status: NOMINAL
                        </div>
                    </div>

                    <div className="space-y-4">
                        {dailyLogs.length === 0 ? (
                            <div className="py-32">
                                <EmptyState icon={CalendarDaysIcon} title="GRID IDLE" message="No operational logs identified for this node at the current temporal coordinate." />
                            </div>
                        ) : (
                            dailyLogs.map((log, i) => (
                                <div key={log.id} className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-10 hover:shadow-2xl transition-all duration-500 flex gap-8 animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="p-4 bg-slate-900 rounded-[1.5rem] shadow-xl">
                                            {React.createElement(getLogIcon(log.type), { className: "h-6 w-6 text-blue-500" })}
                                        </div>
                                        <div className="w-px h-full bg-slate-100"></div>
                                    </div>
                                    <div className="flex-grow text-left">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="text-left">
                                                <h4 className="font-black text-slate-950 text-xl uppercase italic tracking-tight">{log.type}</h4>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 text-left">Transmission: {new Date(log.date).toLocaleTimeString()}</p>
                                            </div>
                                            <span className="text-[8px] font-mono bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase">LOG_#{log.id.slice(-4).toUpperCase()}</span>
                                        </div>
                                        <p className="text-slate-700 leading-relaxed italic font-serif text-lg text-left">"{log.content}"</p>
                                        
                                        {log.images && log.images.length > 0 && (
                                            <div className="flex gap-4 mt-8 overflow-x-auto pb-4 custom-scrollbar">
                                                {log.images.map((img, idx) => (
                                                    <div key={idx} className="flex-shrink-0 w-32 h-32 rounded-2xl overflow-hidden border border-slate-100 shadow-lg hover:scale-105 transition-transform duration-500">
                                                        <img src={img} className="w-full h-full object-cover" alt="Log Evidence" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {isVoiceModalOpen && selectedProjectId && (
                <VoiceMemoModal 
                    projectId={selectedProjectId}
                    onClose={() => setIsVoiceModalOpen(false)}
                    onApply={() => showToast("Voice Dossier Decrypted", "success")}
                />
            )}
             {isIncidentModalOpen && selectedProjectId && (
                <IncidentReportModal 
                    projectId={selectedProjectId}
                    onClose={() => setIsIncidentModalOpen(false)}
                />
            )}
            
            <div className="fixed bottom-10 left-10 pointer-events-none opacity-5 -z-10 rotate-90 select-none text-left">
                <span className="text-[180px] font-black tracking-tighter text-white uppercase italic leading-none">SITE_LEAD</span>
            </div>
        </div>
    );
};

export default SiteDiaryPage;