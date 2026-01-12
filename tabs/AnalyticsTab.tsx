
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
    const [classInsight, setClassInsight] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);

    const stats = useMemo(() => {
        if (students.length === 0) return null;
        const velocityLeaderboard = [...students].sort((a, b) => b.growthVelocity - a.growthVelocity);
        const atRisk = students.filter(s => s.interventionStatus !== null || s.growthVelocity < -5);
        const avgVelocity = Math.round(students.reduce((a, b) => a + b.growthVelocity, 0) / students.length);
        
        return { velocityLeaderboard, atRisk, avgVelocity, total: students.length };
    }, [students]);

    const handleGenerateAnalysis = async () => {
        if (!stats) return;
        setIsGenerating(true);
        try {
            const result = await GeminiService.generateClassInsight(
                classProfile?.gradeLevel || '5',
                stats.total,
                "General", "General",
                stats.atRisk.length
            );
            setClassInsight(result);
        } catch (e) { setClassInsight('Error'); } finally { setIsGenerating(false); }
    };

    if (viewMode === 'Resources') return <ResourceBankTab />;

    return (
        <div className="p-6 md:p-10 space-y-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Intelligence Dashboard</h1>
                    <p className="text-slate-500 font-medium">Monitoring {classProfile?.className} Growth Velocity</p>
                </div>
                <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                    <button onClick={() => setViewMode('Analytics')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'Analytics' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500'}`}>Overview</button>
                    <button onClick={() => setViewMode('Resources')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'Resources' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500'}`}>Resources</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <KPICard title="Growth Velocity" value={`+${stats?.avgVelocity || 0}%`} icon="trendUp" trend="up" subtext="Class improvement speed" theme="blue" />
                <KPICard title="Attention Required" value={stats?.atRisk.length || 0} icon="alert" trend="down" subtext="Students below target" theme="rose" />
                <KPICard title="Interventions" value={students.reduce((acc, s) => acc + (s.actionLog?.length || 0), 0)} icon="chat" subtext="Total actions logged" theme="purple" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 p-8">
                    <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                        <Icon name="benchmark" className="w-6 h-6 text-indigo-600" />
                        Growth Velocity Leaderboard
                    </h3>
                    <div className="space-y-4">
                        {stats?.velocityLeaderboard.map((s, i) => (
                            <div key={s.id} onClick={() => navigateToStudent(s.id)} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-indigo-50 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-indigo-100">
                                <div className="flex items-center gap-4">
                                    <span className="w-6 text-sm font-black text-slate-300">#{i+1}</span>
                                    <img src={s.photoUrl} className="w-10 h-10 rounded-xl" alt="" />
                                    <span className="font-bold text-slate-800">{s.name}</span>
                                </div>
                                <div className={`px-3 py-1 rounded-lg text-xs font-black ${s.growthVelocity >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                    {s.growthVelocity > 0 ? '+' : ''}{s.growthVelocity}% Speed
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-8 bg-slate-900 text-white border-0 shadow-2xl">
                    <div className="flex justify-between items-start mb-8">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg">
                            <Icon name="brain" className="w-8 h-8 text-white" />
                        </div>
                        <button onClick={handleGenerateAnalysis} disabled={isGenerating} className="text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-white transition">Refresh</button>
                    </div>
                    <h3 className="text-2xl font-black mb-4">AI Strategic Insight</h3>
                    {isGenerating ? (
                         <div className="space-y-3 animate-pulse">
                            <div className="h-4 bg-white/10 rounded w-full"></div>
                            <div className="h-4 bg-white/10 rounded w-5/6"></div>
                            <div className="h-4 bg-white/10 rounded w-4/5"></div>
                         </div>
                    ) : classInsight ? (
                        <div className="prose prose-sm prose-invert max-w-none text-indigo-100">
                            {classInsight.split('\n').map((p, i) => <p key={i}>{p}</p>)}
                        </div>
                    ) : (
                        <button onClick={handleGenerateAnalysis} className="w-full py-4 bg-white text-slate-900 font-bold rounded-2xl shadow-xl hover:bg-indigo-50 transition active:scale-95">Generate Analysis</button>
                    )}
                </Card>
            </div>
        </div>
    );
};
