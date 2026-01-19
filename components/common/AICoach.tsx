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
        <div className="fixed bottom-24 right-8 z-[1000]">
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-72 bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <Icon name="brain" className="w-4 h-4 text-indigo-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Context Coach</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white"><Icon name="close" className="w-4 h-4" /></button>
                    </div>
                    {isLoading ? (
                        <div className="space-y-2">
                            <div className="h-2 bg-slate-800 rounded animate-pulse"></div>
                            <div className="h-2 bg-slate-800 rounded animate-pulse delay-75"></div>
                        </div>
                    ) : (
                        <p className="text-xs font-medium leading-relaxed italic text-slate-300">"{insight}"</p>
                    )}
                    <div className="mt-4 pt-4 border-t border-slate-800 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        Context: {activeTab}
                    </div>
                </div>
            )}
            <button 
                onClick={handleAskCoach}
                className="w-12 h-12 bg-white border border-slate-100 rounded-full shadow-xl flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all group active:scale-90"
                title="What does this mean?"
            >
                <Icon name="info" className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </button>
        </div>
    );
};