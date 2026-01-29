import React, { ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from '../App';
import { AuthProvider } from './hooks/useAuth.tsx';
import { LanguageProvider } from './hooks/useLocalization.tsx';
import { CurrencyProvider } from './hooks/useCurrency.tsx';
import { ToastProvider } from './hooks/useToast.tsx';
import { DataProvider } from './hooks/useDataContext.tsx';

/**
 * StockLink Ferrari Redline v110.0
 * Entry Point: High-Performance Construction OS
 */

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Fix: Explicitly declare state to resolve "Property 'state' does not exist on type 'ErrorBoundary'" errors.
  public state: ErrorBoundaryState = { hasError: false, error: null };
  // Added comment above fix
  // Fix: Explicitly declare props to resolve "Property 'props' does not exist on type 'ErrorBoundary'" errors
  public props: ErrorBoundaryProps;

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: ErrorInfo) {
    console.error("Ferrari Redline Stall Detected:", error, errorInfo);
  }

  handleHardReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/#/';
    window.location.reload();
  };

  render() {
    // Fix: Standard state access.
    const { hasError, error } = this.state;
    if (hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 text-white text-center font-sans">
          <div className="max-w-md animate-fade-in flex flex-col items-center">
            <div className="mb-10 relative">
                <div className="p-6 bg-red-600 rounded-[2.5rem] shadow-[0_0_80px_rgba(220,0,0,0.5)] border-4 border-slate-950">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
            </div>
            <h1 className="text-5xl font-black mb-4 text-white uppercase italic tracking-tighter leading-none">GRID <span className="text-red-600">STALL</span></h1>
            <p className="text-slate-400 mb-10 font-medium text-lg italic leading-relaxed">The national grid encountered a terminal synchronization conflict. Recovery protocol initiated.</p>
            
            <button 
              onClick={this.handleHardReset} 
              className="w-full bg-red-600 hover:bg-red-700 px-12 py-6 rounded-[2rem] font-black uppercase tracking-[0.4em] text-xs transition-all shadow-2xl shadow-red-900/40 transform active:scale-95 border-4 border-slate-950"
            >
              Reset Terminal Engine
            </button>
            
            <div className="mt-12 p-6 bg-black/60 border border-white/5 rounded-3xl text-left w-full shadow-inner">
                <p className="text-[10px] font-mono text-red-500/60 uppercase mb-3 font-black tracking-widest">Neural Error Log Payload:</p>
                <p className="text-[10px] font-mono text-slate-500 overflow-auto max-h-40 leading-relaxed break-all">{error?.message || error?.toString()}</p>
            </div>
          </div>
        </div>
      );
    }
    // Added comment above fix
    // Fix: Use type assertion on 'this' to access props as they are not detected via inheritance (line 78)
    return (this as any).props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = createRoot(rootElement);
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