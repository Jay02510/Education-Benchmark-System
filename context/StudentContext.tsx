
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Student, ClassProfile, Assessment, Intervention, Trend, Domain, StudentLogEntry, TestPeriod, SubdomainMetadata, VelocityBand } from '../types.ts';
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
    registerClass: (profile: ClassProfile) => Promise<void>;
    addStudent: (student: Student) => Promise<void>;
    addStudentsBulk: (names: string[]) => Promise<void>;
    updateStudent: (updatedStudent: Student) => Promise<void>;
    deleteStudent: (id: string) => Promise<void>;
    addAssessmentBulk: (assessments: { studentId: string, assessment: Assessment }[]) => Promise<void>;
    updateAssessmentForStudent: (studentId: string, assessment: Assessment) => Promise<void>;
    deleteAssessmentForStudent: (studentId: string, assessmentId: string) => Promise<void>;
    updateClassProfile: (updates: Partial<ClassProfile>) => Promise<void>;
    addLogEntry: (studentId: string, entry: Omit<StudentLogEntry, 'id'>) => Promise<void>;
    loadDemoData: () => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

const getStorageKey = (userId: string, type: 'students' | 'profile') => `benchmark_${type}_${userId}`;

/**
 * SANITIZATION ENGINE
 * Prevents malicious scripts from entering the data layer.
 */
const sanitizeInput = (text: string): string => {
    return text.replace(/[<>]/g, "").trim(); 
};

const getTrueProficiency = (assessment: Assessment | undefined, frameworkSubdomains: Record<string, SubdomainMetadata[]>): number => {
    if (!assessment) return 0;
    const domainPercentages: number[] = [];
    Object.entries(frameworkSubdomains).forEach(([domain, subs]) => {
        let earned = 0;
        let possible = 0;
        let hasData = false;
        subs.forEach(s => {
            const val = assessment.subdomainScores?.[`${domain}:${s.name}`];
            if (typeof val === 'number') {
                earned += val;
                possible += s.maxScore;
                hasData = true;
            }
        });
        if (hasData && possible > 0) {
            domainPercentages.push((earned / possible) * 100);
        }
    });
    if (domainPercentages.length > 0) {
        return Math.round(domainPercentages.reduce((a, b) => a + b, 0) / domainPercentages.length);
    }
    const scores = Object.values(assessment.scores).filter(s => typeof s === 'number' && s > 0);
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
};

