import React, { useState, useEffect, useMemo } from 'react';
import { Student, Resource, Domain, Assessment, StudentLogEntry, SubdomainMetadata, ResourceType } from '../../types';
import { GeminiService } from '../../services/geminiService';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';
import { LongitudinalGrowthChart, RadarPerformanceChart } from '../charts/Charts';
import { DOMAINS, TABS } from '../../constants';
import { useStudents } from '../../context/StudentContext';
import { useResources } from '../../context/ResourceContext';
import { useBenchmarks } from '../../context/BenchmarkContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { AddAssessmentModal } from './AddAssessmentModal';
import { StudentReportModal } from './StudentReportModal';
import { AddStudentModal } from './AddStudentModal';
import { Tooltip } from '../common/Tooltip';
import { InsightCard } from '../common/InsightCard';

const LogEntryView: React.FC<{ entry: StudentLogEntry }> = ({ entry }) => (
    <div className="flex gap-4 p-6 bg-white rounded-[2rem] border border-slate-100 mb-4 shadow-sm hover:shadow-md transition-all animate-in fade-in slide-in-from-left duration-300">
        <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
            entry.category === 'Intervention' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
            entry.category === 'Goal Met' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
        }`}>
            <Icon name={entry.category === 'Goal Met' ? 'check' : entry.category === 'Intervention' ? 'alert' : 'chat'} className="w-7 h-7" />
        </div>
        <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{entry.category} Protocol</span>
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{new Date(entry.date).toLocaleDateString()}</p>
                </div>
                <span className="text-[9px] font-black text-indigo-400 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 uppercase tracking-widest">Verified by {entry.author}</span>
            </div>
            <p className="text-md text-slate-700 leading-relaxed font-bold italic">"{entry.content}"</p>
        </div>
    </div>
);

const ProfileStatWidget: React.FC<{ title: string; value: string | number; subtext: string; icon: string; gradient: string; tooltip: string; }> = ({ title, value, subtext, icon, gradient, tooltip }) => (
    <div className={`relative overflow-hidden p-8 rounded-[2.5rem] bg-gradient-to-br ${gradient} shadow-2xl shadow-indigo-200/20 transition-all hover:-translate-y-2 group active:scale-95`}>
        <div className="relative z-10 text-white">
            <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-xl shadow-inner border border-white/10 group-hover:bg-white/30 transition-all">
                    <Icon name={icon} className="w-6 h-6" />
                </div>
            </div>
            <h3 className="text-4xl font-black mb-1 tracking-tighter drop-shadow-md">{value}</h3>
            <p className="font-bold text-sm mb-4 opacity-90">{subtext}</p>
            <Tooltip content={tooltip}>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">{title}</p>
            </Tooltip>
        </div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
    </div>
);

export const StudentProfile: React.FC<{ student: Student; onBack: () => void; }> = ({ student, onBack }) => {
    const { updateAssessmentForStudent, deleteAssessmentForStudent, aiInsights, classProfile, addLogEntry } = useStudents();
    const { resources } = useResources();
    const { subdomains: frameworkSubdomains } = useBenchmarks();
    const { user } = useAuth();
    
    const [activeSection, setActiveSection] = useState<'Overview' | 'Assessments' | 'Log' | 'Resources'>('Overview');
    const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
    const [assessmentToEdit, setAssessmentToEdit] = useState<Assessment | null>(null);
    const [logText, setLogText] = useState('');
    const [logCategory, setLogCategory] = useState<StudentLogEntry['category']>('Observation');

    const sortedAssessments = useMemo(() => {
        return [...student.assessments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [student.assessments]);

    const currentProficiency = useMemo(() => {
        if (student.assessments.length === 0) return 0;
        const latest = [...student.assessments].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        const vals = Object.values(latest.scores) as number[];
        return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    }, [student.assessments]);
    
    const projectionData = useMemo(() => {
        const history = sortedAssessments.map(a => ({
            name: a.type,
            // Fixed: Explicitly typed reduce parameters to avoid arithmetic type errors
            score: Math.round((Object.values(a.scores) as number[]).reduce((sum: number, v: number) => sum + v, 0) / Object.values(a.scores).length),
            date: a.date
        }));
        if (history.length > 0) {
            const last = history[history.length - 1];
            // Fixed: Cast last.score to number to resolve operator '+' cannot be applied to unknown error
            history.push({ name: 'Proj', score: Math.min(100, Math.max(0, (last.score as number) + Number(student.growthVelocity || 0))), date: 'Future' });
        }
        return history;
    }, [sortedAssessments, student.growthVelocity]);

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

    const recommendedResources = useMemo(() => {
        const latest = sortedAssessments[sortedAssessments.length - 1];
        if (!latest) return [];
        const weakDomains = Object.entries(latest.scores).filter(([_, score]) => (score as number) < 70).map(([domain]) => domain);
        return resources.filter(r => weakDomains.includes(r.domain) && r.level === student.level).slice(0, 3);
    }, [resources, sortedAssessments, student.level]);

    return (
        <div className="flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
            <div className="bg-white px-8 py-8 md:px-12 shrink-0 border-b border-slate-100 shadow-sm z-10">
                <button onClick={onBack} className="flex items-center space-x-3 text-slate-400 hover:text-indigo-600 mb-8 transition font-black text-[10px] uppercase tracking-[0.2em] group">
                    <Icon name="chevronLeft" className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span>Roster Protocol</span>
                </button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="flex items-center gap-8">
                        <div className="relative group">
                            {student.hasAnomaly && (
                                <div className="absolute -top-3 -left-3 w-10 h-10 bg-rose-500 rounded-full border-4 border-white shadow-2xl z-30 flex items-center justify-center animate-bounce">
                                    <Icon name="alert" className="w-5 h-5 text-white" strokeWidth={3} />
                                </div>
                            )}
                            <div className="w-24 h-24 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white transition-all group-hover:scale-110 group-hover:rotate-3 z-10 bg-slate-100">
                                <img src={student.photoUrl} className="w-full h-full object-cover" alt="" />
                            </div>
                            <button onClick={() => setIsEditProfileModalOpen(true)} className="absolute -bottom-2 -right-2 p-2 bg-white border border-slate-100 rounded-2xl shadow-xl text-slate-400 hover:text-indigo-600 transition-all z-20"><Icon name="settings" className="w-4 h-4" /></button>
                        </div>
                        <div>
                            <div className="flex items-center gap-4">
                                <h1 className="text-5xl font-black text-slate-900 tracking-tighter">{student.name}</h1>
                                {student.growthVelocity >= 10 && <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-[10px] font-black uppercase tracking-widest shadow-sm">Fast Track</div>}
                            </div>
                            <div className="flex items-center gap-3 mt-3">
                                <span className="text-[11px] font-black text-indigo-600 uppercase bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100 tracking-widest">Level {student.level}</span>
                                <span className={`text-[10px] font-black px-3 py-1 rounded-xl shadow-sm border ${student.growthVelocity >= 10 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : student.growthVelocity < 0 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                    {student.growthVelocity > 0 ? '↑' : '↓'} {Math.abs(student.growthVelocity)} Velocity
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => setIsReportModalOpen(true)} className="px-8 py-4 bg-white border-2 border-slate-100 text-slate-800 rounded-2xl font-black shadow-sm hover:bg-slate-50 active:scale-95 transition-all text-xs uppercase tracking-widest">Draft Report</button>
                        <button onClick={() => { setAssessmentToEdit(null); setIsAssessmentModalOpen(true); }} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-2xl shadow-indigo-200/40 hover:bg-indigo-600 active:scale-95 transition-all flex items-center gap-3 text-xs uppercase tracking-widest border-b-4 border-slate-950">
                            <Icon name="plus" className="w-5 h-5" /> Log Score
                        </button>
                    </div>
                </div>

                <div className="flex gap-10 mt-10">
                    {(['Overview', 'Assessments', 'Log', 'Resources'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveSection(tab)} className={`pb-6 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeSection === tab ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                            {tab}{activeSection === tab && <div className="absolute bottom-0 left-0 w-full h-1.5 bg-indigo-600 rounded-full animate-in slide-in-from-bottom-2"></div>}
                        </button>
                    ))}
                </div>
            </div>

            <main className="flex-1 p-8 md:p-12 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                {activeSection === 'Overview' && (
                    <div className="space-y-12 animate-in fade-in duration-700">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                            <InsightCard 
                                title="Growth DNA Analysis"
                                description="AI-Interpreted Performance Cycle"
                                contextForAi={`Student ${student.name} at Level ${student.level} has ${student.growthVelocity}% velocity.`}
                                actionLabel="View Assessments"
                                onAction={() => setActiveSection('Assessments')}
                            >
                                <div className="min-h-[350px]">
                                    <LongitudinalGrowthChart data={projectionData} lines={[{ key: 'score', color: '#4f46e5' }]} type="area" />
                                </div>
                            </InsightCard>

                            <InsightCard 
                                title="Domain Competency"
                                description="Skill Mapping vs Standards"
                                contextForAi={`Analyze domain balance for student with average proficiency of ${currentProficiency}%.`}
                            >
                                <div className="min-h-[350px]">
                                    <RadarPerformanceChart data={DOMAINS.map(d => ({ domain: d, score: student.assessments[student.assessments.length-1]?.scores[d] || 0, target: 80 }))} />
                                </div>
                            </InsightCard>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <ProfileStatWidget title="Weighted Mastery" value={`${currentProficiency}%`} subtext="Standards Met" icon="analytics" gradient="from-blue-600 to-indigo-700" tooltip="Mastery across all domains." />
                            <ProfileStatWidget title="Growth Speed" value={`${student.growthVelocity}%`} subtext={student.growthVelocity >= 10 ? "Fast Track" : "Steady"} icon="trendUp" gradient={student.growthVelocity >= 10 ? "from-emerald-500 to-teal-600" : student.growthVelocity < 0 ? "from-rose-500 to-pink-600" : "from-indigo-400 to-blue-500"} tooltip="Improvement speed." />
                            <ProfileStatWidget title="Identity Records" value={student.actionLog?.length || 0} subtext="Logged Notes" icon="chat" gradient="from-slate-800 to-slate-950" tooltip="Teacher observations." />
                            <ProfileStatWidget title="Compliance" value="Starters" subtext="CEFR Mapping" icon="benchmark" gradient="from-purple-600 to-indigo-600" tooltip="Framework alignment." />
                        </div>
                    </div>
                )}

                {activeSection === 'Assessments' && (
                    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
                            <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Cycle History</h2>
                            {student.assessments.length > 0 ? (
                                <div className="space-y-4">
                                    {student.assessments.map(a => (
                                        <div key={a.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors group">
                                            <div className="flex items-center gap-6">
                                                <div className="p-3 bg-white rounded-xl shadow-sm"><Icon name="benchmark" className="w-5 h-5 text-indigo-500" /></div>
                                                <div>
                                                    <p className="font-black text-slate-800 uppercase tracking-widest text-[10px]">{a.type} Protocol</p>
                                                    <p className="text-sm font-bold text-slate-400">{new Date(a.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-10">
                                                <div className="text-right">
                                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Aggregate</p>
                                                    {/* Fixed: Explicitly typed reduce parameters to avoid arithmetic type errors */}
                                                    <p className="text-xl font-black text-slate-800">{Math.round((Object.values(a.scores) as number[]).reduce((s: number, v: number) => s + v, 0) / DOMAINS.length)}%</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => { setAssessmentToEdit(a); setIsAssessmentModalOpen(true); }} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-white rounded-lg transition-all shadow-sm"><Icon name="settings" className="w-4 h-4" /></button>
                                                    <button onClick={() => deleteAssessmentForStudent(student.id, a.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-white rounded-lg transition-all shadow-sm"><Icon name="close" className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                                    <p className="text-slate-400 font-bold">No assessments recorded for this profile.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeSection === 'Log' && (
                    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
                        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
                            <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Institutional Action Log</h2>
                            <div className="flex gap-4 mb-10">
                                <div className="flex-1 space-y-4">
                                    <div className="flex gap-4">
                                        {(['Observation', 'Intervention', 'Goal Met', 'Parent Communication'] as const).map(cat => (
                                            <button key={cat} onClick={() => setLogCategory(cat)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${logCategory === cat ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-white'}`}>{cat}</button>
                                        ))}
                                    </div>
                                    <textarea value={logText} onChange={(e) => setLogText(e.target.value)} placeholder="Type diagnostic observation..." className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-slate-800 min-h-[120px]" />
                                    <div className="flex justify-end">
                                        <button onClick={handleAddLog} disabled={!logText.trim()} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 transition-all disabled:opacity-50">Commit Observation</button>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 scrollbar-thin">
                                {student.actionLog?.length > 0 ? (
                                    [...student.actionLog].reverse().map(log => <LogEntryView key={log.id} entry={log} />)
                                ) : (
                                    <p className="text-center py-10 text-slate-400 font-bold italic">No observations committed to file.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'Resources' && (
                    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {recommendedResources.map(res => (
                                <Card key={res.id} variant="paper" className="p-8 group hover:border-indigo-200 transition-all cursor-pointer">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all"><Icon name="library" className="w-6 h-6" /></div>
                                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-lg">Level {res.level}</span>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 mb-3 leading-tight">{res.title}</h3>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">{res.description}</p>
                                    <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all">Launch Resource</button>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            <AddAssessmentModal isOpen={isAssessmentModalOpen} onClose={() => { setIsAssessmentModalOpen(false); setAssessmentToEdit(null); }} onSave={(a) => updateAssessmentForStudent(student.id, a)} assessmentToEdit={assessmentToEdit} />
            <StudentReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} student={student} insight={aiInsights[student.id]?.report_card || ''} initialTeacherComment={student.actionLog?.[0]?.content || ''} className={classProfile?.className} />
            <AddStudentModal isOpen={isEditProfileModalOpen} onClose={() => setIsEditProfileModalOpen(false)} studentToEdit={student} />
        </div>
    );
};