
import React, { useState, useMemo } from 'react';
import { Card } from '../components/common/Card';
import { Domain, TestPeriod } from '../types';
import { useStudents } from '../context/StudentContext';
import { useBenchmarks } from '../context/BenchmarkContext';
import { Icon } from '../components/common/Icon';
import { Tooltip } from '../components/common/Tooltip';

interface MaterialCardProps {
    title: string;
    type: 'PDF' | 'XLS' | 'DOC';
    size: string;
    category: string;
    icon: string;
}

const MaterialDownloadCard: React.FC<MaterialCardProps> = ({ title, type, size, category, icon }) => (
    <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 hover:border-indigo-100 transition-all hover:shadow-lg group">
        <div className="w-14 h-14 shrink-0 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
            <Icon name={icon} className="w-7 h-7" />
        </div>
        <div className="flex-1 overflow-hidden">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">{category}</span>
            <h4 className="font-black text-slate-800 text-sm truncate">{title}</h4>
            <div className="flex items-center gap-2 mt-1">
                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${type === 'PDF' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>{type}</span>
                <span className="text-[10px] text-slate-300 font-bold">{size}</span>
            </div>
        </div>
        <button 
            className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
            onClick={() => window.alert(`Preparing ${title} for download...`)}
        >
            <Icon name="arrowDown" className="w-5 h-5" />
        </button>
    </div>
);

interface BenchmarkRowProps {
    id?: string;
    domain: string;
    target: number;
    actual: number;
    descriptor: string;
    cefr?: string;
    yle?: string;
    hasData: boolean;
    isEditing: boolean;
    onSave: (id: string, target: number, descriptor: string) => void;
}

const BenchmarkRow: React.FC<BenchmarkRowProps> = ({ id, domain, target, actual, descriptor, cefr, yle, hasData, isEditing, onSave }) => {
    const [editTarget, setEditTarget] = useState(target);
    const [editDescriptor, setEditDescriptor] = useState(descriptor);
    const gap = actual - target;
    const isMet = actual >= target;
    const isClose = gap > -5 && gap < 0;

    let statusColor = 'text-slate-400 bg-slate-50 border-slate-100';
    let statusText = 'No Data';
    let progressColor = 'bg-slate-200';

    if (hasData) {
        if (isMet) {
            statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-100';
            statusText = 'Met';
            progressColor = 'bg-emerald-500';
        } else if (isClose) {
            statusColor = 'text-amber-700 bg-amber-50 border-amber-100';
            statusText = 'Approaching';
            progressColor = 'bg-amber-500';
        } else {
            statusColor = 'text-rose-700 bg-rose-50 border-rose-100';
            statusText = 'Below';
            progressColor = 'bg-rose-500';
        }
    }

    return (
        <div className="group grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-5 px-6 bg-white border border-gray-100 rounded-3xl mb-4 shadow-sm hover:shadow-md transition-all duration-300 hover:border-indigo-100">
            <div className="md:col-span-3">
                <p className="font-extrabold text-slate-800 text-lg tracking-tight">{domain}</p>
                <div className="flex gap-2 mt-2">
                    {cefr && cefr !== "N/A" && (
                        <span className="px-2.5 py-1 rounded-lg text-[9px] font-black bg-indigo-50 text-indigo-600 border border-indigo-100 tracking-widest uppercase">{cefr}</span>
                    )}
                    {yle && yle !== "N/A" && (
                        <span className="px-2.5 py-1 rounded-lg text-[9px] font-black bg-purple-50 text-purple-600 border border-purple-100 tracking-widest uppercase">{yle}</span>
                    )}
                </div>
            </div>

            <div className="md:col-span-4">
                {isEditing ? (
                    <div className="space-y-3 p-3 bg-slate-50 rounded-2xl">
                        <input 
                            type="text" 
                            value={editDescriptor}
                            onChange={(e) => setEditDescriptor(e.target.value)}
                            className="w-full text-sm font-bold border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="Standards Descriptor"
                        />
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Score %</span>
                            <input 
                                type="number" 
                                value={editTarget}
                                onChange={(e) => setEditTarget(Number(e.target.value))}
                                className="w-24 text-sm font-black border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            <button onClick={() => id && onSave(id, editTarget, editDescriptor)} className="ml-auto text-xs bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-95 transition-all">Save</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed mb-2 italic">"{descriptor}"</p>
                        <span className="inline-flex items-center px-3 py-1.5 text-[10px] font-black bg-slate-100 text-slate-600 rounded-xl uppercase tracking-widest">Benchmark: {target}%</span>
                    </>
                )}
            </div>

            <div className="md:col-span-3">
                 {!isEditing ? (
                    <div className="w-full px-2">
                        <div className="flex justify-between text-[10px] mb-2 font-black uppercase tracking-[0.15em] text-slate-400">
                            <span>Class Median</span>
                            <span className={`${hasData ? 'text-slate-800' : 'text-slate-300'}`}>{hasData ? `${actual}%` : '---'}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3.5 relative overflow-hidden ring-4 ring-slate-50">
                            <div 
                                className="absolute top-0 bottom-0 bg-slate-900 w-1 z-10 opacity-30" 
                                style={{ left: `${target}%` }} 
                            />
                            {hasData && (
                                <div 
                                    className={`h-full rounded-full ${progressColor} shadow-inner transition-all duration-1000`} 
                                    style={{ width: `${Math.min(actual, 100)}%` }}
                                ></div>
                            )}
                        </div>
                    </div>
                 ) : (
                     <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest text-center py-6 bg-indigo-50/50 rounded-2xl border-2 border-dashed border-indigo-100">Live Adjustment Mode</div>
                 )}
            </div>

            <div className="md:col-span-2 flex justify-end">
                {!isEditing && (
                    <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 shadow-sm ${statusColor}`}>
                        {statusText}
                    </span>
                )}
            </div>
        </div>
    );
};

export const BenchmarkFrameworkTab: React.FC = () => {
    const { students, classProfile } = useStudents();
    const { benchmarks, updateBenchmark, domains } = useBenchmarks();
    const [selectedPeriod, setSelectedPeriod] = useState<TestPeriod>(TestPeriod.Baseline);
    const [isEditing, setIsEditing] = useState(false);
    
    const averageScores = useMemo(() => {
        const totals: Record<string, number> = {};
        const counts: Record<string, number> = {};
        for (const domain of domains) { totals[domain] = 0; counts[domain] = 0; }
        students.forEach(student => {
            const assessment = student.assessments.find(a => a.type === selectedPeriod);
            if (assessment) {
                for (const domain of domains) {
                    const score = (assessment.scores as any)[domain];
                    if (score !== undefined && score !== null && score > 0) {
                        totals[domain] += score;
                        counts[domain]++;
                    }
                }
            }
        });
        const averages: Record<string, number | null> = {};
        for (const domain of domains) {
            averages[domain] = counts[domain] > 0 ? Math.round((totals[domain] / counts[domain])) : null;
        }
        return averages;
    }, [students, selectedPeriod, domains]);

    const levelToUse = classProfile?.gradeLevel || '5';
    
    const displayedBenchmarks = domains.map(domain => {
        const benchData = benchmarks.find(b => 
            b.domain === domain as Domain && 
            b.period === selectedPeriod && 
            b.level_name === levelToUse
        );
        const actualAvg = averageScores[domain];

        return {
            id: benchData?.id,
            domain,
            target: benchData?.target_percent || 70,
            descriptor: benchData?.descriptor_short || 'No defined protocol for this domain.',
            cefr: benchData?.cefr_alignment,
            yle: benchData?.yle_equivalent,
            actual: actualAvg ?? 0,
            hasData: actualAvg !== null
        };
    });

    return (
        <div className="p-6 md:p-12 space-y-12 max-w-[1600px] mx-auto pb-32">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                <div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">Pedagogical Framework</h1>
                    <p className="text-slate-400 font-bold text-lg">Calibrating institutional excellence for <span className="text-indigo-600">Level {levelToUse}</span>.</p>
                </div>
                
                <div className="bg-white p-2 rounded-[2rem] shadow-xl border border-slate-100 flex gap-1 ring-8 ring-slate-50">
                    {Object.values(TestPeriod).map(p => (
                        <button
                            key={p}
                            onClick={() => setSelectedPeriod(p)}
                            className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${
                                selectedPeriod === p 
                                    ? 'bg-slate-900 text-white shadow-xl' 
                                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Standards Grid */}
                <div className="xl:col-span-8">
                    <Card className="p-10 bg-white border-none shadow-2xl rounded-[3rem]">
                        <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-50">
                            <div className="flex items-center gap-5">
                                <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl shadow-inner">
                                    <Icon name="benchmark" className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Active Benchmarks</h2>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.25em] mt-1">{selectedPeriod} Standards Matrix</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsEditing(!isEditing)}
                                className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-2 transition-all active:scale-95 shadow-xl ${
                                    isEditing 
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-100' 
                                    : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                                }`}
                            >
                                {isEditing ? 'Sync Changes' : 'Modify Protocols'}
                            </button>
                        </div>

                        <div className="space-y-2">
                            {displayedBenchmarks.map(b => (
                                <BenchmarkRow 
                                    key={b.domain}
                                    {...b}
                                    isEditing={isEditing}
                                    onSave={(id, t, d) => updateBenchmark(id, { target_percent: t, descriptor_short: d })}
                                />
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Sidebar Materials */}
                <div className="xl:col-span-4 space-y-10">
                    <Card className="p-8 bg-slate-900 text-white rounded-[3rem] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="relative z-10">
                             <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-white/10 rounded-2xl text-indigo-400">
                                    <Icon name="library" className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black tracking-tight">Assessment Kit</h3>
                                    <p className="text-[10px] text-indigo-300/60 font-black uppercase tracking-widest mt-0.5">Level {levelToUse} Materials</p>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <MaterialDownloadCard 
                                    title={`Standard Test Paper - ${selectedPeriod}`} 
                                    category="Academic Exam" 
                                    type="PDF" 
                                    size="2.4 MB" 
                                    icon="book" 
                                />
                                <MaterialDownloadCard 
                                    title="Official Scoring Rubric" 
                                    category="Teacher Protocol" 
                                    type="PDF" 
                                    size="850 KB" 
                                    icon="shield" 
                                />
                                <MaterialDownloadCard 
                                    title="Bulk Score Entry Sheet" 
                                    category="Data Template" 
                                    type="XLS" 
                                    size="42 KB" 
                                    icon="analytics" 
                                />
                                <MaterialDownloadCard 
                                    title="Standard descriptors list" 
                                    category="Reference" 
                                    type="DOC" 
                                    size="1.1 MB" 
                                    icon="search" 
                                />
                            </div>

                            <button className="w-full mt-10 py-5 bg-indigo-600 rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-900/40">
                                Download Level {levelToUse} Pack
                            </button>
                        </div>
                    </Card>

                    <Card className="p-8 bg-indigo-50 border-2 border-indigo-100 rounded-[3rem]">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                                <Icon name="info" className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-black text-indigo-900 text-sm mb-2 uppercase tracking-widest">Logic Advisory</h4>
                                <p className="text-xs text-indigo-700/80 leading-relaxed font-medium">
                                    Benchmarks are CEFR-aligned. Ensure scores are entered within 7 days of the assessment date to preserve the accuracy of the **Growth Velocity Protocol**.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
