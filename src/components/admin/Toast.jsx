import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, CircleAlert, Info } from 'lucide-react';

const ToastContext = createContext(null);

let toastId = 0;

function ToastIcon({ type }) {
  if (type === 'success') return <CheckCircle2 size={15} className="admin-toast-icon admin-toast-icon-success" aria-hidden="true" />;
  if (type === 'error') return <CircleAlert size={15} className="admin-toast-icon admin-toast-icon-error" aria-hidden="true" />;
  return <Info size={15} className="admin-toast-icon admin-toast-icon-info" aria-hidden="true" />;
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
            className={`admin-toast admin-toast-${t.type}`}
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
