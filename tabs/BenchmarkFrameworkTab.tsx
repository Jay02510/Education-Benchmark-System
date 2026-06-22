import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Domain, TestPeriod, SubdomainMetadata, Benchmark } from '../types';
import { useStudents } from '../context/StudentContext';
import { useBenchmarks } from '../context/BenchmarkContext';
import { Icon } from '../components/common/Icon';

interface SubdomainRowProps {
    sub: SubdomainMetadata;
    domain: string;
    actualScore: number | null;
}

const SubdomainRow: React.FC<SubdomainRowProps> = ({ sub, domain, actualScore }) => {
    return (
        <div className="flex items-center justify-between py-2.5 px-4 bg-zinc-900/40 border border-zinc-900 rounded-[2px] mb-2 last:mb-0 group/sub">
            <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.72_0.18_145)] group-hover/sub:scale-125 transition-transform"></div>
                <div>
                    <p className="text-xs font-semibold text-zinc-300">{sub.name}</p>
                    <p className="text-[9px] text-zinc-550 font-mono uppercase tracking-wider block mt-0.5">Max Points: {sub.maxScore}</p>
                </div>
            </div>
            <div className="text-right">
                {actualScore !== null ? (
                    <span className={`text-[10px] font-mono ${actualScore >= 80 ? 'text-[oklch(0.72_0.18_145)]' : 'text-zinc-400'}`}>
                        {actualScore}% Avg
                    </span>
                ) : (
                    <span className="text-[9px] font-mono text-zinc-650 uppercase italic">No Data</span>
                )}
            </div>
        </div>
    );
};

