import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';
import { useStudents } from '../../context/StudentContext';

const ConceptCard: React.FC<{ icon: string; title: string; text: string; color: string }> = ({ icon, title, text, color }) => (
    <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col items-center text-center">
        <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600 mb-3`}>
            <Icon name={icon} className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-slate-800 text-sm mb-1">{title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed">{text}</p>
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
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl">
                <Card className="p-8 shadow-2xl border-0">
                    <div className="flex items-center justify-center mb-8 gap-2">
                        {[0, 1, 2].map(i => (
                            <div key={i} className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= i ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                        ))}
                    </div>

                    {step === 0 && (
                        <div className="space-y-8 animate-in fade-in duration-700">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Icon name="brain" className="w-10 h-10" />
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 mb-2">The Benchmark Method</h1>
                                <p className="text-slate-500 font-medium">Measure success with professional pedagogical tracking.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <ConceptCard 
                                    icon="trendUp" 
                                    title="Growth Velocity" 
                                    text="Tracks the SPEED of student improvement over time, moving beyond static scores." 
                                    color="indigo" 
                                />
                                <ConceptCard 
                                    icon="alert" 
                                    title="Automated RTI" 
                                    text="System flags students needing support across Tiers 1, 2, or 3 based on performance gaps." 
                                    color="rose" 
                                />
                                <ConceptCard 
                                    icon="benchmark" 
                                    title="Global Standards" 
                                    text="Scores automatically map to international CEFR (A1-B2) and Cambridge standards." 
                                    color="emerald" 
                                />
                            </div>

                            <div className="pt-4 flex justify-between items-center">
                                <button onClick={loadDemoData} className="text-sm font-bold text-slate-400 hover:text-indigo-600">Skip to Demo</button>
                                <button 
                                    onClick={() => setStep(1)}
                                    className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition active:scale-95"
                                >
                                    Got it, let's go!
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-500">
                             <div className="text-center">
                                <h1 className="text-3xl font-black text-slate-900 mb-2">Class Profile</h1>
                                <p className="text-slate-500">Define your classroom environment.</p>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 ml-1">Class Name</label>
                                <input 
                                    type="text" 
                                    value={className}
                                    onChange={(e) => setClassName(e.target.value)}
                                    placeholder="e.g., Explorers 5A"
                                    className="w-full px-5 py-4 border border-slate-200 bg-slate-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-lg font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 ml-1">Target Grade Level</label>
                                <select 
                                    value={gradeLevel}
                                    onChange={(e) => setGradeLevel(e.target.value)}
                                    className="w-full px-5 py-4 border border-slate-200 bg-slate-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-lg font-bold"
                                >
                                    <option value="5">Level 5 (Age 5-6)</option>
                                    <option value="6-1">Level 6-1 (Age 6-7)</option>
                                    <option value="6-2">Level 6-2 (Age 7-8)</option>
                                    <option value="7-2">Level 7-2 (Age 8-9)</option>
                                    <option value="7-3">Level 7-3 (Age 9-10)</option>
                                </select>
                            </div>
                            <div className="pt-4 flex justify-between items-center">
                                <button onClick={() => setStep(0)} className="text-sm font-bold text-slate-400">Back</button>
                                <button 
                                    onClick={() => setStep(2)}
                                    disabled={!className}
                                    className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl disabled:opacity-50"
                                >
                                    Next: Add Students &rarr;
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-500">
                             <div className="text-center">
                                <h1 className="text-3xl font-black text-slate-900 mb-2">Build Your Roster</h1>
                                <p className="text-slate-500">Paste student names (one per line).</p>
                            </div>
                             <div>
                                <textarea 
                                    value={studentNames}
                                    onChange={(e) => setStudentNames(e.target.value)}
                                    placeholder="Alice Kim&#10;Bob Chen&#10;Charlie Smith"
                                    className="w-full px-5 py-4 border border-slate-200 bg-slate-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[200px] text-lg font-medium"
                                />
                            </div>
                             <div className="pt-4 flex justify-between items-center">
                                <button onClick={() => setStep(1)} className="text-sm font-bold text-slate-400">Back</button>
                                <button 
                                    onClick={handleComplete}
                                    disabled={!studentNames.trim()}
                                    className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-200 flex items-center space-x-2 active:scale-95 transition-all"
                                >
                                    <Icon name="check" className="check" />
                                    <span>Create Classroom</span>
                                </button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};