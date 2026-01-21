import React, { useState } from 'react';
import { StudentsTab } from './tabs/StudentsTab.tsx';
import { BenchmarkFrameworkTab } from './tabs/BenchmarkFrameworkTab.tsx';
import { AnalyticsTab } from './tabs/AnalyticsTab.tsx';
import { ResourceBankTab } from './tabs/ResourceBankTab.tsx';
import { SettingsTab } from './tabs/SettingsTab.tsx';
import { AdminPanel } from './tabs/AdminPanel.tsx';
import { TABS } from './constants.ts';
import { Icon } from './components/common/Icon.tsx';
import { StudentProvider, useStudents } from './context/StudentContext.tsx';
import { ResourceProvider } from './context/ResourceContext.tsx';
import { BenchmarkProvider } from './context/BenchmarkContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { NavigationProvider, useNavigation } from './context/NavigationContext.tsx';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard.tsx';
import { LoginScreen } from './components/auth/LoginScreen.tsx';
import { PlatformGuideModal } from './components/common/PlatformGuideModal.tsx';
import { BulkAssessmentModal } from './components/students/BulkAssessmentModal.tsx';
import { CommandCenter } from './components/common/CommandCenter.tsx';

type TabName = typeof TABS[keyof typeof TABS];

const NavItem: React.FC<{
    label: TabName;
    iconName: string;
    isActive: boolean;
    isCollapsed: boolean;
    isDisabled?: boolean;
    onClick: () => void;
}> = ({ label, iconName, isActive, isCollapsed, isDisabled, onClick }) => (
    <li>
        <button
            onClick={isDisabled ? undefined : onClick}
            title={isCollapsed ? label : ''}
            className={`group flex items-center w-full py-3 px-3 mx-auto rounded-xl transition-all duration-200 ease-out ${
                isDisabled ? 'opacity-40 cursor-not-allowed filter grayscale' :
                isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 font-bold'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-indigo-600 font-medium'
            } ${isCollapsed ? 'justify-center w-10 h-10 px-0' : ''}`}
        >
            <div className={`flex items-center justify-center shrink-0 w-8 h-8`}>
                <Icon name={iconName} className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`} strokeWidth={2} />
            </div>
            <span className={`text-sm tracking-wide whitespace-nowrap ml-2 transition-all duration-300 origin-left ${isCollapsed ? 'w-0 opacity-0 scale-x-0 hidden' : 'w-auto opacity-100 scale-x-100'}`}>
                {label} {isDisabled && <span className="text-[9px] font-black ml-1 bg-slate-200 text-slate-500 px-1 rounded">PRO</span>}
            </span>
        </button>
    </li>
);

const MainAppLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const { activeTab, setActiveTab, isBulkEntryOpen, setBulkEntryOpen } = useNavigation();
    const { classProfile } = useStudents();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isGuideOpen, setIsGuideOpen] = useState(false);

    const handleTabChange = (tab: TabName) => {
        setActiveTab(tab);
        setIsMobileMenuOpen(false); 
    };

    const renderTab = () => {
        switch (activeTab) {
            case TABS.STUDENTS: return <StudentsTab />;
            case TABS.BENCHMARK: return <BenchmarkFrameworkTab />;
            case TABS.ANALYTICS: return <AnalyticsTab />;
            case TABS.RESOURCE_BANK: return <ResourceBankTab />;
            case TABS.SETTINGS: return <SettingsTab />;
            case TABS.ADMIN: return <AdminPanel />;
            default: return <StudentsTab />;
        }
    };
    
    if (!user) {
        return <LoginScreen />;
    }

    return (
        <div className="flex flex-col h-screen bg-[#F8FAFC] font-sans overflow-hidden text-slate-800 print:h-auto print:overflow-visible">
            <div className="flex flex-1 overflow-hidden relative">
                {(!classProfile && !user?.isDemo) && <OnboardingWizard />}
                <CommandCenter />

                {isMobileMenuOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 z-[100] lg:hidden backdrop-blur-sm transition-opacity print:hidden" onClick={() => setIsMobileMenuOpen(false)} />
                )}

                <aside className={`
                    fixed inset-y-0 left-0 z-40 bg-white flex flex-col shadow-[1px_0_20px_rgba(0,0,0,0.03)] border-r border-slate-100 transition-all duration-300 ease-out
                    ${isSidebarCollapsed ? 'w-20 px-3' : 'w-72 p-4'}
                    lg:static print:hidden
                    ${isMobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
                `}>
                    <div className={`flex items-center gap-3 mb-10 mt-4 transition-all duration-300 ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3'}`}>
                        <div className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                            <Icon name="benchmark" className="w-5 h-5 text-white" strokeWidth={2.5} />
                        </div>
                        <div className={`transition-all duration-300 overflow-hidden ${isSidebarCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
                            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight leading-none">Benchmark</h1>
                        </div>
                    </div>
                    
                    <nav className="flex-1 overflow-y-auto scrollbar-none space-y-8">
                        <div>
                            {!isSidebarCollapsed && <p className="px-3 ml-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Workspace</p>}
                            <ul className="space-y-1">
                                <NavItem label={TABS.STUDENTS} iconName="students" isActive={activeTab === TABS.STUDENTS} isCollapsed={isSidebarCollapsed} onClick={() => handleTabChange(TABS.STUDENTS)} />
                                <NavItem label={TABS.BENCHMARK} iconName="benchmark" isActive={activeTab === TABS.BENCHMARK} isCollapsed={isSidebarCollapsed} onClick={() => handleTabChange(TABS.BENCHMARK)} />
                                <NavItem label={TABS.ANALYTICS} iconName="analytics" isActive={activeTab === TABS.ANALYTICS} isCollapsed={isSidebarCollapsed} onClick={() => handleTabChange(TABS.ANALYTICS)} />
                                <NavItem label={TABS.RESOURCE_BANK} iconName="library" isActive={activeTab === TABS.RESOURCE_BANK} isCollapsed={isSidebarCollapsed} onClick={() => handleTabChange(TABS.RESOURCE_BANK)} />
                            </ul>
                        </div>
                        
                        <div>
                            {!isSidebarCollapsed && <p className="px-3 ml-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Help Center</p>}
                            <ul className="space-y-1">
                                <li>
                                    <button
                                        onClick={() => setIsGuideOpen(true)}
                                        className={`group flex items-center w-full py-3 px-3 mx-auto rounded-xl transition-all duration-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 font-medium ${isSidebarCollapsed ? 'justify-center w-10 h-10 px-0' : ''}`}
                                    >
                                        <div className="flex items-center justify-center shrink-0 w-8 h-8">
                                            <Icon name="book" className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                                        </div>
                                        <span className={`text-sm ml-2 transition-all duration-300 ${isSidebarCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
                                            Platform Guide
                                        </span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </nav>

                    <div className={`pt-4 border-t border-slate-100 ${isSidebarCollapsed ? 'flex flex-col items-center gap-4' : 'px-2'}`}>
                        <button 
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className={`hidden lg:flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors mb-4 ${isSidebarCollapsed ? 'w-10 h-10' : 'w-full py-2 gap-2'}`}
                        >
                            <Icon name={isSidebarCollapsed ? "arrowRight" : "chevronLeft"} className="w-5 h-5" />
                        </button>

                        <div className={`flex items-center gap-3 p-2 rounded-xl transition-colors cursor-pointer group ${isSidebarCollapsed ? 'justify-center p-0' : 'hover:bg-slate-50'}`}>
                            <div className="w-9 h-9 shrink-0 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                                {user?.name.charAt(0)}
                            </div>
                            <div className={`flex-1 overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
                                <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                            </div>
                             {!isSidebarCollapsed && (
                                 <button onClick={logout} className="text-slate-400 hover:text-rose-500 transition p-1">
                                     <Icon name="logout" className="w-4 h-4" />
                                 </button>
                             )}
                        </div>
                    </div>
                </aside>

                <main className="flex-1 relative flex flex-col w-full overflow-hidden print:overflow-visible print:h-auto print:w-full bg-[#F8FAFC]">
                     <div className="lg:hidden bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 flex items-center justify-between shadow-sm z-20 relative print:hidden">
                         <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-700 hover:text-indigo-600 p-2 -ml-2 rounded-lg hover:bg-slate-100 transition flex items-center gap-2">
                             <Icon name="menu" className="w-6 h-6" /> 
                             <span className="font-bold text-sm">Menu</span>
                         </button>
                         <span className="font-bold text-slate-800 text-sm">{activeTab}</span>
                     </div>

                     <div className="flex-1 overflow-y-auto relative z-10 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent print:overflow-visible print:h-auto">
                        {renderTab()}
                     </div>
                     <BulkAssessmentModal isOpen={isBulkEntryOpen} onClose={() => setBulkEntryOpen(false)} />
                     <PlatformGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
                </main>
            </div>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <ToastProvider>
            <AuthProvider>
                <BenchmarkProvider>
                    <StudentProvider>
                        <ResourceProvider>
                            <NavigationProvider>
                                <MainAppLayout />
                            </NavigationProvider>
                        </ResourceProvider>
                    </StudentProvider>
                </BenchmarkProvider>
            </AuthProvider>
        </ToastProvider>
    );
};

export default App;