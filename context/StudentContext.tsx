import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student, ClassProfile, Assessment, Resource, Intervention, Trend, Domain, StudentLogEntry, TestPeriod } from '../types.ts';
import { mockStudents } from '../data/mockData.ts';
import { useToast } from './ToastContext.tsx';
import { useAuth } from './AuthContext.tsx';
import { useBenchmarks } from './BenchmarkContext.tsx';
import { db } from '../firebase.ts';
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
    setDoc
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

const calculateRTIStatus = (assessments: Assessment[], thresholds: Record<TestPeriod, number>): Intervention | null => {
    if (assessments.length === 0) return null;
    const sorted = [...assessments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latest = sorted[sorted.length - 1];
    const previous = sorted.length > 1 ? sorted[sorted.length - 2] : null;
    const avg = getAvgScore(latest);
    const domainEntries = Object.entries(latest.scores) as [Domain, number][];
    
    const currentPeriodThreshold = thresholds[latest.type] || 65;

    if (avg < currentPeriodThreshold - 20) {
        return { 
            tier: 3, 
            domain: "General" as any, 
            goal: `Critical support needed for ${latest.type} milestone.`, 
            trend: Trend.Down, 
            triggerReason: `Below Threshold: ${Math.round(avg)}% vs Required ${currentPeriodThreshold}%`, 
            dateIdentified: new Date().toISOString() 
        };
    }
    
    if (avg < currentPeriodThreshold) {
        return { 
            tier: 2, 
            domain: "General" as any, 
            goal: `Bridge performance gap for ${latest.type} targets.`, 
            trend: Trend.Stable, 
            triggerReason: `Target Miss: ${Math.round(avg)}% (Goal: ${currentPeriodThreshold}%)`, 
            dateIdentified: new Date().toISOString() 
        };
    }

    const weakDomain = domainEntries.find(([_, s]) => s < currentPeriodThreshold - 10);
    if (weakDomain) {
        return { 
            tier: 2, 
            domain: weakDomain[0], 
            goal: `Focus on ${weakDomain[0]} development.`, 
            trend: Trend.Stable, 
            triggerReason: `Domain Gap: ${weakDomain[0]} at ${weakDomain[1]}%`, 
            dateIdentified: new Date().toISOString() 
        };
    }

    if (previous) {
        const prevAvg = getAvgScore(previous);
        if (avg < prevAvg - 10) {
            return { 
                tier: 2, 
                domain: "General" as any, 
                goal: "Analyze and address score regression.", 
                trend: Trend.Down, 
                triggerReason: `Rapid Decline: -${Math.round(prevAvg - avg)}% change`, 
                dateIdentified: new Date().toISOString() 
            };
        }
    }
    
    return null;
};

const sortByName = (list: Student[]) => [...list].sort((a, b) => a.name.localeCompare(b.name));

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { thresholds } = useBenchmarks(); 
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
            // In Demo mode, we ONLY load from localStorage. If empty, it stays empty until loadDemoData is called.
            if (localStudents) setStudents(sortByName(JSON.parse(localStudents)));
            if (localProfile) setClassProfile(JSON.parse(localProfile));
        } else {
            // Live Firestore subscription
            const qStudents = query(collection(db, 'students'), where('userId', '==', user.id));
            const unsubStudents = onSnapshot(qStudents, (snapshot) => {
                const raw = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[];
                setStudents(sortByName(raw));
            });
            const qProfile = query(collection(db, 'class_profiles'), where('userId', '==', user.id));
            const unsubProfile = onSnapshot(qProfile, (snapshot) => {
                if (!snapshot.empty) setClassProfile({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as ClassProfile);
            });
            return () => { unsubStudents(); unsubProfile(); };
        }
    }, [user]);

    const syncStudents = (newStudents: Student[]) => {
        const sorted = sortByName(newStudents);
        setStudents(sorted);
        if (user?.isDemo) localStorage.setItem(getStorageKey(user.id, 'students'), JSON.stringify(sorted));
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
        if (user.isDemo) localStorage.setItem(getStorageKey(user.id, 'profile'), JSON.stringify(updatedProfile));
        else await updateDoc(doc(db, 'class_profiles', classProfile.id), updates);
        showToast("Class profile updated.");
    };

    const addStudent = async (student: Student) => {
        if (!user) return;
        const studentWithLog = { ...student, actionLog: student.actionLog || [] };
        if (user.isDemo) {
            syncStudents([...students, studentWithLog]);
            showToast("Student added.");
            return;
        }
        const { id, ...data } = studentWithLog;
        await setDoc(doc(collection(db, 'students')), { ...data, userId: user.id });
        showToast("Student added.");
    };

    const addStudentsBulk = async (names: string[]) => {
        if (!user) return;
        const newStudents = names.map(name => ({
            id: `s-${Date.now()}-${Math.random()}`,
            name: name.trim(),
            level: classProfile?.gradeLevel || '5',
            class: classProfile?.className || 'General',
            photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.trim()}`,
            overallGrowth: 0,
            growthVelocity: 0,
            hasAnomaly: false,
            assessments: [],
            interventionStatus: null,
            actionLog: [],
        })) as Student[];

        if (user.isDemo) {
            syncStudents([...students, ...newStudents]);
            showToast(`${names.length} students added.`);
            return;
        }

        const batch = writeBatch(db);
        newStudents.forEach(s => {
            const { id, ...data } = s;
            batch.set(doc(collection(db, 'students')), { ...data, userId: user.id });
        });
        await batch.commit();
        showToast(`${names.length} students added.`);
    };

    const updateStudent = async (updated: Student) => {
        if (!user) return;
        if (user.isDemo) syncStudents(students.map(s => s.id === updated.id ? updated : s));
        else {
            const { id, ...data } = updated;
            await updateDoc(doc(db, 'students', id), data as any);
        }
    };

    const deleteStudent = async (id: string) => {
        if (!user) return;
        if (user.isDemo) {
            syncStudents(students.filter(s => s.id !== id));
            showToast("Student removed.");
            return;
        }
        await deleteDoc(doc(db, 'students', id));
        showToast("Student removed.");
    };

    const updateAssessmentForStudent = async (studentId: string, assessment: Assessment) => {
        if (!user) return;
        const student = students.find(s => s.id === studentId);
        if (!student) return;

        let assessments = [...student.assessments];
        const idx = assessments.findIndex(a => a.id === assessment.id || (a.type === assessment.type && a.date === assessment.date));
        
        if (idx > -1) assessments[idx] = assessment;
        else assessments.push(assessment);

        assessments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        const velocity = calculateVelocity(assessments);
        const rti = calculateRTIStatus(assessments, thresholds);
        const growth = assessments.length >= 2 ? getAvgScore(assessments[assessments.length-1]) - getAvgScore(assessments[0]) : 0;

        const payload = { 
            assessments, 
            overallGrowth: Math.round(growth), 
            growthVelocity: velocity, 
            interventionStatus: rti, 
            hasAnomaly: !!rti 
        };

        if (user.isDemo) syncStudents(students.map(s => s.id === studentId ? { ...s, ...payload } : s));
        else await updateDoc(doc(db, 'students', studentId), payload);
        showToast("Assessment recorded.");
    };

    const deleteAssessmentForStudent = async (studentId: string, assessmentId: string) => {
        if (!user) return;
        const student = students.find(s => s.id === studentId);
        if (!student) return;

        const assessments = student.assessments.filter(a => a.id !== assessmentId);
        const velocity = calculateVelocity(assessments);
        const rti = calculateRTIStatus(assessments, thresholds);
        const growth = assessments.length >= 2 ? getAvgScore(assessments[assessments.length-1]) - getAvgScore(assessments[0]) : 0;

        const payload = { assessments, overallGrowth: Math.round(growth), growthVelocity: velocity, interventionStatus: rti, hasAnomaly: !!rti };

        if (user.isDemo) syncStudents(students.map(s => s.id === studentId ? { ...s, ...payload } : s));
        else await updateDoc(doc(db, 'students', studentId), payload);
        showToast("Assessment deleted.");
    };

    const addAssessmentBulk = async (items: { studentId: string, assessment: Assessment }[]) => {
        if (!user) return;
        const batch = user.isDemo ? null : writeBatch(db);
        const updatedStudents = [...students];

        items.forEach(item => {
            const sIdx = updatedStudents.findIndex(s => s.id === item.studentId);
            if (sIdx === -1) return;
            const s = updatedStudents[sIdx];
            
            let assessments = [...s.assessments];
            const idx = assessments.findIndex(a => a.type === item.assessment.type);
            
            if (idx !== -1) {
                const existing = assessments[idx];
                assessments[idx] = {
                    ...existing,
                    ...item.assessment,
                    id: existing.id,
                    scores: { ...existing.scores, ...item.assessment.scores },
                    subdomainScores: { ...existing.subdomainScores, ...item.assessment.subdomainScores }
                };
            } else assessments.push(item.assessment);

            assessments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
            const vel = calculateVelocity(assessments);
            const growth = assessments.length >= 2 ? getAvgScore(assessments[assessments.length-1]) - getAvgScore(assessments[0]) : 0;
            const rti = calculateRTIStatus(assessments, thresholds);
            
            const payload = { assessments, overallGrowth: Math.round(growth), growthVelocity: vel, interventionStatus: rti, hasAnomaly: !!rti };

            if (batch) batch.update(doc(db, 'students', s.id), payload);
            updatedStudents[sIdx] = { ...s, ...payload };
        });

        if (batch) await batch.commit();
        else syncStudents(updatedStudents);
        showToast(`Batch sync complete.`);
    };

    const addLogEntry = async (studentId: string, entry: Omit<StudentLogEntry, 'id'>) => {
        if (!user) return;
        const student = students.find(s => s.id === studentId);
        if (!student) return;
        const newLog = [...(student.actionLog || []), { ...entry, id: `log-${Date.now()}` }];
        if (user.isDemo) syncStudents(students.map(s => s.id === studentId ? { ...s, actionLog: newLog } : s));
        else await updateDoc(doc(db, 'students', studentId), { actionLog: newLog });
        showToast("Note recorded.");
    };

    const loadDemoData = () => {
        if (!user) return;
        const profile = { id: 'demo-p', className: 'Sample Classroom', gradeLevel: '5', academicYear: '2024' };
        localStorage.setItem(getStorageKey(user.id, 'profile'), JSON.stringify(profile));
        const sortedMock = sortByName(mockStudents);
        localStorage.setItem(getStorageKey(user.id, 'students'), JSON.stringify(sortedMock));
        setStudents(sortedMock);
        setClassProfile(profile);
        showToast("Demo data initialized.");
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

export const useStudents = () => {
    const context = useContext(StudentContext);
    if (context === undefined) throw new Error('useStudents must be used within a StudentProvider');
    return context;
};