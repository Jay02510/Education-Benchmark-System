
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Benchmark, SubdomainMetadata, TestPeriod, Domain } from '../types';
import { mockBenchmarkFramework } from '../data/mockData';
import { DOMAINS as INITIAL_DOMAINS, SUBDOMAINS as INITIAL_SUBDOMAINS } from '../constants';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';
import { collection, addDoc, doc, updateDoc, deleteDoc, query, where, onSnapshot, writeBatch, getDocs } from 'firebase/firestore';

const DEFAULT_THRESHOLDS: Record<TestPeriod, number> = {
    [TestPeriod.Baseline]: 80,
    [TestPeriod.Midline]: 85,
    [TestPeriod.Endline]: 90
};

interface BenchmarkContextType {
    benchmarks: Benchmark[];
    domains: string[];
    subdomains: Record<string, SubdomainMetadata[]>;
    thresholds: Record<TestPeriod, number>;
    updateBenchmark: (id: string, updates: Partial<Benchmark>) => Promise<void>;
    addBenchmark: (benchmark: Benchmark) => Promise<void>;
    deleteBenchmark: (id: string) => Promise<void>;
    initializeFramework: (source: 'master' | 'custom', customDomains?: string[]) => Promise<void>;
    addDomain: (domain: string) => void;
    deleteDomain: (domain: string) => void;
    addSubdomain: (domain: string, subdomainName: string, maxScore: number) => void;
    updateSubdomain: (domain: string, oldName: string, newName: string, newMaxScore: number) => void;
    deleteSubdomain: (domain: string, subdomainName: string) => void;
    updateThreshold: (period: TestPeriod, value: number) => void;
    resetBenchmarks: () => void;
}

const BenchmarkContext = createContext<BenchmarkContextType | undefined>(undefined);

