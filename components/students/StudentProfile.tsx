import React, { useState, useEffect, useMemo } from 'react';
import { Student, Resource, Domain, Assessment, StudentLogEntry, SubdomainMetadata } from '../../types';
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

const LogEntryView: React.FC<{ entry: StudentLogEntry }> = ({ entry }) => (
    <div className="flex gap-4 p-5 bg-white rounded-[1.8rem] border border-slate-100 mb-4 shadow-sm hover:shadow-md transition-all animate-in fade-in slide-in-from-left duration-300">
        <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${
            entry.category === 'Intervention' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
            entry.category === 'Goal Met' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
        }`}>
            <Icon name={entry.category === 'Goal Met' ? 'check' : 'chat'} className="w-6 h-6" />
        </div>
        <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{entry.category} • {new Date(entry.date).toLocaleDateString()}</span>
                <span className="text-[10px] font-black text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-lg">By {entry.author}</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">{entry.content}</p>
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

const AssessmentHistoryItem: React.FC<{ 
    assessment: Assessment; 
    frameworkSubdomains: Record<string, SubdomainMetadata[]>;
    onEdit: () => void; 
    onDelete: () => void;
}> = ({ assessment, frameworkSubdomains, onEdit, onDelete }) => {
    const calculateOverall = () => {
        let totalEarned = 0, totalPossible = 0, hasPointData = false;
        Object.entries(assessment.subdomainScores || {}).forEach(([key, earned]) => {
            const [domain, subName] = key.split(':');
            const metadata = frameworkSubdomains[domain]?.find(s => s.name === subName);
            if (metadata && typeof earned === 'number') {
                totalEarned += earned; totalPossible += metadata.maxScore; hasPointData = true;
            }
        });
        if (hasPointData && totalPossible > 0) return Math.round((totalEarned / totalPossible) * 100);
        const vals = Object.values(assessment.scores) as number[];
        return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    };

    const avg = calculateOverall();
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Card variant="glass" className="mb-6 overflow-hidden border-white/50 shadow-lg hover:shadow-xl transition-all">
            <div className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-[1.5rem] flex flex-col items-center justify-center font-black shadow-inner border-2 ${
                        avg >= 80 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                        avg >= 60 ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                        'bg-rose-50 text-rose-600 border-rose-200'
                    }`}>
                        <span className="text-2xl leading-none">{avg}</span>
                        <span className="text-[9px] uppercase tracking-widest mt-0.5">%</span>
                    </div>
                    <div>
                        <h4 className="font-black text-slate-800 text-xl tracking-tight">{assessment.type} Standard</h4>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{new Date(assessment.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="px-6 py-3 bg-white border border-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
                    >
                        {isExpanded ? 'Collapse' : 'Detailed Report'}
                    </button>
                    <button onClick={onEdit} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-2xl transition shadow-sm border border-transparent hover:border-slate-100"><Icon name="settings" className="w-5 h-5" /></button>
                </div>
            </div>

            {isExpanded && (
                <div className="px-8 pb-8 pt-2 border-t border-slate-50 bg-slate-50/20 animate-in slide-in-from-top-4 duration-500">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                        {Object.entries(assessment.scores).map(([domain, score]) => (
                            <div key={domain} className="p-5 bg-white border border-slate-100 rounded-[1.8rem] shadow-sm group hover:border-indigo-200 transition-all">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">{domain}</span>
                                <div className="flex items-end justify-between">
                                    <span className="text-2xl font-black text-slate-800 tracking-tighter">{score}%</span>
                                    <div className="w-full h-2 bg-slate-100 rounded-full ml-4 mb-2.5 overflow-hidden ring-1 ring-slate-100">
                                        <div 
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

export const StudentProfile: React.FC<{ student: Student; onBack: () => void; }> = ({ student, onBack }) => {
    const { updateAssessmentForStudent, deleteAssessmentForStudent, aiInsights, classProfile, addLogEntry } = useStudents();
    const { resources } = useResources();
    const { subdomains: frameworkSubdomains } = useBenchmarks();
    const { user } = useAuth();
    const { setActiveTab } = useNavigation();
    
    const [activeSection, setActiveSection] = useState<'Overview' | 'Assessments' | 'Log' | 'Resources' | 'Insights'>('Overview');
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
        let totalE = 0, totalP = 0, hasP = false;
        Object.entries(latest.subdomainScores || {}).forEach(([k, earned]) => {
            const [d, sn] = k.split(':');
            const meta = frameworkSubdomains[d]?.find(s => s.name === sn);
            if (meta && typeof earned === 'number') { totalE += earned; totalP += meta.maxScore; hasP = true; }
        });
        if (hasP && totalP > 0) return Math.round((totalE / totalP) * 100);
        const vals = Object.values(latest.scores) as number[];
        return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    }, [student.assessments, frameworkSubdomains]);
    
    const actionPoints = useMemo(() => {
        return (student.actionLog || []).filter(l => l.category === 'Intervention').map(l => ({ date: l.date, type: l.category }));
    }, [student.actionLog]);

    const projectionData = useMemo(() => {
        const history = [...student.assessments]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(a => {
                let totalE = 0, totalP = 0, points = false;
                Object.entries(a.subdomainScores || {}).forEach(([k, v]) => {
                    const [dom, name] = k.split(':');
                    const meta = frameworkSubdomains[dom]?.find(s => s.name === name);
                    if (meta && typeof v === 'number') { totalE += v; totalP += meta.maxScore; points = true; }
                });
                const s = points && totalP > 0 ? Math.round((totalE / totalP) * 100) : (a.scores?.[Domain.Reading] ?? 60);
                return { name: a.type, score: s, date: a.date };
            });
        
        if (history.length > 0) {
            const last = history[history.length - 1];
            history.push({ name: 'Proj', score: Math.min(100, Math.max(0, last.score + Number(student.growthVelocity || 0))), date: 'Future' });
        }
        return history;
    }, [student.assessments, student.growthVelocity, frameworkSubdomains]);

    const handleAddLog = async () => {
        if (!logText.trim()) return;
        await addLogEntry(student.id, { date: new Date().toISOString(), author: user?.name || 'Teacher', category: logCategory, content: logText });
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
                                {student.overallGrowth > 10 && <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100 text-[10px] font-black uppercase tracking-widest shadow-sm">High Growth</div>}
                            </div>
                            <div className="flex items-center gap-3 mt-3">
                                <span className="text-[11px] font-black text-indigo-600 uppercase bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100 tracking-widest">Level {student.level}</span>
                                <span className={`text-[10px] font-black px-3 py-1 rounded-xl shadow-sm border ${student.growthVelocity >= 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                    {student.growthVelocity > 0 ? '↑' : '↓'} {Math.abs(student.growthVelocity)} Velocity
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => setIsReportModalOpen(true)} className="px-8 py-4 bg-white border-2 border-slate-100 text-slate-800 rounded-2xl font-black shadow-sm hover:bg-slate-50 active:scale-95 transition-all text-xs uppercase tracking-widest">Export PDF</button>
                        <button onClick={() => { setAssessmentToEdit(null); setIsAssessmentModalOpen(true); }} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-2xl shadow-indigo-200/40 hover:bg-indigo-600 active:scale-95 transition-all flex items-center gap-3 text-xs uppercase tracking-widest border-b-4 border-slate-950">
                            <Icon name="plus" className="w-5 h-5" /> Log Assessment
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <ProfileStatWidget title="Institutional Proficiency" value={`${currentProficiency}%`} subtext="Class Rank: Top 20%" icon="analytics" gradient="from-blue-600 to-indigo-700" tooltip="Weighted proficiency across all tested standards." />
                            <ProfileStatWidget title="Growth Speed" value={`${student.growthVelocity}%`} subtext="Trend: Improving" icon="trendUp" gradient={student.growthVelocity >= 0 ? "from-emerald-500 to-teal-600" : "from-rose-500 to-pink-600"} tooltip="Percentage increase per assessment cycle." />
                            <ProfileStatWidget title="CEFR Calibration" value="Pre-A1" subtext="International Standard" icon="benchmark" gradient="from-purple-600 to-indigo-600" tooltip="Global pedagogical alignment." />
                            <ProfileStatWidget title="Action Records" value={student.actionLog?.length || 0} subtext="Logged Insights" icon="chat" gradient="from-slate-800 to-slate-950" tooltip="Teacher observations and RTI events." />
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                            <Card variant="default" className="p-10 border-t-[10px] border-indigo-600 shadow-2xl bg-white">
                                <div className="flex justify-between items-center mb-10">
                                    <div><h3 className="text-3xl font-black text-slate-900 tracking-tighter">Growth Trajectory</h3><p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Multi-cycle performance visualization</p></div>
                                </div>
                                <div className="min-h-[350px]"><LongitudinalGrowthChart data={projectionData} lines={[{ key: 'score', color: '#4f46e5' }]} type="area" actions={actionPoints} /></div>
                            </Card>
                            <Card variant="glass" className="p-10 shadow-2xl border-white/50 flex flex-col bg-white/40">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Recent Insights</h3>
                                    <button onClick={() => setActiveSection('Log')} className="text-[10px] font-black uppercase text-indigo-600 hover:underline">View All</button>
                                </div>
                                <div className="space-y-1 flex-1">
                                    {student.actionLog?.length ? student.actionLog.slice(0, 3).map(entry => <LogEntryView key={entry.id} entry={entry} />) : (
                                        <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                                            <Icon name="chat" className="w-16 h-16 mb-4 opacity-20" />
                                            <p className="font-bold uppercase tracking-widest text-[11px]">No recent observations</p>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-8 p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100 flex items-center gap-4 group cursor-pointer" onClick={() => setActiveSection('Log')}>
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:rotate-12 transition-transform"><Icon name="plus" className="w-6 h-6" /></div>
                                    <p className="text-sm font-black text-indigo-900">Add pedagogical note &rarr;</p>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {activeSection === 'Assessments' && (
                    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <div className="flex justify-between items-end">
                            <div><h3 className="text-4xl font-black text-slate-900 tracking-tighter">Academic Records</h3><p className="text-slate-400 font-bold text-sm italic mt-1">Formal test cycles and standards alignment.</p></div>
                            <button onClick={() => { setAssessmentToEdit(null); setIsAssessmentModalOpen(true); }} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl active:scale-95">Log Test Cycle</button>
                        </div>
                        <div className="space-y-2">
                            {sortedAssessments.length ? sortedAssessments.map((a) => (
                                <AssessmentHistoryItem key={a.id} assessment={a} frameworkSubdomains={frameworkSubdomains} onEdit={() => { setAssessmentToEdit(a); setIsAssessmentModalOpen(true); }} onDelete={async () => { if (window.confirm("Confirm deletion?")) await deleteAssessmentForStudent(student.id, a.id); }} />
                            )) : (
                                <div className="py-32 text-center bg-white border-4 border-dashed border-slate-100 rounded-[4rem]">
                                    <Icon name="benchmark" className="w-20 h-20 text-slate-100 mx-auto mb-6" />
                                    <p className="text-slate-400 font-bold">No academic data points recorded yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeSection === 'Log' && (
                    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 pb-20">
                        <Card variant="paper" className="p-10 shadow-2xl bg-white border-t-[12px] border-indigo-500">
                            <h3 className="text-3xl font-black text-slate-900 mb-8 tracking-tighter">Pedagogical Observation Log</h3>
                            <div className="flex flex-col md:flex-row gap-4 mb-10 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
                                <select value={logCategory} onChange={(e) => setLogCategory(e.target.value as any)} className="px-6 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm">
                                    <option>Observation</option><option>Intervention</option><option>Parent Communication</option><option>Goal Met</option>
                                </select>
                                <div className="flex-1 flex gap-3">
                                    <input type="text" value={logText} onChange={(e) => setLogText(e.target.value)} placeholder="Inquire or record an outcome..." className="flex-1 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm" />
                                    <button onClick={handleAddLog} className="px-10 py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:bg-indigo-600 active:scale-95 transition-all">Record</button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {student.actionLog?.length ? [...student.actionLog].reverse().map(entry => <LogEntryView key={entry.id} entry={entry} />) : (
                                    <p className="text-center py-12 text-slate-300 font-bold italic">RTI registry is currently empty.</p>
                                )}
                            </div>
                        </Card>
                    </div>
                )}

                {activeSection === 'Resources' && (
                    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-500 pb-20">
                         <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Strategic Pathways</h3>
                                <p className="text-slate-400 font-bold text-sm italic mt-1">AI-curated interventions for skill-gap mitigation.</p>
                            </div>
                            <button onClick={() => setActiveTab(TABS.RESOURCE_BANK)} className="px-8 py-4 bg-white border border-slate-100 text-indigo-600 font-black text-xs uppercase tracking-widest hover:bg-indigo-50 rounded-2xl transition-all shadow-sm">Full Resource Bank</button>
                        </div>

                        {recommendedResources.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {recommendedResources.map(res => (
                                    <Card key={res.id} variant="paper" className="p-8 hover:border-indigo-300 transition-all hover:shadow-2xl hover:shadow-indigo-100/50 scale-hover group">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100">{res.type}</div>
                                            <div className="text-slate-200 group-hover:text-indigo-200 transition-colors"><Icon name="library" className="w-6 h-6" /></div>
                                        </div>
                                        <h4 className="font-black text-slate-800 text-xl mb-3 tracking-tight">{res.title}</h4>
                                        <p className="text-sm text-slate-500 line-clamp-3 mb-8 leading-relaxed font-medium">{res.description}</p>
                                        <div className="mt-auto pt-6 border-t border-slate-50 flex justify-between items-center">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{res.domain}</span>
                                            <button onClick={() => setActiveTab(TABS.RESOURCE_BANK)} className="text-[11px] font-black text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest flex items-center gap-2">Protocol Access <Icon name="arrowRight" className="w-3 h-3" /></button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[4rem] border-4 border-dashed border-slate-50">
                                <div className="p-10 bg-slate-50 rounded-full shadow-inner mb-8 text-slate-200"><Icon name="library" className="w-16 h-16" /></div>
                                <h4 className="text-2xl font-black text-slate-800 mb-2">No Pathway Recommendations</h4>
                                <p className="text-sm text-slate-400 max-w-sm text-center font-bold">Complete more assessment cycles to allow the AI to triangulate weak domains.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <AddAssessmentModal isOpen={isAssessmentModalOpen} onClose={() => { setIsAssessmentModalOpen(false); setAssessmentToEdit(null); }} onSave={(a) => updateAssessmentForStudent(student.id, a)} assessmentToEdit={assessmentToEdit} />
            <StudentReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} student={student} insight={aiInsights[student.id]?.report_card || ''} initialTeacherComment={student.actionLog?.[0]?.content || ''} className={classProfile?.className} />
            <AddStudentModal isOpen={isEditProfileModalOpen} onClose={() => setIsEditProfileModalOpen(false)} studentToEdit={student} />
        </div>
    );
};