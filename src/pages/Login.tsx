
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ArrowRightIcon, BeakerIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import Logo from '../components/Logo';
import { isSupabaseConfigured } from '../services/supabaseClient';

interface LoginProps {
    onSwitchToSignUp: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToSignUp }) => {
  const { login, startTestDrive } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    // The login implementation in useAuth.tsx expects (email, password)
    const errorMsg = await login(email, password);
    if (errorMsg) {
      setError(errorMsg);
    }
    setIsLoading(false);
  };
  
  const handleTestDrive = async () => {
      setIsLoading(true);
      setError('');
      try {
        await startTestDrive();
      } catch (e) {
          setError("Failed to start demo mode.");
          setIsLoading(false);
      }
  }

  return (
    <div className="min-h-screen flex bg-slate-950 font-sans selection:bg-red-600/30">
      <div className="scanline"></div>
      
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-slate-900/50 backdrop-blur-xl z-10 border-r border-white/5 shadow-2xl">
        <div className="mx-auto w-full max-w-sm lg:w-96 animate-fade-in-up">
          <div className="flex items-center gap-4 mb-12">
             <Logo className="h-14 w-auto text-red-600 drop-shadow-[0_0_15px_rgba(220,0,0,0.4)]" />
             <div className="text-left">
                <span className="text-3xl font-black text-white tracking-tighter uppercase italic block leading-none">StockLink</span>
                <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.5em]">Ferrari Redline</span>
             </div>
          </div>
          
          <div className="mb-10 text-left">
            <h2 className="text-4xl font-black text-white tracking-tight uppercase italic">
              Grid <span className="text-red-600">Access</span>
            </h2>
            <p className="mt-3 text-sm text-slate-400 font-medium">
              Initialize your session or{' '}
              <button onClick={onSwitchToSignUp} className="font-bold text-red-500 hover:text-red-400 underline decoration-2 underline-offset-4">
                create a new node
              </button>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
                <div className="text-left">
                    <label htmlFor="email" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                        Email Address
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="operator@grid.io"
                        className="appearance-none block w-full px-5 py-4 bg-white/5 border-2 border-white/5 rounded-2xl text-white placeholder-slate-700 focus:outline-none focus:border-red-600 transition-all font-medium"
                    />
                </div>

                <div className="text-left">
                    <label htmlFor="password" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                        Access Key
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="appearance-none block w-full px-5 py-4 bg-white/5 border-2 border-white/5 rounded-2xl text-white placeholder-slate-700 focus:outline-none focus:border-red-600 transition-all font-medium"
                    />
                </div>
                
                {error && <div className="text-xs font-black text-red-500 bg-red-500/10 p-4 rounded-2xl border border-red-500/20 text-center animate-shake uppercase tracking-widest">{error}</div>}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-5 px-4 border border-transparent rounded-[2rem] shadow-2xl text-xs font-black uppercase tracking-[0.4em] text-white bg-red-600 hover:bg-red-700 transition-all transform active:scale-95 disabled:opacity-70"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <span className="flex items-center gap-2">Ignition <ArrowRightIcon className="h-4 w-4"/></span>
                    )}
                </button>
            </div>

            <div className="space-y-4 pt-6">
                <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/5"></div>
                    </div>
                    <div className="relative flex justify-center text-[9px]">
                        <span className="px-4 bg-slate-950 text-slate-600 font-black uppercase tracking-[0.4em]">Alternative Bypass</span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleTestDrive}
                    disabled={isLoading}
                    className="w-full flex justify-center py-5 px-4 border-4 border-slate-800 rounded-[2.5rem] shadow-lg text-xs font-black uppercase tracking-[0.4em] text-slate-300 bg-transparent hover:bg-white/5 transition-all transform active:scale-95 flex items-center gap-4"
                >
                    <BeakerIcon className="h-5 w-5 text-blue-500"/> 
                    Activate Demo Mode
                </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="hidden lg:block relative w-0 flex-1 bg-slate-950 overflow-hidden">
         <div className="absolute inset-0 bg-carbon opacity-20"></div>
         <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-transparent opacity-60"></div>
         <img
          className="absolute inset-0 h-full w-full object-cover grayscale opacity-40 mix-blend-overlay scale-110"
          src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
          alt="Site Scaffolding"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center px-24 text-left">
            <div className="holographic-glass p-16 rounded-[4rem] border-white/5 shadow-2xl max-w-3xl transform -rotate-1">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-1.5 h-10 bg-red-600 rounded-full shadow-[0_0_15px_red]"></div>
                    <h2 className="text-7xl font-black text-white tracking-tighter uppercase italic leading-none">THE <span className="text-red-600">HUD.</span></h2>
                </div>
                <p className="text-2xl text-blue-100/80 max-w-lg mb-12 font-medium leading-relaxed italic text-left">
                    "Precision engineered for the African grid. Neural sourcing, automated safety audits, and real-time project telemetry."
                </p>
                <div className="flex gap-6">
                    <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Sync: Stable</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_#3b82f6]"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Core: v110</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
