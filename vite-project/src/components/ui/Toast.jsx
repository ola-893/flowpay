import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Toast Context
const ToastContext = createContext(null);

// Toast Types Configuration
const toastConfig = {
  success: {
    icon: '✓',
    bgClass: 'bg-success-500/10 border-success-500/30',
    iconClass: 'bg-success-500 text-white',
    textClass: 'text-success-400',
  },
  error: {
    icon: '✕',
    bgClass: 'bg-error-500/10 border-error-500/30',
    iconClass: 'bg-error-500 text-white',
    textClass: 'text-error-400',
  },
  warning: {
    icon: '!',
    bgClass: 'bg-warning-500/10 border-warning-500/30',
    iconClass: 'bg-warning-500 text-white',
    textClass: 'text-warning-400',
  },
  info: {
    icon: 'i',
    bgClass: 'bg-flowpay-500/10 border-flowpay-500/30',
    iconClass: 'bg-flowpay-500 text-white',
    textClass: 'text-flowpay-400',
  },
  loading: {
    icon: '⟳',
    bgClass: 'bg-white/5 border-white/20',
    iconClass: 'bg-white/20 text-white animate-spin',
    textClass: 'text-white/80',
  },
};

// Individual Toast Component
function Toast({ id, type = 'info', title, message, duration = 5000, onDismiss, action }) {
  const [isExiting, setIsExiting] = useState(false);
  const config = toastConfig[type] || toastConfig.info;

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onDismiss(id), 200);
  }, [id, onDismiss]);

  // Auto-dismiss
  useEffect(() => {
    if (duration && type !== 'loading') {
      const timer = setTimeout(handleDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, type, handleDismiss]);

  return (
    <div
      className={`
        relative flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md
        shadow-lg max-w-sm w-full
        transition-all duration-200 ease-out
        ${config.bgClass}
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
        animate-slide-up
      `}
      role="alert"
    >
      {/* Icon */}
      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${config.iconClass}`}>
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <p className={`font-semibold text-sm ${config.textClass}`}>{title}</p>
        )}
        {message && (
          <p className="text-sm text-white/70 mt-0.5">{message}</p>
        )}
        {action && (
          <button
            onClick={() => {
              action.onClick();
              handleDismiss();
            }}
            className="mt-2 text-sm font-medium text-flowpay-400 hover:text-flowpay-300 transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Progress Bar (for auto-dismiss) */}
      {duration && type !== 'loading' && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 rounded-b-xl overflow-hidden">
          <div
            className={`h-full ${config.textClass.replace('text-', 'bg-')}`}
            style={{
              animation: `shrink ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
}

// Toast Container
function ToastContainer({ toasts, onDismiss }) {
  return (
    <div
      className="fixed bottom-20 md:bottom-6 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}

// Toast Provider
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((options) => {
    const id = Date.now() + Math.random();
    const toast = { id, ...options };
    setToasts((prev) => [...prev, toast]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateToast = useCallback((id, options) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...options } : t))
    );
  }, []);

  // Convenience methods
  const toast = useCallback((message, options = {}) => {
    return addToast({ message, ...options });
  }, [addToast]);

  toast.success = (message, options = {}) => addToast({ type: 'success', message, ...options });
  toast.error = (message, options = {}) => addToast({ type: 'error', message, ...options });
  toast.warning = (message, options = {}) => addToast({ type: 'warning', message, ...options });
  toast.info = (message, options = {}) => addToast({ type: 'info', message, ...options });
  toast.loading = (message, options = {}) => addToast({ type: 'loading', message, duration: 0, ...options });
  toast.dismiss = removeToast;
  toast.update = updateToast;

  // Transaction-specific toasts
  toast.transaction = {
    pending: (message = 'Transaction pending...') => 
      addToast({ type: 'loading', title: 'Transaction', message, duration: 0 }),
    success: (message = 'Transaction confirmed!', txHash) => 
      addToast({ 
        type: 'success', 
        title: 'Transaction Confirmed', 
        message,
        action: txHash ? {
          label: 'View on Explorer →',
          onClick: () => window.open(`https://sepolia.etherscan.io/tx/${txHash}`, '_blank')
        } : undefined
      }),
    error: (message = 'Transaction failed') => 
      addToast({ type: 'error', title: 'Transaction Failed', message }),
  };

  // Stream-specific toasts
  toast.stream = {
    created: (streamId) => 
      addToast({ type: 'success', title: 'Stream Created', message: `Stream #${streamId} is now active` }),
    cancelled: (streamId) => 
      addToast({ type: 'info', title: 'Stream Cancelled', message: `Stream #${streamId} has been cancelled` }),
    withdrawn: (amount) => 
      addToast({ type: 'success', title: 'Withdrawal Complete', message: `${amount} MNEE withdrawn successfully` }),
    lowBalance: (streamId) => 
      addToast({ type: 'warning', title: 'Low Balance', message: `Stream #${streamId} is running low on funds` }),
    expired: (streamId) => 
      addToast({ type: 'info', title: 'Stream Completed', message: `Stream #${streamId} has finished` }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// CSS for shrink animation (add to index.css)
export const toastStyles = `
@keyframes shrink {
  from { width: 100%; }
  to { width: 0%; }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.2s ease-out;
}
`;
