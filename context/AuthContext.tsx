
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { useToast } from './ToastContext';
import { auth, db, setSessionExpiration } from '../firebase';
import { logger } from '../services/logger';
import { SecurityService } from '../services/security';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string, silent?: boolean, rememberMe?: boolean) => Promise<boolean>;
    loginDemo: () => void;
    signup: (name: string, email: string, password: string) => Promise<boolean>;
    logout: () => void;
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
                        try {
                            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                            const userData = userDoc.exists() ? userDoc.data() : {};
                            
                            setUser({
                                id: firebaseUser.uid,
                                name: userData.name || firebaseUser.displayName || 'Teacher',
                                role: UserRole.Teacher,
                                isDemo: false,
                                isPremium: userData.isPremium || false
                            });
                        } catch (e) {
                            logger.error("User Profile Fetch Failed", e);
                            setUser(null);
                        }
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

    const login = async (email: string, password: string, silent = false, rememberMe = true): Promise<boolean> => {
        setIsLoading(true);
        try {
            // Audit: Session Expiration control
            await setSessionExpiration(rememberMe);
            await signInWithEmailAndPassword(auth, email, password);
            localStorage.removeItem('benchmark_demo_session'); // Clear demo if logging in
            if (!silent) showToast("Welcome back!");
            return true;
        } catch (error: any) {
            logger.error("Login Attempt Failed", error);
            if (!silent) {
                showToast(SecurityService.sanitizeError(error), "error");
            }
            setIsLoading(false);
            return false;
        }
    };

    const loginDemo = () => {
        setIsLoading(true);
        const demoUser: User = { 
            id: 'demo-user', 
            name: 'Guest Educator', 
            role: UserRole.Teacher, 
            isDemo: true, 
            isPremium: true // Demo mode allows trying premium features
        };
        localStorage.setItem('benchmark_demo_session', JSON.stringify(demoUser));
        setUser(demoUser);
        setTimeout(() => { 
            setIsLoading(false); 
            showToast("Demo Environment Initialized"); 
        }, 800);
    };

    const signup = async (name: string, email: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            localStorage.removeItem('benchmark_demo_session');
            
            await setDoc(doc(db, 'users', cred.user.uid), {
                name,
                email,
                isPremium: false,
                role: UserRole.Teacher,
                createdAt: new Date().toISOString()
            });

            showToast("Account created successfully!");
            return true;
        } catch (error: any) {
            logger.error("Signup Failed", error);
            showToast(SecurityService.sanitizeError(error), "error");
            setIsLoading(false);
            return false;
        }
    };

    const logout = async () => {
        try {
            localStorage.removeItem('benchmark_demo_session');
            await signOut(auth);
            setUser(null);
            showToast("Session ended.");
        } catch (e) {
            logger.error("Logout Failure", e);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, loginDemo, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth missing');
    return context;
};
