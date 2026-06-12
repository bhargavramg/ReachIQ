import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const ToastContext = createContext(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(({ type, message, duration = 4000 }) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    if (type !== 'loading' && duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }

    return id;
  }, [dismiss]);

  const success = useCallback((message, duration) => show({ type: 'success', message, duration }), [show]);
  const error = useCallback((message, duration) => show({ type: 'error', message, duration }), [show]);
  const loading = useCallback((message) => show({ type: 'loading', message, duration: 0 }), [show]);

  return (
    <ToastContext.Provider value={{ success, error, loading, dismiss }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full sm:w-96 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border transition-all duration-300 transform translate-y-0 scale-100 bg-white ${
              toast.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-800'
                : toast.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-800'
                : 'border-blue-200 bg-blue-50 text-blue-800'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
              {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
              {toast.type === 'loading' && <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />}
            </div>
            <div className="flex-1 text-sm font-medium leading-relaxed">
              {toast.message}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className={`shrink-0 text-xs font-bold hover:opacity-75 transition-opacity ${
                toast.type === 'success'
                  ? 'text-green-600'
                  : toast.type === 'error'
                  ? 'text-red-600'
                  : 'text-blue-600'
              }`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
