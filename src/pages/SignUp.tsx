
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import Logo from '../components/Logo';
import { ArrowRightIcon, BuildingStorefrontIcon, CheckBadgeIcon, WrenchScrewdriverIcon, ExclamationTriangleIcon, GiftIcon } from '@heroicons/react/24/solid';
import { isSupabaseConfigured } from '../services/supabaseClient';

interface SignUpProps {
    onSwitchToLogin: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSwitchToLogin }) => {
  const { signUp } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.Contractor);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    // 1. Get role from URL
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const roleParam = params.get('role');
    if (roleParam === 'supplier') {
        setRole(UserRole.Supplier);
    } else if (roleParam === 'contractor') {
        setRole(UserRole.Contractor);
    }

    // 2. Get referral code from URL
    const refParam = params.get('ref');
    if (refParam) {
        setReferralCode(refParam);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    if (password.length < 6) {
        setError('Password should be at least 6 characters.');
        setIsLoading(false);
        return;
    }

    if (!agreedToTerms) {
        setError('You must agree to the Terms of Service.');
        setIsLoading(false);
        return;
    }

    const resultMsg = await signUp(companyName, email, role, password, referralCode || undefined);
    if (resultMsg) {
      if (resultMsg.includes('check your email')) {
          setSuccessMessage(resultMsg);
      } else {
          setError(resultMsg);
      }
    }
    setIsLoading(false);
  };

  if (successMessage) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 text-center border border-gray-100">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
                <CheckBadgeIcon className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Account Created!</h2>
            <p className="text-gray-600 mb-8 text-lg">{successMessage}</p>
            <button onClick={onSwitchToLogin} className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition-all transform hover:-translate-y-1 shadow-md">
                Proceed to Login
            </button>
          </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex bg-white">
       {/* Left Side - Image/Content */}
       <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white z-10 overflow-y-auto">
        <div className="mx-auto w-full max-w-sm lg:w-96">
           <div className="flex items-center gap-2 mb-8">
             <Logo className="h-10 w-auto text-primary" />
             <span className="text-2xl font-extrabold text-gray-900">StockLink</span>
          </div>
          
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{' '}
              <button onClick={onSwitchToLogin} className="font-medium text-primary hover:text-blue-500">
                Sign in
              </button>
            </p>
          </div>

          {referralCode && (
              <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-center gap-3 animate-fade-in-scale">
                  <div className="bg-purple-100 p-2 rounded-full">
                      <GiftIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                      <p className="text-sm font-bold text-purple-800">Referral Bonus Active</p>
                      <p className="text-xs text-purple-600">You're being referred by a partner.</p>
                  </div>
              </div>
          )}

          {!isSupabaseConfigured && (
              <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-md flex gap-3 items-start animate-fade-in-scale">
                  <ExclamationTriangleIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                      <p className="font-bold text-blue-800 text-sm">Demo Mode Active</p>
                      <p className="text-xs text-blue-700 mt-1">
                          No backend connected. Your account will be created temporarily in memory.
                      </p>
                  </div>
              </div>
          )}

          <div className="mt-8">
             <form onSubmit={handleSubmit} className="space-y-6">
                <fieldset className="space-y-6">
                    {/* Role Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">I am joining as a:</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                type="button" 
                                onClick={() => setRole(UserRole.Contractor)}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${role === UserRole.Contractor ? 'border-primary bg-blue-50 text-primary' : 'border-gray-200 hover:border-gray-300 text-gray-500'}`}
                            >
                                <WrenchScrewdriverIcon className="h-6 w-6 mb-2"/>
                                <span className="font-bold text-sm">Contractor</span>
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setRole(UserRole.Supplier)}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${role === UserRole.Supplier ? 'border-primary bg-blue-50 text-primary' : 'border-gray-200 hover:border-gray-300 text-gray-500'}`}
                            >
                                <BuildingStorefrontIcon className="h-6 w-6 mb-2"/>
                                <span className="font-bold text-sm">Supplier</span>
                            </button>
                        </div>
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-700">Company / Full Name</label>
                    <div className="mt-1">
                        <input 
                            type="text" required 
                            className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-all disabled:bg-gray-100" 
                            value={companyName} onChange={e => setCompanyName(e.target.value)} 
                        />
                    </div>
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-700">Email address</label>
                    <div className="mt-1">
                        <input 
                            type="email" required 
                            className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-all disabled:bg-gray-100" 
                            value={email} onChange={e => setEmail(e.target.value)} 
                        />
                    </div>
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <div className="mt-1">
                        <input 
                            type="password" required 
                            className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-all disabled:bg-gray-100" 
                            value={password} onChange={e => setPassword(e.target.value)} 
                        />
                    </div>
                    </div>

                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="terms"
                                name="terms"
                                type="checkbox"
                                checked={agreedToTerms}
                                onChange={e => setAgreedToTerms(e.target.checked)}
                                className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="terms" className="font-medium text-gray-700">
                                I agree to the <a href="#/terms" className="text-primary hover:underline">Terms of Service</a> and <a href="#/privacy" className="text-primary hover:underline">Privacy Policy</a>
                            </label>
                        </div>
                    </div>

                    {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 text-center">{error}</div>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Creating Account...' : <span className="flex items-center gap-2">Get Started <ArrowRightIcon className="h-4 w-4"/></span>}
                    </button>
                </fieldset>
             </form>
          </div>
        </div>
      </div>

       {/* Right Side - Image */}
      <div className="hidden lg:block relative w-0 flex-1 bg-gray-900 overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-bl from-emerald-900 to-gray-900 opacity-80 z-10"></div>
         <img
          className="absolute inset-0 h-full w-full object-cover opacity-60"
          src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
          alt="Industrial background"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center px-20 text-white">
            <h2 className="text-5xl font-extrabold mb-6 leading-tight">Build your business on solid ground.</h2>
            <p className="text-xl text-emerald-100 max-w-lg mb-10">
                Join the fastest growing network of construction professionals in the region.
            </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
