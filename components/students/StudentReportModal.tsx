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
    const latestAssessment = student.assessments[student.assessments.length - 1];
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const handleGenerateInsight = async () => {
        if (!latestAssessment) return;
        setIsGenerating(true);
        setError(null);
        try {
            const result = await GeminiService.generateComprehensiveStudentAnalysis(student);
            saveAiAnalysis(student.id, result);
        } catch (e) {
            console.error("Report generation error:", e);
            setError("The AI service is currently unavailable or your credentials have expired. Please verify your connection.");
        } finally {
            setIsGenerating(false);
        }
    };

    const renderMarkdownBold = (text: string) => {
         const parts = text.split(/\*\*(.*?)\*\*/g);
         return parts.map((part, index) =>
             index % 2 === 1 ? <strong key={index}>{part}</strong> : part
         );
     };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Student Progress Report" size="xl">
            <div className="bg-white p-8 border border-gray-200 shadow-sm mx-auto max-w-3xl print:border-0 print:shadow-none print:p-0">
                
                {/* Header */}
                <div className="flex justify-between items-end border-b-2 border-gray-800 pb-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Student Progress Report</h1>
                        <p className="text-gray-600 mt-1">Periodic Performance Review</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-blue-900">Benchmark AI</div>
                        <p className="text-sm text-gray-500">{date}</p>
                    </div>
                </div>

                {/* Student Info Grid */}
                <div className="grid grid-cols-2 gap-8 mb-8 bg-gray-50 p-6 rounded-lg border border-gray-100 print:bg-white print:border-gray-300">
                    <div className="flex items-center space-x-4">
                        <img src={student.photoUrl} alt={student.name} className="w-16 h-16 rounded-full border-2 border-white shadow-sm" />
                        <div>
                            <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Student Name</p>
                            <p className="text-xl font-bold text-gray-900">{student.name}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Class</p>
                            <p className="text-lg font-medium text-gray-900">{student.class || className || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Current Level</p>
                            <p className="text-lg font-medium text-gray-900">{student.level}</p>
                        </div>
                    </div>
                </div>

                {/* Scores Section */}
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <span className="w-2 h-6 bg-blue-600 mr-2 rounded-full print:bg-blue-600"></span>
                        Latest Assessment Data ({latestAssessment?.type || 'No Data'})
                    </h3>
                    {latestAssessment ? (
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-gray-300 text-left">
                                    <th className="py-2 text-sm font-semibold text-gray-600 w-1/3">Domain</th>
                                    <th className="py-2 text-sm font-semibold text-gray-600 w-1/6">Score</th>
                                    <th className="py-2 text-sm font-semibold text-gray-600 w-1/4">Target Standard</th>
                                    <th className="py-2 text-sm font-semibold text-gray-600 w-1/4 text-right">Status</th>
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

                                    let statusColor = 'text-gray-900';
                                    let statusText = 'Developing';
                                    if (score >= 80) { statusColor = 'text-green-600'; statusText = 'Excellent'; }
                                    else if (score >= 60) { statusColor = 'text-blue-600'; statusText = 'Proficient'; }
                                    else if (score < 40) { statusColor = 'text-red-600'; statusText = 'Needs Support'; }

                                    return (
                                        <tr key={domain} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                            <td className="py-3 pl-2 text-gray-800 font-medium">{domain}</td>
                                            <td className="py-3 font-bold">{score}%</td>
                                            <td className="py-3 text-sm text-gray-500">
                                                {bench?.cefr_alignment && bench.cefr_alignment !== "N/A" ? (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 mr-1">
                                                        {bench.cefr_alignment}
                                                    </span>
                                                ) : '-'}
                                                {bench?.target_percent ? <span className="text-xs">Goal: {bench.target_percent}%</span> : ''}
                                            </td>
                                            <td className={`py-3 font-semibold text-right pr-2 ${statusColor}`}>{statusText}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-gray-500 italic">No assessment data recorded.</p>
                    )}
                </div>

                {/* AI Insight Section */}
                <div className="mb-8 break-inside-avoid">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex justify-between items-center">
                        <div className="flex items-center">
                            <span className="w-2 h-6 bg-purple-600 mr-2 rounded-full"></span>
                            AI Performance Analysis
                        </div>
                        {(!insight || error) && !isGenerating && (
                            <button 
                                onClick={handleGenerateInsight} 
                                className="px-3 py-1 bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg hover:bg-purple-700 transition print:hidden"
                            >
                                {error ? 'Try Again' : 'Generate with AI'}
                            </button>
                        )}
                    </h3>
                    <div className={`p-6 rounded-lg border text-sm leading-relaxed print:bg-white print:border-gray-300 ${error ? 'bg-rose-50 border-rose-100 text-rose-800' : 'bg-purple-50 border-purple-100 text-gray-800'}`}>
                        {isGenerating ? (
                            <div className="space-y-3 animate-pulse">
                                <div className="h-4 bg-purple-200 rounded w-full"></div>
                                <div className="h-4 bg-purple-200 rounded w-[90%]"></div>
                                <div className="h-4 bg-purple-200 rounded w-[95%]"></div>
                            </div>
                        ) : error ? (
                            <div className="flex items-center gap-3">
                                <Icon name="alert" className="w-5 h-5 text-rose-500" />
                                <p className="font-medium">{error}</p>
                            </div>
                        ) : insight ? (
                            <div className="prose prose-sm max-w-none">
                                {insight.split('\n\n').map((para, i) => <p key={i} className="mb-2">{renderMarkdownBold(para)}</p>)}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">No analysis generated. Click 'Generate with AI' to build this section.</p>
                        )}
                    </div>
                </div>

                {/* Teacher Comment Section - EDITABLE */}
                <div className="mb-8 break-inside-avoid">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <span className="w-2 h-6 bg-green-600 mr-2 rounded-full"></span>
                        Pedagogical Feedback
                    </h3>
                    <div className="border border-gray-300 rounded-lg overflow-hidden min-h-[120px] bg-white print:border-gray-300">
                        <textarea 
                            value={teacherComment}
                            onChange={(e) => setTeacherComment(e.target.value)}
                            placeholder="Type additional teacher observations or parent advice here..."
                            className="w-full h-full p-6 text-gray-700 font-serif italic outline-none resize-none print:hidden"
                        />
                        <p className="hidden print:block p-6 text-gray-700 font-serif italic whitespace-pre-wrap">
                            {teacherComment || "No additional comments provided."}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 pt-6 flex justify-between items-center text-xs text-gray-400 print:text-gray-600">
                    <p>Generated by Benchmark AI Platform</p>
                    <p>Page 1 of 1</p>
                </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4 print:hidden">
                <button 
                    onClick={onClose} 
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
                >
                    Close
                </button>
                <button 
                    onClick={() => window.print()} 
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition flex items-center space-x-2 shadow-lg active:scale-95"
                >
                    <Icon name="check" className="w-5 h-5" />
                    <span>Print Report</span>
                </button>
            </div>
        </Modal>
    );
};