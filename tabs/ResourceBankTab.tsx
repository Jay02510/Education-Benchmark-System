import React, { useState, useMemo } from 'react';
import { Resource, Domain, ResourceType } from '../types';
import { Card } from '../components/common/Card';
import { DOMAINS, SUBDOMAINS, RESOURCE_TYPES } from '../constants';
import { Icon } from '../components/common/Icon';
import { Modal } from '../components/common/Modal';
import { useResources } from '../context/ResourceContext';

const ResourceCard: React.FC<{ resource: Resource, onClick: () => void }> = ({ resource, onClick }) => {
    const typeLabelStyle: Record<ResourceType, string> = {
        [ResourceType.MicroLesson]: "bg-[oklch(0.72_0.18_145)]/10 text-[oklch(0.72_0.18_145)] border-[oklch(0.72_0.18_145)]/20",
        [ResourceType.QuickPractice]: "bg-[oklch(0.72_0.18_145)]/10 text-[oklch(0.72_0.18_145)] border-[oklch(0.72_0.18_145)]/20",
        [ResourceType.MiniReading]: "bg-[oklch(0.65_0.20_25)]/10 text-[oklch(0.65_0.20_25)] border-[oklch(0.65_0.20_25)]/20",
        [ResourceType.Worksheet]: "bg-[oklch(0.60_0_0)]/10 text-[oklch(0.60_0_0)] border-[oklch(0.60_0_0)]/20",
        [ResourceType.InterventionPacket]: "bg-[oklch(0.65_0.20_25)]/10 text-[oklch(0.65_0.20_25)] border-[oklch(0.65_0.20_25)]/20",
        [ResourceType.ParentPractice]: "bg-[oklch(0.20_0.06_145)]/10 text-[oklch(0.20_0.06_145)] border-[oklch(0.20_0.06_145)]/20",
    };

    return (
        <Card className="p-6 flex flex-col h-full hover:border-zinc-800 transition-colors cursor-pointer" onClick={onClick}>
            <div className="flex-1">
                <div className="flex justify-between items-start select-none">
                    <span className="text-[10px] font-mono text-zinc-550 mb-2">Level {resource.level} • {resource.domain}</span>
                </div>
                <h3 className="text-xs font-semibold text-zinc-200 mb-2 tracking-tight">{resource.title}</h3>
                <p className="text-[11px] text-zinc-450 leading-relaxed line-clamp-2">{resource.description}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5 text-[9px] font-mono select-none">
                 <span className={`px-2 py-0.5 rounded-[2px] border ${typeLabelStyle[resource.type]}`}>
                    {resource.type}
                </span>
            </div>
        </Card>
    );
};

export const ResourceBankTab: React.FC = () => {
    const { resources } = useResources();
    const [selectedDomain, setSelectedDomain] = useState<Domain | 'All'>('All');
    const [selectedSubdomain, setSelectedSubdomain] = useState<string>('All');
    const [selectedType, setSelectedType] = useState<ResourceType | 'All'>('All');
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

    const filteredResources = useMemo(() => {
        return resources.filter(r => {
            const domainMatch = selectedDomain === 'All' || r.domain === selectedDomain;
            const subdomainMatch = selectedSubdomain === 'All' || r.subdomain === selectedSubdomain;
            const typeMatch = selectedType === 'All' || r.type === selectedType;
            return domainMatch && subdomainMatch && typeMatch;
        });
    }, [resources, selectedDomain, selectedSubdomain, selectedType]);

    return (
        <div className="p-6 md:p-12 space-y-8 max-w-[1600px] mx-auto pb-20 font-sans text-zinc-150">
            <div className="flex items-center gap-4 border-b border-zinc-900 pb-6 select-none">
                <div className="w-10 h-10 bg-zinc-900 border border-zinc-850 text-[oklch(0.72_0.18_145)] flex items-center justify-center rounded-[4px]">
                    <Icon name="library" className="w-5 h-5" />
                </div>
                <div>
                    <h1 className="text-xl font-medium tracking-tight text-white">Curriculum Materials</h1>
                    <p className="text-zinc-[600] text-[10px] font-mono block mt-1">Resource bank and diagnostics worksheets</p>
                </div>
            </div>
            
            <Card className="p-6 bg-zinc-950 border border-zinc-900 rounded-[4px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label className="block text-[9px] font-mono text-zinc-500 tracking-normal mb-2 select-none">Domain</label>
                        <select value={selectedDomain} onChange={e => setSelectedDomain(e.target.value as any)} className="w-full px-3 py-2 border border-zinc-90 w-full bg-zinc-950 text-zinc-200 rounded-[4px] text-xs outline-none focus:border-zinc-700">
                            <option value="All">All Domains</option>
                            {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-[9px] font-mono text-zinc-500 tracking-normal mb-2 select-none">Subdomain</label>
                        <select 
                            value={selectedSubdomain} 
                            onChange={e => setSelectedSubdomain(e.target.value)} 
                            className="w-full px-3 py-2 border border-zinc-90 w-full bg-zinc-950 text-zinc-200 rounded-[4px] text-xs outline-none focus:border-zinc-700"
                            disabled={selectedDomain === 'All'}
                        >
                            <option value="All">All Subdomains</option>
                            {selectedDomain !== 'All' && SUBDOMAINS[selectedDomain].map(sd => <option key={sd.name} value={sd.name}>{sd.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-[9px] font-mono text-zinc-500 tracking-normal mb-2 select-none">Type</label>
                        <select value={selectedType} onChange={e => setSelectedType(e.target.value as any)} className="w-full px-3 py-2 border border-zinc-90 w-full bg-zinc-950 text-zinc-200 rounded-[4px] text-xs outline-none focus:border-zinc-700">
                            <option value="All">All Types</option>
                            {RESOURCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>
            </Card>

            <div className="flex-1 pb-20">
                {filteredResources.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
                        {filteredResources.map(resource => (
                            <ResourceCard key={resource.id} resource={resource} onClick={() => setSelectedResource(resource)} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-zinc-950 rounded-[4px] border border-zinc-900 border-dashed select-none">
                        <Icon name="library" className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                        <h3 className="text-xs font-mono text-zinc-300 mb-2">No pedagogical resources detected</h3>
                        <p className="text-xs text-zinc-500">Please adjust standard or domain mappings dynamically.</p>
                    </div>
                )}
            </div>

            <Modal isOpen={!!selectedResource} onClose={() => setSelectedResource(null)} title={selectedResource?.title || ''} size="lg">
                {selectedResource && (
                    <div className="space-y-4 font-sans max-h-[80vh] overflow-y-auto pr-1">
                        <div className="border-b border-zinc-90 pb-3 select-none">
                            <span className="text-[9px] font-mono text-zinc-500 block mb-1">Pedagogical Description Context</span>
                            <p className="text-xs text-zinc-400 leading-relaxed font-sans">{selectedResource.description}</p>
                        </div>
                        <div className="bg-zinc-90 border border-zinc-900 p-6 rounded-[4px]">
                           <pre className="whitespace-pre-wrap font-mono text-xs text-zinc-300 leading-relaxed">{selectedResource.content}</pre>
                        </div>
                        <div className="flex justify-end pt-4 border-t border-zinc-900">
                            <button 
                                onClick={() => setSelectedResource(null)}
                                className="px-4 py-2 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-[4px] text-xs transition-colors cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
