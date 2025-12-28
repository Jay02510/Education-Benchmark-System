
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { useToast } from './ToastContext';
import { auth } from '../firebase';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    User as FirebaseUser 
} from 'firebase/auth';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string, silent?: boolean) => Promise<boolean>;
    loginDemo: () => void;
    signup: (name: string, email: string, password: string, silent?: boolean) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();

    // Listen to Firebase Auth state changes OR Local Demo state
    useEffect(() => {
        let isMounted = true;

        const initAuth = () => {
            // 1. Check for Local Demo User first (No network needed)
            const localDemo = localStorage.getItem('benchmark_demo_session');
            if (localDemo) {
                if (isMounted) {
                    setUser(JSON.parse(localDemo));
                    setIsLoading(false);
                }
                return;
            }

            // 2. Fallback to Firebase
            const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
                if (isMounted) {
                    if (firebaseUser) {
                        const userObj: User = {
                            id: firebaseUser.uid,
                            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Teacher',
                            role: UserRole.Teacher,
                            isDemo: false 
                        };
                        setUser(userObj);
                    } else {
                        setUser(null);
                    }
                    setIsLoading(false);
                }
            });
            return unsubscribe;
        };

        const unsubscribe = initAuth();

        return () => {
            isMounted = false;
            if (typeof unsubscribe === 'function') unsubscribe();
        };
    }, []);

    const login = async (email: string, password: string, silent = false): Promise<boolean> => {
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            if (!silent) showToast("Welcome back!");
            return true;
        } catch (error: any) {
            // Only log errors if not silent
            if (!silent) {
                const knownErrors = ['auth/invalid-credential', 'auth/user-not-found', 'auth/wrong-password'];
                if (!knownErrors.includes(error.code)) {
                    console.error("Login Error:", error);
                }
                
                let msg = "Failed to login.";
                if (error.code === 'auth/invalid-credential') msg = "Invalid email or password.";
                if (error.code === 'auth/user-not-found') msg = "User not found.";
                if (error.code === 'auth/wrong-password') msg = "Incorrect password.";
                showToast(msg, "error");
            }
            setIsLoading(false);
            return false;
        }
    };

    // New: Purely local login, no firebase needed
    const loginDemo = () => {
        setIsLoading(true);
        
        // Create a simulated user
        const demoUser: User = {
            id: 'demo-user-local',
            name: 'Demo Teacher',
            role: UserRole.Teacher,
            isDemo: true
        };

        // Persist locally so refresh works
        localStorage.setItem('benchmark_demo_session', JSON.stringify(demoUser));
        setUser(demoUser);
        
        // Small delay for UX
        setTimeout(() => {
            setIsLoading(false);
            showToast("Entering Demo Mode (Offline Ready)");
        }, 500);
    };

    const signup = async (name: string, email: string, password: string, silent = false): Promise<boolean> => {
        setIsLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            if (!silent) showToast("Account created successfully!");
            return true;
        } catch (error: any) {
            if (!silent) {
                const knownErrors = ['auth/email-already-in-use', 'auth/weak-password'];
                if (!knownErrors.includes(error.code)) {
                    console.error("Signup Error:", error);
                }

                let msg = "Failed to create account.";
                if (error.code === 'auth/email-already-in-use') msg = "Email already in use.";
                if (error.code === 'auth/weak-password') msg = "Password should be at least 6 characters.";
                showToast(msg, "error");
            }
            setIsLoading(false);
            return false;
        }
    };

    const logout = async () => {
        try {
            // Clear both Firebase and Local Demo
            localStorage.removeItem('benchmark_demo_session');
            await signOut(auth);
            setUser(null);
            showToast("Logged out successfully.");
        } catch (error) {
            console.error("Logout Error:", error);
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
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
