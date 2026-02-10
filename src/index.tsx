import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { AuthProvider } from './hooks/useAuth';
import { LanguageProvider } from './hooks/useLocalization';   // <-- requires useLocalization.tsx in hooks/
import { CurrencyProvider } from './hooks/useCurrency';
import { ToastProvider } from './hooks/useToast';
import { DataProvider } from './hooks/useDataContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <ToastProvider>
            <DataProvider>
              <App />
            </DataProvider>
          </ToastProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </AuthProvider>
  </React.StrictMode>
);
