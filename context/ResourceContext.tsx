
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Resource } from '../types';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { logger } from '../services/logger';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';
import { collection, addDoc, deleteDoc, doc, query, where, onSnapshot } from 'firebase/firestore';

interface ResourceContextType {
    resources: Resource[];
    addResource: (resource: Resource) => void;
    removeResource: (id: string) => void;
    isResourceSaved: (id: string) => boolean;
}

const ResourceContext = createContext<ResourceContextType | undefined>(undefined);

export const ResourceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [resources, setResources] = useState<Resource[]>([]);
    const { showToast } = useToast();

    useEffect(() => {
        if (!user) {
            setResources([]);
            return;
        }

        if (user.isDemo) {
            const localRes = localStorage.getItem('demo_resources');
            if (localRes) {
                setResources(JSON.parse(localRes));
            } else {
                setResources([]);
            }
        } else {
            const q = query(collection(db, 'resources'), where('userId', '==', user.id));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const loaded = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Resource[];
                setResources(loaded);
            }, (error: any) => {
                 logger.error("Resource Sync Failure", error);
                 if (error?.message?.includes('Missing or insufficient permissions') || error?.code === 'permission-denied') {
                     handleFirestoreError(error, OperationType.LIST, 'resources');
                 }
            });
            return () => unsubscribe();
        }
    }, [user]);

    const addResource = async (resource: Resource) => {
        if (!user) return;
        if (isResourceSaved(resource.id)) return;

        if (user.isDemo) {
            const newResources = [...resources, resource];
            setResources(newResources);
            localStorage.setItem('demo_resources', JSON.stringify(newResources));
            showToast("Resource saved to bank!");
            return;
        }

        try {
            const { id, ...data } = resource;
            await addDoc(collection(db, 'resources'), {
                ...data,
                userId: user.id
            });
            showToast("Resource saved to bank!");
        } catch (e) {
            logger.error("Resource Save Failure", e);
            showToast("Error saving resource.", "error");
        }
    };

    const removeResource = async (id: string) => {
        if (!user) return;

        if (user.isDemo) {
            const newResources = resources.filter(r => r.id !== id);
            setResources(newResources);
            localStorage.setItem('demo_resources', JSON.stringify(newResources));
            showToast("Resource removed.", "info");
            return;
        }

        try {
            await deleteDoc(doc(db, 'resources', id));
            showToast("Resource removed.", "info");
        } catch (e) {
            logger.error("Resource Deletion Failure", e);
        }
    };

    const isResourceSaved = (title: string) => { 
        return resources.some(r => r.title === title || r.id === title);
    };

    return (
        <ResourceContext.Provider value={{ resources, addResource, removeResource, isResourceSaved }}>
            {children}
        </ResourceContext.Provider>
    );
};

export const useResources = () => {
    const context = useContext(ResourceContext);
    if (context === undefined) {
        throw new Error('useResources must be used within a ResourceProvider');
    }
    return context;
};
