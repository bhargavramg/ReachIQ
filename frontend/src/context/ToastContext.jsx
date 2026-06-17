import React, { createContext, useContext, useCallback } from 'react';
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ToastContext = createContext(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }) {
  const success = useCallback((message) => toast.success(message), []);
  const error = useCallback((message) => toast.error(message), []);
  const warning = useCallback((message) => toast.warning(message), []);
  const info = useCallback((message) => toast.info(message), []);
  const loading = useCallback((message) => toast.loading(message), []);
  const dismiss = useCallback((id) => toast.dismiss(id), []);

  return (
    <ToastContext.Provider value={{ success, error, warning, info, loading, dismiss }}>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        hideProgressBar={true}
        transition={Slide}
        theme="light"
        toastStyle={{ 
          borderRadius: '10px',
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
          border: '1px solid #e5e7eb',
          fontFamily: 'inherit',
          fontSize: '14px',
          fontWeight: '500',
          padding: '12px 16px',
          color: '#1f2937'
        }}
      />
    </ToastContext.Provider>
  );
}
