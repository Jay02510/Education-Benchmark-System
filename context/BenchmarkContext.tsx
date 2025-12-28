
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Benchmark, SubdomainMetadata } from '../types';
import { mockBenchmarkFramework } from '../data/mockData';
import { DOMAINS as INITIAL_DOMAINS, SUBDOMAINS as INITIAL_SUBDOMAINS } from '../constants';
import { FrameworkPreset } from '../data/frameworkPresets';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, query, where, onSnapshot, writeBatch, getDocs } from 'firebase/firestore';

interface BenchmarkContextType {
    benchmarks: Benchmark[];
    domains: string[];
    subdomains: Record<string, SubdomainMetadata[]>;
    updateBenchmark: (id: string, updates: Partial<Benchmark>) => void;
    addBenchmark: (benchmark: Benchmark) => void;
    deleteBenchmark: (id: string) => void;
    
    addDomain: (domain: string) => void;
    deleteDomain: (domain: string) => void;
    addSubdomain: (domain: string, subdomainName: string, maxScore: number) => void;
    updateSubdomain: (domain: string, oldName: string, newName: string, newMaxScore: number) => void;
    deleteSubdomain: (domain: string, subdomainName: string) => void;
    
    resetBenchmarks: () => void;
    applyPreset: (preset: FrameworkPreset) => void;
}

const BenchmarkContext = createContext<BenchmarkContextType | undefined>(undefined);

