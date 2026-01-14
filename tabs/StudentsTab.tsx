import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { Student, TestPeriod } from '../types';
import { StudentCard } from '../components/students/StudentCard';
import { StudentProfile } from '../components/students/StudentProfile';
import { useStudents } from '../context/StudentContext';
import { useBenchmarks } from '../context/BenchmarkContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { Icon } from '../components/common/Icon';
import { AddStudentModal } from '../components/students/AddStudentModal';
import { StudentCardSkeleton } from '../components/common/Skeleton';
import { LongitudinalGrowthChart } from '../components/charts/Charts';
import { Modal } from '../components/common/Modal';
import { AtRiskDetailsModal } from '../components/students/AtRiskDetailsModal';
import { TABS } from '../constants';
import { GeminiService } from '../services/geminiService';

const DashboardWidget: React.FC<{ 
    title: string; 
    value: string | number; 
    subtext: string; 
    icon: string; 
    gradient: string;
    textColor: string;
    info?: string;
    onClick?: () => void;
}> = ({ title, value, subtext, icon, gradient, textColor, info, onClick }) => {
    const [showInfo, setShowInfo] = useState(false);

    return (
        <button 
            onClick={onClick}
            className={`w-full text-left relative overflow-hidden p-6 rounded-[2rem] bg-gradient-to-br ${gradient} shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl group active:scale-[0.98] outline-none focus:ring-4 focus:ring-indigo-500/20 z-10`}
        >
            <div className="relative z-20">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-2.5 rounded-xl bg-white/30 backdrop-blur-md shadow-inner text-white`}>
                        <Icon name={icon} className="w-6 h-6" />
                    </div>
                </div>
                
                <div className="relative min-h-[80px]">
                    <h3 className="text-4xl font-extrabold text-white mb-1 tracking-tight">{value}</h3>
                    <p className="text-white/90 font-medium text-sm mb-4">{subtext}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/60">{title}</p>
                </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-1000 z-0"></div>
        </button>
    );
};

export const StudentsTab: React.FC = () => {
    const { students, classProfile, updateClassProfile } = useStudents();
    const { domains } = useBenchmarks();
    const { user } = useAuth();
    const { selectedStudentId, setSelectedStudentId, setActiveTab, setBulkEntryOpen } = useNavigation();
    
    // Concurrent UI Logic
    const [isPending, startTransition] = useTransition();
    const [searchTerm, setSearchTerm] = useState('');
    const [deferredSearch, setDeferredSearch] = useState('');

    const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
    const [isEditClassModalOpen, setIsEditClassModalOpen] = useState(false);
    const [isAtRiskModalOpen, setIsAtRiskModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [editClassName, setEditClassName] = useState(classProfile?.className || '');
    const [editGradeLevel, setEditGradeLevel] = useState(classProfile?.gradeLevel || '5');

    useEffect(() => {
        if (classProfile) {
            setEditClassName(classProfile.className);
            setEditGradeLevel(classProfile.gradeLevel);
        }
    }, [classProfile]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        // Parallelizing State: Typing is instant, filtering is deferred
        startTransition(() => {
            setDeferredSearch(value);
        });
    };

    const stats = useMemo(() => {
        if (!students.length) return { classAvg: 0, interventionCount: 0, growth: 0, avgVelocity: 0, atRiskList: [] };
        
        let totalScore = 0;
        let count = 0;
        let totalGrowth = 0;
        let totalVelocity = 0;
        const atRiskList = students.filter(s => s.interventionStatus !== null || s.hasAnomaly);

        students.forEach(s => {
            totalGrowth += s.overallGrowth;
            totalVelocity += s.growthVelocity;
            const last = s.assessments[s.assessments.length - 1];
            if (last) {
                const vals = Object.values(last.scores) as number[];
                totalScore += vals.reduce((a,b) => a+b, 0) / vals.length;
                count++;
            }
        });

        return {
            classAvg: count ? Math.round(totalScore / count) : 0,
            interventionCount: atRiskList.length,
            growth: count ? Math.round(totalGrowth / count) : 0,
            avgVelocity: Math.round(totalVelocity / students.length),
            atRiskList
        };
    }, [students]);

    const velocityChartData = useMemo(() => {
        const periods = [TestPeriod.Baseline, TestPeriod.Midline, TestPeriod.Endline];
        return periods.map(p => {
            let total = 0;
            let count = 0;
            students.forEach(s => {
                const a = s.assessments.find(as => as.type === p);
                if (a) {
                    const vals = Object.values(a.scores) as number[];
                    total += vals.reduce((sum, val) => sum + val, 0) / vals.length;
                    count++;
                }
            });
            return { name: p, avg: count > 0 ? Math.round(total / count) : null };
        }).filter(d => d.avg !== null);
    }, [students]);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 300);
        return () => clearTimeout(timer);
    }, [students.length]);

    const handleSaveClass = async () => {
        await updateClassProfile({ className: editClassName, gradeLevel: editGradeLevel });
        setIsEditClassModalOpen(false);
    };

    const selectedStudent = selectedStudentId ? students.find(s => s.id === selectedStudentId) || null : null;
    
    // Memoized filtered list using the deferred search term
    const filteredStudents = useMemo(() => {
        return students.filter(student => student.name.toLowerCase().includes(deferredSearch.toLowerCase()));
    }, [students, deferredSearch]);

    const handleStudentInteraction = (id: string) => {
        // Speculative Warm-up: Initialize AI engine while user is navigating
        GeminiService.warmup();
        setSelectedStudentId(id);
    };

    if (selectedStudent) {
        return (
            <div className="p-4 md:p-8 h-full">
                <StudentProfile student={selectedStudent} onBack={() => setSelectedStudentId(null)} />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 h-full max-w-[1920px] mx-auto overflow-y-auto pb-20">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Welcome, {user?.name.split(' ')[0]}</h1>
                    <p className="text-slate-500 font-medium">Classroom analytics synchronized in parallel.</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center bg-white p-2 rounded-full shadow-sm border border-slate-100 ring-4 ring-slate-50">
                    <Icon name="search" className={`w-5 h-5 ml-3 transition-colors ${isPending ? 'text-indigo-500 animate-pulse' : 'text-slate-400'}`} />
                    <input 
                        type="text" 
                        placeholder="Search roster..." 
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 placeholder-slate-400 w-48 md:w-64"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
                <div className="md:col-span-4 lg:col-span-3 bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col items-center text-center relative overflow-hidden group">
                    <button onClick={() => setIsEditClassModalOpen(true)} className="absolute top-4 right-4 p-2 rounded-full bg-white/80 text-slate-400 hover:text-indigo-600 transition shadow-sm z-10 border border-slate-100"><Icon name="settings" className="w-4 h-4" /></button>
                    <div className="relative z-10 mt-2 mb-4">
                        <div className="w-24 h-24 p-1 rounded-full bg-white shadow-xl mx-auto ring-4 ring-slate-50">
                            <div className="w-full h-full rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-4xl font-black text-white">{classProfile?.className.charAt(0) || 'C'}</div>
                        </div>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 relative z-10 truncate w-full px-2 tracking-tight">{classProfile?.className || 'Setup Required'}</h2>
                    <p className="text-sm font-bold text-slate-400 mb-6 relative z-10">Level {classProfile?.gradeLevel || '-'}</p>
                </div>

                <div className="md:col-span-8 lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <DashboardWidget title="At-Risk Alerts" value={`${stats.interventionCount}`} subtext="Critical Tasks" icon="alert" gradient="from-orange-400 to-pink-500" textColor="text-white" onClick={() => setIsAtRiskModalOpen(true)} />
                    <DashboardWidget title="Class Avg" value={`${stats.classAvg}%`} subtext="Proficiency" icon="analytics" gradient="from-indigo-500 to-blue-600" textColor="text-white" onClick={() => setActiveTab(TABS.ANALYTICS)} />
                </div>

                <div className="md:col-span-12 lg:col-span-4 bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col">
                    <div className="flex justify-between items-center mb-4"><h3 className="font-black text-slate-800 tracking-tight">Growth Velocity</h3></div>
                    <div className="flex-1 min-h-[140px]">
                        {velocityChartData.length > 1 ? (
                            <LongitudinalGrowthChart data={velocityChartData} lines={[{ key: 'avg', color: '#6366f1' }]} type="area" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-bold text-[10px] uppercase tracking-widest px-4">Awaiting Midline Data</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Student Roster</h2>
                    <p className="text-slate-400 text-sm font-medium">Real-time cohort management</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button onClick={() => setBulkEntryOpen(true)} className="flex-1 sm:flex-none px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black hover:bg-slate-50 transition flex items-center justify-center gap-2 shadow-sm active:scale-95"><Icon name="benchmark" className="w-4 h-4 text-indigo-500" /><span className="text-xs uppercase tracking-widest">Batch Entry</span></button>
                    <button onClick={() => setIsAddStudentModalOpen(true)} className="flex-1 sm:flex-none px-6 py-3 bg-slate-900 text-white rounded-2xl font-black hover:bg-indigo-600 transition shadow-xl flex items-center justify-center gap-2 active:scale-95"><Icon name="plus" className="w-4 h-4" /><span className="text-xs uppercase tracking-widest">Add Student</span></button>
                </div>
            </div>
            
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                    {[...Array(6)].map((_, i) => <StudentCardSkeleton key={i} />)}
                </div>
            ) : filteredStudents.length > 0 ? (
                <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 transition-opacity duration-300 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
                    {filteredStudents.map(student => (
                        <StudentCard 
                            key={student.id} 
                            student={student} 
                            onClick={() => handleStudentInteraction(student.id)} 
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center border-4 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50">
                    <h3 className="text-2xl font-black text-slate-800 mb-2">No Results Found</h3>
                    <p className="text-slate-400 text-sm max-w-sm mx-auto mb-10 font-medium">Refine your search or add new students.</p>
                </div>
            )}

            <Modal isOpen={isEditClassModalOpen} onClose={() => setIsEditClassModalOpen(false)} title="Class Settings">
                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 ml-1">Class Name</label>
                        <input value={editClassName} onChange={(e) => setEditClassName(e.target.value)} className="w-full px-5 py-3 border border-slate-200 bg-slate-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 ml-1">Benchmark Level</label>
                        <select value={editGradeLevel} onChange={(e) => setEditGradeLevel(e.target.value)} className="w-full px-5 py-3 border border-slate-200 bg-slate-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800">
                            <option value="5">Level 5</option>
                            <option value="6-1">Level 6-1</option>
                            <option value="6-2">Level 6-2</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button onClick={handleSaveClass} className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-600 active:scale-95 transition-all">Save Changes</button>
                    </div>
                </div>
            </Modal>

            <AddStudentModal isOpen={isAddStudentModalOpen} onClose={() => setIsAddStudentModalOpen(false)} />
            <AtRiskDetailsModal isOpen={isAtRiskModalOpen} onClose={() => setIsAtRiskModalOpen(false)} atRiskStudents={stats.atRiskList} domainCount={domains.length || 8} />
        </div>
    );
};