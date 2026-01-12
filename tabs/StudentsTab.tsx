
import React, { useState, useEffect, useMemo } from 'react';
import { Student } from '../types';
import { StudentCard } from '../components/students/StudentCard';
import { StudentProfile } from '../components/students/StudentProfile';
import { useStudents } from '../context/StudentContext';
import { useBenchmarks } from '../context/BenchmarkContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { Icon } from '../components/common/Icon';
import { BulkAssessmentModal } from '../components/students/BulkAssessmentModal';
import { AddStudentModal } from '../components/students/AddStudentModal';
import { StudentCardSkeleton } from '../components/common/Skeleton';
import { Card } from '../components/common/Card';
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
    const [showInfo, setShowInfo] = useState(false);

    return (
        <button 
            onClick={onClick}
            className={`w-full text-left relative overflow-hidden p-6 rounded-[2rem] bg-gradient-to-br ${gradient} shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl group active:scale-[0.98] outline-none focus:ring-4 focus:ring-indigo-500/20`}
        >
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-2.5 rounded-xl bg-white/30 backdrop-blur-md shadow-inner text-white`}>
                        <Icon name={icon} className="w-6 h-6" />
                    </div>
                    {info && (
                        <div 
                            onMouseEnter={() => setShowInfo(true)}
                            onMouseLeave={() => setShowInfo(false)}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 rounded-full bg-white/10 text-white/50 hover:text-white transition cursor-help"
                        >
                            <Icon name="info" className="w-4 h-4" />
                        </div>
                    )}
                </div>
                
                <div className="relative min-h-[80px]">
                    {showInfo && info ? (
                        <div className="bg-white/10 backdrop-blur-xl p-3 rounded-2xl border border-white/20 animate-in fade-in zoom-in-95 duration-200">
                            <p className="text-[10px] font-bold text-white leading-relaxed">{info}</p>
                        </div>
                    ) : (
                        <>
                            <h3 className="text-4xl font-extrabold text-white mb-1 tracking-tight">{value}</h3>
                            <p className="text-white/90 font-medium text-sm mb-4">{subtext}</p>
                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/60">{title}</p>
                        </>
                    )}
                </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-1000"></div>
        </button>
    );
};

export const StudentsTab: React.FC = () => {
    const { students, classProfile, updateClassProfile } = useStudents();
    const { domains } = useBenchmarks();
    const { user } = useAuth();
    const { selectedStudentId, setSelectedStudentId, setActiveTab } = useNavigation();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [isBulkAssessmentOpen, setIsBulkAssessmentOpen] = useState(false);
    const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
    const [isEditClassModalOpen, setIsEditClassModalOpen] = useState(false);
    const [isAtRiskModalOpen, setIsAtRiskModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Class Edit State
    const [editClassName, setEditClassName] = useState(classProfile?.className || '');
    const [editGradeLevel, setEditGradeLevel] = useState(classProfile?.gradeLevel || '5');

    useEffect(() => {
        if (classProfile) {
            setEditClassName(classProfile.className);
            setEditGradeLevel(classProfile.gradeLevel);
        }
    }, [classProfile]);

    const stats = useMemo(() => {
        if (!students.length) return { classAvg: 0, interventionCount: 0, growth: 0, atRiskList: [] };
        
        let totalScore = 0;
        let count = 0;
        let totalGrowth = 0;
        const atRiskList = students.filter(s => s.interventionStatus !== null || s.hasAnomaly);

        students.forEach(s => {
            totalGrowth += s.overallGrowth;
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
            atRiskList
        };
    }, [students]);

    const chartData = useMemo(() => {
        return [
            { name: 'Baseline', avg: 60 },
            { name: 'Midpoint', avg: 68 },
            { name: 'Current', avg: stats.classAvg || 75 },
        ];
    }, [stats.classAvg]);

    useEffect(() => {
        if (students.length > 0 || classProfile) {
            const timer = setTimeout(() => setIsLoading(false), 800);
            return () => clearTimeout(timer);
        } else {
            setIsLoading(false);
        }
    }, [students.length, classProfile]);

    const handleSaveClass = async () => {
        await updateClassProfile({ className: editClassName, gradeLevel: editGradeLevel });
        setIsEditClassModalOpen(false);
    };

    const selectedStudent = selectedStudentId ? students.find(s => s.id === selectedStudentId) || null : null;
    const filteredStudents = students.filter(student => student.name.toLowerCase().includes(searchTerm.toLowerCase()));

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
                    <p className="text-slate-500">Your classroom is {navigator.onLine ? 'fully synced' : 'running locally'}.</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center bg-white p-2 rounded-full shadow-sm border border-slate-100">
                    <Icon name="search" className="w-5 h-5 text-slate-400 ml-3" />
                    <input 
                        type="text" 
                        placeholder="Search roster..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700 placeholder-slate-400 w-48 md:w-64"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
                <div className="md:col-span-4 lg:col-span-3 bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center text-center relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-indigo-50 to-blue-50 z-0"></div>
                    <button 
                        onClick={() => setIsEditClassModalOpen(true)}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/50 text-slate-400 hover:text-indigo-600 hover:bg-white transition shadow-sm z-10"
                        title="Edit Class Profile"
                    >
                        <Icon name="settings" className="w-4 h-4" />
                    </button>
                    <div className="relative z-10 mt-4 mb-4">
                        <div className="w-24 h-24 p-1 rounded-full bg-white shadow-lg mx-auto">
                            <div className="w-full h-full rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-3xl font-bold text-white">
                                {classProfile?.className.charAt(0) || 'C'}
                            </div>
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 relative z-10 truncate w-full px-2">{classProfile?.className || 'Class Name'}</h2>
                    <p className="text-sm text-slate-500 mb-6 relative z-10">Grade {classProfile?.gradeLevel || '-'}</p>
                    <div className="flex gap-4 w-full relative z-10">
                        <div className="flex-1 bg-slate-50 rounded-2xl p-3">
                            <p className="text-xl font-bold text-slate-800">{students.length}</p>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Students</p>
                        </div>
                        <div className="flex-1 bg-slate-50 rounded-2xl p-3">
                            <p className="text-xl font-bold text-slate-800">100%</p>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Activity</p>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-8 lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <DashboardWidget 
                        title="Actionable Alerts" 
                        value={`${stats.interventionCount} Tasks`} 
                        subtext="Critical support items" 
                        icon="alert" 
                        gradient="from-orange-400 to-pink-500" 
                        textColor="text-white" 
                        info="Number of students flagged for RTI support based on low scores or regression."
                        onClick={() => setIsAtRiskModalOpen(true)}
                    />
                    <DashboardWidget 
                        title="Class Performance" 
                        value={`${stats.classAvg}%`} 
                        subtext="Average Proficiency" 
                        icon="analytics" 
                        gradient="from-cyan-400 to-blue-500" 
                        textColor="text-white" 
                        info="The weighted average of all student domain scores in the current testing cycle."
                        onClick={() => setActiveTab(TABS.ANALYTICS)}
                    />
                </div>

                <div className="md:col-span-12 lg:col-span-4 bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800">Growth Velocity</h3>
                        <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1">
                            <Icon name="trendUp" className="w-3 h-3"/> +{stats.growth}%
                        </span>
                    </div>
                    <div className="flex-1 min-h-[140px]">
                        <LongitudinalGrowthChart data={chartData} lines={[{ key: 'avg', color: '#6366f1' }]} type="area" />
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <Icon name="info" className="w-3 h-3 text-indigo-500" />
                        <span>Tracks the speed of proficiency gains across periods.</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-end mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Roster Management</h2>
                    <p className="text-slate-500 text-sm">Updated {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button onClick={() => setIsBulkAssessmentOpen(true)} className="flex-1 sm:flex-none px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition flex items-center justify-center gap-2 shadow-sm">
                        <Icon name="benchmark" className="w-4 h-4 text-indigo-500" />
                        <span>Batch Entry</span>
                    </button>
                    <button onClick={() => setIsAddStudentModalOpen(true)} className="flex-1 sm:flex-none px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg flex items-center justify-center gap-2">
                        <Icon name="plus" className="w-4 h-4" />
                        <span>Add Student</span>
                    </button>
                </div>
            </div>
            
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                    {[...Array(6)].map((_, i) => <StudentCardSkeleton key={i} />)}
                </div>
            ) : filteredStudents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {filteredStudents.map(student => (
                        <StudentCard key={student.id} student={student} onClick={() => setSelectedStudentId(student.id)} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50">
                    <div className="p-4 bg-slate-100 rounded-full mb-4 text-slate-400">
                        <Icon name="search" className="w-8 h-8" />
                    </div>
                    <p className="text-slate-500 font-bold">No results for "{searchTerm}"</p>
                    <button onClick={() => setSearchTerm('')} className="mt-2 text-indigo-600 text-sm font-bold hover:underline">Clear search</button>
                </div>
            )}

            <Modal isOpen={isEditClassModalOpen} onClose={() => setIsEditClassModalOpen(false)} title="Edit Class Profile">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1 uppercase tracking-wide">Class Name</label>
                        <input value={editClassName} onChange={(e) => setEditClassName(e.target.value)} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1 uppercase tracking-wide">Grade Level</label>
                        <select value={editGradeLevel} onChange={(e) => setEditGradeLevel(e.target.value)} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500">
                            <option value="5">Level 5</option>
                            <option value="6-1">Level 6-1</option>
                            <option value="6-2">Level 6-2</option>
                            <option value="7-2">Level 7-2</option>
                            <option value="7-3">Level 7-3</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button onClick={() => setIsEditClassModalOpen(false)} className="px-4 py-2 text-slate-500 font-bold">Cancel</button>
                        <button onClick={handleSaveClass} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg">Save Changes</button>
                    </div>
                </div>
            </Modal>

            <BulkAssessmentModal isOpen={isBulkAssessmentOpen} onClose={() => setIsBulkAssessmentOpen(false)} />
            <AddStudentModal isOpen={isAddStudentModalOpen} onClose={() => setIsAddStudentModalOpen(false)} />
            <AtRiskDetailsModal 
                isOpen={isAtRiskModalOpen} 
                onClose={() => setIsAtRiskModalOpen(false)} 
                atRiskStudents={stats.atRiskList} 
                domainCount={domains.length}
            />
        </div>
    );
};
