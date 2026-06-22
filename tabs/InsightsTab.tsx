import React, { useState, useMemo, useTransition } from 'react';
import { useStudents } from '../context/StudentContext';
import { useBenchmarks } from '../context/BenchmarkContext';
import { useAuth } from '../context/AuthContext';
import { Domain } from '../types';
import { Icon } from '../components/common/Icon';
import { AtRiskDetailsModal } from '../components/students/AtRiskDetailsModal';
import { GeminiService } from '../services/geminiService';
import { ExecutiveBriefingModal } from '../components/common/ExecutiveBriefingModal';
import { CaseStudyModal } from '../components/common/CaseStudyModal';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/common/Modal';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';

// Custom tooltip designed to matches visual system: surface-raised, 1px border, 4px radius, IBM Plex Mono values
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[oklch(0.18_0.01_250)] border border-[oklch(0.60_0_0_/_0.15)] rounded-[4px] p-3 text-left font-mono select-none shadow-xl">
                <p className="text-[11px] font-semibold text-white mb-2 pb-1 border-b border-[oklch(0.60_0_0_/_0.10)] uppercase tracking-wide">
                    {label || payload[0].name}
                </p>
                <div className="space-y-1.5">
                    {payload.map((p: any, i: number) => (
                        <div key={i} className="flex items-center justify-between gap-5 text-[11px]">
                            <span className="text-[oklch(0.60_0_0)] font-normal">{p.name}:</span>
                            <span className="font-semibold text-white tabular-nums">
                                {typeof p.value === 'number' ? `${p.value}%` : p.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

// Local compliant Bar Chart for Domain Matrix
const LocalDomainBarChart: React.FC<{ data: any[] }> = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid 
                    stroke="oklch(0.60 0 0)" 
                    strokeOpacity={0.15} 
                    strokeWidth={0.5} 
                    strokeDasharray="3 3" 
                    vertical={false} 
                />
                <XAxis 
                    dataKey="domain" 
                    tick={{ fontSize: 11, fill: 'oklch(0.60 0 0)', fontFamily: 'IBM Plex Mono' }} 
                    axisLine={false} 
                    tickLine={false} 
                    tickMargin={10}
                />
                <YAxis 
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: 'oklch(0.60 0 0)', fontFamily: 'IBM Plex Mono' }} 
                    axisLine={false} 
                    tickLine={false} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'oklch(0.60 0 0 / 0.05)' }} />
                <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="rect" 
                    iconSize={10} 
                    wrapperStyle={{ fontSize: '11px', fontFamily: 'IBM Plex Mono', color: 'oklch(0.60 0 0)', paddingTop: '15px' }} 
                />
                <Bar 
                    dataKey="score" 
                    fill="oklch(0.72 0.18 145)" 
                    name="Current Score" 
                    unit="%" 
                    radius={0} 
                    barSize={16} 
                />
                <Bar 
                    dataKey="target" 
                    fill="oklch(0.60 0 0 / 0.3)" 
                    name="Target Benchmark" 
                    unit="%" 
                    radius={0} 
                    barSize={16} 
                />
            </BarChart>
        </ResponsiveContainer>
    );
};

