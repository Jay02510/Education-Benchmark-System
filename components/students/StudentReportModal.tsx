
import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Student } from '../../types';
import { Icon } from '../common/Icon';
import { GeminiService } from '../../services/geminiService';
import { useStudents } from '../../context/StudentContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

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
            <div className="bg-white p-10 border border-slate-100 shadow-sm mx-auto max-w-4xl rounded-[3rem] print:shadow-none print:border-none">
                <div className="flex justify-between items-end border-b-4 border-slate-900 pb-6 mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <div className="w-8 h-8 bg-slate-900 text-indigo-400 flex items-center justify-center rounded-lg shadow-lg"><Icon name="benchmark" className="w-5 h-5" /></div>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Official Report</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">{student.name}</h1>
                        <p className="text-slate-400 mt-2 font-black text-xs uppercase tracking-widest italic">Level {student.level} • {date}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner no-print">
                            {LANGUAGES.map(l => (
                                <button key={l.value} onClick={() => handleTranslate(l.value)} className={`px-3 py-1.5 text-[8px] font-black uppercase rounded-lg transition-all ${activeLang === l.value ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{l.value}</button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-12">
                    <div className="p-8 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100 relative overflow-hidden group">
                        <Icon name="trendUp" className="absolute -bottom-4 -right-4 w-24 h-24 text-indigo-100/50 group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest relative z-10">Growth Rate</span>
                        <p className="text-4xl font-black text-indigo-600 relative z-10 tracking-tighter">{student.growthVelocity}%</p>
                    </div>
                    <div className="p-8 bg-emerald-50/50 rounded-[2.5rem] border border-emerald-100 relative overflow-hidden group">
                        <Icon name="check" className="absolute -bottom-4 -right-4 w-24 h-24 text-emerald-100/50 group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-black uppercase text-emerald-400 tracking-widest relative z-10">Overall Score</span>
                        <p className="text-4xl font-black text-emerald-600 relative z-10 tracking-tighter">82%</p>
                    </div>
                    <div className="p-8 bg-slate-900 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                         <Icon name="shield" className="absolute -bottom-4 -right-4 w-24 h-24 text-white/5 group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest relative z-10">Support Level</span>
                        <p className="text-4xl font-black text-white relative z-10 tracking-tighter">Tier {student.interventionStatus?.tier || 1}</p>
                    </div>
                </div>

                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <Icon name="brain" className="w-6 h-6 text-indigo-600" />
                        <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.3em]">Learning Summary ({activeLang})</h3>
                    </div>
                    <div className="p-10 bg-slate-50 border border-slate-100 rounded-[3.5rem] min-h-[220px] relative">
                        {isGenerating ? (
                            <div className="flex flex-col items-center justify-center h-full py-10 gap-3">
                                <Icon name="refresh" className="w-10 h-10 text-indigo-300 animate-spin" />
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Analyzing Data...</span>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center h-full py-10 gap-3 text-rose-500">
                                <Icon name="alert" className="w-10 h-10" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
                            </div>
                        ) : isTranslating ? (
                            <div className="flex flex-col items-center justify-center h-full py-10 gap-3">
                                <Icon name="refresh" className="w-10 h-10 text-indigo-300 animate-spin" />
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Translating to {activeLang}...</span>
                            </div>
                        ) : (
                            <p className="text-lg text-slate-700 font-bold leading-relaxed italic whitespace-pre-wrap">
                                "{translatedNarrative || narrative || 'Analyzing performance history...'}"
                            </p>
                        )}
                        <div className="absolute -bottom-3 -right-6 px-4 py-2 bg-white border border-slate-100 rounded-xl shadow-lg flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                             <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">AI Analysis Complete</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-12 pt-10 border-t border-slate-100 no-print">
                    <div className="flex items-center gap-4">
                        <input type="checkbox" checked={isReviewed} onChange={e => setIsReviewed(e.target.checked)} className="w-6 h-6 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] cursor-pointer">I have reviewed this report</label>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={onClose} 
                            className="px-8 py-5 bg-white text-slate-400 border-2 border-slate-100 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all active:scale-95"
                        >
                            Close
                        </button>
                        <button 
                            onClick={() => window.print()} 
                            disabled={!isReviewed} 
                            className="px-12 py-5 bg-slate-900 text-white rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl disabled:opacity-30 hover:bg-indigo-600 transition-all active:scale-95 border-b-8 border-slate-950"
                        >
                            Export as PDF
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
