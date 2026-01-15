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
    return (
        <button 
            onClick={onClick}
            className={`w-full text-left relative overflow-hidden p-6 rounded-[2.2rem] bg-gradient-to-br ${gradient} shadow-xl shadow-indigo-100/20 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-200/40 group active:scale-[0.97] outline-none focus:ring-4 focus:ring-indigo-500/10 z-10`}
        >
            <div className="relative z-20">
                <div className="flex justify-between items-start mb-6">
                    <div className={`p-3 rounded-2xl bg-white/20 backdrop-blur-lg shadow-inner text-white border border-white/10`}>
                        <Icon name={icon} className="w-6 h-6" />
                    </div>
                    {info && (
                        <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase text-white/70 tracking-tighter">
                            {info}
                        </div>
                    )}
                </div>
                
                <div className="relative min-h-[90px]">
                    <h3 className="text-5xl font-black text-white mb-1 tracking-tight drop-shadow-sm">{value}</h3>
                    <p className="text-white/90 font-semibold text-sm mb-4">{subtext}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/50">{title}</p>
                </div>
            </div>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-1000 z-0"></div>
        </button>
    );
};

const IntelligenceRibbon: React.FC<{ items: { icon: string, label: string, color: string }[] }> = ({ items }) => (
    <div className="flex gap-4 overflow-x-auto pb-4 mb-10 scrollbar-none animate-in fade-in slide-in-from-top-4 duration-1000">
        {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 shrink-0 px-5 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-indigo-100 transition-colors group cursor-default">
                <div className={`p-2 rounded-xl bg-${item.color}-50 text-${item.color}-500 group-hover:bg-indigo-600 group-hover:text-white transition-all`}>
                    <Icon name={item.icon} className="w-4 h-4" />
                </div>
                <span className="text-xs font-black text-slate-700 tracking-tight">{item.label}</span>
            </div>
        ))}
    </div>
);

