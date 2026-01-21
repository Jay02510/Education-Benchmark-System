
import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';
import { useStudents } from '../../context/StudentContext';

const FeatureHighlight: React.FC<{ icon: string; title: string; desc: string; color: string }> = ({ icon, title, desc, color }) => (
    <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-colors group">
        <div className={`w-10 h-10 shrink-0 rounded-xl bg-white shadow-sm flex items-center justify-center text-${color}-600 group-hover:scale-110 transition-transform`}>
            <Icon name={icon} className="w-5 h-5" />
        </div>
        <div>
            <h4 className="font-black text-slate-800 text-[13px] mb-0.5">{title}</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{desc}</p>
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

    const steps = [
        { t: "Methodology", d: "Core logic & RTI" },
        { s: 1, t: "Environment", d: "Class & Standards" },
        { s: 2, t: "Materials", d: "The Assessment Kit" },
        { s: 3, t: "Identity", d: "Student Roster" }
    ];

    return (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[1000] flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-5xl animate-in zoom-in-95 duration-500 my-auto">
                <Card className="p-0 shadow-[0_0_100px_rgba(0,0,0,0.5)] border-0 bg-white overflow-hidden rounded-[3rem]">
                    <div className="flex flex-col md:flex-row min-h-[680px]">
                        {/* Sidebar: Mission Control */}
                        <div className="w-full md:w-80 bg-slate-900 p-10 text-white flex flex-col justify-between relative overflow-hidden shrink-0">
                            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                                <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent"></div>
                            </div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-12">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                        <Icon name="benchmark" className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-black tracking-tighter uppercase italic">Benchmark</h2>
                                </div>
                                
                                <div className="space-y-6">
                                    {steps.map((item, idx) => (
                                        <div key={idx} className={`flex items-start gap-4 transition-all duration-500 ${step === idx ? 'opacity-100 translate-x-1' : 'opacity-30'}`}>
                                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-xs shrink-0 ${step === idx ? 'border-indigo-500 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'border-white/20'}`}>
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <span className="text-[11px] font-black uppercase tracking-widest block leading-none mb-1">{item.t}</span>
                                                <span className="text-[10px] text-slate-400 font-medium">{item.d}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="relative z-10 pt-10 border-t border-white/10">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">System Readiness</p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-emerald-500' : 'bg-slate-700 animate-pulse'}`}></div>
                                        <span className="text-[10px] font-bold text-slate-300">Logic Engine Primed</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${step >= 3 ? 'bg-emerald-500' : 'bg-slate-700 animate-pulse'}`}></div>
                                        <span className="text-[10px] font-bold text-slate-300">Roster Sync Ready</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Briefing Area */}
                        <div className="flex-1 p-10 md:p-16 flex flex-col justify-between bg-white relative">
                            {step === 0 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="max-w-xl">
                                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4 leading-[0.9]">Beyond the <br/>Report Card.</h1>
                                        <p className="text-slate-500 font-medium text-lg leading-relaxed">
                                            Benchmark is a high-precision <span className="text-indigo-600 font-bold">early warning system</span> designed to identify regression and plateau patterns before they impact overall grades.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FeatureHighlight 
                                            icon="trendUp" 
                                            title="Velocity Analysis" 
                                            color="indigo"
                                            desc="We track how fast students improve. A high score with low velocity signals a plateau risk." 
                                        />
                                        <FeatureHighlight 
                                            icon="alert" 
                                            title="RTI Triggering" 
                                            color="rose"
                                            desc="Automatic Tier 2/3 flagging for students losing >8% between midline and baseline tests." 
                                        />
                                        <FeatureHighlight 
                                            icon="analytics" 
                                            title="Domain Sensitivity" 
                                            color="emerald"
                                            desc="Identifies specific skill gaps (e.g., strong in Reading but critically weak in Phonics)." 
                                        />
                                        <FeatureHighlight 
                                            icon="library" 
                                            title="Downloadable Kits" 
                                            color="purple"
                                            desc="Access standard exam papers, rubrics, and scoring templates for every CEFR level." 
                                        />
                                    </div>

                                    <div className="pt-10 flex justify-between items-center border-t border-slate-50">
                                        <button onClick={loadDemoData} className="text-xs font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-[0.2em]">Launch Demo Class</button>
                                        <button 
                                            onClick={() => setStep(1)}
                                            className="px-12 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition active:scale-95 text-xs uppercase tracking-widest border-b-4 border-indigo-900"
                                        >
                                            Next: Calibration &rarr;
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 1 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Environment Calibration.</h1>
                                        <p className="text-slate-500 font-medium">Define your institutional scope and academic standards.</p>
                                    </div>

                                    <div className="space-y-6 bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-inner">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">Official Class Name</label>
                                            <input 
                                                type="text" 
                                                value={className}
                                                onChange={(e) => setClassName(e.target.value)}
                                                placeholder="e.g., Explorers 5-A (2025)"
                                                className="w-full px-6 py-5 border-2 border-slate-200 bg-white rounded-2xl focus:border-indigo-600 focus:outline-none text-lg font-black text-slate-800 transition-all shadow-sm"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-end mb-2 ml-1">
                                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">Target Benchmark Level</label>
                                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">CEFR Framework</span>
                                            </div>
                                            <select 
                                                value={gradeLevel}
                                                onChange={(e) => setGradeLevel(e.target.value)}
                                                className="w-full px-6 py-5 border-2 border-slate-200 bg-white rounded-2xl focus:border-indigo-600 focus:outline-none text-lg font-black text-slate-800 appearance-none transition-all cursor-pointer shadow-sm"
                                            >
                                                <option value="5">Level 5 (Pre-A1 / Age 5-6)</option>
                                                <option value="6-1">Level 6-1 (Starters / Age 6-7)</option>
                                                <option value="6-2">Level 6-2 (Movers / Age 7-8)</option>
                                                <option value="7-2">Level 7-2 (Flyers / Age 8-9)</option>
                                                <option value="7-3">Level 7-3 (KET/PET / Age 10+)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="pt-8 flex justify-between items-center border-t border-slate-50">
                                        <button onClick={() => setStep(0)} className="text-xs font-black text-slate-400 uppercase tracking-widest">Back</button>
                                        <button 
                                            onClick={() => setStep(2)}
                                            disabled={!className}
                                            className="px-12 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-2xl disabled:opacity-30 transition text-xs uppercase tracking-widest border-b-4 border-indigo-900"
                                        >
                                            Next: Assessment Kit &rarr;
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">The Assessment Kit.</h1>
                                        <p className="text-slate-500 font-medium mb-6">Benchmark provides the actual testing materials, not just the data tracking.</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {[
                                            { t: "Test Papers", d: "Printable PDF exams for Baseline & Midline.", icon: "book", color: "rose" },
                                            { t: "Official Rubrics", d: "Standardized scoring guides for teachers.", icon: "shield", color: "indigo" },
                                            { t: "Roster Sheets", d: "Physical sign-in and score recording logs.", icon: "students", color: "emerald" }
                                        ].map((kit) => (
                                            <div key={kit.t} className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center text-center group hover:bg-white hover:border-indigo-200 transition-all">
                                                <div className={`w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center text-${kit.color}-600 mb-4 group-hover:scale-110 transition-transform`}>
                                                    <Icon name={kit.icon} className="w-6 h-6" />
                                                </div>
                                                <h4 className="font-black text-slate-800 text-xs uppercase tracking-widest mb-2">{kit.t}</h4>
                                                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{kit.d}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100 flex items-center gap-4">
                                        <div className="p-3 bg-white rounded-xl text-indigo-600 shadow-sm"><Icon name="info" className="w-5 h-5" /></div>
                                        <p className="text-xs font-bold text-indigo-800 leading-relaxed">
                                            These materials will be available for download in your <span className="underline font-black">Benchmark Framework</span> tab immediately after setup.
                                        </p>
                                    </div>

                                    <div className="pt-8 flex justify-between items-center border-t border-slate-50">
                                        <button onClick={() => setStep(1)} className="text-xs font-black text-slate-400 uppercase tracking-widest">Back</button>
                                        <button 
                                            onClick={() => setStep(3)}
                                            className="px-12 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-2xl transition text-xs uppercase tracking-widest border-b-4 border-indigo-900"
                                        >
                                            Next: Synchronize Roster &rarr;
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Student Identity.</h1>
                                        <p className="text-slate-500 font-medium mb-6">Paste your roster (one name per line). We'll generate a unique tracking DNA for each unit.</p>
                                    </div>

                                    <div className="relative group">
                                        <textarea 
                                            value={studentNames}
                                            onChange={(e) => setStudentNames(e.target.value)}
                                            placeholder="Alice Kim&#10;Bob Chen&#10;Charlie Smith"
                                            className="w-full px-8 py-8 border-2 border-slate-100 bg-slate-50 rounded-[2.5rem] focus:bg-white focus:border-indigo-600 focus:outline-none min-h-[250px] text-lg font-bold text-slate-800 transition-all placeholder:text-slate-200 shadow-inner"
                                        />
                                        <div className="absolute bottom-6 right-6 flex items-center gap-3">
                                            <button 
                                                className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-indigo-100 hover:bg-indigo-50 transition-colors shadow-sm"
                                                onClick={() => window.alert("CSV Template Downloaded")}
                                            >
                                                Download Template
                                            </button>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                                                {studentNames.split('\n').filter(n => n.trim()).length} Detected
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 flex justify-between items-center border-t border-slate-50">
                                        <button onClick={() => setStep(2)} className="text-xs font-black text-slate-400 uppercase tracking-widest">Back</button>
                                        <button 
                                            onClick={handleComplete}
                                            disabled={!studentNames.trim()}
                                            className="px-14 py-6 bg-emerald-600 text-white rounded-[2rem] font-black shadow-2xl shadow-emerald-200 flex items-center gap-4 active:scale-95 transition-all text-sm uppercase tracking-[0.2em] border-b-8 border-emerald-800 disabled:opacity-30"
                                        >
                                            <Icon name="check" className="w-6 h-6" strokeWidth={3} />
                                            <span>Commit & Launch Classroom</span>
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
