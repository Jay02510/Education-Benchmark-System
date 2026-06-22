
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Icon } from '../components/common/Icon';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type }]);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
                {toasts.map(toast => (
                    <div 
                        key={toast.id}
                        className={`
                            flex items-center gap-3 px-4 py-3 rounded-[4px] shadow-md border animate-in slide-in-from-right duration-300
                            ${toast.type === 'success' ? 'bg-zinc-950 border-[oklch(0.72_0.18_145)]/20 text-[oklch(0.72_0.18_145)]' : ''}
                            ${toast.type === 'error' ? 'bg-zinc-950 border-[oklch(0.65_0.20_25)]/20 text-[oklch(0.65_0.20_25)]' : ''}
                            ${toast.type === 'info' ? 'bg-zinc-950 border-zinc-850 text-zinc-300' : ''}
                        `}
                    >
                        <div className={`p-1 rounded-[4px] ${
                            toast.type === 'success' ? 'bg-[oklch(0.72_0.18_145)]/10 text-[oklch(0.72_0.18_145)]' : 
                            toast.type === 'error' ? 'bg-[oklch(0.65_0.20_25)]/10 text-[oklch(0.65_0.20_25)]' : 
                            'bg-zinc-900 text-zinc-400'
                        }`}>
                            <Icon name={toast.type === 'success' ? 'check' : toast.type === 'error' ? 'alert' : 'brain'} className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-sm">{toast.message}</span>
                        <button onClick={() => removeToast(toast.id)} className="ml-2 opacity-50 hover:opacity-100">
                            <Icon name="close" className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
