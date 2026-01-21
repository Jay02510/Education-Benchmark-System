
import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { useBenchmarks } from '../context/BenchmarkContext';
import { useAuth } from '../context/AuthContext';
import { useStudents } from '../context/StudentContext';
import { Icon } from '../components/common/Icon';
import { TestPeriod, SubdomainMetadata } from '../types';
import { GeminiService } from '../services/geminiService';

export const SystemTab: React.FC = () => {
    const { user } = useAuth();
    const { students } = useStudents();
    const { 
        thresholds, updateThreshold, resetBenchmarks, 
        domains, addDomain, deleteDomain, subdomains, addSubdomain, deleteSubdomain
    } = useBenchmarks();
    
    const [activeSection, setActiveSection] = useState<'profile' | 'institutional' | 'security'>('institutional');
    const [newDomainInput, setNewDomainInput] = useState('');
    const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
    const [newSubName, setNewSubName] = useState('');
    const [newSubMax, setNewSubMax] = useState(10);
    const [isCalibrating, setIsCalibrating] = useState(false);

    const handleAutoCalibrate = async () => {
        setIsCalibrating(true);
        try {
            const suggestions = await GeminiService.suggestDynamicThresholds(students);
            Object.entries(suggestions).forEach(([period, val]) => {
                updateThreshold(period as TestPeriod, val);
            });
        } finally {
            setIsCalibrating(false);
        }
    };

    const handleAddDomain = () => {
        if (newDomainInput.trim()) {
            addDomain(newDomainInput.trim());
            setNewDomainInput('');
        }
    };

    const handleAddSub = (domain: string) => {
        if (newSubName.trim()) {
            addSubdomain(domain, newSubName.trim(), newSubName.toLowerCase().includes('speaking') ? 5 : newSubMax);
            setNewSubName('');
        }
    };

    return (
        <div className="p-6 md:p-12 max-w-[1400px] mx-auto h-full flex flex-col pb-48">
            <div className="mb-12 flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2 uppercase italic leading-none">Command Center</h1>
                    <p className="text-slate-400 font-bold text-lg italic">Logic configuration and institutional guardrails.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-1">
                <div className="lg:col-span-3">
                    <div className="space-y-2 sticky top-6">
                        {[
                            { id: 'profile', t: 'Authenticated User', i: 'students' },
                            { id: 'institutional', t: 'Skill Architecture', i: 'admin' },
                            { id: 'security', t: 'RTI Calibration', i: 'alert' }
                        ].map(item => (
                            <button 
                                key={item.id}
                                onClick={() => setActiveSection(item.id as any)}
                                className={`w-full flex items-center gap-4 px-6 py-5 rounded-[1.8rem] transition-all ${activeSection === item.id ? 'bg-slate-900 text-white shadow-2xl translate-x-2' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900 font-black uppercase text-[10px] tracking-widest'}`}
                            >
                                <Icon name={item.i} className="w-5 h-5" />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${activeSection === item.id ? 'opacity-100' : 'opacity-60'}`}>{item.t}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-9">
                    <Card className="p-10 bg-white border-none shadow-2xl rounded-[3.5rem] h-full min-h-[700px] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50/50 rounded-full blur-3xl -z-0 translate-x-20 -translate-y-20"></div>
                        
                        {activeSection === 'profile' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 relative z-10">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Identity Record</h2>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Personal Identification Layer</p>
                                </div>
                                <div className="space-y-6 max-w-xl">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-300 tracking-widest ml-1">Official Name</label>
                                        <input type="text" defaultValue={user?.name} className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none font-black text-slate-800 transition-all text-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-300 tracking-widest ml-1">Logic Credentials</label>
                                        <div className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-400 font-black uppercase tracking-widest text-xs flex items-center gap-3">
                                            <Icon name="shield" className="w-4 h-4" />
                                            {user?.role} Level Access Enabled
                                        </div>
                                    </div>
                                    <button className="px-12 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-indigo-600 transition-all mt-6 border-b-4 border-slate-950">Update Identity</button>
                                </div>
                            </div>
                        )}

                        {activeSection === 'institutional' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 relative z-10">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Academic Blueprint</h2>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Domain & Subdomain Component Logic</p>
                                    </div>
                                    <button 
                                        onClick={() => { if(window.confirm("WARNING: Reverting to Master standards will delete custom fields. Proceed?")) resetBenchmarks(); }} 
                                        className="text-[9px] font-black text-rose-500 hover:text-white hover:bg-rose-500 uppercase tracking-widest border border-rose-100 px-6 py-3 rounded-2xl transition-all"
                                    >
                                        Emergency Reset
                                    </button>
                                </div>
                                
                                <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100">
                                    <div className="flex gap-4 mb-10">
                                        <input type="text" value={newDomainInput} onChange={(e) => setNewDomainInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddDomain()} placeholder="Add Primary Segment" className="flex-1 px-8 py-5 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-indigo-600 font-black text-lg shadow-sm" />
                                        <button onClick={handleAddDomain} className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all border-b-4 border-slate-950">Add Segment</button>
                                    </div>
                                    <div className="space-y-4">
                                        {domains.map(d => (
                                            <div key={d} className={`bg-white border transition-all rounded-[2.5rem] overflow-hidden ${expandedDomain === d ? 'border-indigo-200 shadow-xl' : 'border-slate-100 hover:border-indigo-100'}`}>
                                                <div onClick={() => setExpandedDomain(expandedDomain === d ? null : d)} className="flex items-center justify-between p-6 cursor-pointer">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-3 rounded-xl transition-colors ${expandedDomain === d ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'}`}><Icon name="benchmark" className="w-5 h-5" /></div>
                                                        <div><span className="font-black text-slate-800 text-lg uppercase tracking-tight">{d}</span><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{(subdomains[d] || []).length} Components</p></div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button onClick={(e) => { e.stopPropagation(); deleteDomain(d); }} className="p-3 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Icon name="close" className="w-5 h-5" /></button>
                                                        <Icon name={expandedDomain === d ? "arrowUp" : "arrowDown"} className="w-5 h-5 text-slate-300" />
                                                    </div>
                                                </div>
                                                {expandedDomain === d && (
                                                    <div className="px-8 pb-8 pt-2 animate-in slide-in-from-top-2 duration-200 bg-slate-50/30">
                                                        <div className="h-px bg-slate-100 mb-6"></div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                                            {(subdomains[d] || []).map((sub: SubdomainMetadata) => (
                                                                <div key={sub.name} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 group shadow-sm">
                                                                    <div className="flex flex-col"><span className="text-xs font-black text-slate-700">{sub.name}</span><span className="text-[9px] font-bold text-slate-400 uppercase">Limit: {sub.maxScore} pts</span></div>
                                                                    <button onClick={() => deleteSubdomain(d, sub.name)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-all"><Icon name="close" className="w-4 h-4" /></button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="flex gap-3 bg-white p-4 rounded-[1.8rem] border border-slate-100 shadow-inner">
                                                            <input value={newSubName} onChange={e => setNewSubName(e.target.value)} placeholder="Component Name" className="flex-1 bg-transparent px-4 py-2 text-sm font-bold outline-none" />
                                                            <button onClick={() => handleAddSub(d)} className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all">Attach</button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'security' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 relative z-10">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Logic Sensitivity</h2>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Calibration of Automated RTI Trigger Points</p>
                                    </div>
                                    <button 
                                        onClick={handleAutoCalibrate}
                                        disabled={isCalibrating}
                                        className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-indigo-700 disabled:opacity-50 transition-all border-b-4 border-indigo-900"
                                    >
                                        {isCalibrating ? <Icon name="refresh" className="w-4 h-4 animate-spin" /> : <Icon name="brain" className="w-4 h-4" />}
                                        AI Optimal Calibration
                                    </button>
                                </div>
                                <div className="space-y-12">
                                    {Object.values(TestPeriod).map((period) => (
                                        <div key={period} className="space-y-4 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                                            <div className="flex justify-between items-end mb-4">
                                                <div>
                                                    <label className="text-xs font-black text-slate-800 uppercase tracking-widest block mb-1">{period} Cycle Mastery</label>
                                                    <p className="text-[10px] text-slate-400 font-bold max-w-sm">Threshold for automated Tier 2 placement.</p>
                                                </div>
                                                <span className="text-5xl font-black text-indigo-600 tracking-tighter">{thresholds[period]}%</span>
                                            </div>
                                            <input type="range" min="0" max="100" step="1" value={thresholds[period]} onChange={(e) => updateThreshold(period, parseInt(e.target.value))} className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};
