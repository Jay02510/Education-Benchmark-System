
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

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Student Performance Report" size="xl">
            <div className="bg-white p-6 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden relative">
                <div className="absolute top-10 right-10 opacity-5 pointer-events-none">
                    <Icon name="benchmark" className="w-64 h-64" />
                </div>

                <div className="relative z-10 space-y-12">
                    <header className="border-b-4 border-slate-900 pb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Performance Analysis</span>
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Growth Summary</span>
                        </div>
                        <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none italic">{data.title}</h2>
                    </header>

                    <section>
                        <h3 className="text-[10px] font-black uppercase text-indigo-600 tracking-[0.4em] mb-4 border-b border-indigo-50 pb-2">I. Summary</h3>
                        <p className="text-lg text-slate-700 leading-relaxed font-medium italic bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                            "{data.introduction}"
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-[10px] font-black uppercase text-indigo-600 tracking-[0.4em]">II. Student Details</h3>
                            <div className="px-4 py-2 bg-emerald-50 rounded-xl text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                                Growth Analysis Active
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {data.studentBreakdowns.map((s, i) => (
                                <div key={i} className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 group">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-indigo-400 font-black text-xl shadow-lg group-hover:scale-110 transition-transform">
                                            {s.name.charAt(0)}
                                        </div>
                                        <h4 className="text-2xl font-black text-slate-900 tracking-tight">{s.name}</h4>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <div className="flex gap-4">
                                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl h-fit shrink-0"><Icon name="check" className="w-4 h-4" /></div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Excellence Indicator</p>
                                                <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"{s.excelsIn}"</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl h-fit shrink-0"><Icon name="alert" className="w-4 h-4" /></div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Growth Opportunity</p>
                                                <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"{s.needsWork}"</p>
                                            </div>
                                        </div>

                                        <div className="mt-4 p-5 bg-indigo-50/50 rounded-[1.5rem] border border-indigo-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Icon name="brain" className="w-3 h-3 text-indigo-600" />
                                                <span className="text-[9px] font-black uppercase text-indigo-600 tracking-widest">AI Strategy Directive</span>
                                            </div>
                                            <p className="text-xs font-black text-slate-600 leading-relaxed">{s.strategy}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <footer className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="max-w-xl">
                            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] mb-2">III. Conclusion</h3>
                            <p className="text-xs text-slate-500 font-bold italic leading-relaxed">"{data.conclusion}"</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={onClose}
                                className="px-8 py-5 bg-white text-slate-400 border-2 border-slate-100 rounded-[1.8rem] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                            >
                                Close
                            </button>
                            <button 
                                onClick={() => window.print()}
                                className="px-12 py-5 bg-slate-900 text-white rounded-[1.8rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-indigo-600 transition-all border-b-8 border-slate-950 flex items-center gap-3"
                            >
                                <Icon name="library" className="w-5 h-5" />
                                Export Report PDF
                            </button>
                        </div>
                    </footer>
                </div>
            </div>
        </Modal>
    );
};
