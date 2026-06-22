import React, { useState, useMemo, useEffect } from 'react';
import { Student, Assessment, StudentLogEntry } from '../../types';
import { Icon } from '../common/Icon';
import { LongitudinalGrowthChart, RadarPerformanceChart } from '../charts/Charts';
import { DOMAINS } from '../../constants';
import { useStudents } from '../../context/StudentContext';
import { useResources } from '../../context/ResourceContext';
import { useAuth } from '../../context/AuthContext';
import { GeminiService } from '../../services/geminiService';
import { AddAssessmentModal } from './AddAssessmentModal';
import { AddStudentModal } from './AddStudentModal';
import { StudentReportModal } from './StudentReportModal';

export const StudentProfile: React.FC<{ student: Student; onBack: () => void; }> = ({ student, onBack }) => {
    const { updateAssessmentForStudent, deleteAssessmentForStudent, addLogEntry } = useStudents();
    const { resources } = useResources();
    const { user } = useAuth();
    
    const [activeSection, setActiveSection] = useState<'Overview' | 'Assessments' | 'Log' | 'Resources'>('Overview');
    const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [assessmentToEdit, setAssessmentToEdit] = useState<Assessment | null>(null);
    const [logText, setLogText] = useState('');
    const [logCategory, setLogCategory] = useState<StudentLogEntry['category']>('Observation');
    const [prediction, setPrediction] = useState<string | null>(null);

    useEffect(() => {
        const fetchPrediction = async () => {
            try {
                const res = await GeminiService.predictStudentTrajectory(student);
                setPrediction(res);
            } catch (e: any) {
                setPrediction("Trajectory synthesis paused. System recalibrating.");
            }
        };
        fetchPrediction();
    }, [student]);

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
        const history: { name: string; score: number; date: string }[] = sortedAssessments.map(a => ({
            name: a.type as string,
            score: Math.round((Object.values(a.scores) as number[]).reduce((sum: number, v: number) => sum + v, 0) / Object.values(a.scores).length),
            date: a.date
        }));
        if (history.length > 0) {
            const last = history[history.length - 1];
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
        <div className="flex flex-col h-full bg-transparent overflow-hidden font-sans">
            {/* Minimalist Top Bar */}
            <div className="px-6 py-6 md:px-12 shrink-0 border-b border-zinc-800/80 bg-zinc-950/20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            {student.hasAnomaly && (
                                <div className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-red-600 rounded-full border border-zinc-950 z-30 flex items-center justify-center">
                                    <Icon name="alert" className="w-3 h-3 text-white" strokeWidth={3} />
                                </div>
                            )}
                            <div className="w-16 h-16 rounded-sm border border-zinc-800 overflow-hidden bg-zinc-900">
                                <img src={student.photoUrl} className="w-full h-full object-cover filter brightness-90" alt="" referrerPolicy="no-referrer" />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-normal text-zinc-100 tracking-tight">{student.name}</h1>
                                {student.growthVelocity >= 10 && (
                                    <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] uppercase font-mono">
                                        fast track
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-4 mt-2">
                                <span className="text-[11px] font-mono text-[var(--clean-accent)] bg-[var(--clean-accent)]/10 px-2 py-0.5 border border-[var(--clean-accent)]/20">
                                    Level {student.level}
                                </span>
                                <span className="text-[11px] font-mono text-zinc-500">
                                    velocity <span className="text-zinc-300">{student.growthVelocity > 0 ? '+' : ''}{student.growthVelocity}%</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button 
                            onClick={onBack} 
                            className="px-3.5 py-1.5 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors text-xs rounded-none cursor-pointer flex items-center gap-1"
                        >
                            <Icon name="chevronLeft" className="w-4 h-4" />
                            <span>Return to roster</span>
                        </button>
                        <button 
                            onClick={() => setIsEditProfileModalOpen(true)} 
                            className="px-3.5 py-1.5 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors text-xs rounded-none cursor-pointer"
                        >
                            Characteristics
                        </button>
                        <button 
                            onClick={() => setIsReportModalOpen(true)} 
                            className="px-3.5 py-1.5 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors text-xs rounded-none cursor-pointer"
                        >
                            Report export
                        </button>
                        <button 
                            onClick={() => { setAssessmentToEdit(null); setIsAssessmentModalOpen(true); }} 
                            className="px-4 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium text-xs rounded-none transition-colors cursor-pointer"
                        >
                            Log benchmark
                        </button>
                    </div>
                </div>

                {/* Plain borders-only Tab Selection */}
                <div className="flex gap-8 mt-8 border-b border-zinc-900">
                    {(['Overview', 'Assessments', 'Log', 'Resources'] as const).map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveSection(tab)} 
                            className={`pb-3 text-xs tracking-tight transition-colors relative cursor-pointer ${
                                activeSection === tab 
                                    ? 'text-[var(--clean-accent)] font-medium' 
                                    : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            {tab}
                            {activeSection === tab && (
                                <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[var(--clean-accent)]" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Pane (No card wrappers. Deep elements separated by section lines) */}
            <main className="flex-1 p-6 md:p-12 overflow-y-auto scrollbar-none space-y-12 bg-transparent">
                
                {activeSection === 'Overview' && (
                    <div className="space-y-12">
                        
                        {/* Trajectory Synthesizer Row */}
                        <div className="pb-8" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
                            <h4 className="text-[13px] text-zinc-500 font-sans tracking-tight mb-3 font-normal lowercase">
                                trajectory synthesis module
                            </h4>
                            <div className="bg-zinc-950/40 border border-zinc-900 p-5 rounded-none">
                                <div className="flex items-center gap-3 mb-2">
                                    <Icon name="brain" className="w-4 h-4 text-[var(--clean-accent)]" />
                                    <span className="text-xs font-mono text-[var(--clean-accent)] tracking-wider uppercase font-semibold">Gemini predictive insight</span>
                                </div>
                                {prediction ? (
                                    <p className="text-zinc-300 text-sm leading-relaxed italic">
                                        "{prediction}"
                                    </p>
                                ) : (
                                    <div className="flex items-center gap-2 py-1 text-zinc-500">
                                        <Icon name="refresh" className="w-3.5 h-3.5 animate-spin" />
                                        <span className="text-xs font-mono">Synthesizing trajectory models...</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Flat KPIs Row */}
                        <div className="pb-8" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
                            <h4 className="text-[13px] text-zinc-500 font-sans tracking-tight mb-4 font-normal lowercase">
                                key growth dimensions
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { t: 'weighted mastery index', v: `${currentProficiency}%`, s: 'standards threshold' },
                                    { t: 'growth momentum', v: `${student.growthVelocity}%`, s: student.growthVelocity >= 10 ? 'elevated velocity' : 'stable pace' },
                                    { t: 'compiled observations', v: student.actionLog?.length || 0, s: 'clinical logs registered' },
                                    { t: 'cefr alignment', v: 'A1 level', s: 'starters global map' }
                                ].map((stat, i) => (
                                    <div key={i} className="py-2 pr-4 border-r border-zinc-900/60 last:border-r-0">
                                        <span className="text-[10px] text-zinc-500 block uppercase font-mono tracking-wider mb-2">{stat.t}</span>
                                        <span className="text-2xl font-mono text-zinc-100 block font-medium tracking-tight mb-1">{stat.v}</span>
                                        <span className="text-[11px] text-zinc-500 block font-normal">{stat.s}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Graphics Row */}
                        <div>
                            <h4 className="text-[13px] text-zinc-500 font-sans tracking-tight mb-4 font-normal lowercase">
                                visual analytical models
                            </h4>
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                                <div className="p-4 border border-zinc-900 bg-zinc-950/20">
                                    <span className="text-xs text-zinc-400 font-medium block mb-4">Analytical student history over test cycles</span>
                                    <div className="min-h-[300px]">
                                        <LongitudinalGrowthChart data={projectionData} lines={[{ key: 'score', color: '#6366f1' }]} type="area" />
                                    </div>
                                </div>

                                <div className="p-4 border border-zinc-900 bg-zinc-950/20">
                                    <span className="text-xs text-zinc-400 font-medium block mb-4">Functional competence mapping against milestones</span>
                                    <div className="min-h-[300px]">
                                        <RadarPerformanceChart data={DOMAINS.map(d => ({ domain: d, score: student.assessments[student.assessments.length-1]?.scores[d] || 0, target: 80 }))} />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {activeSection === 'Assessments' && (
                    <div className="space-y-6">
                        <h4 className="text-[13px] text-zinc-500 font-sans tracking-tight mb-2 font-normal lowercase">
                            assessment history logs
                        </h4>

                        {student.assessments.length > 0 ? (
                            <div className="space-y-0">
                                {student.assessments.map(a => (
                                    <div 
                                        key={a.id} 
                                        className="flex items-center justify-between py-4" 
                                        style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}
                                    >
                                        <div className="flex items-center gap-6">
                                            <Icon name="benchmark" className="w-4 h-4 text-zinc-500" />
                                            <div>
                                                <p className="font-normal text-sm text-zinc-100">{a.type} cycle index</p>
                                                <p className="text-xs font-mono text-zinc-500 mt-1">{new Date(a.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="text-right">
                                                <span className="text-[10px] text-zinc-500 block font-mono">aggregate score</span>
                                                <span className="text-base font-mono text-[var(--clean-accent)] font-medium tabular-nums">
                                                    {Math.round((Object.values(a.scores) as number[]).reduce((s: number, v: number) => s + v, 0) / DOMAINS.length)}%
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => { setAssessmentToEdit(a); setIsAssessmentModalOpen(true); }} 
                                                    className="p-1.5 text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer"
                                                >
                                                    <Icon name="settings" className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => deleteAssessmentForStudent(student.id, a.id)} 
                                                    className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                                                >
                                                    <Icon name="close" className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center border border-dashed border-zinc-850">
                                <p className="text-zinc-500 text-xs">No assessments registered on this student file.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeSection === 'Log' && (
                    <div className="space-y-8 max-w-4xl">
                        <h4 className="text-[13px] text-zinc-500 font-sans tracking-tight mb-2 font-normal lowercase">
                            observation ledger entries
                        </h4>

                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {(['Observation', 'Intervention', 'Goal Met', 'Parent Communication'] as const).map(cat => (
                                    <button 
                                        key={cat} 
                                        onClick={() => setLogCategory(cat)} 
                                        className={`px-3 py-1 text-xs border rounded-none transition-colors cursor-pointer ${
                                            logCategory === cat 
                                                ? 'bg-zinc-100 border-zinc-100 text-zinc-950 font-normal' 
                                                : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-zinc-200'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                            <textarea 
                                value={logText} 
                                onChange={(e) => setLogText(e.target.value)} 
                                placeholder="Log standard student action report context..." 
                                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 focus:border-[var(--clean-accent)] outline-none rounded-none text-zinc-100 placeholder-zinc-700 text-sm min-h-[100px]" 
                            />
                            <div className="flex justify-end">
                                <button 
                                    onClick={handleAddLog} 
                                    disabled={!logText.trim()} 
                                    className="px-4 py-1.5 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-40 text-zinc-950 font-semibold text-xs rounded-none transition-colors cursor-pointer"
                                >
                                    commit observation
                                </button>
                            </div>
                        </div>

                        <div className="space-y-0 pt-6">
                            {student.actionLog?.length > 0 ? (
                                [...student.actionLog].reverse().map(log => (
                                    <div 
                                        key={log.id} 
                                        className="py-5" 
                                        style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}
                                    >
                                        <div className="flex justify-between items-start gap-4 mb-2">
                                            <span className="text-[11px] font-mono uppercase text-[var(--clean-accent)] tracking-wider">
                                                {log.category}
                                            </span>
                                            <span className="text-[11px] font-mono text-zinc-500">
                                                {new Date(log.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-zinc-350 leading-relaxed italic">
                                            "{log.content}"
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-zinc-500 text-xs italic">No observation entries have been registered.</p>
                            )}
                        </div>
                    </div>
                )}

                {activeSection === 'Resources' && (
                    <div className="space-y-6">
                        <h4 className="text-[13px] text-zinc-500 font-sans tracking-tight mb-2 font-normal lowercase">
                            curriculum recommendation directives
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {recommendedResources.map(res => (
                                <div 
                                    key={res.id} 
                                    className="p-5 border border-zinc-900 bg-zinc-950/20 hover:border-zinc-800 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <Icon name="library" className="w-4 h-4 text-zinc-500" />
                                        <span className="text-[10px] font-mono text-zinc-500">
                                            Level {res.level}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-medium text-zinc-100 mb-2">{res.title}</h3>
                                    <p className="text-xs text-zinc-500 leading-relaxed mb-6">{res.description}</p>
                                    <button className="w-full py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-medium text-xs transition-colors cursor-pointer">
                                        Launch training assets
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            <AddAssessmentModal isOpen={isAssessmentModalOpen} onClose={() => { setIsAssessmentModalOpen(false); setAssessmentToEdit(null); }} onSave={(a) => updateAssessmentForStudent(student.id, a)} assessmentToEdit={assessmentToEdit} />
            <AddStudentModal isOpen={isEditProfileModalOpen} onClose={() => setIsEditProfileModalOpen(false)} studentToEdit={student} />
            <StudentReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} student={student} />
        </div>
    );
};
