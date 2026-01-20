
import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Student } from '../../types';

interface StudentReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student;
    insight: string;
    initialTeacherComment: string;
    className?: string;
}

export const StudentReportModal: React.FC<StudentReportModalProps> = ({ isOpen, onClose, student }) => {
    const [isReviewed, setIsReviewed] = useState(false);
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Academic Performance Report" size="xl">
            <div className="bg-white p-8 border border-gray-200 shadow-sm mx-auto max-w-3xl rounded-[2rem]">
                <div className="flex justify-between items-end border-b-2 border-gray-800 pb-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Performance Report</h1>
                        <p className="text-gray-600 mt-1 font-medium italic">{student.name}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{date}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Growth Velocity</span>
                        <p className={`text-2xl font-black ${student.growthVelocity >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{student.growthVelocity}%</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Support Protocol</span>
                        <p className="text-2xl font-black text-indigo-600">Tier {student.interventionStatus?.tier || 1}</p>
                    </div>
                </div>

                <div className="mb-10">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Academic Narrative</h3>
                    <div className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] min-h-[150px]">
                        <p className="text-slate-400 italic font-bold">No narrative generated. Use the teacher log to add manual observations.</p>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                        <input type="checkbox" checked={isReviewed} onChange={e => setIsReviewed(e.target.checked)} className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600" />
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Verified by Teacher</label>
                    </div>
                    <button onClick={() => window.print()} disabled={!isReviewed} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl disabled:opacity-50">Export Report</button>
                </div>
            </div>
        </Modal>
    );
};