export const StudentsTab: React.FC = () => {
    const { students, classProfile, updateClassProfile } = useStudents();
    const { domains } = useBenchmarks();
    const { user } = useAuth();
    const { selectedStudentId, setSelectedStudentId, setActiveTab, setBulkEntryOpen } = useNavigation();
    
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

    const intelligenceItems = useMemo(() => {
        const items = [];
        if (stats.interventionCount > 0) {
            items.push({ icon: 'alert', label: `${stats.interventionCount} Urgent Interventions`, color: 'rose' });
        }
        if (stats.avgVelocity > 10) {
            items.push({ icon: 'trendUp', label: `Exceptional Class Velocity (+${stats.avgVelocity}%)`, color: 'emerald' });
        }
        if (students.length < 5) {
            items.push({ icon: 'plus', label: `Incomplete Roster Detected`, color: 'amber' });
        }
        items.push({ icon: 'benchmark', label: `Standard Mapping: CEFR Starters`, color: 'indigo' });
        return items;
    }, [stats, students]);

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
        const timer = setTimeout(() => setIsLoading(false), 400);
        return () => clearTimeout(timer);
    }, [students.length]);

    const handleSaveClass = async () => {
        await updateClassProfile({ className: editClassName, gradeLevel: editGradeLevel });
        setIsEditClassModalOpen(false);
    };

    const selectedStudent = selectedStudentId ? students.find(s => s.id === selectedStudentId) || null : null;
    const filteredStudents = useMemo(() => {
        return students.filter(student => student.name.toLowerCase().includes(deferredSearch.toLowerCase()));
    }, [students, deferredSearch]);

    if (selectedStudent) {
        return (
            <div className="p-4 md:p-8 h-full bg-[#F8FAFC]">
                <StudentProfile student={selectedStudent} onBack={() => setSelectedStudentId(null)} />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-12 h-full max-w-[1920px] mx-auto overflow-y-auto pb-32">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
                <div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">Hello, {user?.name.split(' ')[0]}</h1>
                    <p className="text-slate-400 font-bold text-lg">Your class overview for <span className="text-indigo-600">{classProfile?.className || 'the day'}</span>.</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center bg-white p-3 rounded-full shadow-xl shadow-slate-200/50 border border-slate-100 ring-8 ring-slate-50 transition-all focus-within:ring-indigo-50">
                    <Icon name="search" className={`w-6 h-6 ml-3 transition-colors ${isPending ? 'text-indigo-500 animate-pulse' : 'text-slate-300'}`} />
                    <input 
                        type="text" 
                        placeholder="Filter class roster..." 
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="bg-transparent border-none focus:ring-0 text-md font-black text-slate-700 placeholder-slate-300 w-56 md:w-80"
                    />
                </div>
            </div>

            <IntelligenceRibbon items={intelligenceItems} />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
                <div className="md:col-span-4 lg:col-span-3 bg-white rounded-[2.8rem] p-10 shadow-2xl shadow-slate-200/40 border border-slate-100 flex flex-col items-center text-center relative overflow-hidden group">
                    <button onClick={() => setIsEditClassModalOpen(true)} className="absolute top-6 right-6 p-2.5 rounded-2xl bg-slate-50 text-slate-400 hover:text-indigo-600 transition shadow-inner border border-slate-100"><Icon name="settings" className="w-5 h-5" /></button>
                    <div className="relative z-10 mt-2 mb-8 scale-hover">
                        <div className="w-28 h-28 p-1.5 rounded-[2.5rem] bg-gradient-to-tr from-slate-50 to-white shadow-2xl mx-auto ring-8 ring-slate-50 transition-transform group-hover:rotate-12">
                            <div className="w-full h-full rounded-[2.2rem] bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-5xl font-black text-white shadow-inner">{classProfile?.className.charAt(0) || 'C'}</div>
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 relative z-10 truncate w-full px-2 tracking-tight mb-2">{classProfile?.className || 'Institutional Core'}</h2>
                    <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] relative z-10 mb-8">Level {classProfile?.gradeLevel || '—'}</p>
                    <div className="mt-auto w-full pt-6 border-t border-slate-50">
                         <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Active Enrollment</p>
                         <p className="text-xl font-black text-slate-800">{students.length} Students</p>
                    </div>
                </div>

                <div className="md:col-span-8 lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <DashboardWidget title="Risk Protocol" value={`${stats.interventionCount}`} subtext="Critical Alerts" icon="alert" gradient="from-rose-500 to-pink-600" textColor="text-white" onClick={() => setIsAtRiskModalOpen(true)} />
                    <DashboardWidget title="Class Metric" value={`${stats.classAvg}%`} subtext="Avg Proficiency" icon="analytics" gradient="from-indigo-600 to-violet-700" textColor="text-white" onClick={() => setActiveTab(TABS.ANALYTICS)} />
                </div>

                <div className="md:col-span-12 lg:col-span-4 bg-white rounded-[2.8rem] p-8 shadow-2xl shadow-slate-200/40 border border-slate-100 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-black text-slate-800 tracking-tight text-xl">Class Trajectory</h3>
                        <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-full">Automated Trend</div>
                    </div>
                    <div className="flex-1 min-h-[160px]">
                        {velocityChartData.length > 1 ? (
                            <LongitudinalGrowthChart data={velocityChartData} lines={[{ key: 'avg', color: '#6366f1' }]} type="area" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-50/50 rounded-3xl border-4 border-dashed border-slate-100 text-slate-300 font-black text-[11px] uppercase tracking-[0.3em] px-10 text-center">Data Threshold Unmet for Charting</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Student Roster</h2>
                    <p className="text-slate-400 font-bold text-md mt-1 italic">Managing institutional cohorts and test cycles.</p>
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                    <button onClick={() => setBulkEntryOpen(true)} className="flex-1 sm:flex-none px-8 py-4 bg-white border border-slate-200 text-slate-800 rounded-2xl font-black hover:bg-slate-50 transition flex items-center justify-center gap-3 shadow-sm active:scale-95 border-b-4"><Icon name="benchmark" className="w-5 h-5 text-indigo-500" /><span className="text-xs uppercase tracking-widest">Bulk Sync</span></button>
                    <button onClick={() => setIsAddStudentModalOpen(true)} className="flex-1 sm:flex-none px-8 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-indigo-600 hover:shadow-indigo-200 transition shadow-2xl flex items-center justify-center gap-3 active:scale-95 border-b-4 border-slate-950"><Icon name="plus" className="w-5 h-5" /><span className="text-xs uppercase tracking-widest">New Roster</span></button>
                </div>
            </div>
            
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8">
                    {[...Array(6)].map((_, i) => <StudentCardSkeleton key={i} />)}
                </div>
            ) : filteredStudents.length > 0 ? (
                <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8 transition-all duration-500 ${isPending ? 'opacity-30 blur-sm translate-y-2' : 'opacity-100'}`}>
                    {filteredStudents.map(student => (
                        <StudentCard 
                            key={student.id} 
                            student={student} 
                            onClick={() => setSelectedStudentId(student.id)} 
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center border-4 border-dashed border-slate-100 rounded-[4rem] bg-white shadow-inner">
                    <div className="p-8 bg-slate-50 rounded-full mb-6 text-slate-200"><Icon name="search" className="w-20 h-20" /></div>
                    <h3 className="text-3xl font-black text-slate-800 mb-2">No Matches in Cohort</h3>
                    <p className="text-slate-400 text-sm max-w-sm mx-auto mb-10 font-bold">Try refining your search protocol or add a new profile to the system.</p>
                </div>
            )}

            <Modal isOpen={isEditClassModalOpen} onClose={() => setIsEditClassModalOpen(false)} title="Institutional Profile">
                <div className="space-y-8">
                    <div>
                        <label className="block text-[11px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">Classroom Label</label>
                        <input value={editClassName} onChange={(e) => setEditClassName(e.target.value)} className="w-full px-6 py-4 border-2 border-slate-100 bg-slate-50 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none font-black text-slate-800 transition-all" />
                    </div>
                    <div>
                        <label className="block text-[11px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">Benchmark Calibration</label>
                        <select value={editGradeLevel} onChange={(e) => setEditGradeLevel(e.target.value)} className="w-full px-6 py-4 border-2 border-slate-100 bg-slate-50 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none font-black text-slate-800 transition-all">
                            <option value="5">Level 5 (Age 5)</option>
                            <option value="6-1">Level 6-1</option>
                            <option value="6-2">Level 6-2</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                        <button onClick={handleSaveClass} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-600 active:scale-95 transition-all">Update Registry</button>
                    </div>
                </div>
            </Modal>

            <AddStudentModal isOpen={isAddStudentModalOpen} onClose={() => setIsAddStudentModalOpen(false)} />
            <AtRiskDetailsModal isOpen={isAtRiskModalOpen} onClose={() => setIsAtRiskModalOpen(false)} atRiskStudents={stats.atRiskList} domainCount={domains.length || 8} />
        </div>
    );
};