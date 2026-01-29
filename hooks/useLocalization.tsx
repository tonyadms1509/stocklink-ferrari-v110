
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { en } from '../locales/en';
import { af } from '../locales/af';
import { zu } from '../locales/zu';

const translations: Record<string, any> = { en, af, zu };

interface LanguageContextState {
  locale: string;
  setLocale: (l: string) => void;
  t: (key: string, params?: Record<string, any>) => string;
}

const LanguageContext = createContext<LanguageContextState | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState('en');

  const t = (key: string, params?: Record<string, any>) => {
    let text = translations[locale]?.[key] || translations['en']?.[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLocalization = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLocalization context violation');
  return ctx;
};
