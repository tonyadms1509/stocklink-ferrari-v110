
import React from 'react';
import { 
  Zap, 
  Target, 
  ShieldCheck, 
  TrendingUp, 
  Search, 
  Camera, 
  FileText, 
  PhoneCall,
  Cpu,
  ArrowRight
} from 'lucide-react';

const HUDCard = ({ title, value, sub, statusColor, icon: Icon }: any) => (
  <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
    <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
      <Icon size={80} />
    </div>
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">{title}</p>
    <div className="flex items-end justify-between">
      <div>
        <h3 className="text-5xl font-black text-white tracking-tighter italic uppercase">{value}</h3>
        <p className="text-xs font-bold text-slate-400 mt-1">{sub}</p>
      </div>
      <div className={`w-3 h-3 rounded-full ${statusColor} shadow-[0_0_15px_currentColor]`}></div>
    </div>
  </div>
);

const ActionButton = ({ title, desc, icon: Icon, color }: any) => (
  <button className="bg-slate-900 border border-white/5 p-8 rounded-[3rem] text-left hover:border-blue-500/30 transition-all group flex flex-col h-full relative overflow-hidden">
    <div className={`p-4 rounded-2xl w-fit mb-6 ${color} bg-opacity-10 transition-colors group-hover:bg-opacity-100`}>
      <Icon className={`${color.replace('bg-', 'text-')} group-hover:text-white transition-colors`} size={32} />
    </div>
    <h4 className="text-xl font-black text-white uppercase italic tracking-tight">{title}</h4>
    <p className="text-sm text-slate-500 mt-2 leading-relaxed flex-grow">{desc}</p>
    <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-500 transition-colors">
      Engage Module <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
    </div>
  </button>
);

const ContractorDashboard: React.FC = () => {
  return (
    <div className="space-y-10 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Cpu className="text-blue-500 animate-pulse" size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Neural Core v66.2</span>
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter italic uppercase leading-none">Status: <span className="text-blue-600">Optimal</span></h1>
        </div>
      </div>

      {/* Main HUD Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <HUDCard title="Active Revenue" value="R1.2M" sub="Across 4 sites" statusColor="text-emerald-500" icon={Target} />
        <HUDCard title="BEE Status" value="LEVEL 1" sub="Verified 2024" statusColor="text-blue-500" icon={ShieldCheck} />
        <HUDCard title="Supply Health" value="STABLE" sub="98% availability" statusColor="text-emerald-500" icon={TrendingUp} />
      </div>

      {/* Intelligence Alert */}
      <div className="bg-slate-900 border border-white/10 p-10 rounded-[3rem] relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:rotate-12 transition-transform duration-700">
          <Zap size={150} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="text-blue-500" size={20} />
            <span className="text-xs font-black uppercase tracking-widest text-blue-500">AI Tactical Briefing</span>
          </div>
          <p className="text-2xl text-slate-200 font-medium leading-relaxed italic max-w-4xl">
            "Grid scan complete. PVC material costs are trending down by 4.2% in the Gauteng region. Recommend bulk acquisition for Project Delta within 48 hours."
          </p>
        </div>
      </div>

      {/* Tactical Suite */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ActionButton 
          title="AI Sourcing" 
          desc="Locate specific stock across the national wholesale network." 
          icon={Search} 
          color="bg-blue-500" 
        />
        <ActionButton 
          title="Site Cam" 
          desc="Audit site safety and log snag lists using vision intelligence." 
          icon={Camera} 
          color="bg-purple-500" 
        />
        <ActionButton 
          title="Authority" 
          desc="Manage municipal planning and NHBRC compliance status." 
          icon={FileText} 
          color="bg-amber-500" 
        />
        <ActionButton 
          title="Direct Link" 
          desc="Encrypted real-time channel to your preferred supply nodes." 
          icon={PhoneCall} 
          color="bg-emerald-500" 
        />
      </div>
    </div>
  );
};

export default ContractorDashboard;
