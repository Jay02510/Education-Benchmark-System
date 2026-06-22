import React from 'react';
import { Modal } from './Modal';
import { Icon } from './Icon';

interface CaseStudyModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: {
        title: string;
        introduction: string;
        studentBreakdowns: Array<{
            name: string;
            excelsIn: string;
            needsWork: string;
            strategy: string;
        }>;
        conclusion: string;
    } | null;
}

export const CaseStudyModal: React.FC<CaseStudyModalProps> = ({ isOpen, onClose, data }) => {
    if (!data) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Performance Report Analysis" size="xl">
            <div className="space-y-8 font-sans p-2">
                <header className="border-b border-zinc-90 pb-6 w-full bg-zinc-950">
                    <div className="flex items-center gap-2 mb-3 select-none">
                        <span className="bg-[oklch(0.72_0.18_145)]/10 text-[oklch(0.72_0.18_145)] px-2.5 py-1 rounded-[4px] text-[9px] font-mono uppercase tracking-wider border border-[oklch(0.72_0.18_145)]/20">Analytical segment</span>
                        <span className="text-zinc-500 text-[9px] font-mono uppercase tracking-wider">Growth Diagnostics</span>
                    </div>
                    <h2 className="text-lg font-medium text-zinc-150 tracking-tight leading-snug uppercase">{data.title}</h2>
                </header>

                <section className="p-5 bg-zinc-90 border border-zinc-900 rounded-[4px]">
                    <h3 className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-2 select-none">Summary Context</h3>
                    <p className="text-xs text-zinc-405 leading-relaxed font-sans italic">
                        "{data.introduction}"
                    </p>
                </section>

                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider select-none">Cohort breakdown</h3>
                        <div className="px-2.5 py-1 bg-zinc-900 rounded-[4px] text-[oklch(0.72_0.18_145)] text-[9px] font-mono uppercase tracking-wider border border-zinc-850">
                            Active Sync
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.studentBreakdowns.map((s, i) => (
                            <div key={i} className="p-5 bg-zinc-90 border border-zinc-900 rounded-[4px] transition-colors group">
                                <div className="flex items-center gap-3 mb-4 select-none">
                                    <div className="w-8 h-8 rounded-[4px] bg-zinc-950 border border-zinc-850 flex items-center justify-center text-[oklch(0.72_0.18_145)] font-mono text-sm leading-none">
                                        {s.name.charAt(0)}
                                    </div>
                                    <h4 className="text-sm font-semibold text-zinc-200 tracking-tight uppercase">{s.name}</h4>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <div className="p-1 bg-zinc-950 border border-zinc-900 text-[oklch(0.72_0.18_145)] rounded-[4px] h-fit shrink-0"><Icon name="check" className="w-3.5 h-3.5" /></div>
                                        <div>
                                            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-0.5 select-none">Excellence Indicator</p>
                                            <p className="text-xs text-zinc-350 leading-relaxed font-sans italic">"{s.excelsIn}"</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="p-1 bg-zinc-950 border border-zinc-900 text-rose-455 rounded-[4px] h-fit shrink-0"><Icon name="alert" className="w-3.5 h-3.5" /></div>
                                        <div>
                                            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-0.5 select-none">Growth Opportunity</p>
                                            <p className="text-xs text-zinc-350 leading-relaxed font-sans italic">"{s.needsWork}"</p>
                                        </div>
                                    </div>

                                    <div className="mt-2 p-4 bg-zinc-950 border border-zinc-900 rounded-[4px]">
                                        <div className="flex items-center gap-1.5 mb-1.5 select-none animate-fade-in">
                                            <Icon name="brain" className="w-3 h-3 text-[oklch(0.72_0.18_145)]" />
                                            <span className="text-[9px] font-mono text-[oklch(0.72_0.18_145)] uppercase tracking-wider">Strategy Directive</span>
                                        </div>
                                        <p className="text-[11px] text-zinc-450 leading-relaxed font-sans">{s.strategy}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <footer className="pt-6 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="max-w-xl">
                        <h3 className="text-[9px] font-mono text-zinc-505 uppercase tracking-wider mb-1 select-none">Assessment conclusion</h3>
                        <p className="text-[11px] text-zinc-450 leading-relaxed italic">"{data.conclusion}"</p>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
                        <button 
                            onClick={onClose}
                            className="px-4 py-2 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-[4px] text-xs transition-colors cursor-pointer"
                        >
                            Close
                        </button>
                        <button 
                            onClick={handlePrint}
                            className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 rounded-[4px] text-xs font-semibold cursor-pointer transition-colors flex items-center gap-2"
                        >
                            <Icon name="library" className="w-3.5 h-3.5" />
                            <span>Export PDF</span>
                        </button>
                    </div>
                </footer>
            </div>
        </Modal>
    );
};
