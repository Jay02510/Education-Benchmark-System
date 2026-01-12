
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
                const studentData = prev[studentId] ? { ...prev[studentId] } : {};
                delete studentData[makeKey(domain, subdomain)];
                return { ...prev, [studentId]: studentData };
            });
            return;
        }

        const numValue = Math.min(maxScore, Math.max(0, Number(value)));
        setGridData(prev => ({
            ...prev,
            [studentId]: {
                ...(prev[studentId] || {}),
                [makeKey(domain, subdomain)]: numValue
            }
        }));
    };

    const handleKeyDown = (e: React.KeyboardEvent, sIndex: number, dIndex: number, subIndex: number, allSubdomainsFlat: any[]) => {
        if (e.key === 'ArrowRight' || e.key === 'Enter') {
            e.preventDefault();
            const nextSIndex = sIndex + 1;
            if (nextSIndex < students.length) {
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
            const currentFlatIndex = allSubdomainsFlat.findIndex(flat => flat.dIndex === dIndex && flat.sIndex === subIndex);
            const nextFlat = allSubdomainsFlat[currentFlatIndex + 1];
            if (nextFlat) {
                const nextInputId = `input-${students[sIndex].id}-${nextFlat.domain}-${nextFlat.name}`;
                document.getElementById(nextInputId)?.focus();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
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
                aggregateScores[domain] = (hasEntry && totalMax > 0) ? Math.round((totalScore / totalMax) * 100) : 0;
            });

            return {
                studentId: student.id,
                assessment: {
                    id: `assess-bulk-${Date.now()}-${student.id}`,
                    date,
                    type: testPeriod,
                    scores: aggregateScores,
                    subdomainScores: studentScores
                } as Assessment
            };
        });

        addAssessmentBulk(bulkUpdateData);
        onClose();
        setGridData({});
    };

    const flatSubdomains: { domain: Domain, name: string, maxScore: number, dIndex: number, sIndex: number }[] = [];
    DOMAINS.forEach((d, dIdx) => {
        (subdomains[d] || []).forEach((s, sIdx) => {
            flatSubdomains.push({ domain: d, name: s.name, maxScore: s.maxScore, dIndex: dIdx, sIndex: sIdx });
        });
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-white z-[1000] flex flex-col overflow-hidden animate-in fade-in duration-300">
            {/* Immersive Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white shrink-0 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                        <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-100">
                            <Icon name="benchmark" className="w-6 h-6" />
                        </div>
                        Batch Performance Entry
                    </h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1.5 ml-14">Class-Wide Benchmark Data Log</p>
                </div>
                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 px-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Test Cycle</label>
                        <select 
                            value={testPeriod} 
                            onChange={(e) => setTestPeriod(e.target.value as TestPeriod)}
                            className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-black bg-white outline-none shadow-sm"
                        >
                            {Object.values(TestPeriod).map(q => <option key={q} value={q}>{q}</option>)}
                        </select>
                    </div>
                    <div className="w-px h-8 bg-slate-200"></div>
                    <div className="flex items-center gap-2 px-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</label>
                        <input 
                            type="date" 
                            value={date} 
                            onChange={(e) => setDate(e.target.value)}
                            className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-black bg-white outline-none shadow-sm"
                        />
                    </div>
                </div>
                <button onClick={onClose} className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all">
                    <Icon name="close" className="w-6 h-6" />
                </button>
            </div>

            {/* Immersive Scrollable Grid */}
            <div className="flex-1 overflow-auto bg-[#F8FAFC]">
                <table className="border-collapse table-fixed min-w-full">
                    <thead>
                        <tr>
                            {/* Sticky Corner Header */}
                            <th className="sticky left-0 top-0 z-[60] w-[280px] min-w-[280px] bg-white p-6 text-left border-r border-b border-slate-200 shadow-[2px_2px_10px_rgba(0,0,0,0.02)]">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Framework</span>
                                    <span className="text-sm font-black text-slate-800">Domain / Sub-Skill</span>
                                </div>
                            </th>
                            
                            {/* Sticky Student Names */}
                            {students.map(student => (
                                <th key={student.id} className="sticky top-0 z-40 w-[140px] min-w-[140px] bg-white p-4 border-r border-b border-slate-100 text-center shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-black text-indigo-600 shadow-inner">
                                            {student.name.charAt(0)}
                                        </div>
                                        <span className="text-[11px] font-black text-slate-800 truncate w-full px-1">{student.name}</span>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Level {student.level}</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {flatSubdomains.map((sub, rowIndex) => (
                            <tr key={`${sub.domain}-${sub.name}`} className="group hover:bg-white transition-colors">
                                {/* Sticky Row Labels */}
                                <td className="sticky left-0 z-30 bg-[#F8FAFC] group-hover:bg-white p-6 border-r border-slate-200 shadow-[4px_0_10px_-2px_rgba(0,0,0,0.03)] transition-colors">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{sub.domain}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <span className="text-[9px] font-bold text-slate-400">Max {sub.maxScore}</span>
                                        </div>
                                        <span className="text-sm font-bold text-slate-700 leading-tight">{sub.name}</span>
                                    </div>
                                </td>
                                
                                {students.map((student, sIndex) => (
                                    <td key={student.id} className="p-0 border-r border-slate-100 relative bg-white/50 group-hover:bg-white transition-colors">
                                        <input 
                                            id={`input-${student.id}-${sub.domain}-${sub.name}`}
                                            type="number"
                                            min="0"
                                            max={sub.maxScore}
                                            value={getScore(student.id, sub.domain, sub.name)}
                                            onChange={(e) => handleScoreChange(student.id, sub.domain, sub.name, e.target.value, sub.maxScore)}
                                            onKeyDown={(e) => handleKeyDown(e, sIndex, sub.dIndex, sub.sIndex, flatSubdomains)}
                                            className="w-full h-[72px] px-4 py-2 text-center text-base font-black text-slate-800 bg-transparent focus:bg-indigo-50 focus:ring-inset focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all placeholder-slate-200"
                                            placeholder="-"
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Immersive Footer */}
            <div className="p-8 border-t border-slate-100 bg-white flex justify-between items-center shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
                <div className="flex gap-8">
                    <div className="flex flex-col gap-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Keyboard Shortcuts</p>
                        <div className="flex gap-4">
                            <span className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                                <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 shadow-sm">Enter</kbd> Next Student
                            </span>
                            <span className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                                <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 shadow-sm">Arrows</kbd> Navigate Grid
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={onClose} 
                        className="px-8 py-4 border-2 border-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-50 hover:text-slate-800 transition-all text-sm uppercase tracking-widest"
                    >
                        Discard
                    </button>
                    <button 
                        onClick={handleSave} 
                        className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-200 active:scale-95 flex items-center gap-3 text-sm uppercase tracking-widest"
                    >
                        <Icon name="check" className="w-5 h-5" />
                        Sync All Data
                    </button>
                </div>
            </div>
        </div>
    );
};
