import React, { useMemo } from 'react';
import { Project, ProjectTask, PowerIntensity, GridConflict } from '../types';
import { Bolt, CloudRain, Clock, User, ChevronRight, Activity, Sparkles } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';

interface ChronosGanttProps {
  project: Project;
  tasks: ProjectTask[];
  conflicts: GridConflict[];
}

const ChronosGantt: React.FC<ChronosGanttProps> = ({ project, tasks, conflicts }) => {
  const days = useMemo(() => {
    const dates = [];
    const now = new Date();
    for (let i = -2; i < 12; i++) {
      const d = new Date();
      d.setDate(now.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, []);

  const getIntensityColor = (intensity: PowerIntensity) => {
    switch (intensity) {
      case PowerIntensity.High: return 'bg-red-600 shadow-[0_0_20px_rgba(220,0,0,0.4)] border-red-400';
      case PowerIntensity.Medium: return 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)] border-blue-400';
      case PowerIntensity.Low: return 'bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.4)] border-emerald-400';
      default: return 'bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900 border border-white/10 rounded-[4rem] shadow-2xl overflow-hidden flex flex-col h-full animate-fade-in-up relative">
      <div className="absolute inset-0 bg-carbon opacity-5 pointer-events-none"></div>
      
      <div className="bg-slate-950/80 backdrop-blur-3xl p-10 border-b border-white/5 flex justify-between items-center shrink-0 relative z-10">
        <div className="text-left">
          <p className="text-[10px] font-black uppercase text-blue-500 tracking-[0.6em] mb-3 font-mono">CHRONOS_TEMPORAL_CORE v80.5</p>
          <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Mission <span className="text-blue-500">Schematic</span></h3>
        </div>
        <div className="flex gap-5">
           <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 shadow-inner">
              <Bolt size={18} className="text-amber-500 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
              <span className="text-[11px] font-black uppercase text-slate-300 tracking-widest font-mono">GRID: S4 LOCKOUT</span>
           </div>
           <button className="bg-red-600 hover:bg-red-700 text-white font-black px-10 py-3 rounded-2xl text-[10px] uppercase tracking-[0.4em] shadow-2xl transition-all transform active:scale-95 border-4 border-slate-950">RE-SEQUENCE</button>
        </div>
      </div>

      <div className="flex-grow overflow-auto custom-scrollbar relative">
        <div className="sticky top-0 z-20 flex bg-slate-950 border-b border-white/10 backdrop-blur-3xl">
          <div className="w-80 border-r border-white/10 p-6 shrink-0 bg-slate-950 sticky left-0 z-30 font-black text-[10px] uppercase text-slate-600 tracking-[0.4em] italic text-left">Task Identity Node</div>
          <div className="flex">
            {days.map((day, i) => {
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <div key={i} className={`w-32 p-6 border-r border-white/5 text-center shrink-0 transition-all ${isToday ? 'bg-blue-600/10 border-b-4 border-blue-500' : 'opacity-40'}`}>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{day.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                  <p className="text-2xl font-black text-white italic tracking-tighter">{day.getDate()}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative min-h-full">
           <div className="absolute inset-0 pointer-events-none flex">
              <div className="w-80 border-r border-white/10 shrink-0 sticky left-0 z-10 bg-slate-900/50"></div>
              {days.map((_, i) => (
                <div key={i} className="w-32 border-r border-white/5 shrink-0"></div>
              ))}
           </div>

           <div className="relative z-10">
              {tasks.map((task) => {
                const conflict = conflicts.find(c => c.taskId === task.id);
                return (
                  <div key={task.id} className="flex border-b border-white/5 hover:bg-white/5 transition-colors group h-20">
                    <div className="w-80 border-r border-white/10 p-6 shrink-0 bg-slate-900 sticky left-0 z-20 text-left backdrop-blur-xl">
                       <h4 className="font-black text-white text-base uppercase italic tracking-tight truncate group-hover:text-blue-400 transition-colors leading-none">{task.description}</h4>
                       <div className="flex items-center gap-3 mt-3">
                          <User size={12} className="text-slate-500" />
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{task.assignee || 'UNASSIGNED_UNIT'}</span>
                       </div>
                    </div>
                    <div className="flex items-center relative h-full w-full px-4">
                       <div 
                         className={`h-10 rounded-full flex items-center px-6 absolute transition-all duration-1000 transform hover:scale-[1.02] border-2 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] ${getIntensityColor((task as any).powerIntensity || PowerIntensity.Low)} ${conflict ? 'animate-pulse' : ''}`}
                         style={{
                           left: '60px', 
                           width: '240px' 
                         }}
                       >
                         <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] truncate drop-shadow-lg">{task.priority} INTENSITY</span>
                         {conflict && (
                           <div className="absolute -top-3 -right-3 bg-red-600 text-white rounded-xl p-2 border-4 border-slate-950 shadow-2xl animate-bounce">
                             {conflict.type === 'Power' ? <Bolt size={14} className="fill-current"/> : <CloudRain size={14} />}
                           </div>
                         )}
                       </div>
                    </div>
                  </div>
                );
              })}
           </div>
        </div>
      </div>

      <div className="bg-slate-950/80 backdrop-blur-3xl p-10 border-t border-white/5 flex justify-between items-center text-left relative z-10 shadow-[0_-10px_50px_rgba(0,0,0,0.5)]">
          <div className="flex gap-16">
              <div className="text-left">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Resource Friction</p>
                  <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-black text-white italic tracking-tighter">84.2</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">kw/h LOAD</span>
                  </div>
              </div>
              <div className="text-left border-l border-white/5 pl-16">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Grid Sync Index</p>
                  <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-black text-emerald-400 italic tracking-tighter">96.8%</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">STABLE</span>
                  </div>
              </div>
          </div>
          <div className="flex gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <Activity size={20} className="text-blue-500 animate-pulse" />
              </div>
              <button className="flex items-center gap-4 bg-white text-slate-950 hover:bg-slate-100 font-black py-4 px-12 rounded-2xl text-[10px] uppercase tracking-[0.4em] transition-all transform active:scale-95 border-4 border-slate-950 shadow-2xl">
                Deploy Dossier <ChevronRight size={14} />
              </button>
          </div>
      </div>
    </div>
  );
};

export default ChronosGantt;