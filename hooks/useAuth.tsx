import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, UserRole, Company, CompanyMember } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

interface AuthContextState {
  user: User | null;
  currentCompany: Company | null;
  currentMember: CompanyMember | null;
  isLoading: boolean;
  isTestDrive: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  signUp: (companyName: string, email: string, role: UserRole, password: string, referredByCode?: string) => Promise<string | null>;
  logout: () => void;
  switchAccount: (role: UserRole) => Promise<void>;
  updateCurrentUser: (updatedUser: Partial<User>) => void;
  startTestDrive: (role?: UserRole) => void;
  subscribeUser: () => void;
}

const AuthContext = createContext<AuthContextState | undefined>(undefined);
const USER_SESSION_KEY = 'stocklink_ferrari_master_session_v110';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [initialData] = useState(() => {
    const stored = sessionStorage.getItem(USER_SESSION_KEY);
    if (stored) {
        try { return JSON.parse(stored); } catch (e) { return null; }
    }
    return null;
  });

  const [user, setUser] = useState<User | null>(initialData?.user || null);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(initialData?.company || null);
  const [currentMember, setCurrentMember] = useState<CompanyMember | null>(null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [isTestDrive, setIsTestDrive] = useState(initialData?.isTestDrive || false);

  const hydrateCompany = (company: Company): Company => ({
    ...company,
    contact: company.contact || { phone: '', email: '', website: '', whatsapp: '' },
    businessHours: company.businessHours || { weekdays: '07:00 - 18:00', saturday: '08:00 - 14:00', sunday: 'Closed' }
  });

  const startTestDrive = (role: UserRole = UserRole.Contractor) => {
    const masterUser: User = {
        id: 'user-master-777',
        name: 'Fleet Commander',
        email: 'elite@stocklink.io',
        role: role,
        activeCompanyId: 'comp-777-ferrari',
        company: 'Ferrari Redline Construction',
        subscriptionStatus: 'active',
        walletBalance: 142500,
        verificationStatus: 'verified'
    };

    const masterCompany = hydrateCompany({
        id: 'comp-777-ferrari',
        name: 'Ferrari Redline Construction',
        type: role === UserRole.Admin ? 'admin' : (role === UserRole.Logistics ? 'logistics' : role as any),
        ownerId: 'user-master-777',
        subscriptionStatus: 'active',
        verificationStatus: 'verified',
        location: 'Sandton, GP',
        coordinates: { lat: -26.1076, lon: 28.0567 },
        contact: {
            phone: '+27 11 555 0123',
            email: 'ops@ferrari-redline.co.za',
            website: 'www.ferrari-redline.co.za',
            whatsapp: '27115550123'
        },
        businessHours: { weekdays: '07:00 - 18:00', saturday: '08:00 - 14:00', sunday: 'Closed' }
    });

    setUser(masterUser);
    setCurrentCompany(masterCompany);
    setIsTestDrive(true);
    sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify({ user: masterUser, company: masterCompany, isTestDrive: true }));
    setIsLoading(false);
  };

  const login = async (email: string, password: string): Promise<string | null> => {
    const pwd = password.toLowerCase();
    if (pwd === 'ferrari' || pwd === 'demo') {
        let role = UserRole.Contractor;
        if (email.includes('admin')) role = UserRole.Admin;
        else if (email.includes('supplier')) role = UserRole.Supplier;
        else if (email.includes('logistics')) role = UserRole.Logistics;
        startTestDrive(role);
        return null;
    }
    if (!isSupabaseConfigured) return 'Grid Infrastructure Offline.';
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  };

  useEffect(() => {
    const initializeAuth = async () => {
        if (!initialData && isSupabaseConfigured) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*, companies(*)')
                    .eq('id', session.user.id)
                    .single();

                if (profile) {
                    const activeUser: User = {
                        id: profile.id,
                        name: profile.name,
                        email: profile.email,
                        role: profile.role as UserRole,
                        activeCompanyId: profile.active_company_id,
                        company: profile.companies?.name,
                        subscriptionStatus: profile.subscription_status
                    };
                    setUser(activeUser);
                    if (profile.companies) {
                        setCurrentCompany(hydrateCompany(profile.companies));
                    }
                }
            }
        }
        setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const logout = () => {
    if (isSupabaseConfigured) supabase.auth.signOut();
    setUser(null);
    setCurrentCompany(null);
    sessionStorage.removeItem(USER_SESSION_KEY);
    window.location.hash = '#/';
  };

  const switchAccount = async (role: UserRole) => {
      if (user && currentCompany) {
          const updatedUser = { ...user, role };
          setUser(updatedUser);
          sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify({ user: updatedUser, company: currentCompany, isTestDrive }));
      }
  };

  const subscribeUser = () => {
      if (currentCompany) {
          const updated = { ...currentCompany, subscriptionStatus: 'active' as const };
          setCurrentCompany(updated);
          if (user) {
              sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify({ user, company: updated, isTestDrive }));
          }
      }
  };

  return (
    <AuthContext.Provider value={{ 
      user, currentCompany, currentMember, isLoading, isTestDrive, 
      login, signUp: async () => 'Signup restricted in demo core.', logout, switchAccount, 
      updateCurrentUser: (u) => {
          const newUser = user ? {...user, ...u} : null;
          if (newUser && currentCompany) {
              setUser(newUser);
              sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify({ user: newUser, company: currentCompany, isTestDrive }));
          }
      },
      startTestDrive,
      subscribeUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};