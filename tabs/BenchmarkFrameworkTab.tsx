
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
        <div className="flex items-center justify-between py-3 px-6 bg-white/50 border border-slate-100 rounded-xl mb-2 last:mb-0 group/sub">
            <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 group-hover/sub:scale-150 transition-transform"></div>
                <div>
                    <p className="text-xs font-bold text-slate-700">{sub.name}</p>
                    <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">Max Points: {sub.maxScore}</p>
                </div>
            </div>
            <div className="text-right">
                {actualScore !== null ? (
                    <span className={`text-[10px] font-black ${actualScore >= 80 ? 'text-emerald-500' : 'text-indigo-400'}`}>
                        {actualScore}% Avg
                    </span>
                ) : (
                    <span className="text-[9px] font-bold text-slate-300 uppercase italic">No Data</span>
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
    const statusColor = !hasData ? 'text-slate-400 bg-slate-50 border-slate-100' : (isMet ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : (isClose ? 'text-amber-700 bg-amber-50 border-amber-100' : 'text-rose-700 bg-rose-50 border-rose-100'));

    return (
        <div className="mb-6">
            <div 
                onClick={() => !isEditing && setIsExpanded(!isExpanded)}
                className={`group grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-8 px-10 bg-white border border-slate-100 rounded-[3rem] shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer ${isExpanded ? 'ring-2 ring-indigo-500/20 border-indigo-200 -translate-y-1' : ''}`}
            >
                <div className="md:col-span-3">
                    <p className="font-black text-slate-900 text-2xl tracking-tighter uppercase italic leading-none mb-3">{domain}</p>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg text-[9px] font-black bg-indigo-600 text-white uppercase tracking-widest shadow-sm">CEFR {cefr || 'A1'}</span>
                            <span className="px-2.5 py-1 rounded-lg text-[9px] font-black bg-slate-900 text-white uppercase tracking-widest shadow-sm">{yle || 'Starters'}</span>
                        </div>
                    </div>
                </div>
                <div className="md:col-span-6">
                    {isEditing ? (
                        <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100" onClick={e => e.stopPropagation()}>
                            <div>
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Learning Goals</label>
                                <textarea value={editDescriptor} onChange={e => setEditDescriptor(e.target.value)} className="w-full text-sm p-4 border-2 border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none font-bold text-slate-700" rows={3} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Target %</label>
                                    <input type="number" value={editTarget} onChange={e => setEditTarget(Number(e.target.value))} className="w-24 border-2 border-slate-200 p-2.5 rounded-xl font-black text-indigo-600 text-center focus:border-indigo-600 outline-none" />
                                </div>
                                <button onClick={() => onSave(id, { target_percent: editTarget, descriptor_short: editDescriptor })} className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Update Goals</button>
                            </div>
                        </div>
                    ) : (
                        <div className="group-hover:translate-x-1 transition-transform">
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-2 block">Goal:</span>
                            <p className="text-md text-slate-700 font-bold leading-relaxed mb-4">"{descriptor || 'Loading learning goals...'}"</p>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                                    <Icon name="check" className="w-3.5 h-3.5 text-indigo-500" strokeWidth={3} />
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mastery: {target}%</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50/50 rounded-full border border-indigo-100">
                                    <Icon name="benchmark" className="w-3.5 h-3.5 text-indigo-400" />
                                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{subdomainsList.length} Skills Mapped</span>
                                </div>
                                <Icon name={isExpanded ? "arrowUp" : "arrowDown"} className={`w-3 h-3 text-slate-300 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                        </div>
                    )}
                </div>
                <div className="md:col-span-3 flex flex-col items-end gap-2">
                    <div className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-2 shadow-sm ${statusColor} transition-colors`}>
                        {!hasData ? 'Evidence Required' : (isMet ? 'Blueprint Met' : (isClose ? 'Developing' : 'Critical Gap'))}
                    </div>
                    {hasData && <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Current Median: {actual}%</p>}
                </div>
            </div>

            {/* Expandable Subdomain Blueprint */}
            {isExpanded && !isEditing && (
                <div className="mt-2 mx-10 p-8 bg-slate-50/50 rounded-b-[3rem] border-x border-b border-slate-100 animate-in slide-in-from-top-4 duration-500 shadow-inner">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Icon name="brain" className="w-4 h-4 text-indigo-400" />
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Mastery Component Logic</h4>
                        </div>
                        <div className="h-px bg-slate-200 flex-1 mx-8 opacity-50"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subdomainsList.length > 0 ? subdomainsList.map((sub: SubdomainMetadata) => (
                            <SubdomainRow 
                                key={sub.name} 
                                sub={sub} 
                                domain={domain} 
                                actualScore={subdomainAverages[`${domain}:${sub.name}`] || null} 
                            />
                        )) : (
                            <p className="col-span-full text-center text-[10px] font-black text-slate-300 uppercase py-4">No granular components defined for this domain.</p>
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
        <div className="p-6 md:p-12 space-y-12 max-w-[1600px] mx-auto pb-48 scrollbar-hide">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
                <div className="animate-in slide-in-from-left duration-700">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200">
                            <Icon name="benchmark" className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-black text-indigo-600 uppercase tracking-[0.4em]">Instructional OS</span>
                    </div>
                    <h1 className="text-7xl font-black text-slate-900 tracking-tighter mb-4 uppercase italic leading-[0.85]">Standards <br/>Matrix</h1>
                    <p className="text-slate-400 font-bold text-2xl italic tracking-tight">Active Calibration: <span className="text-indigo-600 underline underline-offset-8 decoration-4">Level {levelToUse}</span></p>
                </div>

                <div className="flex flex-col items-end gap-6">
                    <div className="flex bg-white p-2.5 rounded-[2.5rem] shadow-2xl border border-slate-100 ring-[12px] ring-slate-50/50">
                        {Object.values(TestPeriod).map(p => (
                            <button key={p} onClick={() => setSelectedPeriod(p)} className={`px-12 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${selectedPeriod === p ? 'bg-slate-900 text-white shadow-2xl translate-y-[-2px]' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}>{p}</button>
                        ))}
                    </div>
                    <button onClick={() => setIsEditing(!isEditing)} className={`px-12 py-5 rounded-[2rem] text-[11px] font-black transition-all uppercase tracking-widest border-b-[6px] shadow-xl active:scale-95 flex items-center gap-3 ${isEditing ? 'bg-emerald-600 text-white border-emerald-900' : 'bg-indigo-600 text-white border-indigo-900'}`}>
                        <Icon name={isEditing ? "check" : "settings"} className="w-4 h-4" />
                        {isEditing ? 'Save Logic Blueprint' : 'Calibrate Targets'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                <div className="xl:col-span-8 space-y-2">
                    {domains.length === 0 ? (
                        <div className="text-center py-32 bg-white rounded-[4rem] border-4 border-dashed border-slate-100 shadow-inner">
                            <Icon name="benchmark" className="w-24 h-24 text-slate-100 mx-auto mb-8" />
                            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-sm">System blueprint not initialized.</p>
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
                
                <div className="xl:col-span-4 space-y-10">
                    <Card className="p-10 bg-slate-950 text-white rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
                         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full translate-x-20 -translate-y-20 transition-all group-hover:bg-indigo-500/20"></div>
                         <div className="relative z-10">
                            <div className="flex items-center gap-5 mb-12">
                                <div className="p-4 bg-white/5 rounded-2xl text-indigo-400 border border-white/10 shadow-inner"><Icon name="globe" className="w-8 h-8" /></div>
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight leading-none mb-1">Global Mapping</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cross-Platform Verification</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Active Standard</span>
                                        <span className="px-2 py-1 bg-indigo-500 text-[9px] font-black rounded-lg">VERIFIED</span>
                                    </div>
                                    <h4 className="text-xl font-black mb-3">CEFR Alignment: {activeLevelBenchmarks[0]?.cefr_alignment || 'Pre-A1'}</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed font-bold italic">"Curriculum objectives for this level are fully mapped to Common European Framework descriptors for Young Learners."</p>
                                </div>

                                <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cambridge Equivalence</span>
                                    </div>
                                    <h4 className="text-xl font-black mb-3">YLE Level: {activeLevelBenchmarks[0]?.yle_equivalent || 'Starters'}</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed font-bold italic">"Reporting narrative dynamically adjusts to reflect Cambridge Assessment English proficiency bands."</p>
                                </div>
                            </div>
                            
                            <div className="mt-12 p-8 bg-indigo-600/10 rounded-[2.5rem] border border-indigo-600/20 shadow-inner">
                                <div className="flex items-center gap-3 mb-4 text-indigo-400">
                                    <Icon name="brain" className="w-5 h-5" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Logic Engine Insight</span>
                                </div>
                                <p className="text-sm font-bold leading-relaxed text-slate-400 italic">"The Matrix uses a 5-point weighting for 'Speaking: Pronunciation' but only 1 point for 'Interaction' to reflect early-learner developmental priorities."</p>
                            </div>
                         </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
