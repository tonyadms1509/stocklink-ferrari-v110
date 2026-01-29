import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useDataContext.tsx';
import { Project, ProjectStatus } from '../../types.ts';
import { ArrowLeftIcon, BriefcaseIcon, PlusIcon, MapPinIcon, SignalIcon, Zap, ArrowRightIcon } from '@heroicons/react/24/solid';
import { useLocalization } from '../../hooks/useLocalization.tsx';
import { useCurrency } from '../../hooks/useCurrency.tsx';
import CreateProjectModal from '../../components/CreateProjectModal.tsx';
import { useAuth } from '../../hooks/useAuth.tsx';
import EmptyState from '../../components/EmptyState.tsx';

const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
        case ProjectStatus.Planning: return 'bg-blue-600 shadow-[0_0_10px_#2563eb]';
        case ProjectStatus.InProgress: return 'bg-amber-500 shadow-[0_0_10px_#f59e0b]';
        case ProjectStatus.Completed: return 'bg-emerald-500 shadow-[0_0_10px_#10b981]';
        default: return 'bg-slate-600';
    }
}

const ProjectCard: React.FC<{ project: Project; onClick: () => void; }> = ({ project, onClick }) => {
    const { projectDocuments = [], projectBudgets = [], projectExpenses = [] } = useData();
    const { formatCurrency } = useCurrency();

    const budget = (projectBudgets || []).find(b => b.projectId === project.id)?.totalBudget || 0;
    const spent = (projectExpenses || []).filter(e => e.projectId === project.id).reduce((sum, e) => sum + e.amount, 0);
    const progress = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

    const coverImage = useMemo(() => {
        const imageDoc = (projectDocuments || []).find(d => d.projectId === project.id && d.fileType === 'image');
        return imageDoc?.url;
    }, [projectDocuments, project.id]);

    return (
        <button 
            onClick={(e) => { e.preventDefault(); onClick(); }} 
            className="relative group w-full h-80 rounded-[3rem] overflow-hidden shadow-2xl border-2 border-transparent hover:border-red-600/40 transition-all duration-700 transform hover:-translate-y-2 bg-slate-900"
        >
            <div className="absolute inset-0 bg-black">
                {coverImage ? (
                    <img src={coverImage} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-110 transition-all duration-1000" />
                ) : (
                    <div className={`w-full h-full bg-gradient-to-br from-slate-900 to-black opacity-80 group-hover:opacity-100 transition-opacity duration-500`}>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                    </div>
                )}
            </div>

            <div className="absolute inset-0 p-8 flex flex-col justify-between text-white text-left">
                <div className="flex justify-between items-start">
                    <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)} animate-pulse`}></div>
                        {project.status}
                    </div>
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <ArrowRightIcon className="h-5 w-5 text-red-600" />
                    </div>
                </div>

                <div className="relative z-10 space-y-4">
                    <div className="text-left">
                        <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none drop-shadow-2xl group-hover:translate-x-2 transition-transform duration-500">{project.projectName}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                            <BriefcaseIcon className="h-4 w-4 text-red-600 opacity-70"/> {project.clientName}
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-[9px] pt-6 border-t border-white/5 font-black uppercase tracking-widest">
                        <div className="flex items-center gap-2 text-slate-400">
                            <MapPinIcon className="h-3.5 w-3.5 text-blue-500"/>
                            <span className="truncate italic">{project.address || 'Global Node'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 justify-end">
                            <SignalIcon className="h-3.5 w-3.5 text-red-600"/>
                            <span>Sync Nominal</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-[8px] text-slate-500 font-black uppercase tracking-[0.4em]">
                            <span>Fiscal Capacity</span>
                            <span className={progress > 90 ? 'text-red-500' : 'text-emerald-400'}>{Math.round(progress)}% Used</span>
                        </div>
                        <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5">
                            <div 
                                className={`h-full transition-all duration-2000 ${progress > 90 ? 'bg-red-600 shadow-[0_0_10px_red]' : 'bg-blue-600 shadow-[0_0_10px_#2563eb]'}`}
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </button>
    )
}

interface MyProjectsProps {
    onViewProject: (project: Project) => void;
    onBack?: () => void;
}

const MyProjects: React.FC<MyProjectsProps> = ({ onViewProject, onBack }) => {
    const { projects = [] } = useData();
    const { currentCompany } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const myProjects = useMemo(() => {
        if (!currentCompany) return [];
        return projects.filter(p => p.contractorId === currentCompany.id);
    }, [projects, currentCompany]);

    return (
        <div className="pb-12 text-left">
            {onBack && (
                <button onClick={onBack} className="flex items-center text-sm text-blue-500 hover:text-white mb-8 font-black uppercase tracking-widest transition-colors group">
                    <ArrowLeftIcon className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
                    Return to Bridge
                </button>
            )}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 border-b border-white/5 pb-12 text-left">
                <div className="text-left">
                    <div className="flex items-center gap-3 mb-4 text-red-600">
                         <BriefcaseIcon className="h-8 w-8 animate-pulse shadow-[0_0_20px_#DC0000]" />
                         <span className="text-[12px] font-black uppercase tracking-[0.5em] italic">Project Registry v110.0 REDLINE</span>
                    </div>
                    <h2 className="text-7xl font-black text-white tracking-tighter uppercase italic leading-none">STRUCTURAL <span className="text-red-600">DOSSIERS</span></h2>
                    <p className="text-slate-500 mt-4 font-mono text-sm tracking-widest uppercase italic max-w-2xl leading-relaxed">"National grid synchronized site registries. Managed structural telemetry and fiscal velocity."</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)} 
                    className="bg-red-600 hover:bg-red-700 text-white font-black py-6 px-12 rounded-[2.5rem] flex items-center gap-4 shadow-[0_0_50px_rgba(220,0,0,0.3)] transition-all transform active:scale-95 uppercase tracking-widest text-[10px] border-4 border-slate-950"
                >
                    <PlusIcon className="h-6 w-6" />
                    Initialize Dossier
                </button>
            </div>

            {myProjects.length === 0 ? (
                <EmptyState
                    icon={BriefcaseIcon}
                    title="REGISTRY EMPTY"
                    message="Neural core awaiting project intake. Provision your first site dossier to begin tracking."
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {myProjects.map((project, index) => (
                        <div key={project.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                            <ProjectCard project={project} onClick={() => onViewProject(project)} />
                        </div>
                    ))}
                    
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="h-80 border-4 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-slate-700 hover:text-red-600 hover:border-red-600/30 hover:bg-white/5 transition-all group shadow-inner"
                    >
                        <div className="p-6 bg-slate-900 rounded-full group-hover:bg-red-600 group-hover:text-white transition-all mb-6 shadow-2xl">
                            <PlusIcon className="h-10 w-10" />
                        </div>
                        <span className="font-black text-xs uppercase tracking-[0.4em] italic">Add New Sector</span>
                    </button>
                </div>
            )}
            {isModalOpen && (
                <CreateProjectModal 
                    onClose={() => setIsModalOpen(false)} 
                    onProjectCreated={(newProject) => onViewProject(newProject)}
                />
            )}
        </div>
    )
}

export default MyProjects;