// Local compliant Radar Chart for Domain Matrix
const LocalRadarPerformanceChart: React.FC<{ data: any[] }> = ({ data }) => {
    const radarData = data.map(d => ({
        subject: d.domain,
        A: d.score,
        B: d.target,
    }));

    return (
        <ResponsiveContainer width="100%" height={350}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="oklch(0.60 0 0)" strokeOpacity={0.15} strokeWidth={0.5} />
                <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: 'oklch(0.60 0 0)', fontSize: 10, fontFamily: 'IBM Plex Mono' }} 
                />
                <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 100]} 
                    tick={{ fill: 'oklch(0.60 0 0)', fontSize: 9, fontFamily: 'IBM Plex Mono' }} 
                    axisLine={false} 
                />
                <Radar 
                    name="Current Score" 
                    dataKey="A" 
                    stroke="oklch(0.72 0.18 145)" 
                    strokeWidth={1.5} 
                    fill="oklch(0.72 0.18 145)" 
                    fillOpacity={0.15} 
                />
                <Radar 
                    name="Target Benchmark" 
                    dataKey="B" 
                    stroke="oklch(0.60 0 0)" 
                    strokeOpacity={0.3} 
                    strokeWidth={1.5} 
                    strokeDasharray="4 4" 
                    fill="oklch(0.60 0 0)" 
                    fillOpacity={0.05} 
                />
                <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="rect" 
                    iconSize={10} 
                    wrapperStyle={{ fontSize: '11px', fontFamily: 'IBM Plex Mono', color: 'oklch(0.60 0 0)' }} 
                />
                <Tooltip content={<CustomTooltip />} />
            </RadarChart>
        </ResponsiveContainer>
    );
};

