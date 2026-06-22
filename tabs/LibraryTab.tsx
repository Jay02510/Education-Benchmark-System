import React, { useState, useMemo } from 'react';
import { Domain, TestPeriod, Resource } from '../types';
import { useStudents } from '../context/StudentContext';
import { useBenchmarks } from '../context/BenchmarkContext';
import { useResources } from '../context/ResourceContext';
import { useChat } from '../context/ChatContext';
import { Icon } from '../components/common/Icon';
import { DOMAINS } from '../constants';
import { Modal } from '../components/common/Modal';

interface ResourceRowProps {
    resource: Resource;
    onView: () => void;
    onDownload: (e: React.MouseEvent) => void;
}

const ResourceRow: React.FC<ResourceRowProps> = ({ resource, onView, onDownload }) => {
    return (
        <div 
            onClick={onView}
            className="flex items-center justify-between py-4 px-5 bg-transparent hover:bg-[oklch(0.18_0.01_250)] transition-all duration-150 group cursor-pointer border-b border-[oklch(0.60_0_0_/_0.10)] select-none"
        >
            {/* Title left (Inter 14px, ink) */}
            <div className="flex-1 min-w-0 pr-6">
                <span className="font-sans text-[14px] text-[oklch(0.97_0_0)] block font-medium truncate group-hover:text-[oklch(0.72_0.18_145)] transition-colors">
                    {resource.title}
                </span>
                <span className="font-mono text-[10px] text-[oklch(0.60_0_0)] block mt-1 tracking-normal">
                    Level {resource.level} • {resource.domain}
                </span>
            </div>

            {/* Type tag center (IBM Plex Mono 11px) with 2px left border in accent, no background fill, no pill shape */}
            <div className="shrink-0 w-48 px-2 flex items-center justify-start text-left">
                <span className="font-mono text-[11px] text-[oklch(0.72_0.18_145)] pl-2 border-l-2 border-[oklch(0.72_0.18_145)] leading-tight tracking-normal block">
                    {resource.type}
                </span>
            </div>

            {/* Download/Export action right */}
            <div className="shrink-0 flex items-center">
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onDownload(e);
                    }}
                    className="p-2 text-[oklch(0.60_0_0)] hover:text-[oklch(0.72_0.18_145)] hover:bg-[oklch(0.14_0.01_250)] rounded-[4px] transition-all focus:outline-none"
                    title="Export material"
                >
                    <Icon name="arrowRight" className="w-4 h-4 text-[oklch(0.72_0.18_145)]" />
                </button>
            </div>
        </div>
    );
};

