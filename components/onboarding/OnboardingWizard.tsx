
import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';
import { useStudents } from '../../context/StudentContext';

const ProgressDot: React.FC<{ active: boolean; completed: boolean }> = ({ active, completed }) => (
    <div className={`h-1.5 w-12 rounded-full transition-all duration-700 ${
        completed ? 'bg-indigo-600' : active ? 'bg-indigo-400 animate-pulse' : 'bg-slate-200'
    }`}></div>
);

const FeatureHighlight: React.FC<{ icon: string; title: string; desc: string; color: string }> = ({ icon, title, desc, color }) => (
    <div className="flex gap-4 p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-colors group">
        <div className={`w-12 h-12 shrink-0 rounded-2xl bg-white shadow-sm flex items-center justify-center text-${color}-600 group-hover:scale-110 transition-transform`}>
            <Icon name={icon} className="w-6 h-6" />
        </div>
        <div>
            <h4 className="font-black text-slate-800 text-sm mb-1">{title}</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{desc}</p>
        </div>
    </div>
);

export const OnboardingWizard: React.FC = () => {
    const { registerClass, addStudentsBulk, loadDemoData } = useStudents();
    const [step, setStep] = useState(0); 
    const [className, setClassName] = useState('');
    const [gradeLevel, setGradeLevel] = useState('5');
    const [studentNames, setStudentNames] = useState('');

    const handleComplete = () => {
        registerClass({
            id: `c-${Date.now()}`,
            className,
            gradeLevel,
            academicYear: new Date().getFullYear().toString(),
        });

        if (studentNames.trim()) {
            const names = studentNames.split('\n').filter(n => n.trim().length > 0);
            addStudentsBulk(names);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
            <div className="w-full max-w-4xl animate-in zoom-in-95 duration-500">
                <Card className="p-0 shadow-2xl border-0 bg-white overflow-hidden rounded-[3rem]">
                    <div className="flex flex-col md:flex-row min-h-[600px]">
                        {/* Sidebar */}
                        <div className="w-full md:w-80 bg-slate-900 p-10 text-white flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                                <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent"></div>
                            </div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-12">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                        <Icon name="benchmark" className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-black tracking-tighter">BENCHMARK</h2>
                                </div>
                                
                                <div className="space-y-8">
                                    <div className={`flex items-center gap-4 transition-opacity ${step === 0 ? 'opacity-100' : 'opacity-40'}`}>
                                        <div className="w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center font-black text-xs">1</div>
                                        <span className="text-sm font-bold uppercase tracking-widest">Protocol</span>
                                    </div>
                                    <div className={`flex items-center gap-4 transition-opacity ${step === 1 ? 'opacity-100' : 'opacity-40'}`}>
                                        <div className="w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center font-black text-xs">2</div>
                                        <span className="text-sm font-bold uppercase tracking-widest">Environment</span>
                                    </div>
                                    <div className={`flex items-center gap-4 transition-opacity ${step === 2 ? 'opacity-100' : 'opacity-40'}`}>
                                        <div className="w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center font-black text-xs">3</div>
                                        <span className="text-sm font-bold uppercase tracking-widest">Identity</span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 pt-10 border-t border-white/10">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Security Status</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-xs font-bold text-slate-300">Core Logic Ready</span>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-10 md:p-16 flex flex-col justify-center bg-white">
                            {step === 0 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Welcome to the Method.</h1>
                                        <p className="text-slate-500 font-medium text-lg leading-relaxed">
                                            Benchmark is an institutional intelligence layer designed to track <span className="text-indigo-600 font-bold">Growth Velocity</span> and identify early risk patterns.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <FeatureHighlight 
                                            icon="trendUp" 
                                            title="Velocity Tracking" 
                                            color="indigo"
                                            desc="We track how fast students improve, identifying 'hidden stars' and sudden regressions before they become failing scores." 
                                        />
                                        <FeatureHighlight 
                                            icon="alert" 
                                            title="RTI Tier Logic" 
                                            color="rose"
                                            desc="Automated Tier 1, 2, and 3 flagging based on standard deviation and longitudinal performance gaps." 
                                        />
                                        <FeatureHighlight 
                                            icon="globe" 
                                            title="Standard Alignment" 
                                            color="emerald"
                                            desc="Scores automatically map to CEFR (A1-B2) and Cambridge standards for international reporting compliance." 
                                        />
                                    </div>

                                    <div className="pt-8 flex justify-between items-center border-t border-slate-50">
                                        <button onClick={loadDemoData} className="text-sm font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">Load Demo Data</button>
                                        <button 
                                            onClick={() => setStep(1)}
                                            className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition active:scale-95 text-xs uppercase tracking-widest"
                                        >
                                            Initialize Setup &rarr;
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 1 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Classroom Scope.</h1>
                                        <p className="text-slate-500 font-medium">Define your institutional environment and target benchmarks.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">Internal Class ID</label>
                                            <input 
                                                type="text" 
                                                value={className}
                                                onChange={(e) => setClassName(e.target.value)}
                                                placeholder="e.g., Explorers 5-A (2025)"
                                                className="w-full px-6 py-5 border-2 border-slate-100 bg-slate-50 rounded-2xl focus:bg-white focus:border-indigo-600 focus:outline-none text-lg font-black text-slate-800 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">Pedagogical Level</label>
                                            <select 
                                                value={gradeLevel}
                                                onChange={(e) => setGradeLevel(e.target.value)}
                                                className="w-full px-6 py-5 border-2 border-slate-100 bg-slate-50 rounded-2xl focus:bg-white focus:border-indigo-600 focus:outline-none text-lg font-black text-slate-800 appearance-none transition-all cursor-pointer"
                                            >
                                                <option value="5">Level 5 (Age 5-6 / Pre-A1)</option>
                                                <option value="6-1">Level 6-1 (Starters)</option>
                                                <option value="6-2">Level 6-2 (Movers)</option>
                                                <option value="7-2">Level 7-2 (Flyers)</option>
                                                <option value="7-3">Level 7-3 (KET/PET)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="pt-8 flex justify-between items-center border-t border-slate-50">
                                        <button onClick={() => setStep(0)} className="text-sm font-black text-slate-400 uppercase tracking-widest">Back</button>
                                        <button 
                                            onClick={() => setStep(2)}
                                            disabled={!className}
                                            className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-2xl disabled:opacity-30 transition text-xs uppercase tracking-widest"
                                        >
                                            Next: Build Roster &rarr;
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Student Identity.</h1>
                                        <p className="text-slate-500 font-medium mb-4">Paste your student roster below (one name per line).</p>
                                        <button 
                                            className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors"
                                            onClick={() => window.alert("CSV Template Downloaded (Simulated)")}
                                        >
                                            Download Roster Template
                                        </button>
                                    </div>

                                    <div className="relative">
                                        <textarea 
                                            value={studentNames}
                                            onChange={(e) => setStudentNames(e.target.value)}
                                            placeholder="Alice Kim&#10;Bob Chen&#10;Charlie Smith"
                                            className="w-full px-6 py-5 border-2 border-slate-100 bg-slate-50 rounded-[2rem] focus:bg-white focus:border-indigo-600 focus:outline-none min-h-[250px] text-lg font-bold text-slate-800 transition-all placeholder:text-slate-200"
                                        />
                                        <div className="absolute bottom-6 right-6 text-[10px] font-black text-slate-300 uppercase tracking-widest bg-white/80 px-3 py-1 rounded-full border border-slate-100 backdrop-blur-sm">
                                            {studentNames.split('\n').filter(n => n.trim()).length} Identified
                                        </div>
                                    </div>

                                    <div className="pt-8 flex justify-between items-center border-t border-slate-50">
                                        <button onClick={() => setStep(1)} className="text-sm font-black text-slate-400 uppercase tracking-widest">Back</button>
                                        <button 
                                            onClick={handleComplete}
                                            disabled={!studentNames.trim()}
                                            className="px-12 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-2xl shadow-emerald-200 flex items-center gap-3 active:scale-95 transition-all text-xs uppercase tracking-widest border-b-4 border-emerald-800"
                                        >
                                            <Icon name="check" className="w-5 h-5" />
                                            <span>Launch Classroom</span>
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
