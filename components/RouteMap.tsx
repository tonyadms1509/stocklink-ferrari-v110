
import React, { useMemo } from 'react';
import { MapPin, Navigation, Zap, Radio } from 'lucide-react';

interface Stop {
    address: string;
    coordinates: { lat: number; lon: number };
    orderNumber: string;
}

interface RouteMapProps {
  stops: Stop[];
}

const MAP_BOUNDS = {
  latMin: -26.5, latMax: -25.5,
  lonMin: 27.8, lonMax: 28.5,
};

const convertCoordsToPercent = (lat: number, lon: number) => {
  const latRange = MAP_BOUNDS.latMax - MAP_BOUNDS.latMin;
  const lonRange = MAP_BOUNDS.lonMax - MAP_BOUNDS.lonMin;
  const top = ((MAP_BOUNDS.latMax - lat) / latRange) * 100;
  const left = ((lon - MAP_BOUNDS.lonMin) / lonRange) * 100;
  return { top: `${top}%`, left: `${left}%` };
};

const RouteMap: React.FC<RouteMapProps> = ({ stops }) => {
    const stopPositions = useMemo(() => stops.map(stop => ({
        ...stop,
        position: convertCoordsToPercent(stop.coordinates.lat, stop.coordinates.lon),
    })), [stops]);

    return (
        <div className="relative w-full h-full bg-[#020617] rounded-[2.5rem] overflow-hidden border-4 border-slate-900 shadow-2xl" style={{ minHeight: '450px' }}>
            {/* Grid Overlay */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ 
                backgroundImage: 'radial-gradient(circle, #1e293b 1px, transparent 1px)', 
                backgroundSize: '30px 30px' 
            }}></div>
            
            {/* Scanning Line */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="w-full h-1 bg-blue-500/20 absolute top-0 shadow-[0_0_20px_#3b82f6] animate-scan"></div>
            </div>

            {/* Static Map Background Elements */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>

            {/* Render markers for each stop */}
            {stopPositions.map((stop, index) => (
                <div key={index} style={{ ...stop.position, position: 'absolute' }} className="transform -translate-x-1/2 -translate-y-full z-30">
                    <div className="relative group flex flex-col items-center">
                         <div className={`p-2 rounded-xl border-2 shadow-2xl transition-all duration-500 ${index === 0 ? 'bg-red-600 border-red-400 shadow-red-900/50 scale-110' : 'bg-slate-900 border-blue-500/50 hover:scale-125'}`}>
                            {index === 0 ? <Navigation size={20} className="text-white" /> : <MapPin size={18} className="text-blue-400" />}
                         </div>
                         
                         {/* Marker Label */}
                         <div className="absolute top-full mt-2 bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                             <p className="text-[8px] font-black text-white uppercase tracking-widest">NODE {index === 0 ? 'START' : `0${index}`}</p>
                             <p className="text-[10px] font-bold text-blue-400">{stop.address.split(',')[0]}</p>
                         </div>
                    </div>
                </div>
            ))}

            {/* Render lines connecting the markers */}
            <svg className="absolute top-0 left-0 w-full h-full z-10" style={{ pointerEvents: 'none' }}>
                <defs>
                    <linearGradient id="vectorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
                        <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.2" />
                    </linearGradient>
                </defs>
                {stopPositions.slice(0, -1).map((stop, index) => {
                    const nextStop = stopPositions[index + 1];
                    return (
                        <g key={index}>
                            <line 
                                x1={stop.position.left} y1={stop.position.top} 
                                x2={nextStop.position.left} y2={nextStop.position.top} 
                                stroke="url(#vectorGradient)" 
                                strokeWidth="6" 
                                strokeDasharray="15, 10" 
                                className="animate-vector-flow"
                                strokeLinecap="round"
                            />
                            <circle cx={nextStop.position.left} cy={nextStop.position.top} r="4" fill="#60a5fa" className="animate-pulse shadow-2xl" />
                        </g>
                    );
                })}
            </svg>

            {/* HUD Indicators */}
            <div className="absolute bottom-6 left-6 z-40 space-y-2">
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5">
                    <Radio size={14} className="text-red-600 animate-pulse" />
                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-[0.3em]">Signal: Secure</span>
                </div>
                 <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5">
                    <Zap size={14} className="text-blue-500 animate-pulse" />
                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-[0.3em]">Uplink: v80.5</span>
                </div>
            </div>

            <style>{`
                @keyframes vector-flow {
                    from { stroke-dashoffset: 250; }
                    to { stroke-dashoffset: 0; }
                }
                .animate-vector-flow {
                    animation: vector-flow 8s linear infinite;
                }
                @keyframes scan {
                    0% { transform: translateY(0); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateY(1000%); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default RouteMap;