export const BenchmarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
    const [domains, setDomains] = useState<string[]>([]);
    const [subdomains, setSubdomains] = useState<Record<string, SubdomainMetadata[]>>({});
    const [thresholds, setThresholds] = useState<Record<TestPeriod, number>>(DEFAULT_THRESHOLDS);
    const [configDocId, setConfigDocId] = useState<string | null>(null);
    const { showToast } = useToast();

    useEffect(() => {
        if (!user) {
            setBenchmarks([]);
            setDomains([]);
            setSubdomains({});
            return;
        }

        if (user.isDemo) {
            setBenchmarks(mockBenchmarkFramework);
            setDomains([...INITIAL_DOMAINS]);
            setSubdomains(INITIAL_SUBDOMAINS);
            setThresholds(DEFAULT_THRESHOLDS);
        } else {
            const q = query(collection(db, 'benchmarks'), where('userId', '==', user.id));
            const unsubBench = onSnapshot(q, (snapshot) => {
                const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Benchmark[];
                setBenchmarks(loaded);
            }, (error: any) => {
                if (error?.message?.includes('Missing or insufficient permissions') || error?.code === 'permission-denied') {
                    handleFirestoreError(error, OperationType.LIST, 'benchmarks');
                }
            });

            const loadConfig = async () => {
                try {
                    const qConfig = query(collection(db, 'framework_configs'), where('userId', '==', user.id));
                    const snapshot = await getDocs(qConfig);
                    if (!snapshot.empty) {
                        const docSnap = snapshot.docs[0];
                        setConfigDocId(docSnap.id);
                        setDomains(docSnap.data().domains || []);
                        setSubdomains(docSnap.data().subdomains || {});
                        setThresholds(docSnap.data().thresholds || DEFAULT_THRESHOLDS);
                    }
                } catch (error: any) {
                    if (error?.message?.includes('Missing or insufficient permissions') || error?.code === 'permission-denied') {
                        handleFirestoreError(error, OperationType.LIST, 'framework_configs');
                    }
                }
            };
            loadConfig();
            return () => unsubBench();
        }
    }, [user]);

    const initializeFramework = async (source: 'master' | 'custom', customDomains: string[] = []) => {
        if (!user) return;

        const selectedDomains = source === 'master' ? [...INITIAL_DOMAINS] : customDomains;
        const selectedSubdomains = source === 'master' ? INITIAL_SUBDOMAINS : {};
        
        if (user.isDemo) {
            setDomains(selectedDomains);
            setSubdomains(selectedSubdomains);
            setBenchmarks(source === 'master' ? mockBenchmarkFramework : []);
            return;
        }

        const batch = writeBatch(db);
        
        // Clear existing user benchmarks to prevent pollution
        const qBench = query(collection(db, 'benchmarks'), where('userId', '==', user.id));
        const benchSnap = await getDocs(qBench);
        benchSnap.docs.forEach(d => batch.delete(d.ref));

        // Seed Master Framework if requested
        if (source === 'master') {
            mockBenchmarkFramework.forEach(b => {
                const { id, ...data } = b;
                const newRef = doc(collection(db, 'benchmarks'));
                batch.set(newRef, { ...data, userId: user.id });
            });
        }

        const configData = { 
            domains: selectedDomains, 
            subdomains: selectedSubdomains, 
            thresholds: DEFAULT_THRESHOLDS, 
            userId: user.id,
            source,
            timestamp: new Date().toISOString()
        };

        if (configDocId) {
            batch.update(doc(db, 'framework_configs', configDocId), configData);
        } else {
            const newDoc = doc(collection(db, 'framework_configs'));
            batch.set(newDoc, configData);
            setConfigDocId(newDoc.id);
        }

        await batch.commit();
        setDomains(selectedDomains);
        setSubdomains(selectedSubdomains);
        showToast(`System logic ${source} framework successfully deployed.`);
    };

    const updateBenchmark = async (id: string, updates: Partial<Benchmark>) => {
        if (!user) return;
        if (user.isDemo) {
            setBenchmarks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
            return;
        }
        if (!id) {
            showToast("Standard mapping mismatch.", "error");
            return;
        }
        await updateDoc(doc(db, 'benchmarks', id), updates);
        showToast("Pedagogical target synchronized.");
    };

    const updateConfig = async (newDomains: string[], newSubdomains: any, newThresholds: any) => {
        if (user?.isDemo) {
            setDomains(newDomains); setSubdomains(newSubdomains); setThresholds(newThresholds);
            return;
        }
        if (!configDocId || !user) return;
        setDomains(newDomains); setSubdomains(newSubdomains); setThresholds(newThresholds);
        await updateDoc(doc(db, 'framework_configs', configDocId), { domains: newDomains, subdomains: newSubdomains, thresholds: newThresholds });
    };

    const updateThreshold = (period: TestPeriod, value: number) => updateConfig(domains, subdomains, { ...thresholds, [period]: value });
    const addBenchmark = async (b: Benchmark) => { if (!user) return; const { id, ...data } = b; await addDoc(collection(db, 'benchmarks'), { ...data, userId: user.id }); };
    const deleteBenchmark = async (id: string) => { if (!user) return; await deleteDoc(doc(db, 'benchmarks', id)); };
    const addDomain = (d: string) => !domains.includes(d) && updateConfig([...domains, d], { ...subdomains, [d]: [] }, thresholds);
    const deleteDomain = (d: string) => updateConfig(domains.filter(i => i !== d), Object.fromEntries(Object.entries(subdomains).filter(([k]) => k !== d)), thresholds);
    const addSubdomain = (d: string, n: string, m: number) => updateConfig(domains, { ...subdomains, [d]: [...(subdomains[d] || []), { name: n, maxScore: m }] }, thresholds);
    const updateSubdomain = (d: string, o: string, n: string, m: number) => updateConfig(domains, { ...subdomains, [d]: (subdomains[d] || []).map(s => s.name === o ? { name: n, maxScore: m } : s) }, thresholds);
    const deleteSubdomain = (d: string, n: string) => updateConfig(domains, { ...subdomains, [d]: (subdomains[d] || []).filter(s => s.name !== n) }, thresholds);

    const resetBenchmarks = () => {
        if (!user) return;
        initializeFramework('master');
    };

    return (
        <BenchmarkContext.Provider value={{ 
            benchmarks, domains, subdomains, thresholds, updateBenchmark, addBenchmark, deleteBenchmark,
            addDomain, deleteDomain, addSubdomain, updateSubdomain, deleteSubdomain, updateThreshold, resetBenchmarks, initializeFramework
        }}>
            {children}
        </BenchmarkContext.Provider>
    );
};

export const useBenchmarks = () => {
    const context = useContext(BenchmarkContext);
    if (!context) throw new Error('useBenchmarks must be used within a BenchmarkProvider');
    return context;
};
