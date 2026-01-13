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
            console.error("Report generation error details:", e);
            const msg = e.message?.toLowerCase().includes("api_key") 
                ? "API Configuration Error: Please ensure your environment credentials are valid."
                : "The analysis engine is currently busy. Please try again in a few seconds.";
            setError(msg);
        } finally {
            setIsGenerating(false);
        }
    };

    const renderMarkdownBold = (text: string) => {
         const parts = text.split(/\*\*(.*?)\*\*/g);
         return parts.map((part, index) =>
             index % 2 === 1 ? <strong key={index} className="text-slate-900">{part}</strong> : part
         );
     };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Student Progress Report" size="xl">
            <div className="bg-white p-8 border border-gray-200 shadow-sm mx-auto max-w-3xl print:border-0 print:shadow-none print:p-0">
                
                {/* Header */}
                <div className="flex justify-between items-end border-b-2 border-gray-800 pb-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Student Progress Report</h1>
                        <p className="text-gray-600 mt-1 font-medium">Academic Performance Summary</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-black text-indigo-900 tracking-tighter italic">Benchmark AI</div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{date}</p>
                    </div>
                </div>

                {/* Student Info Grid */}
                <div className="grid grid-cols-2 gap-8 mb-8 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 print:bg-white print:border-gray-300">
                    <div className="flex items-center space-x-5">
                        <div className="w-16 h-16 rounded-3xl overflow-hidden shadow-lg border-2 border-white">
                            <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black mb-0.5">Student Identity</p>
                            <p className="text-xl font-black text-slate-900 leading-none">{student.name}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black mb-0.5">Target Level</p>
                            <p className="text-lg font-bold text-slate-800">Lvl {student.level}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black mb-0.5">Velocity</p>
                            <p className={`text-lg font-bold ${student.growthVelocity >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {student.growthVelocity > 0 ? '+' : ''}{student.growthVelocity}%
                            </p>
                        </div>
                    </div>
                </div>

                {/* Scores Section */}
                <div className="mb-8">
                    <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center">
                        <div className="w-1.5 h-6 bg-indigo-600 mr-3 rounded-full"></div>
                        Latest Quantitative Data ({latestAssessment?.type || 'Baseline'})
                    </h3>
                    {latestAssessment ? (
                        <div className="border border-slate-100 rounded-3xl overflow-hidden">
                            <table className="w-full border-collapse">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr className="text-left">
                                        <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/3">Learning Domain</th>
                                        <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/6">Score</th>
                                        <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/4">Alignment</th>
                                        <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/4 text-right">Standard</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {domains.map((domain, idx) => {
                                        const score = (latestAssessment.scores as any)[domain];
                                        if (score === undefined) return null;

                                        const bench = benchmarks.find(b => 
                                            b.domain === domain && 
                                            b.period === latestAssessment.type && 
                                            b.level_name === student.level
                                        );

                                        let statusColor = 'text-slate-600';
                                        let statusText = 'Developing';
                                        if (score >= 90) { statusColor = 'text-indigo-600'; statusText = 'Outstanding'; }
                                        else if (score >= 80) { statusColor = 'text-emerald-600'; statusText = 'Excellent'; }
                                        else if (score >= 60) { statusColor = 'text-blue-600'; statusText = 'Proficient'; }
                                        else if (score < 40) { statusColor = 'text-rose-600'; statusText = 'Needs Support'; }

                                        return (
                                            <tr key={domain} className={`border-b border-slate-50 last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'}`}>
                                                <td className="py-4 px-6 text-sm text-slate-800 font-bold">{domain}</td>
                                                <td className="py-4 px-6 font-black text-slate-900">{score}%</td>
                                                <td className="py-4 px-6">
                                                    {bench?.cefr_alignment && bench.cefr_alignment !== "N/A" ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-widest">
                                                            {bench.cefr_alignment}
                                                        </span>
                                                    ) : <span className="text-slate-300">—</span>}
                                                </td>
                                                <td className={`py-4 px-6 font-black text-[10px] uppercase tracking-tighter text-right ${statusColor}`}>{statusText}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                             <Icon name="benchmark" className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                             <p className="text-slate-500 text-sm font-bold">Awaiting assessment entry to calculate standards.</p>
                        </div>
                    )}
                </div>

                {/* AI Insight Section */}
                <div className="mb-8 break-inside-avoid">
                    <h3 className="text-lg font-black text-slate-900 mb-4 flex justify-between items-center">
                        <div className="flex items-center">
                            <div className="w-1.5 h-6 bg-purple-600 mr-3 rounded-full"></div>
                            Pedagogical Intelligence (AI)
                        </div>
                        {(!insight || error) && !isGenerating && latestAssessment && (
                            <button 
                                onClick={handleGenerateInsight} 
                                className="px-4 py-1.5 bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-purple-700 transition active:scale-95 print:hidden"
                            >
                                {error ? 'Try Again' : 'Analyze with AI'}
                            </button>
                        )}
                    </h3>
                    <div className={`p-6 rounded-[2rem] border text-sm leading-relaxed print:bg-white print:border-gray-300 ${error ? 'bg-rose-50 border-rose-100 text-rose-800' : 'bg-purple-50/50 border-purple-100 text-slate-700'}`}>
                        {isGenerating ? (
                            <div className="space-y-3 py-2">
                                <div className="h-3 bg-purple-200 rounded-full w-full animate-pulse"></div>
                                <div className="h-3 bg-purple-200 rounded-full w-[90%] animate-pulse delay-75"></div>
                                <div className="h-3 bg-purple-200 rounded-full w-[95%] animate-pulse delay-150"></div>
                                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest text-center mt-4">Consulting LLM Engine...</p>
                            </div>
                        ) : error ? (
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-rose-100 rounded-xl text-rose-600 shrink-0">
                                    <Icon name="alert" className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-black text-sm uppercase tracking-tight mb-1">Analysis Suspended</p>
                                    <p className="text-xs font-medium opacity-80 leading-relaxed">{error}</p>
                                </div>
                            </div>
                        ) : insight ? (
                            <div className="prose prose-slate prose-sm max-w-none font-medium">
                                {insight.split('\n\n').map((para, i) => (
                                    <p key={i} className="mb-4 last:mb-0 text-slate-700">{renderMarkdownBold(para)}</p>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-slate-400 text-xs italic">
                                    {latestAssessment 
                                        ? "Detailed pedagogical breakdown is ready. Press 'Analyze' to generate insights." 
                                        : "Record at least one test result to activate AI analysis features."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Teacher Comment Section - EDITABLE */}
                <div className="mb-8 break-inside-avoid">
                    <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center">
                        <div className="w-1.5 h-6 bg-emerald-600 mr-3 rounded-full"></div>
                        Teacher's Observation
                    </h3>
                    <div className="border border-slate-200 rounded-[2rem] overflow-hidden bg-white print:border-gray-300">
                        <textarea 
                            value={teacherComment}
                            onChange={(e) => setTeacherComment(e.target.value)}
                            placeholder="Add personalized context or advice for parents..."
                            className="w-full h-full p-6 text-slate-700 font-serif italic outline-none resize-none min-h-[140px] focus:ring-2 focus:ring-indigo-500 transition-all print:hidden"
                        />
                        <p className="hidden print:block p-6 text-slate-800 font-serif italic whitespace-pre-wrap leading-relaxed">
                            {teacherComment || "No additional comments provided."}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-100 pt-6 flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-300 print:text-slate-400">
                    <p>Verified Benchmark AI Assessment System • 2025</p>
                    <p>Doc ID: {student.id.slice(0, 8)} • Page 1 of 1</p>
                </div>
            </div>

            <div className="mt-8 flex justify-end space-x-4 px-4 print:hidden">
                <button 
                    onClick={onClose} 
                    className="px-8 py-3 border border-slate-200 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition active:scale-95"
                >
                    Close
                </button>
                <button 
                    onClick={() => window.print()} 
                    className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition flex items-center space-x-3 shadow-xl shadow-indigo-900/10 active:scale-95"
                >
                    <Icon name="check" className="w-4 h-4 text-emerald-300" />
                    <span>Print Formal Report</span>
                </button>
            </div>
        </Modal>
    );
};