
import React, { useState, useMemo } from 'react';
import { Resource, Domain, ResourceType, TestPeriod, Student } from '../types';
import { Card } from '../components/common/Card';
import { DOMAINS, SUBDOMAINS, RESOURCE_TYPES } from '../constants';
import { Icon } from '../components/common/Icon';
import { Modal } from '../components/common/Modal';
import { GeminiService } from '../services/geminiService';
import { useResources } from '../context/ResourceContext';
import { useStudents } from '../context/StudentContext';

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
                    {resource.aiGenerated && (
                        <div title="AI Generated" className="text-purple-500">
                             <Icon name="brain" className="w-5 h-5" />
                        </div>
                    )}
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">{resource.description}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
                 <span className={`px-2 py-1 rounded-full font-medium ${typeColorMap[resource.type]}`}>
                    {resource.type}
                </span>
                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600">{resource.domain}</span>
                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600">{resource.subdomain}</span>
                 <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600">{resource.level}</span>
            </div>
        </Card>
    );
};

const GenerateResourceModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (resource: Resource) => void;
    initialDomain: Domain | 'All';
    students: Student[];
    gradeLevel: string;
}> = ({ isOpen, onClose, onSave, initialDomain, students, gradeLevel }) => {
    // Form state
    const [domain, setDomain] = useState<Domain>(initialDomain === 'All' ? Domain.Reading : initialDomain);
    const [subdomain, setSubdomain] = useState<string>(SUBDOMAINS[domain][0]?.name || '');
    const [type, setType] = useState<ResourceType>(ResourceType.QuickPractice);
    const [level, setLevel] = useState(gradeLevel || '5');
    const [prompt, setPrompt] = useState('');

    // Generation state
    const [isLoading, setIsLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedResource, setGeneratedResource] = useState<Resource | null>(null);

    const handleDomainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newDomain = e.target.value as Domain;
        setDomain(newDomain);
        setSubdomain(SUBDOMAINS[newDomain][0]?.name || ''); // Reset subdomain
    };
    
    const resetState = () => {
        setIsLoading(false);
        setError(null);
        setGeneratedResource(null);
        setPrompt('');
    };

    // New Feature: Analyze Class Data to suggest a prompt
    const handleAnalyzeClassNeeds = async () => {
        setIsAnalyzing(true);
        
        // 1. Calculate weakest domain based on latest assessments
        const domainScores: Record<string, {sum: number, count: number}> = {};
        
        students.forEach(s => {
            const lastAssess = s.assessments[s.assessments.length - 1];
            if (lastAssess) {
                DOMAINS.forEach(d => {
                    if (!domainScores[d]) domainScores[d] = { sum: 0, count: 0 };
                    if (lastAssess.scores[d]) {
                        domainScores[d].sum += lastAssess.scores[d];
                        domainScores[d].count++;
                    }
                });
            }
        });

        let weakDomain = Domain.Reading;
        let minAvg = 100;

        Object.entries(domainScores).forEach(([d, stats]) => {
            const avg = stats.count > 0 ? stats.sum / stats.count : 0;
            if (avg > 0 && avg < minAvg) {
                minAvg = avg;
                weakDomain = d as Domain;
            }
        });

        // 2. Update State with Weakest Domain
        setDomain(weakDomain);
        setSubdomain(SUBDOMAINS[weakDomain][0]?.name || ''); // Default to first subdomain
        
        // 3. Ask AI for a prompt based on this
        const aiPrompt = await GeminiService.generateRemedialPrompt(weakDomain, Math.round(minAvg), gradeLevel);
        setPrompt(aiPrompt);
        
        setIsAnalyzing(false);
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError("Please enter a prompt for the AI.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedResource(null);

        const result = await GeminiService.generateResourceContent(domain, subdomain, type, level, prompt);

        if (result) {
            const newResource: Resource = {
                id: `res-ai-${Date.now()}`,
                domain,
                subdomain,
                level,
                period: TestPeriod.Baseline, // Using a default period
                type,
                title: result.title,
                description: result.description,
                content: result.content,
                aiGenerated: true,
            };
            setGeneratedResource(newResource);
        } else {
            setError("Failed to generate resource. The AI model might be busy or an error occurred. Please try again.");
        }
        setIsLoading(false);
    };

    const handleSave = () => {
        if (generatedResource) {
            onSave(generatedResource);
            handleClose();
        }
    };
    
    const handleClose = () => {
        resetState();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="AI Generate Resource" size="lg">
            {!generatedResource ? (
                <div className="space-y-4">
                     {/* Form fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                            <select value={domain} onChange={handleDomainChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Subdomain</label>
                            <select value={subdomain} onChange={e => setSubdomain(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                {SUBDOMAINS[domain].map(sd => <option key={sd.name} value={sd.name}>{sd.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type</label>
                            <select value={type} onChange={e => setType(e.target.value as ResourceType)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                {RESOURCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Student Level</label>
                             <select value={level} onChange={e => setLevel(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                <option value="5">Level 5</option>
                                <option value="6-1">Level 6-1</option>
                                <option value="6-2">Level 6-2</option>
                                <option value="7-2">Level 7-2</option>
                                <option value="7-3">Level 7-3</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">Teacher's Prompt</label>
                            <button 
                                onClick={handleAnalyzeClassNeeds}
                                disabled={isAnalyzing}
                                className="text-xs flex items-center space-x-1 text-purple-600 hover:text-purple-700 font-semibold transition disabled:opacity-50"
                            >
                                <Icon name="brain" className="w-3 h-3" />
                                <span>{isAnalyzing ? 'Analyzing Data...' : 'Auto-Fill from Class Weakness'}</span>
                            </button>
                        </div>
                        <textarea
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            placeholder="e.g., A quick practice about using past tense verbs for a trip to the zoo."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[80px]"
                        />
                    </div>
                     {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="flex justify-end pt-2">
                        <button 
                            onClick={handleGenerate} 
                            disabled={isLoading}
                            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center space-x-2 disabled:bg-gray-400 active:scale-95 shadow hover:shadow-md"
                        >
                            <Icon name="brain" className="w-5 h-5" />
                            <span>{isLoading ? 'Generating...' : 'Generate'}</span>
                        </button>
                    </div>
                </div>
            ) : (
                // Result view
                <div>
                     <h3 className="font-bold text-lg mb-1">{generatedResource.title}</h3>
                     <p className="text-sm text-gray-600 mb-4">{generatedResource.description}</p>
                     <div className="prose prose-slate max-w-none bg-gray-50 p-4 rounded-md border border-gray-200 max-h-60 overflow-y-auto">
                        <pre className="whitespace-pre-wrap font-sans text-sm">{generatedResource.content}</pre>
                     </div>
                     <div className="flex justify-end space-x-2 pt-4 mt-2 border-t border-gray-200">
                         <button onClick={resetState} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition active:scale-95">
                            Generate Another
                         </button>
                         <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition active:scale-95">
                            Save to Bank
                         </button>
                     </div>
                </div>
            )}
        </Modal>
    );
};


export const ResourceBankTab: React.FC = () => {
    // Connect to Global Context
    const { resources, addResource } = useResources();
    const { students, classProfile } = useStudents();

    const [selectedDomain, setSelectedDomain] = useState<Domain | 'All'>('All');
    const [selectedSubdomain, setSelectedSubdomain] = useState<string>('All');
    const [selectedType, setSelectedType] = useState<ResourceType | 'All'>('All');
    
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

    const filteredResources = useMemo(() => {
        return resources.filter(r => {
            const domainMatch = selectedDomain === 'All' || r.domain === selectedDomain;
            const subdomainMatch = selectedSubdomain === 'All' || r.subdomain === selectedSubdomain;
            const typeMatch = selectedType === 'All' || r.type === selectedType;
            return domainMatch && subdomainMatch && typeMatch;
        });
    }, [resources, selectedDomain, selectedSubdomain, selectedType]);
    
    const handleDomainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedDomain(e.target.value as Domain | 'All');
        setSelectedSubdomain('All'); // Reset subdomain on domain change
    };

    const handleSaveResource = (newResource: Resource) => {
        addResource(newResource); // Save to Global Context
        setIsGeneratorOpen(false);
    };

    return (
        <div className="p-4 md:p-6 h-full flex flex-col">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-900">Resource Bank</h1>
            
            <Card className="p-4 mb-6 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                        <select value={selectedDomain} onChange={handleDomainChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                            <option value="All">All Domains</option>
                            {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subdomain</label>
                        <select 
                            value={selectedSubdomain} 
                            onChange={e => setSelectedSubdomain(e.target.value)} 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            disabled={selectedDomain === 'All'}
                        >
                            <option value="All">All Subdomains</option>
                            {selectedDomain !== 'All' && SUBDOMAINS[selectedDomain].map(sd => <option key={sd.name} value={sd.name}>{sd.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type</label>
                        <select value={selectedType} onChange={e => setSelectedType(e.target.value as ResourceType | 'All')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                            <option value="All">All Types</option>
                            {RESOURCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <button 
                        onClick={() => setIsGeneratorOpen(true)}
                        className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow hover:shadow-lg active:scale-95"
                    >
                        <Icon name="brain" className="w-5 h-5" />
                        <span>AI Generate</span>
                    </button>
                </div>
            </Card>

            <div className="flex-1 overflow-y-auto pb-20">
                {filteredResources.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {filteredResources.map(resource => (
                            <ResourceCard key={resource.id} resource={resource} onClick={() => setSelectedResource(resource)} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
                            <Icon name="library" className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No resources found</h3>
                        <p className="text-gray-500">Try adjusting filters or generate a new resource.</p>
                    </div>
                )}
            </div>

            <Modal isOpen={!!selectedResource} onClose={() => setSelectedResource(null)} title={selectedResource?.title || ''} size="lg">
                {selectedResource && (
                    <div>
                        <p className="text-gray-600 mb-4">{selectedResource.description}</p>
                        <div className="prose prose-slate max-w-none bg-gray-50 p-4 rounded-md border border-gray-200">
                           <pre className="whitespace-pre-wrap font-sans text-sm">{selectedResource.content}</pre>
                        </div>
                        <div className="mt-4 flex justify-end">
                             <button onClick={() => setSelectedResource(null)} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
            
            <GenerateResourceModal 
                isOpen={isGeneratorOpen} 
                onClose={() => setIsGeneratorOpen(false)} 
                onSave={handleSaveResource}
                initialDomain={selectedDomain}
                students={students}
                gradeLevel={classProfile?.gradeLevel || '5'}
            />
        </div>
    );
};
