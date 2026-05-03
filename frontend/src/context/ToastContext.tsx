import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextData {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-eliminar después de 4 segundos
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return <CheckCircle size={18} />;
      case 'error': return <AlertCircle size={18} />;
      case 'warning': return <AlertCircle size={18} />;
      default: return <Info size={18} />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Contenedor de Toasts */}
      <div className="toast-container" style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none'
      }}>
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className={`alert-toast alert-toast--${toast.type}`}
            style={{ pointerEvents: 'auto', position: 'relative', top: 0, right: 0 }}
          >
            <div className="alert-toast__icon">
                {getIcon(toast.type)}
            </div>
            <span className="alert-toast__message">{toast.message}</span>
            <button 
                onClick={() => removeToast(toast.id)}
                style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'inherit', 
                    cursor: 'pointer', 
                    opacity: 0.5,
                    padding: '0 0 0 10px',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
