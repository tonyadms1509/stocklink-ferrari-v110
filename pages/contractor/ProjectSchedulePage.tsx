
import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useDataContext';
import { useLocalization } from '../../hooks/useLocalization';
import { ProjectTask, TaskStatus, ContractorTab, Project } from '../../types';
import { ArrowLeftIcon, CalendarDaysIcon, ViewColumnsIcon, ListBulletIcon, SparklesIcon, PlusIcon, ClockIcon, BriefcaseIcon, BoltIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import AIScheduleOptimizerModal from '../../components/AIScheduleOptimizerModal';
import WeatherImpactAnalysis from '../../components/WeatherImpactAnalysis';
import { useToast } from '../../hooks/useToast';
import EmptyState from '../../components/EmptyState';

const TaskCard: React.FC<{ task: ProjectTask; projectName: string; onStatusChange: (id: string, status: TaskStatus) => void }> = ({ task, projectName, onStatusChange }) => {
    const priorityColors: any = {
        High: 'bg-red-100 text-red-800 border-red-200',
        Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        Low: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    
    const priority = task.priority || 'Medium';

    return (
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 mb-2 hover:shadow-md transition-shadow cursor-pointer group text-left">
            <div className="flex justify-between items-start mb-1 text-left">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${priorityColors[priority]}`}>
                    {priority}
                </span>
                {task.dueDate && (
                    <span className={`text-xs flex items-center gap-1 ${new Date(task.dueDate) < new Date() && task.status !== TaskStatus.Completed ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                        <ClockIcon className="h-3 w-3" />
                        {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                )}
            </div>
            <p className="font-semibold text-gray-800 text-sm line-clamp-2 text-left">{task.description}</p>
            <div className="flex items-center gap-2 mt-1 text-left">
                 <p className="text-[10px] text-gray-400 truncate uppercase font-bold tracking-wider">{projectName}</p>
                 {task.powerIntensive && <BoltIcon className="h-3 w-3 text-amber-500" title="Power Intensive Task" />}
            </div>
            <div className="flex justify-between items-center mt-2 text-left">
                {task.assignee && <p className="text-xs text-blue-600 bg-blue-50 inline-block px-1 rounded">@{task.assignee}</p>}
                <select 
                    value={task.status} 
                    onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                    className="text-[10px] p-1 border rounded bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                >
                    {Object.values(TaskStatus).map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

const KanbanColumn: React.FC<{
    status: TaskStatus;
    tasks: ProjectTask[];
    projects: Project[];
    onStatusChange: (id: string, status: TaskStatus) => void;
}> = ({ status, tasks, projects, onStatusChange }) => {
    return (
        <div className="flex-1 min-w-[300px] bg-gray-50 rounded-xl p-4 flex flex-col h-full border border-gray-200">
            <div className="flex justify-between items-center mb-4 px-2 text-left">
                <h3 className="font-bold text-gray-700 uppercase text-xs tracking-widest">{status}</h3>
                <span className="bg-white text-gray-500 text-[10px] font-black px-2 py-0.5 rounded-full border border-gray-200">{tasks.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                {tasks.map(task => (
                    <TaskCard 
                        key={task.id} 
                        task={task} 
                        projectName={projects.find(p => p.id === task.projectId)?.projectName || 'Unknown'} 
                        onStatusChange={onStatusChange}
                    />
                ))}
                {tasks.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-300 text-xs italic">
                        No tasks
                    </div>
                )}
            </div>
        </div>
    );
};

const GanttChartView: React.FC<{ tasks: ProjectTask[]; projects: Project[]; showPowerShield: boolean }> = ({ tasks, projects, showPowerShield }) => {
    const { startDate, days } = useMemo(() => {
        if (tasks.length === 0) {
            const now = new Date();
            const end = new Date();
            end.setDate(now.getDate() + 14);
            return { startDate: now, endDate: end, days: [] };
        }
        let minDate = new Date();
        let maxDate = new Date();
        tasks.forEach(t => {
            const start = t.startDate ? new Date(t.startDate) : t.createdAt ? new Date(t.createdAt) : new Date();
            const end = t.dueDate ? new Date(t.dueDate) : new Date(start.getTime() + 86400000); 
            if (start < minDate) minDate = start;
            if (end > maxDate) maxDate = end;
        });
        minDate.setDate(minDate.getDate() - 2);
        maxDate.setDate(maxDate.getDate() + 5);
        const daysArr = [];
        for (let d = new Date(minDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
            daysArr.push(new Date(d));
        }
        return { startDate: minDate, endDate: maxDate, days: daysArr };
    }, [tasks]);

    const powerOutages = useMemo(() => {
        return days.map(d => ({
            date: d.toISOString().split('T')[0],
            isOutage: d.getDate() % 2 === 0 
        }));
    }, [days]);

    const groupedTasks = useMemo<Record<string, ProjectTask[]>>(() => {
        const groups: Record<string, ProjectTask[]> = {};
        tasks.forEach(t => {
            if (!groups[t.projectId]) groups[t.projectId] = [];
            groups[t.projectId].push(t);
        });
        return groups;
    }, [tasks]);

    const getStatusColor = (status: string) => {
        switch(status) {
            case TaskStatus.Completed: return 'bg-green-500 border-green-600';
            case TaskStatus.InProgress: return 'bg-yellow-500 border-yellow-600';
            default: return 'bg-blue-500 border-blue-600';
        }
    };

    const dayWidth = 60; 
    const totalWidth = days.length * dayWidth;

    return (
        <div className="flex flex-col h-full bg-white border rounded-xl overflow-hidden shadow-xl text-left">
            <div className="flex border-b bg-slate-900 sticky top-0 z-20 text-white text-left">
                <div className="w-64 p-4 font-black uppercase text-[10px] tracking-widest border-r border-white/5 flex-shrink-0 bg-slate-900 z-30 sticky left-0 shadow-[4px_0_10px_rgba(0,0,0,0.3)] text-left">
                    Project Schematic
                </div>
                <div className="overflow-hidden flex-grow">
                    <div className="flex relative" style={{ width: totalWidth }}>
                        {days.map((day, i) => (
                            <div key={i} className={`w-[60px] flex-shrink-0 text-center border-r border-white/5 text-[10px] py-3 ${day.getDay() === 0 || day.getDay() === 6 ? 'bg-white/5 text-slate-500' : 'text-slate-300'}`}>
                                <div className="font-black">{day.getDate()}</div>
                                <div className="uppercase opacity-50">{day.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-grow overflow-auto relative custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                
                {showPowerShield && (
                    <div className="absolute inset-0 pointer-events-none z-10 flex h-full">
                         <div className="w-64 shrink-0 h-full"></div>
                         <div className="flex-grow flex h-full">
                            {powerOutages.map((o, i) => (
                                <div key={i} className={`w-[60px] h-full ${o.isOutage ? 'bg-amber-500/10 border-x border-amber-500/20' : ''} flex items-center justify-center`}>
                                    {o.isOutage && <BoltIcon className="h-6 w-6 text-amber-500/20" />}
                                </div>
                            ))}
                         </div>
                    </div>
                )}

                {Object.keys(groupedTasks).map((projectId) => {
                    const projectTasks = groupedTasks[projectId];
                    const project = projects.find(p => p.id === projectId);
                    return (
                        <div key={projectId} className="relative z-20 text-left">
                            <div className="bg-slate-800/80 backdrop-blur-sm p-3 font-black text-xs text-white border-y border-white/5 sticky left-0 z-10 w-full flex items-center gap-2 text-left">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                {project?.projectName.toUpperCase() || 'UNKNOWN_PROJECT'}
                            </div>
                            {projectTasks.map(task => {
                                const taskStart = task.startDate ? new Date(task.startDate) : task.createdAt ? new Date(task.createdAt) : new Date();
                                const taskEnd = task.dueDate ? new Date(task.dueDate) : new Date(taskStart.getTime() + 86400000);
                                const offsetDays = (taskStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
                                const durationDays = Math.max(1, (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24));
                                const left = offsetDays * dayWidth;
                                const width = durationDays * dayWidth;

                                return (
                                    <div key={task.id} className="flex border-b border-gray-100 hover:bg-blue-50/50 group h-14 relative text-left">
                                        <div className="w-64 p-4 text-xs font-bold text-gray-700 border-r flex-shrink-0 truncate sticky left-0 bg-white z-10 group-hover:bg-blue-50 transition-colors text-left">
                                            {task.description}
                                        </div>
                                        <div className="relative flex-grow h-full text-left">
                                            <div 
                                                className={`absolute top-4 h-6 rounded-full border shadow-sm flex items-center px-3 text-white text-[10px] font-black uppercase tracking-widest overflow-hidden whitespace-nowrap transition-all hover:scale-[1.02] hover:shadow-xl cursor-pointer ${getStatusColor(task.status)}`}
                                                style={{ left: `${left}px`, width: `${width}px`, minWidth: '32px' }}
                                                title={`${task.description}`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {task.powerIntensive && <BoltIcon className="h-3 w-3 text-amber-300" />}
                                                    {width > 60 && <span className="truncate">{task.assignee || 'UNASSIGNED'}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )
                })}
            </div>
        </div>
    );
}

const ProjectSchedulePage: React.FC<{ onNavigate: (tab: ContractorTab) => void; onBack?: () => void }> = ({ onNavigate, onBack }) => {
    const { t } = useLocalization();
    const { projectTasks, projects, updateProjectTask } = useData(); 
    const { showToast } = useToast();
    const [viewMode, setViewMode] = useState<'board' | 'list' | 'timeline'>('timeline'); 
    const [isOptimizerOpen, setIsOptimizerOpen] = useState(false);
    const [showPowerShield, setShowPowerShield] = useState(false);

    const filteredTasks = projectTasks;
    const tasksByStatus = useMemo(() => ({
        [TaskStatus.Pending]: filteredTasks.filter(t => t.status === TaskStatus.Pending),
        [TaskStatus.InProgress]: filteredTasks.filter(t => t.status === TaskStatus.InProgress),
        [TaskStatus.Completed]: filteredTasks.filter(t => t.status === TaskStatus.Completed),
    }), [filteredTasks]);

    const handleApplyOptimization = async (updatedTasks: ProjectTask[]) => {
        for (const task of updatedTasks) {
            // Fixed: cast status as TaskStatus to resolve assignment error
            await updateProjectTask(task.id, { status: task.status as TaskStatus, dueDate: task.dueDate });
        }
        showToast(`Schedule optimized!`, 'success');
    };

    const handleStatusChange = (id: string, status: TaskStatus) => updateProjectTask(id, { status });

    return (
        <div className="h-full flex flex-col space-y-6 text-left">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-shrink-0 text-left">
                <div className="flex items-center gap-4 text-left">
                    {onBack && (
                        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <ArrowLeftIcon className="h-5 w-5 text-gray-600"/>
                        </button>
                    )}
                    <div className="text-left">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase">Mission <span className="text-blue-600">Schedule</span></h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">{t('scheduleDescription')}</p>
                    </div>
                </div>
                
                <div className="flex gap-2">
                     <button 
                        onClick={() => setShowPowerShield(!showPowerShield)} 
                        className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all border-2 ${showPowerShield ? 'bg-amber-500 border-amber-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-amber-400'}`}
                    >
                        <BoltIcon className="h-4 w-4"/>
                        Eskom Shield {showPowerShield ? 'ON' : 'OFF'}
                    </button>
                     <button onClick={() => setIsOptimizerOpen(true)} className="bg-slate-900 hover:bg-black text-white font-black py-2 px-4 rounded-xl flex items-center gap-2 text-sm shadow-lg transition-all transform active:scale-95 uppercase tracking-widest">
                        <SparklesIcon className="h-4 w-4 text-blue-400"/>
                        Neural Opt
                    </button>
                    <div className="bg-gray-200 p-1 rounded-xl flex items-center border border-gray-300">
                        <button onClick={() => setViewMode('board')} className={`p-2 rounded-lg ${viewMode === 'board' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}><ViewColumnsIcon className="h-5 w-5"/></button>
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}><ListBulletIcon className="h-5 w-5"/></button>
                        <button onClick={() => setViewMode('timeline')} className={`p-2 rounded-lg ${viewMode === 'timeline' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}><CalendarDaysIcon className="h-5 w-5"/></button>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <WeatherImpactAnalysis tasks={filteredTasks} />
                {showPowerShield && (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 animate-fade-in-scale text-left">
                        <div className="p-2 bg-amber-100 rounded-lg text-amber-600 h-fit">
                            <ExclamationTriangleIcon className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                             <h4 className="font-bold text-amber-900 text-sm">Power Conflict Detected</h4>
                             <p className="text-xs text-amber-800 leading-relaxed mt-1 text-left">
                                "Block A Partitioning" overlaps with Stage 4 Load Shedding window on Wednesday. Consider moving task or initializing generator protocols.
                             </p>
                        </div>
                    </div>
                )}
            </div>

            {projectTasks.length === 0 ? (
                <EmptyState
                    icon={CalendarDaysIcon}
                    title={t('scheduleNoTasks')}
                    message="Add tasks to your projects to see them here."
                    action={
                        <button onClick={() => onNavigate('projects')} className="bg-primary text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                            <BriefcaseIcon className="h-5 w-5"/> Go to Projects
                        </button>
                    }
                />
            ) : (
                <div className="flex-grow overflow-hidden text-left">
                    {viewMode === 'board' && (
                        <div className="flex gap-6 h-full pb-4 overflow-x-auto min-w-max px-1 text-left">
                            <KanbanColumn status={TaskStatus.Pending} tasks={tasksByStatus[TaskStatus.Pending]} projects={projects} onStatusChange={handleStatusChange} />
                            <KanbanColumn status={TaskStatus.InProgress} tasks={tasksByStatus[TaskStatus.InProgress]} projects={projects} onStatusChange={handleStatusChange} />
                            <KanbanColumn status={TaskStatus.Completed} tasks={tasksByStatus[TaskStatus.Completed]} projects={projects} onStatusChange={handleStatusChange} />
                        </div>
                    )}
                    {viewMode === 'list' && (
                         <div className="bg-white rounded-xl shadow-md overflow-hidden h-full overflow-y-auto border border-gray-200 text-left">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 font-black uppercase text-[10px] tracking-widest sticky top-0 z-10 text-left">
                                    <tr>
                                        <th className="p-4">Task</th>
                                        <th className="p-4">Project</th>
                                        <th className="p-4">Due Date</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Assignee</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {filteredTasks.map(task => (
                                        <tr key={task.id} className="hover:bg-blue-50/50 transition-colors text-left">
                                            <td className="p-4 font-bold text-gray-900">{task.description}</td>
                                            <td className="p-4 text-gray-600 font-medium">{projects.find(p => p.id === task.projectId)?.projectName}</td>
                                            <td className="p-4 text-gray-500 font-mono">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                                            <td className="p-4">
                                                <select 
                                                    value={task.status} 
                                                    onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                                                    className="text-xs p-1.5 border rounded-lg bg-white shadow-sm font-bold"
                                                >
                                                    {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </td>
                                            <td className="p-4 text-gray-600 font-bold">{task.assignee || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         </div>
                    )}
                    {viewMode === 'timeline' && <GanttChartView tasks={filteredTasks} projects={projects} showPowerShield={showPowerShield} />}
                </div>
            )}
            {isOptimizerOpen && <AIScheduleOptimizerModal onClose={() => setIsOptimizerOpen(false)} onApplyChanges={handleApplyOptimization} />}
        </div>
    );
};

export default ProjectSchedulePage;
