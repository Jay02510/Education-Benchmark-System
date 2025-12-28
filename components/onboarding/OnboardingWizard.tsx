import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';
import { useStudents } from '../../context/StudentContext';

export const OnboardingWizard: React.FC = () => {
    const { registerClass, addStudentsBulk, loadDemoData } = useStudents();
    const [step, setStep] = useState(1);
    
    // Step 1 State
    const [className, setClassName] = useState('');
    const [gradeLevel, setGradeLevel] = useState('5');
    
    // Step 2 State
    const [studentNames, setStudentNames] = useState('');

    const handleStep1Submit = () => {
        if (className && gradeLevel) {
            setStep(2);
        }
    };

    const handleComplete = () => {
        // Save Class Profile
        registerClass({
            id: `c-${Date.now()}`,
            className,
            gradeLevel,
            academicYear: new Date().getFullYear().toString(),
        });

        // Save Students
        if (studentNames.trim()) {
            const names = studentNames.split('\n').filter(n => n.trim().length > 0);
            addStudentsBulk(names);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <Card className="p-8 shadow-2xl border-0">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Benchmark AI</h1>
                        <p className="text-gray-500">Let's get your digital classroom set up.</p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center mb-8">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                        <div className={`w-16 h-1 bg-gray-200 mx-2 ${step >= 2 ? 'bg-blue-600' : ''}`}></div>
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                    </div>

                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                                <input 
                                    type="text" 
                                    value={className}
                                    onChange={(e) => setClassName(e.target.value)}
                                    placeholder="e.g., Tigers 5A"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target Level / Age Group</label>
                                <select 
                                    value={gradeLevel}
                                    onChange={(e) => setGradeLevel(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg"
                                >
                                    <option value="5">Level 5</option>
                                    <option value="6-1">Level 6-1</option>
                                    <option value="6-2">Level 6-2</option>
                                    <option value="7-2">Level 7-2</option>
                                    <option value="7-3">Level 7-3</option>
                                </select>
                            </div>
                            <div className="pt-4 flex justify-between items-center">
                                <button 
                                    onClick={loadDemoData}
                                    className="text-sm text-slate-500 hover:text-blue-600 hover:underline"
                                >
                                    Skip setup & load demo data
                                </button>
                                <button 
                                    onClick={handleStep1Submit}
                                    disabled={!className}
                                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next Step &rarr;
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Add Students</label>
                                <p className="text-xs text-gray-500 mb-2">Enter student names, one per line.</p>
                                <textarea 
                                    value={studentNames}
                                    onChange={(e) => setStudentNames(e.target.value)}
                                    placeholder="Alice Johnson&#10;Bob Smith&#10;Charlie Brown"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[200px] text-lg"
                                />
                            </div>
                             <div className="pt-4 flex justify-between items-center">
                                <button 
                                    onClick={() => setStep(1)}
                                    className="text-gray-600 font-medium hover:text-gray-900"
                                >
                                    &larr; Back
                                </button>
                                <button 
                                    onClick={handleComplete}
                                    disabled={!studentNames.trim()}
                                    className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                    <Icon name="check" className="w-5 h-5" />
                                    <span>Finish Setup</span>
                                </button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};