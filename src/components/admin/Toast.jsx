import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, CircleAlert, Info } from 'lucide-react';

const ToastContext = createContext(null);

let toastId = 0;

const toneCls = {
  success: 'border-emerald-400/40',
  error: 'border-red-400/40',
  info: 'border-[#D4AF37]/40',
};

function ToastIcon({ type }) {
  if (type === 'success') return <CheckCircle2 className="size-4 shrink-0 text-emerald-300" aria-hidden="true" />;
  if (type === 'error') return <CircleAlert className="size-4 shrink-0 text-red-300" aria-hidden="true" />;
  return <Info className="size-4 shrink-0 text-[#E2B857]" aria-hidden="true" />;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const toastApi = useCallback(
    Object.assign((message, type, duration) => addToast(message, type, duration), {
      success: (message, duration) => addToast(message, 'success', duration),
      error: (message, duration) => addToast(message, 'error', duration),
      info: (message, duration) => addToast(message, 'info', duration),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={toastApi}>
      {children}
      <div className="admin-toast-container">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`admin-toast admin-toast-${t.type} rounded-xl border border-neutral-800 border-l-4 bg-[#0B0905] text-neutral-100 transition-opacity duration-200 ease-out ${toneCls[t.type] || toneCls.info}`}
          >
            <ToastIcon type={t.type} />
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
