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
        <div className="fixed inset-0 bg-zinc-950/98 backdrop-blur-md z-[1000] flex items-center justify-center p-4 overflow-y-auto font-sans">
            <div className="w-full max-w-5xl animate-in zoom-in-95 duration-300 my-auto">
                <Card className="p-0 border border-zinc-900 bg-zinc-950 overflow-hidden rounded-[6px] shadow-md">
                    <div className="flex flex-col md:flex-row min-h-[580px]">
                        
                        {/* Sidebar: Progress */}
                        <div className="w-full md:w-72 bg-zinc-950 p-8 text-zinc-100 flex flex-col justify-between relative overflow-hidden shrink-0 border-r border-zinc-900">
                            <div className="relative z-10 space-y-12">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-[4px] bg-zinc-900 border border-zinc-850 flex items-center justify-center text-[oklch(0.72_0.18_145)]">
                                        <Icon name="benchmark" className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-sm font-semibold tracking-tight uppercase font-mono">System Config</h2>
                                </div>
                                
                                <div className="space-y-6">
                                    {steps.map((item, idx) => (
                                        <div key={idx} className={`flex items-start gap-4 transition-all duration-300 ${step >= idx ? 'opacity-100' : 'opacity-25 translate-x-1'}`}>
                                            <div className={`w-6 h-6 rounded-[2px] border flex items-center justify-center font-mono text-[9px] shrink-0 transition-colors ${
                                                step >= idx 
                                                    ? 'border-[oklch(0.72_0.18_145)]/40 bg-[oklch(0.72_0.18_145)]/10 text-[oklch(0.72_0.18_145)]' 
                                                    : 'border-zinc-800 bg-zinc-905 text-zinc-500'
                                            }`}>
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-mono uppercase tracking-wider block leading-none mb-1 text-zinc-200">{item.t}</span>
                                                <span className="text-[9px] text-zinc-500 font-normal uppercase tracking-wider">{item.d}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="relative z-10 pt-6 border-t border-zinc-900/60 mt-8">
                                <div className="bg-zinc-900/45 p-3.5 rounded-[4px] border border-zinc-900">
                                    <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-2 select-none">Pedagogical integrity</p>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${className ? 'bg-[oklch(0.72_0.18_145)]' : 'bg-zinc-800'}`}></div>
                                            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Class Identity Saved</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${frameworkSource ? 'bg-[oklch(0.72_0.18_145)]' : 'bg-zinc-800'}`}></div>
                                            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Engine Mode Configured</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Config Panels */}
                        <div className="flex-1 p-8 md:p-12 flex flex-col justify-between bg-zinc-950/40 relative">
                            
                            {step === 0 && (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    <div className="max-w-xl">
                                        <h1 className="text-2xl font-medium text-zinc-100 tracking-tight leading-none mb-3">Define the Classroom Context.</h1>
                                        <p className="text-zinc-500 text-xs leading-relaxed">
                                            Benchmark is a high-precision pedagogical system. Let's declare your primary <span className="text-zinc-300">instructional domain parameters</span>.
                                        </p>
                                    </div>

                                    <div className="space-y-6 bg-zinc-950 p-6 rounded-[4px] border border-zinc-900">
                                        <div>
                                            <label className="block text-[9px] font-mono uppercase text-zinc-550 tracking-wider mb-2 select-none">Class Segment Identifier</label>
                                            <input 
                                                type="text" 
                                                value={className}
                                                onChange={(e) => setClassName(e.target.value)}
                                                placeholder="e.g. Explorers 5A (Spring 2026)"
                                                className="w-full px-4 py-3 border border-zinc-850 bg-zinc-900/10 text-zinc-200 rounded-[4px] focus:border-zinc-700 outline-none text-sm placeholder:text-zinc-700 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-mono uppercase text-zinc-550 tracking-wider mb-2 select-none">Curriculum Calibration</label>
                                            <div className="relative">
                                                <select 
                                                    value={gradeLevel}
                                                    onChange={(e) => setGradeLevel(e.target.value)}
                                                    className="w-full px-4 py-3 border border-zinc-850 bg-zinc-900/10 text-zinc-200 rounded-[4px] focus:border-zinc-700 outline-none text-sm cursor-pointer"
                                                >
                                                    <option value="5" className="bg-zinc-950 text-zinc-200">Level 5 (Pre-A1 / Age 5-6)</option>
                                                    <option value="6-1" className="bg-zinc-950 text-zinc-200">Level 6-1 (Starters / Age 6-7)</option>
                                                    <option value="6-2" className="bg-zinc-950 text-zinc-200">Level 6-2 (Movers / Age 7-8)</option>
                                                    <option value="7-2" className="bg-zinc-950 text-zinc-200">Level 7-2 (Flyers / Age 8-9)</option>
                                                    <option value="7-3" className="bg-zinc-950 text-zinc-200">Level 7-3 (KET/PET / Age 10+)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 flex justify-between items-center border-t border-zinc-900">
                                        <button onClick={loadDemoData} className="text-[10px] font-mono text-zinc-550 hover:text-zinc-355 transition-colors uppercase tracking-wider px-3 py-1.5 cursor-pointer">Skip to Sandbox</button>
                                        <button 
                                            onClick={() => setStep(1)}
                                            disabled={!className}
                                            className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-30 text-zinc-950 rounded-[4px] text-xs font-semibold cursor-pointer transition-colors"
                                        >
                                            Next: System Logic &rarr;
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 1 && (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    <div>
                                        <h1 className="text-2xl font-medium text-zinc-100 tracking-tight leading-none mb-3">Logic Fork.</h1>
                                        <p className="text-zinc-500 text-xs leading-relaxed">How should the analysis core compile metrics? This calibrates <span className="text-zinc-300">intervention logic</span>.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button 
                                            onClick={() => setFrameworkSource('master')}
                                            className={`relative p-5 rounded-[4px] border text-left transition-colors cursor-pointer ${
                                                frameworkSource === 'master' 
                                                    ? 'bg-zinc-900 border-[oklch(0.72_0.18_145)] text-zinc-100' 
                                                    : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:border-zinc-850 hover:bg-zinc-900/20'
                                            }`}
                                        >
                                            <div className={`p-2 rounded-[4px] mb-4 inline-block ${frameworkSource === 'master' ? 'bg-[oklch(0.72_0.18_145)]/10 text-[oklch(0.72_0.18_145)]' : 'bg-zinc-900 text-zinc-550'}`}>
                                                <Icon name="shield" className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-xs font-mono uppercase tracking-wider mb-1.5 text-zinc-200">Master Blueprint</h3>
                                            <p className="text-[10.5px] leading-relaxed text-zinc-500">
                                                CEFR & Cambridge YLE integrated. Standard assessment benchmarks configured immediately.
                                            </p>
                                            {frameworkSource === 'master' && <div className="absolute top-4 right-4 text-[oklch(0.72_0.18_145)]"><Icon name="check" className="w-4 h-4" /></div>}
                                        </button>

                                        <button 
                                            onClick={() => setFrameworkSource('custom')}
                                            className={`relative p-5 rounded-[4px] border text-left transition-colors cursor-pointer ${
                                                frameworkSource === 'custom' 
                                                    ? 'bg-zinc-900 border-[oklch(0.72_0.18_145)] text-zinc-100' 
                                                    : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:border-zinc-850 hover:bg-zinc-900/20'
                                            }`}
                                        >
                                            <div className={`p-2 rounded-[4px] mb-4 inline-block ${frameworkSource === 'custom' ? 'bg-[oklch(0.72_0.18_145)]/10 text-[oklch(0.72_0.18_145)]' : 'bg-zinc-900 text-zinc-550'}`}>
                                                <Icon name="settings" className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-xs font-mono uppercase tracking-wider mb-1.5 text-zinc-200">Custom Fields</h3>
                                            <p className="text-[10.5px] leading-relaxed text-zinc-505">
                                                Define specific subject labels and dimensions manually in the next step.
                                            </p>
                                            {frameworkSource === 'custom' && <div className="absolute top-4 right-4 text-[oklch(0.72_0.18_145)]"><Icon name="check" className="w-4 h-4" /></div>}
                                        </button>
                                    </div>

                                    {frameworkSource === 'custom' && (
                                        <div className="bg-zinc-900/40 p-4 rounded-[4px] border border-zinc-850 flex items-center gap-4 animate-in slide-in-from-top-4 duration-300">
                                            <div className="p-2 bg-zinc-950 rounded-[4px] text-rose-455 border border-zinc-800"><Icon name="alert" className="w-4 h-4" /></div>
                                            <div>
                                                <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider mb-0.5">Automations Adjusted</p>
                                                <p className="text-[10.5px] text-zinc-550 leading-relaxed">
                                                    Diagnostics insights may require domain verification. Manual scale setup applies.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-6 flex justify-between items-center border-t border-zinc-900">
                                        <button onClick={() => setStep(0)} className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider px-3 py-1.5 hover:text-zinc-300 cursor-pointer">Back</button>
                                        <button 
                                            onClick={() => setStep(2)}
                                            disabled={!frameworkSource}
                                            className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-30 text-zinc-950 rounded-[4px] text-xs font-semibold cursor-pointer transition-colors"
                                        >
                                            Next: Skill Blueprint &rarr;
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    <div>
                                        <h1 className="text-2xl font-medium text-zinc-100 tracking-tight leading-none mb-3">Academic Blueprint.</h1>
                                        <p className="text-zinc-500 text-xs leading-relaxed">Verify target diagnostic divisions tracked by your environment node.</p>
                                    </div>

                                    {frameworkSource === 'master' ? (
                                        <div className="space-y-4">
                                            <div className="bg-zinc-950 p-5 rounded-[4px] border border-zinc-900 grid grid-cols-2 lg:grid-cols-3 gap-3">
                                                {MASTER_DOMAINS.map(d => (
                                                    <div key={d} className="flex items-center gap-2.5 p-3 bg-zinc-900/40 rounded-[2px] border border-zinc-900">
                                                        <div className="p-1 text-[oklch(0.72_0.18_145)]"><Icon name="check" className="w-3.5 h-3.5" /></div>
                                                        <span className="text-[10px] font-mono text-zinc-300 uppercase tracking-tight">{d}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-3 p-4 bg-[oklch(0.72_0.18_145)]/5 border border-[oklch(0.72_0.18_145)]/10 rounded-[4px]">
                                                <div className="p-1 px-1.5 bg-zinc-900 text-[oklch(0.72_0.18_145)] rounded-[4px] text-[10px] font-mono">OK</div>
                                                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider leading-relaxed">
                                                    CEFR Standard: Pre-mapped standard domains aligned correctly with academic scoring.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6 bg-zinc-950 p-5 rounded-[4px] border border-zinc-900">
                                            <div className="flex gap-2">
                                                <input 
                                                    type="text" value={newDomainInput} onChange={e => setNewDomainInput(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && addCustomDomain()}
                                                    placeholder="e.g. Science Literacy"
                                                    className="flex-1 px-3 py-2 border border-zinc-850 bg-zinc-900/10 text-zinc-200 rounded-[4px] focus:border-zinc-700 outline-none text-xs"
                                                />
                                                <button onClick={addCustomDomain} className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 rounded-[4px] text-xs font-semibold cursor-pointer">Add</button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {customDomains.length === 0 && <p className="text-zinc-600 font-mono text-[9px] uppercase tracking-wider py-4 w-full text-center">No segments defined yet</p>}
                                                {customDomains.map(d => (
                                                    <div key={d} className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-850 rounded-[4px] hover:border-zinc-750 transition-colors">
                                                        <span className="text-[10px] font-mono text-zinc-300 uppercase tracking-wider">{d}</span>
                                                        <button onClick={() => setCustomDomains(customDomains.filter(i => i !== d))} className="text-zinc-550 hover:text-rose-400 transition-colors cursor-pointer"><Icon name="close" className="w-3.5 h-3.5" /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-6 flex justify-between items-center border-t border-zinc-900">
                                        <button onClick={() => setStep(1)} className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider px-3 py-1.5 hover:text-zinc-300 cursor-pointer">Back</button>
                                        <button 
                                            onClick={() => setStep(3)}
                                            disabled={frameworkSource === 'custom' && customDomains.length === 0}
                                            className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-30 text-zinc-950 rounded-[4px] text-xs font-semibold cursor-pointer transition-colors"
                                        >
                                            Confirm Blueprint &rarr;
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    <div>
                                        <h1 className="text-2xl font-medium text-zinc-100 tracking-tight leading-none mb-3">Roster Load.</h1>
                                        <p className="text-zinc-500 text-xs leading-relaxed">Populate classroom unit indexes. Input names (one name per line).</p>
                                    </div>

                                    <div className="relative">
                                        <textarea 
                                            value={studentNames}
                                            onChange={(e) => setStudentNames(e.target.value)}
                                            placeholder="Example:&#10;Alice Kim&#10;Bob Chen&#10;Charlie Smith"
                                            className="w-full px-5 py-5 border border-zinc-850 bg-zinc-900/10 text-zinc-200 rounded-[4px] focus:border-zinc-700 outline-none min-h-[160px] text-sm placeholder:text-zinc-700 font-mono"
                                        />
                                    </div>

                                    <div className="pt-6 flex justify-between items-center border-t border-zinc-900">
                                        <button onClick={() => setStep(2)} className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider px-3 py-1.5 hover:text-zinc-300 cursor-pointer">Back</button>
                                        <button 
                                            onClick={handleComplete}
                                            disabled={!studentNames.trim() || isInitializing}
                                            className="px-5 py-2.5 bg-white hover:bg-zinc-100 disabled:opacity-30 text-zinc-950 rounded-[4px] text-xs font-semibold cursor-pointer transition-colors flex items-center gap-2"
                                        >
                                            {isInitializing ? (
                                                <Icon name="refresh" className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <Icon name="check" className="w-3.5 h-3.5" />
                                            )}
                                            <span>{isInitializing ? 'Configuring System...' : 'Initialize System Platform'}</span>
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
