import React, { useState } from 'react';
import { useData } from '../../hooks/useDataContext.tsx';
import { Mail, Clock, User, Trash2, CheckCircle, Reply, Terminal, Activity, Inbox } from 'lucide-react';
import { useToast } from '../../hooks/useToast.tsx';
import AnimatedNumber from '../../components/AnimatedNumber';
import EmptyState from '../../components/EmptyState';

const ClientInbox: React.FC = () => {
    const { clientMessages = [], markClientInquiryRead } = useData();
    const { showToast } = useToast();
    const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);

    const selectedMsg = clientMessages.find(m => m.id === selectedMsgId);

    const handleRead = (id: string) => {
      markClientInquiryRead(id);
      setSelectedMsgId(id);
    };

    const handleReply = () => {
      showToast("Redirecting to Transmit Forge...", "info");
    };

    return (
        <div className="space-y-12 animate-fade-in pb-24 text-left">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-12 text-left">
                <div className="text-left">
                    <div className="flex items-center gap-4 mb-4 text-left">
                        <Inbox className="h-10 w-10 text-blue-500 shadow-2xl animate-pulse" />
                        <span className="text-[12px] font-black uppercase tracking-[0.5em] text-blue-500 italic text-left">STAKEHOLDER_RELATIONS v1.0</span>
                    </div>
                    <h1 className="text-7xl font-black text-white tracking-tighter uppercase italic leading-none text-left">CLIENT <span className="text-blue-500">INBOX</span></h1>
                    <p className="text-slate-500 mt-6 font-mono text-sm tracking-widest uppercase italic max-w-3xl leading-relaxed text-left">"Incoming external transmissions from public-facing node profile. Stakeholder lead orchestration center."</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start text-left h-[700px]">
                <div className="lg:col-span-4 flex flex-col h-full bg-slate-900 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl text-left">
                    <div className="p-6 bg-slate-950/50 border-b border-white/5 text-left">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-left">Active Transmissions</p>
                    </div>
                    <div className="flex-grow overflow-y-auto custom-scrollbar text-left">
                        {clientMessages.length > 0 ? clientMessages.map(msg => (
                            <button 
                                key={msg.id}
                                onClick={() => handleRead(msg.id)}
                                className={`w-full p-8 border-b border-white/5 transition-all text-left group relative ${selectedMsgId === msg.id ? 'bg-blue-600/10' : 'hover:bg-white/5'}`}
                            >
                                {!msg.isRead && <div className="absolute top-8 right-8 w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_#3b82f6]"></div>}
                                <div className="flex items-center gap-4 mb-3 text-left">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-slate-400 border border-white/10 shrink-0 text-left">{msg.clientName.charAt(0)}</div>
                                    <div className="text-left">
                                        <p className={`font-black uppercase italic tracking-tighter text-lg leading-none ${selectedMsgId === msg.id ? 'text-blue-400' : 'text-white'}`}>{msg.clientName}</p>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 text-left">{new Date(msg.timestamp).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-400 line-clamp-1 font-medium italic text-left">"{msg.message}"</p>
                            </button>
                        )) : (
                          <div className="p-20 text-center opacity-20">
                            <Activity className="h-12 w-12 mx-auto mb-4" />
                            <p className="font-black uppercase tracking-widest text-xs">Grid Quiet</p>
                          </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-8 bg-slate-900 rounded-[4rem] border border-white/5 shadow-2xl overflow-hidden relative flex flex-col h-full text-left">
                    <div className="absolute inset-0 bg-carbon opacity-5 pointer-events-none"></div>
                    
                    {selectedMsg ? (
                        <div className="flex flex-col h-full animate-fade-in text-left">
                            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-slate-950/50 text-left">
                                <div className="text-left">
                                    <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white text-left">{selectedMsg.clientName}</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 text-left">Uplink Coordinate: {selectedMsg.clientEmail}</p>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={handleReply} className="bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-8 rounded-2xl flex items-center gap-3 uppercase text-[10px] tracking-widest shadow-xl transform active:scale-95 border border-white/10">
                                        <Reply size={16}/> Engage Relay
                                    </button>
                                </div>
                            </div>

                            <div className="p-12 space-y-10 flex-grow overflow-y-auto custom-scrollbar text-left">
                                <div className="bg-black/40 p-10 rounded-[3rem] border border-white/5 shadow-inner italic font-serif text-xl leading-loose text-slate-200 text-left">
                                    "{selectedMsg.message}"
                                </div>
                            </div>

                            <div className="p-10 bg-slate-950 border-t border-white/5 flex justify-between items-center text-left">
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em] text-left">Transmission Captured: {new Date(selectedMsg.timestamp).toLocaleString()}</span>
                                <button className="p-4 bg-white/5 text-slate-500 hover:text-red-500 rounded-2xl transition-all"><Trash2 size={20}/></button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-grow flex flex-col items-center justify-center text-center p-20 opacity-20 group">
                            <Mail size={120} className="text-slate-700 group-hover:scale-110 transition-transform duration-1000 mb-8" />
                            <p className="font-black uppercase tracking-[0.6em] text-xs text-slate-500 max-w-sm leading-loose">"Awaiting operational lead selection. Node buffer synchronized and ready for readout."</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientInbox;