
import React, { useState, useMemo } from 'react';
import { Project, ContractorTab, ProjectTask, PowerIntensity, GridConflict, CarbonGrade } from '../../types';
import { useData } from '../../hooks/useDataContext';
import { useLocalization } from '../../hooks/useLocalization';
import { 
    ArrowLeftIcon, PlusIcon, ShoppingCartIcon, BriefcaseIcon, 
    SparklesIcon, UserGroupIcon, ChartBarIcon, MapPinIcon, 
    ShieldCheckIcon, ClockIcon, GlobeAltIcon
} from '@heroicons/react/24/solid';
import { Activity, Layers, Scan, Mic, PencilRuler, SearchCheck, TrendingUp } from 'lucide-react';
import AIProjectAssistant from '../../components/AIProjectAssistant';
import ProjectRiskRadar from '../../components/ProjectRiskRadar';
import WeatherWidget from '../../components/WeatherWidget';
import ProjectTimeline from '../../components/ProjectTimeline';
import AnimatedNumber from '../../components/AnimatedNumber';
import CarbonPulse from '../../components/CarbonPulse';
import ChronosGantt from '../../components/ChronosGantt';
import DigitalTwinSync from '../../components/DigitalTwinSync';
import MeetingMinutesModal from '../../components/MeetingMinutesModal';
import PlanAnnotatorModal from '../../components/PlanAnnotatorModal';
import ProgressAuditorModal from '../../components/ProgressAuditorModal';
import StructuralDNAScanner from '../../components/StructuralDNAScanner';
import CapitalVelocity from '../../components/CapitalVelocity';

const VitalGauge: React.FC<{ label: string; value: number; color: string; prefix?: string; suffix?: string }> = ({ label, value, color, prefix = '', suffix = '' }) => (
    <div className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem] shadow-xl group hover:border-blue-500/30 transition-all duration-500 text-left">
        <div className="flex justify-between items-start mb-4">
             <div className={`p-2 rounded-lg ${color} bg-opacity-10 transition-transform group-hover:scale-110`}>
                <Activity className={`h-5 w-5 ${color.replace('bg-', 'text-')}`} />
            </div>
            <div className="flex gap-1">
                <div className={`w-1 h-3 rounded-full ${value > 80 ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-slate-700'}`}></div>
                <div className={`w-1 h-3 rounded-full ${value > 50 ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' : 'bg-slate-700'}`}></div>
                <div className={`w-1 h-3 rounded-full ${value > 20 ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-slate-700'}`}></div>
            </div>
        </div>
        <p className="text-3xl font-black text-white tracking-tighter italic">
            {prefix}<AnimatedNumber value={value} />{suffix}
        </p>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{label}</p>
    </div>
);

