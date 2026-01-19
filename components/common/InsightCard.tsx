import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { Icon } from './Icon';
import { GeminiService } from '../../services/geminiService';

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
    contextForAi, 
    actionLabel, 
    onAction,
    variant = 'default' 
}) => {
    const [narrative, setNarrative] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDataCollapsed, setIsDataCollapsed] = useState(true);

    useEffect(() => {
        if (contextForAi && !narrative) {
            setIsLoading(true);
            GeminiService.generateMicroNarrative(contextForAi)
                .then(setNarrative)
                .finally(() => setIsLoading(false));
        }
    }, [contextForAi, narrative]);

    return (
        <Card variant={variant} className="p-8 border-t-[8px] border-indigo-600 shadow-2xl bg-white group transition-all duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <Icon name="brain" className="w-5 h-5" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
                    </div>
                    {description && <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">{description}</p>}
                </div>
                
                {onAction && (
                    <button 
                        onClick={onAction}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95"
                    >
                        {actionLabel || 'Take Action'}
                    </button>
                )}
            </div>

            {/* Micro-Narrative Layer */}
            <div className="mb-8 p-6 bg-indigo-50/50 rounded-[2rem] border border-indigo-100/50 relative overflow-hidden">
                <div className="flex items-start gap-4 relative z-10">
                    <div className="text-indigo-400 mt-1"><Icon name="chat" className="w-5 h-5" /></div>
                    {isLoading ? (
                        <div className="space-y-2 flex-1">
                            <div className="h-2 w-full bg-indigo-100 rounded animate-pulse"></div>
                            <div className="h-2 w-3/4 bg-indigo-100 rounded animate-pulse delay-75"></div>
                        </div>
                    ) : (
                        <p className="text-lg font-bold text-indigo-900 leading-tight italic">
                            "{narrative || 'Evidence points to steady mastery of core standards.'}"
                        </p>
                    )}
                </div>
                <div className="absolute top-0 right-0 p-2 opacity-5"><Icon name="brain" className="w-20 h-20" /></div>
                <div className="mt-4 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-indigo-300 tracking-[0.2em] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> AI Insights Ready
                    </span>
                    <button 
                        onClick={() => setIsDataCollapsed(!isDataCollapsed)}
                        className="text-[10px] font-black uppercase text-indigo-600 hover:underline"
                    >
                        {isDataCollapsed ? 'Show Supporting Data' : 'Hide Data'}
                    </button>
                </div>
            </div>

            {/* Supporting Visualizations (Collapsible) */}
            {!isDataCollapsed && (
                <div className="animate-in slide-in-from-top-4 duration-500">
                    {children}
                </div>
            )}
        </Card>
    );
};