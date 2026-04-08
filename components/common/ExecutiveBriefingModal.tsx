
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

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Principal Briefing" size="lg">
            <div className="space-y-8">
                <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">School Context</p>
                        <h3 className="text-xl font-black text-slate-900">{className}</h3>
                    </div>
                    <div className="px-4 py-2 bg-indigo-50 rounded-xl text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                        Confidential Brief
                    </div>
                </div>

                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <Icon name="analytics" className="w-5 h-5 text-indigo-600" />
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Summary</h4>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                        <p className="text-sm text-slate-600 leading-relaxed font-bold italic">"{data.executiveSummary}"</p>
                    </div>
                </section>

                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <Icon name="alert" className="w-5 h-5 text-rose-500" />
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Risk Assessment</h4>
                    </div>
                    <div className="p-6 bg-rose-50/50 rounded-[2rem] border border-rose-100">
                        <p className="text-sm text-rose-800 leading-relaxed font-bold italic">"{data.riskAssessment}"</p>
                    </div>
                </section>

                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <Icon name="check" className="w-5 h-5 text-emerald-500" />
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Recommended Actions</h4>
                    </div>
                    <div className="space-y-3">
                        {data.leadershipActions.map((action, i) => (
                            <div key={i} className="flex gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px] font-black shrink-0 border border-emerald-100">{i + 1}</div>
                                <p className="text-xs font-bold text-slate-700">{action}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-8 py-3 bg-white text-slate-400 border-2 border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                    >
                        Close
                    </button>
                    <button 
                        onClick={() => window.print()}
                        className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all border-b-4 border-black"
                    >
                        Export as PDF
                    </button>
                </div>
            </div>
        </Modal>
    );
};
