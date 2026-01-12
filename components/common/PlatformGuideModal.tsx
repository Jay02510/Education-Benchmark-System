
import React from 'react';
import { Modal } from './Modal';
import { Icon } from './Icon';

interface PlatformGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const Term: React.FC<{ name: string; subtitle: string; def: string; icon: string }> = ({ name, subtitle, def, icon }) => (
    <div className="flex gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors group">
        <div className="w-12 h-12 shrink-0 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
            <Icon name={icon} className="w-6 h-6" />
        </div>
        <div>
            <h4 className="font-black text-slate-800 text-sm mb-0.5">{name} <span className="text-slate-400 font-medium ml-1">({subtitle})</span></h4>
            <p className="text-xs text-slate-500 leading-relaxed">{def}</p>
        </div>
    </div>
);

export const PlatformGuideModal: React.FC<PlatformGuideModalProps> = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Benchmark: Plain English Guide" size="lg">
            <div className="space-y-8 p-1">
                <section>
                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4 border-b border-slate-50 pb-2">Academic Success</h3>
                    <div className="space-y-1">
                        <Term 
                            icon="trendUp" 
                            name="Growth Velocity" 
                            subtitle="Learning Speed"
                            def="This tracks how fast a student is improving. A higher percentage means they are catching up or excelling quickly." 
                        />
                        <Term 
                            icon="alert" 
                            name="Intervention Tiers" 
                            subtitle="Support Levels"
                            def="Tier 1 is the whole class. Tier 2 is a small group. Tier 3 is 1-on-1 intensive care. We flag students automatically if they need more help." 
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
                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4 border-b border-slate-50 pb-2">Global Standards</h3>
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
                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4 border-b border-slate-50 pb-2">AI Intelligence</h3>
                    <div className="space-y-1">
                        <Term 
                            icon="brain" 
                            name="Executive Briefing" 
                            subtitle="Owner Summary"
                            def="A strategic overview designed for school leadership to see overall school health without getting bogged down in tiny details." 
                        />
                         <Term 
                            icon="library" 
                            name="Resource Efficacy" 
                            subtitle="Material Success"
                            def="A measure of how well the AI-generated worksheets and lessons are actually helping student scores go up." 
                        />
                    </div>
                </section>

                <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 flex items-center gap-4">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                        <Icon name="check" className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="text-sm font-bold text-emerald-900 mb-0.5">Presentation Tip</p>
                        <p className="text-xs text-emerald-700">Focus on 'Learning Speed' and 'Institutional Health' when talking to the school owner.</p>
                     </div>
                </div>
            </div>
        </Modal>
    );
};
