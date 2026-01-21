
import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { useBenchmarks } from '../context/BenchmarkContext';
import { useAuth } from '../context/AuthContext';
import { Icon } from '../components/common/Icon';
import { TestPeriod } from '../types';

export const SystemTab: React.FC = () => {
    const { user } = useAuth();
    const { thresholds, updateThreshold, resetBenchmarks } = useBenchmarks();
    const [activeSection, setActiveSection] = useState<'profile' | 'institutional' | 'security'>('profile');

    return (
        <div className="p-6 md:p-12 max-w-[1400px] mx-auto h-full flex flex-col pb-32">
            <div className="mb-12">
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2 uppercase italic">Mission Control</h1>
                <p className="text-slate-400 font-bold text-lg italic">System-wide configuration and security.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-1">
                <div className="lg:col-span-3">
                    <div className="space-y-2">
                        {[
                            { id: 'profile', t: 'Personal Profile', i: 'students' },
                            { id: 'institutional', t: 'Framework Config', i: 'admin' },
                            { id: 'security', t: 'Logic Sensitivity', i: 'alert' }
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
                    <Card className="p-10 bg-white border-none shadow-2xl rounded-[3rem] h-full min-h-[600px]">
                        {activeSection === 'profile' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 mb-2">Authenticated Profile</h2>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Personal Identification</p>
                                </div>
                                <div className="space-y-6 max-w-xl">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-300 tracking-widest ml-1">Official Name</label>
                                        <input type="text" defaultValue={user?.name} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none font-bold text-slate-800 transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-300 tracking-widest ml-1">Account Role</label>
                                        <div className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-slate-400 font-bold uppercase tracking-widest text-xs">{user?.role} Access Level</div>
                                    </div>
                                    <button className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all mt-4">Synchronize Identity</button>
                                </div>
                            </div>
                        )}

                        {activeSection === 'institutional' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 mb-2">Framework Configuration</h2>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Global Institutional Rules</p>
                                    </div>
                                    <button onClick={resetBenchmarks} className="text-[9px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest border border-rose-100 px-4 py-2 rounded-xl transition-all">Emergency Reset</button>
                                </div>
                                <div className="p-8 bg-indigo-50 rounded-[2.5rem] border border-indigo-100 flex items-start gap-4">
                                    <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm"><Icon name="info" className="w-5 h-5" /></div>
                                    <div>
                                        <h4 className="font-black text-indigo-900 text-sm mb-1 uppercase tracking-widest">Logic Warning</h4>
                                        <p className="text-xs text-indigo-700/70 leading-relaxed font-medium">Modifying these parameters will re-calculate Growth Velocity across all historical student DNA strings. Proceed with institutional authorization.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <Card className="p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Academic Coverage</h4>
                                        <p className="text-3xl font-black text-slate-800 mb-2">8 Domains</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cambridge Primary Aligned</p>
                                    </Card>
                                    <Card className="p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Data Persistence</h4>
                                        <p className="text-3xl font-black text-slate-800 mb-2">Cloud Synced</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Real-time Multi-tenant Access</p>
                                    </Card>
                                </div>
                            </div>
                        )}

                        {activeSection === 'security' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 mb-2">RTI Logic Sensitivity</h2>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Automated Intervention Triggers</p>
                                </div>
                                <div className="space-y-12">
                                    {Object.values(TestPeriod).map((period) => (
                                        <div key={period} className="space-y-4">
                                            <div className="flex justify-between items-end">
                                                <label className="text-xs font-black text-slate-800 uppercase tracking-widest">{period} Threshold</label>
                                                <span className="text-3xl font-black text-indigo-600">{thresholds[period]}%</span>
                                            </div>
                                            <input 
                                                type="range" min="0" max="100" step="1" 
                                                value={thresholds[period]} 
                                                onChange={(e) => updateThreshold(period, parseInt(e.target.value))}
                                                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                            />
                                            <p className="text-[10px] text-slate-400 font-bold italic leading-relaxed">"Students falling {thresholds[period]}% or more below target will be automatically flagged for Tier 2 support."</p>
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
