import React, { useState } from 'react';
import { Icon } from './Icon';
import { GeminiService } from '../../services/geminiService';
import { useNavigation } from '../../context/NavigationContext';

export const AICoach: React.FC = () => {
    const { activeTab, selectedStudentId } = useNavigation();
    const [isOpen, setIsOpen] = useState(false);
    const [insight, setInsight] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAskCoach = async () => {
        setIsOpen(true);
        setIsLoading(true);
        const context = `User is on the ${activeTab} tab. ${selectedStudentId ? `Focusing on student ID: ${selectedStudentId}` : 'Looking at class-wide data'}.`;
        try {
            const result = await GeminiService.generateMicroNarrative(context + " Explain what the current trends imply for next steps.");
            setInsight(result);
        } catch (e) {
            setInsight("Reviewing current metrics. Focus on students in the 'At Risk' velocity band.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-24 right-8 z-[1000] font-sans">
            {isOpen && (
                <div className="absolute bottom-14 right-0 w-72 bg-zinc-950 text-zinc-100 p-5 rounded-[4px] shadow-2xl border border-zinc-900 animate-in slide-in-from-bottom-2 duration-200">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-zinc-900">
                        <div className="flex items-center gap-2 select-none">
                            <Icon name="brain" className="w-3.5 h-3.5 text-[oklch(0.72_0.18_145)] animate-fade-in" />
                            <span className="text-[9px] font-mono uppercase tracking-wider text-[oklch(0.72_0.18_145)]">Academic Advisor</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-zinc-650 hover:text-zinc-400 cursor-pointer"><Icon name="close" className="w-3.5 h-3.5" /></button>
                    </div>
                    {isLoading ? (
                        <div className="space-y-2 py-3 select-none">
                            <div className="h-1.5 w-full bg-zinc-900 rounded-[1px] relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-800 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
                            </div>
                            <div className="h-1.5 w-3/4 bg-zinc-900 rounded-[1px] relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-800 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs font-normal leading-relaxed italic text-zinc-400">"{insight}"</p>
                    )}
                    <div className="mt-3 pt-3 border-t border-zinc-900 text-[9px] font-mono text-zinc-600 uppercase tracking-wider select-none">
                        Context: {activeTab}
                    </div>
                </div>
            )}
            <button 
                onClick={handleAskCoach}
                className="w-10 h-10 bg-zinc-950 border border-zinc-900 rounded-full shadow-2xl flex items-center justify-center text-[oklch(0.72_0.18_145)] hover:bg-zinc-900/60 transition-all cursor-pointer active:scale-95"
                title="What does this mean?"
            >
                <Icon name="info" className="w-4 h-4" />
            </button>
        </div>
    );
};
