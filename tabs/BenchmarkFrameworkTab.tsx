
import React, { useState, useMemo } from 'react';
import { Card } from '../components/common/Card';
import { Domain, TestPeriod } from '../types';
import { useStudents } from '../context/StudentContext';
import { useBenchmarks } from '../context/BenchmarkContext';
import { DomainPerformanceChart, RadarPerformanceChart } from '../components/charts/Charts';
import { Tooltip } from '../components/common/Tooltip';
import { Icon } from '../components/common/Icon';

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
        <div className="group grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-5 px-6 bg-white border border-gray-100 rounded-2xl mb-3 shadow-sm hover:shadow-md transition-all duration-300 hover:border-indigo-100">
            <div className="md:col-span-3">
                <p className="font-extrabold text-slate-800 text-lg">{domain}</p>
                <div className="flex gap-2 mt-2">
                    {cefr && cefr !== "N/A" && (
                      <Tooltip content="The International standard for language ability.">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 tracking-wide">{cefr}</span>
                      </Tooltip>
                    )}
                    {yle && yle !== "N/A" && (
                      <Tooltip content="Cambridge English equivalent level (Starters, Movers, Flyers).">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-600 border border-purple-100 tracking-wide">{yle}</span>
                      </Tooltip>
                    )}
                </div>
            </div>

            <div className="md:col-span-4">
                {isEditing ? (
                    <div className="space-y-3 p-3 bg-slate-50 rounded-xl">
                        <input 
                            type="text" 
                            value={editDescriptor}
                            onChange={(e) => setEditDescriptor(e.target.value)}
                            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Descriptor"
                        />
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-500">Target %:</span>
                            <input 
                                type="number" 
                                value={editTarget}
                                onChange={(e) => setEditTarget(Number(e.target.value))}
                                className="w-20 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <button onClick={() => id && onSave(id, editTarget, editDescriptor)} className="ml-auto text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold shadow-sm">Save</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed mb-2">"{descriptor}"</p>
                        <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold bg-slate-100 text-slate-600 rounded-lg">Target: {target}%</span>
                    </>
                )}
            </div>

            <div className="md:col-span-3">
                 {!isEditing ? (
                    <div className="w-full">
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-slate-400 font-bold uppercase tracking-wider">Class Avg</span>
                            <span className={`font-black ${hasData ? 'text-slate-800' : 'text-slate-300'}`}>{hasData ? `${actual}%` : '--'}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 relative overflow-hidden ring-1 ring-slate-100">
                            <div 
                                className="absolute top-0 bottom-0 bg-slate-800 w-0.5 z-10 opacity-20" 
                                style={{ left: `${target}%` }} 
                                title={`Target: ${target}%`}
                            />
                            {hasData && (
                                <div 
                                    className={`h-full rounded-full ${progressColor} shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-all duration-500`} 
                                    style={{ width: `${Math.min(actual, 100)}%` }}
                                ></div>
                            )}
                        </div>
                    </div>
                 ) : (
                     <div className="text-xs text-slate-400 italic text-center border-2 border-dashed border-slate-100 rounded-xl py-4">Editing Mode</div>
                 )}
            </div>

            <div className="md:col-span-2 flex justify-end">
                {!isEditing && (
                    <span className={`px-4 py-1.5 rounded-xl text-xs font-black border ${statusColor}`}>
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
                    if (score !== undefined && score !== null) {
                        totals[domain] += score;
                        counts[domain]++;
                    }
                }
            }
        });
        const averages: Record<string, number | null> = {};
        for (const domain of domains) {
            averages[domain] = counts[domain] > 0 ? Math.round((totals[domain] / counts[domain]) * 10) / 10 : null;
        }
        return averages;
    }, [students, selectedPeriod, domains]);

    const levelToUse = classProfile?.gradeLevel || 'Level 5';
    
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
            target: benchData?.target_percent || 0,
            descriptor: benchData?.descriptor_short || 'No benchmark defined',
            cefr: benchData?.cefr_alignment,
            yle: benchData?.yle_equivalent,
            actual: actualAvg ?? 0,
            hasData: actualAvg !== null
        };
    });

    return (
        <div className="p-6 md:p-10 h-full overflow-y-auto bg-[#F8FAFC]">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Benchmark Framework</h1>
                        <p className="text-slate-500 font-medium">
                            Setting performance targets for <span className="text-indigo-600 font-bold">{levelToUse}</span>
                        </p>
                    </div>
                    
                    <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 flex gap-1">
                        {Object.values(TestPeriod).map(p => (
                            <button
                                key={p}
                                onClick={() => setSelectedPeriod(p)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                                    selectedPeriod === p 
                                        ? 'bg-slate-900 text-white shadow-lg' 
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 mb-10">
                    <Card className="p-8 bg-white border-none shadow-xl">
                        <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-50">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                    <Icon name="benchmark" className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800">Learning Standards</h2>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">Academic Targets & Gap Analysis</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsEditing(!isEditing)}
                                className={`px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest border transition-all active:scale-95 ${
                                    isEditing 
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100' 
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {isEditing ? 'Save Changes' : 'Edit Framework'}
                            </button>
                        </div>

                        <div className="space-y-4">
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
            </div>
        </div>
    );
};