export const InsightsTab: React.FC = () => {
    const { students, classProfile } = useStudents();
    const { domains, benchmarks } = useBenchmarks();
    const { user, upgradeToPremium } = useAuth();
    const { showToast } = useToast();
    
    const [isPending, startTransition] = useTransition();
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

    // Sorting indicators for At-Risk table
    const [atRiskSortBy, setAtRiskSortBy] = useState<'name' | 'velocity'>('name');
    const [atRiskSortOrder, setAtRiskSortOrder] = useState<'asc' | 'desc'>('asc');

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
            { name: 'On Track', value: 0 },
            { name: 'Needs Monitoring', value: 0 },
            { name: 'Needs Help', value: 0 }
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

    const toggleAtRiskSort = (field: 'name' | 'velocity') => {
        setAtRiskSortBy(field);
        setAtRiskSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    const sortedAtRiskStudents = useMemo(() => {
        if (!analytics?.atRiskList) return [];
        const result = [...analytics.atRiskList];
        return result.sort((a, b) => {
            if (atRiskSortBy === 'name') {
                const val = a.name.localeCompare(b.name);
                return atRiskSortOrder === 'asc' ? val : -val;
            } else {
                const val = a.growthVelocity - b.growthVelocity;
                return atRiskSortOrder === 'asc' ? val : -val;
            }
        });
    }, [analytics?.atRiskList, atRiskSortBy, atRiskSortOrder]);

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

    // Compliant Empty State: 1 sentence, 1 action button, no decorative SVGs or sad icons
    if (!students.length) {
        return (
            <div className="p-12 md:p-24 flex flex-col items-center justify-center min-h-[60vh] text-center max-w-[1600px] mx-auto select-none">
                <p className="text-[oklch(0.60_0_0)] font-sans text-sm mb-6 max-w-md">
                    Log student scores in the Roster tab to compute strategic intelligence, group analysis, and longitudinal distributions.
                </p>
                <button 
                    onClick={() => {
                        showToast("Roster module initialization requested.", "info");
                    }}
                    className="px-5 py-2.5 bg-[oklch(0.72_0.18_145)] text-zinc-950 rounded-[4px] font-sans font-semibold text-xs hover:brightness-110 active:scale-95 transition-all"
                >
                    Initialize Roster
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 space-y-10 max-w-[1600px] mx-auto pb-32 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            
            {/* Minimal redesigned swiss header block and triggers */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center pb-6 border-b border-[oklch(0.60_0_0_/_0.15)] gap-6 select-none">
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold text-white tracking-tight">Intelligence Ledger</h2>
                    <p className="text-xs text-[oklch(0.60_0_0)] font-sans">
                        Analytical insights, priority tiers, and strategic clustering for cohort <span className="text-[oklch(0.72_0.18_145)] font-medium font-mono">{classProfile?.className}</span>
                    </p>
                </div>
                
                {/* Visual Actions toolbelt aligned with StudentsTab design */}
                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                    <button 
                        onClick={handleGenerateCaseStudy}
                        className="bg-[oklch(0.14_0.01_250)] border border-[oklch(0.60_0_0_/_0.15)] text-white hover:bg-[oklch(0.18_0.01_250)] font-sans font-normal rounded-[4px] h-10 px-4 flex items-center justify-center gap-2 active:scale-95 transition-all text-sm"
                    >
                        {isGeneratingStudy ? <Icon name="refresh" className="w-4 h-4 animate-spin text-[oklch(0.72_0.18_145)]" /> : <Icon name="benchmark" className="w-4 h-4 text-[oklch(0.72_0.18_145)]" />}
                        Cohort Case Study
                    </button>
                    <button 
                        onClick={handleGenerateBriefing}
                        className="bg-[oklch(0.72_0.18_145)] text-zinc-950 font-sans font-semibold rounded-[4px] h-10 px-4 flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all text-sm w-full sm:w-auto"
                    >
                        {isGeneratingBrief ? <Icon name="refresh" className="w-4 h-4 animate-spin" /> : <Icon name="brain" className="w-4 h-4 text-zinc-950" />}
                        Executive Briefing
                    </button>
                </div>
            </div>

            {/* METRIC SUMMARY CARDS: tight horizontal row, block/group layout, label above value, no icons, no bars, 1 accent color metrics */}
            <div className="flex flex-col md:flex-row items-stretch justify-start bg-[oklch(0.14_0.01_250)] border border-[oklch(0.60_0_0_/_0.15)] rounded-none select-none divide-y md:divide-y-0 md:divide-x divide-[oklch(0.60_0_0_/_0.15)]">
                {/* Metric 1 */}
                <button 
                    onClick={() => setIsAtRiskModalOpen(true)}
                    className="flex-1 flex flex-col items-start p-6 focus:outline-none hover:bg-[oklch(0.18_0.01_250)] transition-colors text-left"
                >
                    <span className="font-sans text-[12px] font-normal text-[oklch(0.60_0_0)] tracking-tight mb-2">Class Risk Protocol</span>
                    <span className="font-mono text-2xl font-semibold text-white tracking-tight tabular-nums">
                        {analytics?.atRiskList.length || 0}
                    </span>
                </button>
                
                {/* Metric 2 - ACCENT ENABLED (The single most important highlight metric) */}
                <div className="flex-1 flex flex-col items-start p-6">
                    <span className="font-sans text-[12px] font-normal text-[oklch(0.60_0_0)] tracking-tight mb-2">School Health Unit</span>
                    <span className="font-mono text-2xl font-bold tracking-tight text-[oklch(0.72_0.18_145)] tabular-nums">
                        {analytics?.healthScore}%
                    </span>
                </div>

                {/* Metric 3 */}
                <div className="flex-1 flex flex-col items-start p-6">
                    <span className="font-sans text-[12px] font-normal text-[oklch(0.60_0_0)] tracking-tight mb-2">Mastery Median Aggregate</span>
                    <span className="font-mono text-2xl font-semibold text-white tracking-tight tabular-nums">
                        {analytics?.classAvg}%
                    </span>
                </div>
            </div>

            {/* Main Visualizations and Rails */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                
                {/* Visual Grid Column - main chart & group clusters */}
                <div className="xl:col-span-8 space-y-6">
                    
                    {/* Domain Competency matrix card sheet */}
                    <div className="bg-[oklch(0.14_0.01_250)] border border-[oklch(0.60_0_0_/_0.15)] rounded-none p-8 select-none flex flex-col">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                            <div className="space-y-1">
                                <h3 className="text-base font-semibold text-white tracking-tight">Domain Competency Matrix</h3>
                                <p className="text-xs text-[oklch(0.60_0_0)] font-sans">
                                    Segment performance against targeted grade standards for level <span className="font-mono font-medium">{classProfile?.gradeLevel}</span>
                                </p>
                            </div>
                            
                            {/* Flat segmented toggle */}
                            <div className="flex bg-[oklch(0.10_0.01_250)] border border-[oklch(0.60_0_0_/_0.15)] rounded-[4px] p-0.5">
                                <button
                                    onClick={() => setChartType('radar')}
                                    className={`px-3 py-1 text-[11px] font-sans rounded-[3px] transition-all focus:outline-none ${chartType === 'radar' ? 'bg-[oklch(0.72_0.18_145)] text-zinc-950 font-semibold' : 'text-[oklch(0.60_0_0)] hover:text-white'}`}
                                >
                                    Radar
                                </button>
                                <button
                                    onClick={() => setChartType('bar')}
                                    className={`px-3 py-1 text-[11px] font-sans rounded-[3px] transition-all focus:outline-none ${chartType === 'bar' ? 'bg-[oklch(0.72_0.18_145)] text-zinc-950 font-semibold' : 'text-[oklch(0.60_0_0)] hover:text-white'}`}
                                >
                                    Grid
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex-1 w-full min-h-[350px]">
                            {chartType === 'radar' ? (
                                <LocalRadarPerformanceChart data={analytics?.domainData || []} />
                            ) : (
                                <LocalDomainBarChart data={analytics?.domainData || []} />
                            )}
                        </div>
                    </div>

                    {/* Instructional Pods - AI Grouping engine */}
                    <div className="bg-[oklch(0.14_0.01_250)] border border-[oklch(0.60_0_0_/_0.15)] rounded-none p-8 select-none">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-[oklch(0.60_0_0_/_0.10)] mb-8">
                            <div className="space-y-1">
                                <h3 className="text-base font-semibold text-white tracking-tight">Instructional Pods</h3>
                                <p className="text-xs text-[oklch(0.60_0_0)] font-sans">
                                    Micro-cohort clustering generated from student curriculum diagnostic overlap
                                </p>
                            </div>
                            <button 
                                onClick={handleGenerateGroups}
                                disabled={isGrouping}
                                className="h-9 px-4 bg-[oklch(0.72_0.18_145)] text-zinc-950 rounded-[4px] text-xs font-semibold hover:brightness-110 active:scale-95 transition-all inline-flex items-center gap-2 font-sans"
                            >
                                {isGrouping ? (
                                    <Icon name="refresh" className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <Icon name="plus" className="w-3.5 h-3.5 text-zinc-950" strokeWidth={2.5} />
                                )}
                                Compute Clusters
                            </button>
                        </div>
                        
                        {smartGroups.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {smartGroups.map((group: any, idx: number) => (
                                    <div 
                                        key={idx} 
                                        className="p-5 bg-[oklch(0.18_0.01_250)] border border-[oklch(0.60_0_0_/_0.15)] rounded-none flex flex-col justify-between"
                                    >
                                        <div>
                                            <h4 className="font-mono text-[10px] font-semibold text-[oklch(0.72_0.18_145)] uppercase tracking-wide mb-3">
                                                {group.groupName}
                                            </h4>
                                            <div className="space-y-2 mb-6">
                                                {group.studentIds.map((sid: string) => {
                                                    const s = students.find(item => item.id === sid);
                                                    return s ? (
                                                        <div key={sid} className="flex items-center gap-2.5">
                                                            <div className="w-5 h-5 bg-zinc-950 border border-[oklch(0.60_0_0_/_0.15)] overflow-hidden rounded-none shrink-0">
                                                                <img src={s.photoUrl} className="w-full h-full object-cover filter brightness-90" alt="" referrerPolicy="no-referrer" />
                                                            </div>
                                                            <span className="text-[11px] font-sans text-zinc-200">{s.name}</span>
                                                        </div>
                                                    ) : null;
                                                })}
                                            </div>
                                        </div>
                                        <div className="border-l border-[oklch(0.72_0.18_145)] pl-2.5 mt-auto">
                                            <p className="text-[11px] font-sans text-zinc-400 leading-normal italic">
                                                "{group.focus}"
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-16 text-center border-dashed border border-[oklch(0.60_0_0_/_0.15)] bg-zinc-950/20 rounded-none select-none">
                                <p className="text-[11px] font-mono uppercase tracking-wide text-[oklch(0.60_0_0)]">
                                    Assemble clustering engine to map curricular focus groups.
                                </p>
                            </div>
                        )}
                    </div>

                </div>

                {/* Right Rail Control Station: Support Distributions and At-Risk Tables */}
                <div className="xl:col-span-4 space-y-6">
                    
                    {/* Support level non-pie distribution container */}
                    <div className="bg-[oklch(0.14_0.01_250)] border border-[oklch(0.60_0_0_/_0.15)] rounded-none p-6 select-none flex flex-col">
                        <div className="mb-6 space-y-1">
                            <h3 className="text-base font-semibold text-white tracking-tight">Support Metrics</h3>
                            <p className="text-xs text-[oklch(0.60_0_0)] font-sans">Cohort instructional intervention distribution</p>
                        </div>
                        
                        <div className="space-y-5">
                            {analytics?.tiers.map((tier, idx) => {
                                const percentage = students.length > 0 ? Math.round((tier.value / students.length) * 100) : 0;
                                const isHelp = tier.name === 'Needs Help';
                                const isTrack = tier.name === 'On Track';
                                
                                const barColor = isHelp 
                                    ? 'bg-[oklch(0.65_0.20_25)]' 
                                    : isTrack 
                                        ? 'bg-[oklch(0.72_0.18_145)]' 
                                        : 'bg-[oklch(0.60_0_0_/_0.4)]';
                                
                                return (
                                    <div key={idx} className="space-y-2 select-none font-sans">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-normal text-zinc-200">{tier.name}</span>
                                            <span className="font-mono text-zinc-400 font-semibold tabular-nums">
                                                {tier.value} ({percentage}%)
                                            </span>
                                        </div>
                                        {/* Precision 0px flat segment bar representation with flat track background */}
                                        <div className="h-2 w-full bg-zinc-950/50 rounded-none overflow-hidden">
                                            <div 
                                                className={`h-full ${barColor} transition-all duration-500`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* AT RISK STUDENTS PANEL: fully compliant table layout, active sorting triggers, 2px status dots */}
                    <div className="bg-[oklch(0.14_0.01_250)] border border-[oklch(0.60_0_0_/_0.15)] rounded-none p-6 select-none flex flex-col">
                        <div className="mb-5 flex justify-between items-center">
                            <div>
                                <h3 className="text-base font-semibold text-white tracking-tight font-sans">At Risk Units</h3>
                                <p className="text-xs text-[oklch(0.60_0_0)] font-sans">Critical learning velocity anomalies</p>
                            </div>
                            <button 
                                onClick={() => setIsAtRiskModalOpen(true)}
                                className="text-xs font-semibold text-[oklch(0.72_0.18_145)] hover:underline focus:outline-none font-sans"
                            >
                                Details
                            </button>
                        </div>
                        
                        {sortedAtRiskStudents.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left font-sans text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-[oklch(0.60_0_0_/_0.15)] pb-1.5 text-[oklch(0.60_0_0)] uppercase tracking-normal">
                                            <th className="py-2 font-normal pb-3">
                                                <button 
                                                    onClick={() => toggleAtRiskSort('name')}
                                                    className="flex items-center gap-1 hover:text-white transition-colors focus:outline-none"
                                                >
                                                    Unit ID
                                                    <Icon 
                                                        name={atRiskSortBy === 'name' && atRiskSortOrder === 'desc' ? "arrowDown" : "arrowUp"} 
                                                        className="w-3 h-3 text-[oklch(0.72_0.18_145)]" 
                                                    />
                                                </button>
                                            </th>
                                            <th className="py-2 text-right font-normal pb-3 pr-4">
                                                <button 
                                                    onClick={() => toggleAtRiskSort('velocity')}
                                                    className="flex items-center gap-1 ml-auto hover:text-white transition-colors focus:outline-none pb-2 md:pb-0"
                                                >
                                                    Velocity
                                                    <Icon 
                                                        name={atRiskSortBy === 'velocity' && atRiskSortOrder === 'desc' ? "arrowDown" : "arrowUp"} 
                                                        className="w-3 h-3 text-[oklch(0.72_0.18_145)]" 
                                                    />
                                                </button>
                                            </th>
                                            <th className="py-2 text-center font-normal pb-3 w-10">Tier</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[oklch(0.60_0_0_/_0.06)] font-sans">
                                        {sortedAtRiskStudents.map(student => (
                                            <tr 
                                                key={student.id} 
                                                className="hover:bg-[oklch(0.18_0.01_250)] transition-colors group cursor-pointer"
                                                onClick={() => setIsAtRiskModalOpen(true)}
                                            >
                                                <td className="py-2.5 font-sans">
                                                    <div className="font-semibold text-white group-hover:text-[oklch(0.72_0.18_145)] transition-colors">{student.name}</div>
                                                    <div className="font-mono text-[10px] text-[oklch(0.60_0_0)] uppercase tracking-normal">Level {student.level}</div>
                                                </td>
                                                <td className="py-2.5 text-right font-mono tabular-nums text-white pr-4">
                                                    <span className={student.growthVelocity < 0 ? 'text-[oklch(0.65_0.20_25)]' : 'text-zinc-300'}>
                                                        {student.growthVelocity > 0 ? '+' : ''}{student.growthVelocity}%
                                                    </span>
                                                </td>
                                                <td className="py-2.5 text-center">
                                                    <div className="inline-flex items-center justify-center">
                                                        {/* Status representation using 2px colored dot, not a badge */}
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.65_0.20_25)]" title="Priority diagnostic alarm"></span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-6 text-xs text-[oklch(0.60_0_0)] font-sans">
                                No critical growth anomalies recorded.
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Standard Modal elements configured to premium limits */}
            <Modal isOpen={isUpgradePromptOpen} onClose={() => setIsUpgradePromptOpen(false)} title="Join the Educational Frontier" size="sm">
                <div className="space-y-6 text-center py-4 select-none">
                    <div className="w-16 h-16 bg-zinc-950 border border-[oklch(0.60_0_0_/_0.15)] text-[oklch(0.72_0.18_145)] rounded-none flex items-center justify-center mx-auto mb-4">
                        <Icon name="benchmark" className="w-8 h-8 text-[oklch(0.72_0.18_145)]" />
                    </div>
                    <h3 className="text-lg font-semibold text-white tracking-tight">Upgrade Workspace Access</h3>
                    <p className="text-zinc-400 font-sans text-xs leading-relaxed">
                        Unlock strategic intelligence briefings, cohort forecasting, and automated grouping controls with a Premium Institutional License.
                    </p>
                    <button 
                        onClick={async () => {
                            await upgradeToPremium();
                            setIsUpgradePromptOpen(false);
                            showToast("Institutional workspace upgraded successfully.", "success");
                        }}
                        className="w-full py-2.5 bg-[oklch(0.72_0.18_145)] text-zinc-950 rounded-[4px] font-sans font-semibold text-xs hover:brightness-110 shadow-lg active:scale-[0.98] transition-all"
                    >
                        Activate Premium Tier
                    </button>
                </div>
            </Modal>

            <AtRiskDetailsModal isOpen={isAtRiskModalOpen} onClose={() => setIsAtRiskModalOpen(false)} atRiskStudents={analytics?.atRiskList || []} domainCount={domains.length} />
            <ExecutiveBriefingModal isOpen={isBriefingModalOpen} onClose={() => setIsBriefingModalOpen(false)} data={briefingData} className={classProfile?.className || 'General'} />
            <CaseStudyModal isOpen={isCaseStudyModalOpen} onClose={() => setIsCaseStudyModalOpen(false)} data={caseStudyData} />
        </div>
    );
};
