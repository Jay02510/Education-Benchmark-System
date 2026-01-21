
import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Domain, TestPeriod } from '../types';
import { useStudents } from '../context/StudentContext';
import { useBenchmarks } from '../context/BenchmarkContext';
import { Icon } from '../components/common/Icon';

interface MaterialCardProps {
    title: string;
    type: 'PDF' | 'XLS' | 'DOC';
    size: string;
    category: string;
    icon: string;
}

const MaterialDownloadCard: React.FC<MaterialCardProps> = ({ title, type, size, category, icon }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = () => {
        setIsDownloading(true);
        // Simulated Secure Asset Delivery
        setTimeout(() => {
            const blob = new Blob([`Benchmark Asset: ${title}\nCategory: ${category}\nStandard: Academic Protocol`], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title.replace(/\s+/g, '_')}_Standard.${type.toLowerCase()}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            setIsDownloading(false);
        }, 1500);
    };

    return (
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 hover:border-indigo-100 transition-all hover:shadow-lg group">
            <div className="w-14 h-14 shrink-0 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                <Icon name={isDownloading ? 'refresh' : icon} className={`w-7 h-7 ${isDownloading ? 'animate-spin text-indigo-500' : ''}`} />
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
                onClick={handleDownload}
                disabled={isDownloading}
                className={`p-3 rounded-xl transition-all ${isDownloading ? 'bg-slate-50 text-slate-200' : 'text-slate-300 hover:text-indigo-600 hover:bg-indigo-50'}`}
            >
                <Icon name="arrowDown" className="w-5 h-5" />
            </button>
        </div>
    );
};

