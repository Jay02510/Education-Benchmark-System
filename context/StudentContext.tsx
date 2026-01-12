
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student, ClassProfile, Assessment, Resource, Intervention, Trend, Domain, StudentLogEntry } from '../types';
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
    addAssessmentBulk: (assessments: { studentId: string, assessment: Assessment }[]) => void;
    updateAssessmentForStudent: (studentId: string, assessment: Assessment) => Promise<void>;
    updateClassProfile: (updates: Partial<ClassProfile>) => Promise<void>;
    addLogEntry: (studentId: string, entry: Omit<StudentLogEntry, 'id'>) => Promise<void>;
    loadDemoData: () => void;
    
    aiInsights: Record<string, { report_card: string, trend_insights: string }>;
    aiSuggestions: Record<string, Resource[]>;
    saveAiAnalysis: (studentId: string, data: { report_card: string, trend_insights: string }) => void;
    saveAiSuggestions: (studentId: string, resources: Resource[]) => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

const calculateVelocity = (assessments: Assessment[]): number => {
    if (assessments.length < 2) return 0;
    const sorted = [...assessments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latest = sorted[sorted.length - 1];
    const previous = sorted[sorted.length - 2];
    
    const latestAvg = Object.values(latest.scores).reduce((a: number, b: number) => a + b, 0) / Object.keys(latest.scores).length;
    const prevAvg = Object.values(previous.scores).reduce((a: number, b: number) => a + b, 0) / Object.keys(previous.scores).length;
    
    return Math.round(latestAvg - prevAvg);
};

const calculateRTIStatus = (assessments: Assessment[]): Intervention | null => {
    if (assessments.length === 0) return null;
    const sorted = [...assessments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latest = sorted[sorted.length - 1];
    const previous = sorted.length > 1 ? sorted[sorted.length - 2] : null;
    const scores = Object.values(latest.scores) as number[];
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const domainEntries = Object.entries(latest.scores) as [Domain, number][];

    if (avg < 50) return { tier: 3, domain: "General", goal: "Critical intensive support.", trend: Trend.Down, triggerReason: `Critical Avg: ${Math.round(avg)}%`, dateIdentified: new Date().toISOString() };
    
    const weakDomain = domainEntries.find(([_, s]) => s < 65);
    if (weakDomain) return { tier: 2, domain: weakDomain[0], goal: `Remedial ${weakDomain[0]} focus.`, trend: Trend.Stable, triggerReason: `${weakDomain[0]} under 65%`, dateIdentified: new Date().toISOString() };

    if (previous) {
        const prevAvg = Object.values(previous.scores).reduce((a: number, b: number) => a + b, 0) / Object.keys(previous.scores).length;
        if (avg < prevAvg - 8) return { tier: 2, domain: "General", goal: "Address sudden regression.", trend: Trend.Down, triggerReason: `Regression: -${Math.round(prevAvg - avg)}%`, dateIdentified: new Date().toISOString() };
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

        if (user.isDemo) {
            const localStudents = localStorage.getItem('demo_students');
            const localProfile = localStorage.getItem('demo_classProfile');
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

    const syncStudents = (newStudents: Student[]) => {
        setStudents(newStudents);
        if (user?.isDemo) localStorage.setItem('demo_students', JSON.stringify(newStudents));
    };

    const addLogEntry = async (studentId: string, entry: Omit<StudentLogEntry, 'id'>) => {
        const newEntry: StudentLogEntry = { ...entry, id: `log-${Date.now()}` };
        const student = students.find(s => s.id === studentId);
        if (!student) return;

        const updatedStudent = { ...student, actionLog: [newEntry, ...(student.actionLog || [])] };
        
        if (user?.isDemo) {
            syncStudents(students.map(s => s.id === studentId ? updatedStudent : s));
            showToast("Log entry saved.");
        } else {
            await updateDoc(doc(db, 'students', studentId), { actionLog: updatedStudent.actionLog });
        }
    };

    const registerClass = async (profile: ClassProfile) => {
        if (user?.isDemo) { setClassProfile(profile); localStorage.setItem('demo_classProfile', JSON.stringify(profile)); return; }
        await addDoc(collection(db, 'class_profiles'), { ...profile, userId: user?.id });
    };

    const updateClassProfile = async (updates: Partial<ClassProfile>) => {
        if (!classProfile) return;
        const updated = { ...classProfile, ...updates };
        // Update local state immediately for responsive UI
        setClassProfile(updated);
        if (user?.isDemo) { 
            localStorage.setItem('demo_classProfile', JSON.stringify(updated)); 
            return; 
        }
        await updateDoc(doc(db, 'class_profiles', classProfile.id), updates);
        showToast("Class profile updated.");
    };

    const addStudent = async (student: Student) => {
        const studentWithLog = { ...student, actionLog: student.actionLog || [] };
        if (user?.isDemo) { syncStudents([...students, studentWithLog]); return; }
        
        const newDocRef = doc(collection(db, 'students'));
        const { id, ...data } = studentWithLog;
        await setDoc(newDocRef, { ...data, userId: user?.id });
    };

    const addStudentsBulk = async (names: string[]) => {
        const newStudents = names.map(name => ({
            id: `s-${Date.now()}-${Math.random()}`,
            name: name.trim(),
            level: classProfile?.gradeLevel || '5',
            class: classProfile?.className || 'General',
            photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
            overallGrowth: 0,
            growthVelocity: 0,
            hasAnomaly: false,
            assessments: [],
            interventionStatus: null,
            actionLog: []
        })) as Student[];
        
        if (user?.isDemo) { syncStudents([...students, ...newStudents]); return; }
        const batch = writeBatch(db);
        newStudents.forEach(s => {
            const { id, ...data } = s;
            const newDocRef = doc(collection(db, 'students'));
            batch.set(newDocRef, { ...data, userId: user?.id });
        });
        await batch.commit();
    };

    const updateStudent = async (updated: Student) => {
        if (user?.isDemo) { syncStudents(students.map(s => s.id === updated.id ? updated : s)); return; }
        const { id, ...data } = updated;
        await updateDoc(doc(db, 'students', updated.id), data);
        showToast("Profile updated.");
    };

    const deleteStudent = async (id: string) => {
        if (user?.isDemo) { syncStudents(students.filter(s => s.id !== id)); return; }
        await deleteDoc(doc(db, 'students', id));
    };

    const updateAssessmentForStudent = async (studentId: string, assessment: Assessment) => {
        const student = students.find(s => s.id === studentId);
        if (!student) return;

        let assessments = [...student.assessments];
        const idx = assessments.findIndex(a => a.id === assessment.id);
        if (idx !== -1) assessments[idx] = assessment; else assessments.push(assessment);
        assessments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const velocity = calculateVelocity(assessments);
        const first = assessments[0]?.scores.Reading || 0;
        const last = assessments[assessments.length - 1]?.scores.Reading || 0;
        const growth = last - first;
        const rti = calculateRTIStatus(assessments);

        const payload = { assessments, overallGrowth: growth, growthVelocity: velocity, interventionStatus: rti, hasAnomaly: !!rti };
        if (user?.isDemo) { syncStudents(students.map(s => s.id === studentId ? { ...student, ...payload } : s)); return; }
        await updateDoc(doc(db, 'students', studentId), payload);
    };

    const addAssessmentBulk = async (items: { studentId: string, assessment: Assessment }[]) => {
        const batch = user?.isDemo ? null : writeBatch(db);
        const updatedStudents = [...students];

        items.forEach(item => {
            const sIdx = updatedStudents.findIndex(s => s.id === item.studentId);
            if (sIdx === -1) return;
            const s = updatedStudents[sIdx];
            let assessments = [...s.assessments, item.assessment].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            const vel = calculateVelocity(assessments);
            const rti = calculateRTIStatus(assessments);
            const payload = { assessments, growthVelocity: vel, interventionStatus: rti, hasAnomaly: !!rti };
            
            if (batch) batch.update(doc(db, 'students', s.id), payload);
            updatedStudents[sIdx] = { ...s, ...payload };
        });

        if (batch) await batch.commit(); else syncStudents(updatedStudents);
    };

    const loadDemoData = () => {
        const demoProfile = { id: 'demo-p', className: 'Class A (Demo)', gradeLevel: '5', academicYear: '2023-24' };
        const demoStudents = mockStudents.map(s => ({ ...s, id: `demo-${s.id}`, actionLog: [] }));
        if (user?.isDemo) {
            localStorage.setItem('demo_classProfile', JSON.stringify(demoProfile));
            syncStudents(demoStudents);
            setClassProfile(demoProfile);
        }
    };

    return (
        <StudentContext.Provider value={{ 
            students, classProfile, registerClass, addStudent, addStudentsBulk, updateStudent, 
            deleteStudent, addAssessmentBulk, updateAssessmentForStudent, updateClassProfile, addLogEntry,
            loadDemoData, aiInsights, aiSuggestions, saveAiAnalysis, saveAiSuggestions 
        }}>
            {children}
        </StudentContext.Provider>
    );
};

export const useStudents = () => {
    const context = useContext(StudentContext);
    if (!context) throw new Error('useStudents must be used within a StudentProvider');
    return context;
};
