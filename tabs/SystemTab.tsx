
import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { useBenchmarks } from '../context/BenchmarkContext';
import { useAuth } from '../context/AuthContext';
import { Icon } from '../components/common/Icon';
import { TestPeriod } from '../types';

export const SystemTab: React.FC = () => {
    const { user } = useAuth();
    const { 
        thresholds, updateThreshold, resetBenchmarks, 
        domains, addDomain, deleteDomain 
    } = useBenchmarks();
    
    const [activeSection, setActiveSection] = useState<'profile' | 'institutional' | 'security'>('institutional');
    const [newDomainInput, setNewDomainInput] = useState('');

    const handleAddDomain = () => {
        if (newDomainInput.trim()) {
            addDomain(newDomainInput.trim());
            setNewDomainInput('');
        }
    };

    return (
        <div className="p-6 md:p-12 max-w-[1400px] mx-auto h-full flex flex-col pb-32">
            <div className="mb-12">
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2 uppercase italic leading-none">Command Center</h1>
                <p className="text-slate-400 font-bold text-lg italic">Platform logic and institutional guardrails.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-1">
                <div className="lg:col-span-3">
                    <div className="space-y-2">
                        {[
                            { id: 'profile', t: 'Authenticated User', i: 'students' },
                            { id: 'institutional', t: 'Domain Blueprint', i: 'admin' },
                            { id: 'security', t: 'RTI Sensitivity', i: 'alert' }
                        ].map(item => (
                            <button 
                                key={item.id}
                                onClick={() => setActiveSection(item.id as any)}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeSection === item.id ? 'bg-slate-900 text-white shadow-xl translate-x-2' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900 font-black uppercase text-[10px] tracking-widest'}`}
                            >
                                <Icon name={item.i} className="w-5 h-5" />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${activeSection === item.id ? 'opacity-100' : 'opacity-60'}`}>{item.t}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-9">
                    <Card className="p-10 bg-white border-none shadow-2xl rounded-[3.5rem] h-full min-h-[600px]">
                        {activeSection === 'profile' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Identity Record</h2>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Personal Identification</p>
                                </div>
                                <div className="space-y-6 max-w-xl">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-300 tracking-widest ml-1">Official Name</label>
                                        <input type="text" defaultValue={user?.name} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none font-bold text-slate-800 transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-300 tracking-widest ml-1">Account Role</label>
                                        <div className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-400 font-bold uppercase tracking-widest text-[10px]">{user?.role} Logic Access</div>
                                    </div>
                                    <button className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all mt-4">Commit Changes</button>
                                </div>
                            </div>
                        )}

                        {activeSection === 'institutional' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Academic Segments</h2>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Instructional Coverage Matrix</p>
                                    </div>
                                    <button 
                                        onClick={() => { if(window.confirm("WARNING: This will delete all custom domains and revert to Master standards. Proceed?")) resetBenchmarks(); }} 
                                        className="text-[9px] font-black text-rose-500 hover:text-white hover:bg-rose-500 uppercase tracking-widest border border-rose-100 px-4 py-2 rounded-xl transition-all"
                                    >
                                        Emergency Logic Reset
                                    </button>
                                </div>
                                
                                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                                    <div className="flex gap-4 mb-8">
                                        <input 
                                            type="text" 
                                            value={newDomainInput} 
                                            onChange={(e) => setNewDomainInput(e.target.value)}
                                            placeholder="Add custom domain (e.g. Science Literacy)" 
                                            className="flex-1 px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold text-sm"
                                        />
                                        <button 
                                            onClick={handleAddDomain}
                                            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-indigo-600 transition-all"
                                        >
                                            Add Domain
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {domains.map(d => (
                                            <div key={d} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 transition-all group shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all"><Icon name="benchmark" className="w-4 h-4" /></div>
                                                    <span className="font-black text-slate-800 text-sm uppercase tracking-tight">{d}</span>
                                                </div>
                                                <button onClick={() => deleteDomain(d)} className="text-slate-200 hover:text-rose-500 p-2"><Icon name="close" className="w-5 h-5" /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'security' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Support Sensitivity</h2>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Automated Intervention Calibration</p>
                                </div>
                                <div className="space-y-12">
                                    {Object.values(TestPeriod).map((period) => (
                                        <div key={period} className="space-y-4">
                                            <div className="flex justify-between items-end">
                                                <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{period} Mastery Threshold</label>
                                                <span className="text-3xl font-black text-indigo-600">{thresholds[period]}%</span>
                                            </div>
                                            <input 
                                                type="range" min="0" max="100" step="1" 
                                                value={thresholds[period]} 
                                                onChange={(e) => updateThreshold(period, parseInt(e.target.value))}
                                                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                            />
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <p className="text-[10px] text-slate-400 font-bold italic leading-relaxed uppercase tracking-widest">"Students failing to achieve {thresholds[period]}% during the {period} cycle will be automatically assigned to Intervention Tier 2."</p>
                                            </div>
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
