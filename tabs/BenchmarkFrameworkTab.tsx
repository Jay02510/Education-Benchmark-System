
import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Domain, TestPeriod, SubdomainMetadata } from '../types';
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
        <div className="mb-4">
            <div 
                onClick={() => !isEditing && setIsExpanded(!isExpanded)}
                className={`group grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-6 px-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${isExpanded ? 'ring-2 ring-indigo-100 border-indigo-200' : ''}`}
            >
                <div className="md:col-span-3">
                    <p className="font-black text-slate-900 text-xl tracking-tight uppercase italic leading-none mb-1">{domain}</p>
                    <div className="flex gap-2">
                        {cefr && <span className="px-2 py-0.5 rounded-lg text-[9px] font-black bg-indigo-50 text-indigo-600 uppercase tracking-widest border border-indigo-100">{cefr}</span>}
                        {yle && <span className="px-2 py-0.5 rounded-lg text-[9px] font-black bg-slate-50 text-slate-400 uppercase tracking-widest border border-slate-100">{yle}</span>}
                    </div>
                </div>
                <div className="md:col-span-6">
                    {isEditing ? (
                        <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100" onClick={e => e.stopPropagation()}>
                            <div>
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Instructional Explanation (AI Context)</label>
                                <textarea value={editDescriptor} onChange={e => setEditDescriptor(e.target.value)} className="w-full text-sm p-4 border-2 border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none font-bold text-slate-700" rows={2} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Target %</label>
                                    <input type="number" value={editTarget} onChange={e => setEditTarget(Number(e.target.value))} className="w-24 border-2 border-slate-200 p-2.5 rounded-xl font-black text-indigo-600 text-center focus:border-indigo-600 outline-none" />
                                </div>
                                <button onClick={() => onSave(id, { target_percent: editTarget, descriptor_short: editDescriptor })} className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Commit Benchmark</button>
                            </div>
                        </div>
                    ) : (
                        <div className="group-hover:translate-x-1 transition-transform">
                            <p className="text-md text-slate-600 font-bold italic mb-3 leading-relaxed">"{descriptor || 'Standard protocol details pending system calibration.'}"</p>
                            <div className="flex items-center gap-4">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">Target: {target}%</span>
                                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] bg-indigo-50/50 px-3 py-1 rounded-lg border border-indigo-100">Components: {subdomainsList.length}</span>
                                <Icon name={isExpanded ? "arrowUp" : "arrowDown"} className="w-3 h-3 text-slate-300" />
                            </div>
                        </div>
                    )}
                </div>
                <div className="md:col-span-3 flex justify-end">
                    <div className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-2 shadow-sm ${statusColor} transition-colors`}>
                        {!hasData ? 'Awaiting Evidence' : (isMet ? 'Standard Met' : (isClose ? 'Approaching' : 'Critical Gap'))}
                    </div>
                </div>
            </div>

            {/* Expandable Subdomain Blueprint */}
            {isExpanded && !isEditing && (
                <div className="mt-2 mx-8 p-6 bg-slate-50/50 rounded-b-[2rem] border-x border-b border-slate-100 animate-in slide-in-from-top-4 duration-300">
                    <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Mastery Component Breakdown</h4>
                        <div className="h-px bg-slate-200 flex-1 mx-6"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {subdomainsList.map((sub: SubdomainMetadata) => (
                            <SubdomainRow 
                                key={sub.name} 
                                sub={sub} 
                                domain={domain} 
                                actualScore={subdomainAverages[`${domain}:${sub.name}`] || null} 
                            />
                        ))}
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
    
    // Calculate Averages for Domains
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

    // Calculate Averages for Subdomains
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
    
    return (
        <div className="p-6 md:p-12 space-y-12 max-w-[1600px] mx-auto pb-48">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div>
                    <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-2 uppercase italic leading-none">Standards Matrix</h1>
                    <p className="text-slate-400 font-bold text-xl italic tracking-tight">Pedagogical logic for <span className="text-indigo-600 underline">Level {levelToUse}</span> cohorts.</p>
                </div>
                <div className="flex bg-white p-2 rounded-[2.5rem] shadow-2xl border border-slate-100 ring-8 ring-slate-50">
                    {Object.values(TestPeriod).map(p => (
                        <button key={p} onClick={() => setSelectedPeriod(p)} className={`px-10 py-4 rounded-3xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${selectedPeriod === p ? 'bg-slate-900 text-white shadow-xl translate-y-[-2px]' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}>{p}</button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                <div className="xl:col-span-8">
                    <Card className="p-10 bg-white shadow-2xl rounded-[3.5rem] border-0">
                        <div className="flex justify-between items-center mb-12 pb-8 border-b border-slate-50">
                            <div>
                                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Instructional Blueprint</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mt-1">Global Standard Alignment</p>
                            </div>
                            <button onClick={() => setIsEditing(!isEditing)} className={`px-10 py-4 rounded-[2rem] text-[11px] font-black transition-all uppercase tracking-widest border-b-4 ${isEditing ? 'bg-emerald-600 text-white border-emerald-900 shadow-emerald-100' : 'bg-indigo-600 text-white border-indigo-900 shadow-indigo-100'} shadow-xl active:scale-95`}>
                                {isEditing ? 'LOCK & SYNC' : 'EDIT BLUEPRINT'}
                            </button>
                        </div>
                        <div className="space-y-2">
                            {domains.length === 0 && (
                                <div className="text-center py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
                                    <Icon name="benchmark" className="w-20 h-20 text-slate-200 mx-auto mb-6" />
                                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No instructional segments mapped.</p>
                                </div>
                            )}
                            {domains.map(d => {
                                const b = benchmarks.find(i => i.domain === d as Domain && i.period === selectedPeriod && i.level_name === levelToUse);
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
                    </Card>
                </div>
                <div className="xl:col-span-4 space-y-8">
                    <Card className="p-10 bg-slate-900 text-white rounded-[3.5rem] shadow-[0_40px_100px_rgba(15,23,42,0.5)] border-0 relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
                         <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="p-3 bg-white/10 rounded-2xl text-indigo-400 shadow-inner border border-white/5"><Icon name="book" className="w-6 h-6" /></div>
                                <h3 className="text-2xl font-black tracking-tight">System Guides</h3>
                            </div>
                            <div className="space-y-6">
                                <div className="p-6 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors cursor-pointer">
                                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1 block">Testing Protocol</span>
                                    <h4 className="font-black text-white text-sm">Download {selectedPeriod} Exam Kit</h4>
                                    <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">Contains printable exams and scripts for all subdomains defined in the current Matrix.</p>
                                </div>
                                <div className="p-6 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors cursor-pointer">
                                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1 block">Scoring Matrix</span>
                                    <h4 className="font-black text-white text-sm">Official Level {levelToUse} Rubric</h4>
                                    <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">Detailed grading criteria for Writing and Speaking roleplays aligned to CEFR.</p>
                                </div>
                            </div>
                            
                            <div className="mt-12 p-8 bg-indigo-500/10 rounded-[2.5rem] border border-indigo-500/20">
                                <div className="flex items-center gap-3 mb-4">
                                    <Icon name="brain" className="w-5 h-5 text-indigo-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Calibration Logic</span>
                                </div>
                                <p className="text-sm font-bold leading-relaxed text-slate-400 italic">"The system identifies an 'Anomaly' when a student achieves mastery in 3+ subdomains but regresses in a core Domain average."</p>
                            </div>
                         </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
