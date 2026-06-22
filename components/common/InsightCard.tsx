import React, { useState } from 'react';
import { Card } from './Card';
import { Icon } from './Icon';

interface InsightCardProps {
    title: string;
    description?: string;
    children: React.ReactNode;
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
        <Card variant={variant} className="p-6 bg-zinc-950 border border-zinc-90 w-full rounded-[4px] relative group font-sans">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[oklch(0.72_0.18_145)]/20"></div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-1.5 bg-zinc-900 text-[oklch(0.72_0.18_145)] border border-zinc-850 rounded-[4px]">
                            <Icon name="analytics" className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-semibold uppercase tracking-tight text-zinc-150">{title}</h3>
                    </div>
                    {description && <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">{description}</p>}
                </div>
                
                {onAction && (
                    <button 
                        onClick={onAction}
                        className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 rounded-[4px] text-xs font-semibold cursor-pointer transition-colors"
                    >
                        {actionLabel || 'Take Action'}
                    </button>
                )}
            </div>

            <div className="mb-4 flex justify-end">
                <button 
                    onClick={() => setIsDataCollapsed(!isDataCollapsed)}
                    className="text-[9px] font-mono uppercase tracking-wider text-[oklch(0.72_0.18_145)] hover:underline cursor-pointer"
                >
                    {isDataCollapsed ? 'Show Data Visualization' : 'Hide Data Visualization'}
                </button>
            </div>

            {!isDataCollapsed && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                    {children}
                </div>
            )}
        </Card>
    );
};
