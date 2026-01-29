import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth.tsx';
import { UserRole } from './types.ts';
import Logo from './components/Logo.tsx';

// Components
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import ToastContainer from './components/ToastContainer.tsx';
import ScrollToTopButton from './components/ScrollToTopButton.tsx';
import CommandPalette from './components/CommandPalette.tsx';
import MarketTicker from './components/MarketTicker.tsx';

// Pages
import Login from './pages/Login.tsx';
import SignUp from './pages/SignUp.tsx';
import LandingPage from './pages/LandingPage.tsx';
import ContractorView from './pages/contractor/ContractorView.tsx';
import SupplierView from './pages/supplier/SupplierView.tsx';
import AdminView from './pages/admin/AdminView.tsx';
import LogisticsView from './pages/logistics/LogisticsView.tsx';
import { useData } from './hooks/useDataContext.tsx';

const AppLoader: React.FC = () => {
    const [showFailSafe, setShowFailSafe] = useState(false);
    const { startTestDrive } = useAuth();

    useEffect(() => {
        const timer = setTimeout(() => setShowFailSafe(true), 2500);
        return () => clearTimeout(timer);
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
                 
                 <div className="space-y-6 relative z-10">
                    <h2 className="text-white font-black text-5xl italic tracking-tighter uppercase mb-2">IGNITING FERRARI CORE</h2>
                    <p className="text-red-600 font-black uppercase tracking-[1.2em] text-xs animate-pulse">Neural Handshake</p>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Registry Synchronized v110.0</p>
                </div>

                {showFailSafe && (
                    <div className="mt-16 animate-fade-in-up">
                         <button 
                            onClick={() => startTestDrive()}
                            className="px-16 py-7 bg-red-600 text-white rounded-[2.5rem] text-sm font-black uppercase tracking-[0.4em] shadow-[0_0_80px_rgba(220,0,0,0.4)] border-4 border-slate-950 transform hover:scale-105 active:scale-95 transition-all"
                        >
                            Emergency Ignition
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const MainApp: React.FC = () => {
  const { user } = useAuth();
  const { isRuggedMode } = useData();
  
  // High-fidelity routing logic based on user role state
  const renderViewByRole = () => {
      // Keying the views ensures React re-mounts them when a role changes, fixing 'stuck page' issues.
      const currentRole = user?.role;
      if (currentRole === UserRole.Supplier) return <SupplierView key="supplier-view" />;
      if (currentRole === UserRole.Admin) return <AdminView key="admin-view" />;
      if (currentRole === UserRole.Logistics) return <LogisticsView key="logistics-view" />;
      if (currentRole === UserRole.Driver) return <LogisticsView key="driver-view" />;
      return <ContractorView key="contractor-view" />;
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-red-600/30 relative transition-colors duration-700 ${isRuggedMode ? 'rugged-theme' : 'bg-slate-950'}`}>
      {!isRuggedMode && <div className="scanline pointer-events-none opacity-50"></div>}
      
      <CommandPalette />
      {!isRuggedMode && <MarketTicker />}
      <Header />
      
      <main className="flex-grow w-full relative z-10">
            {renderViewByRole()}
      </main>
      
      <Footer />
      <ScrollToTopButton />
      <ToastContainer />
    </div>
  );
};

const App: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [hash, setHash] = useState(window.location.hash.substring(1) || '/');

  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash.substring(1) || '/');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (isLoading) return <AppLoader />;
  if (user) return <MainApp />;

  const currentPath = hash.split('?')[0];
  switch (currentPath) {
    case '/login': return <Login onSwitchToSignUp={() => window.location.hash = '#/signup'} />;
    case '/signup': return <SignUp onSwitchToLogin={() => window.location.hash = '#/login'} />;
    default: return <LandingPage />;
  }
};

export default App;