import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Student, Domain } from '../../types';
import { useBenchmarks } from '../../context/BenchmarkContext';
import { useStudents } from '../../context/StudentContext';
import { GeminiService } from '../../services/geminiService';
import { Icon } from '../common/Icon';

interface StudentReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student;
    insight: string;
    initialTeacherComment: string;
    className?: string;
}

export const StudentReportModal: React.FC<StudentReportModalProps> = ({ isOpen, onClose, student, insight, initialTeacherComment, className }) => {
    const { domains } = useBenchmarks();
    const { saveAiAnalysis, aiInsights } = useStudents();
    const [isGenerating, setIsGenerating] = useState(false);
    const [isReviewed, setIsReviewed] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const latestAssessment = student.assessments.length > 0 
        ? [...student.assessments].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] 
        : null;
        
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const handleGenerateInsight = async () => {
        if (student.assessments.length === 0) {
            setError("Cannot run Guardian Audit without evidence points. Record an assessment first.");
            return;
        }
        
        setIsGenerating(true);
        setError(null);
        try {
            const result = await GeminiService.generateComprehensiveStudentAnalysis(student);
            saveAiAnalysis(student.id, result);
        } catch (e: any) {
            console.error("Audit error:", e);
            setError("Engine Connectivity Interrupted. Please check API settings.");
        } finally {
            setIsGenerating(false);
        }
    };

    const renderAuditText = (text: string) => {
        if (!text) return null;
        return text.split('\n').map((line, i) => (
            <p key={i} className="mb-2 last:mb-0">
                {line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.') || line.startsWith('4.') || line.startsWith('5.') 
                    ? <strong className="text-slate-900 block mt-4 mb-1">{line}</strong>
                    : line
                }
            </p>
        ));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Guardian Academic Audit" size="xl">
            <div className="bg-white p-8 border border-gray-200 shadow-sm mx-auto max-w-3xl print:border-0 print:shadow-none print:p-0 rounded-[2rem]">
                
                {/* Header */}
                <div className="flex justify-between items-end border-b-2 border-gray-800 pb-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Academic Health Audit</h1>
                        <p className="text-gray-600 mt-1 font-medium italic">Institutional Intelligence Report</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-black text-indigo-900 tracking-tighter italic">Guardian AI</div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{date}</p>
                    </div>
                </div>

                {/* Status */}
                <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Growth Velocity</span>
                        <p className={`text-2xl font-black ${student.growthVelocity >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{student.growthVelocity}%</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Protocol Tier</span>
                        <p className="text-2xl font-black text-indigo-600">Tier {student.interventionStatus?.tier || 1}</p>
                    </div>
                </div>

                {/* Audit Narrative */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                             <Icon name="shield" className="w-3 h-3 text-indigo-500" />
                             Guardian Analysis
                        </h3>
                    </div>
                    
                    <div className="p-8 bg-indigo-50/30 border border-indigo-100 rounded-[2.5rem] min-h-[200px]">
                        {isGenerating ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-4">
                                <Icon name="refresh" className="w-8 h-8 text-indigo-500 animate-spin" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guardian is analyzing institutional health...</p>
                            </div>
                        ) : aiInsights[student.id] ? (
                            <div className="text-slate-700 leading-relaxed text-sm">
                                <div className="mb-6 pb-6 border-b border-indigo-100/50">
                                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Report Card Narrative</h4>
                                    <p className="italic text-lg font-bold text-slate-800">"{aiInsights[student.id].report_card}"</p>
                                </div>
                                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Full Guardian Audit</h4>
                                <div className="font-medium text-slate-600">
                                    {renderAuditText(aiInsights[student.id].trend_insights)}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Icon name="brain" className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-bold mb-6">Pedagogical audit cycle pending.</p>
                                <button onClick={handleGenerateInsight} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition">Initialize Audit</button>
                            </div>
                        )}
                        {error && <p className="mt-4 text-xs font-bold text-rose-500 text-center">{error}</p>}
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                        <input type="checkbox" checked={isReviewed} onChange={e => setIsReviewed(e.target.checked)} className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600" />
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Audit Verified by Teacher</label>
                    </div>
                    <button onClick={() => window.print()} disabled={!isReviewed || !aiInsights[student.id]} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition disabled:opacity-50">Export Report</button>
                </div>
            </div>
        </Modal>
    );
};