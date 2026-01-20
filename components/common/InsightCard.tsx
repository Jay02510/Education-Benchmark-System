
import React, { useState } from 'react';
import { Card } from './Card';
import { Icon } from './Icon';

interface InsightCardProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    contextForAi?: string;
    actionLabel?: string;
    onAction?: () => void;
    variant?: 'default' | 'glass' | 'intelligence';
}

export const InsightCard: React.FC<InsightCardProps> = ({ 
    title, 
    description, 
    children, 
    actionLabel, 
    onAction,
    variant = 'default' 
}) => {
    const [isDataCollapsed, setIsDataCollapsed] = useState(false);

    return (
        <Card variant={variant} className="p-8 border-t-[8px] border-indigo-600 shadow-2xl bg-white group">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <Icon name="analytics" className="w-5 h-5" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
                    </div>
                    {description && <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">{description}</p>}
                </div>
                
                {onAction && (
                    <button 
                        onClick={onAction}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition shadow-xl shadow-indigo-200"
                    >
                        {actionLabel || 'Take Action'}
                    </button>
                )}
            </div>

            <div className="mb-4 flex justify-end">
                <button 
                    onClick={() => setIsDataCollapsed(!isDataCollapsed)}
                    className="text-[10px] font-black uppercase text-indigo-600 hover:underline"
                >
                    {isDataCollapsed ? 'Show Data Visualization' : 'Hide Data Visualization'}
                </button>
            </div>

            {!isDataCollapsed && (
                <div className="animate-in slide-in-from-top-4 duration-500">
                    {children}
                </div>
            )}
        </Card>
    );
};
