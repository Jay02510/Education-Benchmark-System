
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
        <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-md z-[100] flex justify-center items-center p-4 overflow-y-auto animate-in fade-in duration-300">
            <div 
                id="modal-window"
                className={`bg-zinc-950 border border-zinc-850 rounded-[8px] shadow-md w-full mx-4 sm:mx-0 max-h-[88vh] flex flex-col relative ${sizeClasses[size]} transform transition-all duration-300 scale-100 animate-in zoom-in-95`}
            >
                {/* Header Container with Title & minimal Icon closure */}
                <div className="flex justify-between items-center px-6 py-5 border-b border-zinc-900 shrink-0">
                    <h3 className="text-lg font-medium text-zinc-100 tracking-tight">{title}</h3>
                    <button 
                        onClick={onClose} 
                        className="bg-transparent text-zinc-500 hover:text-zinc-300 p-1.5 transition-colors cursor-pointer" 
                        aria-label="Close modal"
                    >
                        <Icon name="close" className="w-4 h-4 text-zinc-500" />
                    </button>
                </div>
                {/* Scrollable primary text segment */}
                <div className="p-6 md:p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
                    {children}
                </div>
            </div>
        </div>
    );
};
