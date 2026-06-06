
import React, { useState, useRef, useEffect } from 'react';
import { Assessment, Domain, TestPeriod } from '../../types';
import { DOMAINS } from '../../constants';
import { useBenchmarks } from '../../context/BenchmarkContext';
import { Icon } from '../common/Icon';
import { useStudents } from '../../context/StudentContext';

import { logger } from '../../services/logger';

const RUBRIC_DESCRIPTIONS: Record<string, string> = {
    "Decoding CVC list": "Decodes list of simple Consonant-Vowel-Consonant words. Check accuracy and sound blending.",
    "Fluency passage 1": "Analyzes word accuracy, punctuation pacing, and emotional expression when reading aloud.",
    "Literal Qs passage": "Tests immediate retrieval. 1 point for each correct direct fact recalled from the passage.",
    "Inferential Qs": "Deductive context comprehension. Evaluates logical connections not explicitly mentioned.",
    "Nonfiction short": "Identifies main non-fiction arguments, text structure, or thematic evidence.",
    "Sentence writing": "Assesses syntax, spatial awareness, capitalization compliance, and accurate punctuation.",
    "Situational writing": "Writes to a target scenario prompt (e.g., formal letter draft or dialogue completion).",
    "Story writing": "Organizes ideas sequentially with creative vocabulary and proper narrative paragraphing.",
    "Present tense task": "Tests active usage of standard verbs and irregular auxiliary conjugations in present tense.",
    "Past tense task": "Requires converting base forms into standard and irregular past tense formations.",
    "SV agreement task": "Ensures subject nouns properly correspond with correct singular or plural verb inflections.",
    "Punct/Cap fix": "Requires locating and correcting missing sentence casing or ending symbols.",
    "Sight word list": "Assesses automatic core sight-words matching speed and pronunciation accuracy.",
    "Context cloze": "Measures sentence pattern logic by selecting fitting vocab for missing sentence holes.",
    "Blend ID": "Phonics identification of consonant consonant consonant consonant blends (e.g., bl-, cl-, str-).",
    "Digraph ID": "Identification of standard paired letter digraph sounds (e.g., sh-, ch-, th-, ee-).",
    "Listening Details": "Tests audio retention or multiple-choice choices after listening to conversations.",
    "Speaking Pronunciation": "Measures clear phonemic phonetic output, appropriate emphasis, and native-like articulation.",
    "Oral Sentences": "Immediate oral restatement of audio stimuli with accurate structural syntax replication.",
    "Speaking Fluency": "Sustained descriptive spoken output with general fluency and low vocal pause frequency.",
    "Interaction Roleplay": "Tests conversational interactive capability: turn-taking fluency and context relevance.",
    "Data chart Qs": "Requires interpreting trends and statistics from a visual chart and answering questions."
};

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
    const [isFullscreen, setIsFullscreen] = useState(false);
    
    // Accessibility, validation, and rubric states
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
    const [showConfirmClose, setShowConfirmClose] = useState(false);

    // Layout & Adjustment State
    const [gridScale, setGridScale] = useState(1);
    const [scrollProgress, setScrollProgress] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    const makeKey = (domain: Domain, subdomain: string) => `${domain}:${subdomain}`;

    const getScore = (studentId: string, domain: Domain, subdomain: string) => {
        return gridData[studentId]?.[makeKey(domain, subdomain)] ?? '';
    };

    const isDirty = Object.values(gridData).some(studentData => Object.keys(studentData).length > 0);

    const handleCloseAttempt = () => {
        if (isDirty) {
            setShowConfirmClose(true);
        } else {
            onClose();
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            modalRef.current?.requestFullscreen().catch(err => {
                logger.error(`Fullscreen Error: ${err.message}`);
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    const handleScroll = () => {
        if (containerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
            const progress = (scrollLeft / (scrollWidth - clientWidth)) * 100;
            setScrollProgress(progress || 0);
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

        const numValue = Number(value);
        setGridData(prev => ({
            ...prev,
            [studentId]: {
                ...(prev[studentId] || {}),
                [makeKey(domain, subdomain)]: numValue
            }
        }));
    };

    const hasAnyCellErrors = Object.entries(gridData).some(([studentId, scores]) => {
        return Object.entries(scores).some(([key, val]) => {
            const [domain, subName] = key.split(':');
            const subList = subdomains[domain as Domain] || [];
            const sub = subList.find(s => s.name === subName);
            if (sub && typeof val === 'number') {
                return val < 0 || val > sub.maxScore;
            }
            return false;
        });
    });

    const handleSave = async () => {
        if (isSaving || hasAnyCellErrors) return;
        
        const studentsToUpdate = students.filter(s => gridData[s.id] && Object.keys(gridData[s.id]).length > 0);
        
        if (studentsToUpdate.length === 0) {
            onClose();
            return;
        }

        setIsSaving(true);
        try {
            const bulkUpdateData = studentsToUpdate.map(student => {
                const studentScores = gridData[student.id] || {};
                const aggregateScores: Record<Domain, number> = {} as any;
                
                DOMAINS.forEach(domain => {
                    const subs = subdomains[domain] || [];
                    let totalScore = 0;
                    let totalMax = 0;
                    let hasEntryForDomain = false;
                    
                    subs.forEach(sub => {
                        const val = studentScores[makeKey(domain, sub.name)];
                        if (val !== undefined) {
                            totalScore += val;
                            totalMax += sub.maxScore;
                            hasEntryForDomain = true;
                        }
                    });

                    if (hasEntryForDomain && totalMax > 0) {
                        aggregateScores[domain] = Math.round((totalScore / totalMax) * 100);
                    }
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
    const sideWidth = Math.max(160, Math.min(300, Math.round(300 * gridScale)));
    const inputHeight = Math.round(80 * gridScale);

    return (
        <div 
            ref={modalRef}
            className="fixed inset-0 bg-white flex flex-col overflow-hidden z-[1000000] shadow-2xl"
        >
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
                :fullscreen .grid-container {
                    height: 100%;
                }
            `}} />

            {/* Header */}
            <div className="flex justify-between items-center px-4 md:px-8 py-4 border-b border-slate-100 bg-white shrink-0 shadow-sm relative z-[300]">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-600 rounded-lg text-white shrink-0 shadow-lg shadow-indigo-100">
                        <Icon name="benchmark" className="w-5 h-5" />
                    </div>
                    <div className="hidden sm:block">
                        <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Protocol Entry</h2>
                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">{students.length} units in stack</p>
                    </div>
                    <div className="h-8 w-px bg-slate-100 mx-1"></div>
                    
                    <button 
                        className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-600 rounded-xl border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm"
                        onClick={() => window.alert("CSV Template Downloaded")}
                    >
                        <Icon name="arrowDown" className="w-4 h-4" />
                        Get Excel Template
                    </button>

                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase">Scale</span>
                        <input 
                            type="range" min="0.6" max="1.4" step="0.1" value={gridScale}
                            onChange={(e) => setGridScale(parseFloat(e.target.value))}
                            className="w-16 md:w-20 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                        <select 
                            value={testPeriod} 
                            onChange={(e) => setTestPeriod(e.target.value as TestPeriod)} 
                            className="bg-transparent text-[11px] font-black outline-none uppercase tracking-widest"
                        >
                            {Object.values(TestPeriod).map(q => <option key={q} value={q}>{q}</option>)}
                        </select>
                        <div className="hidden md:block w-px h-3 bg-slate-200 mx-1"></div>
                        <input 
                            type="date" 
                            value={date} 
                            onChange={(e) => setDate(e.target.value)} 
                            className="bg-transparent text-[11px] font-black outline-none w-24 hidden md:block" 
                        />
                    </div>
                    <button onClick={handleCloseAttempt} disabled={isSaving} className="p-2 text-slate-400 hover:text-rose-500 transition-all rounded-lg hover:bg-rose-50 focus-visible:outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500">
                        <Icon name="close" className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="h-1 bg-slate-100 shrink-0 relative z-[300]">
                <div className="h-full bg-indigo-500 transition-all duration-300 shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${scrollProgress}%` }}></div>
            </div>

            <div 
                ref={containerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-auto bg-[#F8FAFC] grid-container relative"
            >
                <table className="border-separate border-spacing-0 min-w-full">
                    <thead>
                        <tr>
                            <th 
                                className="sticky top-0 left-0 z-[250] bg-white p-4 md:p-6 text-left border-r border-b border-slate-200 shadow-sm"
                                style={{ width: sideWidth, minWidth: sideWidth }}
                            >
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Framework</span>
                                <p className="text-sm font-black text-slate-800 leading-tight uppercase tracking-tighter">Skill Segment</p>
                            </th>
                            {students.map(student => (
                                <th 
                                    key={student.id} 
                                    className="sticky top-0 z-[240] bg-white p-4 border-r border-b border-slate-200 text-center"
                                    style={{ width: colWidth, minWidth: colWidth }}
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-xs font-black text-indigo-600 mb-2 border border-indigo-100 shadow-inner">
                                            {student.name.charAt(0)}
                                        </div>
                                        <p className="text-[11px] font-black text-slate-800 truncate w-full uppercase tracking-tighter">{student.name}</p>
                                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Lvl {student.level}</p>
                                    </div>
                                </th>
                            ))}
                            <th className="sticky top-0 z-[230] bg-white border-b border-slate-200 w-32 min-w-[128px]"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {flatSubdomains.map((sub, rowIndex) => (
                            <tr key={`${sub.domain}-${sub.name}`} className="group">
                                <td 
                                    className="sticky left-0 z-[240] bg-white group-hover:bg-slate-50 p-4 md:p-6 border-r border-b border-slate-100 shadow-sm transition-colors"
                                    style={{ width: sideWidth, minWidth: sideWidth }}
                                >
                                    <div className="flex flex-wrap items-center gap-x-2 mb-1.5">
                                        <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.15em]">{sub.domain}</span>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Limit: {sub.maxScore}</span>
                                        
                                        {/* Rubric popover info icon */}
                                        <div className="relative inline-flex items-center group/tooltip">
                                            <button 
                                                type="button"
                                                onMouseEnter={() => setActiveTooltip(sub.name)}
                                                onMouseLeave={() => setActiveTooltip(null)}
                                                onClick={() => setActiveTooltip(activeTooltip === sub.name ? null : sub.name)}
                                                className="text-slate-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full p-0.5"
                                                aria-label={`View rubric for ${sub.name}`}
                                            >
                                                <Icon name="help" className="w-3.5 h-3.5" />
                                            </button>
                                            {activeTooltip === sub.name && (
                                                <div className="absolute z-[3000] bottom-full left-0 mb-2 w-64 p-3 bg-slate-900 text-white text-[11px] font-semibold leading-relaxed rounded-xl shadow-xl border border-slate-800 pointer-events-none select-none animate-in fade-in zoom-in-95 duration-150">
                                                    <p className="font-bold text-indigo-400 mb-1 leading-none">{sub.name} Rubric</p>
                                                    <p className="normal-case tracking-normal text-slate-200">{RUBRIC_DESCRIPTIONS[sub.name] || "Score based on curriculum assessment rubrics."}</p>
                                                    <div className="absolute top-full left-3 w-2 h-2 bg-slate-900 rotate-45 transform -translate-y-1"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p className="font-bold text-slate-800 leading-tight text-xs md:text-sm">{sub.name}</p>
                                </td>
                                {students.map((student) => {
                                    const scoreVal = getScore(student.id, sub.domain, sub.name);
                                    const isOver = typeof scoreVal === 'number' && (scoreVal < 0 || scoreVal > sub.maxScore);
                                    return (
                                        <td 
                                            key={student.id} 
                                            className={`p-0 border-r border-b border-slate-100 transition-colors ${
                                                isOver ? 'bg-rose-50/70 group-hover:bg-rose-100/70' : 'bg-white group-hover:bg-indigo-50/20'
                                            }`}
                                            style={{ height: inputHeight }}
                                        >
                                            <div className="relative w-full h-full flex items-center justify-center">
                                                <input 
                                                    type="number" min="0" max={sub.maxScore}
                                                    value={scoreVal}
                                                    disabled={isSaving}
                                                    onChange={(e) => handleScoreChange(student.id, sub.domain, sub.name, e.target.value, sub.maxScore)}
                                                    className={`w-full h-full pl-6 pr-12 text-center font-black outline-none focus:ring-4 focus:ring-inset text-lg transition-all ${
                                                        isOver 
                                                            ? 'text-rose-600 bg-rose-50/35 focus:ring-rose-500/20' 
                                                            : 'text-slate-800 bg-transparent focus:ring-indigo-500/20'
                                                    }`}
                                                    placeholder="-"
                                                />
                                                <span className={`absolute right-3 text-[10px] font-black pointer-events-none select-none ${
                                                    isOver ? 'text-rose-400 animate-pulse' : 'text-slate-300'
                                                }`}>
                                                    / {sub.maxScore}
                                                </span>
                                            </div>
                                        </td>
                                    );
                                })}
                                <td className="bg-slate-50/20 border-b border-slate-100 w-32"></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-5 md:px-12 md:py-8 border-t border-slate-100 bg-white flex flex-col md:flex-row justify-between items-center shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] relative z-[300] gap-6">
                <div className="flex items-center gap-4 text-slate-400">
                    <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-500">
                        <Icon name="info" className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] block mb-0.5 text-slate-900">Logic Check Active</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Growth Velocity will update upon sync</span>
                    </div>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <button 
                        onClick={handleCloseAttempt} disabled={isSaving}
                        className="flex-1 md:flex-none px-10 py-4 bg-white text-slate-500 border-2 border-slate-100 rounded-2xl font-black transition-all text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50 focus-visible:outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                        Discard
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving || hasAnyCellErrors}
                        className={`flex-1 md:flex-none px-12 py-4 text-white font-black rounded-2xl transition-all shadow-2xl flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.3em] active:scale-95 duration-200 focus-visible:outline-none focus:outline-none focus-visible:ring-2 ${
                            hasAnyCellErrors 
                                ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-900/10' 
                                : 'bg-slate-900 hover:bg-indigo-600 shadow-indigo-900/10 disabled:bg-slate-300'
                        }`}
                    >
                        {isSaving ? (
                            <Icon name="refresh" className="w-5 h-5 animate-spin" />
                        ) : hasAnyCellErrors ? (
                            <Icon name="close" className="w-5 h-5 text-rose-200" />
                        ) : (
                            <Icon name="check" className="w-5 h-5 text-emerald-400" />
                        )}
                        {isSaving ? 'Saving...' : hasAnyCellErrors ? 'Fix Errors' : 'Save All'}
                    </button>
                </div>
            </div>

            {/* Custom confirm close dialog over layer */}
            {showConfirmClose && (
                <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[1100000] backdrop-blur-sm p-4">
                    <div className="w-full max-w-md bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-6 border border-rose-100">
                            <Icon name="help" className="w-6 h-6 animate-pulse" />
                        </div>
                        <h3 className="text-lg font-black text-slate-950 uppercase tracking-tighter mb-2">Discard Unsaved Scores?</h3>
                        <p className="text-xs text-slate-500 leading-relaxed font-semibold mb-6">
                            You have active edits in the protocol entry stack. Closing this protocol without synchronizing will permanently discard all entered student data.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowConfirmClose(false)}
                                className="flex-1 py-3 px-4 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                Keep Editing
                            </button>
                            <button
                                onClick={() => {
                                    onClose();
                                    setGridData({});
                                    setShowConfirmClose(false);
                                }}
                                className="flex-1 py-3 px-4 bg-rose-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rose-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                            >
                                Discard All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