export const LibraryTab: React.FC = () => {
    const { classProfile } = useStudents();
    const { benchmarks, domains } = useBenchmarks();
    const { resources } = useResources();
    const { sendMessage, toggleChat } = useChat();
    const [selectedPeriod, setSelectedPeriod] = useState<TestPeriod>(TestPeriod.Baseline);
    const [selectedDomain, setSelectedDomain] = useState<Domain | 'All'>('All');
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const levelToUse = classProfile?.gradeLevel || '5';

    // List browser filtering incorporating search term
    const filteredResources = useMemo(() => {
        return resources.filter(r => {
            const matchesDomain = selectedDomain === 'All' || r.domain === selectedDomain;
            const matchesLevel = r.level === levelToUse;
            const matchesSearch = searchTerm === '' || r.title.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesDomain && matchesLevel && matchesSearch;
        });
    }, [resources, selectedDomain, levelToUse, searchTerm]);

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
        <div className="p-6 md:p-10 space-y-10 max-w-[1600px] mx-auto pb-32 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            
            {/* Minimal redesigned swiss header block */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center pb-6 border-b border-[oklch(0.60_0_0_/_0.15)] gap-6 select-none">
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold text-white tracking-tight">Resource Center</h2>
                    <p className="text-xs text-[oklch(0.60_0_0)] font-sans">
                        Standards alignment, instructional materials, and benchmark directives for Level <span className="text-[oklch(0.72_0.18_145)] font-mono font-bold">{levelToUse}</span>
                    </p>
                </div>
                
                {/* Standard Period Select toolbelt using plain text toggles */}
                <div className="flex items-center gap-4 bg-[oklch(0.14_0.01_250)] border border-[oklch(0.60_0_0_/_0.15)] px-4 py-2 rounded-[4px]">
                    <span className="font-mono text-[10px] text-[oklch(0.60_0_0)] tracking-normal">Interval:</span>
                    <div className="flex gap-x-4 select-none">
                        {Object.values(TestPeriod).map(p => (
                            <button 
                                key={p} 
                                onClick={() => setSelectedPeriod(p)} 
                                className={`text-[11px] font-sans tracking-wide transition-all focus:outline-none py-0.5 border-b-2 ${selectedPeriod === p ? 'text-[oklch(0.72_0.18_145)] border-[oklch(0.72_0.18_145)] font-semibold' : 'text-[oklch(0.60_0_0)] border-transparent hover:text-white'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: Learning Standards */}
                <div className="xl:col-span-5 space-y-6">
                    <div className="bg-[oklch(0.14_0.01_250)] border border-[oklch(0.60_0_0_/_0.15)] rounded-[8px] p-6 md:p-8 select-none flex flex-col">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-[oklch(0.60_0_0_/_0.10)]">
                            <div>
                                <h3 className="text-sm font-semibold text-white tracking-tight">Academic Benchmarks</h3>
                                <p className="text-xs text-[oklch(0.60_0_0)] font-sans mt-0.5">
                                    Grade goals for cycle <span className="font-mono font-medium">{selectedPeriod}</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-[11px] text-[oklch(0.72_0.18_145)]">
                                    CEFR {displayedBenchmarks[0]?.cefr || 'A1'}
                                </span>
                                <span className="text-[11px] text-[oklch(0.60_0_0)] font-sans">•</span>
                                <span className="text-[11px] text-[oklch(0.60_0_0)] font-mono">
                                    {displayedBenchmarks[0]?.yle || 'Starters'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {displayedBenchmarks.map(b => (
                                <div 
                                    key={b.domain} 
                                    className="p-5 bg-[oklch(0.14_0.01_250)]/40 border border-[oklch(0.60_0_0_/_0.10)] rounded-none flex items-center justify-between gap-6 hover:bg-[oklch(0.18_0.01_250)] transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-sans text-[13px] font-semibold text-white tracking-tight leading-none mb-1.5">{b.domain}</h4>
                                        <p className="text-xs text-[oklch(0.60_0_0)] font-sans italic leading-relaxed">"{b.descriptor}"</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="block font-mono text-[9px] text-[oklch(0.60_0_0)] tracking-normal">Target</span>
                                        <span className="block font-mono text-base font-bold text-white tabular-nums mt-0.5">{b.target}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Directives sidebar panel */}
                    <div className="p-6 border border-[oklch(0.60_0_0_/_0.15)] bg-[oklch(0.14_0.01_250)] text-[oklch(0.60_0_0)] rounded-[8px] select-none">
                        <div className="flex items-center gap-2 mb-2">
                            <Icon name="info" className="w-4 h-4 text-[oklch(0.72_0.18_145)]" />
                            <span className="font-mono text-[10px] font-semibold text-[oklch(0.72_0.18_145)] tracking-normal">Instructional Directive</span>
                        </div>
                        <p className="font-sans text-xs text-zinc-300 leading-relaxed italic">
                            "Cross-reference indexed resources with period benchmarks to ensure consistent developmental scaling."
                        </p>
                    </div>
                </div>

                {/* Right Column: Resource Browser */}
                <div className="xl:col-span-7">
                    <div className="bg-[oklch(0.14_0.01_250)] border border-[oklch(0.60_0_0_/_0.15)] rounded-[8px] p-6 md:p-8 select-none flex flex-col">
                        <div className="space-y-1 mb-8">
                            <h3 className="text-sm font-semibold text-white tracking-tight">Curriculum Repositories</h3>
                            <p className="text-xs text-[oklch(0.60_0_0)] font-sans">
                                Reference systems and downloadable diagnostic aids mapped to level
                            </p>
                        </div>

                        {/* Search Input: full width, 0px radius, 1px bottom border only (underline style) */}
                        <div className="mb-6">
                            <div className="relative flex items-center w-full">
                                <input 
                                    type="text" 
                                    placeholder="Type to search resource title..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-transparent border-0 border-b border-[oklch(0.60_0_0_/_0.15)] rounded-none py-2.5 px-0.5 text-sm text-[oklch(0.97_0_0)] placeholder-[oklch(0.60_0_0_/_0.4)] focus:border-[oklch(0.72_0.18_145)] border-b focus:ring-0 outline-none font-sans"
                                />
                                {searchTerm && (
                                    <button 
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-1 text-[oklch(0.60_0_0)] hover:text-white transition-colors focus:outline-none"
                                    >
                                        <Icon name="close" className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Domain Filters: Plain text toggles, no button class with backgrounds */}
                        <div className="mb-8 space-y-2">
                            <span className="block font-mono text-[9px] text-[oklch(0.60_0_0)] tracking-normal">Filter Domains</span>
                            <div className="flex flex-wrap gap-x-5 gap-y-1.5 select-none pt-1">
                                <button 
                                    onClick={() => setSelectedDomain('All')}
                                    className={`text-[11px] font-sans tracking-wide transition-all focus:outline-none py-0.5 border-b-2 ${selectedDomain === 'All' ? 'text-[oklch(0.72_0.18_145)] border-[oklch(0.72_0.18_145)] font-semibold' : 'text-[oklch(0.60_0_0)] border-transparent hover:text-white'}`}
                                >
                                    All Domains
                                </button>
                                {DOMAINS.map(d => (
                                    <button 
                                        key={d}
                                        onClick={() => setSelectedDomain(d)}
                                        className={`text-[11px] font-sans tracking-wide transition-all focus:outline-none py-0.5 border-b-2 ${selectedDomain === d ? 'text-[oklch(0.72_0.18_145)] border-[oklch(0.72_0.18_145)] font-semibold' : 'text-[oklch(0.60_0_0)] border-transparent hover:text-white'}`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Resource list browser */}
                        <div className="flex-1 min-h-[400px] mb-8">
                            {filteredResources.length > 0 ? (
                                <div className="border-t border-[oklch(0.60_0_0_/_0.10)] divide-y divide-[oklch(0.60_0_0_/_0.10)]">
                                    {filteredResources.map(res => (
                                        <ResourceRow 
                                            key={res.id} 
                                            resource={res} 
                                            onView={() => setSelectedResource(res)} 
                                            onDownload={(e) => {
                                                e.stopPropagation();
                                                setSelectedResource(res);
                                            }} 
                                        />
                                    ))}
                                </div>
                            ) : (
                                /* Empty State: 1 sentence, 1 action button, no artwork/illustration */
                                <div className="flex flex-col items-center justify-center py-24 text-center bg-transparent border border-dashed border-[oklch(0.60_0_0_/_0.15)] rounded-none p-6">
                                    <p className="text-[oklch(0.60_0_0)] font-sans text-xs mb-4">
                                        No materials found in curriculum bank matching search rules.
                                    </p>
                                    <button 
                                        onClick={() => {
                                            setSearchTerm('');
                                            setSelectedDomain('All');
                                        }}
                                        className="h-8 px-4 bg-[oklch(0.18_0.01_250)] text-white hover:bg-[oklch(0.20_0.06_145)] text-[11px] font-sans rounded-[4px] border border-[oklch(0.60_0_0_/_0.15)] transition-all focus:outline-none"
                                    >
                                        Clear Search Filters
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Generation trigger */}
                        <div className="mt-auto">
                            <button 
                                onClick={handleAIGen}
                                className="w-full h-10 bg-[oklch(0.72_0.18_145)] text-zinc-950 font-sans font-semibold rounded-[4px] text-xs hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <Icon name="brain" className="w-4 h-4 text-zinc-950" />
                                <span>Generate New Resource</span>
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Detail View Modal */}
            <Modal isOpen={!!selectedResource} onClose={() => setSelectedResource(null)} title={selectedResource?.title || ''} size="lg">
                {selectedResource && (
                    <div className="space-y-6 text-left select-none">
                        <div className="p-6 bg-[oklch(0.14_0.01_250)] border border-[oklch(0.60_0_0_/_0.15)] rounded-none">
                             <p className="text-sm font-medium text-[oklch(0.60_0_0)] leading-relaxed italic">"{selectedResource.description}"</p>
                        </div>
                        <div className="bg-[oklch(0.10_0.01_250)] p-8 rounded-none text-[oklch(0.97_0_0)] text-xs font-mono leading-relaxed whitespace-pre-wrap border border-[oklch(0.60_0_0_/_0.15)] shadow-md">
                            {selectedResource.content}
                        </div>
                        <div className="flex justify-end gap-3 pt-6 border-t border-[oklch(0.60_0_0_/_0.15)]">
                            <button 
                                onClick={() => setSelectedResource(null)}
                                className="px-5 py-2 bg-[oklch(0.18_0.01_250)] text-zinc-300 rounded-[4px] font-sans font-medium text-xs hover:bg-[oklch(0.22_0.01_250)] transition-all focus:outline-none"
                            >
                                Close
                            </button>
                            <button 
                                onClick={() => window.print()} 
                                className="px-6 py-2 bg-[oklch(0.72_0.18_145)] text-zinc-950 rounded-[4px] font-sans font-semibold text-xs shadow-md active:scale-95 transition-all hover:brightness-110"
                            >
                                Export as PDF
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
