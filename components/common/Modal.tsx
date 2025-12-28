
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
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className={`bg-white rounded-xl shadow-2xl w-full mx-4 sm:mx-0 max-h-[90vh] flex flex-col ${sizeClasses[size]}`}>
                <div className="flex justify-between items-center p-4 border-b shrink-0">
                    <h3 className="text-lg md:text-xl font-semibold text-slate-800">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition" aria-label="Close modal">
                        <Icon name="close" className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-4 md:p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};
