import React, { useState, useRef, useEffect } from 'react';
import { Assessment, Domain, TestPeriod } from '../../types';
import { DOMAINS } from '../../constants';
import { useBenchmarks } from '../../context/BenchmarkContext';
import { Icon } from '../common/Icon';
import { useStudents } from '../../context/StudentContext';

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
    const [notification, setNotification] = useState<string | null>(null);
    
    // Accessibility, validation, and rubric states
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
    const [showConfirmClose, setShowConfirmClose] = useState(false);

    // Layout & Adjustment State
    const [gridScale, setGridScale] = useState(0.9);
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
            modalRef.current?.requestFullscreen().catch(() => {});
            setIsFullscreen(true);
        } else {
            document.exitFullscreen().catch(() => {});
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

    const triggerNotification = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleScoreChange = (studentId: string, domain: Domain, subdomain: string, valStr: string, maxScore: number) => {
        setGridData(prev => {
            const studentScores = { ...(prev[studentId] || {}) };
            const key = makeKey(domain, subdomain);
            if (valStr === '') {
                delete studentScores[key];
            } else {
                const scoreNum = Number(valStr);
                studentScores[key] = scoreNum;
            }
            return { ...prev, [studentId]: studentScores };
        });
    };

    const flatSubdomains: { domain: Domain, name: string, maxScore: number }[] = [];
    DOMAINS.forEach((d) => {
        (subdomains[d] || []).forEach((s) => {
            flatSubdomains.push({ domain: d, name: s.name, maxScore: s.maxScore });
        });
    });

    const cellErrors: Record<string, string[]> = {};
    Object.entries(gridData).forEach(([studentId, scores]) => {
        const errorsList: string[] = [];
        Object.entries(scores).forEach(([subdomainKey, score]) => {
            const [domainStr, subdomainStr] = subdomainKey.split(':');
            const matchingSub = flatSubdomains.find(f => f.domain === domainStr && f.name === subdomainStr);
            if (matchingSub && (score < 0 || score > matchingSub.maxScore)) {
                errorsList.push(subdomainStr);
            }
        });
        if (errorsList.length > 0) {
            cellErrors[studentId] = errorsList;
        }
    });

    const hasAnyCellErrors = Object.keys(cellErrors).length > 0;

    const handleSave = async () => {
        if (hasAnyCellErrors || isSaving) return;
        setIsSaving(true);
        try {
            // Transform grid data structure to batch context calls
            const bulkUpdateData = students.map(student => {
                const studentScores = gridData[student.id] || {};
                const aggregateScores: Record<string, number> = {};

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

    if (!isOpen) return null;

    const colWidth = Math.round(160 * gridScale);
    const sideWidth = Math.max(150, Math.min(280, Math.round(280 * gridScale)));
    const inputHeight = Math.round(64 * gridScale);

    return (
        <div 
            ref={modalRef}
            className="fixed inset-0 bg-zinc-950 flex flex-col overflow-hidden z-[1000000] border-0"
        >
            <style dangerouslySetInnerHTML={{ __html: `
                .grid-container::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .grid-container::-webkit-scrollbar-track {
                    background: #09090b;
                }
                .grid-container::-webkit-scrollbar-thumb {
                    background: #27272a;
                    border: 2px solid #09090b;
                    border-radius: 4px;
                }
                .grid-container::-webkit-scrollbar-thumb:hover {
                    background: #3f3f46;
                }
                .grid-container {
                    scrollbar-width: thin;
                    scrollbar-color: #27272a #09090b;
                }
                :fullscreen .grid-container {
                    height: 100%;
                }
            `}} />

            {/* Header Area */}
            <div className="flex justify-between items-center px-4 md:px-6 py-3.5 border-b border-zinc-90 w-full bg-zinc-950 shrink-0 relative z-[300]">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-[4px] text-[oklch(0.72_0.18_145)] flex items-center justify-center">
                        <Icon name="benchmark" className="w-4 h-4" />
                    </div>
                    <div>
                        <h2 className="text-sm font-medium text-zinc-100 tracking-tight uppercase leading-none">Protocol Bulk Entry</h2>
                        <span className="text-zinc-500 text-[9px] font-mono uppercase tracking-wider block mt-1">{students.length} students loaded</span>
                    </div>
                    
                    <div className="hidden md:flex h-6 w-px bg-zinc-900 mx-1"></div>
                    
                    <button 
                        className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-900 text-[10px] font-mono uppercase tracking-wider text-zinc-400 rounded-[4px] border border-zinc-850 hover:bg-zinc-850 transition-colors cursor-pointer"
                        onClick={() => triggerNotification("Template exported to virtual buffer")}
                    >
                        <Icon name="arrowDown" className="w-3.5 h-3.5" />
                        <span>Buffer template</span>
                    </button>

                    <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-[4px] border border-zinc-850">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase">Scale</span>
                        <input 
                            type="range" min="0.7" max="1.3" step="0.1" value={gridScale}
                            onChange={(e) => setGridScale(parseFloat(e.target.value))}
                            className="w-16 h-1 rounded-lg appearance-none cursor-pointer accent-[oklch(0.72_0.18_145)] bg-zinc-800"
                        />
                    </div>
                </div>

                {notification && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-[oklch(0.72_0.18_145)] rounded-[4px] animate-fade-in uppercase">
                        {notification}
                    </div>
                )}
                
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1 rounded-[4px] border border-zinc-850">
                        <select 
                            value={testPeriod} 
                            onChange={(e) => setTestPeriod(e.target.value as TestPeriod)} 
                            className="bg-transparent text-[10px] font-mono text-zinc-300 outline-none uppercase tracking-wider cursor-pointer border-none focus:ring-0"
                        >
                            {Object.values(TestPeriod).map(q => <option key={q} value={q} className="bg-zinc-950 text-zinc-300">{q}</option>)}
                        </select>
                        <input 
                            type="date" 
                            value={date} 
                            onChange={(e) => setDate(e.target.value)} 
                            className="bg-transparent text-[10px] text-zinc-300 outline-none w-24 hidden md:block border-none focus:ring-0" 
                        />
                    </div>

                    <button 
                        onClick={toggleFullscreen}
                        className="p-1 px-2 border border-zinc-900 hover:border-zinc-800 hover:text-zinc-200 text-zinc-500 rounded-[4px] text-[10px] font-mono cursor-pointer"
                        title="Toggle Fullscreen"
                    >
                        {isFullscreen ? "Exit FS" : "Fullscreen"}
                    </button>

                    <button onClick={handleCloseAttempt} disabled={isSaving} className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors rounded-[4px] hover:bg-zinc-900 cursor-pointer">
                        <Icon name="close" className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="h-0.5 bg-zinc-900 shrink-0 relative z-[300]">
                <div className="h-full bg-[oklch(0.72_0.18_145)] transition-all duration-300" style={{ width: `${scrollProgress}%` }}></div>
            </div>

            {/* Grid Area */}
            <div 
                ref={containerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-auto bg-zinc-950 grid-container relative"
            >
                <table className="border-separate border-spacing-0 min-w-full bg-zinc-950">
                    <thead>
                        <tr>
                            <th 
                                className="sticky top-0 left-0 z-[250] bg-zinc-950 p-4 border-r border-b border-zinc-900 text-left select-none"
                                style={{ width: sideWidth, minWidth: sideWidth }}
                            >
                                <span className="text-[9px] font-mono text-zinc-650 uppercase tracking-wider block">Framework</span>
                                <p className="text-xs font-medium text-zinc-300 leading-tight uppercase font-sans">Skill Segment</p>
                            </th>
                            {students.map(student => (
                                <th 
                                    key={student.id} 
                                    className="sticky top-0 z-[240] bg-zinc-950 p-3 border-r border-b border-zinc-900 text-center select-none"
                                    style={{ width: colWidth, minWidth: colWidth }}
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 rounded-[4px] bg-zinc-900 border border-zinc-850 flex items-center justify-center text-xs font-mono text-zinc-400 mb-1 leading-none select-none">
                                            {student.name.charAt(0)}
                                        </div>
                                        <p className="text-[10px] font-normal text-zinc-300 truncate w-full uppercase tracking-tight font-sans">{student.name}</p>
                                        <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-wider">Level {student.level}</p>
                                    </div>
                                </th>
                            ))}
                            <th className="sticky top-0 z-[230] bg-zinc-950 border-b border-zinc-900 w-24"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {flatSubdomains.map((sub, rowIndex) => (
                            <tr key={`${sub.domain}-${sub.name}`} className="group hover:bg-zinc-900/10">
                                <td 
                                    className="sticky left-0 z-[240] bg-zinc-950 group-hover:bg-zinc-900/30 p-3.5 border-r border-b border-zinc-900/60 transition-colors"
                                    style={{ width: sideWidth, minWidth: sideWidth }}
                                >
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1 select-none">
                                        <span className="text-[9px] font-mono text-[oklch(0.72_0.18_145)] uppercase tracking-wider">{sub.domain}</span>
                                        <span className="text-[8px] font-mono text-zinc-550 uppercase">Max: {sub.maxScore}</span>
                                        
                                        <div className="relative inline-flex items-center group/tooltip">
                                            <button 
                                                type="button"
                                                onMouseEnter={() => setActiveTooltip(sub.name)}
                                                onMouseLeave={() => setActiveTooltip(null)}
                                                onClick={() => setActiveTooltip(activeTooltip === sub.name ? null : sub.name)}
                                                className="text-zinc-600 hover:text-zinc-400 cursor-pointer p-0.5"
                                            >
                                                <Icon name="help" className="w-3 h-3" />
                                            </button>
                                            {activeTooltip === sub.name && (
                                                <div className="absolute z-[3000] bottom-full left-0 mb-2 w-60 p-3 bg-zinc-900 text-zinc-350 text-[10px] leading-relaxed rounded-[4px] border border-zinc-800 pointer-events-none select-none">
                                                    <p className="font-mono text-[oklch(0.72_0.18_145)] mb-1 uppercase tracking-wider">{sub.name} Rubric</p>
                                                    <p className="normal-case tracking-normal text-zinc-400">{RUBRIC_DESCRIPTIONS[sub.name] || "Score based on curriculum assessment rubrics."}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p className="font-medium text-zinc-200 leading-tight text-xs font-sans truncate" title={sub.name}>{sub.name}</p>
                                </td>
                                {students.map((student) => {
                                    const scoreVal = getScore(student.id, sub.domain, sub.name);
                                    const isOver = typeof scoreVal === 'number' && (scoreVal < 0 || scoreVal > sub.maxScore);
                                    return (
                                        <td 
                                            key={student.id} 
                                            className={`p-0 border-r border-b border-zinc-900/40 transition-colors ${
                                                isOver ? 'bg-rose-950/20 group-hover:bg-rose-950/30' : 'bg-transparent'
                                            }`}
                                            style={{ height: inputHeight }}
                                        >
                                            <div className="relative w-full h-full flex items-center justify-center">
                                                <input 
                                                    type="number" min="0" max={sub.maxScore}
                                                    value={scoreVal}
                                                    disabled={isSaving}
                                                    onChange={(e) => handleScoreChange(student.id, sub.domain, sub.name, e.target.value, sub.maxScore)}
                                                    className={`w-full h-full text-center outline-none bg-transparent transition-colors font-mono font-normal text-sm ${
                                                        isOver 
                                                            ? 'text-rose-455 bg-rose-500/5 focus:bg-rose-500/10' 
                                                            : 'text-zinc-200 focus:bg-zinc-900/40'
                                                    }`}
                                                    placeholder="-"
                                                />
                                                <span className={`absolute right-2 text-[8px] font-mono pointer-events-none select-none ${
                                                    isOver ? 'text-rose-505 animate-pulse' : 'text-zinc-650'
                                                }`}>
                                                    /{sub.maxScore}
                                                </span>
                                            </div>
                                        </td>
                                    );
                                })}
                                <td className="bg-zinc-950 border-b border-zinc-900/40 w-24"></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer Area */}
            <div className="px-4 py-4 md:px-6 md:py-4.5 border-t border-zinc-90 bg-zinc-950 flex flex-col md:flex-row justify-between items-center shrink-0 relative z-[300] gap-4">
                <div className="flex items-center gap-3 text-zinc-500">
                    <div className="p-2 bg-zinc-900 border border-zinc-850 rounded-[4px] text-zinc-450 shrink-0">
                        <Icon name="info" className="w-4 h-4" />
                    </div>
                    <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider block text-zinc-400 font-medium">Logic Integrity Loop Active</span>
                        <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-600">Scores sync immediately with database node</span>
                    </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button 
                        onClick={handleCloseAttempt} disabled={isSaving}
                        className="flex-1 md:flex-none px-4 py-2 border border-zinc-900 hover:border-zinc-800 text-zinc-450 hover:text-zinc-200 rounded-[4px] text-xs transition-colors cursor-pointer"
                    >
                        Discard
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving || hasAnyCellErrors}
                        className={`flex-1 md:flex-none px-5 py-2 text-xs font-semibold rounded-[4px] transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                            hasAnyCellErrors 
                                ? 'bg-rose-600 text-white hover:bg-rose-700' 
                                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-950 disabled:opacity-30'
                        }`}
                    >
                        {isSaving ? (
                            <Icon name="refresh" className="w-3.5 h-3.5 animate-spin" />
                        ) : hasAnyCellErrors ? (
                            <Icon name="close" className="w-3.5 h-3.5 text-rose-100" />
                        ) : (
                            <Icon name="check" className="w-3.5 h-3.5 text-zinc-850" />
                        )}
                        <span>{isSaving ? 'Saving...' : hasAnyCellErrors ? 'Fix Errors' : 'Save All'}</span>
                    </button>
                </div>
            </div>

            {/* Confirmation popup overlay */}
            {showConfirmClose && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1100000] backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm bg-zinc-950 border border-zinc-900 rounded-[4px] p-5 md:p-6 animate-in fade-in zoom-in-95 duration-150">
                        <div className="w-10 h-10 bg-rose-500/10 rounded-[4px] flex items-center justify-center text-rose-450 mb-4 border border-rose-500/20">
                            <Icon name="help" className="w-5 h-5 animate-pulse" />
                        </div>
                        <h3 className="text-sm font-medium text-zinc-100 uppercase tracking-tight mb-2">Discard Unsaved Scores?</h3>
                        <p className="text-xs text-zinc-500 leading-relaxed mb-5">
                            You have active edits in the protocol entry stack. Closing this protocol without synchronizing will permanently discard all entered student data.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmClose(false)}
                                className="flex-1 py-1.5 px-3 bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs rounded-[4px] transition-colors cursor-pointer"
                            >
                                Keep Editing
                            </button>
                            <button
                                onClick={() => {
                                    onClose();
                                    setGridData({});
                                    setShowConfirmClose(false);
                                }}
                                className="flex-1 py-1.5 px-3 bg-rose-650 text-white hover:bg-rose-700 text-xs font-semibold rounded-[4px] transition-colors cursor-pointer"
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
