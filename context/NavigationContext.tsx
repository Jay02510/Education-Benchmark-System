
import React, { createContext, useContext, useState } from 'react';
import { TABS } from '../constants';

type TabName = typeof TABS[keyof typeof TABS];

interface NavigationContextType {
    activeTab: TabName;
    selectedStudentId: string | null;
    isBulkEntryOpen: boolean;
    setActiveTab: (tab: TabName) => void;
    setSelectedStudentId: (id: string | null) => void;
    setBulkEntryOpen: (open: boolean) => void;
    navigateToStudent: (id: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeTab, setActiveTab] = useState<TabName>(TABS.STUDENTS);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [isBulkEntryOpen, setIsBulkEntryOpen] = useState(false);

    const navigateToStudent = (id: string) => {
        setSelectedStudentId(id);
        setActiveTab(TABS.STUDENTS);
    };

    return (
        <NavigationContext.Provider value={{ 
            activeTab, 
            selectedStudentId, 
            isBulkEntryOpen,
            setActiveTab, 
            setSelectedStudentId,
            setBulkEntryOpen: setIsBulkEntryOpen,
            navigateToStudent 
        }}>
            {children}
        </NavigationContext.Provider>
    );
};

export const useNavigation = () => {
    const context = useContext(NavigationContext);
    if (context === undefined) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
    return context;
};
