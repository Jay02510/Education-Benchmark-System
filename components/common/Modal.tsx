
import React from 'react';
import { Icon } from './Icon';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;

    const sizeClasses: Record<string, string> = {
        sm: 'max-w-md',
        md: 'max-w-xl',
        lg: 'max-w-3xl',
        xl: 'max-w-5xl',
    };

    return (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[100] flex justify-center items-center p-4 overflow-y-auto animate-in fade-in duration-300">
            <div className={`bg-white/95 backdrop-blur-2xl border border-slate-200/60 rounded-[3rem] shadow-[0_45px_100px_rgba(15,23,42,0.18)] w-full mx-4 sm:mx-0 max-h-[88vh] flex flex-col ${sizeClasses[size]} transform transition-all duration-500 scale-100 animate-in zoom-in-95`}>
                <div className="flex justify-between items-center p-8 border-b border-slate-100 shrink-0">
                    <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">{title}</h3>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 transition-colors bg-slate-50 hover:bg-slate-100 rounded-xl" aria-label="Close modal">
                        <Icon name="close" className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-8 md:p-10 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                    {children}
                </div>
            </div>
        </div>
    );
};
