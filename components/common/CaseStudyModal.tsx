
import React from 'react';
import { Modal } from './Modal';
import { Icon } from './Icon';

interface CaseStudyModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: {
        title: string;
        introduction: string;
        keyFindings: string[];
        longitudinalAnalysis: string;
        riskMitigation: string;
        conclusion: string;
    } | null;
}

export const CaseStudyModal: React.FC<CaseStudyModalProps> = ({ isOpen, onClose, data }) => {
    if (!data) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Pedagogical Research Study" size="xl">
            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden relative">
                <div className="absolute top-10 right-10 opacity-5 pointer-events-none">
                    <Icon name="benchmark" className="w-64 h-64" />
                </div>

                <div className="relative z-10 space-y-12">
                    <header className="border-b-4 border-slate-900 pb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Case Study Analysis</span>
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Anonymized Cohort Data</span>
                        </div>
                        <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none italic">{data.title}</h2>
                    </header>

                    <section>
                        <h3 className="text-[10px] font-black uppercase text-indigo-600 tracking-[0.4em] mb-4">I. Abstract</h3>
                        <p className="text-lg text-slate-700 leading-relaxed font-medium italic bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                            "{data.introduction}"
                        </p>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <section>
                            <h3 className="text-[10px] font-black uppercase text-indigo-600 tracking-[0.4em] mb-6">II. Growth Findings</h3>
                            <div className="space-y-4">
                                {data.keyFindings.map((finding, i) => (
                                    <div key={i} className="flex gap-4 p-5 bg-white border border-slate-100 rounded-3xl shadow-sm">
                                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                            <Icon name="trendUp" className="w-5 h-5" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-700">{finding}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                            <h3 className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.4em] mb-6 relative z-10">III. Analysis</h3>
                            <p className="text-sm leading-relaxed text-slate-300 font-medium relative z-10 italic">
                                "{data.longitudinalAnalysis}"
                            </p>
                        </section>
                    </div>

                    <section className="bg-rose-50 p-10 rounded-[3rem] border border-rose-100">
                         <div className="flex items-center gap-4 mb-6">
                             <div className="p-3 bg-white rounded-2xl text-rose-600 shadow-sm"><Icon name="alert" className="w-6 h-6" /></div>
                             <h3 className="text-[10px] font-black uppercase text-rose-800 tracking-[0.4em]">IV. Risk Mitigation</h3>
                         </div>
                         <p className="text-sm text-rose-900 leading-relaxed font-bold">{data.riskMitigation}</p>
                    </section>

                    <footer className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-xs text-slate-400 font-medium max-w-xl">{data.conclusion}</p>
                        <button 
                            onClick={() => window.print()}
                            className="px-12 py-5 bg-slate-900 text-white rounded-[1.8rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-indigo-600 transition-all border-b-8 border-slate-950"
                        >
                            Export Study PDF
                        </button>
                    </footer>
                </div>
            </div>
        </Modal>
    );
};
