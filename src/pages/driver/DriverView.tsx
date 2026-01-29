
import React, { useMemo, useState, useEffect } from 'react';
import { useData } from '../../hooks/useDataContext';
import { useAuth } from '../../hooks/useAuth';
import { useLocalization } from '../../hooks/useLocalization';
import { Order, OrderStatus } from '../../types';
import { 
    MapPinIcon, TruckIcon, CheckCircleIcon, ClockIcon, 
    PhoneIcon, ArrowRightIcon, ClipboardDocumentCheckIcon, 
    PlayCircleIcon, StopCircleIcon, PowerIcon, 
    SpeakerWaveIcon, ShieldCheckIcon, SignalIcon
} from '@heroicons/react/24/solid';
import RouteMap from '../../components/RouteMap';
import EmptyState from '../../components/EmptyState';
import ProofOfDeliveryModal from '../../components/ProofOfDeliveryModal';
import SwipeButton from '../../components/SwipeButton';
import VehicleInspectionModal from '../../components/VehicleInspectionModal';
import { GoogleGenAI, Modality } from '@google/genai';

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const DriverView: React.FC = () => {
  const { orders, updateOrderStatus, completeDelivery } = useData();
  const { user } = useAuth();
  const { t } = useLocalization();
  const [completingOrder, setCompletingOrder] = useState<Order | null>(null);
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [isInspectionOpen, setIsInspectionOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const myDeliveries = useMemo(() => {
    if (!user) return [];
    return (orders || []).filter(
        (o) =>
        o.deliveryDetails?.driverId === user.id &&
        o.status !== OrderStatus.Completed &&
        o.status !== OrderStatus.Cancelled
    );
  }, [orders, user]);

  const nextTarget = myDeliveries[0];

  const handleVoicePilot = async (text: string) => {
    if (!process.env.API_KEY || isSpeaking) return;
    setIsSpeaking(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Pilot Instruction: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
            }
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioCtx.destination);
            source.onended = () => setIsSpeaking(false);
            source.start();
        }
    } catch (e) {
        setIsSpeaking(false);
    }
  };

  const handleIgnition = (order: Order) => {
    updateOrderStatus(order.id, OrderStatus.OutForDelivery);
    handleVoicePilot(`Navigation engaged. Target destination: ${order.deliveryAddress}. Estimated flight time is fifteen minutes.`);
  };

  return (
    <div className="bg-black min-h-screen text-slate-100 font-sans selection:bg-red-600/30 overflow-x-hidden">
      <header className="bg-slate-900 border-b border-white/5 p-6 sticky top-0 z-50 backdrop-blur-xl">
        <div className="flex justify-between items-end">
            <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_red]"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Pilot Core: {user?.id.slice(-4).toUpperCase()}</span>
                </div>
                <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">PILOT <span className="text-red-600">HUD</span></h1>
            </div>
            <button 
                onClick={() => setIsOnDuty(!isOnDuty)} 
                className={`flex flex-col items-center gap-1 transition-all group`}
            >
                <div className={`p-4 rounded-2xl border-2 transition-all ${isOnDuty ? 'bg-red-600 border-red-500 text-white shadow-[0_0_30px_rgba(220,0,0,0.4)]' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                    <PowerIcon className="h-6 w-6"/>
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest">{isOnDuty ? 'Active' : 'Standby'}</span>
            </button>
        </div>
      </header>

      {!isOnDuty ? (
           <div className="p-8 flex flex-col items-center justify-center min-h-[75vh] text-center">
                <div className="relative mb-10">
                    <TruckIcon className="h-32 w-32 text-slate-800 animate-pulse"/>
                    <div className="absolute inset-0 bg-red-600 rounded-full blur-3xl opacity-5"></div>
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-500 italic">Pre-Flight Required</h2>
                <p className="text-slate-600 mt-4 max-w-xs font-medium">Verify vehicle integrity and flip system ignition to receive mission telemetry.</p>
                <button 
                    onClick={() => setIsInspectionOpen(true)}
                    className="mt-12 bg-white text-slate-950 font-black py-5 px-16 rounded-[2rem] uppercase tracking-[0.3em] text-xs shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95 border-4 border-slate-900"
                >
                    Start Inspection
                </button>
           </div>
      ) : (
          <main className="p-6 md:p-12 space-y-10 max-w-5xl mx-auto animate-fade-in text-left">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl shadow-xl">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Queue</p>
                      <p className="text-4xl font-black italic tracking-tighter">{myDeliveries.length}</p>
                  </div>
                   <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl shadow-xl">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Tempo</p>
                      <p className="text-lg font-black text-emerald-400 uppercase italic tracking-tighter">On Schedule</p>
                  </div>
                  <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl shadow-xl">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Integrity</p>
                      <ShieldCheckIcon className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl shadow-xl">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Uplink</p>
                      <SignalIcon className="h-8 w-8 text-red-600 animate-pulse" />
                  </div>
              </div>

              {nextTarget ? (
                  <div className="bg-slate-900 border border-white/10 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent"></div>
                      <div className="relative z-10">
                          <div className="flex justify-between items-start mb-12">
                              <div>
                                  <div className="flex items-center gap-2 px-3 py-1 bg-red-600/10 border border-red-500/20 rounded-lg w-fit">
                                      <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></div>
                                      <span className="text-red-500 text-[10px] font-black uppercase tracking-widest">Active Objective</span>
                                  </div>
                                  <h2 className="text-6xl font-black tracking-tighter uppercase italic mt-4">{nextTarget.contractorName}</h2>
                              </div>
                               <button 
                                onClick={() => handleVoicePilot(`Confirming target for ${nextTarget.contractorName}. Mission destination is ${nextTarget.deliveryAddress}.`)}
                                disabled={isSpeaking}
                                className={`p-5 rounded-full border border-white/10 transition-all ${isSpeaking ? 'bg-red-600 shadow-[0_0_20px_red]' : 'bg-slate-800 hover:bg-slate-700'}`}
                               >
                                  <SpeakerWaveIcon className={`h-8 w-8 ${isSpeaking ? 'text-white animate-pulse' : 'text-slate-400'}`} />
                               </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                              <div className="flex items-start gap-6 text-left">
                                  <div className="p-4 bg-slate-800 rounded-2xl shadow-inner"><MapPinIcon className="h-8 w-8 text-slate-500"/></div>
                                  <div>
                                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Coordinates</p>
                                      <p className="text-xl font-bold text-slate-100 italic">{nextTarget.deliveryAddress}</p>
                                  </div>
                              </div>
                               <div className="flex items-start gap-6 text-left">
                                  <div className="p-4 bg-slate-800 rounded-2xl shadow-inner"><ClockIcon className="h-8 w-8 text-slate-500"/></div>
                                  <div>
                                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Handover Window</p>
                                      <p className="text-xl font-bold text-slate-100 italic">15 mins</p>
                                  </div>
                              </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {nextTarget.status === OrderStatus.OutForDelivery ? (
                                  <SwipeButton 
                                      label="SWIPE TO DEPLOY HANDSHAKE"
                                      onComplete={() => setCompletingOrder(nextTarget)}
                                      colorClass="bg-red-600"
                                  />
                              ) : (
                                  <button 
                                      onClick={() => handleIgnition(nextTarget)}
                                      className="w-full bg-white text-slate-950 font-black py-5 rounded-[2rem] shadow-2xl transition-all transform active:scale-95 uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-4 border-4 border-slate-900"
                                  >
                                      <PlayCircleIcon className="h-8 w-8 text-red-600"/> Engage Mission
                                  </button>
                              )}
                              
                              <button className="bg-slate-800 hover:bg-slate-700 border border-white/5 text-white font-black py-5 rounded-[2rem] transition-all flex items-center justify-center gap-4 uppercase tracking-widest text-xs">
                                  <PhoneIcon className="h-6 w-6 text-blue-500"/> Comms Link
                              </button>
                          </div>
                      </div>
                  </div>
              ) : (
                  <EmptyState icon={TruckIcon} title="GRID CLEAR" message="All payloads delivered. Return to logistics node for replenishment." />
              )}

              {/* Tactical Secondary Feed */}
              {myDeliveries.length > 1 && (
                  <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-6 text-left">
                      <h3 className="text-xs font-black uppercase text-slate-500 tracking-[0.2em] mb-6 border-b border-white/5 pb-4">Secondary Objectives</h3>
                      <div className="space-y-4">
                          {myDeliveries.slice(1).map((order, i) => (
                              <div key={order.id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                                  <div className="flex items-center gap-4">
                                      <span className="text-xs font-mono font-black text-blue-500">0{i+2}</span>
                                      <div className="text-left">
                                          <p className="font-bold text-sm text-slate-200">{order.contractorName}</p>
                                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{order.deliveryAddress}</p>
                                      </div>
                                  </div>
                                  <ArrowRightIcon className="h-4 w-4 text-slate-700" />
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </main>
      )}

      {isInspectionOpen && <VehicleInspectionModal onClose={() => setIsInspectionOpen(false)} onComplete={() => setIsOnDuty(true)} />}
      {completingOrder && <ProofOfDeliveryModal order={completingOrder} onClose={() => setCompletingOrder(null)} onComplete={async (oid, pod) => { await completeDelivery(oid, pod); setCompletingOrder(null); }} />}
      
      <div className="ferrari-watermark"></div>
    </div>
  );
};

export default DriverView;
