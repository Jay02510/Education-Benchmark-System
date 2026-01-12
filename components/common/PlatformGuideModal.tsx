
import React from 'react';
import { Modal } from './Modal';
import { Icon } from './Icon';

interface PlatformGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const Term: React.FC<{ name: string; def: string; icon: string }> = ({ name, def, icon }) => (
    <div className="flex gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors group">
        <div className="w-10 h-10 shrink-0 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
            <Icon name={icon} className="w-5 h-5" />
        </div>
        <div>
            <h4 className="font-black text-slate-800 text-sm mb-0.5">{name}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{def}</p>
        </div>
    </div>
);

export const PlatformGuideModal: React.FC<PlatformGuideModalProps> = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Platform Guide & Terms" size="lg">
            <div className="space-y-8 p-1">
                <section>
                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4 border-b border-slate-50 pb-2">Data Intelligence</h3>
                    <div className="space-y-1">
                        <Term 
                            icon="trendUp" 
                            name="Growth Velocity" 
                            def="The speed of score improvement between cycles. A velocity of +5% means the student is gaining 5 points every testing period." 
                        />
                        <Term 
                            icon="alert" 
                            name="Intervention Tiers (RTI)" 
                            def="Tier 1: General support. Tier 2: Small group remedial. Tier 3: Critical 1-on-1 support needed. Flagged automatically when scores drop." 
                        />
                         <Term 
                            icon="benchmark" 
                            name="Anomaly Detection" 
                            def="Flagged when a student's domain scores significantly diverge (e.g., high Reading but critical Speaking)." 
                        />
                    </div>
                </section>

                <section>
                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4 border-b border-slate-50 pb-2">Academic Standards</h3>
                    <div className="space-y-1">
                        <Term 
                            icon="globe" 
                            name="CEFR Alignment" 
                            def="Common European Framework of Reference. Automatically maps levels to Pre-A1 through B2 standards." 
                        />
                         <Term 
                            icon="star" 
                            name="Cambridge/YLE" 
                            def="Young Learner English equivalents (Starters, Movers, Flyers) displayed for parent report clarity." 
                        />
                    </div>
                </section>

                <section>
                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4 border-b border-slate-50 pb-2">The AI Co-Pilot</h3>
                    <div className="space-y-1">
                        <Term 
                            icon="brain" 
                            name="Contextual Chat" 
                            def="Our AI Assistant knows your roster. You can ask 'Who is struggling in Phonics?' and it will query your actual database." 
                        />
                         <Term 
                            icon="library" 
                            name="Actionable Resources" 
                            def="AI doesn't just analyze; it generates worksheets, micro-lessons, and parent practice cards based on specific student needs." 
                        />
                    </div>
                </section>

                <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100 flex items-center gap-4">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                        <Icon name="chat" className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="text-sm font-bold text-indigo-900 mb-0.5">Need more help?</p>
                        <p className="text-xs text-indigo-700">Ask the AI Assistant in the bottom right corner of any screen!</p>
                     </div>
                </div>
            </div>
        </Modal>
    );
};
