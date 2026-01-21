
import React, { useState, useMemo } from 'react';
import { Card } from '../components/common/Card';
import { DomainPerformanceChart, RadarPerformanceChart, SupportTierChart } from '../components/charts/Charts';
import { Icon } from '../components/common/Icon';
import { useStudents } from '../context/StudentContext';
import { useBenchmarks } from '../context/BenchmarkContext';
import { Domain, Student } from '../types';
import { InsightCard } from '../components/common/InsightCard';
import { AtRiskDetailsModal } from '../components/students/AtRiskDetailsModal';
import { GeminiService } from '../services/geminiService';
import { ExecutiveBriefingModal } from '../components/common/ExecutiveBriefingModal';

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
    const { domains, benchmarks } = useBenchmarks();
    const [chartType, setChartType] = useState<'radar' | 'bar'>('radar');
    const [isAtRiskModalOpen, setIsAtRiskModalOpen] = useState(false);
    const [isBriefingModalOpen, setIsBriefingModalOpen] = useState(false);
    const [briefingData, setBriefingData] = useState<any>(null);
    const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
    const [smartGroups, setSmartGroups] = useState<{ groupName: string, studentIds: string[], focus: string }[]>([]);
    const [isGrouping, setIsGrouping] = useState(false);

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
        
        // Institutional Health Metric: Weighted blend of velocity, compliance, and score
        const compliance = Math.min(100, students.reduce((acc, s) => acc + (s.assessments.length * 15), 0) / students.length);
        const healthScore = Math.round((avgVelocity * 2 + compliance + (domainData.reduce((a,b) => a+b.score, 0) / domainData.length)) / 4);

        return { 
            domainData, 
            tiers, 
            atRiskList, 
            avgVelocity, 
            healthScore,
            classAvg: Math.round(domainData.reduce((a,b) => a+b.score, 0) / domainData.length) 
        };
    }, [students, domains, benchmarks, classProfile]);

    const handleGenerateGroups = async () => {
        setIsGrouping(true);
        const groups = await GeminiService.generateSmartGroups(students, domains);
        setSmartGroups(groups);
        setIsGrouping(false);
    };

    const handleGenerateBriefing = async () => {
        setIsGeneratingBrief(true);
        const briefing = await GeminiService.generateExecutiveBriefing(students, classProfile?.className || 'General Cohort');
        setBriefingData(briefing);
        setIsGeneratingBrief(false);
        setIsBriefingModalOpen(true);
    };

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
        <div className="p-6 md:p-12 space-y-12 max-w-[1600px] mx-auto pb-48">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                <div>
                    <h1 className="text-7xl font-black text-slate-900 tracking-tighter mb-2 uppercase italic leading-[0.85]">Strategic <br/>Intelligence</h1>
                    <p className="text-slate-400 font-bold text-2xl italic tracking-tight">Active Insight Layer: <span className="text-indigo-600">Institutional Mode</span></p>
                </div>
                <button 
                    onClick={handleGenerateBriefing}
                    disabled={isGeneratingBrief}
                    className="group relative px-12 py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50 border-b-8 border-slate-950 flex items-center gap-4"
                >
                    {isGeneratingBrief ? <Icon name="refresh" className="w-5 h-5 animate-spin" /> : <Icon name="brain" className="w-5 h-5 text-indigo-400" />}
                    Leadership Briefing
                    <div className="absolute -top-3 -right-3 px-2 py-1 bg-indigo-500 rounded-lg text-[8px] animate-pulse">DIRECTOR ACCESS</div>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <DashboardWidget title="Risk Protocol" value={analytics?.atRiskList.length || 0} subtext="Tier 2/3 Triggers" icon="alert" gradient="from-rose-500 to-pink-600" onClick={() => setIsAtRiskModalOpen(true)} />
                <DashboardWidget title="Institutional Health" value={`${analytics?.healthScore}%`} subtext="Operational efficiency" icon="shield" gradient="from-indigo-600 to-violet-700" />
                <DashboardWidget title="Mastery Median" value={`${analytics?.classAvg}%`} subtext="Institutional aggregate" icon="analytics" gradient="from-slate-800 to-slate-950" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                <div className="xl:col-span-8 space-y-10">
                    <InsightCard title="Domain Competency Matrix" description="Comparing class medians against target protocols">
                        <div className="flex justify-end mb-6">
                            <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200">
                                <button onClick={() => setChartType('radar')} className={`px-5 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${chartType === 'radar' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Radar</button>
                                <button onClick={() => setChartType('bar')} className={`px-5 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${chartType === 'bar' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Bar</button>
                            </div>
                        </div>
                        <div className="h-[450px]">
                            {chartType === 'radar' ? <RadarPerformanceChart data={analytics?.domainData || []} /> : <DomainPerformanceChart data={analytics?.domainData || []} />}
                        </div>
                    </InsightCard>

                    <Card className="p-12 bg-white border border-slate-100 shadow-2xl rounded-[4rem]">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-slate-50 pb-8">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-indigo-600 text-white rounded-3xl shadow-xl shadow-indigo-100"><Icon name="brain" className="w-8 h-8" /></div>
                                <div>
                                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Instructional Clustering</h2>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1">AI-Powered Intervention Pods</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleGenerateGroups}
                                disabled={isGrouping}
                                className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3 border-b-4 border-indigo-900"
                            >
                                {isGrouping ? <Icon name="refresh" className="w-4 h-4 animate-spin" /> : <Icon name="plus" className="w-4 h-4" />}
                                {smartGroups.length > 0 ? 'Regenerate Clusters' : 'Auto-Cluster Class'}
                            </button>
                        </div>

                        {smartGroups.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {smartGroups.map((group, idx) => (
                                    <div key={idx} className="p-8 bg-slate-50 rounded-[3rem] border border-slate-100 group hover:bg-white hover:border-indigo-100 transition-all shadow-sm hover:shadow-xl">
                                        <div className="flex items-center justify-between mb-6">
                                            <h4 className="font-black text-indigo-600 uppercase tracking-widest text-sm">{group.groupName}</h4>
                                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{group.studentIds.length} Units</span>
                                        </div>
                                        <div className="space-y-3 mb-8">
                                            {group.studentIds.map(sid => {
                                                const s = students.find(item => item.id === sid);
                                                return (
                                                    <div key={sid} className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white shadow-sm bg-white">
                                                            <img src={s?.photoUrl} className="w-full h-full object-cover" alt="" />
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-700">{s?.name || 'Unknown'}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="pt-6 border-t border-slate-200">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tactical Focus:</p>
                                            <p className="text-xs font-bold text-slate-600 leading-relaxed italic">"{group.focus}"</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-24 text-center border-4 border-dashed border-slate-100 rounded-[3.5rem] bg-slate-50/50">
                                <Icon name="students" className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                                <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs">Run clustering engine to group students by shared skill gaps.</p>
                            </div>
                        )}
                    </Card>
                </div>
                
                <div className="xl:col-span-4 space-y-10">
                    <Card className="p-10 bg-white border border-slate-100 shadow-2xl rounded-[3.5rem]">
                        <h3 className="text-xl font-black text-slate-800 mb-10 tracking-tight flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shadow-inner"><Icon name="check" className="w-6 h-6" /></div>
                            RTI Logic Spread
                        </h3>
                        <div className="h-72">
                            <SupportTierChart data={analytics?.tiers as any} />
                        </div>
                    </Card>

                    <Card className="p-10 bg-slate-900 text-white rounded-[3.5rem] shadow-[0_40px_100px_rgba(15,23,42,0.4)] relative overflow-hidden group">
                        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full group-hover:scale-125 transition-transform duration-1000"></div>
                        <div className="relative z-10">
                            <h4 className="font-black text-indigo-400 text-[10px] uppercase tracking-[0.4em] mb-6">Strategic Advisory</h4>
                            <p className="text-2xl font-black leading-tight mb-8 italic text-slate-100">"Prioritize intensive support for <span className="text-indigo-400 underline decoration-4 underline-offset-8">{analytics?.domainData.sort((a,b) => a.score - b.score)[0].domain}</span>. System identified a class-wide gap in this quadrant."</p>
                            <div className="flex items-center gap-4 py-4 px-6 bg-white/5 rounded-2xl border border-white/5">
                                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg"><Icon name="brain" className="w-5 h-5" /></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-200">AI Logic Sync Complete</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <AtRiskDetailsModal isOpen={isAtRiskModalOpen} onClose={() => setIsAtRiskModalOpen(false)} atRiskStudents={analytics?.atRiskList || []} domainCount={domains.length} />
            <ExecutiveBriefingModal isOpen={isBriefingModalOpen} onClose={() => setIsBriefingModalOpen(false)} data={briefingData} className={classProfile?.className || 'General'} />
        </div>
    );
};