export const ProjectDetailsPage: React.FC<{ project: Project, onBack: () => void, onNavigate: (tab: ContractorTab) => void }> = ({ project, onBack, onNavigate }) => {
    const { addDocument } = useData();
    const [activeTab, setActiveTab] = useState<'overview' | 'chronos' | 'diary' | 'twin' | 'materials' | 'dna' | 'velocity'>('overview');
    const [showMeetingAI, setShowMeetingAI] = useState(false);
    const [showAnnotator, setShowAnnotator] = useState(false);
    const [showAuditor, setShowAuditor] = useState(false);

    const mockTasks: ProjectTask[] = useMemo(() => [
        { id: 't1', projectId: project.id, description: 'Foundation structural pour', status: 'InProgress', priority: 'High', startDate: new Date(), dueDate: new Date(Date.now() + 86400000 * 2), powerIntensity: PowerIntensity.High, assignee: 'Mike Logistics' },
        { id: 't2', projectId: project.id, description: 'Internal wall partitioning', status: 'Pending', priority: 'Medium', startDate: new Date(Date.now() + 86400000 * 3), dueDate: new Date(Date.now() + 86400000 * 6), powerIntensity: PowerIntensity.Medium, assignee: 'Sipho Ndlovu' },
        { id: 't3', projectId: project.id, description: 'Main DB wiring', status: 'Pending', priority: 'High', startDate: new Date(Date.now() + 86400000 * 1), dueDate: new Date(Date.now() + 86400000 * 4), powerIntensity: PowerIntensity.Low, assignee: 'Electro-Node' },
    ], [project.id]);

    const mockConflicts: GridConflict[] = [
        { taskId: 't1', type: 'Power', severity: 'Critical', reason: 'Overlaps with Stage 4 Outage window.' }
    ];

    return (
        <div className="pb-20 font-sans selection:bg-red-600/30">
            {/* Ferrari Header */}
            <div className="bg-slate-900 rounded-[3.5rem] shadow-2xl p-12 mb-10 text-white relative overflow-hidden border border-white/10">
                 <div className="absolute inset-0 bg-carbon opacity-10"></div>
                 <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 text-left">
                    <div className="flex-grow">
                         <div className="flex items-center gap-4 mb-6">
                            <button onClick={onBack} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-all transform active:scale-90 border border-white/5"><ArrowLeftIcon className="h-5 w-5"/></button>
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-xl">
                                <GlobeAltIcon className="h-4 w-4 text-blue-400"/>
                                <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest">{project.jurisdiction || 'ZA'} PROTOCOL</span>
                            </div>
                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] font-mono">NODE_{project.id.slice(0,8).toUpperCase()}</span>
                        </div>
                        <h2 className="text-6xl md:text-7xl font-black tracking-tighter uppercase italic text-white leading-none mb-6">
                            {project.projectName}
                        </h2>
                        <div className="flex flex-wrap gap-8 text-sm font-bold text-slate-400 uppercase tracking-[0.2em] italic opacity-80">
                            <span className="flex items-center gap-3"><BriefcaseIcon className="h-5 w-5 text-red-600"/> {project.clientName}</span>
                            <span className="flex items-center gap-3"><MapPinIcon className="h-5 w-5 text-red-600"/> {project.address}</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                        <button 
                            onClick={() => setShowAuditor(true)}
                            className="flex-1 lg:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 px-8 rounded-3xl shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest border border-white/10"
                        >
                            <SearchCheck size={16}/> SANS Audit
                        </button>
                        <button 
                            onClick={() => setShowMeetingAI(true)}
                            className="flex-1 lg:flex-none bg-slate-950 text-white font-black py-5 px-8 rounded-3xl shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest border border-white/5"
                        >
                            <Mic size={16} className="text-red-600"/> Record
                        </button>
                        <button 
                            onClick={() => setShowAnnotator(true)}
                            className="flex-1 lg:flex-none bg-red-600 hover:bg-red-700 text-white font-black py-5 px-8 rounded-3xl shadow-2xl shadow-red-900/40 transition-all transform active:scale-95 flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest border border-white/10"
                        >
                            <PencilRuler size={16}/> Markup
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Tactical Tabs */}
            <div className="sticky top-20 z-40 mb-12 -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex overflow-x-auto no-scrollbar bg-slate-900/10 backdrop-blur-3xl rounded-[2.5rem] border border-white/20 shadow-2xl p-2 space-x-2 ring-1 ring-black/5">
                    {[
                        { id: 'overview', label: 'Overview', icon: ChartBarIcon }, 
                        { id: 'chronos', label: 'Chronos', icon: ClockIcon },
                        { id: 'dna', label: 'Struct DNA', icon: Scan },
                        { id: 'velocity', label: 'Velocity', icon: TrendingUp },
                        { id: 'twin', label: 'Twin Sync', icon: Scan },
                        { id: 'diary', label: 'Dossier', icon: Layers },
                        { id: 'materials', label: 'Resources', icon: ShoppingCartIcon }, 
                    ].map(tab => (
                        <button 
                            key={tab.id} 
                            onClick={() => setActiveTab(tab.id as any)} 
                            className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-red-600 shadow-2xl scale-[1.08] ring-1 ring-black/5 z-10' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'}`}
                        >
                            <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-red-600' : 'text-slate-400'}`}/>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Content Area */}
            <div className="transition-all duration-700 min-h-[600px] animate-fade-in-up">
                {activeTab === 'overview' && (
                  <div className="space-y-10">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                          <VitalGauge label="Structural Pulse" value={68} color="bg-blue-600" suffix="%" />
                          <VitalGauge label="Node Latency" value={42} color="bg-purple-600" suffix="ms" />
                          <VitalGauge label="Grid Security" value={98} color="bg-emerald-600" suffix="%" />
                          <VitalGauge label="Climate Risk" value={14} color="bg-red-600" suffix="%" />
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                          <div className="lg:col-span-8 space-y-10">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                  <ProjectRiskRadar project={project} />
                                  <CarbonPulse grade={CarbonGrade.B} totalKg={1420} offsetPercentage={64} />
                              </div>
                              <ProjectTimeline project={project} />
                          </div>
                          <div className="space-y-10 lg:col-span-4">
                              <WeatherWidget />
                              <AIProjectAssistant project={project} />
                          </div>
                      </div>
                  </div>
                )}

                {activeTab === 'dna' && (
                    <StructuralDNAScanner project={project} />
                )}

                {activeTab === 'velocity' && (
                    <CapitalVelocity />
                )}

                {activeTab === 'chronos' && (
                  <div className="h-[700px]">
                    <ChronosGantt project={project} tasks={mockTasks} conflicts={mockConflicts} />
                  </div>
                )}

                {activeTab === 'twin' && (
                  <DigitalTwinSync project={project} />
                )}

                {activeTab === 'diary' && (
                    <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-200">
                         <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-8 text-left">Project <span className="text-red-600">History</span></h3>
                         <ProjectTimeline project={project} />
                    </div>
                )}
            </div>

            {showMeetingAI && <MeetingMinutesModal project={project} onClose={() => setShowMeetingAI(false)} />}
            {showAuditor && <ProgressAuditorModal project={project} onClose={() => setShowAuditor(false)} />}
            {showAnnotator && (
                <PlanAnnotatorModal 
                    imageUrl="https://picsum.photos/seed/blueprint/1200/800" 
                    fileName="Master_Schematic_A1.png" 
                    onClose={() => setShowAnnotator(false)}
                    onSave={(base64, name) => {
                        addDocument({
                            projectId: project.id,
                            name,
                            category: 'Schematics',
                            url: `data:image/png;base64,${base64}`,
                            fileType: 'image',
                            uploadedAt: new Date()
                        });
                        setShowAnnotator(false);
                    }}
                />
            )}
        </div>
    );
};
