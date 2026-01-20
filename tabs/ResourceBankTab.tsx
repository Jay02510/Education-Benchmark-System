
import React, { useState, useMemo } from 'react';
import { Resource, Domain, ResourceType } from '../types';
import { Card } from '../components/common/Card';
import { DOMAINS, SUBDOMAINS, RESOURCE_TYPES } from '../constants';
import { Icon } from '../components/common/Icon';
import { Modal } from '../components/common/Modal';
import { useResources } from '../context/ResourceContext';

const ResourceCard: React.FC<{ resource: Resource, onClick: () => void }> = ({ resource, onClick }) => {
    const typeColorMap: Record<ResourceType, string> = {
        [ResourceType.MicroLesson]: "bg-blue-100 text-blue-800",
        [ResourceType.QuickPractice]: "bg-indigo-100 text-indigo-800",
        [ResourceType.MiniReading]: "bg-purple-100 text-purple-800",
        [ResourceType.Worksheet]: "bg-green-100 text-green-800",
        [ResourceType.InterventionPacket]: "bg-yellow-100 text-yellow-800",
        [ResourceType.ParentPractice]: "bg-pink-100 text-pink-800",
    };

    return (
        <Card className="p-4 flex flex-col h-full hover:shadow-md transition-shadow" onClick={onClick}>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-800 mb-2">{resource.title}</h3>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">{resource.description}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
                 <span className={`px-2 py-1 rounded-full font-medium ${typeColorMap[resource.type]}`}>
                    {resource.type}
                </span>
                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600">{resource.domain}</span>
                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600">{resource.level}</span>
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
        <div className="p-6 h-full flex flex-col">
            <h1 className="text-3xl font-black mb-6 text-gray-900">Resource Bank</h1>
            
            <Card className="p-6 mb-8 bg-white border border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-end">
                    <div>
                        <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Domain</label>
                        <select value={selectedDomain} onChange={e => setSelectedDomain(e.target.value as any)} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none">
                            <option value="All">All Domains</option>
                            {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Subdomain</label>
                        <select 
                            value={selectedSubdomain} 
                            onChange={e => setSelectedSubdomain(e.target.value)} 
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none"
                            disabled={selectedDomain === 'All'}
                        >
                            <option value="All">All Subdomains</option>
                            {selectedDomain !== 'All' && SUBDOMAINS[selectedDomain].map(sd => <option key={sd.name} value={sd.name}>{sd.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Type</label>
                        <select value={selectedType} onChange={e => setSelectedType(e.target.value as any)} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none">
                            <option value="All">All Types</option>
                            {RESOURCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>
            </Card>

            <div className="flex-1 overflow-y-auto pb-20">
                {filteredResources.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredResources.map(resource => (
                            <ResourceCard key={resource.id} resource={resource} onClick={() => setSelectedResource(resource)} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <Icon name="library" className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900">No resources found</h3>
                        <p className="text-slate-400">Try adjusting your filters.</p>
                    </div>
                )}
            </div>

            <Modal isOpen={!!selectedResource} onClose={() => setSelectedResource(null)} title={selectedResource?.title || ''} size="lg">
                {selectedResource && (
                    <div className="space-y-4">
                        <p className="text-slate-600">{selectedResource.description}</p>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                           <pre className="whitespace-pre-wrap font-sans text-sm">{selectedResource.content}</pre>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
