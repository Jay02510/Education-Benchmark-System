
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
    const [gridData, setGridData] = useState<Record<string, Record<string, number>>>({});
    const [isSaving, setIsSaving] = useState(false);

    // Layout & Adjustment State
    const [gridScale, setGridScale] = useState(1);
    const [scrollProgress, setScrollProgress] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const makeKey = (domain: Domain, subdomain: string) => `${domain}:${subdomain}`;

    const getScore = (studentId: string, domain: Domain, subdomain: string) => {
        return gridData[studentId]?.[makeKey(domain, subdomain)] ?? '';
    };

    const handleScroll = () => {
        if (containerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
            const progress = (scrollLeft / (scrollWidth - clientWidth)) * 100;
            setScrollProgress(progress);
        }
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

    const handleSave = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
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
            await addAssessmentBulk(bulkUpdateData);
            onClose();
            setGridData({});
        } finally {
            setIsSaving(false);
        }
    };

    const flatSubdomains: { domain: Domain, name: string, maxScore: number }[] = [];
    DOMAINS.forEach((d) => {
        (subdomains[d] || []).forEach((s) => {
            flatSubdomains.push({ domain: d, name: s.name, maxScore: s.maxScore });
        });
    });

    if (!isOpen) return null;

    const colWidth = Math.round(180 * gridScale);
    const sideWidth = Math.round(300 * gridScale);
    const inputHeight = Math.round(80 * gridScale);

    return (
        <div className="fixed inset-0 bg-white flex flex-col overflow-hidden animate-in fade-in duration-300 z-[100000]">
            <style dangerouslySetInnerHTML={{ __html: `
                .grid-container::-webkit-scrollbar {
                    width: 14px;
                    height: 14px;
                }
                .grid-container::-webkit-scrollbar-track {
                    background: #f1f5f9;
                }
                .grid-container::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border: 4px solid #f1f5f9;
                    border-radius: 20px;
                }
                .grid-container::-webkit-scrollbar-thumb:hover {
                    background: #6366f1;
                }
                .grid-container {
                    scrollbar-width: auto;
                    scrollbar-color: #cbd5e1 #f1f5f9;
                }
            `}} />

            {/* Header */}
            <div className="flex justify-between items-center px-4 md:px-8 py-4 border-b border-slate-100 bg-white shrink-0 shadow-sm relative z-[200]">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-600 rounded-lg text-white shrink-0">
                        <Icon name="benchmark" className="w-5 h-5" />
                    </div>
                    <div className="hidden sm:block">
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Batch Entry</h2>
                        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">{students.length} students</p>
                    </div>
                    <div className="h-8 w-px bg-slate-100 mx-1"></div>
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase">Scale</span>
                        <input 
                            type="range" min="0.6" max="1.4" step="0.1" value={gridScale}
                            onChange={(e) => setGridScale(parseFloat(e.target.value))}
                            className="w-20 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <span className="text-[9px] font-black text-indigo-600 w-8">{Math.round(gridScale * 100)}%</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                        <select 
                            value={testPeriod} 
                            onChange={(e) => setTestPeriod(e.target.value as TestPeriod)} 
                            className="bg-transparent text-[11px] font-black outline-none"
                        >
                            {Object.values(TestPeriod).map(q => <option key={q} value={q}>{q}</option>)}
                        </select>
                        <div className="w-px h-3 bg-slate-200"></div>
                        <input 
                            type="date" 
                            value={date} 
                            onChange={(e) => setDate(e.target.value)} 
                            className="bg-transparent text-[11px] font-black outline-none w-24" 
                        />
                    </div>
                    <button onClick={onClose} disabled={isSaving} className="p-2 text-slate-400 hover:text-slate-900 transition-all rounded-lg hover:bg-slate-100">
                        <Icon name="close" className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Scrollable Progress Indicator */}
            <div className="h-1 bg-slate-100 shrink-0 relative z-[200]">
                <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${scrollProgress}%` }}></div>
            </div>

            {/* Main Table Container */}
            <div 
                ref={containerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-auto bg-[#F8FAFC] grid-container relative"
            >
                <table className="border-separate border-spacing-0 min-w-max">
                    <thead>
                        <tr>
                            <th 
                                className="sticky top-0 left-0 z-[160] bg-white p-6 text-left border-r border-b border-slate-200 shadow-sm"
                                style={{ width: sideWidth, minWidth: sideWidth }}
                            >
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Framework</span>
                                <p className="text-sm font-black text-slate-800">Domain / Skill Set</p>
                            </th>
                            {students.map(student => (
                                <th 
                                    key={student.id} 
                                    className="sticky top-0 z-[150] bg-white p-4 border-r border-b border-slate-200 text-center"
                                    style={{ width: colWidth, minWidth: colWidth }}
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-xs font-black text-indigo-600 mb-2">
                                            {student.name.charAt(0)}
                                        </div>
                                        <p className="text-[11px] font-black text-slate-800 truncate w-full">{student.name}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Lvl {student.level}</p>
                                    </div>
                                </th>
                            ))}
                            {/* Horizontal End Spacer to prevent clipping */}
                            <th className="sticky top-0 z-[140] bg-white border-b border-slate-200 w-32 min-w-[128px]"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {flatSubdomains.map((sub, rowIndex) => (
                            <tr key={`${sub.domain}-${sub.name}`} className="group">
                                <td 
                                    className="sticky left-0 z-[140] bg-white group-hover:bg-slate-50 p-6 border-r border-b border-slate-100 shadow-sm transition-colors"
                                    style={{ width: sideWidth, minWidth: sideWidth }}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{sub.domain}</span>
                                        <span className="text-[9px] font-bold text-slate-400">• Max {sub.maxScore}</span>
                                    </div>
                                    <p className="font-bold text-slate-700 leading-tight text-sm">{sub.name}</p>
                                </td>
                                {students.map((student) => (
                                    <td 
                                        key={student.id} 
                                        className="p-0 border-r border-b border-slate-100 bg-white group-hover:bg-indigo-50/20 transition-colors"
                                        style={{ height: inputHeight }}
                                    >
                                        <input 
                                            type="number" min="0" max={sub.maxScore}
                                            value={getScore(student.id, sub.domain, sub.name)}
                                            disabled={isSaving}
                                            onChange={(e) => handleScoreChange(student.id, sub.domain, sub.name, e.target.value, sub.maxScore)}
                                            className="w-full h-full px-4 text-center font-black text-slate-800 bg-transparent outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                                            placeholder="-"
                                        />
                                    </td>
                                ))}
                                <td className="bg-slate-50/20 border-b border-slate-100 w-32"></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 md:p-8 border-t border-slate-100 bg-white flex flex-col md:flex-row justify-between items-center shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] relative z-[200] gap-4">
                <div className="flex items-center gap-3 text-slate-400">
                    <Icon name="search" className="w-4 h-4 opacity-50" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                        Scroll for all students and skills
                    </span>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button 
                        onClick={onClose} disabled={isSaving}
                        className="flex-1 md:flex-none px-6 py-3 border border-slate-200 text-slate-500 font-black rounded-xl hover:bg-slate-50 transition-all text-[10px] uppercase tracking-widest"
                    >
                        Discard
                    </button>
                    <button 
                        onClick={handleSave} disabled={isSaving}
                        className="flex-1 md:flex-none px-10 py-3 bg-slate-900 text-white font-black rounded-xl hover:bg-indigo-600 transition-all shadow-xl flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest disabled:bg-slate-300"
                    >
                        {isSaving ? <Icon name="refresh" className="w-4 h-4 animate-spin" /> : <Icon name="check" className="w-4 h-4 text-emerald-400" />}
                        {isSaving ? 'Syncing' : 'Finalize & Sync'}
                    </button>
                </div>
            </div>
        </div>
    );
};
