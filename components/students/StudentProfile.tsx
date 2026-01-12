
import React, { useState, useEffect, useMemo } from 'react';
import { Student, Resource, Domain, Assessment, StudentLogEntry } from '../../types';
import { GeminiService } from '../../services/geminiService';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';
import { LongitudinalGrowthChart, RadarPerformanceChart } from '../charts/Charts';
import { DOMAINS } from '../../constants';
import { useStudents } from '../../context/StudentContext';
import { useResources } from '../../context/ResourceContext';
import { useBenchmarks } from '../../context/BenchmarkContext';
import { useAuth } from '../../context/AuthContext';
import { AddAssessmentModal } from './AddAssessmentModal';
import { StudentReportModal } from './StudentReportModal';
import { AddStudentModal } from './AddStudentModal';
import { Tooltip } from '../common/Tooltip';

interface StudentProfileProps {
    student: Student;
    onBack: () => void;
}

const LogEntryView: React.FC<{ entry: StudentLogEntry }> = ({ entry }) => (
    <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-3 animate-in fade-in slide-in-from-left duration-300">
        <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            entry.category === 'Intervention' ? 'bg-orange-100 text-orange-600' :
            entry.category === 'Goal Met' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
        }`}>
            <Icon name={entry.category === 'Goal Met' ? 'check' : 'chat'} className="w-5 h-5" />
        </div>
        <div className="flex-1">
            <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{entry.category} • {new Date(entry.date).toLocaleDateString()}</span>
                <span className="text-[10px] font-bold text-slate-400">By {entry.author}</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{entry.content}</p>
        </div>
    </div>
);

const ProfileStatWidget: React.FC<{ title: string; value: string | number; subtext: string; icon: string; gradient: string; tooltip: string; }> = ({ title, value, subtext, icon, gradient, tooltip }) => (
    <div className={`relative overflow-hidden p-6 rounded-[2rem] bg-gradient-to-br ${gradient} shadow-lg transition-transform hover:-translate-y-1`}>
        <div className="relative z-10 text-white">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md shadow-inner">
                    <Icon name={icon} className="w-6 h-6" />
                </div>
            </div>
            <h3 className="text-3xl font-extrabold mb-1 tracking-tight">{value}</h3>
            <p className="font-medium text-sm mb-3 opacity-90">{subtext}</p>
            <Tooltip content={tooltip}>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{title}</p>
            </Tooltip>
        </div>
        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
    </div>
);

const AssessmentHistoryItem: React.FC<{ 
    assessment: Assessment; 
    onEdit: () => void; 
    onDelete: () => void;
}> = ({ assessment, onEdit, onDelete }) => {
    // Fix: Explicitly cast score values to number[] and calculate average safely to resolve arithmetic operand type errors
    const scoreValues = Object.values(assessment.scores) as number[];
    const avg = scoreValues.length > 0 
        ? Math.round(scoreValues.reduce((a: number, b: number) => a + b, 0) / scoreValues.length)
        : 0;
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Card variant="glass" className="mb-4 overflow-hidden border-white/40">
            <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black ${
                        avg >= 80 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        avg >= 60 ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                        'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                        <span className="text-xl leading-none">{avg}</span>
                        <span className="text-[8px] uppercase tracking-tighter">%</span>
                    </div>
                    <div>
                        <h4 className="font-black text-slate-800 tracking-tight">{assessment.type} Assessment</h4>
                        <p className="text-xs text-slate-400 font-medium">{new Date(assessment.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100"
                    >
                        {isExpanded ? 'Hide Details' : 'View Scores'}
                    </button>
                    <button onClick={onEdit} className="p-2 text-slate-400 hover:text-indigo-600 transition"><Icon name="settings" className="w-5 h-5" /></button>
                    <button onClick={onDelete} className="p-2 text-slate-400 hover:text-rose-500 transition"><Icon name="close" className="w-5 h-5" /></button>
                </div>
            </div>

            {isExpanded && (
                <div className="px-6 pb-6 pt-2 border-t border-slate-50 bg-slate-50/30 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                        {Object.entries(assessment.scores).map(([domain, score]) => (
                            <div key={domain} className="p-3 bg-white border border-white rounded-2xl shadow-sm">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">{domain}</span>
                                <div className="flex items-end justify-between">
                                    <span className="text-lg font-black text-slate-700">{score}%</span>
                                    <div className="w-full h-1 bg-slate-100 rounded-full ml-3 mb-1.5 overflow-hidden">
                                        <div 
                                            // Fix: Cast score to number for valid comparison to resolve 'unknown' type error
                                            className={`h-full rounded-full transition-all duration-1000 ${
                                                (score as number) >= 80 ? 'bg-emerald-400' : (score as number) >= 60 ? 'bg-indigo-400' : 'bg-rose-400'
                                            }`} 
                                            style={{ width: `${score}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Card>
    );
};

