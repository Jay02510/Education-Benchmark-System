
import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';
import { useStudents } from '../../context/StudentContext';
import { useBenchmarks } from '../../context/BenchmarkContext';
import { useToast } from '../../context/ToastContext';
import { DOMAINS as MASTER_DOMAINS } from '../../constants';

export const OnboardingWizard: React.FC = () => {
    const { registerClass, addStudentsBulk, loadDemoData } = useStudents();
    const { initializeFramework } = useBenchmarks();
    
    const [step, setStep] = useState(0); 
    const [className, setClassName] = useState('');
    const [gradeLevel, setGradeLevel] = useState('5');
    const [frameworkSource, setFrameworkSource] = useState<'master' | 'custom' | null>(null);
    const [customDomains, setCustomDomains] = useState<string[]>([]);
    const [newDomainInput, setNewDomainInput] = useState('');
    const [studentNames, setStudentNames] = useState('');

    const [isInitializing, setIsInitializing] = useState(false);
    const { showToast } = useToast();

    const handleComplete = async () => {
        if (isInitializing) return;
        setIsInitializing(true);
        
        try {
            // 1. Set up subjects
            await initializeFramework(frameworkSource || 'master', customDomains);
            
            // 2. Register class
            await registerClass({
                id: `c-${Date.now()}`,
                className,
                gradeLevel,
                academicYear: new Date().getFullYear().toString(),
            });

            // 3. Add students
            if (studentNames.trim()) {
                const names = studentNames.trim().split('\n').filter(n => n.trim().length > 0);
                await addStudentsBulk(names);
            }
            
            showToast("Setup complete. Welcome to Benchmark.");
        } catch (error: any) {
            console.error("Onboarding failed:", error);
            showToast("Initialization failed. Please check your network or try again.", "error");
        } finally {
            setIsInitializing(false);
        }
    };

    const addCustomDomain = () => {
        if (newDomainInput.trim() && !customDomains.includes(newDomainInput.trim())) {
            setCustomDomains([...customDomains, newDomainInput.trim()]);
            setNewDomainInput('');
        }
    };

    const steps = [
        { t: "School Info", d: "Class Identity" },
        { t: "Setup Type", d: "Master vs Custom" },
        { t: "Subjects", d: "Skill Validation" },
        { t: "Students", d: "Student Roster" }
    ];

    return (
        <div className="fixed inset-0 bg-slate-900/98 backdrop-blur-3xl z-[1000] flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-6xl animate-in zoom-in-95 duration-500 my-auto">
                <Card className="p-0 shadow-[0_0_120px_rgba(0,0,0,0.8)] border-0 bg-white overflow-hidden rounded-[3.5rem]">
                    <div className="flex flex-col md:flex-row min-h-[750px]">
                        
                        {/* Sidebar: Setup Progress */}
                        <div className="w-full md:w-80 bg-slate-950 p-10 text-white flex flex-col justify-between relative overflow-hidden shrink-0 border-r border-white/5">
                            <div className="absolute inset-0 opacity-10 pointer-events-none">
                                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent"></div>
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                            </div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-16">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.5)]">
                                        <Icon name="benchmark" className="w-6 h-6 text-white" />
                                    </div>
                                    <h2 className="text-xl font-black tracking-tighter uppercase italic text-white">Setup Guide</h2>
                                </div>
                                
                                <div className="space-y-10">
                                    {steps.map((item, idx) => (
                                        <div key={idx} className={`flex items-start gap-5 transition-all duration-700 ${step >= idx ? 'opacity-100' : 'opacity-20 translate-x-4'}`}>
                                            <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center font-black text-[10px] shrink-0 transition-colors ${step >= idx ? 'border-indigo-500 bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'border-white/20'}`}>
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.25em] block leading-none mb-1 text-white">{item.t}</span>
                                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{item.d}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="relative z-10 pt-10 border-t border-white/5">
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-3">Pedagogical Guardrails</p>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${className ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-slate-700'}`}></div>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Class Identity Lock</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${frameworkSource ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-slate-700'}`}></div>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Logic Controller Synced</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Architect Main Console */}
                        <div className="flex-1 p-12 md:p-20 flex flex-col justify-between bg-white relative">
                            
                            {step === 0 && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
                                    <div className="max-w-2xl">
                                        <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-6 leading-[0.9] italic">Define the <br/><span className="text-indigo-600">Context.</span></h1>
                                        <p className="text-slate-500 font-medium text-xl leading-relaxed">
                                            Benchmark is a high-precision pedagogical OS. Let's initialize your classroom <span className="text-indigo-600 font-extrabold">instructional environment</span>.
                                        </p>
                                    </div>

                                    <div className="space-y-10 bg-slate-50/50 p-12 rounded-[3.5rem] border border-slate-100 shadow-inner">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-4 ml-1">Class Segment Name</label>
                                            <input 
                                                type="text" 
                                                value={className}
                                                onChange={(e) => setClassName(e.target.value)}
                                                placeholder="e.g. Explorers 5A (Spring 2025)"
                                                className="w-full px-10 py-7 border-2 border-slate-200 bg-white rounded-[2rem] focus:border-indigo-600 focus:outline-none text-2xl font-black text-slate-800 transition-all shadow-sm placeholder:text-slate-200"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-4 ml-1">Curriculum Calibration</label>
                                            <div className="relative">
                                                <select 
                                                    value={gradeLevel}
                                                    onChange={(e) => setGradeLevel(e.target.value)}
                                                    className="w-full px-10 py-7 border-2 border-slate-200 bg-white rounded-[2rem] focus:border-indigo-600 focus:outline-none text-2xl font-black text-slate-800 appearance-none cursor-pointer shadow-sm pr-20"
                                                >
                                                    <option value="5">Level 5 (Pre-A1 / Age 5-6)</option>
                                                    <option value="6-1">Level 6-1 (Starters / Age 6-7)</option>
                                                    <option value="6-2">Level 6-2 (Movers / Age 7-8)</option>
                                                    <option value="7-2">Level 7-2 (Flyers / Age 8-9)</option>
                                                    <option value="7-3">Level 7-3 (KET/PET / Age 10+)</option>
                                                </select>
                                                <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <Icon name="arrowDown" className="w-8 h-8" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-10 flex justify-between items-center border-t border-slate-50">
                                        <button onClick={loadDemoData} className="text-[10px] font-black text-slate-300 hover:text-indigo-600 transition-all uppercase tracking-widest px-4 py-2 hover:bg-slate-50 rounded-xl">Skip to Sandbox</button>
                                        <button 
                                            onClick={() => setStep(1)}
                                            disabled={!className}
                                            className="px-16 py-7 bg-indigo-600 text-white rounded-[2.5rem] font-black shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:bg-indigo-700 transition active:scale-95 text-xs uppercase tracking-[0.2em] border-b-8 border-indigo-900 disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            Next: System Logic &rarr;
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 1 && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
                                    <div>
                                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-6 leading-[0.9] italic">Logic <br/><span className="text-indigo-600">Fork.</span></h1>
                                        <p className="text-slate-500 font-medium text-lg leading-relaxed">How should Benchmark interpret your data? This determines <span className="text-indigo-600 font-bold italic">intervention logic</span> and <span className="text-indigo-600 font-bold italic">test alignment</span>.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <button 
                                            onClick={() => setFrameworkSource('master')}
                                            className={`group relative p-10 rounded-[3.5rem] border-4 text-left transition-all ${frameworkSource === 'master' ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl scale-[1.03]' : 'bg-white border-slate-100 hover:border-indigo-100 hover:bg-slate-50'}`}
                                        >
                                            <div className={`p-4 rounded-2xl mb-8 inline-block transition-colors ${frameworkSource === 'master' ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'}`}>
                                                <Icon name="shield" className="w-10 h-10" />
                                            </div>
                                            <h3 className={`text-2xl font-black mb-3 ${frameworkSource === 'master' ? 'text-white' : 'text-slate-900'}`}>Master Framework</h3>
                                            <p className={`text-xs font-bold leading-relaxed ${frameworkSource === 'master' ? 'text-indigo-100' : 'text-slate-400'}`}>
                                                PRE-ALIGNED. Optimized for CEFR & Cambridge YLE Standards. Access 100+ pre-built tests instantly.
                                            </p>
                                            {frameworkSource === 'master' && <div className="absolute top-6 right-8 text-white animate-bounce"><Icon name="check" className="w-6 h-6" /></div>}
                                        </button>

                                        <button 
                                            onClick={() => setFrameworkSource('custom')}
                                            className={`p-10 rounded-[3.5rem] border-4 text-left transition-all ${frameworkSource === 'custom' ? 'bg-slate-900 border-slate-900 text-white shadow-2xl scale-[1.03]' : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
                                        >
                                            <div className={`p-4 rounded-2xl mb-8 inline-block ${frameworkSource === 'custom' ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>
                                                <Icon name="settings" className="w-10 h-10" />
                                            </div>
                                            <h3 className={`text-2xl font-black mb-3 ${frameworkSource === 'custom' ? 'text-white' : 'text-slate-900'}`}>Custom Build</h3>
                                            <p className={`text-xs font-bold leading-relaxed ${frameworkSource === 'custom' ? 'text-slate-400' : 'text-slate-400'}`}>
                                                SYSTEM AGNOSTIC. Define your own academic silos. Requires manual test alignment and calibration.
                                            </p>
                                        </button>
                                    </div>

                                    {frameworkSource === 'custom' && (
                                        <div className="bg-rose-50 p-8 rounded-[2.5rem] border border-rose-100 flex items-center gap-6 animate-in slide-in-from-top-6">
                                            <div className="p-4 bg-white rounded-2xl text-rose-600 shadow-sm shrink-0"><Icon name="alert" className="w-6 h-6" /></div>
                                            <div>
                                                <p className="text-[11px] font-black text-rose-800 uppercase tracking-widest mb-1">Architecture Warning</p>
                                                <p className="text-xs font-bold text-rose-700/70 leading-relaxed">
                                                    Official test protocols are calibrated for Master Framework domains. Custom segments may lose automated insight compatibility.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-10 flex justify-between items-center border-t border-slate-50">
                                        <button onClick={() => setStep(0)} className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-4 py-2">Back</button>
                                        <button 
                                            onClick={() => setStep(2)}
                                            disabled={!frameworkSource}
                                            className="px-16 py-7 bg-slate-900 text-white rounded-[2.5rem] font-black shadow-2xl transition active:scale-95 text-xs uppercase tracking-[0.2em] border-b-8 border-slate-950 disabled:opacity-30"
                                        >
                                            Next: Skill Blueprint &rarr;
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
                                    <div>
                                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-6 leading-[0.9] italic">Skill <br/><span className="text-indigo-600">Blueprint.</span></h1>
                                        <p className="text-slate-500 font-medium text-lg leading-relaxed">Verify the academic domains tracked by your system.</p>
                                    </div>

                                    {frameworkSource === 'master' ? (
                                        <div className="bg-slate-50/50 p-10 rounded-[3.5rem] border border-slate-100 grid grid-cols-2 lg:grid-cols-3 gap-6 shadow-inner">
                                            {MASTER_DOMAINS.map(d => (
                                                <div key={d} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><Icon name="check" className="w-4 h-4" strokeWidth={3} /></div>
                                                    <span className="text-xs font-black text-slate-800 uppercase tracking-[0.1em]">{d}</span>
                                                </div>
                                            ))}
                                            <div className="lg:col-span-3 flex items-center gap-4 p-6 bg-indigo-600/5 border border-indigo-100 rounded-[2.5rem] mt-4">
                                                <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-lg"><Icon name="star" className="w-4 h-4" /></div>
                                                <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest leading-relaxed">
                                                    CEFR & YLE Optimized: These domains are pre-mapped to international standards.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            <div className="flex gap-4">
                                                <input 
                                                    type="text" value={newDomainInput} onChange={e => setNewDomainInput(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && addCustomDomain()}
                                                    placeholder="e.g. Science Literacy"
                                                    className="flex-1 px-10 py-6 border-2 border-slate-200 bg-white rounded-3xl focus:border-slate-900 outline-none font-black text-xl shadow-sm"
                                                />
                                                <button onClick={addCustomDomain} className="px-10 py-6 bg-slate-900 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 border-b-4 border-slate-950">Add Segment</button>
                                            </div>
                                            <div className="flex flex-wrap gap-3">
                                                {customDomains.length === 0 && <p className="text-slate-300 font-black italic uppercase tracking-widest py-8 px-10 border-2 border-dashed border-slate-100 rounded-3xl w-full text-center">No segments defined yet</p>}
                                                {customDomains.map(d => (
                                                    <div key={d} className="flex items-center gap-4 px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl hover:bg-white hover:border-indigo-600 transition-all group">
                                                        <span className="text-xs font-black text-slate-800 uppercase tracking-widest">{d}</span>
                                                        <button onClick={() => setCustomDomains(customDomains.filter(i => i !== d))} className="text-slate-300 hover:text-rose-500 transition-colors"><Icon name="close" className="w-5 h-5" /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-10 flex justify-between items-center border-t border-slate-50">
                                        <button onClick={() => setStep(1)} className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-4 py-2">Back</button>
                                        <button 
                                            onClick={() => setStep(3)}
                                            disabled={frameworkSource === 'custom' && customDomains.length === 0}
                                            className="px-16 py-7 bg-indigo-600 text-white rounded-[2.5rem] font-black shadow-2xl transition active:scale-95 text-xs uppercase tracking-[0.2em] border-b-8 border-indigo-900 disabled:opacity-30"
                                        >
                                            Confirm Blueprint &rarr;
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
                                    <div>
                                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-6 leading-[0.9] italic">Roster <br/><span className="text-indigo-600">Identity.</span></h1>
                                        <p className="text-slate-500 font-medium text-lg leading-relaxed">Initialize the unit database. Enter student names (one per line).</p>
                                    </div>

                                    <div className="relative group">
                                        <textarea 
                                            value={studentNames}
                                            onChange={(e) => setStudentNames(e.target.value)}
                                            placeholder="Example:&#10;Alice Kim&#10;Bob Chen&#10;Charlie Smith"
                                            className="w-full px-12 py-12 border-2 border-slate-100 bg-slate-50 rounded-[3.5rem] focus:bg-white focus:border-indigo-600 focus:outline-none min-h-[300px] text-2xl font-black text-slate-800 transition-all placeholder:text-slate-200 shadow-inner"
                                        />
                                        <div className="absolute top-8 right-12 text-slate-200 pointer-events-none group-focus-within:text-indigo-600 transition-colors">
                                            <Icon name="students" className="w-12 h-12" />
                                        </div>
                                    </div>

                                    <div className="pt-10 flex justify-between items-center border-t border-slate-50">
                                        <button onClick={() => setStep(2)} className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-4 py-2">Back</button>
                                        <button 
                                            onClick={handleComplete}
                                            disabled={!studentNames.trim() || isInitializing}
                                            className="px-20 py-8 bg-emerald-600 text-white rounded-[3rem] font-black shadow-[0_30px_70px_rgba(16,185,129,0.3)] flex items-center gap-8 active:scale-95 transition-all text-sm uppercase tracking-[0.4em] border-b-8 border-emerald-900 disabled:opacity-30"
                                        >
                                            <div className="p-2 bg-white rounded-xl text-emerald-600">
                                                {isInitializing ? (
                                                    <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Icon name="check" className="w-8 h-8" strokeWidth={3} />
                                                )}
                                            </div>
                                            <span>{isInitializing ? 'Initializing...' : 'Initialize Core Engine'}</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
