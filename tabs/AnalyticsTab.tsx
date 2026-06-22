import React, { useState, useMemo } from 'react';
import { Card } from '../components/common/Card';
import { DomainPerformanceChart, RadarPerformanceChart, ProficiencyDistributionChart, SupportTierChart } from '../components/charts/Charts';
import { Icon } from '../components/common/Icon';
import { useStudents } from '../context/StudentContext';
import { useBenchmarks } from '../context/BenchmarkContext';
import { Domain, TestPeriod, SubdomainMetadata, Student } from '../types';

const KPICard: React.FC<{ 
    title: string; 
    subtitle: string; 
    value: string | number; 
    icon: string; 
    theme: 'blue' | 'purple' | 'orange' | 'rose' 
}> = ({ title, value, icon, theme }) => {
    const colors = {
        blue: 'text-[oklch(0.72_0.18_145)]',
        purple: 'text-zinc-100',
        orange: 'text-amber-500',
        rose: 'text-rose-455',
    };

    return (
        <div className="relative overflow-hidden p-6 rounded-[4px] bg-zinc-950 border border-zinc-900 text-white shadow-lg transition-all duration-300">
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4 select-none">
                    <div className="p-1.5 bg-zinc-900 border border-zinc-850 rounded-[4px]">
                        <Icon name={icon} className="w-4 h-4 text-zinc-400" />
                    </div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500">{title}</span>
                </div>
                <h3 className={`text-3xl font-medium tracking-tight ${colors[theme]}`}>{value}</h3>
            </div>
        </div>
    );
};

export const AnalyticsTab: React.FC = () => {
    const { students, classProfile } = useStudents();
    const { domains, benchmarks, subdomains: frameworkSubdomains } = useBenchmarks();
    const [chartType, setChartType] = useState<'radar' | 'bar'>('radar');

    const hasData = useMemo(() => students.some(s => s.assessments.length > 0), [students]);

    const getStudentProficiency = (student: Student, _subdomains: Record<string, SubdomainMetadata[]>) => {
        const latest = student.assessments[student.assessments.length - 1];
        if (!latest) return 0;
        const fallback = Object.values(latest.scores).filter(s => typeof s === 'number' && s > 0) as number[];
        return fallback.length ? Math.round(fallback.reduce((a, b) => a + b, 0) / fallback.length) : 0;
    };

    const analytics = useMemo(() => {
        if (students.length === 0) return null;

        // Group into CEFR distribution slices
        const distribution = [
            { name: 'Level 5 (Pre-A1)', count: 0 },
            { name: 'Level 6 (Starters)', count: 0 },
            { name: 'Level 7 (Movers/Flyers)', count: 0 }
        ];

        let totalProficiency = 0;
        let studentsWithScores = 0;

        students.forEach(student => {
            const prof = getStudentProficiency(student, frameworkSubdomains);
            if (prof > 0) {
                totalProficiency += prof;
                studentsWithScores++;
            }

            if (student.level === '5') {
                distribution[0].count++;
            } else if (student.level.startsWith('6')) {
                distribution[1].count++;
            } else if (student.level.startsWith('7')) {
                distribution[2].count++;
            }
        });

        // Compute average score per domain
        const domainData = domains.map(d => {
            let sum = 0;
            let count = 0;
            students.forEach(s => {
                const latest = s.assessments[s.assessments.length - 1];
                if (latest && latest.scores[d] !== undefined) {
                    sum += latest.scores[d] ?? 0;
                    count++;
                }
            });
            return {
                subject: d,
                Score: count > 0 ? Math.round(sum / count) : 0,
                fullMark: 100
            };
        });

        // Compute support tier groups
        const tiers = [
            { name: 'Tier 1 (Core)', value: students.filter(s => !s.interventionStatus).length },
            { name: 'Tier 2 (Group)', value: students.filter(s => s.interventionStatus === 'Level 2').length },
            { name: 'Tier 3 (Intense)', value: students.filter(s => s.interventionStatus === 'Level 3').length }
        ];

        return {
            distribution,
            domainData,
            tiers, 
            classAvg: studentsWithScores > 0 ? Math.round(totalProficiency / studentsWithScores) : 0, 
            avgVelocity: Math.round(students.reduce((a, b) => a + b.growthVelocity, 0) / students.length),
            atRiskCount: students.filter(s => s.interventionStatus !== null).length,
            totalActions: students.reduce((acc, s) => acc + (s.actionLog?.length || 0), 0) 
        };
    }, [students, domains, benchmarks, classProfile, frameworkSubdomains]);

    return (
        <div className="p-6 md:p-12 space-y-8 max-w-[1600px] mx-auto pb-20 font-sans">
            <div className="flex items-center gap-4 border-b border-zinc-900 pb-6 select-none">
                <div className="w-10 h-10 bg-zinc-900 border border-zinc-850 text-[oklch(0.72_0.18_145)] flex items-center justify-center rounded-[4px]">
                    <Icon name="analytics" className="w-5 h-5" />
                </div>
                <div>
                    <h1 className="text-xl font-medium tracking-tight text-white uppercase">School Diagnostics</h1>
                    <p className="text-zinc-550 text-[10px] font-mono uppercase tracking-wider block mt-1">overview of student achievement trends</p>
                </div>
            </div>

            {!hasData ? (
                 <div className="flex flex-col items-center justify-center py-24 bg-zinc-950 rounded-[4px] border border-zinc-900 shadow-xl">
                    <Icon name="analytics" className="w-12 h-12 text-zinc-650 mb-4 select-none" />
                    <h2 className="text-xs font-mono text-zinc-300 uppercase tracking-wider mb-2">No Active Assessment Data</h2>
                    <p className="text-xs text-zinc-500 max-w-sm text-center leading-relaxed">Please log complete assessment profiles to view aggregated performance curves and distribution metrics.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <KPICard title="Average Growth" subtitle="" value={`+${analytics?.avgVelocity || 0}%`} icon="trendUp" theme="blue" />
                        <KPICard title="Students Flagged" subtitle="" value={analytics?.atRiskCount || 0} icon="alert" theme="rose" />
                        <KPICard title="Class Average" subtitle="" value={`${analytics?.classAvg}%`} icon="analytics" theme="purple" />
                        <KPICard title="Total Diagnostics" subtitle="" value={analytics?.totalActions || 0} icon="chat" theme="orange" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="p-6 bg-zinc-950 border border-zinc-905 rounded-[4px] lg:col-span-1">
                            <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-6 select-none">Proficiency Spread</h3>
                            <div className="h-64"><ProficiencyDistributionChart data={analytics?.distribution || []} /></div>
                        </Card>

                        <Card className="p-6 bg-zinc-950 border border-zinc-905 rounded-[4px] lg:col-span-2">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider select-none">Subject Performance</h3>
                                <div className="flex bg-zinc-900 border border-zinc-850 p-0.5 rounded-[4px]">
                                    <button onClick={() => setChartType('radar')} className={`px-3 py-1 text-[9px] font-mono uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer ${chartType === 'radar' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-350'}`}>Radar</button>
                                    <button onClick={() => setChartType('bar')} className={`px-3 py-1 text-[9px] font-mono uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer ${chartType === 'bar' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-350'}`}>Bar</button>
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