export const StudentProfile: React.FC<StudentProfileProps> = ({ student, onBack }) => {
    const { updateStudent, updateAssessmentForStudent, aiInsights, deleteStudent, classProfile, addLogEntry } = useStudents();
    const { user } = useAuth();
    
    const [activeSection, setActiveSection] = useState<'Overview' | 'Assessments' | 'Resources' | 'Log'>('Overview');
    const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
    const [assessmentToEdit, setAssessmentToEdit] = useState<Assessment | null>(null);
    const [logText, setLogText] = useState('');
    const [logCategory, setLogCategory] = useState<StudentLogEntry['category']>('Observation');

    // Stats calculation
    const sortedAssessments = useMemo(() => {
        return [...student.assessments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [student.assessments]);

    const latestAssessment = sortedAssessments[0];
    const avg = latestAssessment ? Math.round((Object.values(latestAssessment.scores) as number[]).reduce((a, b) => a + b, 0) / Object.keys(latestAssessment.scores).length) : 0;
    
    // Projection and Action Point mapping
    const actionPoints = useMemo(() => {
        return (student.actionLog || []).filter(l => l.category === 'Intervention').map(l => ({
            date: l.date,
            type: l.category
        }));
    }, [student.actionLog]);

    const projectionData = useMemo(() => {
        const history = [...student.assessments]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(a => ({
                name: a.type,
                score: Number(a.scores?.[Domain.Reading] ?? 60),
                date: a.date
            }));
        
        if (history.length > 0) {
            const last = history[history.length - 1];
            const velocity = Number(student.growthVelocity || 0);
            history.push({
                name: 'Proj',
                score: Math.min(100, Math.max(0, last.score + velocity)),
                date: 'Future'
            });
        }
        return history;
    }, [student.assessments, student.growthVelocity]);

    const handleAddLog = async () => {
        if (!logText.trim()) return;
        await addLogEntry(student.id, {
            date: new Date().toISOString(),
            author: user?.name || 'Teacher',
            category: logCategory,
            content: logText
        });
        setLogText('');
    };

    const handleDeleteAssessment = (id: string) => {
        if (window.confirm("Permanently delete this assessment record?")) {
            const updated = student.assessments.filter(a => a.id !== id);
            // Re-use logic to update the student state
            updateAssessmentForStudent(student.id, { ...student.assessments[0], id: 'force_update' }); // Hacky trigger for recalculation
            // Better to have a deleteAssessmentForStudent in context, but following existing patterns:
            updateStudent({ ...student, assessments: updated });
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
            {/* Header */}
            <div className="bg-white px-6 py-6 md:px-10 shrink-0 border-b border-slate-100 shadow-sm z-10">
                <button onClick={onBack} className="flex items-center space-x-2 text-slate-400 hover:text-indigo-600 mb-6 transition font-bold text-xs uppercase tracking-wider">
                    <Icon name="chevronLeft" className="w-4 h-4" />
                    <span>Back to Roster</span>
                </button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            {/* Status Badge Over Image */}
                            {student.hasAnomaly && (
                                <div className="absolute -top-2 -left-2 w-8 h-8 bg-rose-500 rounded-full border-2 border-white shadow-xl z-20 flex items-center justify-center animate-bounce">
                                    <Icon name="alert" className="w-4 h-4 text-white" strokeWidth={3} />
                                </div>
                            )}

                            <img src={student.photoUrl} className="w-20 h-20 rounded-3xl object-cover shadow-xl border-4 border-white transition-all group-hover:scale-105 z-10" alt="" />
                            <button 
                                onClick={() => setIsEditProfileModalOpen(true)}
                                className="absolute -bottom-1 -right-1 p-1.5 bg-white border border-slate-100 rounded-xl shadow-lg text-slate-400 hover:text-indigo-600 transition-colors z-20"
                                title="Edit Photo"
                            >
                                <Icon name="settings" className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{student.name}</h1>
                                <button 
                                    onClick={() => setIsEditProfileModalOpen(true)}
                                    className="p-1.5 text-slate-300 hover:text-indigo-600 transition-colors"
                                    title="Edit Student Info"
                                >
                                    <Icon name="settings" className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-black text-indigo-600 uppercase bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">Level {student.level}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${student.growthVelocity >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                    {student.growthVelocity > 0 ? '+' : ''}{student.growthVelocity} Velocity
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setIsEditProfileModalOpen(true)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold shadow-sm hover:bg-slate-50 active:scale-95 transition-all">Edit Profile</button>
                        <button onClick={() => setIsReportModalOpen(true)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold shadow-sm hover:bg-slate-50 active:scale-95 transition-all">Export Report</button>
                        <button onClick={() => { setAssessmentToEdit(null); setIsAssessmentModalOpen(true); }} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold shadow-xl hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-2">
                            <Icon name="plus" className="w-4 h-4" />
                            Log New Test
                        </button>
                    </div>
                </div>

                <div className="flex gap-6 mt-8 border-b border-slate-50">
                    {(['Overview', 'Assessments', 'Log', 'Resources'] as const).map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveSection(tab)}
                            className={`pb-4 text-sm font-bold transition-all relative ${activeSection === tab ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {tab}
                            {activeSection === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-full animate-in slide-in-from-bottom-2"></div>}
                        </button>
                    ))}
                </div>
            </div>

            <main className="flex-1 p-6 md:p-10 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                {activeSection === 'Overview' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <ProfileStatWidget 
                              title="Institutional Avg" 
                              value={`${avg}%`} 
                              subtext="Class Standard" 
                              icon="analytics" 
                              gradient="from-blue-500 to-indigo-600" 
                              tooltip="Current skill average compared to classmates."
                            />
                            <ProfileStatWidget 
                              title="Growth Velocity" 
                              value={`${student.growthVelocity}%`} 
                              subtext="Per Cycle" 
                              icon="trendUp" 
                              gradient={student.growthVelocity >= 0 ? "from-emerald-400 to-teal-500" : "from-rose-400 to-pink-500"} 
                              tooltip="How fast the student is improving compared to previous tests."
                            />
                            <ProfileStatWidget 
                              title="Milestone Progress" 
                              value="85%" 
                              subtext="Estimated Target" 
                              icon="benchmark" 
                              gradient="from-purple-500 to-indigo-500" 
                              tooltip="Proximity to the international learning standard."
                            />
                            <ProfileStatWidget 
                              title="Action Records" 
                              value={student.actionLog?.length || 0} 
                              subtext="Logged Events" 
                              icon="chat" 
                              gradient="from-slate-700 to-slate-900" 
                              tooltip="Number of manual interventions or notes logged by teachers."
                            />
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            <Card variant="glass" className="p-8 border-t-8 border-indigo-600 shadow-xl border-white/60">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="font-black text-slate-800 tracking-tight">Efficacy & Growth Timeline</h3>
                                        <p className="text-xs text-slate-400 font-medium">Visualization of teacher actions vs score outcome</p>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">Actionable Analytics</span>
                                </div>
                                <div className="min-h-[300px]">
                                    <LongitudinalGrowthChart 
                                        data={projectionData} 
                                        lines={[{ key: 'score', color: '#6366f1' }]} 
                                        type="area" 
                                        actions={actionPoints}
                                    />
                                </div>
                                <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                                    <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                                    <span>Teacher Intervention Logged</span>
                                </div>
                            </Card>

                            <Card variant="glass" className="p-8 shadow-xl border-white/60">
                                <h3 className="font-black text-slate-800 mb-6 tracking-tight">Recent Interactions</h3>
                                <div className="space-y-3">
                                    {student.actionLog?.slice(0, 3).map(entry => <LogEntryView key={entry.id} entry={entry} />)}
                                    {(!student.actionLog || student.actionLog.length === 0) && <p className="text-center py-10 text-slate-400 text-sm font-medium border-2 border-dashed border-slate-100 rounded-3xl">No actions logged for this student.</p>}
                                    <button onClick={() => setActiveSection('Log')} className="w-full py-3 text-xs font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 rounded-xl transition">View Full History</button>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {activeSection === 'Assessments' && (
                    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Assessment History</h3>
                                <p className="text-sm text-slate-400 font-medium italic">Track progress across Baseline, Midline, and Endline cycles.</p>
                            </div>
                            <button 
                                onClick={() => { setAssessmentToEdit(null); setIsAssessmentModalOpen(true); }}
                                className="px-5 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100"
                            >
                                Add Assessment
                            </button>
                        </div>
                        
                        {sortedAssessments.length > 0 ? (
                            <div className="space-y-4">
                                {sortedAssessments.map((a) => (
                                    <AssessmentHistoryItem 
                                        key={a.id} 
                                        assessment={a} 
                                        onEdit={() => { setAssessmentToEdit(a); setIsAssessmentModalOpen(true); }}
                                        onDelete={() => handleDeleteAssessment(a.id)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-inner">
                                <div className="p-5 bg-slate-50 rounded-3xl text-slate-200 mb-4">
                                    <Icon name="benchmark" className="w-12 h-12" />
                                </div>
                                <h4 className="text-lg font-black text-slate-800">No Assessments Logged</h4>
                                <p className="text-sm text-slate-400 max-w-xs text-center mt-1">Start by adding an assessment to track {student.name}'s institutional progress.</p>
                                <button 
                                    onClick={() => { setAssessmentToEdit(null); setIsAssessmentModalOpen(true); }}
                                    className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition active:scale-95"
                                >
                                    Log First Assessment
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeSection === 'Log' && (
                    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card variant="paper" className="p-8 border-t-8 border-indigo-500 shadow-xl">
                            <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Intervention & Action Record</h3>
                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <select 
                                    value={logCategory} 
                                    onChange={(e) => setLogCategory(e.target.value as any)}
                                    className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                >
                                    <option>Observation</option>
                                    <option>Intervention</option>
                                    <option>Parent Communication</option>
                                    <option>Goal Met</option>
                                </select>
                                <div className="flex-1 flex gap-2">
                                    <input 
                                        type="text" 
                                        value={logText} 
                                        onChange={(e) => setLogText(e.target.value)}
                                        placeholder="Add a progress note..."
                                        className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    />
                                    <button onClick={handleAddLog} className="px-6 py-3 bg-slate-900 text-white font-black text-sm rounded-xl shadow-lg hover:bg-indigo-600 active:scale-95 transition-all">Log</button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {student.actionLog?.map(entry => <LogEntryView key={entry.id} entry={entry} />)}
                                {(!student.actionLog || student.actionLog.length === 0) && (
                                    <p className="text-center py-10 text-slate-400 italic text-sm">No log entries found for this student.</p>
                                )}
                            </div>
                        </Card>
                    </div>
                )}

                {activeSection === 'Resources' && (
                    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
                        <div className="mb-8">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Curated Learning Resources</h3>
                            <p className="text-sm text-slate-400 font-medium">Personalized recommendations based on {student.name}'s latest benchmarks.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* In a real app, this would fetch filtered resources from ResourceContext */}
                            <div className="col-span-full py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] text-center">
                                <div className="p-4 bg-white rounded-full inline-block mb-4 shadow-sm">
                                    <Icon name="library" className="w-8 h-8 text-slate-300" />
                                </div>
                                <p className="text-slate-500 font-bold">Use the Resource Bank to generate tailored materials.</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <AddAssessmentModal 
                isOpen={isAssessmentModalOpen} 
                onClose={() => { setIsAssessmentModalOpen(false); setAssessmentToEdit(null); }} 
                onSave={(a) => updateAssessmentForStudent(student.id, a)} 
                assessmentToEdit={assessmentToEdit}
            />
            <StudentReportModal 
                isOpen={isReportModalOpen} 
                onClose={() => setIsReportModalOpen(false)} 
                student={student} 
                insight={aiInsights[student.id]?.report_card || ''} 
                teacherComment={student.actionLog?.[0]?.content || ''}
                className={classProfile?.className}
            />
            <AddStudentModal 
                isOpen={isEditProfileModalOpen} 
                onClose={() => setIsEditProfileModalOpen(false)} 
                studentToEdit={student} 
            />
        </div>
    );
};
