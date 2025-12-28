
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student, ClassProfile, Assessment, Resource, Intervention, Trend, Domain } from '../types';
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
    writeBatch
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
    loadDemoData: () => void;
    
    // AI Session Cache
    aiInsights: Record<string, { report_card: string, trend_insights: string }>;
    aiSuggestions: Record<string, Resource[]>;
    saveAiAnalysis: (studentId: string, data: { report_card: string, trend_insights: string }) => void;
    saveAiSuggestions: (studentId: string, resources: Resource[]) => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

// RTI Logic Helper
const calculateRTIStatus = (assessments: Assessment[]): Intervention | null => {
    if (assessments.length === 0) return null;

    const sorted = [...assessments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latest = sorted[sorted.length - 1];
    const previous = sorted.length > 1 ? sorted[sorted.length - 2] : null;

    const scores = Object.values(latest.scores) as number[];
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    
    const domainEntries = Object.entries(latest.scores) as [Domain, number][];

    // 1. Critical Domain Failures (Tier 3)
    const criticalDomains = domainEntries.filter(([_, score]) => score < 50).sort((a, b) => a[1] - b[1]);
    if (criticalDomains.length > 0) {
        const worst = criticalDomains[0];
        return {
            tier: 3,
            domain: worst[0],
            goal: `Intensive intervention needed for ${worst[0]}.`,
            trend: Trend.Down,
            triggerReason: `Critical: ${worst[0]} Score ${worst[1]}%`,
            dateIdentified: new Date().toISOString().split('T')[0]
        };
    }

    // 2. Critical Overall Average
    if (avg < 50) {
        return {
            tier: 3,
            domain: "General",
            goal: "Intensive 1:1 remediation across multiple domains.",
            trend: Trend.Down,
            triggerReason: `Critical: Overall Avg ${Math.round(avg)}%`,
            dateIdentified: new Date().toISOString().split('T')[0]
        };
    }

    // 3. Warning Domain Failures (Tier 2)
    const warningDomains = domainEntries.filter(([_, score]) => score < 70).sort((a, b) => a[1] - b[1]);
    if (warningDomains.length > 0) {
        const worst = warningDomains[0];
        return {
            tier: 2,
            domain: worst[0],
            goal: `Targeted practice for ${worst[0]}.`,
            trend: Trend.Stable,
            triggerReason: `Warning: ${worst[0]} Score ${worst[1]}%`,
            dateIdentified: new Date().toISOString().split('T')[0]
        };
    }

    // 4. Warning Overall Average
    if (avg < 70) {
        return {
            tier: 2,
            domain: "General",
            goal: "Target specific weak subdomains.",
            trend: Trend.Stable,
            triggerReason: `Warning: Overall Avg ${Math.round(avg)}%`,
            dateIdentified: new Date().toISOString().split('T')[0]
        };
    }

    // 5. Regression Check
    if (previous) {
        const prevScores = Object.values(previous.scores) as number[];
        const prevAvg = prevScores.length > 0 ? prevScores.reduce((a, b) => a + b, 0) / prevScores.length : 0;
        
        if (avg < prevAvg - 5 && avg < 85) { 
             return {
                tier: 2,
                domain: "General",
                goal: "Stop regression trend.",
                trend: Trend.Down,
                triggerReason: `Regression: Dropped ${(prevAvg - avg).toFixed(1)}%`,
                dateIdentified: new Date().toISOString().split('T')[0]
            };
        }
    }

    return null;
};

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [classProfile, setClassProfile] = useState<ClassProfile | null>(null);
    const { showToast } = useToast();

    // Session Cache State
    const [aiInsights, setAiInsights] = useState<Record<string, { report_card: string, trend_insights: string }>>({});
    const [aiSuggestions, setAiSuggestions] = useState<Record<string, Resource[]>>({});

    const saveAiAnalysis = (studentId: string, data: { report_card: string, trend_insights: string }) => {
        setAiInsights(prev => ({ ...prev, [studentId]: data }));
    };

    const saveAiSuggestions = (studentId: string, resources: Resource[]) => {
        setAiSuggestions(prev => ({ ...prev, [studentId]: resources }));
    };

    // --- Data Loading Effect ---
    useEffect(() => {
        if (!user) {
            setStudents([]);
            setClassProfile(null);
            return;
        }

        if (user.isDemo) {
            // DEMO MODE: Load from LocalStorage
            try {
                const localStudents = localStorage.getItem('demo_students');
                const localProfile = localStorage.getItem('demo_classProfile');
                
                const loadedStudents = localStudents ? JSON.parse(localStudents) : [];
                setStudents(loadedStudents);
                
                if (localProfile) {
                    setClassProfile(JSON.parse(localProfile));
                }

                // Auto-load if empty
                if (loadedStudents.length === 0 && !localProfile) {
                    // We don't auto-call loadDemoData() here to avoid loop/flicker, 
                    // relying on OnboardingWizard or explicit user action usually, 
                    // but we can set a flag or just leave empty.
                    // For a smooth demo experience, we can auto-seed if absolutely empty on first run
                    const hasSeeded = sessionStorage.getItem('demo_seeded');
                    if (!hasSeeded) {
                        loadDemoData(); 
                        sessionStorage.setItem('demo_seeded', 'true');
                    }
                }
            } catch (e) {
                console.error("Error loading demo data", e);
            }
        } else {
            // REAL MODE: Firestore Listeners
            const qStudents = query(collection(db, 'students'), where('userId', '==', user.id));
            const unsubStudents = onSnapshot(qStudents, (snapshot) => {
                const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[];
                setStudents(loaded);
            }, (error) => {
                console.error("Error fetching students:", error);
                if (error.code === 'permission-denied') {
                    showToast("Database permission denied.", "error");
                }
            });

            const qProfile = query(collection(db, 'class_profiles'), where('userId', '==', user.id));
            const unsubProfile = onSnapshot(qProfile, (snapshot) => {
                if (!snapshot.empty) {
                    const d = snapshot.docs[0];
                    setClassProfile({ id: d.id, ...d.data() } as ClassProfile);
                } else {
                    setClassProfile(null);
                }
            });

            return () => {
                unsubStudents();
                unsubProfile();
            };
        }
    }, [user]);

    // --- Helpers for Demo Storage ---
    const saveDemoStudents = (newStudents: Student[]) => {
        setStudents(newStudents);
        localStorage.setItem('demo_students', JSON.stringify(newStudents));
    };

    const saveDemoProfile = (newProfile: ClassProfile) => {
        setClassProfile(newProfile);
        localStorage.setItem('demo_classProfile', JSON.stringify(newProfile));
    };

    // --- Actions ---

    const registerClass = async (profile: ClassProfile) => {
        if (!user) return;
        
        if (user.isDemo) {
            saveDemoProfile(profile);
            showToast(`Class "${profile.className}" created! (Demo)`);
            return;
        }

        try {
            await addDoc(collection(db, 'class_profiles'), { ...profile, userId: user.id });
            showToast(`Class "${profile.className}" created!`);
        } catch (e) {
            console.error(e);
            showToast("Error creating class.", "error");
        }
    };

    const updateClassProfile = async (updates: Partial<ClassProfile>) => {
        if (!user || !classProfile) return;

        if (user.isDemo) {
            const updated = { ...classProfile, ...updates };
            saveDemoProfile(updated);
            if (updates.gradeLevel && updates.gradeLevel !== classProfile.gradeLevel) {
                const updatedStudents = students.map(s => ({ ...s, level: updates.gradeLevel! }));
                saveDemoStudents(updatedStudents);
                showToast("Class updated. Students synced to new level.");
            } else {
                showToast("Class profile updated.");
            }
            return;
        }

        try {
            const docRef = doc(db, 'class_profiles', classProfile.id);
            await updateDoc(docRef, updates);
            
            if (updates.gradeLevel && updates.gradeLevel !== classProfile.gradeLevel) {
                 const batch = writeBatch(db);
                 students.forEach(s => {
                     const sRef = doc(db, 'students', s.id);
                     batch.update(sRef, { level: updates.gradeLevel });
                 });
                 await batch.commit();
                 showToast("Class updated. Students synced to new level.");
            } else {
                 showToast("Class profile updated.");
            }
        } catch (e) {
            console.error(e);
            showToast("Error updating class.", "error");
        }
    };

    const addStudent = async (student: Student) => {
        if (!user) return;

        if (user.isDemo) {
            const newStudents = [...students, student];
            saveDemoStudents(newStudents);
            showToast(`${student.name} added to roster.`);
            return;
        }

        try {
            const { id, ...studentData } = student;
            await addDoc(collection(db, 'students'), { ...studentData, userId: user.id });
            showToast(`${student.name} added to roster.`);
        } catch (e) {
            console.error(e);
            showToast("Error adding student.", "error");
        }
    };

    const addStudentsBulk = async (names: string[]) => {
        if (!user) return;

        if (user.isDemo) {
            const newEntries = names.map(name => ({
                id: `s-demo-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                name: name.trim(),
                level: classProfile?.gradeLevel || 'Unassigned',
                class: classProfile?.className || 'General',
                photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.trim()}`,
                overallGrowth: 0,
                hasAnomaly: false,
                assessments: [],
                interventionStatus: null,
            })) as Student[];
            
            saveDemoStudents([...students, ...newEntries]);
            showToast(`Imported ${names.length} students successfully.`);
            return;
        }

        const batch = writeBatch(db);
        names.forEach(name => {
            const docRef = doc(collection(db, "students"));
            batch.set(docRef, {
                name: name.trim(),
                level: classProfile?.gradeLevel || 'Unassigned',
                class: classProfile?.className || 'General',
                photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.trim()}`,
                overallGrowth: 0,
                hasAnomaly: false,
                assessments: [],
                interventionStatus: null,
                userId: user.id
            });
        });

        try {
            await batch.commit();
            showToast(`Imported ${names.length} students successfully.`);
        } catch (e) {
            console.error(e);
            showToast("Error bulk adding students.", "error");
        }
    };

    const updateStudent = async (updatedStudent: Student) => {
        if (!user) return;

        if (user.isDemo) {
            const newStudents = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
            saveDemoStudents(newStudents);
            showToast("Student profile updated.");
            return;
        }

        try {
            const studentRef = doc(db, 'students', updatedStudent.id);
            const { id, ...data } = updatedStudent;
            await updateDoc(studentRef, data);
            showToast("Student profile updated.");
        } catch (e) {
            console.error(e);
            showToast("Error updating student.", "error");
        }
    };

    const deleteStudent = async (id: string) => {
        if (!user) return;

        if (user.isDemo) {
            const newStudents = students.filter(s => s.id !== id);
            saveDemoStudents(newStudents);
            showToast("Student removed.", "info");
            return;
        }

        try {
            await deleteDoc(doc(db, 'students', id));
            showToast("Student removed.", "info");
        } catch (e) {
            console.error(e);
            showToast("Error deleting student.", "error");
        }
    };

    const updateAssessmentForStudent = async (studentId: string, assessment: Assessment) => {
        if (!user) return;
        
        // Common logic for calculation
        const student = students.find(s => s.id === studentId);
        if (!student) return;

        let updatedAssessments = [...student.assessments];
        const index = updatedAssessments.findIndex(a => a.id === assessment.id);

        if (index !== -1) updatedAssessments[index] = assessment;
        else updatedAssessments.push(assessment);

        updatedAssessments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        const firstScore = updatedAssessments[0]?.scores.Reading || 0;
        const lastScore = updatedAssessments[updatedAssessments.length - 1]?.scores.Reading || 0;
        const growth = Math.round(lastScore - firstScore);
        const newInterventionStatus = calculateRTIStatus(updatedAssessments);

        const updatePayload = {
            assessments: updatedAssessments,
            overallGrowth: growth,
            interventionStatus: newInterventionStatus,
            hasAnomaly: !!newInterventionStatus
        };

        if (user.isDemo) {
            const updatedStudent = { ...student, ...updatePayload };
            const newStudents = students.map(s => s.id === studentId ? updatedStudent : s);
            saveDemoStudents(newStudents);
            
            if (newInterventionStatus) showToast(`Flagged: Tier ${newInterventionStatus.tier} - ${newInterventionStatus.triggerReason}`, "info");
            else showToast("Assessment saved. Student on track.");
            return;
        }

        try {
            const studentRef = doc(db, 'students', studentId);
            await updateDoc(studentRef, updatePayload);
            if (newInterventionStatus) showToast(`Flagged: Tier ${newInterventionStatus.tier} - ${newInterventionStatus.triggerReason}`, "info");
            else showToast("Assessment saved. Student on track.");
        } catch (e) {
            console.error(e);
            showToast("Error saving assessment.", "error");
        }
    };

    const addAssessmentBulk = async (newAssessments: { studentId: string, assessment: Assessment }[]) => {
        if (!user) return;

        // Prepare data
        const updates = newAssessments.map(item => {
            const student = students.find(s => s.id === item.studentId);
            if (!student) return null;

            const updatedAssessments = [...student.assessments, item.assessment];
            updatedAssessments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
            const firstScore = updatedAssessments[0]?.scores.Reading || 0;
            const lastScore = updatedAssessments[updatedAssessments.length - 1]?.scores.Reading || 0;
            const growth = Math.round(lastScore - firstScore);
            const interventionStatus = calculateRTIStatus(updatedAssessments);

            return {
                studentId: student.id,
                payload: {
                    assessments: updatedAssessments,
                    overallGrowth: growth,
                    interventionStatus,
                    hasAnomaly: !!interventionStatus
                }
            };
        }).filter(Boolean);

        if (user.isDemo) {
            const newStudents = [...students];
            updates.forEach(u => {
                const idx = newStudents.findIndex(s => s.id === u!.studentId);
                if (idx !== -1) {
                    newStudents[idx] = { ...newStudents[idx], ...u!.payload };
                }
            });
            saveDemoStudents(newStudents);
            showToast(`Saved assessments for ${newAssessments.length} students.`);
            return;
        }

        const batch = writeBatch(db);
        updates.forEach(u => {
            const studentRef = doc(db, 'students', u!.studentId);
            batch.update(studentRef, u!.payload);
        });

        try {
            await batch.commit();
            showToast(`Saved assessments for ${newAssessments.length} students.`);
        } catch (e) {
            console.error(e);
            showToast("Error saving batch assessments.", "error");
        }
    };

    const loadDemoData = async () => {
        if (!user) return;
        
        // Prevent overwrite if data exists
        if (students.length > 0) {
            showToast("Data already exists.", "info");
            return;
        }

        const demoProfile = {
            id: 'demo-profile',
            className: 'Class A (Demo)',
            gradeLevel: '5',
            academicYear: '2023-2024'
        };

        if (user.isDemo) {
            saveDemoProfile(demoProfile);
            const demoStudents = mockStudents.map(s => ({ ...s, id: `demo-s-${Math.random()}` }));
            saveDemoStudents(demoStudents);
            showToast("Demo data loaded!", "success");
            return;
        }

        // Firestore Logic for real users
        await registerClass(demoProfile);
        const batch = writeBatch(db);
        mockStudents.forEach(s => {
            const docRef = doc(collection(db, "students"));
            const { id, ...data } = s;
            batch.set(docRef, { ...data, userId: user.id });
        });

        await batch.commit();
        showToast("Demo data loaded!", "success");
    };

    return (
        <StudentContext.Provider value={{ 
            students, 
            classProfile, 
            registerClass, 
            addStudent, 
            addStudentsBulk, 
            updateStudent, 
            deleteStudent, 
            addAssessmentBulk, 
            updateAssessmentForStudent,
            updateClassProfile,
            loadDemoData,
            aiInsights,
            aiSuggestions,
            saveAiAnalysis,
            saveAiSuggestions
        }}>
            {children}
        </StudentContext.Provider>
    );
};

export const useStudents = () => {
    const context = useContext(StudentContext);
    if (context === undefined) {
        throw new Error('useStudents must be used within a StudentProvider');
    }
    return context;
};
