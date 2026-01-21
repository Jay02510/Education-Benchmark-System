
import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { Student } from '../types';
import { StudentCard } from '../components/students/StudentCard';
import { StudentProfile } from '../components/students/StudentProfile';
import { useStudents } from '../context/StudentContext';
import { useNavigation } from '../context/NavigationContext';
import { Icon } from '../components/common/Icon';
import { AddStudentModal } from '../components/students/AddStudentModal';
import { StudentCardSkeleton } from '../components/common/Skeleton';
import { Modal } from '../components/common/Modal';

export const StudentsTab: React.FC = () => {
    const { students, classProfile, updateClassProfile } = useStudents();
    const { selectedStudentId, setSelectedStudentId, setBulkEntryOpen } = useNavigation();
    
    const [isPending, startTransition] = useTransition();
    const [searchTerm, setSearchTerm] = useState('');
    const [deferredSearch, setDeferredSearch] = useState('');

    const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
    const [isEditClassModalOpen, setIsEditClassModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

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

    return (
        <div className="p-6 md:p-12 h-full max-w-[1920px] mx-auto overflow-y-auto pb-32 scrollbar-thin scrollbar-thumb-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
                <div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2 uppercase italic">Student Roster</h1>
                    <p className="text-slate-400 font-bold text-lg italic">Management layer for institutional cohorts.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 ring-4 ring-slate-50 transition-all focus-within:ring-indigo-50">
                        <Icon name="search" className={`w-5 h-5 ml-3 transition-colors ${isPending ? 'text-indigo-500 animate-pulse' : 'text-slate-300'}`} />
                        <input 
                            type="text" 
                            placeholder="Search roster..." 
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                startTransition(() => setDeferredSearch(e.target.value));
                            }}
                            className="bg-transparent border-none focus:ring-0 text-sm font-black text-slate-700 placeholder-slate-200 w-48 md:w-64"
                        />
                    </div>
                    <button onClick={() => setBulkEntryOpen(true)} className="px-6 py-4 bg-white border-2 border-slate-100 text-slate-800 rounded-2xl font-black hover:bg-slate-50 transition flex items-center justify-center gap-3 shadow-sm active:scale-95 text-xs uppercase tracking-widest">
                        <Icon name="benchmark" className="w-4 h-4 text-indigo-500" />
                        Bulk Entry
                    </button>
                    <button onClick={() => setIsAddStudentModalOpen(true)} className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-indigo-600 transition shadow-2xl flex items-center justify-center gap-3 active:scale-95 text-xs uppercase tracking-widest border-b-4 border-slate-950">
                        <Icon name="plus" className="w-4 h-4" />
                        New Profile
                    </button>
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

            <AddStudentModal isOpen={isAddStudentModalOpen} onClose={() => setIsAddStudentModalOpen(false)} />
        </div>
    );
};
