
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student, ClassProfile, Assessment, Resource, Intervention, Trend, Domain, StudentLogEntry, TestPeriod } from '../types';
import { mockStudents } from '../data/mockData';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { 
    collection, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    query, 
    where, 
    onSnapshot,
    writeBatch,
    setDoc,
    getDocs
} from 'firebase/firestore';

interface StudentContextType {
    students: Student[];
    classProfile: ClassProfile | null;
    registerClass: (profile: ClassProfile) => void;
    addStudent: (student: Student) => void;
    addStudentsBulk: (names: string[]) => void;
    updateStudent: (updatedStudent: Student) => void;
    deleteStudent: (id: string) => void;
    addAssessmentBulk: (assessments: { studentId: string, assessment: Assessment }[]) => Promise<void>;
    updateAssessmentForStudent: (studentId: string, assessment: Assessment) => Promise<void>;
    deleteAssessmentForStudent: (studentId: string, assessmentId: string) => Promise<void>;
    updateClassProfile: (updates: Partial<ClassProfile>) => Promise<void>;
    addLogEntry: (studentId: string, entry: Omit<StudentLogEntry, 'id'>) => Promise<void>;
    loadDemoData: () => void;
    
    aiInsights: Record<string, { report_card: string, trend_insights: string }>;
    aiSuggestions: Record<string, Resource[]>;
    saveAiAnalysis: (studentId: string, data: { report_card: string, trend_insights: string }) => void;
    saveAiSuggestions: (studentId: string, resources: Resource[]) => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

const getStorageKey = (userId: string, type: 'students' | 'profile') => `benchmark_${type}_${userId}`;

const getAvgScore = (assessment: Assessment | undefined): number => {
    if (!assessment) return 0;
    const scores = Object.values(assessment.scores).filter(s => typeof s === 'number');
    if (scores.length === 0) return 0;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
};

const calculateVelocity = (assessments: Assessment[]): number => {
    if (assessments.length < 2) return 0;
    const sorted = [...assessments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latest = sorted[sorted.length - 1];
    const previous = sorted[sorted.length - 2];
    const latestAvg = getAvgScore(latest);
    const prevAvg = getAvgScore(previous);
    return Math.round(latestAvg - prevAvg);
};

const calculateRTIStatus = (assessments: Assessment[]): Intervention | null => {
    if (assessments.length === 0) return null;
    const sorted = [...assessments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latest = sorted[sorted.length - 1];
    const previous = sorted.length > 1 ? sorted[sorted.length - 2] : null;
    const avg = getAvgScore(latest);
    const domainEntries = Object.entries(latest.scores) as [Domain, number][];

    if (avg < 50) return { tier: 3, domain: "General" as any, goal: "Critical intensive support.", trend: Trend.Down, triggerReason: `Critical Avg: ${Math.round(avg)}%`, dateIdentified: new Date().toISOString() };
    
    const weakDomain = domainEntries.find(([_, s]) => s < 65);
    if (weakDomain) return { tier: 2, domain: weakDomain[0], goal: `Remedial ${weakDomain[0]} focus.`, trend: Trend.Stable, triggerReason: `${weakDomain[0]} under 65%`, dateIdentified: new Date().toISOString() };

    if (previous) {
        const prevAvg = getAvgScore(previous);
        if (avg < prevAvg - 8) return { tier: 2, domain: "General" as any, goal: "Address sudden regression.", trend: Trend.Down, triggerReason: `Regression: -${Math.round(prevAvg - avg)}%`, dateIdentified: new Date().toISOString() };
    }
    return null;
};

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [classProfile, setClassProfile] = useState<ClassProfile | null>(null);
    const { showToast } = useToast();
    const [aiInsights, setAiInsights] = useState<Record<string, { report_card: string, trend_insights: string }>>({});
    const [aiSuggestions, setAiSuggestions] = useState<Record<string, Resource[]>>({});

    const saveAiAnalysis = (studentId: string, data: { report_card: string, trend_insights: string }) => setAiInsights(prev => ({ ...prev, [studentId]: data }));
    const saveAiSuggestions = (studentId: string, resources: Resource[]) => setAiSuggestions(prev => ({ ...prev, [studentId]: resources }));

    useEffect(() => {
        if (!user) { setStudents([]); setClassProfile(null); return; }
        const sKey = getStorageKey(user.id, 'students');
        const pKey = getStorageKey(user.id, 'profile');

        if (user.isDemo) {
            const localStudents = localStorage.getItem(sKey);
            const localProfile = localStorage.getItem(pKey);
            if (localStudents) setStudents(JSON.parse(localStudents));
            if (localProfile) setClassProfile(JSON.parse(localProfile));
        } else {
            const qStudents = query(collection(db, 'students'), where('userId', '==', user.id));
            const unsubStudents = onSnapshot(qStudents, (snapshot) => {
                setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[]);
            });
            const qProfile = query(collection(db, 'class_profiles'), where('userId', '==', user.id));
            const unsubProfile = onSnapshot(qProfile, (snapshot) => {
                if (!snapshot.empty) setClassProfile({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as ClassProfile);
            });
            return () => { unsubStudents(); unsubProfile(); };
        }
    }, [user]);

    const syncStudentsLocally = (updateFn: (prev: Student[]) => Student[]) => {
        setStudents(prev => {
            const next = updateFn(prev);
            if (user && user.isDemo) {
                localStorage.setItem(getStorageKey(user.id, 'students'), JSON.stringify(next));
            }
            return next;
        });
    };

    const registerClass = async (profile: ClassProfile) => {
        if (user?.isDemo) { 
            setClassProfile(profile); 
            localStorage.setItem(getStorageKey(user.id, 'profile'), JSON.stringify(profile)); 
            return; 
        }
        await addDoc(collection(db, 'class_profiles'), { ...profile, userId: user?.id });
    };

    const updateClassProfile = async (updates: Partial<ClassProfile>) => {
        if (!classProfile || !user) return;
        const updatedProfile = { ...classProfile, ...updates };
        setClassProfile(updatedProfile);
        if (user.isDemo) { 
            // Fixed line 139: Argument of type function is not assignable to string
            localStorage.setItem(getStorageKey(user.id, 'profile'), JSON.stringify(updatedProfile));
        } else {
            await updateDoc(doc(db, 'class_profiles', classProfile.id), updates);
        }
        showToast("Class profile updated.");
    };

    const addStudent = async (student: Student) => {
        if (!user) return;
        if (user.isDemo) {
            syncStudentsLocally(prev => [...prev, student]);
            showToast("Student added.");
            return;
        }
        const { id, ...data } = student;
        await addDoc(collection(db, 'students'), { ...data, userId: user.id });
        showToast("Student added.");
    };

    const addStudentsBulk = async (names: string[]) => {
        if (!user) return;
        const newStudents = names.map(name => ({
            id: `s-${Date.now()}-${Math.random()}`,
            name,
            level: classProfile?.gradeLevel || '5',
            class: classProfile?.className || 'General',
            photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
            overallGrowth: 0,
            growthVelocity: 0,
            hasAnomaly: false,
            assessments: [],
            interventionStatus: null,
            actionLog: [],
        }));

        if (user.isDemo) {
            syncStudentsLocally(prev => [...prev, ...newStudents]);
            showToast(`${names.length} students added.`);
            return;
        }

        const batch = writeBatch(db);
        newStudents.forEach(s => {
            const ref = doc(collection(db, 'students'));
            const { id, ...data } = s;
            batch.set(ref, { ...data, userId: user.id });
        });
        await batch.commit();
        showToast(`${names.length} students added.`);
    };

    const updateStudent = async (updatedStudent: Student) => {
        if (!user) return;
        if (user.isDemo) {
            syncStudentsLocally(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
            return;
        }
        const { id, ...data } = updatedStudent;
        await updateDoc(doc(db, 'students', id), data as any);
    };

    const deleteStudent = async (id: string) => {
        if (!user) return;
        if (user.isDemo) {
            syncStudentsLocally(prev => prev.filter(s => s.id !== id));
            showToast("Student deleted.");
            return;
        }
        await deleteDoc(doc(db, 'students', id));
        showToast("Student deleted.");
    };

    const updateAssessmentForStudent = async (studentId: string, assessment: Assessment) => {
        if (!user) return;
        const student = students.find(s => s.id === studentId);
        if (!student) return;

        let newAssessments = [...student.assessments];
        const idx = newAssessments.findIndex(a => a.id === assessment.id);
        if (idx > -1) newAssessments[idx] = assessment;
        else newAssessments.push(assessment);

        const velocity = calculateVelocity(newAssessments);
        const intervention = calculateRTIStatus(newAssessments);
        const sorted = [...newAssessments].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const growth = sorted.length >= 2 ? getAvgScore(sorted[sorted.length-1]) - getAvgScore(sorted[0]) : 0;

        const updatedStudent = { 
            ...student, 
            assessments: newAssessments, 
            growthVelocity: velocity, 
            interventionStatus: intervention,
            overallGrowth: Math.round(growth),
            hasAnomaly: intervention !== null
        };

        if (user.isDemo) {
            syncStudentsLocally(prev => prev.map(s => s.id === studentId ? updatedStudent : s));
            showToast("Assessment updated.");
            return;
        }
        const { id, ...data } = updatedStudent;
        await updateDoc(doc(db, 'students', studentId), data as any);
    };

    const addAssessmentBulk = async (bulkData: { studentId: string, assessment: Assessment }[]) => {
        if (!user) return;
        if (user.isDemo) {
            syncStudentsLocally(prev => {
                return prev.map(student => {
                    const update = bulkData.find(d => d.studentId === student.id);
                    if (!update) return student;

                    const newAssessments = [...student.assessments, update.assessment];
                    const velocity = calculateVelocity(newAssessments);
                    const intervention = calculateRTIStatus(newAssessments);
                    const sorted = [...newAssessments].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    const growth = sorted.length >= 2 ? getAvgScore(sorted[sorted.length-1]) - getAvgScore(sorted[0]) : 0;

                    return {
                        ...student,
                        assessments: newAssessments,
                        growthVelocity: velocity,
                        interventionStatus: intervention,
                        overallGrowth: Math.round(growth),
                        hasAnomaly: intervention !== null
                    };
                });
            });
            showToast("Bulk assessments recorded.");
            return;
        }

        const batch = writeBatch(db);
        bulkData.forEach(update => {
            const student = students.find(s => s.id === update.studentId);
            if (student) {
                const newAssessments = [...student.assessments, update.assessment];
                const velocity = calculateVelocity(newAssessments);
                const intervention = calculateRTIStatus(newAssessments);
                const sorted = [...newAssessments].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                const growth = sorted.length >= 2 ? getAvgScore(sorted[sorted.length-1]) - getAvgScore(sorted[0]) : 0;

                const updatedData = {
                    assessments: newAssessments,
                    growthVelocity: velocity,
                    interventionStatus: intervention,
                    overallGrowth: Math.round(growth),
                    hasAnomaly: intervention !== null
                };
                batch.update(doc(db, 'students', student.id), updatedData);
            }
        });
        await batch.commit();
        showToast("Bulk assessments recorded.");
    };

    const deleteAssessmentForStudent = async (studentId: string, assessmentId: string) => {
        if (!user) return;
        const student = students.find(s => s.id === studentId);
        if (!student) return;

        const newAssessments = student.assessments.filter(a => a.id !== assessmentId);
        const velocity = calculateVelocity(newAssessments);
        const intervention = calculateRTIStatus(newAssessments);
        const sorted = [...newAssessments].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const growth = sorted.length >= 2 ? getAvgScore(sorted[sorted.length-1]) - getAvgScore(sorted[0]) : 0;

        const updatedStudent = { 
            ...student, 
            assessments: newAssessments, 
            growthVelocity: velocity, 
            interventionStatus: intervention,
            overallGrowth: Math.round(growth),
            hasAnomaly: intervention !== null
        };

        if (user.isDemo) {
            syncStudentsLocally(prev => prev.map(s => s.id === studentId ? updatedStudent : s));
            return;
        }
        const { id, ...data } = updatedStudent;
        await updateDoc(doc(db, 'students', studentId), data as any);
    };

    const addLogEntry = async (studentId: string, entry: Omit<StudentLogEntry, 'id'>) => {
        if (!user) return;
        const student = students.find(s => s.id === studentId);
        if (!student) return;

        const newLog = [...(student.actionLog || []), { ...entry, id: `log-${Date.now()}` }];
        const updatedStudent = { ...student, actionLog: newLog };

        if (user.isDemo) {
            syncStudentsLocally(prev => prev.map(s => s.id === studentId ? updatedStudent : s));
            showToast("Note logged.");
            return;
        }
        await updateDoc(doc(db, 'students', studentId), { actionLog: newLog });
        showToast("Note logged.");
    };

    const loadDemoData = () => {
        if (!user) return;
        const sKey = getStorageKey(user.id, 'students');
        const pKey = getStorageKey(user.id, 'profile');
        
        setStudents(mockStudents);
        const profile = { id: 'demo-p', className: 'Demo Class', gradeLevel: '5', academicYear: '2024' };
        setClassProfile(profile);
        
        if (user.isDemo) {
            localStorage.setItem(sKey, JSON.stringify(mockStudents));
            localStorage.setItem(pKey, JSON.stringify(profile));
        }
        showToast("Demo data loaded!");
    };

    return (
        <StudentContext.Provider value={{ 
            students, classProfile, registerClass, addStudent, addStudentsBulk, 
            updateStudent, deleteStudent, addAssessmentBulk, updateAssessmentForStudent, 
            deleteAssessmentForStudent, updateClassProfile, addLogEntry, loadDemoData,
            aiInsights, aiSuggestions, saveAiAnalysis, saveAiSuggestions
        }}>
            {children}
        </StudentContext.Provider>
    );
};

// Export useStudents hook to fix missing export errors
export const useStudents = () => {
    const context = useContext(StudentContext);
    if (context === undefined) {
        throw new Error('useStudents must be used within a StudentProvider');
    }
    return context;
};
