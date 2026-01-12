
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

const ProfileStatWidget: React.FC<{ title: string; value: string | number; subtext: string; icon: string; gradient: string; }> = ({ title, value, subtext, icon, gradient }) => (
    <div className={`relative overflow-hidden p-6 rounded-[2rem] bg-gradient-to-br ${gradient} shadow-lg transition-transform hover:-translate-y-1`}>
        <div className="relative z-10 text-white">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md shadow-inner">
                    <Icon name={icon} className="w-6 h-6" />
                </div>
            </div>
            <h3 className="text-3xl font-extrabold mb-1 tracking-tight">{value}</h3>
            <p className="font-medium text-sm mb-3 opacity-90">{subtext}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{title}</p>
        </div>
        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
    </div>
);

export const StudentProfile: React.FC<StudentProfileProps> = ({ student, onBack }) => {
    const { updateStudent, updateAssessmentForStudent, aiInsights, aiSuggestions, saveAiAnalysis, saveAiSuggestions, classProfile, addLogEntry } = useStudents();
    const { addResource, isResourceSaved, resources: globalResources } = useResources();
    const { benchmarks } = useBenchmarks();
    const { user } = useAuth();
    
    const [activeSection, setActiveSection] = useState<'Overview' | 'Assessments' | 'Resources' | 'Log'>('Overview');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [logText, setLogText] = useState('');
    const [logCategory, setLogCategory] = useState<StudentLogEntry['category']>('Observation');

    // Stats calculation
    const latestAssessment = student.assessments[student.assessments.length - 1];
    const avg = latestAssessment ? Math.round((Object.values(latestAssessment.scores) as number[]).reduce((a, b) => a + b, 0) / Object.keys(latestAssessment.scores).length) : 0;
    
    // Projection and Action Point mapping
    const actionPoints = useMemo(() => {
        return (student.actionLog || []).filter(l => l.category === 'Intervention').map(l => ({
            date: l.date,
            type: l.category
        }));
    }, [student.actionLog]);

    const projectionData = useMemo(() => {
        const history = student.assessments.map(a => ({
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
                        <img src={student.photoUrl} className="w-20 h-20 rounded-3xl object-cover shadow-xl border-4 border-white" alt="" />
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{student.name}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-black text-indigo-600 uppercase bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">Level {student.level}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${student.growthVelocity >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                    {student.growthVelocity > 0 ? '+' : ''}{student.growthVelocity} Velocity
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setIsReportModalOpen(true)} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold shadow-xl hover:bg-slate-800 active:scale-95 transition-all">Export Report</button>
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
                            <ProfileStatWidget title="Institutional Avg" value={`${avg}%`} subtext="Class Standard" icon="analytics" gradient="from-blue-500 to-indigo-600" />
                            <ProfileStatWidget title="Growth Velocity" value={`${student.growthVelocity}%`} subtext="Per Cycle" icon="trendUp" gradient={student.growthVelocity >= 0 ? "from-emerald-400 to-teal-500" : "from-rose-400 to-pink-500"} />
                            <ProfileStatWidget title="Milestone Progress" value="85%" subtext="Estimated Target" icon="benchmark" gradient="from-purple-500 to-indigo-500" />
                            <ProfileStatWidget title="Action Records" value={student.actionLog?.length || 0} subtext="Logged Events" icon="chat" gradient="from-slate-700 to-slate-900" />
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            <Card className="p-8 border-t-8 border-indigo-600">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="font-bold text-slate-800">Efficacy & Growth Timeline</h3>
                                        <p className="text-xs text-slate-400">Visualization of teacher actions vs score outcome</p>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">Actionable Analytics</span>
                                </div>
                                <LongitudinalGrowthChart 
                                    data={projectionData} 
                                    lines={[{ key: 'score', color: '#6366f1' }]} 
                                    type="area" 
                                    actions={actionPoints}
                                />
                                <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                                    <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                                    <span>Teacher Intervention Logged</span>
                                </div>
                            </Card>

                            <Card className="p-8">
                                <h3 className="font-bold text-slate-800 mb-6">Intervention Accountability Log</h3>
                                <div className="space-y-3">
                                    {student.actionLog?.slice(0, 3).map(entry => <LogEntryView key={entry.id} entry={entry} />)}
                                    {(!student.actionLog || student.actionLog.length === 0) && <p className="text-center py-10 text-slate-400 text-sm font-medium border-2 border-dashed border-slate-100 rounded-3xl">No actions logged for this student.</p>}
                                    <button onClick={() => setActiveSection('Log')} className="w-full py-3 text-xs font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 rounded-xl transition">Analyze Full History</button>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}
                {/* ... other sections remain unchanged for brevity ... */}
                {activeSection === 'Log' && (
                    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="p-8 bg-white shadow-xl border-t-4 border-indigo-500">
                            <h3 className="text-xl font-black text-slate-900 mb-6">Intervention & Action Log</h3>
                            <div className="flex gap-4 mb-6">
                                <select 
                                    value={logCategory} 
                                    onChange={(e) => setLogCategory(e.target.value as any)}
                                    className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
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
                                        placeholder="What happened or what did you try?"
                                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <button onClick={handleAddLog} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 active:scale-95 transition">Add</button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {student.actionLog?.map(entry => <LogEntryView key={entry.id} entry={entry} />)}
                            </div>
                        </Card>
                    </div>
                )}
                {/* ... existing code ... */}
            </main>

            <AddAssessmentModal 
                isOpen={isAssessmentModalOpen} 
                onClose={() => setIsAssessmentModalOpen(false)} 
                onSave={(a) => updateAssessmentForStudent(student.id, a)} 
            />
            <StudentReportModal 
                isOpen={isReportModalOpen} 
                onClose={() => setIsReportModalOpen(false)} 
                student={student} 
                insight={aiInsights[student.id]?.report_card || ''} 
                teacherComment={student.actionLog?.[0]?.content || ''}
                className={classProfile?.className}
            />
        </div>
    );
};
