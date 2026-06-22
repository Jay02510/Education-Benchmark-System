import React from 'react';
import { Modal } from './Modal';
import { Icon } from './Icon';

interface ExecutiveBriefingModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: {
        executiveSummary: string;
        riskAssessment: string;
        leadershipActions: string[];
    } | null;
    className: string;
}

export const ExecutiveBriefingModal: React.FC<ExecutiveBriefingModalProps> = ({ isOpen, onClose, data, className }) => {
    if (!data) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Principal Briefing" size="lg">
            <div className="space-y-6 font-sans">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-90 w-full bg-zinc-950">
                    <div>
                        <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-wider mb-1 block">Context Segment</span>
                        <h3 className="text-sm font-medium text-zinc-200 uppercase tracking-tight">{className}</h3>
                    </div>
                    <div className="px-3 py-1 bg-zinc-900 text-[oklch(0.72_0.18_145)] text-[9px] font-mono uppercase tracking-wider rounded-[4px] border border-zinc-850">
                        Classified
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <section className="p-5 bg-zinc-90 border border-zinc-900 rounded-[4px]">
                        <div className="flex items-center gap-2 mb-3 select-none">
                            <Icon name="analytics" className="w-4 h-4 text-[oklch(0.72_0.18_145)]" />
                            <h4 className="text-[10px] font-mono text-zinc-300 uppercase tracking-wider">Executive Summary</h4>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed font-sans italic">"{data.executiveSummary}"</p>
                    </section>

                    <section className="p-5 bg-zinc-90 border border-zinc-900 rounded-[4px]">
                        <div className="flex items-center gap-2 mb-3 select-none">
                            <Icon name="alert" className="w-4 h-4 text-rose-455" />
                            <h4 className="text-[10px] font-mono text-zinc-350 uppercase tracking-wider">Risk Evaluation</h4>
                        </div>
                        <p className="text-xs text-rose-300/80 leading-relaxed font-sans italic">"{data.riskAssessment}"</p>
                    </section>
                </div>

                <section className="p-5 bg-zinc-90 border border-zinc-900 rounded-[4px]">
                    <div className="flex items-center gap-2 mb-4 select-none">
                        <Icon name="check" className="w-4 h-4 text-[oklch(0.72_0.18_145)]" />
                        <h4 className="text-[10px] font-mono text-zinc-300 uppercase tracking-wider font-semibold">Leadership Milestones</h4>
                    </div>
                    <div className="space-y-2.5">
                        {data.leadershipActions.map((action, i) => (
                            <div key={i} className="flex gap-3 p-3 bg-zinc-950 border border-zinc-900 rounded-[2px]">
                                <div className="w-5 h-5 rounded-full bg-[oklch(0.72_0.18_145)]/10 text-[oklch(0.72_0.18_145)] flex items-center justify-center text-[10px] font-mono shrink-0 border border-[oklch(0.72_0.18_145)]/20">{i + 1}</div>
                                <p className="text-xs text-zinc-350 font-sans leading-relaxed">{action}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="pt-4 border-t border-zinc-900 flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-[4px] text-xs transition-colors cursor-pointer"
                    >
                        Close Briefing
                    </button>
                    <button 
                        onClick={handlePrint}
                        className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 rounded-[4px] text-xs font-semibold cursor-pointer transition-colors"
                    >
                        Print PDF
                    </button>
                </div>
            </div>
        </Modal>
    );
};
