
import React, { useState, useMemo } from 'react';
import { Card } from '../components/common/Card';
import { DomainPerformanceChart, RadarPerformanceChart, ProficiencyDistributionChart, SupportTierChart, LongitudinalGrowthChart } from '../components/charts/Charts';
import { Icon } from '../components/common/Icon';
import { useStudents } from '../context/StudentContext';
import { useBenchmarks } from '../context/BenchmarkContext';
import { Domain, TestPeriod, Student } from '../types';
import { InsightCard } from '../components/common/InsightCard';
import { AtRiskDetailsModal } from '../components/students/AtRiskDetailsModal';

const DashboardWidget: React.FC<{ title: string; value: string | number; subtext: string; icon: string; gradient: string; onClick?: () => void; }> = ({ title, value, subtext, icon, gradient, onClick }) => (
    <button 
        onClick={onClick}
        className={`w-full text-left relative overflow-hidden p-8 rounded-[2.5rem] bg-gradient-to-br ${gradient} shadow-2xl transition-all hover:-translate-y-2 group active:scale-[0.97]`}
    >
        <div className="relative z-20 text-white">
            <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/10">
                    <Icon name={icon} className="w-6 h-6" />
                </div>
            </div>
            <h3 className="text-5xl font-black mb-1 tracking-tighter">{value}</h3>
            <p className="font-bold text-sm mb-4 opacity-90">{subtext}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50">{title}</p>
        </div>
        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-1000"></div>
    </button>
);

export const InsightsTab: React.FC = () => {
    const { students, classProfile } = useStudents();
    const { domains, benchmarks, thresholds } = useBenchmarks();
    const [chartType, setChartType] = useState<'radar' | 'bar'>('radar');
    const [isAtRiskModalOpen, setIsAtRiskModalOpen] = useState(false);

    const analytics = useMemo(() => {
        if (!students.length) return null;
        const levelToUse = classProfile?.gradeLevel || '5';
        const atRiskList = students.filter(s => s.interventionStatus !== null || s.hasAnomaly);

        const domainData = domains.map(domain => {
            const bench = benchmarks.find(b => b.domain === domain && b.level_name === levelToUse);
            let total = 0, count = 0;
            students.forEach(s => {
                const latest = s.assessments[s.assessments.length - 1];
                if (latest?.scores[domain as Domain] > 0) {
                    total += latest.scores[domain as Domain];
                    count++;
                }
            });
            return { domain: domain as Domain, score: count > 0 ? Math.round(total / count) : 0, target: bench?.target_percent || 70 };
        });

        const tiers = [
            { name: 'Tier 1', value: 0, color: '#10b981', students: [] },
            { name: 'Tier 2', value: 0, color: '#f59e0b', students: [] },
            { name: 'Tier 3', value: 0, color: '#f43f5e', students: [] }
        ];

        students.forEach(s => {
            if (s.interventionStatus?.tier === 3) tiers[2].value++;
            else if (s.interventionStatus?.tier === 2) tiers[1].value++;
            else tiers[0].value++;
        });

        const avgVelocity = Math.round(students.reduce((a, b) => a + b.growthVelocity, 0) / students.length);

        return { domainData, tiers, atRiskList, avgVelocity, classAvg: Math.round(domainData.reduce((a,b) => a+b.score, 0) / domainData.length) };
    }, [students, domains, benchmarks, classProfile]);

    if (!students.length) {
        return (
            <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="w-24 h-24 bg-slate-100 rounded-[2.5rem] flex items-center justify-center text-slate-300 mb-8"><Icon name="analytics" className="w-12 h-12" /></div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">Insufficient Data</h2>
                <p className="text-slate-400 font-bold max-w-sm">Calibrate your class and sync student scores to unlock institutional insights.</p>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-12 space-y-12 max-w-[1600px] mx-auto pb-32">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                <div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2 uppercase italic">Strategic Insights</h1>
                    <p className="text-slate-400 font-bold text-lg italic">Institutional health and instructional intelligence.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <DashboardWidget 
                    title="Risk Protocol" 
                    value={analytics?.atRiskList.length || 0} 
                    subtext="Students requiring Tier 2/3" 
                    icon="alert" 
                    gradient="from-rose-500 to-pink-600" 
                    onClick={() => setIsAtRiskModalOpen(true)}
                />
                <DashboardWidget 
                    title="Growth Velocity" 
                    value={`+${analytics?.avgVelocity}%`} 
                    subtext="Average Learning Speed" 
                    icon="trendUp" 
                    gradient="from-indigo-600 to-violet-700" 
                />
                <DashboardWidget 
                    title="Mastery Median" 
                    value={`${analytics?.classAvg}%`} 
                    subtext="Aggregate Class Mastery" 
                    icon="analytics" 
                    gradient="from-slate-800 to-slate-950" 
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                <div className="xl:col-span-8">
                    <InsightCard title="Domain Competency Matrix" description="Comparing class medians against target protocols">
                        <div className="flex justify-end mb-6">
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                <button onClick={() => setChartType('radar')} className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-lg ${chartType === 'radar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Radar</button>
                                <button onClick={() => setChartType('bar')} className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-lg ${chartType === 'bar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Bar</button>
                            </div>
                        </div>
                        <div className="h-[400px]">
                            {chartType === 'radar' ? <RadarPerformanceChart data={analytics?.domainData || []} /> : <DomainPerformanceChart data={analytics?.domainData || []} />}
                        </div>
                    </InsightCard>
                </div>
                
                <div className="xl:col-span-4 space-y-10">
                    <Card className="p-8 bg-white border border-slate-100 shadow-xl rounded-[3rem]">
                        <h3 className="text-xl font-black text-slate-800 mb-8 tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Icon name="check" className="w-5 h-5" /></div>
                            Support Tier Spread
                        </h3>
                        <div className="h-64">
                            <SupportTierChart data={analytics?.tiers as any} />
                        </div>
                    </Card>

                    <Card className="p-8 bg-indigo-900 text-white rounded-[3rem] shadow-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="font-black text-indigo-300 text-[10px] uppercase tracking-[0.3em] mb-4">Strategic Advisory</h4>
                            <p className="text-lg font-bold leading-relaxed mb-6 italic">"Priority focus on {analytics?.domainData.sort((a,b) => a.score - b.score)[0].domain}. Class median is currently below benchmark."</p>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><Icon name="brain" className="w-4 h-4" /></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">AI Narrative Engine</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <AtRiskDetailsModal isOpen={isAtRiskModalOpen} onClose={() => setIsAtRiskModalOpen(false)} atRiskStudents={analytics?.atRiskList || []} domainCount={domains.length} />
        </div>
    );
};
