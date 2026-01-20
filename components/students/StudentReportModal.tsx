
import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Student } from '../../types';
import { Icon } from '../common/Icon';
import { GeminiService } from '../../services/geminiService';
import { useToast } from '../../context/ToastContext';

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
    const [aiNarrative, setAiNarrative] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const { showToast } = useToast();
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const handleGenerateAudit = async () => {
        if (student.assessments.length === 0) {
            showToast("No assessment data available for analysis.", "error");
            return;
        }

        setIsGenerating(true);
        try {
            const result = await GeminiService.generateComprehensiveStudentAnalysis(student);
            setAiNarrative(result.report_card);
            showToast("Pedagogical audit complete.");
        } catch (e: any) {
            showToast("Audit failed: " + (e.message || "Connection issue"), "error");
            setAiNarrative("Unable to generate narrative. Please verify system connectivity and assessment logs.");
        } finally {
            setIsGenerating(false);
        }
    };

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
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Academic Narrative</h3>
                        <button 
                            onClick={handleGenerateAudit}
                            disabled={isGenerating}
                            className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all ${isGenerating ? 'text-slate-400' : 'text-indigo-600 hover:text-indigo-800'}`}
                        >
                            <Icon name="robot" className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
                            {isGenerating ? 'Calibrating...' : 'Generate AI Audit'}
                        </button>
                    </div>
                    <div className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] min-h-[180px] relative overflow-hidden flex flex-col justify-center">
                        {isGenerating ? (
                            <div className="space-y-4">
                                <div className="h-3 bg-indigo-100 rounded-full w-full animate-pulse"></div>
                                <div className="h-3 bg-indigo-100 rounded-full w-[90%] animate-pulse delay-75"></div>
                                <div className="h-3 bg-indigo-100 rounded-full w-[95%] animate-pulse delay-150"></div>
                            </div>
                        ) : (
                            <p className={`text-slate-700 leading-relaxed font-bold ${!aiNarrative ? 'italic text-slate-400 text-center' : 'text-left'}`}>
                                {aiNarrative || "Performance metrics awaiting narrative generation. Click 'Generate AI Audit' to synthesize data."}
                            </p>
                        )}
                        {aiNarrative && !isGenerating && (
                            <div className="mt-6 pt-6 border-t border-slate-200/60 flex items-center justify-between">
                                <div className="text-[8px] font-black uppercase text-indigo-300">Analysis Engine: gemini-3-pro</div>
                                <div className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Subject to Teacher Verification</div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                        <input type="checkbox" checked={isReviewed} onChange={e => setIsReviewed(e.target.checked)} className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest cursor-pointer">Identity & Content Verified</label>
                    </div>
                    <button 
                        onClick={() => window.print()} 
                        disabled={!isReviewed} 
                        className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-600 transition-colors"
                    >
                        Export PDF Report
                    </button>
                </div>
            </div>
        </Modal>
    );
};
