import React, { useState, useEffect, useMemo, useTransition, useRef } from 'react';
import { Student, VelocityBand } from '../types';
import { StudentCard } from '../components/students/StudentCard';
import { StudentProfile } from '../components/students/StudentProfile';
import { useStudents } from '../context/StudentContext';
import { useNavigation } from '../context/NavigationContext';
import { Icon } from '../components/common/Icon';
import { AddStudentModal } from '../components/students/AddStudentModal';
import { StudentCardSkeleton } from '../components/common/Skeleton';
import { useToast } from '../context/ToastContext';

export const StudentsTab: React.FC = () => {
    const { students, addStudentsBulk } = useStudents();
    const { selectedStudentId, setSelectedStudentId, setBulkEntryOpen } = useNavigation();
    const { showToast } = useToast();
    
    const [isPending, startTransition] = useTransition();
    const [searchTerm, setSearchTerm] = useState('');
    const [deferredSearch, setDeferredSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name');

    const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 300);
        return () => clearTimeout(timer);
    }, [students.length]);

    // Parse and handle sorting alongside filtering
    const filteredAndSortedStudents = useMemo(() => {
        let result = students.filter(student => 
            student.name.toLowerCase().includes(deferredSearch.toLowerCase())
        );

        // Status filter matching 3 designated bands
        if (statusFilter !== 'all') {
            result = result.filter(student => {
                const isFast = student.growthVelocity >= 10 || student.velocityBand === VelocityBand.Fast;
                const isAtRisk = student.growthVelocity < 0 || student.velocityBand === VelocityBand.AtRisk || student.hasAnomaly;
                
                if (statusFilter === 'fast') return isFast;
                if (statusFilter === 'at-risk') return isAtRisk;
                if (statusFilter === 'stable') return !isFast && !isAtRisk;
                return true;
            });
        }

        // Standard robust sorting sequence
        return [...result].sort((a, b) => {
            if (sortBy === 'name') {
                return a.name.localeCompare(b.name);
            }
            if (sortBy === 'growth') {
                return b.growthVelocity - a.growthVelocity;
            }
            if (sortBy === 'score') {
                const aLatest = a.assessments[a.assessments.length - 1];
                const bLatest = b.assessments[b.assessments.length - 1];
                
                const aScores = aLatest ? Object.values(aLatest.scores).filter(s => typeof s === 'number') : [];
                const bScores = bLatest ? Object.values(bLatest.scores).filter(s => typeof s === 'number') : [];
                
                const aAvg = aScores.length > 0 ? aScores.reduce((x, y) => x + y, 0) / aScores.length : 0;
                const bAvg = bScores.length > 0 ? bScores.reduce((x, y) => x + y, 0) / bScores.length : 0;
                
                return bAvg - aAvg;
            }
            return 0;
        });
    }, [students, deferredSearch, statusFilter, sortBy]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const text = event.target?.result as string;
                const names = text.split('\n')
                    .map(line => line.split(',')[0].trim())
                    .filter(name => name.length > 0 && name.toLowerCase() !== 'name'); // skip header
                
                if (names.length > 0) {
                    await addStudentsBulk(names);
                    showToast(`Successfully imported ${names.length} students.`, 'success');
                } else {
                    showToast("No valid names found in CSV.", 'error');
                }
            } catch (error) {
                showToast("Failed to parse CSV file.", 'error');
            }
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsText(file);
    };

    if (selectedStudentId) {
        const selectedStudent = students.find(s => s.id === selectedStudentId);
        if (selectedStudent) {
            return <StudentProfile student={selectedStudent} onBack={() => setSelectedStudentId(null)} />;
        }
    }

    return (
        <div className="p-6 md:p-10 h-full max-w-[1600px] mx-auto overflow-y-auto pb-32 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            
            {/* Redesigned minimal swiss-style header containing filtering toolbelt */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-6 pb-6 border-b border-[oklch(0.60_0_0_/_0.15)] select-none">
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold text-white tracking-tight">Student Roster</h2>
                    <p className="text-xs text-[oklch(0.60_0_0)] font-sans">Track and manage student learning profiles, test periods, and overall velocity.</p>
                </div>
                
                {/* Plain, dense elements input group */}
                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                    {/* Search Field */}
                    <div className="relative flex items-center bg-[oklch(0.14_0.01_250)] border border-[oklch(0.60_0_0_/_0.15)] rounded-[4px] focus-within:border-[oklch(0.72_0.18_145)] transition-colors h-10 w-full sm:w-56">
                        <Icon name="search" className={`w-4 h-4 ml-3 shrink-0 ${isPending ? 'text-[oklch(0.72_0.18_145)] animate-pulse' : 'text-[oklch(0.60_0_0)]'}`} />
                        <input 
                            type="text" 
                            placeholder="Search roster..." 
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                startTransition(() => setDeferredSearch(e.target.value));
                            }}
                            className="bg-transparent border-none outline-none text-sm text-[oklch(0.97_0_0)] placeholder-[oklch(0.60_0_0_/_0.5)] pl-2 pr-8 w-full h-full font-sans focus:ring-0 focus:outline-none"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => {
                                    setSearchTerm('');
                                    startTransition(() => setDeferredSearch(''));
                                }}
                                className="absolute right-3 text-[oklch(0.60_0_0)] hover:text-white transition-colors"
                            >
                                <Icon name="close" className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Status Filter matching exactly 3 bands */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-10 px-3 bg-[oklch(0.14_0.01_250)] border border-[oklch(0.60_0_0_/_0.15)] text-[oklch(0.97_0_0)] text-sm rounded-[4px] focus:outline-none focus:border-[oklch(0.72_0.18_145)] transition-colors font-sans cursor-pointer min-w-[130px] sm:w-auto"
                    >
                        <option value="all">All statuses</option>
                        <option value="fast">Fast Track</option>
                        <option value="stable">Stable</option>
                        <option value="at-risk">At Risk</option>
                    </select>

                    {/* Sort Select */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="h-10 px-3 bg-[oklch(0.14_0.01_250)] border border-[oklch(0.60_0_0_/_0.15)] text-[oklch(0.97_0_0)] text-sm rounded-[4px] focus:outline-none focus:border-[oklch(0.72_0.18_145)] transition-colors font-sans cursor-pointer min-w-[130px] sm:w-auto"
                    >
                        <option value="name">Sort by Name</option>
                        <option value="growth">Sort by Growth</option>
                        <option value="score">Sort by Score</option>
                    </select>

                    <input 
                        type="file" 
                        accept=".csv" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        className="hidden" 
                    />
                    
                    <button 
                        onClick={() => fileInputRef.current?.click()} 
                        className="bg-[oklch(0.14_0.01_250)] border border-[oklch(0.60_0_0_/_0.15)] text-white hover:bg-[oklch(0.18_0.01_250)] font-sans font-normal rounded-[4px] h-10 px-4 flex items-center justify-center gap-2 active:scale-95 transition-all text-sm"
                    >
                        <Icon name="upload" className="w-4 h-4 text-[oklch(0.72_0.18_145)]" />
                        Import CSV
                    </button>
                    
                    <button 
                        onClick={() => setBulkEntryOpen(true)} 
                        className="bg-[oklch(0.14_0.01_250)] border border-[oklch(0.60_0_0_/_0.15)] text-white hover:bg-[oklch(0.18_0.01_250)] font-sans font-normal rounded-[4px] h-10 px-4 flex items-center justify-center gap-2 active:scale-95 transition-all text-sm"
                    >
                        <Icon name="benchmark" className="w-4 h-4 text-[oklch(0.72_0.18_145)]" />
                        Bulk Entry
                    </button>
                    
                    <button 
                        onClick={() => setIsAddStudentModalOpen(true)} 
                        className="bg-[oklch(0.72_0.18_145)] text-zinc-950 font-sans font-semibold rounded-[4px] h-10 px-4 flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all text-sm w-full sm:w-auto"
                    >
                        <Icon name="plus" className="w-4 h-4 text-zinc-950" strokeWidth={2.5} />
                        New Profile
                    </button>
                </div>
            </div>

            {/* Loading state rendering modular skeleton panels */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {[...Array(10)].map((_, i) => <StudentCardSkeleton key={i} />)}
                </div>
            ) : filteredAndSortedStudents.length > 0 ? (
                /* Dense, clean grid flow showcasing redesigned cards */
                <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 transition-all duration-300 ${isPending ? 'opacity-30' : 'opacity-100'}`}>
                    {filteredAndSortedStudents.map(student => (
                        <StudentCard 
                            key={student.id} 
                            student={student} 
                            onClick={() => setSelectedStudentId(student.id)} 
                        />
                    ))}
                </div>
            ) : (
                /* Compliant empty state: one sentence, one action button, no artwork slop */
                <div className="flex flex-col items-center justify-center py-24 text-center border border-[oklch(0.60_0_0_/_0.15)] bg-[oklch(0.14_0.01_250)] p-8">
                    <p className="text-zinc-400 font-sans text-sm mb-6">No matching student profiles found in this roster.</p>
                    <button 
                        onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('all');
                            startTransition(() => {
                                setDeferredSearch('');
                            });
                        }} 
                        className="px-5 py-2.5 bg-[oklch(0.72_0.18_145)] text-zinc-950 rounded-[4px] font-semibold text-xs transition hover:brightness-110 active:scale-95"
                    >
                        Clear Filters
                    </button>
                </div>
            )}

            <AddStudentModal isOpen={isAddStudentModalOpen} onClose={() => setIsAddStudentModalOpen(false)} />
        </div>
    );
};