const calculateVelocity = (assessments: Assessment[], frameworkSubdomains: Record<string, SubdomainMetadata[]>): number => {
    if (assessments.length < 2) return 0;
    const sorted = [...assessments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latest = sorted[sorted.length - 1];
    const previous = sorted[sorted.length - 2];
    const latestAvg = getTrueProficiency(latest, frameworkSubdomains);
    const prevAvg = getTrueProficiency(previous, frameworkSubdomains);
    return latestAvg - prevAvg;
};

const calculateVelocityBand = (velocity: number): VelocityBand => {
    if (velocity >= 10) return VelocityBand.Fast;
    if (velocity < 0) return VelocityBand.AtRisk;
    return VelocityBand.Stable;
};

const calculateRTIStatus = (assessments: Assessment[], thresholds: Record<TestPeriod, number>, frameworkSubdomains: Record<string, SubdomainMetadata[]>): Intervention | null => {
    if (assessments.length === 0) return null;
    const sorted = [...assessments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latest = sorted[sorted.length - 1];
    const previous = sorted.length > 1 ? sorted[sorted.length - 2] : null;
    const avg = getTrueProficiency(latest, frameworkSubdomains);
    const domainEntries = Object.entries(latest.scores) as [Domain, number][];
    const currentPeriodThreshold = thresholds[latest.type] || 70;
    const weakDomains = domainEntries
        .filter(([_, s]) => s < currentPeriodThreshold && s > 0)
        .map(([d]) => d);

    if (avg < currentPeriodThreshold - 15) {
        return { 
            tier: 3, 
            domain: "General" as any, 
            goal: `Intensive 1-on-1 support for ${latest.type} cycle.`, 
            trend: Trend.Down, 
            triggerReason: `Critical Gap: Overall performance significantly below ${currentPeriodThreshold}% benchmark.`, 
            dateIdentified: new Date().toISOString() 
        };
    }
    if (weakDomains.length > 0) {
        return { 
            tier: 2, 
            domain: weakDomains[0] as Domain, 
            goal: `Targeted intervention for ${weakDomains.join(' and ')}.`, 
            trend: Trend.Stable, 
            triggerReason: `Domain Specific: ${weakDomains.join(', ')} below benchmark.`, 
            dateIdentified: new Date().toISOString() 
        };
    }
    if (previous) {
        const prevAvg = getTrueProficiency(previous, frameworkSubdomains);
        if (avg < prevAvg - 8) {
            return { 
                tier: 2, 
                domain: "General" as any, 
                goal: "Address unexpected performance regression.", 
                trend: Trend.Down, 
                triggerReason: `Significant Regression: -${Math.round(prevAvg - avg)}% change since last test.`, 
                dateIdentified: new Date().toISOString() 
            };
        }
    }
    return null;
};

const sortByName = (list: Student[]) => [...list].sort((a, b) => a.name.localeCompare(b.name));

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { thresholds, subdomains: frameworkSubdomains } = useBenchmarks(); 
    const [students, setStudents] = useState<Student[]>([]);
    const [classProfile, setClassProfile] = useState<ClassProfile | null>(null);
    const { showToast } = useToast();

    const loadDemoData = useCallback(() => {
        if (!user) return;
        const profile = { id: 'demo-p', className: 'Sample Explorers 5A', gradeLevel: '5', academicYear: '2024' };
        const sortedMock = sortByName(mockStudents);
        const enhancedMock = sortedMock.map(s => ({
            ...s,
            photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name}`
        }));

        setStudents(enhancedMock);
        setClassProfile(profile);
        
        if (user.isDemo) {
            localStorage.setItem(getStorageKey(user.id, 'profile'), JSON.stringify(profile));
            localStorage.setItem(getStorageKey(user.id, 'students'), JSON.stringify(enhancedMock));
        }
    }, [user]);

    useEffect(() => {
        if (!user) { setStudents([]); setClassProfile(null); return; }
        
        const sKey = getStorageKey(user.id, 'students');
        const pKey = getStorageKey(user.id, 'profile');
        
        if (user.isDemo) {
            const localStudents = localStorage.getItem(sKey);
            const localProfile = localStorage.getItem(pKey);
            
            if (localStudents && localProfile) {
                try {
                    setStudents(sortByName(JSON.parse(localStudents)));
                    setClassProfile(JSON.parse(localProfile));
                } catch (e) {
                    loadDemoData();
                }
            } else {
                loadDemoData();
            }
        } else {
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
    }, [user, loadDemoData]);

    const syncStudents = (newStudents: Student[]) => {
        const sorted = sortByName(newStudents);
        setStudents(sorted);
        if (user?.isDemo) localStorage.setItem(getStorageKey(user.id, 'students'), JSON.stringify(sorted));
    };

    const registerClass = async (profile: ClassProfile) => {
        if (!user) return;
        const sanitizedProfile = { 
            ...profile, 
            className: sanitizeInput(profile.className) 
        };

        if (user.isDemo) { 
            setClassProfile(sanitizedProfile); 
            localStorage.setItem(getStorageKey(user.id, 'profile'), JSON.stringify(sanitizedProfile)); 
            return; 
        }
        await addDoc(collection(db, 'class_profiles'), { ...sanitizedProfile, userId: user.id });
    };

    const updateClassProfile = async (updates: Partial<ClassProfile>) => {
        if (!classProfile || !user) return;
        const sanitizedUpdates = { ...updates };
        if (sanitizedUpdates.className) sanitizedUpdates.className = sanitizeInput(sanitizedUpdates.className);

        const updatedProfile = { ...classProfile, ...sanitizedUpdates };
        setClassProfile(updatedProfile);

        if (user.isDemo) {
            localStorage.setItem(getStorageKey(user.id, 'profile'), JSON.stringify(updatedProfile));
        } else {
            await updateDoc(doc(db, 'class_profiles', classProfile.id), sanitizedUpdates);
        }
        showToast("Class profile updated.");
    };

    const addStudent = async (student: Student) => {
        if (!user) return;
        const sanitizedStudent = { 
            ...student, 
            name: sanitizeInput(student.name),
            actionLog: student.actionLog || [] 
        };

        if (user.isDemo) {
            syncStudents([...students, sanitizedStudent]);
            showToast("Student added.");
            return;
        }
        
        const { id, ...data } = sanitizedStudent;
        await addDoc(collection(db, 'students'), { ...data, userId: user.id });
        showToast("Student added.");
    };

    const addStudentsBulk = async (names: string[]) => {
        if (!user) return;
        const newStudents = names.map(name => ({
            id: `s-${Date.now()}-${Math.random()}`,
            name: sanitizeInput(name),
            level: classProfile?.gradeLevel || '5',
            class: classProfile?.className || 'General',
            photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.trim()}`,
            overallGrowth: 0,
            growthVelocity: 0,
            velocityBand: VelocityBand.Stable,
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
            const newRef = doc(collection(db, 'students'));
            batch.set(newRef, { ...data, userId: user.id });
        });
        await batch.commit();
        showToast(`${names.length} students added.`);
    };

    const updateStudent = async (updated: Student) => {
        if (!user) return;
        const sanitized = { ...updated, name: sanitizeInput(updated.name) };

        if (user.isDemo) {
            syncStudents(students.map(s => s.id === sanitized.id ? sanitized : s));
        } else {
            const { id, ...data } = sanitized;
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
        
        const velocity = calculateVelocity(assessments, frameworkSubdomains);
        const velocityBand = calculateVelocityBand(velocity);
        const rti = calculateRTIStatus(assessments, thresholds, frameworkSubdomains);
        const latestAvg = getTrueProficiency(assessments[assessments.length-1], frameworkSubdomains);
        const firstAvg = getTrueProficiency(assessments[0], frameworkSubdomains);
        const growth = assessments.length >= 2 ? latestAvg - firstAvg : 0;
        
        const payload = { 
            assessments, 
            overallGrowth: Math.round(growth), 
            growthVelocity: velocity, 
            velocityBand,
            interventionStatus: rti, 
            hasAnomaly: !!rti 
        };

        if (user.isDemo) {
            syncStudents(students.map(s => s.id === studentId ? { ...s, ...payload } : s));
        } else {
            await updateDoc(doc(db, 'students', studentId), payload);
        }
        showToast("Assessment recorded.");
    };

    const deleteAssessmentForStudent = async (studentId: string, assessmentId: string) => {
        if (!user) return;
        const student = students.find(s => s.id === studentId);
        if (!student) return;
        const assessments = student.assessments.filter(a => a.id !== assessmentId);
        const velocity = calculateVelocity(assessments, frameworkSubdomains);
        const velocityBand = calculateVelocityBand(velocity);
        const rti = calculateRTIStatus(assessments, thresholds, frameworkSubdomains);
        const growth = assessments.length >= 2 ? getTrueProficiency(assessments[assessments.length-1], frameworkSubdomains) - getTrueProficiency(assessments[0], frameworkSubdomains) : 0;
        
        const payload = { 
            assessments, 
            overallGrowth: Math.round(growth), 
            growthVelocity: velocity, 
            velocityBand,
            interventionStatus: rti, 
            hasAnomaly: !!rti 
        };

        if (user.isDemo) {
            syncStudents(students.map(s => s.id === studentId ? { ...s, ...payload } : s));
        } else {
            await updateDoc(doc(db, 'students', studentId), payload);
        }
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
            
            const vel = calculateVelocity(assessments, frameworkSubdomains);
            const velocityBand = calculateVelocityBand(vel);
            const latestAvg = getTrueProficiency(assessments[assessments.length-1], frameworkSubdomains);
            const firstAvg = getTrueProficiency(assessments[0], frameworkSubdomains);
            const growth = assessments.length >= 2 ? latestAvg - firstAvg : 0;
            const rti = calculateRTIStatus(assessments, thresholds, frameworkSubdomains);
            
            const payload = { 
                assessments, 
                overallGrowth: Math.round(growth), 
                growthVelocity: vel, 
                velocityBand,
                interventionStatus: rti, 
                hasAnomaly: !!rti 
            };
            
            if (batch) {
                batch.update(doc(db, 'students', s.id), payload);
            }
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
        
        const sanitizedContent = sanitizeInput(entry.content);
        const newLog = [...(student.actionLog || []), { ...entry, content: sanitizedContent, id: `log-${Date.now()}` }];
        
        if (user.isDemo) {
            syncStudents(students.map(s => s.id === studentId ? { ...s, actionLog: newLog } : s));
        } else {
            await updateDoc(doc(db, 'students', studentId), { actionLog: newLog });
        }
        showToast("Note recorded.");
    };

    return (
        <StudentContext.Provider value={{ 
            students, classProfile, registerClass, addStudent, addStudentsBulk, 
            updateStudent, deleteStudent, addAssessmentBulk, updateAssessmentForStudent, 
            deleteAssessmentForStudent, updateClassProfile, addLogEntry, loadDemoData
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
