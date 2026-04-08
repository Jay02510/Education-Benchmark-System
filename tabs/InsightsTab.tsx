
import React, { useState, useMemo } from 'react';
import { Card } from '../components/common/Card';
import { DomainPerformanceChart, RadarPerformanceChart, SupportTierChart } from '../components/charts/Charts';
import { Icon } from '../components/common/Icon';
import { useStudents } from '../context/StudentContext';
import { useBenchmarks } from '../context/BenchmarkContext';
import { useAuth } from '../context/AuthContext';
import { Domain, Student } from '../types';
import { InsightCard } from '../components/common/InsightCard';
import { AtRiskDetailsModal } from '../components/students/AtRiskDetailsModal';
import { GeminiService } from '../services/geminiService';
import { ExecutiveBriefingModal } from '../components/common/ExecutiveBriefingModal';
import { CaseStudyModal } from '../components/common/CaseStudyModal';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/common/Modal';

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
    const { user, logout } = useAuth();
    const { showToast } = useToast();
    
    const [chartType, setChartType] = useState<'radar' | 'bar'>('radar');
    const [isAtRiskModalOpen, setIsAtRiskModalOpen] = useState(false);
    const [isBriefingModalOpen, setIsBriefingModalOpen] = useState(false);
    const [isCaseStudyModalOpen, setIsCaseStudyModalOpen] = useState(false);
    const [isUpgradePromptOpen, setIsUpgradePromptOpen] = useState(false);
    
    const [briefingData, setBriefingData] = useState<any>(null);
    const [caseStudyData, setCaseStudyData] = useState<any>(null);
    const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
    const [isGeneratingStudy, setIsGeneratingStudy] = useState(false);
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
                if (latest?.scores && latest.scores[domain as Domain] > 0) {
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

        const avgVelocity = Math.round(students.reduce((a, b) => a + (b.growthVelocity || 0), 0) / students.length);
        const healthScore = Math.round((avgVelocity * 2 + (domainData.reduce((a,b) => a+b.score, 0) / domainData.length)) / 3);

        return { domainData, tiers, atRiskList, avgVelocity, healthScore, classAvg: Math.round(domainData.reduce((a,b) => a+b.score, 0) / domainData.length) };
    }, [students, domains, benchmarks, classProfile]);

    const handleGenerateGroups = async () => {
        setIsGrouping(true);
        try {
            const groups = await GeminiService.generateSmartGroups(students, domains);
            setSmartGroups(groups);
        } catch (e: any) { 
            showToast(e.message || "Clustering engine offline.", "error");
        } finally { 
            setIsGrouping(false); 
        }
    };

    const handleGenerateBriefing = async () => {
        if (!user?.isPremium && !user?.isDemo) {
            setIsUpgradePromptOpen(true);
            return;
        }
        setIsGeneratingBrief(true);
        try {
            const briefing = await GeminiService.generateExecutiveBriefing(students, classProfile?.className || 'General Cohort');
            setBriefingData(briefing);
            setIsBriefingModalOpen(true);
        } catch (e: any) {
            showToast(e.message || "Briefing engine offline.", "error");
        } finally { setIsGeneratingBrief(false); }
    };

    const handleGenerateCaseStudy = async () => {
        if (!user?.isPremium && !user?.isDemo) {
            setIsUpgradePromptOpen(true);
            return;
        }
        setIsGeneratingStudy(true);
        try {
            const study = await GeminiService.generateCaseStudy(students, classProfile?.className || 'Research Cohort');
            setCaseStudyData(study);
            setIsCaseStudyModalOpen(true);
        } catch (e: any) {
            showToast(e.message || "Research engine offline.", "error");
        } finally { setIsGeneratingStudy(false); }
    };

    if (!students.length) {
        return (
            <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="w-24 h-24 bg-slate-100 rounded-[2.5rem] flex items-center justify-center text-slate-300 mb-8"><Icon name="analytics" className="w-12 h-12" /></div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">Insufficient Data</h2>
                <p className="text-slate-400 font-bold max-w-sm">Log scores for your students to unlock insights.</p>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-12 space-y-12 max-w-[1600px] mx-auto pb-48">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                <div>
                    <h1 className="text-7xl font-black text-slate-900 tracking-tighter mb-2 uppercase italic leading-[0.85]">Strategic <br/>Intelligence</h1>
                    <p className="text-slate-400 font-bold text-2xl italic tracking-tight">Focus: <span className="text-indigo-600">{classProfile?.className} ({students.length} students)</span></p>
                </div>
                <div className="flex flex-wrap gap-4">
                    <button 
                        onClick={handleGenerateCaseStudy}
                        className={`group px-8 py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center gap-3 active:scale-95 bg-white border-2 border-slate-200 text-slate-800 hover:bg-slate-50`}
                    >
                        {isGeneratingStudy ? <Icon name="refresh" className="w-5 h-5 animate-spin" /> : <Icon name="benchmark" className="w-5 h-5 text-indigo-400" />}
                        Generate Case Study
                        {user?.isDemo && <span className="ml-2 px-2 py-0.5 bg-indigo-50 text-[8px] rounded border border-indigo-100">DEMO</span>}
                    </button>
                    <button 
                        onClick={handleGenerateBriefing}
                        className={`group relative px-12 py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl transition-all active:scale-95 border-b-8 bg-slate-900 text-white hover:bg-indigo-600 border-slate-950`}
                    >
                        {isGeneratingBrief ? <Icon name="refresh" className="w-5 h-5 animate-spin" /> : <Icon name="brain" className="w-5 h-5 text-indigo-400" />}
                        Leadership Briefing
                        {user?.isDemo && <span className="ml-2 px-2 py-0.5 bg-white/10 text-[8px] rounded border border-white/20">DEMO</span>}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <DashboardWidget title="Risk Protocol" value={analytics?.atRiskList.length || 0} subtext={`${students.length} Total Units`} icon="alert" gradient="from-rose-500 to-pink-600" onClick={() => setIsAtRiskModalOpen(true)} />
                <DashboardWidget title="Institutional Health" value={`${analytics?.healthScore}%`} subtext="Class Efficiency" icon="shield" gradient="from-indigo-600 to-violet-700" />
                <DashboardWidget title="Mastery Median" value={`${analytics?.classAvg}%`} subtext="Cohort Aggregate" icon="analytics" gradient="from-slate-800 to-slate-950" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                <div className="xl:col-span-8 space-y-10">
                    <InsightCard title="Domain Competency Matrix" description={`Targeting Standards for ${classProfile?.gradeLevel}`}>
                        <div className="h-[450px]">
                            {chartType === 'radar' ? <RadarPerformanceChart data={analytics?.domainData || []} /> : <DomainPerformanceChart data={analytics?.domainData || []} />}
                        </div>
                    </InsightCard>

                    <Card className="p-12 bg-white border border-slate-100 shadow-2xl rounded-[4rem]">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-slate-50 pb-8">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-indigo-600 text-white rounded-3xl shadow-xl"><Icon name="brain" className="w-8 h-8" /></div>
                                <div>
                                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Instructional Pods</h2>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1">AI Grouping engine (Restricted to roster)</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleGenerateGroups}
                                disabled={isGrouping}
                                className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-indigo-700 transition-all border-b-4 border-indigo-900"
                            >
                                {isGrouping ? <Icon name="refresh" className="w-4 h-4 animate-spin" /> : <Icon name="plus" className="w-4 h-4" />}
                                Cluster These {students.length} Students
                            </button>
                        </div>
                        {smartGroups.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {smartGroups.map((group: any, idx: number) => (
                                    <div key={idx} className="p-8 bg-slate-50 rounded-[3rem] border border-slate-100 hover:bg-white hover:border-indigo-100 transition-all">
                                        <h4 className="font-black text-indigo-600 uppercase tracking-widest text-sm mb-4">{group.groupName}</h4>
                                        <div className="space-y-3 mb-8">
                                            {group.studentIds.map((sid: string) => {
                                                const s = students.find(item => item.id === sid);
                                                return s ? (
                                                    <div key={sid} className="flex items-center gap-3">
                                                        <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100"><img src={s.photoUrl} className="w-full h-full object-cover" /></div>
                                                        <span className="text-xs font-bold text-slate-700">{s.name}</span>
                                                    </div>
                                                ) : null;
                                            })}
                                        </div>
                                        <p className="text-xs font-bold text-slate-500 italic">"{group.focus}"</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-24 text-center border-4 border-dashed border-slate-100 rounded-[3.5rem] bg-slate-50/50">
                                <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs">Run clustering engine to map skill gaps.</p>
                            </div>
                        )}
                    </Card>
                </div>
                <div className="xl:col-span-4 space-y-10">
                    <Card className="p-10 bg-white border border-slate-100 shadow-2xl rounded-[3.5rem]">
                        <h3 className="text-xl font-black text-slate-800 mb-10 tracking-tight">RTI Logic Spread</h3>
                        <div className="h-72"><SupportTierChart data={analytics?.tiers as any} /></div>
                    </Card>
                </div>
            </div>

            <Modal isOpen={isUpgradePromptOpen} onClose={() => setIsUpgradePromptOpen(false)} title="Join the Educational Frontier" size="md">
                <div className="space-y-6 text-center py-4">
                    <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-100">
                        <Icon name="benchmark" className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Upgrade to Full Access</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">Save your own class data, manage unlimited students, and export unlimited AI reports. Create an account to start your institutional transition.</p>
                    <button 
                        onClick={logout}
                        className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-600 shadow-2xl transition-all active:scale-95"
                    >
                        Create My Account
                    </button>
                </div>
            </Modal>

            <AtRiskDetailsModal isOpen={isAtRiskModalOpen} onClose={() => setIsAtRiskModalOpen(false)} atRiskStudents={analytics?.atRiskList || []} domainCount={domains.length} />
            <ExecutiveBriefingModal isOpen={isBriefingModalOpen} onClose={() => setIsBriefingModalOpen(false)} data={briefingData} className={classProfile?.className || 'General'} />
            <CaseStudyModal isOpen={isCaseStudyModalOpen} onClose={() => setIsCaseStudyModalOpen(false)} data={caseStudyData} />
        </div>
    );
};
