
import React, { useState, useEffect, useMemo } from 'react';
import { Student } from '../types';
import { StudentCard } from '../components/students/StudentCard';
import { StudentProfile } from '../components/students/StudentProfile';
import { useStudents } from '../context/StudentContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { Icon } from '../components/common/Icon';
import { BulkAssessmentModal } from '../components/students/BulkAssessmentModal';
import { AddStudentModal } from '../components/students/AddStudentModal';
import { StudentCardSkeleton } from '../components/common/Skeleton';
import { Card } from '../components/common/Card';
import { LongitudinalGrowthChart } from '../components/charts/Charts';
import { DOMAINS } from '../constants';

// Widget Component for the Dashboard
const DashboardWidget: React.FC<{ 
    title: string; 
    value: string | number; 
    subtext: string; 
    icon: string; 
    gradient: string;
    textColor: string;
}> = ({ title, value, subtext, icon, gradient, textColor }) => (
    <div className={`relative overflow-hidden p-6 rounded-[2rem] bg-gradient-to-br ${gradient} shadow-lg transition-transform hover:-translate-y-1`}>
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl bg-white/30 backdrop-blur-md shadow-inner text-white`}>
                    <Icon name={icon} className="w-6 h-6" />
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-full p-1.5">
                   <Icon name="arrowRight" className="w-3 h-3 text-white -rotate-45" />
                </div>
            </div>
            <h3 className="text-4xl font-extrabold text-white mb-1">{value}</h3>
            <p className="text-white/90 font-medium text-sm mb-4">{subtext}</p>
            <p className="text-xs font-bold uppercase tracking-wider text-white/70">{title}</p>
        </div>
        {/* Decor */}
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
    </div>
);

export const StudentsTab: React.FC = () => {
    const { students, classProfile } = useStudents();
    const { user } = useAuth();
    const { selectedStudentId, setSelectedStudentId } = useNavigation();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [isBulkAssessmentOpen, setIsBulkAssessmentOpen] = useState(false);
    const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Dashboard Stats Calculation
    const stats = useMemo(() => {
        if (!students.length) return { classAvg: 0, interventionCount: 0, growth: 0 };
        
        let totalScore = 0;
        let count = 0;
        let interventionCount = 0;
        let totalGrowth = 0;

        students.forEach(s => {
            if (s.interventionStatus) interventionCount++;
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
            interventionCount,
            growth: count ? Math.round(totalGrowth / count) : 0
        };
    }, [students]);

    // Chart Data Preparation (Simple Class Average Trend)
    const chartData = useMemo(() => {
        // Mocking class trend for visual as real data aggregation is complex in this scope
        return [
            { name: 'Week 1', avg: 65 },
            { name: 'Week 4', avg: 68 },
            { name: 'Week 8', avg: 72 },
            { name: 'Week 12', avg: stats.classAvg || 75 },
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

    const selectedStudent = selectedStudentId ? students.find(s => s.id === selectedStudentId) || null : null;

    const filteredStudents = students.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedStudent) {
        return (
            <div className="p-4 md:p-8 h-full">
                <StudentProfile student={selectedStudent} onBack={() => setSelectedStudentId(null)} />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 h-full max-w-[1920px] mx-auto overflow-y-auto pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Welcome, {user?.name.split(' ')[0]}</h1>
                    <p className="text-slate-500">Here is your personal dashboard overview.</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center bg-white p-2 rounded-full shadow-sm border border-slate-100">
                    <Icon name="search" className="w-5 h-5 text-slate-400 ml-3" />
                    <input 
                        type="text" 
                        placeholder="Search student..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700 placeholder-slate-400 w-48 md:w-64"
                    />
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center ml-2 cursor-pointer hover:bg-slate-200">
                         <Icon name="settings" className="w-4 h-4 text-slate-500" />
                    </div>
                </div>
            </div>

            {/* Dashboard Overview Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
                
                {/* Profile / Class Card */}
                <div className="md:col-span-4 lg:col-span-3 bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-indigo-50 to-blue-50 z-0"></div>
                    <div className="relative z-10 mt-4 mb-4">
                        <div className="w-24 h-24 p-1 rounded-full bg-white shadow-lg mx-auto">
                            <div className="w-full h-full rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-3xl font-bold text-white">
                                {user?.name.charAt(0)}
                            </div>
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 relative z-10">{user?.name}</h2>
                    <p className="text-sm text-slate-500 mb-6 relative z-10">{classProfile?.className || 'Class Teacher'}</p>
                    <div className="flex gap-4 w-full relative z-10">
                        <div className="flex-1 bg-slate-50 rounded-2xl p-3">
                            <p className="text-xl font-bold text-slate-800">{students.length}</p>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Students</p>
                        </div>
                        <div className="flex-1 bg-slate-50 rounded-2xl p-3">
                            <p className="text-xl font-bold text-slate-800">{classProfile?.gradeLevel || '-'}</p>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Level</p>
                        </div>
                    </div>
                </div>

                {/* KPI Widgets */}
                <div className="md:col-span-8 lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <DashboardWidget 
                        title="Prioritized Tasks"
                        value={`${stats.interventionCount} Alerts`}
                        subtext="Students require intervention"
                        icon="alert"
                        gradient="from-orange-400 to-pink-500"
                        textColor="text-white"
                    />
                    <DashboardWidget 
                        title="Class Performance"
                        value={`${stats.classAvg}%`}
                        subtext="Average score this period"
                        icon="analytics"
                        gradient="from-cyan-400 to-blue-500"
                        textColor="text-white"
                    />
                </div>

                {/* Trend Chart Area */}
                <div className="md:col-span-12 lg:col-span-4 bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800">Growth Trend</h3>
                        <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1">
                            <Icon name="trendUp" className="w-3 h-3"/> +{stats.growth}%
                        </span>
                    </div>
                    <div className="flex-1 min-h-[140px]">
                        <LongitudinalGrowthChart 
                            data={chartData} 
                            lines={[{ key: 'avg', color: '#6366f1' }]} 
                            type="area" 
                        />
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-end mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Class Roster</h2>
                    <p className="text-slate-500 text-sm">Manage student profiles and assessments.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button 
                        onClick={() => setIsBulkAssessmentOpen(true)}
                        className="flex-1 sm:flex-none px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition active:scale-95 flex items-center justify-center gap-2 shadow-sm"
                    >
                        <Icon name="benchmark" className="w-4 h-4 text-indigo-500" />
                        <span>Batch Entry</span>
                    </button>
                    <button 
                        onClick={() => setIsAddStudentModalOpen(true)}
                        className="flex-1 sm:flex-none px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Icon name="plus" className="w-4 h-4" />
                        <span>Add Student</span>
                    </button>
                </div>
            </div>
            
            {/* Student Grid */}
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
                    <p className="text-slate-500 font-medium">No students found.</p>
                </div>
            )}

            <BulkAssessmentModal 
                isOpen={isBulkAssessmentOpen} 
                onClose={() => setIsBulkAssessmentOpen(false)} 
            />

            <AddStudentModal
                isOpen={isAddStudentModalOpen}
                onClose={() => setIsAddStudentModalOpen(false)}
            />
        </div>
    );
};
