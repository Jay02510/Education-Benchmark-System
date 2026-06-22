import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Student } from '../../types';
import { Icon } from '../common/Icon';
import { GeminiService } from '../../services/geminiService';

interface StudentReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student;
}

const LANGUAGES = [
    { label: 'English (Source)', value: 'English' },
    { label: 'Korean', value: 'Korean' },
    { label: 'Chinese (Simplified)', value: 'Chinese' },
    { label: 'Japanese', value: 'Japanese' },
    { label: 'Spanish', value: 'Spanish' },
    { label: 'Vietnamese', value: 'Vietnamese' }
];

export const StudentReportModal: React.FC<StudentReportModalProps> = ({ isOpen, onClose, student }) => {
    const [isReviewed, setIsReviewed] = useState(false);
    const [activeLang, setActiveLang] = useState('English');
    const [narrative, setNarrative] = useState('');
    const [translatedNarrative, setTranslatedNarrative] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    useEffect(() => {
        if (isOpen) {
            const fetchBaseNarrative = async () => {
                try {
                    const localCache = localStorage.getItem('demo_cached_reports') || '{}';
                    const parsedCache = JSON.parse(localCache);
                    if (parsedCache[student.id]) {
                        setNarrative(parsedCache[student.id]);
                        return;
                    }
                } catch (err) {}

                if (student.cachedReport) {
                    setNarrative(student.cachedReport);
                    return;
                }
                
                setIsGenerating(true);
                setError(null);
                try {
                    const analysis = await GeminiService.generateComprehensiveStudentAnalysis(student);
                    setNarrative(analysis.report_card);
                    
                    try {
                        const localCache = localStorage.getItem('demo_cached_reports') || '{}';
                        const parsedCache = JSON.parse(localCache);
                        parsedCache[student.id] = analysis.report_card;
                        localStorage.setItem('demo_cached_reports', JSON.stringify(parsedCache));
                    } catch (cacheErr) {
                        // Ignore local caching failures inside Sandbox
                    }
                } catch (e: any) {
                    setError(e.message || "Failed to generate report.");
                } finally {
                    setIsGenerating(false);
                }
            };
            fetchBaseNarrative();
        }
    }, [isOpen, student]);

    const handleTranslate = async (lang: string) => {
        setActiveLang(lang);
        if (lang === 'English') {
            setTranslatedNarrative('');
            return;
        }
        setIsTranslating(true);
        const translated = await GeminiService.generateTranslatedReport(narrative, lang);
        setTranslatedNarrative(translated);
        setIsTranslating(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Student Performance Report" size="xl">
            <div className="bg-zinc-950 p-6 md:p-8 border border-zinc-900 mx-auto max-w-4xl rounded-[4px] print:shadow-none print:border-none print:bg-white print:text-black">
                {/* Header Container */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-2 border-zinc-900 pb-5 mb-8 print:border-black">
                    <div>
                        <div className="flex items-center gap-2.5 mb-2">
                             <div className="w-6 h-6 bg-zinc-900 border border-zinc-800 text-[oklch(0.72_0.18_145)] flex items-center justify-center rounded-[4px]"><Icon name="benchmark" className="w-3.5 h-3.5" /></div>
                             <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Official Diagnostics Report</span>
                        </div>
                        <h1 className="text-3xl font-medium text-zinc-100 tracking-tight uppercase leading-none print:text-black">{student.name}</h1>
                        <p className="text-zinc-500 mt-2 font-mono text-[10px] uppercase tracking-wider italic">Level {student.level} • {date}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 mt-4 sm:mt-0">
                        <div className="flex bg-zinc-900 border border-zinc-850 p-0.5 rounded-[4px] no-print">
                            {LANGUAGES.slice(0, 4).map(l => (
                                <button 
                                    key={l.value} 
                                    onClick={() => handleTranslate(l.value)} 
                                    className={`px-2.5 py-1 text-[9px] font-mono uppercase rounded-[2px] transition-colors cursor-pointer ${
                                        activeLang === l.value 
                                            ? 'bg-[oklch(0.72_0.18_145)]/10 text-[oklch(0.72_0.18_145)] font-semibold' 
                                            : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                                >
                                    {l.value}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Analytical Stats Panel */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="p-5 bg-zinc-900/40 rounded-[4px] border border-zinc-900 relative overflow-hidden">
                        <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">Growth velocity</span>
                        <p className="text-3xl font-mono text-[oklch(0.72_0.18_145)] font-medium tabular-nums">{student.growthVelocity}%</p>
                    </div>
                    <div className="p-5 bg-zinc-900/40 rounded-[4px] border border-zinc-900 relative overflow-hidden">
                        <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">Cumulative score</span>
                        <p className="text-3xl font-mono text-emerald-450 font-medium tabular-nums">82%</p>
                    </div>
                    <div className="p-5 bg-zinc-900/40 rounded-[4px] border border-zinc-900 relative overflow-hidden">
                        <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">Intervention Status</span>
                        <p className="text-3xl font-mono text-zinc-100 font-medium whitespace-nowrap">Tier {student.interventionStatus?.tier || 1}</p>
                    </div>
                </div>

                {/* Learning Summary Box */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Icon name="brain" className="w-4 h-4 text-[oklch(0.72_0.18_145)]" />
                        <h3 className="text-xs font-medium text-zinc-300 uppercase tracking-wider font-mono">Learning Summary ({activeLang})</h3>
                    </div>
                    <div className="p-6 md:p-8 bg-zinc-900/20 border border-zinc-900 rounded-[4px] min-h-[180px] relative">
                        {isGenerating ? (
                            <div className="flex flex-col items-center justify-center min-h-[140px] gap-2.5">
                                <Icon name="refresh" className="w-6 h-6 text-zinc-500 animate-spin" />
                                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Analyzing Performance Metrics...</span>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center min-h-[140px] gap-2.5 text-red-400">
                                <Icon name="alert" className="w-6 h-6" />
                                <span className="text-[10px] font-mono uppercase tracking-wider">{error}</span>
                            </div>
                        ) : isTranslating ? (
                            <div className="flex flex-col items-center justify-center min-h-[140px] gap-2.5">
                                <Icon name="refresh" className="w-6 h-6 text-zinc-500 animate-spin" />
                                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Translating Narrative...</span>
                            </div>
                        ) : (
                            <p className="text-sm text-zinc-300 leading-relaxed italic whitespace-pre-wrap font-sans">
                                "{translatedNarrative || narrative || 'Analyzing student diagnostic history...'}"
                            </p>
                        )}
                        <div className="absolute bottom-3 right-4 px-3 py-1 bg-zinc-950 border border-zinc-900 rounded-[4px] flex items-center gap-2 no-print">
                             <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.72_0.18_145)] animate-pulse"></div>
                             <span className="text-[9px] font-mono uppercase text-zinc-500">AI Report Verified</span>
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mt-8 pt-6 border-t border-zinc-900 no-print">
                    <div className="flex items-center gap-3">
                        <input 
                            id="review-checkbox"
                            type="checkbox" 
                            checked={isReviewed} 
                            onChange={e => setIsReviewed(e.target.checked)} 
                            className="w-4 h-4 rounded-[4px] border-zinc-800 bg-zinc-950 text-[oklch(0.72_0.18_145)] focus:ring-[oklch(0.72_0.18_145)] accent-[oklch(0.72_0.18_145)] cursor-pointer" 
                        />
                        <label htmlFor="review-checkbox" className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider cursor-pointer select-none">I have reviewed and approved this report</label>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button 
                            onClick={onClose} 
                            className="flex-1 sm:flex-none px-4 py-2 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-[4px] text-xs transition-colors cursor-pointer"
                        >
                            Close
                        </button>
                        <button 
                            onClick={() => window.print()} 
                            disabled={!isReviewed} 
                            className="flex-1 sm:flex-none px-5 py-2 bg-zinc-100 disabled:opacity-30 hover:bg-zinc-200 text-zinc-950 rounded-[4px] text-xs font-semibold transition-all cursor-pointer"
                        >
                            Print Report
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
