
import React, { useState, useMemo } from 'react';
import { Card } from '../components/common/Card';
import { DomainPerformanceChart, RadarPerformanceChart, ProficiencyDistributionChart, SupportTierChart } from '../components/charts/Charts';
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
        <div className={`relative overflow-hidden p-8 rounded-[2.5rem] bg-gradient-to-br ${themes[theme]} text-white shadow-2xl transition-all duration-500 group`}>
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md border border-white/10">
                        <Icon name={icon} className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.25em] text-white/90">{title}</span>
                </div>
                <h3 className="text-5xl font-black tracking-tighter drop-shadow-md">{value}</h3>
                <div className="mt-8 flex items-end justify-between">
                    {subtext && <p className="text-xs font-black uppercase tracking-widest opacity-80">{subtext}</p>}
                </div>
            </div>
        </div>
    );
};

export const AnalyticsTab: React.FC = () => {
    const { students, classProfile } = useStudents();
    const { domains, benchmarks, subdomains: frameworkSubdomains } = useBenchmarks();
    const { navigateToStudent } = useNavigation();
    const [chartType, setChartType] = useState<'radar' | 'bar'>('radar');

    const hasData = useMemo(() => students.some(s => s.assessments.length > 0), [students]);

    const getStudentProficiency = (student: Student, subdomains: Record<string, SubdomainMetadata[]>) => {
        const latest = student.assessments[student.assessments.length - 1];
        if (!latest) return 0;
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

        const distribution = [
            { name: 'Outstanding (90%+)', count: 0, color: '#4f46e5', students: [] as string[] },
            { name: 'Excellent (80-89%)', count: 0, color: '#10b981', students: [] as string[] },
            { name: 'Proficient (60-79%)', count: 0, color: '#6366f1', students: [] as string[] },
            { name: 'Developing (<60%)', count: 0, color: '#f43f5e', students: [] as string[] }
        ];

        const tiers = [
            { name: 'Tier 1', value: 0, color: '#10b981', students: [] as string[] },
            { name: 'Tier 2', value: 0, color: '#f59e0b', students: [] as string[] },
            { name: 'Tier 3', value: 0, color: '#f43f5e', students: [] as string[] }
        ];

        let totalProficiency = 0;
        let studentsWithScores = 0;

        students.forEach(s => {
            const avg = getStudentProficiency(s, frameworkSubdomains);
            const latest = s.assessments[s.assessments.length - 1];
            if (latest) {
                totalProficiency += avg;
                studentsWithScores++;
                if (avg >= 90) distribution[0].count++;
                else if (avg >= 80) distribution[1].count++;
                else if (avg >= 60) distribution[2].count++;
                else distribution[3].count++;

                if (s.interventionStatus?.tier === 3) tiers[2].value++;
                else if (s.interventionStatus?.tier === 2) tiers[1].value++;
                else tiers[0].value++;
            }
        });

        return { 
            domainData, 
            distribution, 
            tiers, 
            classAvg: studentsWithScores > 0 ? Math.round(totalProficiency / studentsWithScores) : 0, 
            avgVelocity: Math.round(students.reduce((a, b) => a + b.growthVelocity, 0) / students.length),
            atRiskCount: students.filter(s => s.interventionStatus !== null).length,
            totalActions: students.reduce((acc, s) => acc + (s.actionLog?.length || 0), 0) 
        };
    }, [students, domains, benchmarks, classProfile, frameworkSubdomains]);

    return (
        <div className="p-6 md:p-10 space-y-10 max-w-[1600px] mx-auto pb-20">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Institutional Analytics</h1>

            {!hasData ? (
                 <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-xl">
                    <Icon name="analytics" className="w-20 h-20 text-indigo-500 mb-8" />
                    <h2 className="text-3xl font-black text-slate-900 mb-2">Awaiting Evidence</h2>
                    <p className="text-slate-400 font-medium mb-10">Record student assessments to see institutional trends.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <KPICard title="Institutional Growth" subtitle="" value={`+${analytics?.avgVelocity || 0}%`} icon="trendUp" theme="blue" />
                        <KPICard title="Operational Risk" subtitle="" value={analytics?.atRiskCount || 0} icon="alert" theme="rose" />
                        <KPICard title="Pedagogical Avg" subtitle="" value={`${analytics?.classAvg}%`} icon="analytics" theme="purple" />
                        <KPICard title="Evidence Points" subtitle="" value={analytics?.totalActions || 0} icon="chat" theme="orange" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <Card className="p-8 shadow-xl bg-white lg:col-span-1">
                            <h3 className="font-black text-slate-800 mb-8">Proficiency Spread</h3>
                            <div className="h-64"><ProficiencyDistributionChart data={analytics?.distribution || []} /></div>
                        </Card>

                        <Card className="p-8 shadow-xl bg-white lg:col-span-2">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="font-black text-slate-800">Domain Mapping</h3>
                                <div className="flex bg-slate-100 p-1 rounded-xl">
                                    <button onClick={() => setChartType('radar')} className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-lg ${chartType === 'radar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Radar</button>
                                    <button onClick={() => setChartType('bar')} className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-lg ${chartType === 'bar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Bar</button>
                                </div>
                            </div>
                            <div className="h-80">
                                {chartType === 'radar' ? <RadarPerformanceChart data={analytics?.domainData || []} /> : <DomainPerformanceChart data={analytics?.domainData || []} />}
                            </div>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
};
