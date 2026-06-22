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
        <div className="flex items-center justify-between py-2.5 px-4 bg-[oklch(0.14_0.01_250)] border border-[oklch(0.60_0_0_/_0.15)] rounded-[4px] mb-2 last:mb-0 group/sub">
            <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.72_0.18_145)] group-hover/sub:scale-125 transition-transform"></div>
                <div>
                    <p className="text-xs font-semibold text-[oklch(0.97_0_0)]">{sub.name}</p>
                    <p className="text-[10px] text-[oklch(0.60_0_0)] font-['IBM_Plex_Mono'] mt-0.5 block">Max points: {sub.maxScore}</p>
                </div>
            </div>
            <div className="text-right">
                {actualScore !== null ? (
                    <span className={`text-[11px] font-['IBM_Plex_Mono'] ${actualScore >= 80 ? 'text-[oklch(0.72_0.18_145)]' : 'text-[oklch(0.60_0_0)]'}`}>
                        {actualScore}% avg
                    </span>
                ) : (
                    <span className="text-[10px] font-['IBM_Plex_Mono'] text-[oklch(0.60_0_0)] italic">No data</span>
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

    return (
        <div className="mb-4">
            <div 
                onClick={() => !isEditing && setIsExpanded(!isExpanded)}
                className={`group grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-6 px-8 bg-[oklch(0.14_0.01_250)] border rounded-[8px] transition-all cursor-pointer hover:bg-[oklch(0.18_0.01_250)] ${
                    isExpanded 
                        ? 'border-[oklch(0.60_0_0_/_0.30)]' 
                        : 'border-[oklch(0.60_0_0_/_0.15)]'
                }`}
            >
                <div className="md:col-span-3 select-none">
                    <p className="font-medium text-[oklch(0.97_0_0)] text-sm tracking-tight leading-none mb-3">{domain}</p>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1.5 font-['IBM_Plex_Mono'] mt-1">
                            <span className="px-2 py-0.5 rounded-[4px] text-[10px] bg-[oklch(0.18_0.01_250)] text-[oklch(0.60_0_0)] border border-[oklch(0.60_0_0_/_0.15)]">
                                {`cefr ${cefr?.toLowerCase() || 'a1'}`}
                            </span>
                            <span className="px-2 py-0.5 rounded-[4px] text-[10px] bg-[oklch(0.18_0.01_250)] text-[oklch(0.60_0_0)] border border-[oklch(0.60_0_0_/_0.15)]">
                                {yle?.toLowerCase() || 'starters'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="md:col-span-6">
                    {isEditing ? (
                        <div className="space-y-3 bg-[oklch(0.14_0.01_250)] p-4 rounded-[8px] border border-[oklch(0.60_0_0_/_0.15)]" onClick={e => e.stopPropagation()}>
                            <div>
                                <label className="text-[11px] font-['IBM_Plex_Mono'] text-[oklch(0.60_0_0)] mb-1.5 block">Learning descriptors</label>
                                <textarea 
                                    value={editDescriptor} 
                                    onChange={e => setEditDescriptor(e.target.value)} 
                                    className="w-full text-xs p-3 border border-[oklch(0.60_0_0_/_0.15)] bg-[oklch(0.18_0.01_250)] text-[oklch(0.97_0_0)] rounded-[4px] focus:border-[oklch(0.60_0_0_/_0.30)] outline-none leading-relaxed font-sans" 
                                    rows={2} 
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <label className="text-[11px] font-['IBM_Plex_Mono'] text-[oklch(0.60_0_0)]">Target %</label>
                                    <input 
                                        type="number" 
                                        value={editTarget} 
                                        onChange={e => setEditTarget(Number(e.target.value))} 
                                        className="w-16 border border-[oklch(0.60_0_0_/_0.15)] bg-[oklch(0.18_0.01_250)] text-[oklch(0.97_0_0)] py-1 px-2.5 rounded-[4px] font-['IBM_Plex_Mono'] text-center text-xs outline-none focus:border-[oklch(0.60_0_0_/_0.30)]" 
                                    />
                                </div>
                                <button 
                                    onClick={() => onSave(id, { target_percent: editTarget, descriptor_short: editDescriptor })} 
                                    className="bg-[oklch(0.97_0_0)] hover:bg-[oklch(0.97_0_0)]/90 text-[oklch(0.10_0_0)] px-4 py-1.5 rounded-[4px] text-xs font-semibold cursor-pointer"
                                >
                                    Update goals
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="group-hover:translate-x-0.5 transition-transform">
                            <span className="text-[11px] font-['IBM_Plex_Mono'] text-[oklch(0.60_0_0)] mb-1.5 block select-none">Goal:</span>
                            <p className="text-xs text-[oklch(0.60_0_0)] leading-relaxed font-normal mb-3">"{descriptor || 'Loading learning goal descriptors...'}"</p>
                            <div className="flex items-center gap-3 select-none">
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[oklch(0.18_0.01_250)] rounded-[4px] border border-[oklch(0.60_0_0_/_0.15)]">
                                    <Icon name="check" className="w-3.5 h-3.5 text-[oklch(0.72_0.18_145)]" />
                                    <span className="text-[10px] font-['IBM_Plex_Mono'] text-[oklch(0.60_0_0)]">Mastery: {target}%</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[oklch(0.18_0.01_250)] rounded-[4px] border border-[oklch(0.60_0_0_/_0.15)]">
                                    <Icon name="benchmark" className="w-3.5 h-3.5 text-[oklch(0.60_0_0)]" />
                                    <span className="text-[10px] font-['IBM_Plex_Mono'] text-[oklch(0.60_0_0)]">{subdomainsList.length} skills mapped</span>
                                </div>
                                <Icon name={isExpanded ? "arrowUp" : "arrowDown"} className="w-3 h-3 text-[oklch(0.60_0_0)] ml-1 shrink-0" />
                            </div>
                        </div>
                    )}
                </div>
                <div className="md:col-span-3 flex flex-col items-end gap-1.5 select-none text-right font-['IBM_Plex_Mono'] text-[11px] font-medium">
                    <div className={`pl-3 pr-1 py-1.5 border-l-2 bg-transparent shrink-0 font-['IBM_Plex_Mono'] text-[11px] font-medium ${
                        !hasData 
                            ? 'border-l-[oklch(0.60_0_0)] text-[oklch(0.60_0_0)]' 
                            : (isMet 
                                ? 'border-l-[oklch(0.72_0.18_145)] text-[oklch(0.72_0.18_145)]' 
                                : 'border-l-[oklch(0.65_0.20_25)] text-[oklch(0.65_0.20_25)]')
                    }`}>
                        {!hasData ? 'Evidence required' : (isMet ? 'Blueprint met' : (isClose ? 'Developing' : 'Critical gap'))}
                    </div>
                    {hasData && <p className="text-[10px] font-['IBM_Plex_Mono'] text-[oklch(0.60_0_0)] mt-1.5">Current median: {actual}%</p>}
                </div>
            </div>

            {/* Expandable Subdomain Blueprint */}
            {isExpanded && !isEditing && (
                <div className="mt-1 mx-4 p-5 bg-[oklch(0.18_0.01_250)] rounded-none border border-[oklch(0.60_0_0_/_0.15)] animate-in slide-in-from-top-1 duration-200">
                    <div className="mb-4 flex items-center justify-between select-none">
                        <div className="flex items-center gap-2">
                            <Icon name="brain" className="w-3.5 h-3.5 text-[oklch(0.60_0_0)]" />
                            <h4 className="text-[11px] font-['IBM_Plex_Mono'] text-[oklch(0.60_0_0)]">Mastery component logic</h4>
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
                            <p className="col-span-full text-center text-[11px] font-['IBM_Plex_Mono'] text-[oklch(0.60_0_0)] py-2">No granular components defined for this domain.</p>
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
        <div className="p-6 md:p-12 space-y-8 max-w-[1600px] mx-auto pb-48 font-sans text-[oklch(0.97_0_0)] bg-[oklch(0.10_0.01_250)]">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-[oklch(0.60_0_0_/_0.15)] pb-6 mb-2">
                <div className="animate-in slide-in-from-left duration-300">
                    <div className="flex items-center gap-3 mb-2 select-none">
                        <div className="w-10 h-10 bg-[oklch(0.14_0.01_250)] border border-[oklch(0.60_0_0_/_0.15)] text-[oklch(0.72_0.18_145)] flex items-center justify-center rounded-[4px]">
                            <Icon name="benchmark" className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[10px] font-['IBM_Plex_Mono'] text-[oklch(0.72_0.18_145)] block leading-none">Standards calibration</span>
                            <p className="text-[10px] text-[oklch(0.60_0_0)] font-['IBM_Plex_Mono'] block mt-1">Active calibration: level {levelToUse}</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 w-full lg:w-auto ml-auto">
                    <div className="flex bg-[oklch(0.14_0.01_250)] p-0.5 rounded-[4px] border border-[oklch(0.60_0_0_/_0.15)] w-full sm:w-auto select-none">
                        {Object.values(TestPeriod).map(p => (
                            <button 
                                key={p} 
                                onClick={() => setSelectedPeriod(p)} 
                                className={`px-4 py-1.5 rounded-[4px] text-[10px] font-['IBM_Plex_Mono'] transition-colors cursor-pointer w-full sm:w-auto ${
                                    selectedPeriod === p 
                                        ? 'bg-[oklch(0.18_0.01_250)] text-[oklch(0.97_0_0)]' 
                                        : 'text-[oklch(0.60_0_0)] hover:text-[oklch(0.97_0_0)]'
                                }`}
                            >
                                {p.toLowerCase()}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={() => setIsEditing(!isEditing)} 
                        className={`px-4 py-1.5 rounded-[4px] text-xs font-semibold cursor-pointer transition-colors flex items-center gap-2 border w-full sm:w-auto shrink-0 ${
                            isEditing 
                                ? 'bg-[oklch(0.18_0.01_250)] text-[oklch(0.72_0.18_145)] border-[oklch(0.72_0.18_145)]/20 shadow-none' 
                                : 'bg-[oklch(0.97_0_0)] hover:bg-[oklch(0.97_0_0)]/90 text-[oklch(0.10_0_0)] border-transparent'
                        }`}
                    >
                        <Icon name={isEditing ? "check" : "settings"} className="w-3.5 h-3.5" />
                        <span>{isEditing ? 'Save blueprint' : 'Calibrate targets'}</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-8 space-y-2">
                    {domains.length === 0 ? (
                        <div className="text-center py-16 bg-[oklch(0.14_0.01_250)] rounded-[8px] border border-[oklch(0.60_0_0_/_0.15)]">
                            <p className="text-[13px] text-[oklch(0.97_0_0)] mb-4">System blueprint is not initialized.</p>
                            <button onClick={() => window.location.reload()} className="px-4 py-1.5 bg-[oklch(0.18_0.01_250)] hover:bg-[oklch(0.14_0.01_250)] text-[oklch(0.97_0_0)] text-xs font-semibold rounded-[4px] border border-[oklch(0.60_0_0_/_0.15)] transition-colors cursor-pointer">
                                Reload system
                            </button>
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
                    <Card className="p-6 bg-[oklch(0.14_0.01_250)] text-[oklch(0.97_0_0)] rounded-[8px] border border-[oklch(0.18_0.01_250)] shadow-none relative overflow-hidden group">
                         <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-[oklch(0.18_0.01_250)] rounded-[4px] text-[oklch(0.72_0.18_145)] border border-[oklch(0.60_0_0_/_0.15)]">
                                    <Icon name="globe" className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium tracking-tight text-[oklch(0.97_0_0)] mb-1">Global mapping</h3>
                                    <p className="text-[11px] font-['IBM_Plex_Mono'] text-[oklch(0.60_0_0)] font-medium">Cross-platform verification</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-5 bg-[oklch(0.18_0.01_250)] w-full rounded-[8px] border border-[oklch(0.60_0_0_/_0.15)] hover:bg-[oklch(0.18_0.01_250)]/80 transition-colors">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[11px] font-['IBM_Plex_Mono'] text-[oklch(0.60_0_0)]">Active standard</span>
                                        <span className="px-2 py-0.5 border border-[oklch(0.72_0.18_145)] text-[oklch(0.72_0.18_145)] text-[10px] font-['IBM_Plex_Mono'] rounded-[4px] bg-transparent">verified</span>
                                    </div>
                                    <h4 className="text-xs font-semibold text-[oklch(0.97_0_0)] mb-2">Cefr alignment: {activeLevelBenchmarks[0]?.cefr_alignment || 'Pre-A1'}</h4>
                                    <p className="text-[11.5px] text-[oklch(0.60_0_0)] leading-relaxed font-sans italic">"Curriculum objectives for this level are fully mapped to Common European Framework descriptors for Young Learners."</p>
                                </div>

                                <div className="p-5 bg-[oklch(0.18_0.01_250)] w-full rounded-[8px] border border-[oklch(0.60_0_0_/_0.15)] hover:bg-[oklch(0.18_0.01_250)]/80 transition-colors">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[11px] font-['IBM_Plex_Mono'] text-[oklch(0.60_0_0)]">Cambridge equivalence</span>
                                    </div>
                                    <h4 className="text-xs font-semibold text-[oklch(0.97_0_0)] mb-2">Yle level: {activeLevelBenchmarks[0]?.yle_equivalent || 'Starters'}</h4>
                                    <p className="text-[11.5px] text-[oklch(0.60_0_0)] leading-relaxed font-sans italic">"Reporting narrative dynamically adjusts to reflect Cambridge Assessment English proficiency bands."</p>
                                </div>
                            </div>
                            
                            <div className="mt-6 p-5 bg-[oklch(0.20_0.06_145)] rounded-[4px] border border-[oklch(0.72_0.18_145)]/15">
                                <div className="flex items-center gap-2 mb-3 text-[oklch(0.72_0.18_145)]">
                                    <Icon name="brain" className="w-4 h-4" />
                                    <span className="text-[11px] font-['IBM_Plex_Mono']">Logic engine insight</span>
                                </div>
                                <p className="text-[11.5px] leading-relaxed text-[oklch(0.60_0_0)] italic">"The Matrix uses a 5-point weighting for 'Speaking: Pronunciation' but only 1 point for 'Interaction' to reflect early-learner developmental priorities."</p>
                            </div>
                         </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
