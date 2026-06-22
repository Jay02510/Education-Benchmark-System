import React from 'react';
import { Modal } from './Modal';
import { Icon } from './Icon';

interface PlatformGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const Term: React.FC<{ name: string; subtitle: string; def: string; icon: string }> = ({ name, subtitle, def, icon }) => (
    <div className="flex gap-4 p-4 hover:bg-zinc-900/40 rounded-[4px] transition-colors group">
        <div className="w-10 h-10 shrink-0 bg-zinc-900 border border-zinc-850 rounded-[4px] flex items-center justify-center text-[oklch(0.72_0.18_145)] group-hover:bg-[oklch(0.72_0.18_145)]/10 group-hover:text-[oklch(0.72_0.18_145)] transition-all">
            <Icon name={icon} className="w-5 h-5" />
        </div>
        <div>
            <h4 className="font-medium text-zinc-200 text-xs mb-1 select-none">{name} <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider ml-1">({subtitle})</span></h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{def}</p>
        </div>
    </div>
);

export const PlatformGuideModal: React.FC<PlatformGuideModalProps> = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Benchmark: Academic Reference Guide" size="lg">
            <div className="space-y-6 p-1 font-sans">
                <section>
                    <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2 border-b border-zinc-90 pb-1.5 select-none">Academic Success</h3>
                    <div className="space-y-1">
                        <Term 
                            icon="trendUp" 
                            name="Growth Rate" 
                            subtitle="Learning Speed"
                            def="This tracks how fast a student is improving. A higher percentage means they are catching up or excelling quickly." 
                        />
                        <Term 
                            icon="alert" 
                            name="Support Levels" 
                            subtitle="Intervention Steps"
                            def="Level 1 is the whole class. Level 2 is a small group. Level 3 is 1-on-1 intensive care. We flag students automatically if they need more help." 
                        />
                         <Term 
                            icon="benchmark" 
                            name="Anomaly" 
                            subtitle="Hidden Gaps"
                            def="Flagged when a student is great at one thing (like reading) but struggling significantly at another (like speaking)." 
                        />
                    </div>
                </section>

                <section>
                    <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2 border-b border-zinc-90 pb-1.5 select-none">Global Standards</h3>
                    <div className="space-y-1">
                        <Term 
                            icon="globe" 
                            name="CEFR Alignment" 
                            subtitle="World Ranking"
                            def="The international standard for language ability. It ensures your school's scores are valid anywhere in the world." 
                        />
                         <Term 
                            icon="star" 
                            name="YLE Equivalents" 
                            subtitle="Cambridge Levels"
                            def="Standard levels used by Cambridge English (Starters, Movers, Flyers) to make reports easy for parents to understand." 
                        />
                    </div>
                </section>

                <section>
                    <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2 border-b border-zinc-90 pb-1.5 select-none">AI Intelligence</h3>
                    <div className="space-y-1">
                        <Term 
                            icon="brain" 
                            name="Principal Briefing" 
                            subtitle="Owner Summary"
                            def="A strategic overview designed for school leadership to see overall school health without getting bogged down in tiny details." 
                        />
                         <Term 
                            icon="library" 
                            name="Resource Efficacy" 
                            subtitle="Material Success"
                            def="A measure of how well the AI-generated workloads and lessons are actually helping student scores go up." 
                        />
                    </div>
                </section>

                <div className="bg-[oklch(0.72_0.18_145)]/5 p-4 rounded-[4px] border border-[oklch(0.72_0.18_145)]/10 flex items-center gap-4">
                     <div className="w-10 h-10 bg-zinc-900 rounded-[4px] flex items-center justify-center text-[oklch(0.72_0.18_145)] shrink-0 border border-zinc-850">
                        <Icon name="check" className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="text-xs font-semibold text-zinc-200 mb-0.5">Presentation Tip</p>
                        <p className="text-[11px] text-zinc-450 leading-normal">Focus on 'Learning Speed' and 'School Health' when presenting diagnostics reports to curriculum administrators.</p>
                     </div>
                </div>
            </div>
        </Modal>
    );
};
