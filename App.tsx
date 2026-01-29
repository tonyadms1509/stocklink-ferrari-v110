
import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from './hooks/useAuth.tsx';
import { useData } from './hooks/useDataContext.tsx';
import { UserRole } from './types.ts';
import Logo from './components/Logo.tsx';

// Views
import ContractorView from './pages/contractor/ContractorView.tsx';
import SupplierView from './pages/supplier/SupplierView.tsx';
import AdminView from './pages/admin/AdminView.tsx';
import LogisticsView from './pages/logistics/LogisticsView.tsx';
// Added missing import for MarketerView
import MarketerView from './pages/marketer/MarketerView.tsx';
import LandingPage from './pages/LandingPage.tsx';
import Login from './pages/Login.tsx';
import SignUp from './pages/SignUp.tsx';

// Components
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import ToastContainer from './components/ToastContainer.tsx';
import ScrollToTopButton from './components/ScrollToTopButton.tsx';
import CommandPalette from './components/CommandPalette.tsx';
import MarketTicker from './components/MarketTicker.tsx';

const MissionLoader: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  
  useEffect(() => {
    const techLogs = [
      "ESTABLISHING NEURAL HANDSHAKE...",
      "SYNCHRONIZING NATIONAL SUPPLY NODES...",
      "LOADING ARBITRAGE VECTORS...",
      "CALIBRATING SANS COMPLIANCE ENGINE...",
      "GRID STABILIZATION: NOMINAL",
      "IGNITING FERRARI CORE..."
    ];
    
    let i = 0;
    const interval = setInterval(() => {
        if (i < techLogs.length) {
            setLogs(prev => [...prev, techLogs[i]]);
            i++;
        } else {
            clearInterval(interval);
        }
    }, 400);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-950 p-6 text-center z-[10000] animate-fade-in">
      <div className="absolute inset-0 bg-carbon opacity-30 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(220,0,0,0.1)_0%,_transparent_70%)] pointer-events-none"></div>
      <div className="relative flex flex-col items-center">
        <div className="relative w-64 h-64 md:w-80 md:h-80 mb-16">
          <div className="absolute inset-0 border-8 border-red-900/10 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 border-8 border-red-600 rounded-full border-t-transparent animate-[spin_1.5s_linear_infinite] shadow-[0_0_60px_rgba(220,0,0,0.3)]"></div>
          <Logo className="absolute inset-0 m-auto h-32 w-28 md:h-44 md:w-36 text-red-600 animate-fade-in" />
        </div>
        <div className="space-y-6 relative z-10 w-full max-w-sm">
          <h2 className="text-white font-black text-5xl italic tracking-tighter uppercase mb-2">IGNITION</h2>
          <div className="bg-black/40 p-6 rounded-3xl border border-white/5 shadow-inner text-left font-mono space-y-2">
             {logs.map((log, i) => (
                 <p key={i} className="text-[9px] text-blue-50 uppercase tracking-widest">
                    <span className="text-blue-700 opacity-40">[{new Date().toLocaleTimeString()}]</span> {log}
                 </p>
             ))}
          </div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Registry Synchronized v110.0</p>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { isRuggedMode } = useData();
  const [hash, setHash] = useState(window.location.hash || '#/');

  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (isLoading) return <MissionLoader />;

  if (!user) {
    const path = hash.split('?')[0];
    switch (path) {
      case '#/login': return <Login onSwitchToSignUp={() => window.location.hash = '#/signup'} />;
      case '#/signup': return <SignUp onSwitchToLogin={() => window.location.hash = '#/login'} />;
      default: return <LandingPage />;
    }
  }

  const renderRoleView = () => {
    switch (user.role) {
      case UserRole.Contractor: return <ContractorView key="view-contractor" />;
      case UserRole.Supplier: return <SupplierView key="view-supplier" />;
      case UserRole.Admin: return <AdminView key="view-admin" />;
      case UserRole.Logistics:
      case UserRole.Driver: return <LogisticsView key="view-logistics" />;
      case UserRole.Marketer: return <MarketerView key="view-marketer" />;
      default: return <ContractorView key="view-fallback" />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-700 ${isRuggedMode ? 'rugged-theme' : 'bg-slate-950'}`}>
      {!isRuggedMode && <div className="scanline pointer-events-none opacity-50"></div>}
      <CommandPalette />
      {!isRuggedMode && <MarketTicker />}
      <Header />
      <main className="flex-grow relative z-10 w-full overflow-x-hidden">
         <Suspense fallback={<MissionLoader />}>
            {renderRoleView()}
         </Suspense>
      </main>
      <Footer />
      <ScrollToTopButton />
      <ToastContainer />
    </div>
  );
};

export default App;
