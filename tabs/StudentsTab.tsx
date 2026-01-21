import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { Student, TestPeriod, UserRole, VelocityBand } from '../types';
import { StudentCard } from '../components/students/StudentCard';
import { StudentProfile } from '../components/students/StudentProfile';
import { useStudents } from '../context/StudentContext';
import { useBenchmarks } from '../context/BenchmarkContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { Icon } from '../components/common/Icon';
import { AddStudentModal } from '../components/students/AddStudentModal';
import { StudentCardSkeleton } from '../components/common/Skeleton';
import { LongitudinalGrowthChart, SupportTierChart } from '../components/charts/Charts';
import { Modal } from '../components/common/Modal';
import { AtRiskDetailsModal } from '../components/students/AtRiskDetailsModal';
import { InsightCard } from '../components/common/InsightCard';
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

        const tiers = [
            { name: 'Tier 1', value: 0, color: '#10b981' },
            { name: 'Tier 2', value: 0, color: '#f59e0b' },
            { name: 'Tier 3', value: 0, color: '#f43f5e' }
        ];

        students.forEach(s => {
            if (s.interventionStatus?.tier === 3) tiers[2].value++;
            else if (s.interventionStatus?.tier === 2) tiers[1].value++;
            else tiers[0].value++;
        });

        return {
            classAvg: count ? Math.round(totalScore / count) : 0,
            interventionCount: atRiskList.length,
            growth: count ? Math.round(totalGrowth / count) : 0,
            avgVelocity: Math.round(totalVelocity / students.length),
            atRiskList,
            tiers
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
        const timer = setTimeout(() => setIsLoading(false), 400);
        return () => clearTimeout(timer);
    }, [students.length]);

    const filteredStudents = useMemo(() => {
        return students.filter(student => student.name.toLowerCase().includes(deferredSearch.toLowerCase()));
    }, [students, deferredSearch]);

    if (selectedStudentId) {
        const selectedStudent = students.find(s => s.id === selectedStudentId);
        if (selectedStudent) {
            return <StudentProfile student={selectedStudent} onBack={() => setSelectedStudentId(null)} />;
        }
    }

    const isTeacher = user?.role === UserRole.Teacher;

    return (
        <div className="p-6 md:p-12 h-full max-w-[1920px] mx-auto overflow-y-auto pb-32 scrollbar-thin scrollbar-thumb-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
                <div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">
                        {isTeacher ? `Teaching Today: ${user?.name.split(' ')[0]}` : "Institutional Intelligence"}
                    </h1>
                    <p className="text-slate-400 font-bold text-lg">
                        {isTeacher ? "Classroom growth and performance summary." : "System-wide tracking and risk monitoring."}
                    </p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center bg-white p-3 rounded-full shadow-xl shadow-slate-200/50 border border-slate-100 ring-8 ring-slate-50 transition-all focus-within:ring-indigo-50">
                    <Icon name="search" className={`w-6 h-6 ml-3 transition-colors ${isPending ? 'text-indigo-500 animate-pulse' : 'text-slate-300'}`} />
                    <input 
                        type="text" 
                        placeholder="Search roster..." 
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            startTransition(() => setDeferredSearch(e.target.value));
                        }}
                        className="bg-transparent border-none focus:ring-0 text-md font-black text-slate-700 placeholder-slate-300 w-56 md:w-80"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
                {isTeacher ? (
                    <div className="md:col-span-8 lg:col-span-9">
                        <InsightCard 
                            title="Active Support Protocols"
                            description="Prioritized Classroom Strategy"
                            actionLabel="Analyze Weakness"
                            onAction={() => setActiveTab(TABS.RESOURCE_BANK)}
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <DashboardWidget title="Risk Protocol" value={stats.interventionCount} subtext="Requires Attention" icon="alert" gradient="from-rose-500 to-pink-600" textColor="text-white" onClick={() => setIsAtRiskModalOpen(true)} />
                                <DashboardWidget title="Class Velocity" value={`+${stats.avgVelocity}%`} subtext="Growth Speed" icon="trendUp" gradient="from-indigo-600 to-violet-700" textColor="text-white" onClick={() => setActiveTab(TABS.ANALYTICS)} />
                                <DashboardWidget title="Classroom Avg" value={`${stats.classAvg}%`} subtext="Proficiency" icon="analytics" gradient="from-blue-500 to-indigo-600" textColor="text-white" onClick={() => setActiveTab(TABS.ANALYTICS)} />
                            </div>
                        </InsightCard>
                    </div>
                ) : (
                    <div className="md:col-span-8 lg:col-span-9">
                        <InsightCard 
                            title="Institutional Performance Overview"
                            description="Executive Oversight"
                            actionLabel="Strategic Analytics"
                            onAction={() => setActiveTab(TABS.ANALYTICS)}
                            variant="intelligence"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-slate-800 rounded-3xl p-6">
                                    <h4 className="text-white font-black text-sm uppercase tracking-widest mb-4">Tier Distribution</h4>
                                    <div className="h-64"><SupportTierChart data={stats.tiers as any} /></div>
                                </div>
                                <div className="bg-slate-800 rounded-3xl p-6">
                                    <h4 className="text-white font-black text-sm uppercase tracking-widest mb-4">Growth Velocity Trend</h4>
                                    <div className="h-64"><LongitudinalGrowthChart data={velocityChartData} lines={[{ key: 'avg', color: '#6366f1' }]} type="area" /></div>
                                </div>
                            </div>
                        </InsightCard>
                    </div>
                )}

                <div className="md:col-span-4 lg:col-span-3 bg-white rounded-[2.8rem] p-10 shadow-2xl border border-slate-100 flex flex-col items-center text-center relative overflow-hidden group">
                    <button onClick={() => setIsEditClassModalOpen(true)} className="absolute top-6 right-6 p-2.5 rounded-2xl bg-slate-50 text-slate-400 hover:text-indigo-600 transition shadow-inner border border-slate-100"><Icon name="settings" className="w-5 h-5" /></button>
                    <div className="relative z-10 mt-2 mb-8 scale-hover">
                        <div className="w-28 h-28 p-1.5 rounded-[2.5rem] bg-gradient-to-tr from-slate-50 to-white shadow-2xl mx-auto ring-8 ring-slate-50 transition-transform group-hover:rotate-12">
                            <div className="w-full h-full rounded-[2.2rem] bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-5xl font-black text-white shadow-inner">{classProfile?.className.charAt(0) || 'C'}</div>
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 truncate w-full px-2 tracking-tight mb-2">{classProfile?.className || 'Classroom'}</h2>
                    <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Level {classProfile?.gradeLevel || '—'}</p>
                    <div className="mt-auto w-full pt-6 border-t border-slate-50">
                         <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Active Enrollment</p>
                         <p className="text-xl font-black text-slate-800">{students.length} Students</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Student Roster</h2>
                    <p className="text-slate-400 font-bold text-md mt-1 italic">Managing institutional cohorts and growth velocity.</p>
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                    <button onClick={() => setBulkEntryOpen(true)} className="flex-1 sm:flex-none px-8 py-4 bg-white border border-slate-200 text-slate-800 rounded-2xl font-black hover:bg-slate-50 transition flex items-center justify-center gap-3 shadow-sm active:scale-95 border-b-4"><Icon name="benchmark" className="w-5 h-5 text-indigo-500" /><span className="text-xs uppercase tracking-widest">Bulk Entry</span></button>
                    <button onClick={() => setIsAddStudentModalOpen(true)} className="flex-1 sm:flex-none px-8 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-indigo-600 hover:shadow-indigo-200 transition shadow-2xl flex items-center justify-center gap-3 active:scale-95 border-b-4 border-slate-950"><Icon name="plus" className="w-5 h-5" /><span className="text-xs uppercase tracking-widest">New Student</span></button>
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
                    <h3 className="text-3xl font-black text-slate-800 mb-2">No Matches</h3>
                    <p className="text-slate-400 text-sm max-w-sm mx-auto mb-10 font-bold">Try refining your search protocol or add a new profile.</p>
                </div>
            )}

            <Modal isOpen={isEditClassModalOpen} onClose={() => setIsEditClassModalOpen(false)} title="Institutional Profile">
                <div className="space-y-8">
                    <div>
                        <label className="block text-[11px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">Classroom Label</label>
                        <input value={classProfile?.className || ''} onChange={(e) => updateClassProfile({ className: e.target.value })} className="w-full px-6 py-4 border-2 border-slate-100 bg-slate-50 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none font-black text-slate-800 transition-all" />
                    </div>
                    <div>
                        <label className="block text-[11px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">Benchmark Calibration</label>
                        <select value={classProfile?.gradeLevel || '5'} onChange={(e) => updateClassProfile({ gradeLevel: e.target.value })} className="w-full px-6 py-4 border-2 border-slate-100 bg-slate-50 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none font-black text-slate-800 transition-all">
                            <option value="5">Level 5 (Age 5)</option>
                            <option value="6-1">Level 6-1</option>
                            <option value="6-2">Level 6-2</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                        <button onClick={() => setIsEditClassModalOpen(false)} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-600 active:scale-95 transition-all">Close</button>
                    </div>
                </div>
            </Modal>

            <AddStudentModal isOpen={isAddStudentModalOpen} onClose={() => setIsAddStudentModalOpen(false)} />
            <AtRiskDetailsModal isOpen={isAtRiskModalOpen} onClose={() => setIsAtRiskModalOpen(false)} atRiskStudents={stats.atRiskList} domainCount={domains.length || 8} />
        </div>
    );
};