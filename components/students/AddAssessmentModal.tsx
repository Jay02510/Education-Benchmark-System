
import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Assessment, Domain, TestPeriod } from '../../types';
import { useBenchmarks } from '../../context/BenchmarkContext';
import { Icon } from '../common/Icon';

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

    useEffect(() => {
        if (isOpen) {
            if (assessmentToEdit) {
                setDate(assessmentToEdit.date);
                setTestPeriod(assessmentToEdit.type);
                setSubScores(assessmentToEdit.subdomainScores || {});
            } else {
                // Reset for new entry
                setDate(new Date().toISOString().split('T')[0]);
                setTestPeriod(TestPeriod.Baseline);
                setSubScores({});
            }
        }
    }, [isOpen, assessmentToEdit]);

    const makeKey = (domain: string, subdomain: string) => `${domain}:${subdomain}`;

    const handleSubScoreChange = (domain: string, subdomain: string, value: string, maxScore: number) => {
        // Allow empty string to clear the value
        if (value === '') {
            const newScores = { ...subScores };
            delete newScores[makeKey(domain, subdomain)];
            setSubScores(newScores);
            return;
        }

        const numValue = Math.min(maxScore, Math.max(0, Number(value)));
        setSubScores(prev => ({
            ...prev,
            [makeKey(domain, subdomain)]: numValue
        }));
    };

    // Calculate Domain Percentage based on Max Scores
    const getDomainPercentage = (domain: string): number | null => {
        const subs = subdomains[domain] || [];
        let totalScore = 0;
        let totalMax = 0;
        let hasEntries = false;

        subs.forEach(sub => {
            const val = subScores[makeKey(domain, sub.name)];
            if (val !== undefined) {
                totalScore += val;
                totalMax += sub.maxScore;
                hasEntries = true;
            }
        });

        // If no entries, return null. If entries exist, calculate percentage.
        if (!hasEntries || totalMax === 0) return null;
        
        return Math.round((totalScore / totalMax) * 100);
    };

    const getScoreColor = (score: number | null) => {
        if (score === null) return 'bg-gray-100 border-gray-200 text-gray-400 border-dashed';
        if (score >= 80) return 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm';
        if (score >= 60) return 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm';
        return 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm';
    };

    const handleSubmit = () => {
        const domainScores: Record<string, number> = {};
        domains.forEach(d => {
            const avg = getDomainPercentage(d);
            domainScores[d] = avg === null ? 0 : avg; // Default to 0 if no data entered when saving
        });

        const newAssessment: Assessment = {
            id: assessmentToEdit ? assessmentToEdit.id : `assess-${Date.now()}`,
            date,
            type: testPeriod,
            scores: domainScores as any, 
            subdomainScores: subScores
        };
        onSave(newAssessment);
        // Reset local state
        setSubScores({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={assessmentToEdit ? "Edit Assessment" : "Add New Assessment"} size="lg">
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input 
                        type="date" 
                        value={date} 
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Test Period</label>
                    <select 
                        value={testPeriod} 
                        onChange={(e) => setTestPeriod(e.target.value as TestPeriod)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        {Object.values(TestPeriod).map(q => (
                            <option key={q} value={q}>{q}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Scoring (Scroll to see all domains)</span>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 mb-6 h-[500px] overflow-y-auto shadow-inner">
                {domains.map(domain => {
                    const pct = getDomainPercentage(domain);
                    const domainSubs = subdomains[domain] || [];
                    const filledCount = domainSubs.filter(sub => subScores[makeKey(domain, sub.name)] !== undefined).length;

                    return (
                        <div key={domain} className="border-b border-gray-100 last:border-0 relative">
                            {/* Sticky Header with Opaque Background */}
                            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100 sticky top-0 z-20 shadow-sm ring-1 ring-gray-100/50">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <span className="font-bold text-gray-800 block">{domain}</span>
                                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                                            {filledCount}/{domainSubs.length} Scored
                                        </span>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1 ${getScoreColor(pct)}`}>
                                    {pct !== null ? `${pct}%` : 'No Data'}
                                </div>
                            </div>
                            
                            {/* Inputs - Always Visible */}
                            <div className="p-4 grid grid-cols-1 gap-3 bg-white">
                                {domainSubs.length > 0 ? (
                                    domainSubs.map(sub => (
                                        <div key={sub.name} className="flex items-center justify-between gap-4">
                                            <label className="text-sm text-gray-600 font-medium flex-1">{sub.name}</label>
                                            <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2 w-40 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-shadow shrink-0">
                                                <input 
                                                    type="number" 
                                                    min="0"
                                                    max={sub.maxScore}
                                                    value={subScores[makeKey(domain, sub.name)] ?? ''}
                                                    onChange={(e) => handleSubScoreChange(domain, sub.name, e.target.value, sub.maxScore)}
                                                    className="w-full text-gray-900 font-bold text-right focus:outline-none p-0 border-none min-w-0"
                                                    placeholder="-"
                                                />
                                                <span className="text-gray-400 text-xs ml-1 shrink-0 select-none">/ {sub.maxScore}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-400 italic">No subdomains configured for this domain.</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end gap-3">
                <button 
                    onClick={onClose} 
                    className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSubmit} 
                    className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition shadow-lg active:scale-95 flex items-center space-x-2"
                >
                    <Icon name="check" className="w-5 h-5" />
                    <span>Save Assessment</span>
                </button>
            </div>
        </Modal>
    );
};
