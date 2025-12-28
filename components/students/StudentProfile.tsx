
import React, { useState, useEffect, useMemo } from 'react';
import { Student, Resource, Domain, Assessment } from '../../types';
import { GeminiService } from '../../services/geminiService';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';
import { LongitudinalGrowthChart, RadarPerformanceChart } from '../charts/Charts';
import { DOMAINS } from '../../constants';
import { useStudents } from '../../context/StudentContext';
import { useResources } from '../../context/ResourceContext';
import { useBenchmarks } from '../../context/BenchmarkContext';
import { AddAssessmentModal } from './AddAssessmentModal';
import { StudentReportModal } from './StudentReportModal';

interface StudentProfileProps {
    student: Student;
    onBack: () => void;
}

const SectionButton: React.FC<{
    label: string;
    iconName: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, iconName, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-3 w-full text-left px-5 py-3.5 rounded-2xl transition-all duration-200 ${
            isActive ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm' : 'hover:bg-slate-50 text-slate-500 font-medium'
        }`}
    >
        <Icon name={iconName} className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
        <span>{label}</span>
        {isActive && <Icon name="arrowRight" className="w-4 h-4 ml-auto text-indigo-400" />}
    </button>
);

const MobileTabButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
            isActive ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200'
        }`}
    >
        {label}
    </button>
);

const RecommendedResource: React.FC<{ resource: Resource, onSave: (r: Resource) => void, isSaved: boolean }> = ({ resource, onSave, isSaved }) => (
    <div className="p-5 bg-white border border-gray-100 rounded-3xl hover:shadow-lg hover:shadow-indigo-100 transition-all duration-300 group">
        <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors line-clamp-1">{resource.title}</h4>
             {resource.aiGenerated && <Icon name="brain" className="w-5 h-5 text-purple-400" />}
        </div>
        <div className="flex items-center gap-2 mb-3">
             <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">{resource.type}</span>
             <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">{resource.domain}</span>
        </div>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed line-clamp-2">{resource.description}</p>
        <button 
            onClick={() => !isSaved && onSave(resource)}
            className={`w-full py-3 text-xs rounded-xl font-bold transition-all ${isSaved ? 'bg-emerald-50 text-emerald-600 cursor-default' : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-md'}`}
        >
            {isSaved ? 'Saved in Bank' : 'Save to Bank'}
        </button>
    </div>
);

// Updated to match DashboardWidget style
const ProfileStatWidget: React.FC<{ 
    title: string; 
    value: string | number; 
    subtext: string; 
    icon: string; 
    gradient: string; 
}> = ({ title, value, subtext, icon, gradient }) => (
    <div className={`relative overflow-hidden p-6 rounded-[2rem] bg-gradient-to-br ${gradient} shadow-lg transition-transform hover:-translate-y-1`}>
        <div className="relative z-10 text-white">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md shadow-inner text-white">
                    <Icon name={icon} className="w-6 h-6" />
                </div>
            </div>
            <h3 className="text-3xl font-extrabold mb-1 tracking-tight">{value}</h3>
            <p className="font-medium text-sm mb-3 opacity-90">{subtext}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{title}</p>
        </div>
        {/* Decor */}
        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
    </div>
);

