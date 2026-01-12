
import React, { useState, useMemo } from 'react';
import { Card } from '../components/common/Card';
import { Domain, TestPeriod } from '../types';
import { useStudents } from '../context/StudentContext';
import { useBenchmarks } from '../context/BenchmarkContext';
import { DomainPerformanceChart, RadarPerformanceChart } from '../components/charts/Charts';
import { Tooltip } from '../components/common/Tooltip';

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
            {/* Domain Info */}
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

            {/* Benchmark Goal */}
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

            {/* Class Performance Bar */}
            <div className="md:col-span-3">
                 {!isEditing ? (
                    <div className="w-full">
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-slate-400 font-bold uppercase tracking-wider">Class Avg</span>
                            <span className={`font-black ${hasData ? 'text-slate-800' : 'text-slate-300'}`}>{hasData ? `${actual}%` : '--'}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 relative overflow-hidden ring-1 ring-slate-100">
                            {/* Target Marker */}
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

            {/* Status Badge */}
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
    const [chartType, setChartType] = useState<'radar' | 'bar'>('radar');
    const [isEditing, setIsEditing] = useState(false);
    
    // Real-time calculation of class averages based on Student Context
    const averageScores = useMemo(() => {
        const totals: Record<string, number> = {};
        const counts: Record<string, number> = {};
        
        // Initialize
        for (const domain of domains) { totals[domain] = 0; counts[domain] = 0; }
        
        // Aggregate
        students.forEach(student => {
            // Find the specific assessment for this period
            const assessment = student.assessments.find(a => a.type === selectedPeriod);
            
            if (assessment) {
                for (const domain of domains) {
                    // @ts-ignore
                    const score = assessment.scores[domain];
                    // IMPORTANT: Only count if score exists (is not undefined)
                    if (score !== undefined && score !== null) {
                        totals[domain] += score;
                        counts[domain]++;
                    }
                }
            }
        });

        // Calculate Average
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

    const chartData = displayedBenchmarks.map(b => ({
        domain: b.domain as Domain,
        score: b.actual,
        target: b.target
    }));

    return (
        <div className="p-6 md:p-10 h-full overflow-y-auto">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Benchmark Framework</h1>
                    <p className="text-slate-500 font-medium">
                        {classProfile?.className || 'Class'} Performance vs {levelToUse} Targets
                    </p>
                </div>
                
                {/* Period Selector */}
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                {/* Chart Card */}
                <Card className="lg:col-span-1 p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-800">Visualizer</h2>
                         <div className="flex bg-slate-50 p-1 rounded-lg">
                            <button onClick={() => setChartType('radar')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${chartType === 'radar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Radar</button>
                            <button onClick={() => setChartType('bar')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${chartType === 'bar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Bar</button>
                        </div>
                    </div>
                    <div className="flex-1 min-h-[300px]">
                         {chartType === 'radar' ? <RadarPerformanceChart data={chartData} /> : <DomainPerformanceChart data={chartData} />}
                    </div>
                    <div className="mt-4 p-4 bg-slate-50 rounded-xl text-xs text-slate-500 text-center font-medium">
                        Comparison of Class Average vs Target
                    </div>
                </Card>

                {/* List */}
                <Card className="lg:col-span-2 p-6 bg-slate-50/50 border-none shadow-none">
                     <div className="flex justify-between items-center mb-6 px-2">
                        <h2 className="text-xl font-bold text-slate-800">Standards Breakdown</h2>
                         <button 
                            onClick={() => setIsEditing(!isEditing)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold border transition ${
                                isEditing 
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' 
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            {isEditing ? 'Done Editing' : 'Edit Targets'}
                        </button>
                    </div>

                    <div className="space-y-1">
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
    );
};