export const BenchmarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
    const [domains, setDomains] = useState<string[]>([]);
    const [subdomains, setSubdomains] = useState<Record<string, SubdomainMetadata[]>>({});
    const [configDocId, setConfigDocId] = useState<string | null>(null);
    const { showToast } = useToast();

    // --- Demo Helper Functions ---
    const saveDemoBenchmarks = (newBenchmarks: Benchmark[]) => {
        setBenchmarks(newBenchmarks);
        localStorage.setItem('demo_benchmarks', JSON.stringify(newBenchmarks));
    };

    const saveDemoConfig = (newDomains: string[], newSubdomains: any) => {
        setDomains(newDomains);
        setSubdomains(newSubdomains);
        localStorage.setItem('demo_config_domains', JSON.stringify(newDomains));
        localStorage.setItem('demo_config_subdomains', JSON.stringify(newSubdomains));
    };

    // --- Load Data ---
    useEffect(() => {
        if (!user) {
            setBenchmarks([]);
            setDomains([]);
            setSubdomains({});
            return;
        }

        if (user.isDemo) {
            // Load Demo Data
            const localBench = localStorage.getItem('demo_benchmarks');
            if (localBench) {
                setBenchmarks(JSON.parse(localBench));
            } else {
                // Seed if empty
                setBenchmarks(mockBenchmarkFramework);
                localStorage.setItem('demo_benchmarks', JSON.stringify(mockBenchmarkFramework));
            }

            const localDomains = localStorage.getItem('demo_config_domains');
            const localSub = localStorage.getItem('demo_config_subdomains');
            
            if (localDomains && localSub) {
                setDomains(JSON.parse(localDomains));
                setSubdomains(JSON.parse(localSub));
            } else {
                setDomains([...INITIAL_DOMAINS]);
                setSubdomains(INITIAL_SUBDOMAINS);
                localStorage.setItem('demo_config_domains', JSON.stringify([...INITIAL_DOMAINS]));
                localStorage.setItem('demo_config_subdomains', JSON.stringify(INITIAL_SUBDOMAINS));
            }

        } else {
            // Firestore: Benchmarks
            const q = query(collection(db, 'benchmarks'), where('userId', '==', user.id));
            const unsubBench = onSnapshot(q, (snapshot) => {
                const loaded = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Benchmark[];
                setBenchmarks(loaded);
            });

            // Firestore: Config
            const loadConfig = async () => {
                try {
                    const qConfig = query(collection(db, 'framework_configs'), where('userId', '==', user.id));
                    const snapshot = await getDocs(qConfig);
                    
                    if (!snapshot.empty) {
                        const docSnap = snapshot.docs[0];
                        setConfigDocId(docSnap.id);
                        setDomains(docSnap.data().domains);
                        setSubdomains(docSnap.data().subdomains);
                    } else {
                        // Init Default
                        const defaultConfig = {
                            domains: [...INITIAL_DOMAINS],
                            subdomains: INITIAL_SUBDOMAINS,
                            userId: user.id
                        };
                        const docRef = await addDoc(collection(db, 'framework_configs'), defaultConfig);
                        setConfigDocId(docRef.id);
                        setDomains(defaultConfig.domains);
                        setSubdomains(defaultConfig.subdomains);
                        
                        // Seed Benchmarks if empty
                        if (benchmarks.length === 0) {
                             const batch = writeBatch(db);
                             mockBenchmarkFramework.forEach(b => {
                                 const ref = doc(collection(db, 'benchmarks'));
                                 const { id, ...data } = b;
                                 batch.set(ref, { ...data, userId: user.id });
                             });
                             await batch.commit();
                        }
                    }
                } catch (error) {
                    console.error("Error loading framework config:", error);
                }
            };
            loadConfig();

            return () => unsubBench();
        }
    }, [user]);

    // --- Actions ---

    const updateConfig = async (newDomains: string[], newSubdomains: any) => {
        if (user?.isDemo) {
            saveDemoConfig(newDomains, newSubdomains);
            return;
        }
        if (!configDocId || !user) return;
        await updateDoc(doc(db, 'framework_configs', configDocId), {
            domains: newDomains,
            subdomains: newSubdomains
        });
        setDomains(newDomains);
        setSubdomains(newSubdomains);
    };

    const updateBenchmark = async (id: string, updates: Partial<Benchmark>) => {
        if (user?.isDemo) {
            const newBenchmarks = benchmarks.map(b => b.id === id ? { ...b, ...updates } : b);
            saveDemoBenchmarks(newBenchmarks);
            showToast("Benchmark target updated.");
            return;
        }
        if (!user) return;
        await updateDoc(doc(db, 'benchmarks', id), updates);
        showToast("Benchmark target updated.");
    };

    const addBenchmark = async (benchmark: Benchmark) => {
        if (user?.isDemo) {
            saveDemoBenchmarks([...benchmarks, benchmark]);
            return;
        }
        if (!user) return;
        const { id, ...data } = benchmark;
        await addDoc(collection(db, 'benchmarks'), { ...data, userId: user.id });
    };

    const deleteBenchmark = async (id: string) => {
        if (user?.isDemo) {
            saveDemoBenchmarks(benchmarks.filter(b => b.id !== id));
            return;
        }
        if (!user) return;
        await deleteDoc(doc(db, 'benchmarks', id));
    };

    const addDomain = async (domain: string) => {
        if (!domains.includes(domain)) {
            const newDomains = [...domains, domain];
            const newSubs = { ...subdomains, [domain]: [] };
            await updateConfig(newDomains, newSubs);
            showToast(`Domain "${domain}" added.`);
        }
    };

    const deleteDomain = async (domain: string) => {
        const newDomains = domains.filter(d => d !== domain);
        const newSubs = { ...subdomains };
        delete newSubs[domain];
        await updateConfig(newDomains, newSubs);
        showToast(`Domain "${domain}" removed.`, "info");
    };

    const addSubdomain = async (domain: string, subdomainName: string, maxScore: number) => {
        if (subdomains[domain]) {
            if (subdomains[domain].some(s => s.name === subdomainName)) return;
            
            const newSubs = { 
                ...subdomains, 
                [domain]: [...subdomains[domain], { name: subdomainName, maxScore }] 
            };
            await updateConfig(domains, newSubs);
            showToast(`Subdomain "${subdomainName}" added.`);
        }
    };

    const updateSubdomain = async (domain: string, oldName: string, newName: string, newMaxScore: number) => {
         if (subdomains[domain]) {
            const newSubs = {
                ...subdomains,
                [domain]: subdomains[domain].map(sub => 
                    sub.name === oldName ? { name: newName, maxScore: newMaxScore } : sub
                )
            };
            await updateConfig(domains, newSubs);
            showToast("Subdomain updated.");
        }
    };

    const deleteSubdomain = async (domain: string, subdomainName: string) => {
        if (subdomains[domain]) {
            const newSubs = {
                ...subdomains,
                [domain]: subdomains[domain].filter(s => s.name !== subdomainName)
            };
            await updateConfig(domains, newSubs);
            showToast(`Subdomain deleted.`, "info");
        }
    };

    const resetBenchmarks = async () => {
        if (!user) return;

        if (user.isDemo) {
            saveDemoConfig([...INITIAL_DOMAINS], { ...INITIAL_SUBDOMAINS });
            saveDemoBenchmarks(mockBenchmarkFramework);
            showToast("Restored Master Benchmark Framework.", "success");
            return;
        }

        if (!configDocId) return;
        
        await updateConfig([...INITIAL_DOMAINS], { ...INITIAL_SUBDOMAINS });
        
        const q = query(collection(db, 'benchmarks'), where('userId', '==', user.id));
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        mockBenchmarkFramework.forEach(b => {
             const ref = doc(collection(db, 'benchmarks'));
             const { id, ...data } = b;
             batch.set(ref, { ...data, userId: user.id });
        });
        
        await batch.commit();
        showToast("Restored Master Benchmark Framework.", "success");
    }

    const applyPreset = async (preset: FrameworkPreset) => {
        // Map preset strings to weighted objects
        const weightedSubdomains: Record<string, SubdomainMetadata[]> = {};
        Object.entries(preset.subdomains).forEach(([d, subs]) => {
             // @ts-ignore
             weightedSubdomains[d] = subs.map((s: any) => typeof s === 'string' ? { name: s, maxScore: 10 } : s);
        });

        await updateConfig(preset.domains, weightedSubdomains);
        
        // Also clear benchmarks
        if (user?.isDemo) {
            saveDemoBenchmarks([]);
        } else {
            const q = query(collection(db, 'benchmarks'), where('userId', '==', user!.id));
            const snapshot = await getDocs(q);
            const batch = writeBatch(db);
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
        }

        showToast(`Applied preset: ${preset.name}`, "success");
    };

    return (
        <BenchmarkContext.Provider value={{ 
            benchmarks, domains, subdomains, 
            updateBenchmark, addBenchmark, deleteBenchmark,
            addDomain, deleteDomain, addSubdomain, updateSubdomain, deleteSubdomain,
            resetBenchmarks, applyPreset
        }}>
            {children}
        </BenchmarkContext.Provider>
    );
};

export const useBenchmarks = () => {
    const context = useContext(BenchmarkContext);
    if (context === undefined) {
        throw new Error('useBenchmarks must be used within a BenchmarkProvider');
    }
    return context;
};
