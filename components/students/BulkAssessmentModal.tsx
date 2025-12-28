
import React, { useState, useRef, useEffect } from 'react';
import { Assessment, Domain, TestPeriod } from '../../types';
import { DOMAINS } from '../../constants';
import { useBenchmarks } from '../../context/BenchmarkContext';
import { Icon } from '../common/Icon';
import { useStudents } from '../../context/StudentContext';

interface BulkAssessmentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const BulkAssessmentModal: React.FC<BulkAssessmentModalProps> = ({ isOpen, onClose }) => {
    const { students, addAssessmentBulk } = useStudents();
    const { subdomains } = useBenchmarks();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [testPeriod, setTestPeriod] = useState<TestPeriod>(TestPeriod.Baseline);
    
    // State to hold all grid data: gridData[studentId]["Domain:Subdomain"] = score
    const [gridData, setGridData] = useState<Record<string, Record<string, number>>>({});

    // Helper to construct key
    const makeKey = (domain: Domain, subdomain: string) => `${domain}:${subdomain}`;

    // Initialize grid data if empty or new student
    const getScore = (studentId: string, domain: Domain, subdomain: string) => {
        return gridData[studentId]?.[makeKey(domain, subdomain)] ?? '';
    };

    const handleScoreChange = (studentId: string, domain: Domain, subdomain: string, value: string, maxScore: number) => {
        if (value === '') {
            setGridData(prev => {
                const newStudentData = { ...prev[studentId] };
                delete newStudentData[makeKey(domain, subdomain)];
                return {
                    ...prev,
                    [studentId]: newStudentData
                };
            });
            return;
        }

        const numValue = Math.min(maxScore, Math.max(0, Number(value)));
        setGridData(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [makeKey(domain, subdomain)]: numValue
            }
        }));
    };

    // Updated Key Navigation for Transposed Grid
    const handleKeyDown = (e: React.KeyboardEvent, sIndex: number, dIndex: number, subIndex: number, allSubdomainsFlat: any[]) => {
        if (e.key === 'ArrowRight' || e.key === 'Enter') {
            e.preventDefault();
            const nextSIndex = sIndex + 1;
            if (nextSIndex < students.length) {
                // Move to next student in same row
                const currentSub = allSubdomainsFlat.find(flat => flat.dIndex === dIndex && flat.sIndex === subIndex);
                if (currentSub) {
                    const nextInputId = `input-${students[nextSIndex].id}-${currentSub.domain}-${currentSub.name}`;
                    document.getElementById(nextInputId)?.focus();
                }
            }
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            const prevSIndex = sIndex - 1;
            if (prevSIndex >= 0) {
                 const currentSub = allSubdomainsFlat.find(flat => flat.dIndex === dIndex && flat.sIndex === subIndex);
                 if (currentSub) {
                    const prevInputId = `input-${students[prevSIndex].id}-${currentSub.domain}-${currentSub.name}`;
                    document.getElementById(prevInputId)?.focus();
                 }
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            // Find next subdomain in the flattened list
            const currentFlatIndex = allSubdomainsFlat.findIndex(flat => flat.dIndex === dIndex && flat.sIndex === subIndex);
            const nextFlat = allSubdomainsFlat[currentFlatIndex + 1];
            if (nextFlat) {
                const nextInputId = `input-${students[sIndex].id}-${nextFlat.domain}-${nextFlat.name}`;
                document.getElementById(nextInputId)?.focus();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            // Find prev subdomain
            const currentFlatIndex = allSubdomainsFlat.findIndex(flat => flat.dIndex === dIndex && flat.sIndex === subIndex);
            const prevFlat = allSubdomainsFlat[currentFlatIndex - 1];
            if (prevFlat) {
                const nextInputId = `input-${students[sIndex].id}-${prevFlat.domain}-${prevFlat.name}`;
                document.getElementById(nextInputId)?.focus();
            }
        }
    };

    const handleSave = () => {
        const bulkUpdateData = students.map(student => {
            const studentScores = gridData[student.id] || {};
            
            // Calculate Aggregate Domain Scores from Subdomains (Percentage Weighted)
            const aggregateScores: Record<Domain, number> = {} as any;
            
            DOMAINS.forEach(domain => {
                const subs = subdomains[domain] || [];
                let totalScore = 0;
                let totalMax = 0;
                let hasEntry = false;

                subs.forEach(sub => {
                    const val = studentScores[makeKey(domain, sub.name)];
                    if (val !== undefined) {
                        totalScore += val;
                        totalMax += sub.maxScore;
                        hasEntry = true;
                    }
                });
                
                if (hasEntry && totalMax > 0) {
                     aggregateScores[domain] = Math.round((totalScore / totalMax) * 100);
                } else {
                     aggregateScores[domain] = 0;
                }
            });

            const newAssessment: Assessment = {
                id: `assess-bulk-${Date.now()}-${student.id}`,
                date,
                type: testPeriod,
                scores: aggregateScores,
                subdomainScores: studentScores
            };

            return {
                studentId: student.id,
                assessment: newAssessment
            };
        });

        addAssessmentBulk(bulkUpdateData);
        onClose();
        setGridData({});
    };

    // Flatten domains for rendering rows
    const flatSubdomains: { domain: Domain, name: string, maxScore: number, dIndex: number, sIndex: number }[] = [];
    DOMAINS.forEach((d, dIdx) => {
        (subdomains[d] || []).forEach((s, sIdx) => {
            flatSubdomains.push({
                domain: d,
                name: s.name,
                maxScore: s.maxScore,
                dIndex: dIdx,
                sIndex: sIdx
            });
        });
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex justify-center items-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[95vw] h-[90vh] flex flex-col overflow-hidden border border-slate-200 ring-1 ring-black/5">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white shrink-0">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                                <Icon name="benchmark" className="w-6 h-6" />
                            </div>
                            Batch Score Entry
                        </h2>
                        <p className="text-slate-500 text-sm mt-1 ml-14">Grade the whole class by skill. Tab to move right.</p>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                         <div className="flex items-center gap-2 px-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Period</label>
                            <select 
                                value={testPeriod} 
                                onChange={(e) => setTestPeriod(e.target.value as TestPeriod)}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm font-bold bg-white outline-none"
                            >
                                {Object.values(TestPeriod).map(q => <option key={q} value={q}>{q}</option>)}
                            </select>
                        </div>
                        <div className="w-px h-6 bg-gray-200"></div>
                        <div className="flex items-center gap-2 px-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</label>
                            <input 
                                type="date" 
                                value={date} 
                                onChange={(e) => setDate(e.target.value)}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm font-bold bg-white outline-none"
                            />
                        </div>
                    </div>
                    <button onClick={onClose} className="ml-4 text-gray-400 hover:text-rose-500 p-2 rounded-full hover:bg-rose-50 transition">
                        <Icon name="close" className="w-6 h-6" />
                    </button>
                </div>

                {/* Grid Body */}
                <div className="flex-1 overflow-auto bg-slate-50 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                    <table className="border-collapse min-w-max w-full">
                        <thead className="bg-white sticky top-0 z-40 shadow-sm">
                            <tr className="h-12">
                                {/* Corner Cell (Sticky Top & Left) */}
                                <th className="px-4 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-wider border-b border-r border-gray-200 min-w-[200px] w-[200px] sticky left-0 top-0 bg-white z-50">
                                    Domain / Student
                                </th>
                                {/* Student Names (Sticky Top) */}
                                {students.map(student => (
                                    <th key={student.id} className="px-2 py-3 text-center min-w-[100px] border-b border-r border-gray-100 bg-white sticky top-0 z-40 group">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center text-xs font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">
                                                {student.name.charAt(0)}
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-700 truncate max-w-[90px]">{student.name.split(' ')[0]}</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {flatSubdomains.map((sub, rowIndex) => (
                                <tr key={`${sub.domain}-${sub.name}`} className="bg-white hover:bg-indigo-50/30 transition-colors group">
                                    {/* Subdomain Label (Sticky Left) */}
                                    <td className="px-4 py-2 border-r border-gray-200 sticky left-0 bg-white group-hover:bg-indigo-50 z-30 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.05)]">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-0.5">{sub.domain}</span>
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-slate-700 text-sm truncate max-w-[140px]" title={sub.name}>{sub.name}</span>
                                                <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 rounded">/{sub.maxScore}</span>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    {/* Student Inputs */}
                                    {students.map((student, sIndex) => (
                                        <td key={student.id} className="p-0 border-r border-gray-100 relative">
                                            <input 
                                                id={`input-${student.id}-${sub.domain}-${sub.name}`}
                                                type="number"
                                                min="0"
                                                max={sub.maxScore}
                                                value={getScore(student.id, sub.domain, sub.name)}
                                                onChange={(e) => handleScoreChange(student.id, sub.domain, sub.name, e.target.value, sub.maxScore)}
                                                onKeyDown={(e) => handleKeyDown(e, sIndex, sub.dIndex, sub.sIndex, flatSubdomains)}
                                                className="w-full h-full px-2 py-3 text-center text-sm font-bold text-slate-700 bg-transparent focus:bg-indigo-100 focus:text-indigo-800 focus:ring-inset focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors placeholder-gray-200"
                                                placeholder="-"
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-white flex justify-between items-center shrink-0">
                    <div className="flex gap-4 text-xs text-gray-500">
                         <p className="flex items-center gap-2">
                             <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600 font-bold border border-gray-200">Enter</kbd> 
                             <span>Next Student</span>
                         </p>
                         <p className="flex items-center gap-2">
                             <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600 font-bold border border-gray-200">Down</kbd> 
                             <span>Next Skill</span>
                         </p>
                    </div>
                    <div className="flex gap-3">
                         <button 
                            onClick={onClose} 
                            className="px-6 py-3 border border-gray-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition text-sm"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave} 
                            className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition shadow-xl shadow-indigo-200 active:scale-95 flex items-center gap-2 text-sm"
                        >
                            <Icon name="check" className="w-4 h-4" />
                            Save Batch
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
