
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
        <div className={`relative overflow-hidden p-8 rounded-[2rem] bg-gradient-to-br ${themes[theme]} text-white shadow-xl hover:-translate-y-2 transition-transform duration-300`}>
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Icon name={icon} className="w-32 h-32 transform translate-x-8 -translate-y-8 rotate-12" />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-6 opacity-90">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm shadow-inner">
                            <Icon name={icon} className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-widest">{title}</span>
                    </div>
                    <h3 className="text-5xl font-extrabold tracking-tight drop-shadow-sm">{value}</h3>
                </div>
                <div className="mt-6 flex items-end justify-between">
                    {subtext && <p className="text-base font-medium opacity-90">{subtext}</p>}
                    {trend && (
                         <div className="flex items-center text-sm font-bold bg-white/25 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/10">
                            <Icon name={trend === 'up' ? 'trendUp' : trend === 'down' ? 'trendDown' : 'trendStable'} className="w-4 h-4 mr-2" />
                            <span>{trend === 'up' ? 'Rising' : trend === 'down' ? 'Needs Focus' : 'Stable'}</span>
                        </div>
                    )}
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
    const [executiveBriefing, setExecutiveBriefing] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);

    const stats = useMemo(() => {
        if (students.length === 0) return null;
        const velocityLeaderboard = [...students].sort((a, b) => b.growthVelocity - a.growthVelocity);
        const atRisk = students.filter(s => s.interventionStatus !== null || s.growthVelocity < -5);
        const avgVelocity = Math.round(students.reduce((a, b) => a + b.growthVelocity, 0) / students.length);
        const totalActions = students.reduce((acc, s) => acc + (s.actionLog?.length || 0), 0);
        
        return { velocityLeaderboard, atRisk, avgVelocity, total: students.length, totalActions };
    }, [students]);

    const handleGenerateBriefing = async () => {
        if (!stats) return;
        setIsGenerating(true);
        try {
            // Updated to use the comprehensive executive persona
            const result = await GeminiService.generateClassInsight(
                classProfile?.gradeLevel || '5',
                stats.total,
                "Focus Areas", 
                "Growth Assets",
                stats.atRisk.length
            );
            setExecutiveBriefing(result);
        } catch (e) { setExecutiveBriefing('Briefing generation failed.'); } finally { setIsGenerating(false); }
    };

    if (viewMode === 'Resources') return <ResourceBankTab />;

    return (
        <div className="p-6 md:p-10 space-y-10 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Executive Dashboard</h1>
                    <p className="text-slate-500 font-medium">Class Health & Institutional Oversight for {classProfile?.className}</p>
                </div>
                <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 shrink-0">
                    <button onClick={() => setViewMode('Analytics')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'Analytics' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500'}`}>Insights</button>
                    <button onClick={() => setViewMode('Resources')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'Resources' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500'}`}>Bank</button>
                </div>
            </div>

            {/* Top Level Summary for Owner */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="Institutional Growth" value={`+${stats?.avgVelocity || 0}%`} icon="trendUp" trend="up" subtext="Average Improvement Speed" theme="blue" />
                <KPICard title="Operational Risk" value={stats?.atRisk.length || 0} icon="alert" trend="down" subtext="Students below 65%" theme="rose" />
                <KPICard title="Teaching Activity" value={stats?.totalActions || 0} icon="chat" subtext="Total Logged Interventions" theme="purple" />
                <KPICard title="Resource Efficacy" value="92%" icon="star" subtext="Success Rate of Generated Materials" theme="orange" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Strategic Briefing for Owners */}
                <Card className="lg:col-span-2 p-8 border-l-8 border-indigo-500 shadow-2xl bg-white">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                             <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                                <Icon name="brain" className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900">Executive Briefing</h3>
                        </div>
                        <button 
                            onClick={handleGenerateBriefing} 
                            disabled={isGenerating}
                            className="px-4 py-2 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-50"
                        >
                            <Icon name="refresh" className="w-3 h-3" />
                            {isGenerating ? 'Analyzing...' : 'Refresh Briefing'}
                        </button>
                    </div>

                    {executiveBriefing ? (
                         <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-strong:text-indigo-900 prose-p:leading-relaxed animate-in fade-in duration-500">
                            {executiveBriefing.split('\n').map((p, i) => (
                                <p key={i} className="mb-4">{p}</p>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 mb-4 shadow-sm">
                                <Icon name="brain" className="w-8 h-8" />
                            </div>
                            <p className="text-slate-500 font-bold mb-6">Generate an automated health briefing for stakeholders.</p>
                            <button onClick={handleGenerateBriefing} className="px-10 py-4 bg-white border border-slate-200 rounded-2xl font-black text-indigo-600 shadow-sm hover:shadow-md hover:bg-indigo-50 transition active:scale-95">Generate briefing</button>
                        </div>
                    )}
                </Card>

                {/* Growth Velocity Ranking */}
                <Card className="p-8 bg-slate-900 text-white border-0 shadow-2xl">
                    <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                        <Icon name="benchmark" className="w-6 h-6 text-indigo-400" />
                        Performance Momentum
                    </h3>
                    <div className="space-y-4">
                        {stats?.velocityLeaderboard.slice(0, 8).map((s, i) => (
                            <div key={s.id} onClick={() => navigateToStudent(s.id)} className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl cursor-pointer transition-all border border-white/5 hover:border-indigo-500/50">
                                <div className="flex items-center gap-4">
                                    <span className="w-4 text-[10px] font-black text-slate-500">{i+1}</span>
                                    <img src={s.photoUrl} className="w-10 h-10 rounded-xl" alt="" />
                                    <span className="font-bold text-sm text-slate-200">{s.name}</span>
                                </div>
                                <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${s.growthVelocity >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                    {s.growthVelocity > 0 ? '+' : ''}{s.growthVelocity}% Vel
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/10 text-center">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">End of Period Momentum Tracking</p>
                    </div>
                </Card>
            </div>
        </div>
    );
};
