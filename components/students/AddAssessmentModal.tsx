
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
                <div className="relative rounded-[2rem] overflow-hidden bg-black aspect-video mb-6">
                    <video ref={videoRef} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 border-2 border-indigo-500/50 flex items-center justify-center pointer-events-none">
                        <div className="w-64 h-64 border-2 border-white rounded-2xl animate-pulse flex items-center justify-center">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest bg-black/50 px-2 py-1">Align Rubric</span>
                        </div>
                    </div>
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 px-6">
                        <button onClick={stopScanning} className="px-6 py-3 bg-white/10 backdrop-blur-md text-white rounded-xl text-[10px] font-black uppercase">Cancel</button>
                        <button onClick={captureAndProcess} className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase shadow-2xl">Capture & Analyze</button>
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                </div>
            ) : (
                <div className="flex gap-4 mb-6">
                    <button onClick={handleVisionScan} className="flex-1 p-6 bg-slate-900 text-white rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-xl group">
                        <div className="p-3 bg-white/10 rounded-xl group-hover:scale-110 transition-transform"><Icon name="analytics" className="w-6 h-6" /></div>
                        <span className="text-[10px] font-black uppercase tracking-widest">AI Vision Scoring</span>
                    </button>
                    <div className="flex-1 grid grid-cols-1 gap-2">
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                             <label className="block text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">Period</label>
                             <select value={testPeriod} onChange={e => setTestPeriod(e.target.value as any)} className="bg-transparent font-bold text-xs outline-none w-full">{Object.values(TestPeriod).map(q => <option key={q} value={q}>{q}</option>)}</select>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                             <label className="block text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">Sync Date</label>
                             <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-transparent font-bold text-xs outline-none w-full" />
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-[2rem] border border-slate-100 mb-6 h-[400px] overflow-y-auto shadow-inner p-2 space-y-2">
                {domains.map(domain => {
                    const pct = getDomainPercentage(domain);
                    const domainSubs = subdomains[domain] || [];
                    return (
                        <div key={domain} className="bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden">
                            <div className="px-4 py-3 flex justify-between items-center bg-white border-b border-slate-50">
                                <span className="text-xs font-black text-slate-800 uppercase tracking-widest">{domain}</span>
                                <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${pct ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-100 text-slate-300'}`}>{pct ? `${pct}%` : '---'}</span>
                            </div>
                            <div className="p-4 space-y-3">
                                {domainSubs.map(sub => (
                                    <div key={sub.name} className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-500">{sub.name}</span>
                                        <div className="flex items-center bg-white border border-slate-100 rounded-xl px-3 py-1.5 w-32 focus-within:ring-2 focus-within:ring-indigo-500">
                                            <input type="number" min="0" max={sub.maxScore} value={subScores[makeKey(domain, sub.name)] ?? ''} onChange={e => handleSubScoreChange(domain, sub.name, e.target.value, sub.maxScore)} className="w-full text-right font-black text-xs outline-none" placeholder="-" />
                                            <span className="text-[10px] text-slate-300 ml-1">/{sub.maxScore}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                <button onClick={onClose} className="px-8 py-3 text-slate-400 font-bold hover:text-slate-600 transition">Cancel</button>
                <button onClick={handleSubmit} className="px-10 py-3 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-600 transition-all flex items-center gap-2 text-xs uppercase tracking-widest border-b-4 border-slate-950"><Icon name="check" className="w-4 h-4" /> Commit Cycle</button>
            </div>
        </Modal>
    );
};
