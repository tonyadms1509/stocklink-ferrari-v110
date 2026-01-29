import React, { ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './hooks/useAuth.tsx';
import { LanguageProvider } from './hooks/useLocalization.tsx';
import { CurrencyProvider } from './hooks/useCurrency.tsx';
import { ToastProvider } from './hooks/useToast.tsx';
import { DataProvider } from './hooks/useDataContext.tsx';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * MASTERPIECE ERROR BOUNDARY v110.2
 * High-fidelity recovery for the National Grid
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Added comment above fix
  // Fix: Explicitly declare state and props to resolve "Property 'state' does not exist on type 'ErrorBoundary'" and "Property 'props' does not exist on type 'ErrorBoundary'" errors.
  public state: ErrorBoundaryState;
  public props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    // Added comment above fix
    // Fix: Properly initialize state in constructor.
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("GRID_STALL_TELEMETRY:", error, errorInfo);
    // Added comment above fix
    // Fix: Access setState via any cast to resolve "Property 'setState' does not exist on type 'ErrorBoundary'" error.
    (this as any).setState({ errorInfo });
  }

  handleSelfRepair = () => {
    // Clear potentially corrupted session fragments
    sessionStorage.removeItem('stocklink_ferrari_master_session_v110');
    localStorage.removeItem('stocklink_ferrari_v110_system_state');
    // Force immediate sync reboot
    window.location.replace(window.location.origin + window.location.pathname + '#/');
    window.location.reload();
  };

  render() {
    // Added comment above fix
    // Fix: Access state via this.state.
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 text-white text-center font-sans relative overflow-hidden">
          <div className="absolute inset-0 bg-carbon opacity-20"></div>
          <div className="max-w-xl animate-fade-in flex flex-col items-center relative z-10 text-left">
            <div className="mb-12 relative self-center">
                <div className="p-12 bg-red-600 rounded-[3.5rem] shadow-[0_0_120px_rgba(220,0,0,0.4)] border-4 border-slate-950 animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
            </div>
            
            <h1 className="text-7xl font-black mb-6 text-white uppercase italic tracking-tighter leading-none text-center">GRID <span className="text-red-600">STALL</span></h1>
            <p className="text-slate-400 mb-12 font-medium text-xl italic leading-relaxed text-center">The national synchronization grid encountered a terminal handshake conflict. Operational buffer purge required to re-establish uplink.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <button 
                    onClick={() => window.location.reload()} 
                    className="bg-white/5 text-white hover:bg-white/10 px-8 py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] transition-all border border-white/10"
                >
                  Retry Handshake
                </button>
                <button 
                    onClick={this.handleSelfRepair} 
                    className="bg-red-600 text-white hover:bg-red-700 px-8 py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] transition-all shadow-2xl border-4 border-slate-950"
                >
                  Execute Self-Repair
                </button>
            </div>
            
            <div className="mt-16 p-10 bg-black/60 border border-white/5 rounded-[3rem] text-left w-full shadow-inner">
                <p className="text-[11px] font-black text-red-500/60 uppercase mb-4 tracking-widest font-mono flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-600 animate-ping"></div>
                    Neural Error Payload:
                </p>
                <div className="text-[10px] font-mono text-slate-500 overflow-auto max-h-48 leading-relaxed">
                  {/* Added comment above fix */}
                  {/* Fix: Access error from state. */}
                  <p className="font-bold text-slate-300 mb-3 text-sm">{this.state.error?.message || "SYNCHRONIZATION_UNKNOWN_FRICTION"}</p>
                  <pre className="whitespace-pre-wrap opacity-40">
                    {/* Added comment above fix */}
                    {/* Fix: Access errorInfo from state. */}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
            </div>
          </div>
        </div>
      );
    }
    // Added comment above fix
    // Fix: Access props via this.props.
    return this.props.children;
  }
}

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <ErrorBoundary>
                <LanguageProvider>
                    <CurrencyProvider>
                        <AuthProvider>
                            <ToastProvider>
                                <DataProvider>
                                    <App />
                                </DataProvider>
                            </ToastProvider>
                        </AuthProvider>
                    </CurrencyProvider>
                </LanguageProvider>
            </ErrorBoundary>
        </React.StrictMode>
    );
}
