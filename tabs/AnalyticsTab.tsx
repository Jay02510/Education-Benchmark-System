import React, { useState, useMemo } from 'react';
import { Card } from '../components/common/Card';
import { DomainPerformanceChart, RadarPerformanceChart, ProficiencyDistributionChart, SupportTierChart } from '../components/charts/Charts';
import { GeminiService } from '../services/geminiService';
import { Icon } from '../components/common/Icon';
import { useStudents } from '../context/StudentContext';
import { useBenchmarks } from '../context/BenchmarkContext';
import { useNavigation } from '../context/NavigationContext';
import { Domain, TestPeriod, SubdomainMetadata, Student } from '../types';

const KPICard: React.FC<{ 
    title: string; 
    subtitle: string; 
    value: string | number; 
    icon: string; 
    trend?: 'up' | 'down' | 'neutral'; 
    subtext?: string; 
    theme: 'blue' | 'purple' | 'orange' | 'rose' 
}> = ({ title, subtitle, value, icon, trend, subtext, theme }) => {
    const themes = {
        blue: 'from-blue-600 to-indigo-700 shadow-blue-200/50',
        purple: 'from-indigo-600 to-violet-800 shadow-indigo-200/50',
        orange: 'from-amber-500 to-orange-600 shadow-orange-200/50',
        rose: 'from-rose-500 to-red-700 shadow-rose-200/50',
    };

    return (
        <div className={`relative overflow-hidden p-8 rounded-[2.5rem] bg-gradient-to-br ${themes[theme]} text-white shadow-2xl hover:-translate-y-3 transition-all duration-500 group`}>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-1000">
                <Icon name={icon} className="w-40 h-40 transform translate-x-12 -translate-y-12 rotate-12" />
            </div>
            
            <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                    <div className="flex flex-col gap-0.5 mb-6">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md border border-white/10">
                                <Icon name={icon} className="w-5 h-5" />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-white/90">{title}</span>
                        </div>
                    </div>
                    <h3 className="text-5xl font-black tracking-tighter drop-shadow-md group-hover:tracking-normal transition-all duration-700">{value}</h3>
                </div>
                <div className="mt-8 flex items-end justify-between">
                    {subtext && <p className="text-xs font-black uppercase tracking-widest opacity-80 leading-tight">{subtext}</p>}
                    {trend && (
                         <div className="flex items-center text-[10px] font-black uppercase bg-white/25 px-3 py-2 rounded-xl backdrop-blur-md border border-white/10 tracking-widest group-hover:bg-white/40 transition-colors">
                            <Icon name={trend === 'up' ? 'trendUp' : trend === 'down' ? 'trendDown' : 'trendStable'} className="w-3 h-3 mr-2" />
                            <span>{trend === 'up' ? 'Growing' : trend === 'down' ? 'Focus' : 'Stable'}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const StudentBracketList: React.FC<{ title: string; students: string[]; color: string }> = ({ title, students, color }) => (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
            <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: color }}></div>
            <h4 className="font-black text-slate-800 text-sm">{title}</h4>
            <span className="ml-auto text-xs font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg">{students.length}</span>
        </div>
        <div className="flex flex-wrap gap-2">
            {students.length > 0 ? students.map((name, i) => (
                <span key={i} className="text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-xl">
                    {name}
                </span>
            )) : <span className="text-[10px] text-slate-300 italic">No students in this bracket</span>}
        </div>
    </div>
);

export const AnalyticsTab: React.FC = () => {
    const { students, classProfile } = useStudents();
    const { domains, benchmarks, subdomains: frameworkSubdomains } = useBenchmarks();
    const { navigateToStudent } = useNavigation();
    
    const [chartType, setChartType] = useState<'radar' | 'bar'>('radar');
    const [executiveBriefing, setExecutiveBriefing] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);

    const hasData = useMemo(() => students.some(s => s.assessments.length > 0), [students]);

    const getStudentProficiency = (student: Student, subdomains: Record<string, SubdomainMetadata[]>) => {
        const latest = student.assessments[student.assessments.length - 1];
        if (!latest) return 0;
        
        const domainPercentages: number[] = [];
        Object.entries(subdomains).forEach(([domain, subs]) => {
            let earned = 0, possible = 0, hasData = false;
            subs.forEach(s => {
                const val = latest.subdomainScores?.[`${domain}:${s.name}`];
                if (typeof val === 'number') { earned += val; possible += s.maxScore; hasData = true; }
            });
            if (hasData && possible > 0) domainPercentages.push((earned / possible) * 100);
        });

        if (domainPercentages.length > 0) return Math.round(domainPercentages.reduce((a: number, b: number) => a + b, 0) / domainPercentages.length);
        const fallback = Object.values(latest.scores).filter(s => typeof s === 'number' && s > 0) as number[];
        return fallback.length ? Math.round(fallback.reduce((a, b) => a + b, 0) / fallback.length) : 0;
    };

    const analytics = useMemo(() => {
        if (students.length === 0) return null;

        const levelToUse = classProfile?.gradeLevel || '5';
        const period = TestPeriod.Baseline;

        const domainData = domains.map(domain => {
            const bench = benchmarks.find(b => b.domain === domain && b.period === period && b.level_name === levelToUse);
            let total = 0, count = 0;
            students.forEach(s => {
                const latest = s.assessments[s.assessments.length - 1];
                if (latest?.scores[domain as Domain] !== undefined && latest?.scores[domain as Domain] > 0) {
                    total += latest.scores[domain as Domain];
                    count++;
                }
            });
            return { 
                domain: domain as Domain, 
                score: count > 0 ? Math.round(total / count) : 0, 
                target: bench?.target_percent || 70 
            };
        });

        const sortedDomainPerformance = [...domainData].sort((a,b) => b.score - a.score);

        const distribution = [
            { name: 'Outstanding (90%+)', count: 0, color: '#4f46e5', students: [] as string[] },
            { name: 'Excellent (80-89%)', count: 0, color: '#10b981', students: [] as string[] },
            { name: 'Proficient (60-79%)', count: 0, color: '#6366f1', students: [] as string[] },
            { name: 'Developing (<60%)', count: 0, color: '#f43f5e', students: [] as string[] }
        ];

        const tiers = [
            { name: 'Tier 1 (Universal)', value: 0, color: '#10b981', students: [] as string[] },
            { name: 'Tier 2 (Targeted)', value: 0, color: '#f59e0b', students: [] as string[] },
            { name: 'Tier 3 (Intensive)', value: 0, color: '#f43f5e', students: [] as string[] }
        ];

        let totalProficiency = 0;
        let studentsWithScores = 0;

        students.forEach(s => {
            const avg = getStudentProficiency(s, frameworkSubdomains);
            const latest = s.assessments[s.assessments.length - 1];
            
            if (latest) {
                totalProficiency += avg;
                studentsWithScores++;

                if (avg >= 90) { distribution[0].count++; distribution[0].students.push(s.name); }
                else if (avg >= 80) { distribution[1].count++; distribution[1].students.push(s.name); }
                else if (avg >= 60) { distribution[2].count++; distribution[2].students.push(s.name); }
                else { distribution[3].count++; distribution[3].students.push(s.name); }

                if (s.interventionStatus?.tier === 3) { tiers[2].value++; tiers[2].students.push(s.name); }
                else if (s.interventionStatus?.tier === 2) { tiers[1].value++; tiers[1].students.push(s.name); }
                else { tiers[0].value++; tiers[0].students.push(s.name); }
            } else {
                tiers[0].value++;
                tiers[0].students.push(s.name);
            }
        });

        const classAvg = studentsWithScores > 0 ? Math.round(totalProficiency / studentsWithScores) : 0;
        const avgVelocity = Math.round(students.reduce((a, b) => a + b.growthVelocity, 0) / students.length);
        const atRiskCount = students.filter(s => s.interventionStatus !== null).length;

        return { 
            domainData, 
            distribution, 
            tiers, 
            classAvg, 
            avgVelocity, 
            atRiskCount,
            strongest: sortedDomainPerformance[0]?.domain,
            weakest: sortedDomainPerformance[sortedDomainPerformance.length - 1]?.domain,
            totalActions: students.reduce((acc, s) => acc + (s.actionLog?.length || 0), 0) 
        };
    }, [students, domains, benchmarks, classProfile, frameworkSubdomains]);

    const handleGenerateBriefing = async () => {
        if (!analytics || !hasData) return;
        setIsGenerating(true);
        try {
            const briefing = await GeminiService.generateClassInsight(
                classProfile?.gradeLevel || '5',
                students.length,
                { 
                    classAvg: analytics.classAvg, 
                    avgVelocity: analytics.avgVelocity, 
                    interventionCount: analytics.atRiskCount,
                    strongest: analytics.strongest,
                    weakest: analytics.weakest
                }
            );
            setExecutiveBriefing(briefing);
        } catch (e: any) { 
            setExecutiveBriefing(`Briefing generation failed. ${e.message}`); 
        } finally { 
            setIsGenerating(false); 
        }
    };

    return (
        <div className="p-6 md:p-10 space-y-10 max-w-[1600px] mx-auto pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Class Analytics Core</h1>
                    <p className="text-slate-500 font-medium italic mt-1">Deep institutional data and AI diagnostics for {classProfile?.className}</p>
                </div>
            </div>

            {!hasData ? (
                 <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                    <div className="p-8 bg-indigo-50 rounded-[2.5rem] mb-8 text-indigo-500">
                        <Icon name="analytics" className="w-20 h-20" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">Awaiting Evidence</h2>
                    <p className="text-slate-400 font-medium text-center max-w-md mb-10 leading-relaxed px-6">We need at least one completed assessment cycle to calculate class benchmarks and generate briefings.</p>
                    <button onClick={() => navigateToStudent(students[0]?.id || '')} className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition active:scale-95 flex items-center gap-3">
                         <Icon name="plus" className="w-5 h-5" />
                         Record First Score
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <KPICard title="Institutional Growth" subtitle="Learning Acceleration" value={`+${analytics?.avgVelocity || 0}%`} icon="trendUp" trend="up" subtext="Class Velocity" theme="blue" />
                        <KPICard title="Operational Risk" subtitle="High-Need Students" value={analytics?.atRiskCount || 0} icon="alert" trend="down" subtext="Requires Action" theme="rose" />
                        <KPICard title="Pedagogical Avg" subtitle="Overall Proficiency" value={`${analytics?.classAvg}%`} icon="analytics" subtext="Class Standard" theme="purple" />
                        <KPICard title="Evidence Points" subtitle="Total Logs Recorded" value={analytics?.totalActions || 0} icon="chat" subtext="Actionable Insights" theme="orange" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <Card variant="default" className="p-8 shadow-xl bg-white flex flex-col h-full lg:col-span-1">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><Icon name="trendUp" className="w-5 h-5" /></div>
                                <div><h3 className="font-black text-slate-800">Proficiency Spread</h3><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bracket Breakdown</p></div>
                            </div>
                            <div className="flex-1 min-h-[280px]">
                                <ProficiencyDistributionChart data={analytics?.distribution || []} />
                            </div>
                        </Card>

                        <Card variant="glass" className="p-8 shadow-xl flex flex-col h-full lg:col-span-2">
                             <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl"><Icon name="benchmark" className="w-5 h-5" /></div>
                                    <div><h3 className="font-black text-slate-800">Domain Mapping</h3><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Performance vs Targets</p></div>
                                </div>
                                <div className="flex bg-slate-100 p-1 rounded-xl">
                                    <button onClick={() => setChartType('radar')} className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${chartType === 'radar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Radar</button>
                                    <button onClick={() => setChartType('bar')} className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${chartType === 'bar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Bar</button>
                                </div>
                            </div>
                            <div className="flex-1 min-h-[350px]">
                                {chartType === 'radar' ? <RadarPerformanceChart data={analytics?.domainData || []} /> : <DomainPerformanceChart data={analytics?.domainData || []} />}
                            </div>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {analytics?.distribution.map((bracket, i) => (
                            <StudentBracketList key={i} title={bracket.name} students={bracket.students} color={bracket.color} />
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                         <Card variant="default" className="p-8 shadow-xl bg-white flex flex-col h-full lg:col-span-1">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl"><Icon name="shield" className="w-5 h-5" /></div>
                                <div><h3 className="font-black text-slate-800">Support Tiers</h3><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Intervention Mix</p></div>
                            </div>
                            <div className="flex-1 min-h-[280px]">
                                <SupportTierChart data={analytics?.tiers || []} />
                            </div>
                        </Card>

                        <Card variant="paper" className="lg:col-span-3 p-12 border-t-[10px] border-indigo-600 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50 rounded-full blur-[100px] -z-0 opacity-40 group-hover:opacity-60 transition-opacity"></div>
                            
                            <div className="relative z-10">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                                    <div className="flex items-center gap-5">
                                        <div className="p-4 bg-indigo-600 rounded-[1.8rem] text-white shadow-xl shadow-indigo-200"><Icon name="robot" className="w-8 h-8" /></div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Institutional Performance Briefing</h3>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mt-1">AI-Grounded Strategic Summary</p>
                                        </div>
                                    </div>
                                    <button onClick={handleGenerateBriefing} disabled={isGenerating} className="px-8 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-600 transition-all flex items-center gap-3 shadow-xl disabled:opacity-50 active:scale-95">
                                        <Icon name="refresh" className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                                        {isGenerating ? 'Analyzing Class Health...' : 'Recalculate Briefing'}
                                    </button>
                                </div>

                                {executiveBriefing ? (
                                    <div className="prose prose-slate max-w-none animate-in fade-in slide-in-from-bottom-6 duration-700">
                                        <div className="space-y-6">
                                            {executiveBriefing.split('\n').map((p, i) => {
                                                const trimmed = p.trim();
                                                const isHeader = trimmed.startsWith('##') || (trimmed.startsWith('**') && trimmed.endsWith('**'));
                                                return (
                                                    <p key={i} className={`${isHeader ? 'text-indigo-900 font-black text-xl border-l-4 border-indigo-200 pl-4 py-1' : 'text-slate-700 text-lg leading-relaxed'}`}>
                                                        {trimmed.replace(/#/g, '').replace(/\*\*/g, '')}
                                                    </p>
                                                );
                                            })}
                                        </div>
                                        <div className="mt-12 pt-8 border-t border-slate-200 flex justify-between items-center italic text-slate-400 text-xs">
                                            <span>Institutional Compliance Verified</span>
                                            <span>Updated {new Date().toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-24 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                                        <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-slate-300 mb-6 shadow-sm ring-1 ring-black/5"><Icon name="robot" className="w-10 h-10" /></div>
                                        <h4 className="text-xl font-black text-slate-900 mb-2">Generate Strategic Insight?</h4>
                                        <p className="text-sm text-slate-400 mb-10 max-w-md text-center font-medium px-4">Our AI co-pilot will analyze student assessments, distribution patterns, and support tiers to write a briefing for your leadership team.</p>
                                        <button onClick={handleGenerateBriefing} className="px-12 py-5 bg-white border border-slate-200 rounded-[1.8rem] font-black text-sm text-indigo-600 shadow-xl hover:shadow-2xl hover:bg-indigo-50 transition-all active:scale-95 flex items-center gap-3">
                                            <Icon name="brain" className="w-5 h-5" />
                                            Compile Briefing Now
                                        </button>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
};