import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info, ShieldAlert } from 'lucide-react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((title, message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ addToast, removeToast }}>
      {children}

      {/* Floating Toasts Portal Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const isFraud = toast.type === 'fraud_alert';
          const isSuccess = toast.type === 'success';
          const isWarning = toast.type === 'warning';
          const isError = toast.type === 'error';

          let bgClass = 'bg-white border-slate-200 text-slate-800';
          let Icon = Info;
          let iconColor = 'text-primary-500';

          if (isFraud) {
            bgClass = 'bg-red-50 border-red-200 text-red-950 shadow-red-100/50';
            Icon = ShieldAlert;
            iconColor = 'text-red-600 animate-pulse';
          } else if (isSuccess) {
            bgClass = 'bg-green-50 border-green-200 text-green-950 shadow-green-100/50';
            Icon = CheckCircle;
            iconColor = 'text-green-600';
          } else if (isWarning) {
            bgClass = 'bg-amber-50 border-amber-200 text-amber-950 shadow-amber-100/50';
            Icon = AlertTriangle;
            iconColor = 'text-amber-600';
          } else if (isError) {
            bgClass = 'bg-red-50 border-red-200 text-red-950 shadow-red-100/50';
            Icon = AlertCircle;
            iconColor = 'text-red-600';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl animate-slide-up bg-white/95 backdrop-blur-md transition-all duration-300`}
            >
              <div className={`flex-shrink-0 mt-0.5 ${iconColor}`}>
                <Icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm leading-tight text-slate-900">{toast.title}</p>
                <p className="text-xs text-slate-600 mt-1 leading-normal font-light">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