const BenchmarkRow: React.FC<any> = ({ id, domain, target, actual, descriptor, cefr, yle, hasData, isEditing, onSave, subdomainsList, subdomainAverages }) => {
    const [editTarget, setEditTarget] = useState(target);
    const [editDescriptor, setEditDescriptor] = useState(descriptor);
    const [isExpanded, setIsExpanded] = useState(false);
    
    useEffect(() => {
        setEditTarget(target);
        setEditDescriptor(descriptor);
    }, [target, descriptor]);

    const isMet = actual >= target;
    const isClose = (actual - target) > -5 && (actual - target) < 0;
    
    const statusStyle = !hasData 
        ? 'text-zinc-500 bg-zinc-900 border-zinc-850' 
        : (isMet 
            ? 'text-[oklch(0.72_0.18_145)] bg-[oklch(0.72_0.18_145)]/10 border-[oklch(0.72_0.18_145)]/20' 
            : (isClose 
                ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' 
                : 'text-rose-455 bg-rose-500/10 border-rose-500/20'));

    return (
        <div className="mb-4">
            <div 
                onClick={() => !isEditing && setIsExpanded(!isExpanded)}
                className={`group grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-6 px-8 bg-zinc-950 border border-zinc-900 rounded-[4px] hover:border-zinc-800 transition-all cursor-pointer ${isExpanded ? 'border-zinc-800' : ''}`}
            >
                <div className="md:col-span-3 select-none">
                    <p className="font-medium text-zinc-100 text-sm tracking-tight uppercase leading-none mb-3">{domain}</p>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1.5 font-mono">
                            <span className="px-2 py-0.5 rounded-[2px] text-[9px] bg-zinc-90 w-fit text-zinc-300 border border-zinc-850 uppercase tracking-wider">CEFR {cefr || 'A1'}</span>
                            <span className="px-2 py-0.5 rounded-[2px] text-[9px] bg-zinc-900 text-zinc-400 border border-zinc-850 uppercase tracking-wider">{yle || 'Starters'}</span>
                        </div>
                    </div>
                </div>
                <div className="md:col-span-6">
                    {isEditing ? (
                        <div className="space-y-3 bg-zinc-950/40 p-4 rounded-[4px] border border-zinc-900" onClick={e => e.stopPropagation()}>
                            <div>
                                <label className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 mb-1.5 block">Learning Descriptors</label>
                                <textarea value={editDescriptor} onChange={e => setEditDescriptor(e.target.value)} className="w-full text-xs p-3 border border-zinc-900 bg-zinc-95 text-zinc-200 rounded-[4px] focus:border-zinc-750 outline-none leading-relaxed font-sans" rows={2} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <label className="text-[9px] font-mono uppercase tracking-wider text-zinc-500">Target %</label>
                                    <input type="number" value={editTarget} onChange={e => setEditTarget(Number(e.target.value))} className="w-16 border border-zinc-90 bg-zinc-95 text-zinc-200 py-1 px-2.5 rounded-[4px] font-mono text-center text-xs outline-none focus:border-zinc-700" />
                                </div>
                                <button onClick={() => onSave(id, { target_percent: editTarget, descriptor_short: editDescriptor })} className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 px-4 py-1.5 rounded-[4px] text-xs font-semibold cursor-pointer">Update Goals</button>
                            </div>
                        </div>
                    ) : (
                        <div className="group-hover:translate-x-0.5 transition-transform">
                            <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-wider mb-1.5 block select-none">Goal:</span>
                            <p className="text-xs text-zinc-350 leading-relaxed font-normal mb-3">"{descriptor || 'Loading learning goal descriptors...'}"</p>
                            <div className="flex items-center gap-3 select-none">
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 rounded-[2px] border border-zinc-850">
                                    <Icon name="check" className="w-3.5 h-3.5 text-[oklch(0.72_0.18_145)]" />
                                    <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider">Mastery: {target}%</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[oklch(0.72_0.18_145)]/5 rounded-[2px] border border-[oklch(0.72_0.18_145)]/10">
                                    <Icon name="benchmark" className="w-3.5 h-3.5 text-[oklch(0.72_0.18_145)]/70" />
                                    <span className="text-[9px] font-mono text-[oklch(0.72_0.18_145)] uppercase tracking-wider">{subdomainsList.length} Skills Mapped</span>
                                </div>
                                <Icon name={isExpanded ? "arrowUp" : "arrowDown"} className="w-3 h-3 text-zinc-600 ml-1 shrink-0" />
                            </div>
                        </div>
                    )}
                </div>
                <div className="md:col-span-3 flex flex-col items-end gap-1.5 select-none font-mono">
                    <div className={`px-4 py-1.5 rounded-[2px] text-[9px] uppercase tracking-wider border shrink-0 font-mono ${statusStyle} transition-colors`}>
                        {!hasData ? 'Evidence Required' : (isMet ? 'Blueprint Met' : (isClose ? 'Developing' : 'Critical Gap'))}
                    </div>
                    {hasData && <p className="text-[9px] text-zinc-[600] uppercase tracking-wider">Current Median: {actual}%</p>}
                </div>
            </div>

            {/* Expandable Subdomain Blueprint */}
            {isExpanded && !isEditing && (
                <div className="mt-1 mx-4 p-5 bg-zinc-950/40 rounded-[4px] border border-zinc-900 animate-in slide-in-from-top-1 duration-200">
                    <div className="mb-4 flex items-center justify-between select-none">
                        <div className="flex items-center gap-2">
                            <Icon name="brain" className="w-3.5 h-3.5 text-zinc-500" />
                            <h4 className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Mastery Component Logic</h4>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {subdomainsList.length > 0 ? subdomainsList.map((sub: SubdomainMetadata) => (
                            <SubdomainRow 
                                key={sub.name} 
                                sub={sub} 
                                domain={domain} 
                                actualScore={subdomainAverages[`${domain}:${sub.name}`] || null} 
                            />
                        )) : (
                            <p className="col-span-full text-center text-[9px] font-mono text-zinc-650 uppercase tracking-wider py-2">No granular components defined for this domain.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export const BenchmarkFrameworkTab: React.FC = () => {
    const { students, classProfile } = useStudents();
    const { benchmarks, updateBenchmark, domains, subdomains } = useBenchmarks();
    const [selectedPeriod, setSelectedPeriod] = useState<TestPeriod>(TestPeriod.Baseline);
    const [isEditing, setIsEditing] = useState(false);
    
    const domainAverages = useMemo(() => {
        const results: Record<string, number | null> = {};
        domains.forEach(d => {
            let sum = 0, count = 0;
            students.forEach(s => {
                const a = s.assessments.find(i => i.type === selectedPeriod);
                if (a?.scores && a.scores[d as Domain] !== undefined && a.scores[d as Domain] > 0) { 
                    sum += a.scores[d as Domain]; 
                    count++; 
                }
            });
            results[d] = count > 0 ? Math.round(sum / count) : null;
        });
        return results;
    }, [students, selectedPeriod, domains]);

    const subdomainAverages = useMemo(() => {
        const results: Record<string, number | null> = {};
        domains.forEach(domain => {
            const subs = subdomains[domain] || [];
            subs.forEach(sub => {
                const key = `${domain}:${sub.name}`;
                let sum = 0, count = 0;
                students.forEach(s => {
                    const a = s.assessments.find(i => i.type === selectedPeriod);
                    const score = a?.subdomainScores?.[key];
                    if (typeof score === 'number') {
                        sum += (score / sub.maxScore) * 100;
                        count++;
                    }
                });
                results[key] = count > 0 ? Math.round(sum / count) : null;
            });
        });
        return results;
    }, [students, selectedPeriod, domains, subdomains]);

    const levelToUse = classProfile?.gradeLevel || '5';
    const activeLevelBenchmarks = benchmarks.filter(b => b.level_name === levelToUse && b.period === selectedPeriod);
    
    return (
        <div className="p-6 md:p-12 space-y-8 max-w-[1600px] mx-auto pb-48 font-sans text-zinc-150">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-zinc-900 pb-6 mb-2">
                <div className="animate-in slide-in-from-left duration-300">
                    <div className="flex items-center gap-3 mb-2 select-none">
                        <div className="w-10 h-10 bg-zinc-900 border border-zinc-850 text-[oklch(0.72_0.18_145)] flex items-center justify-center rounded-[4px]">
                            <Icon name="benchmark" className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[10px] font-mono text-[oklch(0.72_0.18_145)] uppercase tracking-wider block leading-none">Standards calibration</span>
                            <p className="text-[10px] text-zinc-550 font-mono uppercase tracking-wider block mt-1">Active Calibration: Level {levelToUse}</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 w-full lg:w-auto ml-auto">
                    <div className="flex bg-zinc-90 p-0.5 rounded-[4px] border border-zinc-90 w-full sm:w-auto selection-none">
                        {Object.values(TestPeriod).map(p => (
                            <button 
                                key={p} 
                                onClick={() => setSelectedPeriod(p)} 
                                className={`px-4 py-1.5 rounded-[2.5px] text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer w-full sm:w-auto ${
                                    selectedPeriod === p ? 'bg-zinc-950 text-zinc-100' : 'text-zinc-500 hover:text-zinc-350'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={() => setIsEditing(!isEditing)} 
                        className={`px-4 py-1.5 rounded-[4px] text-xs font-semibold cursor-pointer transition-colors flex items-center gap-2 border w-full sm:w-auto shrink-0 ${
                            isEditing 
                                ? 'bg-zinc-950 text-[oklch(0.72_0.18_145)] border-[oklch(0.72_0.18_145)]/20' 
                                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-950 border-transparent'
                        }`}
                    >
                        <Icon name={isEditing ? "check" : "settings"} className="w-3.5 h-3.5" />
                        <span>{isEditing ? 'Save Blueprint' : 'Calibrate Targets'}</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-8 space-y-2">
                    {domains.length === 0 ? (
                        <div className="text-center py-20 bg-zinc-950 rounded-[4px] border border-zinc-900 border-dashed select-none">
                            <Icon name="benchmark" className="w-10 h-10 text-zinc-700 mx-auto mb-3 animate-pulse" />
                            <p className="text-xs font-mono text-zinc-550 uppercase tracking-wider">System blueprint not initialized.</p>
                        </div>
                    ) : domains.map(d => {
                        const b = activeLevelBenchmarks.find(i => i.domain === d as Domain);
                        return (
                            <BenchmarkRow 
                                key={d} 
                                id={b?.id} 
                                domain={d} 
                                target={b?.target_percent || 70} 
                                actual={domainAverages[d] || 0} 
                                descriptor={b?.descriptor_short || ""} 
                                cefr={b?.cefr_alignment} 
                                yle={b?.yle_equivalent} 
                                hasData={domainAverages[d] !== null} 
                                isEditing={isEditing} 
                                onSave={updateBenchmark}
                                subdomainsList={subdomains[d] || []}
                                subdomainAverages={subdomainAverages}
                            />
                        );
                    })}
                </div>
                
                <div className="xl:col-span-4 space-y-6">
                    <Card className="p-6 bg-zinc-950 text-white rounded-[4px] border border-zinc-900 shadow-2xl relative overflow-hidden group">
                         <div className="absolute top-0 right-0 w-64 h-64 bg-[oklch(0.72_0.18_145)]/5 blur-[100px] rounded-full translate-x-20 -translate-y-20 transition-all"></div>
                         <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-zinc-900 rounded-[4px] text-[oklch(0.72_0.18_145)] border border-white/5 shadow-inner"><Icon name="globe" className="w-6 h-6" /></div>
                                <div>
                                    <h3 className="text-sm font-medium tracking-tight uppercase leading-none mb-1">Global Mapping</h3>
                                    <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">Cross-Platform Verification</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-5 bg-zinc-90 w-full rounded-[4px] border border-zinc-900 hover:bg-zinc-900/60 transition-colors">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider">Active Standard</span>
                                        <span className="px-2 py-0.5 bg-[oklch(0.72_0.18_145)] text-zinc-950 text-[9px] font-mono rounded-[2px]">VERIFIED</span>
                                    </div>
                                    <h4 className="text-xs font-semibold uppercase tracking-tight mb-2">CEFR Alignment: {activeLevelBenchmarks[0]?.cefr_alignment || 'Pre-A1'}</h4>
                                    <p className="text-[11px] text-zinc-405 leading-relaxed font-sans italic">"Curriculum objectives for this level are fully mapped to Common European Framework descriptors for Young Learners."</p>
                                </div>

                                <div className="p-5 bg-zinc-90 w-full rounded-[4px] border border-zinc-900 hover:bg-zinc-900/60 transition-colors">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider">Cambridge Equivalence</span>
                                    </div>
                                    <h4 className="text-xs font-semibold uppercase tracking-tight mb-2">YLE Level: {activeLevelBenchmarks[0]?.yle_equivalent || 'Starters'}</h4>
                                    <p className="text-[11px] text-zinc-450 leading-relaxed font-sans italic">"Reporting narrative dynamically adjusts to reflect Cambridge Assessment English proficiency bands."</p>
                                </div>
                            </div>
                            
                            <div className="mt-6 p-5 bg-[oklch(0.72_0.18_145)]/5 rounded-[4px] border border-[oklch(0.72_0.18_145)]/10">
                                <div className="flex items-center gap-2 mb-3 text-[oklch(0.72_0.18_145)]">
                                    <Icon name="brain" className="w-4 h-4" />
                                    <span className="text-[9px] font-mono uppercase tracking-wider">Logic Engine Insight</span>
                                </div>
                                <p className="text-[11px] leading-relaxed text-zinc-450 italic">"The Matrix uses a 5-point weighting for 'Speaking: Pronunciation' but only 1 point for 'Interaction' to reflect early-learner developmental priorities."</p>
                            </div>
                         </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
