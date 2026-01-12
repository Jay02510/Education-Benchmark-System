
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
        <div className={`relative overflow-hidden p-8 rounded-[2.5rem] bg-gradient-to-br ${themes[theme]} text-white shadow-2xl hover:-translate-y-3 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group`}>
            {/* Animated Background Decor */}
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-1000">
                <Icon name={icon} className="w-40 h-40 transform translate-x-12 -translate-y-12 rotate-12" />
            </div>
            
            <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                    <div className="flex flex-col gap-0.5 mb-6">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform">
                                <Icon name={icon} className="w-5 h-5" />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-white/90">{title}</span>
                        </div>
                        <span className="text-[11px] font-bold text-white/60 italic ml-10 mt-1">{subtitle}</span>
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
        <div className="p-6 md:p-10 space-y-10 max-w-[1600px] mx-auto pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Executive Dashboard</h1>
                    <p className="text-slate-500 font-medium italic mt-1">High-level institutional health for {classProfile?.className}</p>
                </div>
                <div className="flex gap-2 bg-white/80 backdrop-blur-md p-2 rounded-[2rem] shadow-sm border border-slate-100 shrink-0 ring-1 ring-black/5">
                    <button onClick={() => setViewMode('Analytics')} className={`px-8 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'Analytics' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:text-slate-900'}`}>Institutional Insights</button>
                    <button onClick={() => setViewMode('Resources')} className={`px-8 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'Resources' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:text-slate-900'}`}>Resource Bank</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <KPICard 
                    title="Institutional Growth" 
                    subtitle="How fast students are learning"
                    value={`+${stats?.avgVelocity || 0}%`} 
                    icon="trendUp" 
                    trend="up" 
                    subtext="Speed of Improvement" 
                    theme="blue" 
                />
                <KPICard 
                    title="Operational Risk" 
                    subtitle="Students needing extra help"
                    value={stats?.atRisk.length || 0} 
                    icon="alert" 
                    trend="down" 
                    subtext="Priority Support Needs" 
                    theme="rose" 
                />
                <KPICard 
                    title="Teaching Activity" 
                    subtitle="Documented teacher efforts"
                    value={stats?.totalActions || 0} 
                    icon="chat" 
                    subtext="Total Actions Logged" 
                    theme="purple" 
                />
                <KPICard 
                    title="Resource Efficacy" 
                    subtitle="Worksheet success rate"
                    value="92%" 
                    icon="star" 
                    subtext="Esl Growth Impact" 
                    theme="orange" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <Card variant="paper" className="lg:col-span-2 p-12 border-t-[10px] border-indigo-600 shadow-2xl overflow-hidden group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50 rounded-full blur-[100px] -z-0 translate-x-20 -translate-y-20 opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
                    
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-indigo-600 rounded-[1.8rem] text-white shadow-xl shadow-indigo-200">
                                    <Icon name="brain" className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Strategic Performance Briefing</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mt-1">AI-Powered Stakeholder Report • v9.0</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleGenerateBriefing} 
                                disabled={isGenerating}
                                className="px-6 py-3.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-600 transition-all flex items-center gap-3 shadow-xl shadow-slate-200 disabled:opacity-50"
                            >
                                <Icon name="refresh" className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                                {isGenerating ? 'Analyzing Class Health...' : 'Refresh Briefing'}
                            </button>
                        </div>

                        {executiveBriefing ? (
                             <div className="prose prose-slate max-w-none animate-in fade-in slide-in-from-bottom-6 duration-700">
                                {executiveBriefing.split('\n').map((p, i) => (
                                    <p key={i} className={`mb-6 text-lg leading-relaxed ${p.includes('**') ? 'text-indigo-900 font-bold' : 'text-slate-700'}`}>
                                        {p.replace(/\*\*/g, '')}
                                    </p>
                                ))}
                                <div className="mt-12 pt-8 border-t border-slate-200 flex justify-between items-center italic text-slate-400 text-xs">
                                    <span>Verified by Benchmark AI Core</span>
                                    <span>{new Date().toLocaleDateString()}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                                <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-slate-300 mb-6 shadow-sm ring-1 ring-black/5">
                                    <Icon name="brain" className="w-10 h-10" />
                                </div>
                                <h4 className="text-xl font-black text-slate-900 mb-2">Ready to analyze Institutional Health?</h4>
                                <p className="text-sm text-slate-400 mb-10 max-w-md text-center font-medium px-4">Our AI will summarize class performance, risk levels, and teaching impact for school leadership using humanized metrics.</p>
                                <button onClick={handleGenerateBriefing} className="px-12 py-5 bg-white border border-slate-200 rounded-[1.8rem] font-black text-sm text-indigo-600 shadow-xl hover:shadow-2xl hover:bg-indigo-50 hover:border-indigo-100 transition-all active:scale-95 flex items-center gap-3">
                                    <Icon name="refresh" className="w-5 h-5" />
                                    Generate Executive Summary
                                </button>
                            </div>
                        )}
                    </div>
                </Card>

                <Card variant="glass" className="p-8 bg-slate-900 text-white border-0 shadow-2xl relative overflow-hidden flex flex-col">
                    <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-[80px]"></div>
                    <div className="relative z-10 flex-1 flex flex-col">
                        <div className="mb-10">
                            <h3 className="text-2xl font-black flex items-center gap-3 tracking-tight">
                                <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
                                    <Icon name="benchmark" className="w-6 h-6" />
                                </div>
                                Academic Momentum
                            </h3>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-3 ml-12">Growth Leaderboard</p>
                        </div>
                        
                        <div className="space-y-4 flex-1">
                            {stats?.velocityLeaderboard.slice(0, 8).map((s, i) => (
                                <div key={s.id} onClick={() => navigateToStudent(s.id)} className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-3xl cursor-pointer transition-all border border-white/5 hover:border-indigo-500/50 group/item">
                                    <div className="flex items-center gap-4">
                                        <span className="w-4 text-[10px] font-black text-slate-500 group-hover/item:text-indigo-400 transition-colors">0{i+1}</span>
                                        <div className="w-12 h-12 rounded-2xl bg-white/10 p-0.5 overflow-hidden">
                                            <img src={s.photoUrl} className="w-full h-full rounded-[0.9rem] object-cover" alt="" />
                                        </div>
                                        <div>
                                            <span className="font-black text-sm text-white block group-hover/item:text-indigo-200 transition-colors">{s.name}</span>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Level {s.level}</span>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter ${s.growthVelocity >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                        {s.growthVelocity > 0 ? '+' : ''}{s.growthVelocity}% Improvement
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-10 p-5 bg-white/5 rounded-3xl border border-white/10 italic text-[11px] text-slate-400 text-center font-medium">
                            "Top students are exceeding benchmarks by 12% on average."
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
