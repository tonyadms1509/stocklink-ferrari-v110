import { createContext, useContext, ReactNode } from "react";

interface ToastContextState {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextState | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const showToast = (message: string) => {
    alert(message); // simple placeholder, replace with real toast UI later
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};
