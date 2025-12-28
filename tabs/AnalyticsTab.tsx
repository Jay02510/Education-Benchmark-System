
import React, { useState, useMemo } from 'react';
import { Card } from '../components/common/Card';
import { DomainPerformanceChart, RadarPerformanceChart } from '../components/charts/Charts';
import { GeminiService } from '../services/geminiService';
import { Icon } from '../components/common/Icon';
import { useStudents } from '../context/StudentContext';
import { useBenchmarks } from '../context/BenchmarkContext';
import { useNavigation } from '../context/NavigationContext';
import { Domain, Student, Resource, ResourceType, TestPeriod } from '../types';
import { ResourceBankTab } from './ResourceBankTab'; 
import { AtRiskDetailsModal } from '../components/students/AtRiskDetailsModal';

// Vibrant KPI Card with Glassmorphism
const KPICard: React.FC<{ 
    title: string; 
    value: string | number; 
    icon: string; 
    trend?: 'up' | 'down' | 'neutral'; 
    subtext?: string; 
    theme: 'blue' | 'purple' | 'orange' | 'rose' 
}> = ({ title, value, icon, trend, subtext, theme }) => {
    
    const themes = {
        blue: 'from-cyan-500 to-blue-600 shadow-blue-200',
        purple: 'from-fuchsia-500 to-indigo-600 shadow-indigo-200',
        orange: 'from-amber-400 to-orange-500 shadow-orange-200',
        rose: 'from-rose-400 to-red-500 shadow-rose-200',
    };

    return (
        <div className={`relative overflow-hidden p-8 rounded-[2rem] bg-gradient-to-br ${themes[theme]} text-white shadow-xl hover:-translate-y-2 transition-transform duration-300 print:shadow-none print:bg-none print:bg-white print:text-black print:border print:border-gray-200`}>
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 p-4 opacity-10 print:hidden">
                <Icon name={icon} className="w-32 h-32 transform translate-x-8 -translate-y-8 rotate-12" />
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-6 opacity-90 print:mb-2">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm shadow-inner print:hidden">
                            <Icon name={icon} className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-widest print:text-gray-600">{title}</span>
                    </div>
                    <h3 className="text-5xl font-extrabold tracking-tight drop-shadow-sm print:text-4xl print:text-black">{value}</h3>
                </div>
                
                <div className="mt-6 flex items-end justify-between print:mt-2">
                    {subtext && <p className="text-base font-medium opacity-90 print:text-gray-500">{subtext}</p>}
                    {trend && (
                         <div className="flex items-center text-sm font-bold bg-white/25 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/10 print:hidden">
                            <Icon name={trend === 'up' ? 'trendUp' : trend === 'down' ? 'trendDown' : 'trendStable'} className="w-4 h-4 mr-2" />
                            <span>{trend === 'up' ? 'Trending Up' : trend === 'down' ? 'Needs Focus' : 'Stable'}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const AtRiskRow: React.FC<{ student: Student, domainCount: number, onClick: () => void }> = ({ student, domainCount, onClick }) => {
    const reason = student.interventionStatus?.triggerReason || "Performance Flag";
    const tier = student.interventionStatus?.tier || 1;

    return (
        <div 
            onClick={onClick}
            className="group flex items-center justify-between p-5 rounded-2xl hover:bg-rose-50/50 transition-all cursor-pointer border border-transparent hover:border-rose-100 print:border-b print:border-gray-200 print:rounded-none"
        >
            <div className="flex items-center space-x-4">
                <div className="relative print:hidden">
                    <img src={student.photoUrl} alt={student.name} className="w-14 h-14 rounded-full object-cover border-4 border-white shadow-md group-hover:scale-105 transition-transform" />
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${tier === 3 ? 'bg-rose-500' : 'bg-amber-400'}`}>
                         <span className="text-[10px] text-white font-black">{tier}</span>
                    </div>
                </div>
                <div>
                    <p className="font-bold text-slate-800 text-base group-hover:text-rose-600 transition-colors">{student.name}</p>
                    <p className="text-xs text-rose-500 font-bold bg-rose-50 px-2 py-0.5 rounded-md inline-block mt-1 print:text-black print:bg-transparent print:p-0">{reason} (Tier {tier})</p>
                </div>
            </div>
            <div className="text-right print:hidden">
                 <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center group-hover:bg-rose-500 group-hover:border-rose-500 transition-all shadow-sm">
                     <Icon name="arrowRight" className="w-5 h-5 text-slate-300 group-hover:text-white" />
                 </div>
            </div>
        </div>
    );
};

export const AnalyticsTab: React.FC = () => {
    const { students, classProfile } = useStudents();
    const { domains, benchmarks } = useBenchmarks();
    const { navigateToStudent } = useNavigation();
    
    const [viewMode, setViewMode] = useState<'Analytics' | 'Resources'>('Analytics');
    const [selectedPeriod, setSelectedPeriod] = useState<TestPeriod | 'Latest'>('Latest');
    const [classInsight, setClassInsight] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [chartType, setChartType] = useState<'bar' | 'radar'>('bar');
    const [isAtRiskModalOpen, setIsAtRiskModalOpen] = useState(false);

    // Re-calculate stats whenever students or filter changes (Real-time)
    const stats = useMemo(() => {
        if (students.length === 0) return null;

        const domainSums: Record<string, number> = {};
        const domainCounts: Record<string, number> = {};
        let totalStudentsWithData = 0;
        let globalSum = 0;
        let globalCount = 0;

        domains.forEach(d => { domainSums[d] = 0; domainCounts[d] = 0; });

        students.forEach(s => {
            let assessmentToUse;
            
            if (selectedPeriod === 'Latest') {
                if (s.assessments.length > 0) {
                    const sorted = [...s.assessments].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    assessmentToUse = sorted[sorted.length - 1];
                }
            } else {
                assessmentToUse = s.assessments.find(a => a.type === selectedPeriod);
            }

            if (assessmentToUse) {
                totalStudentsWithData++;
                domains.forEach(d => {
                    const score = assessmentToUse?.scores[d as Domain];
                    if (score !== undefined && score !== null) { // Include 0 scores
                        domainSums[d] += score;
                        domainCounts[d]++;
                        globalSum += score;
                        globalCount++;
                    }
                });
            }
        });

        const domainAverages = domains.map(d => {
            const targetPeriod = selectedPeriod === 'Latest' ? TestPeriod.Baseline : selectedPeriod;
            const benchmark = benchmarks.find(b => 
                b.domain === d && 
                b.level_name === (classProfile?.gradeLevel || '5') &&
                b.period === targetPeriod
            );
            return {
                domain: d as Domain,
                score: domainCounts[d] > 0 ? Math.round(domainSums[d] / domainCounts[d]) : 0,
                target: benchmark?.target_percent || 75,
            };
        });

        const sortedDomains = [...domainAverages].sort((a, b) => a.score - b.score);
        const weakest = sortedDomains[0];
        const strongest = sortedDomains[sortedDomains.length - 1];
        const classAverage = globalCount > 0 ? Math.round(globalSum / globalCount) : 0;
        const atRisk = students.filter(s => s.interventionStatus !== null);

        return { domainAverages, classAverage, weakest, strongest, atRisk, totalStudents: students.length, reportingCount: totalStudentsWithData };
    }, [students, domains, selectedPeriod, benchmarks, classProfile]);

    const handleGenerateAnalysis = async () => {
        if (!stats) return;
        setIsGenerating(true);
        try {
            const result = await GeminiService.generateClassInsight(
                classProfile?.gradeLevel || 'Level 5',
                stats.totalStudents,
                stats.weakest.domain,
                stats.strongest.domain,
                stats.atRisk.length
            );
            setClassInsight(result);
        } catch (e) {
            setClassInsight('Could not generate insight.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="p-6 md:p-10 h-full print:p-0 print:overflow-visible">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 print:mb-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2 print:text-2xl">Class Analytics</h1>
                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                         <span className="bg-white px-3 py-1 rounded-full text-sm shadow-sm border border-slate-100 font-bold print:border-gray-400">{classProfile?.gradeLevel}</span>
                         <span>•</span>
                         <span>{classProfile?.academicYear || 'Current Year'}</span>
                         <span className="ml-2 flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Live Data
                         </span>
                    </div>
                </div>
                
                {/* Print Header - Only Visible on Print */}
                <div className="hidden print:block">
                     <p className="text-sm text-gray-500 text-right">Report Generated: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 print:hidden">
                    <button 
                        onClick={() => setViewMode('Analytics')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${viewMode === 'Analytics' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        Overview
                    </button>
                    <button 
                         onClick={() => setViewMode('Resources')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${viewMode === 'Resources' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        Resource Bank
                    </button>
                </div>
            </div>

            {viewMode === 'Resources' ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <ResourceBankTab />
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 print:pb-0">
                     {!stats || stats.reportingCount === 0 ? (
                        <div className="flex items-center justify-center h-96">
                            <div className="text-center p-12 bg-white rounded-[2.5rem] shadow-xl border border-slate-50 max-w-md">
                                <div className="bg-indigo-50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                                    <Icon name="analytics" className="w-10 h-10 text-indigo-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">No Data Available</h3>
                                <p className="text-slate-500 mb-8">Start by adding assessment data for your students to generate insights.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Filter Bar */}
                            <div className="flex justify-between items-center mb-6 print:hidden">
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                                     {(['Latest', ...Object.values(TestPeriod)] as const).map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setSelectedPeriod(p)}
                                            className={`px-6 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all border ${selectedPeriod === p ? 'bg-white border-indigo-200 text-indigo-600 shadow-md' : 'bg-transparent border-transparent text-slate-400 hover:bg-white/50 hover:text-slate-600'}`}
                                        >
                                            {p}
                                        </button>
                                     ))}
                                </div>
                                <button onClick={() => window.print()} className="px-4 py-2 text-slate-500 hover:text-indigo-600 font-bold flex items-center gap-2">
                                    <Icon name="check" className="w-4 h-4"/> Print Report
                                </button>
                            </div>

                            {/* KPI Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 print:grid-cols-3 print:gap-4 print:mb-6">
                                <KPICard 
                                    title="Class Average" 
                                    value={`${stats.classAverage}%`} 
                                    icon="analytics"
                                    trend={stats.classAverage > 70 ? 'up' : 'neutral'}
                                    theme="blue"
                                />
                                <KPICard 
                                    title="Intervention Needed" 
                                    value={stats.atRisk.length} 
                                    icon="alert"
                                    trend={stats.atRisk.length > 0 ? 'down' : 'up'}
                                    subtext="Active Alerts"
                                    theme="rose"
                                />
                                <KPICard 
                                    title="Top Skill" 
                                    value={stats.strongest.domain} 
                                    icon="brain"
                                    subtext={`Avg Score: ${stats.strongest.score}%`}
                                    theme="purple"
                                />
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10 print:grid-cols-1 print:block">
                                {/* Main Chart Area */}
                                <Card className="xl:col-span-2 p-8 shadow-lg print:shadow-none print:border print:mb-6 print:break-inside-avoid">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">Performance Matrix</h3>
                                            <p className="text-sm text-slate-500 font-medium mt-1">Class averages vs Grade {classProfile?.gradeLevel} Benchmarks</p>
                                        </div>
                                        <div className="flex bg-slate-50 p-1.5 rounded-xl print:hidden">
                                            <button 
                                                onClick={() => setChartType('bar')}
                                                className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${chartType === 'bar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                Bar Chart
                                            </button>
                                            <button 
                                                onClick={() => setChartType('radar')}
                                                className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${chartType === 'radar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                Radar
                                            </button>
                                        </div>
                                    </div>
                                    <div className="h-[400px]">
                                        {chartType === 'bar' ? (
                                            <DomainPerformanceChart data={stats.domainAverages} />
                                        ) : (
                                            <RadarPerformanceChart data={stats.domainAverages} />
                                        )}
                                    </div>
                                </Card>

                                {/* Intervention List */}
                                <Card className="xl:col-span-1 p-0 overflow-hidden flex flex-col h-full bg-white shadow-lg border-0 print:shadow-none print:border print:break-inside-avoid">
                                    <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10 print:static">
                                        <h3 className="text-xl font-bold text-slate-900">At-Risk Students</h3>
                                        <span className="bg-rose-50 text-rose-600 text-xs font-bold px-3 py-1 rounded-full print:border print:border-rose-200">
                                            {stats.atRisk.length} Alerts
                                        </span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[400px] scrollbar-thin scrollbar-thumb-slate-200 print:overflow-visible print:max-h-none">
                                        {stats.atRisk.length > 0 ? (
                                            stats.atRisk.map(student => (
                                                <AtRiskRow 
                                                    key={student.id} 
                                                    student={student} 
                                                    domainCount={domains.length} 
                                                    onClick={() => navigateToStudent(student.id)}
                                                />
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-center py-12 text-slate-400">
                                                <div className="bg-emerald-50 p-6 rounded-full mb-4 print:hidden">
                                                    <Icon name="check" className="w-8 h-8 text-emerald-500" />
                                                </div>
                                                <p className="font-bold text-slate-700 text-lg">All Clear</p>
                                                <p className="text-sm mt-1 text-slate-400">No students flagged for intervention.</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 border-t border-slate-50 bg-slate-50/50 print:hidden">
                                        <button 
                                            onClick={() => setIsAtRiskModalOpen(true)}
                                            className="w-full py-4 text-sm font-bold text-rose-600 bg-white border border-rose-100 rounded-2xl hover:bg-rose-50 transition-colors shadow-sm"
                                        >
                                            View Full Report
                                        </button>
                                    </div>
                                </Card>
                            </div>

                            {/* AI Strategy Section */}
                            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-200/50 ring-1 ring-black/5 bg-slate-900 print:shadow-none print:bg-white print:text-black print:border print:border-gray-300 print:rounded-xl print:break-inside-avoid">
                                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-90 print:hidden"></div>
                                {/* Abstract Shapes */}
                                <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl print:hidden"></div>
                                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-900/30 rounded-full blur-3xl print:hidden"></div>
                                
                                <div className="relative p-10 md:p-14 flex flex-col gap-8 print:p-6">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className="p-5 bg-white/20 rounded-3xl backdrop-blur-md shadow-inner print:hidden">
                                                <Icon name="brain" className="w-10 h-10 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-3xl font-extrabold text-white mb-2 print:text-black print:text-xl">AI Strategic Advisor</h2>
                                                <p className="text-indigo-100 font-medium text-lg print:text-gray-600 print:text-sm">
                                                    Pedagogical insights based on {selectedPeriod} metrics.
                                                </p>
                                            </div>
                                        </div>
                                        {!classInsight && (
                                            <button 
                                                onClick={handleGenerateAnalysis}
                                                disabled={isGenerating}
                                                className="px-10 py-5 bg-white text-indigo-600 rounded-2xl font-bold hover:bg-indigo-50 transition shadow-xl disabled:opacity-70 active:scale-95 flex items-center justify-center gap-3 text-lg print:hidden"
                                            >
                                                {isGenerating ? <div className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full"/> : <Icon name="brain" className="w-6 h-6"/>}
                                                {isGenerating ? 'Analyzing...' : 'Generate Strategy'}
                                            </button>
                                        )}
                                    </div>
                                    
                                    {classInsight && (
                                        <div className="bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-6 print:shadow-none print:p-0 print:bg-transparent">
                                             <div className="prose prose-lg prose-indigo max-w-none print:prose-sm">
                                                {classInsight.split('\n').map((paragraph, index) => (
                                                    <div key={index} className="mb-8 last:mb-0 print:mb-4">
                                                        {paragraph.split('**').map((part, i) => {
                                                            if (i % 2 === 1) {
                                                                return <h4 key={i} className="text-indigo-900 font-extrabold text-2xl mb-4 flex items-center gap-3 print:text-black print:text-lg">
                                                                    <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)] print:hidden"></span>
                                                                    {part}
                                                                </h4>
                                                            }
                                                            return <p key={i} className="text-slate-600 leading-relaxed ml-5 text-xl font-medium print:ml-0 print:text-gray-800 print:text-base">{part}</p>
                                                        })}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-10 flex justify-end pt-8 border-t border-slate-100 print:hidden">
                                                 <button 
                                                    onClick={handleGenerateAnalysis}
                                                    className="text-sm text-indigo-500 hover:text-indigo-700 font-bold flex items-center gap-2 transition-colors uppercase tracking-widest"
                                                >
                                                    <Icon name="brain" className="w-4 h-4" />
                                                    Regenerate Analysis
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
            
            <AtRiskDetailsModal 
                isOpen={isAtRiskModalOpen} 
                onClose={() => setIsAtRiskModalOpen(false)} 
                atRiskStudents={stats?.atRisk || []}
                domainCount={domains.length}
            />
        </div>
    );
};
