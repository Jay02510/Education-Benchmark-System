
import React, { useState, useMemo } from 'react';
import { Card } from '../components/common/Card';
import { Domain, TestPeriod, Resource } from '../types';
import { useStudents } from '../context/StudentContext';
import { useBenchmarks } from '../context/BenchmarkContext';
import { useResources } from '../context/ResourceContext';
import { useChat } from '../context/ChatContext';
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
    const { sendMessage, toggleChat } = useChat();
    const [selectedPeriod, setSelectedPeriod] = useState<TestPeriod>(TestPeriod.Baseline);
    const [selectedDomain, setSelectedDomain] = useState<Domain | 'All'>('All');
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

    const levelToUse = classProfile?.gradeLevel || '5';

    const filteredResources = useMemo(() => {
        return resources.filter(r => (selectedDomain === 'All' || r.domain === selectedDomain) && r.level === levelToUse);
    }, [resources, selectedDomain, levelToUse]);

    const displayedBenchmarks = domains.map(domain => {
        const benchData = benchmarks.find(b => b.domain === domain as Domain && b.period === selectedPeriod && b.level_name === levelToUse);
        return { 
            domain, 
            target: benchData?.target_percent || 70, 
            descriptor: benchData?.descriptor_short || 'Standard protocol not defined for this cycle.',
            cefr: benchData?.cefr_alignment || 'A1',
            yle: benchData?.yle_equivalent || 'Starters'
        };
    });

    const handleAIGen = () => {
        toggleChat();
        sendMessage(`I need to generate a new instructional resource for Grade ${levelToUse}. Please suggest a Micro-Lesson for the domain of ${selectedDomain === 'All' ? 'Reading' : selectedDomain}. Based on current standards for ${selectedPeriod}, ensure it maps to CEFR benchmarks.`);
    };

    return (
        <div className="p-6 md:p-12 space-y-12 max-w-[1600px] mx-auto pb-32">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                <div>
                    <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-2 uppercase italic leading-none">Resource Hub</h1>
                    <p className="text-slate-400 font-bold text-xl italic tracking-tight">Active Logic Bank: <span className="text-indigo-600">Level {levelToUse}</span> Protocols.</p>
                </div>
                
                <div className="bg-white p-2.5 rounded-[2.5rem] shadow-2xl border border-slate-100 flex gap-1 ring-[10px] ring-slate-50/50">
                    {Object.values(TestPeriod).map(p => (
                        <button key={p} onClick={() => setSelectedPeriod(p)} className={`px-10 py-4 rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${selectedPeriod === p ? 'bg-slate-900 text-white shadow-xl translate-y-[-2px]' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}>
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                <div className="xl:col-span-7">
                    <Card className="p-12 bg-white border-none shadow-2xl rounded-[4rem]">
                        <div className="flex justify-between items-start mb-12 pb-8 border-b border-slate-100">
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl shadow-inner border border-indigo-100"><Icon name="benchmark" className="w-8 h-8" /></div>
                                <div>
                                    <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-1">Active Standards</h2>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.25em]">{selectedPeriod} Global Can-Do List</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[11px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 shadow-sm mb-1">CEFR {displayedBenchmarks[0]?.cefr || 'A1'}</span>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{displayedBenchmarks[0]?.yle || 'Starters'} Level</span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {displayedBenchmarks.map(b => (
                                <div key={b.domain} className="p-8 bg-slate-50/50 rounded-3xl border border-slate-100 flex justify-between items-center group hover:bg-white hover:border-indigo-100 transition-all shadow-sm hover:shadow-md">
                                    <div className="flex-1">
                                        <h4 className="font-black text-slate-900 uppercase tracking-widest text-lg mb-2">{b.domain}</h4>
                                        <p className="text-xs text-slate-500 font-bold leading-relaxed italic max-w-lg">"{b.descriptor}"</p>
                                    </div>
                                    <div className="text-right ml-10">
                                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] block mb-2 opacity-60">Benchmark</span>
                                        <span className="text-3xl font-black text-slate-900 tracking-tighter">{b.target}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="xl:col-span-5 space-y-10">
                    <Card className="p-12 bg-slate-900 text-white rounded-[4rem] shadow-2xl relative overflow-hidden flex flex-col min-h-[700px] border-0">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[80px] rounded-full translate-x-20 -translate-y-20"></div>
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-5">
                                    <div className="p-4 bg-white/10 rounded-2xl text-indigo-400 border border-white/5 shadow-inner"><Icon name="library" className="w-8 h-8" /></div>
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tight leading-none mb-1">Protocol Bank</h3>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Instructional Materials</p>
                                    </div>
                                </div>
                                <select 
                                    value={selectedDomain} 
                                    onChange={e => setSelectedDomain(e.target.value as any)}
                                    className="bg-white/10 border border-white/10 rounded-2xl px-6 py-3 text-[11px] font-black uppercase outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all cursor-pointer shadow-lg"
                                >
                                    <option value="All">All Domains</option>
                                    {DOMAINS.map(d => <option key={d} value={d} className="text-slate-900">{d}</option>)}
                                </select>
                            </div>

                            <div className="flex-1 space-y-4 overflow-y-auto pr-3 scrollbar-none">
                                {filteredResources.length > 0 ? (
                                    filteredResources.map(res => <ResourceItem key={res.id} resource={res} onClick={() => setSelectedResource(res)} />)
                                ) : (
                                    <div className="py-24 text-center bg-white/5 border-2 border-dashed border-white/10 rounded-[3rem]">
                                        <Icon name="search" className="w-16 h-16 text-white/10 mx-auto mb-6" />
                                        <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">No segments mapped</p>
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={handleAIGen}
                                className="w-full mt-12 py-7 bg-indigo-600 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-950/50 active:scale-95 border-b-[8px] border-indigo-900"
                            >
                                <span className="flex items-center justify-center gap-3">
                                    <Icon name="brain" className="w-5 h-5" />
                                    Launch AI Resource Engine
                                </span>
                            </button>
                        </div>
                    </Card>

                    <div className="p-10 bg-indigo-600/5 border-2 border-indigo-100 rounded-[3rem] shadow-sm relative group overflow-hidden">
                        <div className="absolute -bottom-4 -right-4 text-indigo-100/50 transform rotate-12 group-hover:scale-110 transition-transform duration-700">
                            <Icon name="info" className="w-32 h-32" strokeWidth={1} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-5">
                                <Icon name="brain" className="w-5 h-5 text-indigo-600" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Pedagogical Guardrail</span>
                            </div>
                            <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"Teachers should cross-reference 'Micro-Lessons' with the Endline targets to ensure instructional velocity is aligned with standard mastery targets."</p>
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpen={!!selectedResource} onClose={() => setSelectedResource(null)} title={selectedResource?.title || ''} size="lg">
                {selectedResource && (
                    <div className="space-y-6">
                        <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-inner">
                             <p className="text-md font-bold text-slate-600 leading-relaxed italic">"{selectedResource.description}"</p>
                        </div>
                        <div className="bg-slate-900 p-10 rounded-[3rem] text-slate-300 text-sm font-mono leading-relaxed whitespace-pre-wrap border border-slate-800 shadow-2xl">
                            {selectedResource.content}
                        </div>
                        <div className="flex justify-end gap-4 pt-8 border-t border-slate-100">
                            <button onClick={() => window.print()} className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all hover:bg-slate-800 border-b-4 border-black">Export Protocol PDF</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
