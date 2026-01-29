import React from 'react';
import { GlobeAmericasIcon, PhoneIcon, EnvelopeIcon, ShieldCheckIcon, MapPinIcon } from '@heroicons/react/24/solid';
import Logo from './Logo';

const Footer: React.FC = () => {
    return (
        <footer className="bg-slate-950 text-slate-400 py-16 border-t border-white/5 relative overflow-hidden no-print w-full">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-carbon opacity-10 pointer-events-none"></div>
            
            <div className="w-full px-4 md:px-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-20">
                    
                    {/* Brand Section */}
                    <div className="md:col-span-5 space-y-6">
                        <div className="flex items-center gap-3">
                            <Logo className="h-10 w-auto text-red-600" />
                            <span className="text-2xl font-black italic uppercase tracking-tighter text-white">StockLink <span className="text-red-600">Ferrari</span></span>
                        </div>
                        <p className="text-sm leading-relaxed max-w-sm font-medium">
                            The high-performance operating system for the South African construction industry. 
                            Connecting regional supply nodes with elite contracting units nationwide.
                        </p>
                        <div className="flex items-center gap-4 pt-4">
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">National Grid Active</span>
                            </div>
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">Build v80.5_REDLINE</span>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="md:col-span-3 space-y-6">
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white/50 pb-2 border-b border-white/5 w-fit">Legal Protocol</h4>
                        <ul className="space-y-3 text-sm font-bold uppercase tracking-widest">
                            <li><a href="#/terms" className="hover:text-red-600 transition-colors">SLA Protocols</a></li>
                            <li><a href="#/privacy" className="hover:text-red-600 transition-colors">Privacy Handshake</a></li>
                            <li><a href="#/help" className="hover:text-red-600 transition-colors">System Manual</a></li>
                            <li><a href="#/billing" className="hover:text-red-600 transition-colors">Registry Billing</a></li>
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div className="md:col-span-4 space-y-6">
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white/50 pb-2 border-b border-white/5 w-fit">Nerve Center Uplink</h4>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 group cursor-pointer">
                                <div className="p-2 bg-white/5 rounded-lg border border-white/10 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all">
                                    <MapPinIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-500 mb-0.5">Physical Node</p>
                                    <p className="text-sm font-bold text-slate-200">Fred Davey Street, Silverton, Pretoria</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 group cursor-pointer">
                                <div className="p-2 bg-white/5 rounded-lg border border-white/10 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all">
                                    <EnvelopeIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-500 mb-0.5">Packet Relay</p>
                                    <a href="mailto:contact@stocklinksa.co.za" className="text-sm font-bold text-slate-200 hover:text-red-600 transition-colors">contact@stocklinksa.co.za</a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 group cursor-pointer">
                                <div className="p-2 bg-white/5 rounded-lg border border-white/10 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all">
                                    <GlobeAmericasIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-500 mb-0.5">Web Gateway</p>
                                    <a href="https://www.stocklinksa.co.za" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-slate-200 hover:text-red-600 transition-colors">www.stocklinksa.co.za</a>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4 group cursor-pointer">
                                <div className="p-2 bg-white/5 rounded-lg border border-white/10 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all">
                                    <PhoneIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-500 mb-0.5">Voice Uplink</p>
                                    <a href="tel:+27671875500" className="text-sm font-bold text-slate-200 hover:text-red-600 transition-colors">+27 (0) 67 187 5500</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                        &copy; {new Date().getFullYear()} StockLink SA. Engine developed for South African Construction.
                    </p>
                    <div className="flex items-center gap-6 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                        <div className="flex items-center gap-2">
                             <ShieldCheckIcon className="h-4 w-4 text-emerald-500" />
                             <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">PCI-DSS Secure Settlement</span>
                        </div>
                        <div className="h-4 w-px bg-white/5"></div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Proudly South African 🇿🇦</span>
                    </div>
                </div>
            </div>
            
            {/* Absolute Watermark */}
            <div className="absolute -bottom-10 -left-10 text-[180px] font-black text-white/[0.02] uppercase tracking-tighter italic pointer-events-none select-none">
                GRID
            </div>
        </footer>
    );
};

export default Footer;