import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Assessment, Domain, TestPeriod } from '../../types';
import { useBenchmarks } from '../../context/BenchmarkContext';
import { Icon } from '../common/Icon';
import { GeminiService } from '../../services/geminiService';

interface AddAssessmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (assessment: Assessment) => void;
    assessmentToEdit?: Assessment | null;
}

export const AddAssessmentModal: React.FC<AddAssessmentModalProps> = ({ isOpen, onClose, onSave, assessmentToEdit }) => {
    const { domains, subdomains } = useBenchmarks();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [testPeriod, setTestPeriod] = useState<TestPeriod>(TestPeriod.Baseline);
    const [subScores, setSubScores] = useState<Record<string, number>>({});
    const [isScanning, setIsScanning] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (assessmentToEdit) {
                setDate(assessmentToEdit.date);
                setTestPeriod(assessmentToEdit.type);
                setSubScores(assessmentToEdit.subdomainScores || {});
            } else {
                setDate(new Date().toISOString().split('T')[0]);
                setTestPeriod(TestPeriod.Baseline);
                setSubScores({});
            }
        }
    }, [isOpen, assessmentToEdit]);

    const handleVisionScan = async () => {
        setIsScanning(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
        } catch (e) {
            setIsScanning(false);
            alert("Camera access denied.");
        }
    };

    const captureAndProcess = async () => {
        if (!videoRef.current || !canvasRef.current) return;
        const canvas = canvasRef.current;
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
        
        const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
        const extractedScores = await GeminiService.analyzeTestPaper(base64, domains);
        
        // Populate scores
        const newSubScores = { ...subScores };
        Object.entries(extractedScores).forEach(([domain, score]) => {
            const firstSub = subdomains[domain]?.[0];
            if (firstSub) {
                newSubScores[`${domain}:${firstSub.name}`] = Math.round((score / 100) * firstSub.maxScore);
            }
        });
        
        setSubScores(newSubScores);
        stopScanning();
    };

    const stopScanning = () => {
        const stream = videoRef.current?.srcObject as MediaStream;
        stream?.getTracks().forEach(t => t.stop());
        setIsScanning(false);
    };

    const makeKey = (domain: string, subdomain: string) => `${domain}:${subdomain}`;

    const handleSubScoreChange = (domain: string, subdomain: string, value: string, maxScore: number) => {
        if (value === '') {
            const newScores = { ...subScores };
            delete newScores[makeKey(domain, subdomain)];
            setSubScores(newScores);
            return;
        }
        const numValue = Math.min(maxScore, Math.max(0, Number(value)));
        setSubScores(prev => ({ ...prev, [makeKey(domain, subdomain)]: numValue }));
    };

    const getDomainPercentage = (domain: string): number | null => {
        const subs = subdomains[domain] || [];
        let totalScore = 0; let totalMax = 0; let hasEntries = false;
        subs.forEach(sub => {
            const val = subScores[makeKey(domain, sub.name)];
            if (val !== undefined) { totalScore += val; totalMax += sub.maxScore; hasEntries = true; }
        });
        if (!hasEntries || totalMax === 0) return null;
        return Math.round((totalScore / totalMax) * 100);
    };

    const handleSubmit = () => {
        const domainScores: Record<string, number> = {};
        domains.forEach(d => {
            const avg = getDomainPercentage(d);
            domainScores[d] = avg === null ? 0 : avg;
        });
        const newAssessment: Assessment = {
            id: assessmentToEdit ? assessmentToEdit.id : `assess-${Date.now()}`,
            date, type: testPeriod, scores: domainScores as any, subdomainScores: subScores
        };
        onSave(newAssessment);
        setSubScores({});
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={assessmentToEdit ? "Update Protocol" : "New Cycle Sync"} size="lg">
            {isScanning ? (
                <div className="relative rounded-[4px] overflow-hidden bg-black aspect-video mb-6 border border-zinc-800">
                    <video ref={videoRef} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 border border-[oklch(0.72_0.18_145)]/40 flex items-center justify-center pointer-events-none">
                        <div className="w-48 h-48 border border-white rounded-[4px] animate-pulse flex items-center justify-center">
                            <span className="text-[10px] font-mono font-medium text-white uppercase tracking-wider bg-black/80 px-2.5 py-1">Align Rubric</span>
                        </div>
                    </div>
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 px-6">
                        <button onClick={stopScanning} className="px-5 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-805 text-white rounded-[4px] text-[10px] font-mono uppercase tracking-wider">Cancel</button>
                        <button onClick={captureAndProcess} className="px-6 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 rounded-[4px] text-[10px] font-mono uppercase tracking-wider">Capture & Analyze</button>
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                </div>
            ) : (
                <div className="flex gap-4 mb-6">
                    <button onClick={handleVisionScan} className="flex-1 p-5 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-[4px] flex flex-col items-center justify-center gap-2 hover:bg-zinc-850 hover:border-zinc-700 transition-all group">
                        <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-[4px] group-hover:scale-105 transition-transform"><Icon name="analytics" className="w-5 h-5 text-[oklch(0.72_0.18_145)]" /></div>
                        <span className="text-[10px] font-mono uppercase tracking-wider">AI Vision Scoring</span>
                    </button>
                    <div className="flex-1 grid grid-cols-1 gap-2">
                        <div className="bg-zinc-950 p-3 rounded-[4px] border border-zinc-900">
                             <label className="block text-[9px] font-medium uppercase text-zinc-500 tracking-wider mb-1 select-none font-mono">Period</label>
                             <select value={testPeriod} onChange={e => setTestPeriod(e.target.value as any)} className="bg-transparent text-zinc-200 font-medium text-xs outline-none w-full border-none cursor-pointer focus:ring-0">{Object.values(TestPeriod).map(q => <option key={q} value={q} className="bg-zinc-955 text-zinc-200">{q}</option>)}</select>
                        </div>
                        <div className="bg-zinc-950 p-3 rounded-[4px] border border-zinc-900">
                             <label className="block text-[9px] font-medium uppercase text-zinc-500 tracking-wider mb-1 select-none font-mono">Sync Date</label>
                             <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-transparent text-zinc-200 font-medium text-xs outline-none w-full border-none focus:ring-0" />
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-zinc-950 rounded-[4px] border border-zinc-900 mb-6 h-[320px] overflow-y-auto scrollbar-none p-4 space-y-3">
                {domains.map(domain => {
                    const pct = getDomainPercentage(domain);
                    const domainSubs = subdomains[domain] || [];
                    return (
                        <div key={domain} className="bg-zinc-900/40 rounded-[4px] border border-zinc-90 w-full overflow-hidden">
                            <div className="px-4 py-3 flex justify-between items-center bg-zinc-900/60 border-b border-zinc-950">
                                <span className="text-xs font-medium text-zinc-200 uppercase tracking-wider select-none font-sans">{domain}</span>
                                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-[4px] ${pct ? 'bg-[oklch(0.72_0.18_145)]/10 text-[oklch(0.72_0.18_145)] border border-[oklch(0.72_0.18_145)]/20' : 'bg-zinc-950 text-zinc-650'}`}>{pct ? `${pct}%` : '---'}</span>
                            </div>
                            <div className="p-4 space-y-3.5">
                                {domainSubs.map(sub => (
                                    <div key={sub.name} className="flex items-center justify-between">
                                        <span className="text-xs text-zinc-400 font-normal">{sub.name}</span>
                                        <div className="flex items-center bg-zinc-950 border border-zinc-900 rounded-[4px] px-3 py-1 w-28 focus-within:border-zinc-750 transition-colors">
                                            <input type="number" min="0" max={sub.maxScore} value={subScores[makeKey(domain, sub.name)] ?? ''} onChange={e => handleSubScoreChange(domain, sub.name, e.target.value, sub.maxScore)} className="w-full text-right text-zinc-150 font-normal text-xs outline-none bg-transparent" placeholder="-" />
                                            <span className="text-[10px] text-zinc-600 ml-1">/{sub.maxScore}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-900">
                <button 
                    onClick={onClose} 
                    className="px-4 py-2 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-[4px] text-xs transition-colors cursor-pointer"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSubmit} 
                    className="px-5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 rounded-[4px] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                    <Icon name="check" className="w-3.5 h-3.5" /> 
                    <span>Save Assessment</span>
                </button>
            </div>
        </Modal>
    );
};