const BenchmarkRow: React.FC<any> = ({ id, domain, target, actual, descriptor, cefr, yle, hasData, isEditing, onSave }) => {
    const [editTarget, setEditTarget] = useState(target);
    const [editDescriptor, setEditDescriptor] = useState(descriptor);
    
    useEffect(() => {
        setEditTarget(target);
        setEditDescriptor(descriptor);
    }, [target, descriptor]);

    const isMet = actual >= target;
    const isClose = (actual - target) > -5 && (actual - target) < 0;

    const statusColor = !hasData ? 'text-slate-400 bg-slate-50 border-slate-100' : (isMet ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : (isClose ? 'text-amber-700 bg-amber-50 border-amber-100' : 'text-rose-700 bg-rose-50 border-rose-100'));

    return (
        <div className="group grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-6 px-8 bg-white border border-slate-100 rounded-[2.5rem] mb-4 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="md:col-span-3">
                <p className="font-black text-slate-900 text-xl tracking-tight uppercase italic leading-none mb-1">{domain}</p>
                <div className="flex gap-2">
                    {cefr && <span className="px-2 py-0.5 rounded-lg text-[9px] font-black bg-indigo-50 text-indigo-600 uppercase tracking-widest border border-indigo-100">{cefr}</span>}
                    {yle && <span className="px-2 py-0.5 rounded-lg text-[9px] font-black bg-slate-50 text-slate-400 uppercase tracking-widest border border-slate-100">{yle}</span>}
                </div>
            </div>
            <div className="md:col-span-6">
                {isEditing ? (
                    <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div>
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Descriptor</label>
                            <textarea value={editDescriptor} onChange={e => setEditDescriptor(e.target.value)} className="w-full text-sm p-4 border-2 border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none font-bold text-slate-700" rows={2} />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Target %</label>
                                <input type="number" value={editTarget} onChange={e => setEditTarget(Number(e.target.value))} className="w-24 border-2 border-slate-200 p-2.5 rounded-xl font-black text-indigo-600 text-center focus:border-indigo-600 outline-none" />
                            </div>
                            <button onClick={() => onSave(id, { target_percent: editTarget, descriptor_short: editDescriptor })} className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Save Changes</button>
                        </div>
                    </div>
                ) : (
                    <div className="group-hover:translate-x-1 transition-transform">
                        <p className="text-md text-slate-600 font-bold italic mb-3 leading-relaxed">"{descriptor || 'Protocol standard not yet defined for this domain.'}"</p>
                        <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">Mastery Target: {target}%</span>
                            {hasData && <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">|</span>}
                            {hasData && <span className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em]">Class Median: {actual}%</span>}
                        </div>
                    </div>
                )}
            </div>
            <div className="md:col-span-3 flex justify-end">
                <div className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-2 shadow-sm ${statusColor} transition-colors`}>
                    {!hasData ? 'Awaiting Data' : (isMet ? 'Standard Met' : (isClose ? 'Approaching' : 'Critical Gap'))}
                </div>
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

    const levelToUse = classProfile?.gradeLevel || '5';
    
    return (
        <div className="p-6 md:p-12 space-y-12 max-w-[1600px] mx-auto pb-48">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div>
                    <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-2 uppercase italic leading-none">Standards Matrix</h1>
                    <p className="text-slate-400 font-bold text-xl italic tracking-tight">System logic for <span className="text-indigo-600 underline">Level {levelToUse}</span> cohorts.</p>
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
                                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Pedagogical Guardrails</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mt-1">Calibration Layer</p>
                            </div>
                            <button onClick={() => setIsEditing(!isEditing)} className="px-10 py-4 rounded-[2rem] text-[11px] font-black bg-indigo-600 text-white shadow-xl hover:bg-indigo-700 active:scale-95 transition-all uppercase tracking-widest border-b-4 border-indigo-900">
                                {isEditing ? 'SYNC FRAMEWORK' : 'EDIT TARGETS'}
                            </button>
                        </div>
                        <div className="space-y-2">
                            {domains.length === 0 && (
                                <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
                                    <Icon name="benchmark" className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No domains detected in system blueprint.</p>
                                </div>
                            )}
                            {domains.map(d => {
                                const b = benchmarks.find(i => i.domain === d as Domain && i.period === selectedPeriod && i.level_name === levelToUse);
                                return <BenchmarkRow key={d} id={b?.id} domain={d} target={b?.target_percent || 70} actual={averageScores[d] || 0} descriptor={b?.descriptor_short || ""} cefr={b?.cefr_alignment} yle={b?.yle_equivalent} hasData={averageScores[d] !== null} isEditing={isEditing} onSave={updateBenchmark} />;
                            })}
                        </div>
                    </Card>
                </div>
                <div className="xl:col-span-4 space-y-8">
                    <Card className="p-10 bg-slate-900 text-white rounded-[3.5rem] shadow-[0_40px_100px_rgba(15,23,42,0.5)] border-0">
                         <div className="flex items-center gap-4 mb-10">
                            <div className="p-3 bg-white/10 rounded-2xl text-indigo-400 shadow-inner"><Icon name="book" className="w-6 h-6" /></div>
                            <h3 className="text-2xl font-black tracking-tight">Standard Downloads</h3>
                         </div>
                         <div className="space-y-6">
                            <MaterialDownloadCard title={`Assessment Kit - ${selectedPeriod}`} category="Testing Protocol" type="PDF" size="2.4 MB" icon="book" />
                            <MaterialDownloadCard title="Scoring Rubrics" category="Evaluation Guide" type="PDF" size="850 KB" icon="shield" />
                            <MaterialDownloadCard title="Class Data Entry Sheet" category="Asset" type="XLS" size="42 KB" icon="analytics" />
                         </div>
                         
                         <div className="mt-12 p-8 bg-white/5 rounded-[2.5rem] border border-white/5">
                            <div className="flex items-center gap-3 mb-4">
                                <Icon name="brain" className="w-5 h-5 text-indigo-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Calibration Insight</span>
                            </div>
                            <p className="text-sm font-bold leading-relaxed text-slate-400 italic">"The system is currently configured for Grade {levelToUse}. Changing targets here will affect the RTI trigger sensitivity for all students in this cohort."</p>
                         </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