export const StudentProfile: React.FC<StudentProfileProps> = ({ student, onBack }) => {
    const { updateStudent, updateAssessmentForStudent, aiInsights, aiSuggestions, saveAiAnalysis, saveAiSuggestions, classProfile } = useStudents();
    const { addResource, isResourceSaved, resources: globalResources } = useResources();
    const { benchmarks } = useBenchmarks();
    
    const [activeSection, setActiveSection] = useState<'Overview' | 'Assessments' | 'Resources' | 'Report'>('Overview');
    
    // Insights State
    const [reportCardInsight, setReportCardInsight] = useState<string>('');
    const [trendAnalysis, setTrendAnalysis] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    const [aiRecommendedResources, setAiRecommendedResources] = useState<Resource[]>([]);
    const [isLoadingResources, setIsLoadingResources] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(student.name);
    const [editLevel, setEditLevel] = useState(student.level);
    const [editPhotoUrl, setEditPhotoUrl] = useState(student.photoUrl);
    const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
    const [assessmentToEdit, setAssessmentToEdit] = useState<Assessment | null>(null);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [teacherComment, setTeacherComment] = useState('');
    const [growthChartType, setGrowthChartType] = useState<'line' | 'area' | 'bar'>('line');

    const latestAssessment = student.assessments[student.assessments.length - 1];
    const weakestDomain = latestAssessment 
        ? (Object.keys(latestAssessment.scores) as Domain[]).reduce((a, b) => latestAssessment.scores[a] < latestAssessment.scores[b] ? a : b)
        : Domain.Reading;
    const matchingBankResources = globalResources.filter(r => r.domain === weakestDomain && r.level === student.level);

    const stats = useMemo(() => {
        if (!latestAssessment) return null;
        const scores = latestAssessment.scores;
        const scoreValues = Object.values(scores) as number[];
        const latestAvg = Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length);
        // @ts-ignore
        const bestDomain = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b) as string;
        
        let trajLabel = 'Stable';
        let trajGradient = 'from-blue-400 to-indigo-500';
        let trajIcon = 'trendStable';

        if (student.overallGrowth > 0) {
            trajLabel = 'Rising';
            trajGradient = 'from-emerald-400 to-teal-500';
            trajIcon = 'trendUp';
        } else if (student.overallGrowth < 0) {
            if (latestAvg >= 85) {
                trajLabel = 'Mastery'; // Even if dropping slightly, still high
                trajGradient = 'from-violet-400 to-purple-500';
                trajIcon = 'trendStable';
            } else {
                trajLabel = 'Declining';
                trajGradient = 'from-orange-400 to-rose-500';
                trajIcon = 'trendDown';
            }
        }

        return { latestAvg, bestDomain, weakestDomain, trajLabel, trajGradient, trajIcon };
    }, [latestAssessment, student.overallGrowth]);

    const radarData = useMemo(() => {
        if (!latestAssessment) return [];
        return DOMAINS.map(d => {
            const benchmark = benchmarks.find(b => b.domain === d && b.level_name === student.level && b.period === latestAssessment.type);
            return { domain: d, score: latestAssessment.scores[d] || 0, target: benchmark ? benchmark.target_percent : 100 };
        });
    }, [latestAssessment, benchmarks, student.level]);

    const assessmentHistoryData = useMemo(() => {
        return student.assessments.map(a => {
            const scores = DOMAINS.reduce((acc, domain) => { acc[domain] = a.scores[domain]; return acc; }, {} as Record<Domain, number>);
            return { name: a.type, ...scores };
        });
    }, [student.assessments]);

    // Initialize from Cache
    useEffect(() => {
        const cached = aiInsights[student.id];
        if (cached) {
            setReportCardInsight(cached.report_card);
            setTrendAnalysis(cached.trend_insights);
        } else {
            setReportCardInsight('');
            setTrendAnalysis('');
        }
        setAiRecommendedResources(aiSuggestions[student.id] || []);
        setIsAnalyzing(false);
        setEditName(student.name);
        setEditLevel(student.level);
        setEditPhotoUrl(student.photoUrl);
        setAssessmentToEdit(null);
    }, [student, aiInsights, aiSuggestions]);

    // Unified Analysis Trigger
    const handleGenerateAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            const result = await GeminiService.generateComprehensiveStudentAnalysis(student);
            setReportCardInsight(result.report_card);
            setTrendAnalysis(result.trend_insights);
            saveAiAnalysis(student.id, result);
        } catch (e) {
            setReportCardInsight('Error generating analysis.');
            setTrendAnalysis('Error generating analysis.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleGenerateResources = async () => {
        setIsLoadingResources(true);
        try {
            const suggestions = await GeminiService.getRecommendedResources(weakestDomain, "General", student.level);
            setAiRecommendedResources(suggestions);
            saveAiSuggestions(student.id, suggestions);
        } catch (e) {} finally { setIsLoadingResources(false); }
    };

    const handleSaveProfile = () => { 
        updateStudent({ 
            ...student, 
            name: editName, 
            level: editLevel,
            photoUrl: editPhotoUrl 
        }); 
        setIsEditing(false); 
    };
    
    const regeneratePhoto = () => {
        const randomSeed = Math.random().toString(36).substring(7);
        setEditPhotoUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`);
    };

    const handleSaveAssessment = async (data: Assessment) => { await updateAssessmentForStudent(student.id, data); setAssessmentToEdit(null); };

    return (
        <div className="flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-6 md:px-10 shrink-0 shadow-sm z-10">
                <button onClick={onBack} className="flex items-center space-x-2 text-slate-500 hover:text-indigo-600 mb-6 transition font-bold text-xs uppercase tracking-wider">
                    <Icon name="arrowRight" className="w-4 h-4 rotate-180" />
                    <span>Back to Class List</span>
                </button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 rounded-full"></div>
                            <img src={isEditing ? editPhotoUrl : student.photoUrl} alt={student.name} className="relative w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover bg-white" />
                            {isEditing && (
                                <button 
                                    onClick={regeneratePhoto}
                                    className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border border-gray-200 hover:bg-gray-50 text-indigo-600 z-10"
                                    title="Regenerate Avatar"
                                >
                                    <Icon name="refresh" className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <div>
                            {isEditing ? (
                                <div className="space-y-3">
                                    <input value={editName} onChange={(e) => setEditName(e.target.value)} className="block text-2xl font-bold border rounded px-3 py-1.5 w-full focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    <div className="flex gap-2">
                                        <input value={editLevel} onChange={(e) => setEditLevel(e.target.value)} className="block text-sm text-gray-500 border rounded px-3 py-1.5 w-24 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                        <input 
                                            value={editPhotoUrl} 
                                            onChange={(e) => setEditPhotoUrl(e.target.value)} 
                                            className="block text-xs text-gray-400 border rounded px-3 py-1.5 w-full focus:ring-2 focus:ring-indigo-500 outline-none" 
                                            placeholder="Avatar URL"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{student.name}</h1>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{student.level}</span>
                                        <span className="text-slate-400 text-sm font-medium">{student.class}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex gap-3">
                         {isEditing ? (
                            <>
                                <button onClick={() => setIsEditing(false)} className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold">Cancel</button>
                                <button onClick={handleSaveProfile} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200">Save</button>
                            </>
                        ) : (
                             <button onClick={() => setIsEditing(true)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition">
                                Edit Profile
                            </button>
                        )}
                        <button onClick={() => { if(!reportCardInsight) handleGenerateAnalysis(); setIsReportModalOpen(true); }} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition shadow-xl flex items-center gap-2">
                            <Icon name="benchmark" className="w-4 h-4" />
                            <span>Report Card</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Tabs */}
                <div className="lg:hidden mt-6 overflow-x-auto pb-1 scrollbar-none">
                    <div className="flex gap-2">
                        <MobileTabButton label="Overview" isActive={activeSection === 'Overview'} onClick={() => setActiveSection('Overview')} />
                        <MobileTabButton label="Score Analysis" isActive={activeSection === 'Assessments'} onClick={() => setActiveSection('Assessments')} />
                        <MobileTabButton label="Recommended" isActive={activeSection === 'Resources'} onClick={() => setActiveSection('Resources')} />
                        <MobileTabButton label="Report" isActive={activeSection === 'Report'} onClick={() => setActiveSection('Report')} />
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Desktop Side Nav */}
                <div className="w-72 p-6 bg-white hidden lg:block overflow-y-auto border-r border-slate-100">
                    <nav className="space-y-2">
                        <SectionButton label="Overview" iconName="students" isActive={activeSection === 'Overview'} onClick={() => setActiveSection('Overview')} />
                        <SectionButton label="Score Analysis" iconName="benchmark" isActive={activeSection === 'Assessments'} onClick={() => setActiveSection('Assessments')} />
                        <SectionButton label="Recommended" iconName="library" isActive={activeSection === 'Resources'} onClick={() => setActiveSection('Resources')} />
                        <SectionButton label="Report Export" iconName="analytics" isActive={activeSection === 'Report'} onClick={() => setActiveSection('Report')} />
                    </nav>
                </div>
                
                {/* Content */}
                <main className="flex-1 p-6 md:p-10 overflow-y-auto pb-20 scrollbar-thin scrollbar-thumb-slate-200">
                    {activeSection === 'Overview' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            {stats ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                    <ProfileStatWidget 
                                        title="Latest Average"
                                        value={`${stats.latestAvg}%`}
                                        subtext="Across all domains"
                                        icon="analytics"
                                        gradient="from-cyan-400 to-blue-500"
                                    />
                                    <ProfileStatWidget 
                                        title="Trajectory"
                                        value={stats.trajLabel}
                                        subtext={`${student.overallGrowth > 0 ? '+' : ''}${student.overallGrowth}% vs Baseline`}
                                        icon={stats.trajIcon}
                                        gradient={stats.trajGradient}
                                    />
                                    <ProfileStatWidget 
                                        title="Superpower"
                                        value={stats.bestDomain}
                                        subtext="Highest scoring area"
                                        icon="check"
                                        gradient="from-fuchsia-500 to-purple-600"
                                    />
                                    
                                    {student.interventionStatus ? (
                                        <ProfileStatWidget 
                                            title="Active Alert"
                                            value={`Tier ${student.interventionStatus.tier}`}
                                            subtext={student.interventionStatus.domain}
                                            icon="alert"
                                            gradient="from-amber-400 to-orange-500"
                                        />
                                    ) : (
                                        <ProfileStatWidget 
                                            title="Focus Area"
                                            value={stats.weakestDomain}
                                            subtext="Target for growth"
                                            icon="brain"
                                            gradient="from-indigo-400 to-blue-500"
                                        />
                                    )}
                                </div>
                            ) : (
                                <div className="p-12 bg-white border border-slate-200 border-dashed rounded-3xl text-center">
                                    <p className="text-slate-500 font-medium">No assessment data yet.</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                <Card className="p-8 min-h-[400px]">
                                    <h3 className="text-xl font-bold text-slate-900 mb-6">Skill Profile</h3>
                                    {radarData.length > 0 ? <RadarPerformanceChart data={radarData} /> : <div className="text-center text-slate-400 mt-20">No data</div>}
                                </Card>

                                <Card className="p-0 overflow-hidden border-none shadow-2xl shadow-purple-100 bg-gradient-to-br from-white to-purple-50">
                                    <div className="p-8 border-b border-purple-100 flex justify-between items-center bg-white/50 backdrop-blur-sm">
                                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                            <div className="p-2 bg-purple-100 rounded-xl text-purple-600"><Icon name="brain" className="w-5 h-5"/></div>
                                            Pedagogical Insight
                                        </h3>
                                        {reportCardInsight && <button onClick={handleGenerateAnalysis} className="text-xs font-bold text-purple-600 hover:text-purple-800 uppercase tracking-wide bg-purple-100 px-3 py-1 rounded-full">Regenerate</button>}
                                    </div>
                                    <div className="p-8 min-h-[320px]">
                                        {isAnalyzing ? (
                                            <div className="animate-pulse space-y-4">
                                                <div className="h-4 bg-purple-100 rounded w-3/4"></div>
                                                <div className="h-4 bg-purple-100 rounded w-full"></div>
                                                <div className="h-4 bg-purple-100 rounded w-5/6"></div>
                                            </div>
                                        ) : reportCardInsight ? (
                                            <div className="prose prose-sm prose-purple max-w-none text-slate-600">
                                                {reportCardInsight.split('\n').map((p, i) => (
                                                    <p key={i} className="mb-4">
                                                        {p.includes('**') ? 
                                                            <strong className="text-purple-900 font-extrabold block text-lg mb-1">{p.replace(/\*\*/g, '')}</strong> : 
                                                            p
                                                        }
                                                    </p>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <p className="text-slate-500 mb-6 font-medium">Generate a comprehensive report for parents.</p>
                                                <button onClick={handleGenerateAnalysis} className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-200">Generate Insight</button>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}
                    
                    {activeSection === 'Assessments' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                             <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Score Analysis</h2>
                                <button onClick={() => { setAssessmentToEdit(null); setIsAssessmentModalOpen(true); }} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center gap-2">
                                    <Icon name="plus" className="w-4 h-4" /> <span>Log New Score</span>
                                </button>
                            </div>

                            {/* Chart Card */}
                            <Card className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-slate-500 uppercase tracking-wide text-xs">Growth Trajectory</h3>
                                    <div className="flex bg-slate-50 p-1 rounded-xl">
                                        {(['line', 'area', 'bar'] as const).map(t => (
                                            <button key={t} onClick={() => setGrowthChartType(t)} className={`px-4 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${growthChartType === t ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>{t}</button>
                                        ))}
                                    </div>
                                </div>
                                <LongitudinalGrowthChart 
                                    data={assessmentHistoryData}
                                    type={growthChartType}
                                    lines={DOMAINS.slice(0, 5).map((d, i) => ({ key: d, color: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][i] }))}
                                />
                            </Card>

                            {/* AI Trend Analysis Section */}
                            <div className="relative rounded-3xl overflow-hidden bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                                <div className="p-8">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                <Icon name="trendUp" className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900">Teacher's Trend Insights</h3>
                                                <p className="text-sm text-slate-500">Actionable patterns and classroom next steps.</p>
                                            </div>
                                        </div>
                                        
                                        {!trendAnalysis && (
                                            <button 
                                                onClick={handleGenerateAnalysis} 
                                                disabled={isAnalyzing}
                                                className="px-6 py-3 bg-white border-2 border-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition shadow-sm flex items-center gap-2 active:scale-95"
                                            >
                                                {isAnalyzing ? <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div> : <Icon name="brain" className="w-5 h-5" />}
                                                {isAnalyzing ? 'Analyzing...' : 'Analyze Trends'}
                                            </button>
                                        )}
                                    </div>
                                    
                                    {trendAnalysis && (
                                        <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100 animate-in fade-in slide-in-from-bottom-2">
                                             <div className="prose prose-indigo max-w-none text-slate-700">
                                                {trendAnalysis.split('\n').map((line, i) => (
                                                    <p key={i} className="mb-3 last:mb-0">
                                                        {line.includes('**') ? 
                                                            <strong className="text-indigo-900 block text-lg mb-1">{line.replace(/\*\*/g, '')}</strong> : 
                                                            <span className="block">{line.replace(/^- /, '')}</span>
                                                        }
                                                    </p>
                                                ))}
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-indigo-100 flex justify-end">
                                                <button onClick={handleGenerateAnalysis} className="text-xs font-bold text-indigo-500 hover:text-indigo-700 uppercase tracking-wide">
                                                    Update Analysis
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                             {/* Table */}
                            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                <div className="overflow-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-200">
                                    <table className="w-full text-left border-collapse min-w-full">
                                        <thead className="bg-slate-50/90 backdrop-blur border-b border-slate-100 sticky top-0 z-10 shadow-sm">
                                            <tr>
                                                <th className="p-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap bg-slate-50">Date</th>
                                                {DOMAINS.map(d => <th key={d} className="p-3 px-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap bg-slate-50">{d}</th>)}
                                                <th className="p-3 px-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap bg-slate-50">Edit</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {student.assessments.map(a => (
                                                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="p-3 px-4 whitespace-nowrap">
                                                        <div className="font-bold text-slate-800">{a.date}</div>
                                                        <div className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wide bg-slate-100 inline-block px-2 py-0.5 rounded-md">{a.type}</div>
                                                    </td>
                                                    {DOMAINS.map(d => (
                                                        <td key={d} className="p-3 px-4 text-center text-sm font-semibold text-slate-700 whitespace-nowrap">
                                                            {a.scores[d] !== undefined && a.scores[d] !== null ? (
                                                                <span className={`px-2 py-1 rounded-lg ${a.scores[d] >= 80 ? 'bg-emerald-50 text-emerald-600' : a.scores[d] < 60 ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-600'}`}>
                                                                    {a.scores[d]}%
                                                                </span>
                                                            ) : '-'}
                                                        </td>
                                                    ))}
                                                    <td className="p-3 px-4 text-right whitespace-nowrap">
                                                        <button onClick={() => { setAssessmentToEdit(a); setIsAssessmentModalOpen(true); }} className="text-slate-400 hover:text-indigo-600 p-2 rounded-lg hover:bg-indigo-50 transition"><Icon name="settings" className="w-4 h-4"/></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Added: Teacher Comment Box directly in Analysis Tab */}
                            <Card className="p-6 mt-4 border-l-4 border-indigo-500 shadow-md bg-indigo-50/20">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                        <Icon name="chat" className="w-5 h-5 text-indigo-600" />
                                        Teacher Notes & Observations
                                    </h3>
                                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider bg-white px-2 py-1 rounded border border-slate-100">
                                        Auto-Saved
                                    </span>
                                </div>
                                <textarea 
                                    value={teacherComment} 
                                    onChange={(e) => setTeacherComment(e.target.value)} 
                                    placeholder="Record classroom observations, behavioral notes, or specific strategies here... These notes will also appear in the final report." 
                                    className="w-full p-4 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none min-h-[140px] text-sm bg-white shadow-sm transition-all" 
                                />
                            </Card>
                        </div>
                    )}
                    
                    {activeSection === 'Resources' && (
                        <div className="animate-in fade-in duration-500 space-y-10">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-6">Matches from Resource Bank</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {matchingBankResources.length > 0 ? matchingBankResources.map(r => <RecommendedResource key={r.id} resource={r} onSave={addResource} isSaved={true} />) : <p className="text-slate-500 italic p-4 bg-white rounded-2xl border border-dashed border-slate-200">No direct matches found in bank.</p>}
                                </div>
                            </div>
                            
                            <div className="pt-8 border-t border-slate-200">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-slate-900">AI Generated Suggestions</h3>
                                    <button onClick={handleGenerateResources} disabled={isLoadingResources} className="px-5 py-2.5 bg-purple-50 text-purple-700 font-bold rounded-xl hover:bg-purple-100 transition text-sm flex items-center gap-2 shadow-sm">
                                        {isLoadingResources ? 'Thinking...' : 'Generate New Ideas'} <Icon name="brain" className="w-4 h-4"/>
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {aiRecommendedResources.map(r => <RecommendedResource key={r.id} resource={r} onSave={addResource} isSaved={isResourceSaved(r.id)} />)}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'Report' && (
                        <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
                             <Card className="p-10 text-center shadow-xl">
                                <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-[2rem] mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-indigo-200 transform rotate-3">
                                    <Icon name="benchmark" className="w-12 h-12 text-white" />
                                </div>
                                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Progress Report</h2>
                                <p className="text-slate-500 mb-10 text-lg">Customize and export the official progress report.</p>
                                
                                <div className="text-left space-y-6 mb-10">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Teacher's Note (Preview)</label>
                                        <textarea value={teacherComment} onChange={(e) => setTeacherComment(e.target.value)} placeholder="Write a personal note to the parents..." className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none min-h-[140px] text-lg bg-slate-50" />
                                    </div>
                                    <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl text-amber-800 text-sm font-medium flex gap-3">
                                        <Icon name="brain" className="w-5 h-5 shrink-0" />
                                        <span>AI Insights from the Overview tab will be included automatically. Ensure you have generated them first.</span>
                                    </div>
                                </div>
                                <button onClick={() => { if(!reportCardInsight) handleGenerateAnalysis(); setIsReportModalOpen(true); }} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-indigo-600 transition shadow-xl active:scale-95">Preview & Print Report</button>
                            </Card>
                        </div>
                    )}
                </main>
            </div>

            <AddAssessmentModal isOpen={isAssessmentModalOpen} onClose={() => setIsAssessmentModalOpen(false)} onSave={handleSaveAssessment} assessmentToEdit={assessmentToEdit} />
            <StudentReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} student={student} insight={reportCardInsight} teacherComment={teacherComment} className={classProfile?.className} />
        </div>
    );
};
