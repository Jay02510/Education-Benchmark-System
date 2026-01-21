
import React, { useState, useMemo } from 'react';
import { Card } from '../components/common/Card';
import { Domain, TestPeriod, Resource } from '../types';
import { useStudents } from '../context/StudentContext';
import { useBenchmarks } from '../context/BenchmarkContext';
import { useResources } from '../context/ResourceContext';
import { Icon } from '../components/common/Icon';
import { DOMAINS, RESOURCE_TYPES } from '../constants';
import { Modal } from '../components/common/Modal';

const ResourceItem: React.FC<{ resource: Resource; onClick: () => void }> = ({ resource, onClick }) => (
    <div 
        onClick={onClick}
        className="group p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:shadow-lg transition-all cursor-pointer flex gap-4 items-center"
    >
        <div className="w-12 h-12 shrink-0 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
            <Icon name="library" className="w-6 h-6" />
        </div>
        <div className="flex-1 overflow-hidden">
            <h4 className="font-black text-slate-800 text-sm truncate">{resource.title}</h4>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 uppercase tracking-widest">{resource.type}</span>
                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Level {resource.level}</span>
            </div>
        </div>
        <Icon name="arrowRight" className="w-4 h-4 text-slate-200 group-hover:text-indigo-600 transition-colors" />
    </div>
);

export const LibraryTab: React.FC = () => {
    const { classProfile } = useStudents();
    const { benchmarks, domains } = useBenchmarks();
    const { resources } = useResources();
    const [selectedPeriod, setSelectedPeriod] = useState<TestPeriod>(TestPeriod.Baseline);
    const [selectedDomain, setSelectedDomain] = useState<Domain | 'All'>('All');
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

    const levelToUse = classProfile?.gradeLevel || '5';

    const filteredResources = useMemo(() => {
        return resources.filter(r => (selectedDomain === 'All' || r.domain === selectedDomain) && r.level === levelToUse);
    }, [resources, selectedDomain, levelToUse]);

    const displayedBenchmarks = domains.map(domain => {
        const benchData = benchmarks.find(b => b.domain === domain as Domain && b.period === selectedPeriod && b.level_name === levelToUse);
        return { domain, target: benchData?.target_percent || 70, descriptor: benchData?.descriptor_short || 'No defined protocol.' };
    });

    return (
        <div className="p-6 md:p-12 space-y-12 max-w-[1600px] mx-auto pb-32">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                <div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2 uppercase italic">Curriculum Library</h1>
                    <p className="text-slate-400 font-bold text-lg italic">Calibrating excellence for <span className="text-indigo-600 underline">Level {levelToUse}</span>.</p>
                </div>
                
                <div className="bg-white p-2 rounded-[2rem] shadow-xl border border-slate-100 flex gap-1 ring-8 ring-slate-50">
                    {Object.values(TestPeriod).map(p => (
                        <button key={p} onClick={() => setSelectedPeriod(p)} className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${selectedPeriod === p ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}>
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                <div className="xl:col-span-7">
                    <Card className="p-10 bg-white border-none shadow-2xl rounded-[3rem]">
                        <div className="flex items-center gap-5 mb-10 pb-6 border-b border-slate-50">
                            <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl shadow-inner"><Icon name="benchmark" className="w-6 h-6" /></div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Active Protocols</h2>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.25em] mt-1">{selectedPeriod} Standards Matrix</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {displayedBenchmarks.map(b => (
                                <div key={b.domain} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center group hover:bg-white hover:border-indigo-100 transition-all">
                                    <div className="flex-1">
                                        <h4 className="font-black text-slate-800 uppercase tracking-widest text-sm mb-1">{b.domain}</h4>
                                        <p className="text-xs text-slate-400 font-bold italic leading-relaxed">"{b.descriptor}"</p>
                                    </div>
                                    <div className="text-right ml-8">
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1">Target</span>
                                        <span className="text-xl font-black text-indigo-600">{b.target}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="xl:col-span-5 space-y-10">
                    <Card className="p-10 bg-slate-900 text-white rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col min-h-[600px]">
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/10 rounded-2xl text-indigo-400"><Icon name="library" className="w-6 h-6" /></div>
                                    <h3 className="text-xl font-black tracking-tight">Instructional Tools</h3>
                                </div>
                                <select 
                                    value={selectedDomain} 
                                    onChange={e => setSelectedDomain(e.target.value as any)}
                                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="All">All Domains</option>
                                    {DOMAINS.map(d => <option key={d} value={d} className="text-slate-900">{d}</option>)}
                                </select>
                            </div>

                            <div className="flex-1 space-y-3 overflow-y-auto pr-2 scrollbar-none">
                                {filteredResources.length > 0 ? (
                                    filteredResources.map(res => <ResourceItem key={res.id} resource={res} onClick={() => setSelectedResource(res)} />)
                                ) : (
                                    <div className="py-20 text-center bg-white/5 border-2 border-dashed border-white/10 rounded-3xl">
                                        <Icon name="search" className="w-12 h-12 text-white/10 mx-auto mb-4" />
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No matching resources</p>
                                    </div>
                                )}
                            </div>

                            <button className="w-full mt-10 py-5 bg-indigo-600 rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-900/40">
                                Launch Resource Generator
                            </button>
                        </div>
                    </Card>
                </div>
            </div>

            <Modal isOpen={!!selectedResource} onClose={() => setSelectedResource(null)} title={selectedResource?.title || ''} size="lg">
                {selectedResource && (
                    <div className="space-y-6">
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                             <p className="text-sm font-bold text-slate-600 leading-relaxed italic">"{selectedResource.description}"</p>
                        </div>
                        <div className="bg-slate-900 p-8 rounded-[2rem] text-slate-300 text-sm font-mono leading-relaxed whitespace-pre-wrap border border-slate-800 shadow-inner">
                            {selectedResource.content}
                        </div>
                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-50">
                            <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">Print Resource</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
