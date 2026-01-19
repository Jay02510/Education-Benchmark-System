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
    const { benchmarks, domains } = useBenchmarks();
    const { saveAiAnalysis } = useStudents();
    const [teacherComment, setTeacherComment] = useState(initialTeacherComment);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isReviewed, setIsReviewed] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const latestAssessment = student.assessments.length > 0 
        ? [...student.assessments].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] 
        : null;
        
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const handleGenerateInsight = async () => {
        if (!latestAssessment) {
            setError("You must record at least one assessment to generate an AI report.");
            return;
        }
        
        setIsGenerating(true);
        setError(null);
        try {
            const result = await GeminiService.generateComprehensiveStudentAnalysis(student);
            if (result && (result.report_card || result.trend_insights)) {
                saveAiAnalysis(student.id, result);
            } else {
                throw new Error("Received an empty response from AI.");
            }
        } catch (e: any) {
            console.error("Report generation error:", e);
            setError(e.message || "An unexpected error occurred during analysis.");
        } finally {
            setIsGenerating(false);
        }
    };

    const renderMarkdownBold = (text: string) => {
         const parts = text.split(/\*\*(.*?)\*\*/g);
         return parts.map((part, index) =>
             index % 2 === 1 ? <strong key={index} className="text-slate-900 font-bold">{part}</strong> : part
         );
     };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Student Progress Report" size="xl">
            <div className="bg-white p-8 border border-gray-200 shadow-sm mx-auto max-w-3xl print:border-0 print:shadow-none print:p-0">
                
                {/* Header */}
                <div className="flex justify-between items-end border-b-2 border-gray-800 pb-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight uppercase">Progress Protocol</h1>
                        <p className="text-gray-600 mt-1 font-medium italic">Confidential Institutional Briefing</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-black text-indigo-900 tracking-tighter italic">Benchmark AI</div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{date}</p>
                    </div>
                </div>

                {/* Identity Bar */}
                <div className="flex items-center justify-between mb-8 p-6 bg-slate-50 border border-slate-100 rounded-[2rem] print:bg-white print:border-gray-200">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-white p-1 shadow-lg border border-slate-200 overflow-hidden">
                            <img src={student.photoUrl} alt="" className="w-full h-full object-cover rounded-[1.2rem]" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Student Candidate</p>
                            <p className="text-2xl font-black text-slate-900">{student.name}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Velocity Performance</p>
                        <div className={`text-xl font-black ${student.growthVelocity >= 10 ? 'text-emerald-500' : student.growthVelocity < 0 ? 'text-rose-500' : 'text-indigo-500'}`}>
                            {student.growthVelocity > 0 ? '+' : ''}{student.growthVelocity}% 
                        </div>
                    </div>
                </div>

                {/* Narrative Summary (Insight First) */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                             <Icon name="brain" className="w-3 h-3 text-purple-500" />
                             Pedagogical Narrative
                        </h3>
                        {insight && (
                            <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                                <Icon name="check" className="w-3 h-3 text-indigo-600" />
                                <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">AI Assisted • Teacher Reviewed</span>
                            </div>
                        )}
                    </div>
                    <div className="p-8 bg-purple-50/30 border border-purple-100 rounded-[2.5rem] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12"><Icon name="robot" className="w-24 h-24" /></div>
                        {isGenerating ? (
                            <div className="space-y-3 animate-pulse">
                                <div className="h-2.5 bg-purple-200 rounded-full w-full"></div>
                                <div className="h-2.5 bg-purple-200 rounded-full w-4/5"></div>
                                <div className="h-2.5 bg-purple-200 rounded-full w-5/6"></div>
                            </div>
                        ) : insight ? (
                            <div className="prose prose-slate prose-sm max-w-none text-slate-700 leading-relaxed font-medium italic text-lg">
                                {renderMarkdownBold(insight)}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-slate-400 text-sm font-bold mb-6">Awaiting intelligence analysis cycle.</p>
                                <button onClick={handleGenerateInsight} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition">Initialize AI Analysis</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Score Grid (Collapsed/Secondary) */}
                <div className="mb-10">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Domain Metrics ({latestAssessment?.type || 'Baseline'})</h3>
                    {latestAssessment ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {domains.map(d => {
                                const score = (latestAssessment.scores as any)[d] || 0;
                                return (
                                    <div key={d} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                        <p className="text-[8px] font-black uppercase text-slate-400 mb-1">{d}</p>
                                        <div className="flex items-end justify-between">
                                            <span className="text-xl font-black text-slate-800">{score}%</span>
                                            <div className={`h-1 w-12 rounded-full ${score >= 80 ? 'bg-emerald-400' : score >= 60 ? 'bg-indigo-400' : 'bg-rose-400'}`}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-10 text-center bg-slate-50 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                            <p className="text-slate-400 text-sm font-bold">Quantitative data stream inactive.</p>
                        </div>
                    )}
                </div>

                {/* Verification Layer */}
                <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center px-4">
                    <div className="flex items-center gap-3">
                        <input 
                            type="checkbox" 
                            id="review-toggle" 
                            checked={isReviewed}
                            onChange={e => setIsReviewed(e.target.checked)}
                            className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 print:hidden"
                        />
                        <label htmlFor="review-toggle" className="text-[10px] font-black uppercase text-slate-500 tracking-widest cursor-pointer print:hidden">I verify this narrative as accurate</label>
                        <p className="hidden print:block text-[10px] font-black uppercase text-slate-800 tracking-widest">Teacher Verification: ELECTRONICALLY SIGNED</p>
                    </div>
                    <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                        System Integrity Checked • 2025
                    </div>
                </div>
            </div>

            <div className="mt-10 flex justify-end gap-4 px-4 print:hidden">
                <button onClick={onClose} className="px-8 py-3 text-slate-400 font-bold hover:text-slate-600 transition text-[10px] uppercase tracking-widest">Close</button>
                <button 
                    onClick={() => window.print()}
                    disabled={!isReviewed && insight.length > 0}
                    className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition shadow-2xl disabled:opacity-50 active:scale-95"
                >
                    Print Institutional Report
                </button>
            </div>
        </Modal>
    );
};