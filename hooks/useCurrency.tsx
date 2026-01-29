
import React, { createContext, useContext, ReactNode, useState, useCallback, useMemo } from 'react';
import { Currency } from '../types';

interface CurrencyContextState {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatCurrency: (val: number) => string;
}

const CurrencyContext = createContext<CurrencyContextState | undefined>(undefined);
const CURRENCY_STORAGE_KEY = 'stocklink_ferrari_currency_v110';

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
    return (stored as Currency) || Currency.ZAR;
  });

  const setCurrency = useCallback((c: Currency) => {
      setCurrencyState(c);
      localStorage.setItem(CURRENCY_STORAGE_KEY, c);
  }, []);

  const rates: Record<Currency, number> = useMemo(() => ({
    [Currency.ZAR]: 1,
    [Currency.USD]: 0.054, 
    [Currency.EUR]: 0.050, 
    [Currency.GBP]: 0.042, 
    [Currency.CNY]: 0.39,
    [Currency.AED]: 0.20
  }), []);

  const symbols: Record<Currency, string> = useMemo(() => ({
    [Currency.ZAR]: 'R ',
    [Currency.USD]: '$',
    [Currency.EUR]: '€',
    [Currency.GBP]: '£',
    [Currency.CNY]: '¥',
    [Currency.AED]: 'د.إ'
  }), []);

  const formatCurrency = useCallback((val: number) => {
    const rate = rates[currency] || 1;
    const converted = val * rate;
    const symbol = symbols[currency] || 'R ';
    
    return `${symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, [currency, rates, symbols]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency protocol violation: missing provider');
  return ctx;
};
