
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { useToast } from './ToastContext';
import { auth, db } from '../firebase';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string, silent?: boolean) => Promise<boolean>;
    loginDemo: () => void;
    signup: (name: string, email: string, password: string, betaCode?: string) => Promise<boolean>;
    logout: () => void;
    applyBetaCode: (code: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        let isMounted = true;
        const initAuth = () => {
            const localDemo = localStorage.getItem('benchmark_demo_session');
            if (localDemo) {
                if (isMounted) {
                    setUser(JSON.parse(localDemo));
                    setIsLoading(false);
                }
                return;
            }

            const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                if (isMounted) {
                    if (firebaseUser) {
                        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                        const userData = userDoc.exists() ? userDoc.data() : {};
                        
                        setUser({
                            id: firebaseUser.uid,
                            name: userData.name || firebaseUser.displayName || 'Teacher',
                            role: UserRole.Teacher,
                            isDemo: false,
                            isPremium: userData.isPremium || false
                        });
                    } else {
                        setUser(null);
                    }
                    setIsLoading(false);
                }
            });
            return unsubscribe;
        };

        const unsubscribe = initAuth();
        return () => { isMounted = false; if (typeof unsubscribe === 'function') unsubscribe(); };
    }, []);

    const login = async (email: string, password: string, silent = false): Promise<boolean> => {
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            if (!silent) showToast("Welcome back!");
            return true;
        } catch (error: any) {
            if (!silent) showToast("Login failed.", "error");
            setIsLoading(false);
            return false;
        }
    };

    const loginDemo = () => {
        setIsLoading(true);
        const demoUser: User = { id: 'demo-user', name: 'Demo Teacher', role: UserRole.Teacher, isDemo: true, isPremium: false };
        localStorage.setItem('benchmark_demo_session', JSON.stringify(demoUser));
        setUser(demoUser);
        setTimeout(() => { setIsLoading(false); showToast("Demo Mode Activated"); }, 500);
    };

    const signup = async (name: string, email: string, password: string, betaCode?: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            const isPremium = betaCode?.toUpperCase() === 'BENCHMARK40';
            
            await setDoc(doc(db, 'users', cred.user.uid), {
                name,
                email,
                isPremium,
                role: UserRole.Teacher,
                createdAt: new Date().toISOString()
            });

            if (isPremium) showToast("Premium Beta Access Granted!");
            return true;
        } catch (error: any) {
            showToast("Signup failed.", "error");
            setIsLoading(false);
            return false;
        }
    };

    const applyBetaCode = async (code: string): Promise<boolean> => {
        if (code.toUpperCase() === 'BENCHMARK40') {
            if (user) {
                if (!user.isDemo) {
                    await updateDoc(doc(db, 'users', user.id), { isPremium: true });
                }
                const updatedUser = { ...user, isPremium: true };
                setUser(updatedUser);
                if (user.isDemo) localStorage.setItem('benchmark_demo_session', JSON.stringify(updatedUser));
                showToast("Premium Status Unlocked!");
                return true;
            }
        } else {
            showToast("Invalid or expired beta code.", "error");
        }
        return false;
    };

    const logout = async () => {
        localStorage.removeItem('benchmark_demo_session');
        await signOut(auth);
        setUser(null);
        showToast("Logged out.");
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, loginDemo, signup, logout, applyBetaCode }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth missing');
    return context;
};
